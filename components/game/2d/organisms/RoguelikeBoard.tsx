'use client';

import React, { useState, useMemo, useCallback, useEffect, useId, useRef } from 'react';
import type { Asset, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { Box } from '../../../core/atoms/Box';
import { Button } from '../../../core/atoms/Button';
import { Typography } from '../../../core/atoms/Typography';
import { VStack, HStack } from '../../../core/atoms/Stack';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { Canvas2D } from '../molecules/Canvas2D';
import { useEventListener } from '../../../../hooks/useEventBus';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import { boardEntity, str, num, rows, vec2 } from '../../shared/boardEntity';
import { makeAsset } from '../../shared/makeAsset';

// =============================================================================
// Types
// =============================================================================

type PlayerPos = { x: number; y: number };

type EnemyRow = { id: string; x: number; y: number; hp: number; attack: number };

type ItemRow = { id: string; x: number; y: number; kind: 'health_potion' | 'sword' | 'shield' };

type RoguelikeAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
};

export interface RoguelikeBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    tiles?: IsometricTile[];
    enemies?: EnemyRow[];
    items?: ItemRow[];
    player?: PlayerPos;
    playerHp?: number;
    playerMaxHp?: number;
    playerAttack?: number;
    depth?: number;
    result?: 'none' | 'won' | 'lost';
    phase?: string;
    stairsX?: number;
    stairsY?: number;
    assetManifest?: RoguelikeAssetManifest;
    scale?: number;
    unitScale?: number;
    spriteHeightRatio?: number;
    spriteMaxWidthRatio?: number;
    moveEvent?: EventEmit<{ dx: number; dy: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: string }>;
    className?: string;
}

// =============================================================================
// Constants & manifest resolution
// =============================================================================

const DUNGEON_GRID_W = 16;
const DUNGEON_GRID_H = 16;

// Deterministic "room" classification: outer border = wall, inner cross-pillars = wall, else floor.
// Terrain sprites resolve from the manifest's `terrains` map; absent slots render no sprite.
function dungeonTerrain(
    x: number,
    y: number,
    stairsX: number,
    stairsY: number,
    manifest: RoguelikeAssetManifest | undefined,
): { terrain: string; passable: boolean; terrainSprite?: Asset } {
    const isBorder = x === 0 || y === 0 || x === DUNGEON_GRID_W - 1 || y === DUNGEON_GRID_H - 1;
    const isPillar = x % 4 === 0 && y % 4 === 0 && !isBorder;
    const isWall = isBorder || isPillar;
    const terrains = manifest?.terrains;
    if (x === stairsX && y === stairsY) {
        return { terrain: 'stairs', passable: true, terrainSprite: terrains?.stairs };
    }
    if (isWall) {
        return { terrain: 'wall', passable: false, terrainSprite: terrains?.wall };
    }
    return { terrain: 'floor', passable: true, terrainSprite: terrains?.floor };
}

function buildDefaultDungeonTiles(
    stairsX: number,
    stairsY: number,
    manifest: RoguelikeAssetManifest | undefined,
): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    for (let y = 0; y < DUNGEON_GRID_H; y++) {
        for (let x = 0; x < DUNGEON_GRID_W; x++) {
            tiles.push({ x, y, ...dungeonTerrain(x, y, stairsX, stairsY, manifest) });
        }
    }
    return tiles;
}

const DEFAULT_ENEMIES: EnemyRow[] = [
    { id: 'e1', x: 5,  y: 2,  hp: 5, attack: 2 },
    { id: 'e2', x: 9,  y: 6,  hp: 4, attack: 1 },
    { id: 'e3', x: 3,  y: 10, hp: 6, attack: 2 },
    { id: 'e4', x: 12, y: 8,  hp: 5, attack: 3 },
];

const DEFAULT_ITEMS: ItemRow[] = [
    { id: 'i1', x: 3,  y: 3,  kind: 'health_potion' },
    { id: 'i2', x: 7,  y: 9,  kind: 'sword' },
    { id: 'i3', x: 11, y: 5,  kind: 'shield' },
];

// =============================================================================
// Component
// =============================================================================

export function RoguelikeBoard({
    entity,
    tiles: propTiles,
    enemies: propEnemies,
    items: propItems,
    player: propPlayer,
    playerHp: propPlayerHp,
    playerMaxHp: propPlayerMaxHp,
    playerAttack: propPlayerAttack,
    depth: propDepth,
    result: propResult,
    phase: propPhase,
    stairsX: propStairsX,
    stairsY: propStairsY,
    assetManifest: propAssetManifest,
    scale = 0.25,
    unitScale = 1,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    moveEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: RoguelikeBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};

    const assetManifest = propAssetManifest ?? (board.assetManifest as RoguelikeAssetManifest | undefined);

    const stairsX  = propStairsX  ?? num(board.stairsX, 14);
    const stairsY  = propStairsY  ?? num(board.stairsY, 14);

    const entityTiles: IsometricTile[] = useMemo(
        () => rows(board.tiles).map(r => ({
            x: num(r.x),
            y: num(r.y),
            terrain: r.terrain == null ? undefined : str(r.terrain),
            terrainSprite: r.terrainSprite == null ? undefined : makeAsset(str(r.terrainSprite), 'tile'),
            passable: r.passable !== false,
        })),
        [board.tiles],
    );
    const tiles = propTiles
        ?? (entityTiles.length >= DUNGEON_GRID_W * DUNGEON_GRID_H
            ? entityTiles
            : buildDefaultDungeonTiles(stairsX, stairsY, assetManifest));

    const entityEnemies: EnemyRow[] = useMemo(
        () => rows(board.enemies).map(r => ({
            id: str(r.id),
            x: num(r.x),
            y: num(r.y),
            hp: num(r.hp),
            attack: num(r.attack),
        })),
        [board.enemies],
    );
    const enemies = propEnemies ?? (entityEnemies.length > 0 ? entityEnemies : DEFAULT_ENEMIES);

    const entityItems: ItemRow[] = useMemo(
        () => rows(board.items).map(r => ({
            id: str(r.id),
            x: num(r.x),
            y: num(r.y),
            kind: (str(r.kind) || 'health_potion') as ItemRow['kind'],
        })),
        [board.items],
    );
    const items = propItems ?? (entityItems.length > 0 ? entityItems : DEFAULT_ITEMS);

    const player   = propPlayer    ?? (board.player == null ? { x: 1, y: 1 } : vec2(board.player));
    const playerHp = propPlayerHp  ?? num(board.playerHp,    10);
    const playerMaxHp  = propPlayerMaxHp  ?? num(board.playerMaxHp,  10);
    const playerAttack = propPlayerAttack ?? num(board.playerAttack,   3);
    const depth    = propDepth     ?? num(board.depth, 1);
    const result   = propResult    ?? (str(board.result) || 'none') as 'none' | 'won' | 'lost';
    const phase    = propPhase     ?? (str(board.phase) || 'player_turn');


    const eventBus = useEventBus();
    const { t } = useTranslate();

    // Synthetic internal event names for canvas hover/leave.
    const boardId = useId();
    const internalTileHoverEvent = `roguelike.tileHover.${boardId}`;
    const internalTileLeaveEvent = `roguelike.tileLeave.${boardId}`;
    // Synthetic tile-click event name (Canvas2D emits this; board listens for move logic).
    const internalTileClickEvent = `roguelike.tileClick.${boardId}`;

    // Keyboard navigation
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    const emitMove = useCallback((dx: number, dy: number) => {
        if (!moveEvent) return;
        eventBus.emit(`UI:${moveEvent}`, { dx, dy });
    }, [moveEvent, eventBus]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (result !== 'none' || phase !== 'player_turn') return;
            if (e.key === 'ArrowUp'    || e.key === 'w') emitMove(0, -1);
            if (e.key === 'ArrowDown'  || e.key === 's') emitMove(0, 1);
            if (e.key === 'ArrowLeft'  || e.key === 'a') emitMove(-1, 0);
            if (e.key === 'ArrowRight' || e.key === 'd') emitMove(1, 0);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [result, phase, emitMove]);

    useEffect(() => {
        if ((result === 'won' || result === 'lost') && gameEndEvent) {
            eventBus.emit(`UI:${gameEndEvent}`, { result });
        }
    }, [result, gameEndEvent, eventBus]);

    // Tile-click: Canvas2D emits internalTileClickEvent; we listen for move logic.
    const resultRef = useRef(result);
    resultRef.current = result;
    const phaseRef = useRef(phase);
    phaseRef.current = phase;
    const playerRef = useRef(player);
    playerRef.current = player;

    useEventListener(`UI:${internalTileClickEvent}`, useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x == null || y == null) return;
        if (resultRef.current !== 'none' || phaseRef.current !== 'player_turn') return;
        const dx = x - playerRef.current.x;
        const dy = y - playerRef.current.y;
        if (Math.abs(dx) + Math.abs(dy) === 1) {
            emitMove(dx, dy);
        }
    }, [emitMove]));

    // Hover/leave listeners for local hover state.
    useEventListener(`UI:${internalTileHoverEvent}`, useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x != null && y != null) setHoveredTile({ x, y });
    }, []));

    useEventListener(`UI:${internalTileLeaveEvent}`, useCallback(() => {
        setHoveredTile(null);
    }, []));

    const handleReset = useCallback(() => {
        if (!playAgainEvent) return;
        eventBus.emit(`UI:${playAgainEvent}`, {});
    }, [playAgainEvent, eventBus]);

    // Build isometric units: player + live enemies (sprites resolve from the manifest)
    const isoUnits: IsometricUnit[] = useMemo(() => {
        const liveEnemies = enemies.filter(e => e.hp > 0);
        return [
            {
                id: 'player',
                position: player,
                name: t('roguelike.player') || 'Hero',
                team: 'player' as const,
                health: playerHp,
                maxHealth: playerMaxHp,
                unitType: 'player',
                sprite: assetManifest?.units?.player,
            },
            ...liveEnemies.map(e => ({
                id: e.id,
                position: { x: e.x, y: e.y },
                name: t('roguelike.enemy') || 'Enemy',
                team: 'enemy' as const,
                health: e.hp,
                maxHealth: 6,
                unitType: 'enemy',
                sprite: assetManifest?.units?.enemy,
            })),
        ];
    }, [player, enemies, playerHp, playerMaxHp, assetManifest, t]);

    // Build isometric features: items on the floor (sprites resolve from the manifest)
    const isoFeatures: IsometricFeature[] = useMemo(() =>
        items.map(it => ({
            id: it.id,
            x: it.x,
            y: it.y,
            type: it.kind,
            sprite: assetManifest?.features?.[it.kind],
        })),
    [items, assetManifest]);

    // Highlight walkable adjacent tiles as valid moves
    const validMoves = useMemo(() => {
        if (result !== 'none' || phase !== 'player_turn') return [];
        const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        return dirs
            .map(({ dx, dy }) => ({ x: player.x + dx, y: player.y + dy }))
            .filter(({ x, y }) => {
                const tile = tiles.find(t => t.x === x && t.y === y);
                return tile?.passable ?? false;
            });
    }, [result, phase, player, tiles]);

    const isGameOver = result === 'won' || result === 'lost';

    return (
        <VStack className={cn('roguelike-board relative min-h-[600px] bg-background', className)} gap="none">
            {/* HUD */}
            <HStack className="items-center justify-between px-4 py-2 border-b border-border" gap="md">
                <HStack gap="sm" className="items-center">
                    <Typography variant="body2" className="text-muted-foreground">
                        {t('roguelike.depth') || 'Depth'}
                    </Typography>
                    <Typography variant="body1" className="font-bold tabular-nums">
                        {depth}
                    </Typography>
                </HStack>
                <HStack gap="sm" className="items-center">
                    <Typography variant="body2" className="text-muted-foreground">
                        {t('roguelike.hp') || 'HP'}
                    </Typography>
                    <Typography
                        variant="body1"
                        className={cn(
                            'font-bold tabular-nums',
                            playerHp <= Math.floor(playerMaxHp * 0.25) ? 'text-error' : 'text-success',
                        )}
                    >
                        {playerHp} / {playerMaxHp}
                    </Typography>
                </HStack>
                <HStack gap="sm" className="items-center">
                    <Typography variant="body2" className="text-muted-foreground">
                        {t('roguelike.atk') || 'ATK'}
                    </Typography>
                    <Typography variant="body1" className="font-bold tabular-nums text-foreground">
                        {playerAttack}
                    </Typography>
                </HStack>
                <HStack gap="sm" className="items-center">
                    <Typography variant="body2" className="text-muted-foreground">
                        {t('roguelike.phase') || 'Phase'}
                    </Typography>
                    <Typography variant="body2" className="capitalize text-foreground">
                        {phase.replace('_', ' ')}
                    </Typography>
                </HStack>
            </HStack>

            {/* Canvas */}
            <Box className="relative flex-1">
                <Canvas2D
                    projection="isometric"
                    tiles={tiles}
                    units={isoUnits}
                    features={isoFeatures}
                    selectedUnitId={null}
                    validMoves={validMoves}
                    attackTargets={[]}
                    hoveredTile={hoveredTile}
                    tileClickEvent={internalTileClickEvent}
                    tileHoverEvent={internalTileHoverEvent}
                    tileLeaveEvent={internalTileLeaveEvent}
                    scale={scale}
                    assetManifest={assetManifest}
                    unitScale={unitScale}
                    spriteHeightRatio={spriteHeightRatio}
                    spriteMaxWidthRatio={spriteMaxWidthRatio}
                />
            </Box>

            {/* Arrow-key controls hint */}
            {!isGameOver && (
                <HStack className="justify-center gap-2 p-3" gap="none">
                    {([
                        { label: '↑', dx: 0,  dy: -1 },
                        { label: '↓', dx: 0,  dy: 1  },
                        { label: '←', dx: -1, dy: 0  },
                        { label: '→', dx: 1,  dy: 0  },
                    ] as Array<{ label: string; dx: number; dy: number }>).map(({ label, dx, dy }) => (
                        <Button
                            key={label}
                            variant="secondary"
                            className="w-9 h-9 p-0 text-base font-mono"
                            onClick={() => emitMove(dx, dy)}
                            disabled={phase !== 'player_turn'}
                        >
                            {label}
                        </Button>
                    ))}
                </HStack>
            )}

            {/* Game Over overlay */}
            {isGameOver && (
                <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm rounded-container">
                    <VStack className="text-center p-8" gap="lg">
                        <Typography
                            variant="h2"
                            className={cn(
                                'text-4xl font-black tracking-widest uppercase',
                                result === 'won' ? 'text-warning' : 'text-error',
                            )}
                        >
                            {result === 'won'
                                ? (t('roguelike.victory') || 'Victory!')
                                : (t('roguelike.defeat') || 'Defeated!')}
                        </Typography>
                        {result === 'won' && (
                            <Typography variant="body1" className="text-muted-foreground">
                                {t('roguelike.cleared') || `Dungeon cleared! Depth reached: ${depth}`}
                            </Typography>
                        )}
                        <Button
                            variant="primary"
                            className="px-8 py-3 font-semibold"
                            onClick={handleReset}
                        >
                            {t('roguelike.playAgain') || 'Play Again'}
                        </Button>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}

RoguelikeBoard.displayName = 'RoguelikeBoard';

export default RoguelikeBoard;
