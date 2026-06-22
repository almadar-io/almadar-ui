'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { boardEntity, num, str, rows } from './boardEntity';

// =============================================================================
// Types
// =============================================================================

export interface TowerDefenseTile {
    x: number;
    y: number;
    terrain?: string;
    terrainSprite?: AssetUrl;
    passable?: boolean;
}

export interface TowerDefensePathPoint {
    x: number;
    y: number;
}

export interface TowerDefenseTower {
    id: string;
    x: number;
    y: number;
    range: number;
    damage: number;
    cooldown: number;
    lastFiredAt?: number;
}

export interface TowerDefenseCreep {
    id: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    pathIndex: number;
    speed: number;
}

export interface TowerDefenseBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    tiles?: TowerDefenseTile[];
    path?: TowerDefensePathPoint[];
    towers?: TowerDefenseTower[];
    creeps?: TowerDefenseCreep[];
    gold?: number;
    lives?: number;
    wave?: number;
    maxWaves?: number;
    result?: 'none' | 'won' | 'lost';
    waveActive?: boolean;
    towerCost?: number;
    scale?: number;
    unitScale?: number;
    spriteHeightRatio?: number;
    spriteMaxWidthRatio?: number;
    placeTowerEvent?: EventEmit<{ x: number; y: number }>;
    startWaveEvent?: EventEmit<{ wave: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

const CDN = 'https://almadar-kflow-assets.web.app/shared/';

const TERRAIN_SPRITES: Record<string, AssetUrl> = {
    ground: `${CDN}isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` as AssetUrl,
    path:   `${CDN}isometric-blocks/PNG/Platformer tiles/platformerTile_09.png` as AssetUrl,
    wall:   `${CDN}isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` as AssetUrl,
};

const TOWER_SPRITE: AssetUrl = `${CDN}units/guardian.png` as AssetUrl;
const CREEP_SPRITE: AssetUrl  = `${CDN}units/scrapper.png` as AssetUrl;

function tilesToIso(tiles: TowerDefenseTile[]): IsometricTile[] {
    return tiles.map(t => ({
        x: t.x,
        y: t.y,
        terrain: t.terrain,
        terrainSprite: (t.terrainSprite ?? TERRAIN_SPRITES[t.terrain ?? 'ground']) as AssetUrl,
        passable: t.passable,
    }));
}

function towersToUnits(towers: TowerDefenseTower[]): IsometricUnit[] {
    return towers.map(t => ({
        id: t.id,
        position: { x: t.x, y: t.y },
        name: 'Tower',
        team: 'player' as const,
        sprite: TOWER_SPRITE,
        unitType: 'guardian',
        health: 1,
        maxHealth: 1,
    }));
}

function creepsToUnits(creeps: TowerDefenseCreep[]): IsometricUnit[] {
    return creeps.map(c => ({
        id: c.id,
        position: { x: c.x, y: c.y },
        name: 'Creep',
        team: 'enemy' as const,
        sprite: CREEP_SPRITE,
        unitType: 'scrapper',
        health: c.hp,
        maxHealth: c.maxHp,
    }));
}

function pathToFeatures(path: TowerDefensePathPoint[]): IsometricFeature[] {
    return path.map((p, i) => ({
        id: `path-${i}`,
        x: p.x,
        y: p.y,
        type: 'path-marker',
        sprite: `${CDN}world-map/road_straight.png` as AssetUrl,
    }));
}

// =============================================================================
// Component
// =============================================================================

export function TowerDefenseBoard({
    entity,
    tiles: propTiles,
    path: propPath,
    towers: propTowers,
    creeps: propCreeps,
    gold: propGold,
    lives: propLives,
    wave: propWave,
    maxWaves: propMaxWaves,
    result: propResult,
    waveActive: propWaveActive,
    towerCost = 25,
    scale = 0.45,
    unitScale = 1,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    placeTowerEvent,
    startWaveEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: TowerDefenseBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const tiles      = propTiles    ?? (rows(board.tiles)   as unknown as TowerDefenseTile[]);
    const path       = propPath     ?? (rows(board.path)    as unknown as TowerDefensePathPoint[]);
    const towers     = propTowers   ?? (rows(board.towers)  as unknown as TowerDefenseTower[]);
    const creeps     = propCreeps   ?? (rows(board.creeps)  as unknown as TowerDefenseCreep[]);
    const gold       = propGold     ?? num(board.gold, 100);
    const lives      = propLives    ?? num(board.lives, 20);
    const wave       = propWave     ?? num(board.wave, 1);
    const maxWaves   = propMaxWaves ?? num(board.maxWaves, 5);
    const result     = (propResult ?? (str(board.result) || 'none')) as 'none' | 'won' | 'lost';
    const waveActive = propWaveActive ?? Boolean(board.waveActive);

    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Emit GAME_END once when result transitions out of 'none' so the orbital GAME_END -> gameover fires.
    const emittedGameEnd = useRef(false);
    if (result !== 'none' && !emittedGameEnd.current) {
        emittedGameEnd.current = true;
        if (gameEndEvent) {
            eventBus.emit(`UI:${gameEndEvent}`, { result });
        }
    }
    if (result === 'none') {
        emittedGameEnd.current = false;
    }

    // Highlight tiles where towers can be placed (passable and not on path/tower)
    const towerPositions = useMemo(() => new Set(towers.map(t => `${t.x},${t.y}`)), [towers]);
    const pathPositions  = useMemo(() => new Set(path.map(p => `${p.x},${p.y}`)),   [path]);

    const validMoves = useMemo(() => {
        if (result !== 'none' || gold < towerCost) return [];
        return tiles
            .filter(t =>
                t.passable !== false &&
                !towerPositions.has(`${t.x},${t.y}`) &&
                !pathPositions.has(`${t.x},${t.y}`),
            )
            .map(t => ({ x: t.x, y: t.y }));
    }, [tiles, towerPositions, pathPositions, result, gold, towerCost]);

    const isoTiles    = useMemo(() => tilesToIso(tiles), [tiles]);
    const towerUnits  = useMemo(() => towersToUnits(towers), [towers]);
    const creepUnits  = useMemo(() => creepsToUnits(creeps), [creeps]);
    const isoUnits    = useMemo(() => [...towerUnits, ...creepUnits], [towerUnits, creepUnits]);
    const pathFeatures = useMemo(() => pathToFeatures(path), [path]);

    const handleTileClick = useCallback((x: number, y: number) => {
        if (result !== 'none') return;
        if (pathPositions.has(`${x},${y}`)) return;
        if (towerPositions.has(`${x},${y}`)) return;
        if (gold < towerCost) return;
        if (placeTowerEvent) {
            eventBus.emit(`UI:${placeTowerEvent}`, { x, y });
        }
    }, [result, pathPositions, towerPositions, gold, towerCost, placeTowerEvent, eventBus]);

    const handleStartWave = useCallback(() => {
        if (startWaveEvent) {
            eventBus.emit(`UI:${startWaveEvent}`, { wave });
        }
    }, [startWaveEvent, wave, eventBus]);

    const handlePlayAgain = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    const canPlaceTower  = gold >= towerCost && result === 'none';
    const canStartWave   = !waveActive && result === 'none';

    return (
        <VStack className={cn('tower-defense-board relative min-h-[600px] bg-background', className)} gap="none">
            {/* HUD bar */}
            <HStack
                className="px-4 py-2 border-b border-border bg-surface"
                gap="lg"
                align="center"
            >
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('td.gold') ?? 'Gold'}</Typography>
                    <Typography variant="body2" weight="bold" className="text-warning">{gold}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('td.lives') ?? 'Lives'}</Typography>
                    <Typography variant="body2" weight="bold" className={lives <= 5 ? 'text-error' : 'text-success'}>{lives}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('td.wave') ?? 'Wave'}</Typography>
                    <Typography variant="body2" weight="bold">{wave} / {maxWaves}</Typography>
                </HStack>
                <Box className="ml-auto">
                    {canStartWave && (
                        <Button variant="primary" size="sm" onClick={handleStartWave}>
                            {t('td.startWave') ?? 'Start Wave'}
                        </Button>
                    )}
                    {waveActive && (
                        <Typography variant="small" className="text-warning animate-pulse">
                            {t('td.waveInProgress') ?? 'Wave in progress…'}
                        </Typography>
                    )}
                </Box>
            </HStack>

            {/* Canvas */}
            <Box className="relative flex-1">
                <IsometricCanvas
                    tiles={isoTiles}
                    units={isoUnits}
                    features={pathFeatures}
                    validMoves={validMoves}
                    hoveredTile={hoveredTile}
                    onTileClick={handleTileClick}
                    onTileHover={(x: number, y: number) => setHoveredTile({ x, y })}
                    onTileLeave={() => setHoveredTile(null)}
                    scale={scale}
                    unitScale={unitScale}
                    spriteHeightRatio={spriteHeightRatio}
                    spriteMaxWidthRatio={spriteMaxWidthRatio}
                />

                {/* Tower-cost hint */}
                {hoveredTile && canPlaceTower && validMoves.some(m => m.x === hoveredTile.x && m.y === hoveredTile.y) && (
                    <Box className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 rounded px-3 py-1 backdrop-blur-sm pointer-events-none">
                        <Typography variant="small">
                            {t('td.placeTower') ?? `Place tower (${towerCost} gold)`}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Game-over overlay */}
            {result !== 'none' && (
                <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <VStack className="text-center p-8" gap="lg">
                        <Typography
                            variant="h2"
                            className={cn(
                                'text-4xl font-black tracking-widest uppercase',
                                result === 'won' ? 'text-warning' : 'text-error',
                            )}
                        >
                            {result === 'won'
                                ? (t('td.victory') ?? 'Victory!')
                                : (t('td.defeat')  ?? 'Defeat!')}
                        </Typography>
                        <Typography variant="body1" className="text-muted-foreground">
                            {result === 'won'
                                ? (t('td.survivedAllWaves') ?? `Survived all ${maxWaves} waves!`)
                                : (t('td.livesReachedZero') ?? 'Your base was overrun.')}
                        </Typography>
                        <Button
                            variant="primary"
                            className="px-8 py-3 font-semibold"
                            onClick={handlePlayAgain}
                        >
                            {t('td.playAgain') ?? 'Play Again'}
                        </Button>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}

TowerDefenseBoard.displayName = 'TowerDefenseBoard';

export default TowerDefenseBoard;
