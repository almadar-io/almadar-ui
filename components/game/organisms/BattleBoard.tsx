 
'use client';
/**
 * BattleBoard
 *
 * Core rendering organism for turn-based battles.
 *
 * This is a **controlled-only** component: all game state (units, phase,
 * turn, gameResult, selectedUnitId) must be provided via the `entity` prop.
 * User interactions are communicated via event bus emissions so the parent
 * (typically an Orbital trait or the `useBattleState` hook) can manage
 * state transitions.
 *
 * For a self-managing version, use `UncontrolledBattleBoard` which
 * composes this component with the `useBattleState` hook.
 *
 * Animation-only state (movement interpolation, screen shake, hover) is
 * always managed locally.
 *
 * @packageDocumentation
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Typography } from '../../core/atoms/Typography';
import { VStack, HStack } from '../../core/atoms/Stack';
import type { DisplayStateProps } from '../../core/organisms/types';
import IsometricCanvas from '../molecules/IsometricCanvas';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
import {
    boardEntity,
    str,
    num,
    rows,
    type TeamUnitTraits,
    unitPosition,
    unitTeam,
    unitHealth,
} from './boardEntity';
import { isoToScreen, TILE_WIDTH, FLOOR_HEIGHT } from './utils/isometric';

// =============================================================================
// Types
// =============================================================================

/** Battle phases an encounter walks through (UI value enum — not entity data). */
export type BattlePhase =
    | 'observation'
    | 'selection'
    | 'movement'
    | 'action'
    | 'enemy_turn'
    | 'game_over';

/** Context exposed to render-prop slots. Carries coerced entity rows + UI helpers. */
export type BattleSlotContext = {
    phase: BattlePhase;
    turn: number;
    selectedUnit: EntityRow | null;
    hoveredUnit: EntityRow | null;
    playerUnits: readonly EntityRow[];
    enemyUnits: readonly EntityRow[];
    gameResult: 'victory' | 'defeat' | null;
    onEndTurn: () => void;
    onCancel: () => void;
    onReset: () => void;
    attackTargets: Array<{ x: number; y: number }>;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => { x: number; y: number };
};

/** Asset manifest shape for BattleBoard. */
type BattleAssetManifest = {
    baseUrl?: AssetUrl;
    terrains?: Record<string, AssetUrl>;
    units?: Record<string, AssetUrl>;
    features?: Record<string, AssetUrl>;
    effects?: Record<string, AssetUrl>;
};

export interface BattleBoardProps extends DisplayStateProps {
    /** Entity (single board state) containing all board data */
    entity?: EntityRow | readonly EntityRow[];
    /** Direct tile data — takes priority over entity-derived tiles. */
    tiles?: IsometricTile[];
    /** Direct unit data — takes priority over entity-derived units. */
    units?: IsometricUnit[];
    /** Direct feature data — takes priority over entity-derived features. */
    features?: IsometricFeature[];
    /** Direct asset manifest — takes priority over entity-derived manifest. */
    assetManifest?: BattleAssetManifest;

    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Ratio of unit draw height to scaledFloorHeight. Default 1.5. */
    spriteHeightRatio?: number;
    /** Max unit draw width as a ratio of scaledTileWidth. Default 0.6. */
    spriteMaxWidthRatio?: number;

    // -- Slots --
    /** Header area -- receives battle context */
    header?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Sidebar content (combat log, unit roster, etc.) */
    sidebar?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating action buttons */
    actions?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating overlays above the canvas (damage popups, tooltips) */
    overlay?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Game-over screen overlay */
    gameOverOverlay?: (ctx: BattleSlotContext) => React.ReactNode;

    // -- Callbacks --
    /** Called when a unit attacks another */
    onAttack?: (attacker: EntityRow, target: EntityRow, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: EntityRow, to: { x: number; y: number }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: EntityRow, target: EntityRow) => number;

    // -- Canvas pass-through --
    onDrawEffects?: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
    hasActiveEffects?: boolean;
    effectSpriteUrls?: AssetUrl[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;

    // -- Declarative event props --
    /** Emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: EventEmit<{ unitId: string }>;
    /** Emits UI:{endTurnEvent} with {} on end turn */
    endTurnEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{cancelEvent} with {} on cancel */
    cancelEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{gameEndEvent} with { result: 'victory' | 'defeat' } on game end */
    gameEndEvent?: EventEmit<{ result: 'victory' | 'defeat' }>;
    /** Emits UI:{playAgainEvent} with {} on play again / reset */
    playAgainEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{attackEvent} with { attackerId, targetId, damage } on attack */
    attackEvent?: EventEmit<{ attackerId: string; targetId: string; damage: number }>;

    className?: string;
}

// =============================================================================
// Procedural tile generation
// =============================================================================

const BATTLE_CDN = 'https://almadar-kflow-assets.web.app/shared';
const BATTLE_GRID_W = 16;
const BATTLE_GRID_H = 16;

// 5 terrain sprites — varied by deterministic (x,y) hash
const BATTLE_TERRAIN_SPRITES: readonly string[] = [
    `${BATTLE_CDN}/isometric-dungeon/Isometric/dirt_E.png`,
    `${BATTLE_CDN}/isometric-dungeon/Isometric/dirtTiles_E.png`,
    `${BATTLE_CDN}/isometric-dungeon/Isometric/planks_E.png`,
    `${BATTLE_CDN}/isometric-dungeon/Isometric/stoneTile_E.png`,
    `${BATTLE_CDN}/isometric-dungeon/Isometric/stoneInset_E.png`,
];

function buildDefaultBattleTiles(): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < BATTLE_GRID_H; y++) {
        for (let x = 0; x < BATTLE_GRID_W; x++) {
            const variant = (x * 3 + y * 7 + (x ^ y)) % BATTLE_TERRAIN_SPRITES.length;
            tiles.push({
                x,
                y,
                terrain: ['grass', 'dirt', 'planks', 'stone', 'stone'][variant],
                terrainSprite: BATTLE_TERRAIN_SPRITES[variant],
                passable: true,
            });
        }
    }
    return tiles;
}

const DEFAULT_BATTLE_TILES: IsometricTile[] = buildDefaultBattleTiles();

// =============================================================================
// Component
// =============================================================================

export function BattleBoard({
    entity,
    tiles: propTiles,
    units: propUnits,
    features: propFeatures,
    assetManifest: propAssetManifest,
    scale = 0.25,
    unitScale = 1,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    header,
    sidebar,
    actions,
    overlay,
    gameOverOverlay,
    onAttack,
    onGameEnd,
    onUnitMove,
    calculateDamage,
    onDrawEffects,
    hasActiveEffects = false,
    effectSpriteUrls = [],
    resolveUnitFrame,
    tileClickEvent,
    unitClickEvent,
    endTurnEvent,
    cancelEvent,
    gameEndEvent,
    playAgainEvent,
    attackEvent,
    className,
}: BattleBoardProps): React.JSX.Element {
    // -- Unpack entity (single board-state row); direct props win --
    const board = boardEntity(entity) ?? {};
    const rawTiles = propTiles ?? (Array.isArray(board.tiles) ? board.tiles as unknown as IsometricTile[] : []);
    const tiles: IsometricTile[] = rawTiles.length === 0 ? DEFAULT_BATTLE_TILES : rawTiles;
    const features = propFeatures ?? (Array.isArray(board.features) ? board.features : []) as unknown as IsometricFeature[];
    const boardWidth = num(board.gridWidth ?? board.boardWidth, BATTLE_GRID_W);
    const boardHeight = num(board.gridHeight ?? board.boardHeight, BATTLE_GRID_H);
    const assetManifest = propAssetManifest ?? board.assetManifest as BattleAssetManifest | undefined;
    const backgroundImage = board.backgroundImage as AssetUrl | undefined;

    // ── Game state (read from entity — controlled by parent) ─────────────
    const units = rows(board.units);
    const selectedUnitId = (board.selectedUnitId as string | null | undefined) ?? null;
    const currentPhase = (str(board.phase) || 'observation') as BattlePhase;
    const currentTurn = num(board.turn, 1);
    const gameResult = (board.result as 'victory' | 'defeat' | null | undefined) ?? null;

    // -- Event bus --
    const eventBus = useEventBus();
    const { t } = useTranslate();

    // ── Rendering-only state (always local) ──────────────────────────────
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    // ── Derived state ───────────────────────────────────────────────────────
    const selectedUnit = useMemo(
        () => units.find(u => str(u.id) === selectedUnitId) ?? null,
        [units, selectedUnitId],
    );

    const hoveredUnit = useMemo(() => {
        if (!hoveredTile) return null;
        return units.find(u => {
            const p = unitPosition(u);
            return p.x === hoveredTile.x && p.y === hoveredTile.y && unitHealth(u) > 0;
        }) ?? null;
    }, [hoveredTile, units]);

    const playerUnits = useMemo(() => units.filter(u => unitTeam(u) === 'player' && unitHealth(u) > 0), [units]);
    const enemyUnits = useMemo(() => units.filter(u => unitTeam(u) === 'enemy' && unitHealth(u) > 0), [units]);

    // ── Valid moves ─────────────────────────────────────────────────────────
    const validMoves = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'movement') return [];
        const moves: Array<{ x: number; y: number }> = [];
        const range = num(board.movementRange, 2);
        const origin = unitPosition(selectedUnit);
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = origin.x + dx;
                const ny = origin.y + dy;
                const dist = Math.abs(dx) + Math.abs(dy);
                if (
                    dist > 0 &&
                    dist <= range &&
                    nx >= 0 && nx < boardWidth &&
                    ny >= 0 && ny < boardHeight &&
                    !units.some(u => {
                        const p = unitPosition(u);
                        return p.x === nx && p.y === ny && unitHealth(u) > 0;
                    })
                ) {
                    moves.push({ x: nx, y: ny });
                }
            }
        }
        return moves;
    }, [selectedUnit, currentPhase, units, boardWidth, boardHeight]);

    // ── Attack Targets ──────────────────────────────────────────────────────
    const attackTargets = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'action') return [];
        const sp = unitPosition(selectedUnit);
        const sTeam = unitTeam(selectedUnit);
        return units
            .filter(u => unitTeam(u) !== sTeam && unitHealth(u) > 0)
            .filter(u => {
                const p = unitPosition(u);
                const dx = Math.abs(p.x - sp.x);
                const dy = Math.abs(p.y - sp.y);
                return dx <= 1 && dy <= 1 && dx + dy > 0;
            })
            .map(u => unitPosition(u));
    }, [selectedUnit, currentPhase, units]);

    // ── Movement animation ──────────────────────────────────────────────────
    interface MovementAnim {
        unitId: string;
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
        unitId: string,
        from: { x: number; y: number },
        to: { x: number; y: number },
        onComplete: () => void,
    ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const duration = dist * MOVE_SPEED_MS_PER_TILE;
        movementAnimRef.current = { unitId, from, to, elapsed: 0, duration, onComplete };
    }, []);

    // ── Tick movement animation (~60fps) ────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            const anim = movementAnimRef.current;
            if (!anim) return;

            anim.elapsed += 16;
            const t = Math.min(anim.elapsed / anim.duration, 1);
            const eased = 1 - (1 - t) * (1 - t); // ease-out quadratic
            const cx = anim.from.x + (anim.to.x - anim.from.x) * eased;
            const cy = anim.from.y + (anim.to.y - anim.from.y) * eased;

            if (t >= 1) {
                movementAnimRef.current = null;
                setMovingPositions(prev => {
                    const next = new Map(prev);
                    next.delete(anim.unitId);
                    return next;
                });
                anim.onComplete();
            } else {
                setMovingPositions(prev => {
                    const next = new Map(prev);
                    next.set(anim.unitId, { x: cx, y: cy });
                    return next;
                });
            }
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // ── Visual units (with interpolated positions) ──────────────────────────
    const derivedIsoUnits: IsometricUnit[] = useMemo(() => {
        return units
            .filter(u => unitHealth(u) > 0)
            .map(unit => {
                const id = str(unit.id);
                const pos = movingPositions.get(id) ?? unitPosition(unit);
                const unitTraits = Array.isArray(unit.traits)
                    ? (unit.traits as unknown as TeamUnitTraits[])
                    : undefined;
                return {
                    id,
                    position: pos,
                    name: str(unit.name),
                    team: unitTeam(unit) as 'player' | 'enemy' | 'neutral',
                    health: unitHealth(unit),
                    maxHealth: num(unit.maxHealth),
                    unitType: unit.unitType == null ? undefined : str(unit.unitType),
                    heroId: unit.heroId == null ? undefined : str(unit.heroId),
                    sprite: unit.sprite == null ? undefined : str(unit.sprite),
                    traits: unitTraits?.map(tr => ({
                        name: tr.name,
                        currentState: tr.currentState,
                        states: tr.states,
                        cooldown: tr.cooldown ?? 0,
                    })),
                };
            });
    }, [units, movingPositions]);
    const isoUnits = propUnits ?? derivedIsoUnits;

    // ── Tile-to-screen helper ───────────────────────────────────────────────
    const maxY = Math.max(...tiles.map(t => t.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);
    const tileToScreen = useCallback(
        (tx: number, ty: number) => isoToScreen(tx, ty, scale, baseOffsetX),
        [scale, baseOffsetX],
    );

    // ── Check game end (emit only — state managed by parent) ───────────────
    const checkGameEnd = useCallback(() => {
        const pa = units.filter(u => unitTeam(u) === 'player' && unitHealth(u) > 0);
        const ea = units.filter(u => unitTeam(u) === 'enemy' && unitHealth(u) > 0);
        if (pa.length === 0) {
            onGameEnd?.('defeat');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'defeat' });
            }
        } else if (ea.length === 0) {
            onGameEnd?.('victory');
            if (gameEndEvent) {
                eventBus.emit(`UI:${gameEndEvent}`, { result: 'victory' });
            }
        }
    }, [units, onGameEnd, gameEndEvent, eventBus]);

    // ── Handle unit click (emit only — state managed by parent) ────────────
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => str(u.id) === unitId);
        if (!unit) return;

        if (unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId });
        }

        // Screen shake on attack hit (rendering-only state)
        if (currentPhase === 'action' && selectedUnit) {
            const up = unitPosition(unit);
            if (
                unitTeam(unit) === 'enemy' &&
                attackTargets.some(t => t.x === up.x && t.y === up.y)
            ) {
                const damage = calculateDamage
                    ? calculateDamage(selectedUnit, unit)
                    : Math.max(1, num(selectedUnit.attack) - num(unit.defense));

                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);

                onAttack?.(selectedUnit, unit, damage);
                if (attackEvent) {
                    eventBus.emit(`UI:${attackEvent}`, {
                        attackerId: str(selectedUnit.id),
                        targetId: str(unit.id),
                        damage,
                    });
                }

                setTimeout(checkGameEnd, 100);
            }
        }
    }, [currentPhase, selectedUnit, attackTargets, units, checkGameEnd, onAttack, calculateDamage, unitClickEvent, attackEvent, eventBus]);

    // ── Handle tile click (emit + animation — no state mutation) ───────────
    const handleTileClick = useCallback((x: number, y: number) => {
        if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x, y });
        }

        if (currentPhase === 'movement' && selectedUnit) {
            if (movementAnimRef.current) return; // block during animation
            if (validMoves.some(m => m.x === x && m.y === y)) {
                const from = { ...unitPosition(selectedUnit) };
                const to = { x, y };
                startMoveAnimation(str(selectedUnit.id), from, to, () => {
                    onUnitMove?.(selectedUnit, to);
                });
            }
        }
    }, [currentPhase, selectedUnit, validMoves, startMoveAnimation, onUnitMove, tileClickEvent, eventBus]);

    // ── Phase controls (emit only — state managed by parent) ───────────────
    const handleEndTurn = useCallback(() => {
        if (endTurnEvent) {
            eventBus.emit(`UI:${endTurnEvent}`, {});
        }
    }, [endTurnEvent, eventBus]);

    const handleCancel = useCallback(() => {
        if (cancelEvent) {
            eventBus.emit(`UI:${cancelEvent}`, {});
        }
    }, [cancelEvent, eventBus]);

    const handleReset = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    // ── Slot context ────────────────────────────────────────────────────────
    const ctx: BattleSlotContext = useMemo(
        () => ({
            phase: currentPhase,
            turn: currentTurn,
            selectedUnit,
            hoveredUnit,
            playerUnits,
            enemyUnits,
            gameResult,
            onEndTurn: handleEndTurn,
            onCancel: handleCancel,
            onReset: handleReset,
            attackTargets,
            tileToScreen,
        }),
        [
            currentPhase, currentTurn, selectedUnit, hoveredUnit,
            playerUnits, enemyUnits, gameResult,
            handleEndTurn, handleCancel, handleReset, attackTargets, tileToScreen,
        ],
    );

    // ── Shake style ─────────────────────────────────────────────────────────
    const shakeStyle: React.CSSProperties = isShaking
        ? { animation: 'battle-shake 0.3s ease-in-out' }
        : {};

    return (
        <VStack className={cn('battle-board relative min-h-[600px] bg-background', className)} gap="none">
            {/* Shake keyframes */}
            <style>{`
                @keyframes battle-shake {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-3px, -2px); }
                    20% { transform: translate(3px, 1px); }
                    30% { transform: translate(-2px, 3px); }
                    40% { transform: translate(2px, -1px); }
                    50% { transform: translate(-3px, 2px); }
                    60% { transform: translate(3px, -2px); }
                    70% { transform: translate(-1px, 3px); }
                    80% { transform: translate(2px, -3px); }
                    90% { transform: translate(-2px, 1px); }
                }
            `}</style>

            {/* Header slot */}
            {header && <Box className="p-4">{header(ctx)}</Box>}

            {/* Main area */}
            <HStack className="flex-1 gap-4 p-4 pt-0" gap="none">
                {/* Canvas column */}
                <Box className="relative flex-1" style={shakeStyle}>
                    <IsometricCanvas
                        tiles={tiles}
                        units={isoUnits}
                        features={features}
                        selectedUnitId={selectedUnitId}
                        validMoves={validMoves}
                        attackTargets={attackTargets}
                        hoveredTile={hoveredTile}
                        onTileClick={handleTileClick}
                        onUnitClick={handleUnitClick}
                        onTileHover={(x: number, y: number) => setHoveredTile({ x, y })}
                        onTileLeave={() => setHoveredTile(null)}
                        scale={scale}
                        assetBaseUrl={assetManifest?.baseUrl}
                        assetManifest={assetManifest}
                        backgroundImage={backgroundImage}
                        onDrawEffects={onDrawEffects}
                        hasActiveEffects={hasActiveEffects}
                        effectSpriteUrls={effectSpriteUrls}
                        resolveUnitFrame={resolveUnitFrame}
                        unitScale={unitScale}
                        spriteHeightRatio={spriteHeightRatio}
                        spriteMaxWidthRatio={spriteMaxWidthRatio}
                    />

                    {/* Overlay slot (damage popups, tooltips, etc.) */}
                    {overlay && overlay(ctx)}
                </Box>

                {/* Sidebar slot */}
                {sidebar && (
                    <Box className="w-80 shrink-0">
                        {sidebar(ctx)}
                    </Box>
                )}
            </HStack>

            {/* Floating actions slot */}
            {actions
                ? actions(ctx)
                : currentPhase !== 'game_over' && (
                    <HStack className="fixed bottom-6 right-6 z-50" gap="sm">
                        {(currentPhase === 'movement' || currentPhase === 'action') && (
                            <Button
                                variant="secondary"
                                className="shadow-xl"
                                onClick={handleCancel}
                            >
                                {t('battle.cancel')}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            className="shadow-xl"
                            onClick={handleEndTurn}
                        >
                            {t('battle.endTurn')}
                        </Button>
                    </HStack>
                )}

            {/* Game Over overlay */}
            {gameResult && (
                gameOverOverlay
                    ? gameOverOverlay(ctx)
                    : (
                        <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-container">
                            <VStack className="text-center p-8" gap="lg">
                                <Typography
                                    variant="h2"
                                    className={cn(
                                        'text-4xl font-black tracking-widest uppercase',
                                        gameResult === 'victory' ? 'text-warning' : 'text-error',
                                    )}
                                >
                                    {gameResult === 'victory' ? t('battle.victory') : t('battle.defeat')}
                                </Typography>
                                <Typography variant="body1" className="text-muted-foreground">
                                    {t('battle.turnsPlayed')}: {currentTurn}
                                </Typography>
                                <Button
                                    variant="primary"
                                    className="px-8 py-3 font-semibold"
                                    onClick={handleReset}
                                >
                                    {t('battle.playAgain')}
                                </Button>
                            </VStack>
                        </Box>
                    )
            )}
        </VStack>
    );
}

BattleBoard.displayName = 'BattleBoard';

export default BattleBoard;
