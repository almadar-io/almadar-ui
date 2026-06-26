'use client';
/**
 * WorldMapBoard
 *
 * Organism for the strategic world-map view.  Renders an isometric hex/iso
 * map with hero selection, movement animation, and encounter callbacks.
 * Game-specific panels (hero detail, hero lists, resource bars) are injected
 * via render-prop slots.
 *
 * **State categories (closed-circuit compliant):**
 * - Game data (hexes, heroes, selectedHeroId, features) → received via
 *   `entity` prop; the Orbital trait owns this state.
 * - Rendering state (hoveredTile, movingPositions animation) → local only.
 * - Events → emitted via `useEventBus()` for trait integration.
 *
 * This component is mostly prop-driven.  The only internal state is hover
 * tracking and movement animation interpolation, both of which are
 * rendering-only concerns that cannot (and should not) be externalised.
 *
 * @packageDocumentation
 */

 
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { VStack, HStack, Stack } from '../../core/atoms/Stack';
import { LoadingState } from '../../core/molecules/LoadingState';
import IsometricCanvas from '../molecules/IsometricCanvas';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
import { boardEntity, str, num, rows, vec2, type Vec2 } from './boardEntity';
import { isoToScreen, TILE_WIDTH } from './utils/isometric';
import type { UiError } from '../../core/atoms/types';

// =============================================================================
// Types
// =============================================================================

/** Manifest of asset base-url + per-kind sprite maps (UI value DTO). */
type WorldMapAssetManifest = {
    baseUrl?: AssetUrl;
    terrains?: Record<string, AssetUrl>;
    units?: Record<string, AssetUrl>;
    features?: Record<string, AssetUrl>;
};

/** Context exposed to render-prop slots. Hex / hero rows are `EntityRow`. */
export type WorldMapSlotContext = {
    /** Currently hovered tile */
    hoveredTile: { x: number; y: number } | null;
    /** Hex row at the hovered tile */
    hoveredHex: EntityRow | null;
    /** Hero row at the hovered tile */
    hoveredHero: EntityRow | null;
    /** Currently selected hero row */
    selectedHero: EntityRow | null;
    /** Valid move tiles for selected hero */
    validMoves: Array<{ x: number; y: number }>;
    /** Selects a hero */
    selectHero: (id: string) => void;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => { x: number; y: number };
    /** Canvas scale */
    scale: number;
};

// ── Hex / hero field accessors (read off `EntityRow`) ─────────────────────────

function heroPosition(h: EntityRow | IsometricUnit): Vec2 {
    if ('position' in h && h.position != null) return h.position as Vec2;
    return vec2((h as EntityRow).position);
}
function heroMovement(h: EntityRow | IsometricUnit): number { return num((h as EntityRow).movement); }

/** Event Contract:
 *  Emits: UI:HERO_SELECT
 *  Emits: UI:HERO_MOVE
 *  Emits: UI:BATTLE_ENCOUNTER
 *  Emits: UI:FEATURE_ENTER
 *  Emits: UI:TILE_CLICK
 */
export interface WorldMapBoardProps {
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: UiError | null;
    /** World-map board-state entity (single row or array). The board reads
     *  `hexes` / `heroes` / `features` arrays + `selectedHeroId` off it. */
    entity?: EntityRow | readonly EntityRow[];
    /** Direct tile data — takes priority over entity-derived tiles. */
    tiles?: IsometricTile[];
    /** Direct unit data — takes priority over entity-derived units. */
    units?: IsometricUnit[];
    /** Direct feature data — takes priority over entity-derived features. */
    features?: IsometricFeature[];
    /** Direct asset manifest — takes priority over entity-derived manifest. */
    assetManifest?: WorldMapAssetManifest;

    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Ratio of unit draw height to scaledFloorHeight. Default 1.5. */
    spriteHeightRatio?: number;
    /** Max unit draw width as a ratio of scaledTileWidth. Default 0.6. */
    spriteMaxWidthRatio?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
    /** Custom movement range validator */
    isInRange?: (from: { x: number; y: number }, to: { x: number; y: number }, range: number) => boolean;

    // -- Declarative event props --
    /** Emits UI:{heroSelectEvent} with { heroId } */
    heroSelectEvent?: EventEmit<{ heroId: string }>;
    /** Emits UI:{heroMoveEvent} with { heroId, toX, toY } */
    heroMoveEvent?: EventEmit<{ heroId: string; toX: number; toY: number }>;
    /** Emits UI:{battleEncounterEvent} with { attackerId, defenderId } */
    battleEncounterEvent?: EventEmit<{ attackerId: string; defenderId: string }>;
    /** Emits UI:{featureEnterEvent} with { heroId, feature, hex } */
    featureEnterEvent?: EventEmit<{ heroId: string; feature: string; hex: EntityRow }>;
    /** Emits UI:{tileClickEvent} with { x, y } */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;

    // -- Slots --
    /** Header / top bar */
    header?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Side panel (hero detail, hero lists, etc.) */
    sidePanel?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Canvas overlay (tooltips, popups) */
    overlay?: (ctx: WorldMapSlotContext) => React.ReactNode;
    /** Footer */
    footer?: (ctx: WorldMapSlotContext) => React.ReactNode;

    // -- Callbacks --
    onHeroSelect?: (heroId: string) => void;
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Called when hero clicks an enemy hero tile */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Called when hero enters a feature hex (castle, resource, etc.) */
    onFeatureEnter?: (heroId: string, hex: EntityRow) => void;

    // -- Canvas pass-through --
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Disable pan/zoom camera (default: true). Set false for fixed maps where overlay labels need stable positions. */
    enableCamera?: boolean;
    effectSpriteUrls?: AssetUrl[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
}

// =============================================================================
// Procedural tile generation
// =============================================================================

const WORLD_CDN = 'https://almadar-kflow-assets.web.app/shared';
const WORLD_GRID_W = 16;
const WORLD_GRID_H = 16;

// 5 terrain varieties for the world map
const WORLD_TERRAIN_DEFS: readonly { terrain: string; sprite: string; passable: boolean }[] = [
    { terrain: 'grass',  sprite: `${WORLD_CDN}/isometric-dungeon/Isometric/dirt_E.png`,      passable: true  },
    { terrain: 'dirt',   sprite: `${WORLD_CDN}/isometric-dungeon/Isometric/dirtTiles_E.png`, passable: true  },
    { terrain: 'forest', sprite: `${WORLD_CDN}/isometric-dungeon/Isometric/planks_E.png`,    passable: true  },
    { terrain: 'stone',  sprite: `${WORLD_CDN}/isometric-dungeon/Isometric/stoneInset_E.png`, passable: false },
    { terrain: 'castle', sprite: `${WORLD_CDN}/isometric-dungeon/Isometric/stoneTile_E.png`, passable: true  },
];

function buildDefaultWorldTiles(): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < WORLD_GRID_H; y++) {
        for (let x = 0; x < WORLD_GRID_W; x++) {
            // border = stone (impassable), interior = varied
            const isBorder = x === 0 || y === 0 || x === WORLD_GRID_W - 1 || y === WORLD_GRID_H - 1;
            const def = isBorder
                ? WORLD_TERRAIN_DEFS[3]
                : WORLD_TERRAIN_DEFS[(x * 5 + y * 3 + (x ^ y)) % (WORLD_TERRAIN_DEFS.length - 1)];
            tiles.push({ x, y, terrain: def.terrain, terrainSprite: def.sprite, passable: def.passable });
        }
    }
    return tiles;
}

const DEFAULT_WORLD_TILES: IsometricTile[] = buildDefaultWorldTiles();

// =============================================================================
// Helpers
// =============================================================================

/** Default Manhattan-distance range check */
function defaultIsInRange(
    from: { x: number; y: number },
    to: { x: number; y: number },
    range: number,
): boolean {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) <= range;
}

// =============================================================================
// Component
// =============================================================================

 
export function WorldMapBoard({
    entity,
    tiles: propTiles,
    units: propUnits,
    features: propFeatures,
    assetManifest: propAssetManifest,
    isLoading,
    scale = 0.25,
    unitScale = 2.5,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    allowMoveAllHeroes = false,
    isInRange = defaultIsInRange,
    heroSelectEvent,
    heroMoveEvent,
    battleEncounterEvent,
    featureEnterEvent,
    tileClickEvent,
    header,
    sidePanel,
    overlay,
    footer,
    onHeroSelect,
    onHeroMove,
    onBattleEncounter,
    onFeatureEnter,
    diamondTopY,
    enableCamera,
    effectSpriteUrls = [],
    resolveUnitFrame,
    className,
}: WorldMapBoardProps): React.JSX.Element {
    const eventBus = useEventBus();

    // Resolve the single board-state row (handles undefined, array, or row)
    const resolved = boardEntity(entity);
    // lolo sets @entity.units and @entity.tiles (not hexes/heroes)
    const entityUnits = rows(resolved?.units);
    const entityTiles = rows(resolved?.tiles);
    const features = propFeatures ?? (rows(resolved?.features) as IsometricFeature[]);
    const selectedHeroId = (resolved?.selectedHeroId as string | null | undefined) ?? null;
    const assetManifest = propAssetManifest ?? resolved?.assetManifest as WorldMapAssetManifest | undefined;
    const backgroundImage = resolved?.backgroundImage as AssetUrl | undefined;

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // -- Convert entity tiles -> IsometricTile[] (direct prop wins) -----------
    const derivedTiles: IsometricTile[] = useMemo(
        () => entityTiles.map(t => ({
            x: num(t.x),
            y: num(t.y),
            terrain: str(t.terrain),
            terrainSprite: t.terrainSprite == null ? undefined : str(t.terrainSprite),
            passable: t.passable !== false,
        })),
        [entityTiles],
    );
    const rawTiles = propTiles ?? (derivedTiles.length > 0 ? derivedTiles : null);
    const tiles: IsometricTile[] = rawTiles != null && rawTiles.length >= WORLD_GRID_W * WORLD_GRID_H
        ? rawTiles
        : DEFAULT_WORLD_TILES;

    // -- Convert entity units -> IsometricUnit[] (direct prop wins) -----------
    const baseUnits: IsometricUnit[] = useMemo(
        () => propUnits ?? entityUnits.map(u => ({
            id: str(u.id),
            position: heroPosition(u),
            name: str(u.name),
            // lolo uses `team` field (not `owner`)
            team: (str(u.team) === 'enemy' ? 'enemy' : 'player') as 'player' | 'enemy',
            health: num(u.health) || 100,
            maxHealth: num(u.maxHealth) || 100,
            sprite: u.sprite == null ? undefined : str(u.sprite),
        })),
        [entityUnits, propUnits],
    );

    // -- Active unit list (for game-logic: selection, movement, battle) -------
    // Use propUnits when provided (render-ui passes units: @entity.units as prop);
    // otherwise fall back to entity-derived. Both represent the same data.
    const gameUnits: IsometricUnit[] = baseUnits;

    // -- Selected hero --------------------------------------------------------
    const selectedHero = useMemo(
        () => gameUnits.find(u => u.id === selectedHeroId) ?? null,
        [gameUnits, selectedHeroId],
    );

    // -- Movement animation ---------------------------------------------------
    interface MovementAnim {
        heroId: string;
        from: { x: number; y: number };
        to: { x: number; y: number };
        elapsed: number;
        duration: number;
        onComplete: () => void;
    }
    const MOVE_SPEED_MS_PER_TILE = 300;
    const movementAnimRef = useRef<MovementAnim | null>(null);
    const [movingPositions, setMovingPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

    const startMoveAnimation = useCallback((
        heroId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dist = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
        movementAnimRef.current = { heroId, from, to, elapsed: 0, duration: dist * MOVE_SPEED_MS_PER_TILE, onComplete };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (!anim) return;
            anim.elapsed += 16;
            const t = Math.min(anim.elapsed / anim.duration, 1);
            const eased = 1 - (1 - t) * (1 - t);
            const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
            const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;
            if (t >= 1) {
                movementAnimRef.current = null;
                setMovingPositions(prev => { const n = new Map(prev); n.delete(anim.heroId); return n; });
                anim.onComplete();
            } else {
                setMovingPositions(prev => { const n = new Map(prev); n.set(anim.heroId, { x: cx, y: cy }); return n; });
            }
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // -- Visual units with interpolated positions -----------------------------
    const isoUnits: IsometricUnit[] = useMemo(() => {
        if (movingPositions.size === 0) return baseUnits;
        return baseUnits.map(u => {
            const pos = u.id == null ? undefined : movingPositions.get(u.id);
            return pos ? { ...u, position: pos } : u;
        });
    }, [baseUnits, movingPositions]);

    // -- Valid moves ----------------------------------------------------------
    const validMoves = useMemo(() => {
        if (!selectedHero || heroMovement(selectedHero) <= 0) return [];
        const sp = heroPosition(selectedHero);
        const sTeam = str(selectedHero.team);
        const range = heroMovement(selectedHero);
        const moves: Array<{ x: number; y: number }> = [];
        // Use the resolved `tiles` array (propTiles wins; entity tiles as fallback)
        tiles.forEach(t => {
            const tx = t.x;
            const ty = t.y;
            if (t.passable === false) return;
            if (tx === sp.x && ty === sp.y) return;
            if (!isInRange(sp, { x: tx, y: ty }, range)) return;
            // Don't overlap friendly units
            if (gameUnits.some(u => {
                const up = u.position ?? { x: u.x ?? -1, y: u.y ?? -1 };
                return up.x === tx && up.y === ty && str(u.team) === sTeam;
            })) return;
            moves.push({ x: tx, y: ty });
        });
        return moves;
    }, [selectedHero, tiles, gameUnits, isInRange]);

    // -- Attack targets -------------------------------------------------------
    const attackTargets = useMemo(() => {
        if (!selectedHero || heroMovement(selectedHero) <= 0) return [];
        const sp = heroPosition(selectedHero);
        const sTeam = str(selectedHero.team);
        const range = heroMovement(selectedHero);
        return gameUnits
            .filter(u => str(u.team) !== sTeam)
            .filter(u => isInRange(sp, u.position ?? { x: u.x ?? -1, y: u.y ?? -1 }, range))
            .map(u => u.position ?? { x: u.x ?? -1, y: u.y ?? -1 });
    }, [selectedHero, gameUnits, isInRange]);

    // -- Tile-to-screen helper ------------------------------------------------
    const maxY = Math.max(...tiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // -- Hovered info ---------------------------------------------------------
    const hoveredHex = useMemo(
        () => hoveredTile ? (tiles.find(t => t.x === hoveredTile.x && t.y === hoveredTile.y) ?? null) as EntityRow | null : null,
        [hoveredTile, tiles],
    );
    const hoveredHero = useMemo(
        () => hoveredTile ? (gameUnits.find(u => {
            const up = u.position ?? { x: u.x ?? -1, y: u.y ?? -1 };
            return up.x === hoveredTile.x && up.y === hoveredTile.y;
        }) ?? null) as EntityRow | null : null,
        [hoveredTile, gameUnits],
    );

    // -- Handle tile click ----------------------------------------------------
    const handleTileClick = useCallback((x: number, y: number) => {
        if (movementAnimRef.current) return;
        const tile = tiles.find(t => t.x === x && t.y === y);

        // Emit declarative tile click event
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }

        if (selectedHero && validMoves.some(m => m.x === x && m.y === y)) {
            const heroId = str(selectedHero.id);
            startMoveAnimation(heroId, { ...heroPosition(selectedHero) }, { x, y }, () => {
                onHeroMove?.(heroId, x, y);
                if (heroMoveEvent) {
                    eventBus.emit(`UI:${heroMoveEvent}`, { heroId, toX: x, toY: y });
                }
                // feature on a tile row (EntityRow from entity path)
                const tileWithFeature = tile as (IsometricTile & { feature?: string }) | undefined;
                const feature = tileWithFeature ? str(tileWithFeature.feature) : '';
                if (feature && feature !== 'none') {
                    const tileRow = tile as (IsometricTile & EntityRow);
                    onFeatureEnter?.(heroId, tileRow);
                    if (featureEnterEvent) {
                        eventBus.emit(`UI:${featureEnterEvent}`, { heroId, feature, hex: tileRow });
                    }
                }
            });
            return;
        }

        // Check for battle encounter
        const enemy = gameUnits.find(u => {
            const up = u.position ?? { x: u.x ?? -1, y: u.y ?? -1 };
            return up.x === x && up.y === y && str(u.team) === 'enemy';
        });
        if (selectedHero && enemy && attackTargets.some((t: { x: number; y: number }) => t.x === x && t.y === y)) {
            const attackerId = str(selectedHero.id);
            const defenderId = enemy.id;
            onBattleEncounter?.(attackerId, defenderId);
            if (battleEncounterEvent) {
                eventBus.emit(`UI:${battleEncounterEvent}`, { attackerId, defenderId });
            }
        }
    }, [tiles, gameUnits, selectedHero, validMoves, attackTargets, startMoveAnimation, onHeroMove, onFeatureEnter, onBattleEncounter, eventBus, tileClickEvent, heroMoveEvent, featureEnterEvent, battleEncounterEvent]);

    // -- Handle unit click ----------------------------------------------------
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = gameUnits.find(u => u.id === unitId);
        if (unit && (str(unit.team) === 'player' || allowMoveAllHeroes)) {
            onHeroSelect?.(unitId);
            if (heroSelectEvent) {
                eventBus.emit(`UI:${heroSelectEvent}`, { heroId: unitId });
            }
        }
    }, [gameUnits, onHeroSelect, allowMoveAllHeroes, eventBus, heroSelectEvent]);

    const selectHero = useCallback((id: string) => {
        onHeroSelect?.(id);
        if (heroSelectEvent) {
            eventBus.emit(`UI:${heroSelectEvent}`, { heroId: id });
        }
    }, [onHeroSelect, eventBus, heroSelectEvent]);

    // -- Slot context ---------------------------------------------------------
    const ctx: WorldMapSlotContext = useMemo(
        () => ({
            hoveredTile,
            hoveredHex,
            hoveredHero,
            selectedHero,
            validMoves,
            selectHero,
            tileToScreen,
            scale,
        }),
        [hoveredTile, hoveredHex, hoveredHero, selectedHero, validMoves, selectHero, tileToScreen, scale],
    );

    if (isLoading || !resolved) {
        return <LoadingState message="Loading map..." />;
    }

    return (
        <VStack className={cn('world-map-board min-h-screen bg-background', className)} gap="none">
            {/* Header slot */}
            {header && header(ctx)}

            {/* Main area */}
            <HStack className="flex-1 overflow-hidden" gap="none">
                {/* Canvas column */}
                <Stack className="flex-1 overflow-auto p-4 relative">
                    <IsometricCanvas
                        tiles={tiles}
                        units={isoUnits}
                        features={features}
                        selectedUnitId={selectedHeroId}
                        validMoves={validMoves}
                        attackTargets={attackTargets}
                        hoveredTile={hoveredTile}
                        onTileClick={handleTileClick}
                        onUnitClick={handleUnitClick}
                        onTileHover={(x, y) => setHoveredTile({ x, y })}
                        onTileLeave={() => setHoveredTile(null)}
                        scale={scale}
                        assetBaseUrl={assetManifest?.baseUrl}
                        assetManifest={assetManifest}
                        backgroundImage={backgroundImage}
                        effectSpriteUrls={effectSpriteUrls}
                        resolveUnitFrame={resolveUnitFrame}
                        unitScale={unitScale}
                        spriteHeightRatio={spriteHeightRatio}
                        spriteMaxWidthRatio={spriteMaxWidthRatio}
                        diamondTopY={diamondTopY}
                        enableCamera={enableCamera}
                    />

                    {/* Overlay slot */}
                    {overlay && overlay(ctx)}
                </Stack>

                {/* Side panel slot */}
                {sidePanel && (
                    <Stack className="w-80 shrink-0 border-l border-border bg-surface overflow-y-auto p-4">
                        {sidePanel(ctx)}
                    </Stack>
                )}
            </HStack>

            {/* Footer slot */}
            {footer && footer(ctx)}
        </VStack>
    );
}

WorldMapBoard.displayName = 'WorldMapBoard';

export default WorldMapBoard;
