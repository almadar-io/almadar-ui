'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
import { boardEntity, str, num } from './boardEntity';

// =============================================================================
// Types
// =============================================================================

type PlayerPos = { x: number; y: number };

type EnemyRow = { id: string; x: number; y: number; hp: number; attack: number };

type ItemRow = { id: string; x: number; y: number; kind: 'health_potion' | 'sword' | 'shield' };

type RoguelikeAssetManifest = {
    baseUrl?: AssetUrl;
    terrains?: Record<string, AssetUrl>;
    units?: Record<string, AssetUrl>;
    features?: Record<string, AssetUrl>;
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
    moveEvent?: EventEmit<{ dx: number; dy: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: string }>;
    className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 1, y: 0, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 2, y: 0, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 3, y: 0, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 4, y: 0, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 0, y: 1, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 1, y: 1, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirt_E.png` },
    { x: 2, y: 1, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirt_E.png` },
    { x: 3, y: 1, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirt_E.png` },
    { x: 4, y: 1, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 0, y: 2, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 1, y: 2, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirtTiles_E.png` },
    { x: 2, y: 2, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirtTiles_E.png` },
    { x: 3, y: 2, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirt_E.png` },
    { x: 4, y: 2, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 0, y: 3, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 1, y: 3, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirt_E.png` },
    { x: 2, y: 3, terrain: 'floor',  passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/dirtTiles_E.png` },
    { x: 3, y: 3, terrain: 'stairs', passable: true,  terrainSprite: `${CDN}/isometric-dungeon/Isometric/stairs_E.png` },
    { x: 4, y: 3, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 0, y: 4, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 1, y: 4, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 2, y: 4, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 3, y: 4, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
    { x: 4, y: 4, terrain: 'wall',   passable: false, terrainSprite: `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png` },
];

const DEFAULT_ENEMIES: EnemyRow[] = [
    { id: 'e1', x: 3, y: 1, hp: 5, attack: 2 },
    { id: 'e2', x: 1, y: 3, hp: 4, attack: 1 },
];

const DEFAULT_ITEMS: ItemRow[] = [
    { id: 'i1', x: 2, y: 2, kind: 'health_potion' },
];

const FEATURE_SPRITE: Record<string, string> = {
    health_potion: `${CDN}/isometric-dungeon/Isometric/chestClosed_E.png`,
    sword:         `${CDN}/isometric-dungeon/Isometric/barrel_E.png`,
    shield:        `${CDN}/isometric-dungeon/Isometric/barrel_E.png`,
};

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
    scale = 0.45,
    unitScale = 1,
    moveEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: RoguelikeBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};

    const tiles    = propTiles     ?? (Array.isArray(board.tiles)   ? (board.tiles   as unknown as IsometricTile[]) : DEFAULT_TILES);
    const enemies  = propEnemies   ?? (Array.isArray(board.enemies) ? (board.enemies as unknown as EnemyRow[])      : DEFAULT_ENEMIES);
    const items    = propItems     ?? (Array.isArray(board.items)   ? (board.items   as unknown as ItemRow[])       : DEFAULT_ITEMS);
    const player   = propPlayer    ?? (board.player   as PlayerPos | undefined)  ?? { x: 1, y: 1 };
    const playerHp = propPlayerHp  ?? num(board.playerHp,    10);
    const playerMaxHp  = propPlayerMaxHp  ?? num(board.playerMaxHp,  10);
    const playerAttack = propPlayerAttack ?? num(board.playerAttack,   3);
    const depth    = propDepth     ?? num(board.depth, 1);
    const result   = propResult    ?? (str(board.result) || 'none') as 'none' | 'won' | 'lost';
    const phase    = propPhase     ?? (str(board.phase) || 'player_turn');
    const stairsX  = propStairsX  ?? num(board.stairsX, 3);
    const stairsY  = propStairsY  ?? num(board.stairsY, 3);


    const eventBus = useEventBus();
    const { t } = useTranslate();

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

    const handleTileClick = useCallback((x: number, y: number) => {
        if (result !== 'none' || phase !== 'player_turn') return;
        const dx = x - player.x;
        const dy = y - player.y;
        if (Math.abs(dx) + Math.abs(dy) === 1) {
            emitMove(dx, dy);
        }
    }, [result, phase, player, emitMove]);

    const handleReset = useCallback(() => {
        if (!playAgainEvent) return;
        eventBus.emit(`UI:${playAgainEvent}`, {});
    }, [playAgainEvent, eventBus]);

    // Build isometric units: player + live enemies
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
                sprite: `${CDN}/isometric-dungeon/Characters/Male/Male_0_Idle0.png`,
            },
            ...liveEnemies.map(e => ({
                id: e.id,
                position: { x: e.x, y: e.y },
                name: t('roguelike.enemy') || 'Enemy',
                team: 'enemy' as const,
                health: e.hp,
                maxHealth: 6,
                unitType: 'enemy',
                sprite: `${CDN}/sprite-sheets/shadow-legion-sprite-sheet-sw.png`,
            })),
        ];
    }, [player, enemies, playerHp, playerMaxHp, t]);

    // Build isometric features: items on the floor
    const isoFeatures: IsometricFeature[] = useMemo(() =>
        items.map(it => ({
            id: it.id,
            x: it.x,
            y: it.y,
            type: it.kind,
            sprite: FEATURE_SPRITE[it.kind] ?? FEATURE_SPRITE.health_potion,
        })),
    [items]);

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
                <IsometricCanvas
                    tiles={tiles}
                    units={isoUnits}
                    features={isoFeatures}
                    selectedUnitId={null}
                    validMoves={validMoves}
                    attackTargets={[]}
                    hoveredTile={hoveredTile}
                    onTileClick={handleTileClick}
                    onUnitClick={() => undefined}
                    onTileHover={(x: number, y: number) => setHoveredTile({ x, y })}
                    onTileLeave={() => setHoveredTile(null)}
                    scale={scale}
                    assetBaseUrl={propAssetManifest?.baseUrl ?? CDN}
                    assetManifest={propAssetManifest}
                    unitScale={unitScale}
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
