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
import type { EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { VStack, HStack, Stack } from '../../core/atoms/Stack';
import { LoadingState } from '../../core/molecules/LoadingState';
import IsometricCanvas from './IsometricCanvas';
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
    baseUrl?: string;
    terrains?: Record<string, string>;
    units?: Record<string, string>;
    features?: Record<string, string>;
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

function heroPosition(h: EntityRow): Vec2 { return vec2(h.position); }
function heroOwner(h: EntityRow): string { return str(h.owner); }
function heroMovement(h: EntityRow): number { return num(h.movement); }
function hexPassable(h: EntityRow): boolean { return h.passable !== false; }

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

    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
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
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
}

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
    isLoading,
    scale = 0.4,
    unitScale = 2.5,
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
    const hexes = rows(resolved?.hexes);
    const heroes = rows(resolved?.heroes);
    const features = (Array.isArray(resolved?.features) ? resolved.features : []) as unknown as IsometricFeature[];
    const selectedHeroId = (resolved?.selectedHeroId as string | null | undefined) ?? null;
    const assetManifest = resolved?.assetManifest as WorldMapAssetManifest | undefined;
    const backgroundImage = resolved?.backgroundImage as string | undefined;

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // -- Selected hero --------------------------------------------------------
    const selectedHero = useMemo(
        () => heroes.find(h => str(h.id) === selectedHeroId) ?? null,
        [heroes, selectedHeroId],
    );

    // -- Convert hexes -> IsometricTile[] -------------------------------------
    const tiles: IsometricTile[] = useMemo(
        () => hexes.map(hex => ({
            x: num(hex.x),
            y: num(hex.y),
            terrain: str(hex.terrain),
            terrainSprite: hex.terrainSprite == null ? undefined : str(hex.terrainSprite),
        })),
        [hexes],
    );

    // -- Convert heroes -> IsometricUnit[] ------------------------------------
    const baseUnits: IsometricUnit[] = useMemo(
        () => heroes.map(hero => ({
            id: str(hero.id),
            position: heroPosition(hero),
            name: str(hero.name),
            team: (heroOwner(hero) === 'enemy' ? 'enemy' : 'player') as 'player' | 'enemy',
            health: 100,
            maxHealth: 100,
            sprite: hero.sprite == null ? undefined : str(hero.sprite),
        })),
        [heroes],
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
        const sOwner = heroOwner(selectedHero);
        const range = heroMovement(selectedHero);
        const moves: Array<{ x: number; y: number }> = [];
        hexes.forEach(hex => {
            const hx = num(hex.x);
            const hy = num(hex.y);
            if (!hexPassable(hex)) return;
            if (hx === sp.x && hy === sp.y) return;
            if (!isInRange(sp, { x: hx, y: hy }, range)) return;
            // Don't overlap friendly heroes
            if (heroes.some(h => {
                const hp = heroPosition(h);
                return hp.x === hx && hp.y === hy && heroOwner(h) === sOwner;
            })) return;
            moves.push({ x: hx, y: hy });
        });
        return moves;
    }, [selectedHero, hexes, heroes, isInRange]);

    // -- Attack targets -------------------------------------------------------
    const attackTargets = useMemo(() => {
        if (!selectedHero || heroMovement(selectedHero) <= 0) return [];
        const sp = heroPosition(selectedHero);
        const sOwner = heroOwner(selectedHero);
        const range = heroMovement(selectedHero);
        return heroes
            .filter(h => heroOwner(h) !== sOwner)
            .filter(h => isInRange(sp, heroPosition(h), range))
            .map(h => heroPosition(h));
    }, [selectedHero, heroes, isInRange]);

    // -- Tile-to-screen helper ------------------------------------------------
    const maxY = Math.max(...hexes.map(h => num(h.y)), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // -- Hovered info ---------------------------------------------------------
    const hoveredHex = useMemo(
        () => hoveredTile ? hexes.find(h => num(h.x) === hoveredTile.x && num(h.y) === hoveredTile.y) ?? null : null,
        [hoveredTile, hexes],
    );
    const hoveredHero = useMemo(
        () => hoveredTile ? heroes.find(h => {
            const hp = heroPosition(h);
            return hp.x === hoveredTile.x && hp.y === hoveredTile.y;
        }) ?? null : null,
        [hoveredTile, heroes],
    );

    // -- Handle tile click ----------------------------------------------------
    const handleTileClick = useCallback((x: number, y: number) => {
        if (movementAnimRef.current) return;
        const hex = hexes.find(h => num(h.x) === x && num(h.y) === y);
        if (!hex) return;

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
                const feature = str(hex.feature);
                if (feature && feature !== 'none') {
                    onFeatureEnter?.(heroId, hex);
                    if (featureEnterEvent) {
                        eventBus.emit(`UI:${featureEnterEvent}`, { heroId, feature, hex });
                    }
                }
            });
            return;
        }

        // Check for battle encounter
        const enemy = heroes.find(h => {
            const hp = heroPosition(h);
            return hp.x === x && hp.y === y && heroOwner(h) === 'enemy';
        });
        if (selectedHero && enemy && attackTargets.some((t: { x: number; y: number }) => t.x === x && t.y === y)) {
            const attackerId = str(selectedHero.id);
            const defenderId = str(enemy.id);
            onBattleEncounter?.(attackerId, defenderId);
            if (battleEncounterEvent) {
                eventBus.emit(`UI:${battleEncounterEvent}`, { attackerId, defenderId });
            }
        }
    }, [hexes, heroes, selectedHero, validMoves, attackTargets, startMoveAnimation, onHeroMove, onFeatureEnter, onBattleEncounter, eventBus, tileClickEvent, heroMoveEvent, featureEnterEvent, battleEncounterEvent]);

    // -- Handle unit click ----------------------------------------------------
    const handleUnitClick = useCallback((unitId: string) => {
        const hero = heroes.find(h => str(h.id) === unitId);
        if (hero && (heroOwner(hero) === 'player' || allowMoveAllHeroes)) {
            onHeroSelect?.(unitId);
            if (heroSelectEvent) {
                eventBus.emit(`UI:${heroSelectEvent}`, { heroId: unitId });
            }
        }
    }, [heroes, onHeroSelect, allowMoveAllHeroes, eventBus, heroSelectEvent]);

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
