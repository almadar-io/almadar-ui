'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect, useId } from 'react';
import type { Asset, AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { makeAsset } from '../shared/makeAsset';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Typography } from '../../core/atoms/Typography';
import { VStack, HStack } from '../../core/atoms/Stack';
import type { DisplayStateProps } from '../../core/organisms/types';
import { Canvas2D } from './Canvas2D';
import { useEventListener } from '../../../hooks/useEventBus';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../shared/isometricTypes';
import { boardEntity, num, str, rows } from '../shared/boardEntity';

// =============================================================================
// Types
// =============================================================================

/** Manifest of per-kind sprite maps (UI value DTO). */
type TowerDefenseAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
};

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

export interface TowerDefenseHero {
    id: string;
    x: number;
    y: number;
}

export interface TowerDefenseBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    tiles?: TowerDefenseTile[];
    path?: TowerDefensePathPoint[];
    towers?: TowerDefenseTower[];
    creeps?: TowerDefenseCreep[];
    /** Asset base-url + terrain/unit/feature sprite maps (organism owns asset choice). */
    assetManifest?: TowerDefenseAssetManifest;
    gold?: number;
    lives?: number;
    wave?: number;
    maxWaves?: number;
    result?: 'none' | 'won' | 'lost';
    waveActive?: boolean;
    hero?: TowerDefenseHero;
    towerCost?: number;
    scale?: number;
    unitScale?: number;
    spriteHeightRatio?: number;
    spriteMaxWidthRatio?: number;
    placeTowerEvent?: EventEmit<{ x: number; y: number }>;
    startWaveEvent?: EventEmit<{ wave: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    moveHeroEvent?: EventEmit<{ dx: number; dy: number }>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

const TD_GRID_W = 16;
const TD_GRID_H = 16;

// S-shaped creep path traversing the 16×16 grid (mirrors lolo path default)
const DEFAULT_TD_PATH: TowerDefensePathPoint[] = [
    { x: 2,  y: 0  }, { x: 2,  y: 1  }, { x: 2,  y: 2  }, { x: 2,  y: 3  },
    { x: 3,  y: 3  }, { x: 4,  y: 3  }, { x: 5,  y: 3  }, { x: 6,  y: 3  },
    { x: 7,  y: 3  }, { x: 8,  y: 3  }, { x: 9,  y: 3  }, { x: 10, y: 3  },
    { x: 11, y: 3  }, { x: 12, y: 3  }, { x: 13, y: 3  },
    { x: 13, y: 4  }, { x: 13, y: 5  }, { x: 13, y: 6  }, { x: 13, y: 7  },
    { x: 12, y: 7  }, { x: 11, y: 7  }, { x: 10, y: 7  }, { x: 9,  y: 7  },
    { x: 8,  y: 7  }, { x: 7,  y: 7  }, { x: 6,  y: 7  }, { x: 5,  y: 7  },
    { x: 4,  y: 7  }, { x: 3,  y: 7  }, { x: 2,  y: 7  },
    { x: 2,  y: 8  }, { x: 2,  y: 9  }, { x: 2,  y: 10 }, { x: 2,  y: 11 },
    { x: 3,  y: 11 }, { x: 4,  y: 11 }, { x: 5,  y: 11 }, { x: 6,  y: 11 },
    { x: 7,  y: 11 }, { x: 8,  y: 11 }, { x: 9,  y: 11 }, { x: 10, y: 11 },
    { x: 11, y: 11 }, { x: 12, y: 11 }, { x: 13, y: 11 },
    { x: 13, y: 12 }, { x: 13, y: 13 }, { x: 13, y: 14 }, { x: 13, y: 15 },
];

/** Build the default 16×16 terrain grid; path cells get the `path` terrain so they
 *  render as a path tile (no floating markers). Terrain sprites resolve from the manifest. */
function buildDefaultTDTiles(): TowerDefenseTile[] {
    const pathSet = new Set(DEFAULT_TD_PATH.map(p => `${p.x},${p.y}`));
    const tiles: TowerDefenseTile[] = [];
    for (let y = 0; y < TD_GRID_H; y++) {
        for (let x = 0; x < TD_GRID_W; x++) {
            if (pathSet.has(`${x},${y}`)) {
                tiles.push({ x, y, terrain: 'path', passable: false });
            } else {
                const variant = (x * 3 + y * 5 + (x ^ y)) % 3;
                const terrainKey = ['ground', 'grass', 'stone'][variant];
                tiles.push({ x, y, terrain: terrainKey, passable: true });
            }
        }
    }
    return tiles;
}

const DEFAULT_TD_TILES: TowerDefenseTile[] = buildDefaultTDTiles();

function tilesToIso(
    tiles: TowerDefenseTile[],
    manifest: TowerDefenseAssetManifest | undefined,
): IsometricTile[] {
    return tiles.map(t => {
        const key = t.terrain ?? 'ground';
        const terrainSprite = t.terrainSprite != null
            ? makeAsset(t.terrainSprite, 'tile')
            : manifest?.terrains?.[key] ?? manifest?.terrains?.ground;
        return {
            x: t.x,
            y: t.y,
            terrain: t.terrain,
            terrainSprite,
            passable: t.passable,
        };
    });
}

function creepsToUnits(
    creeps: TowerDefenseCreep[],
    manifest: TowerDefenseAssetManifest | undefined,
): IsometricUnit[] {
    const sprite = manifest?.units?.creep;
    return creeps.map(c => ({
        id: c.id,
        position: { x: c.x, y: c.y },
        name: 'Creep',
        team: 'enemy' as const,
        sprite,
        unitType: 'creep',
        health: c.hp,
        maxHealth: c.maxHp,
    }));
}

function heroToUnit(
    hero: TowerDefenseHero,
    manifest: TowerDefenseAssetManifest | undefined,
): IsometricUnit {
    return {
        id: hero.id,
        position: { x: hero.x, y: hero.y },
        name: 'Hero',
        team: 'player' as const,
        sprite: manifest?.units?.hero,
        unitType: 'hero',
        health: 1,
        maxHealth: 1,
    };
}

/** Towers render as STRUCTURES (features), not character units. */
function towersToFeatures(
    towers: TowerDefenseTower[],
    manifest: TowerDefenseAssetManifest | undefined,
): IsometricFeature[] {
    const sprite = manifest?.features?.tower;
    return towers.map(t => ({
        id: t.id,
        x: t.x,
        y: t.y,
        type: 'tower',
        sprite,
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
    assetManifest: propAssetManifest,
    hero: propHero,
    gold: propGold,
    lives: propLives,
    wave: propWave,
    maxWaves: propMaxWaves,
    result: propResult,
    waveActive: propWaveActive,
    towerCost = 25,
    scale = 0.25,
    unitScale = 1,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    placeTowerEvent,
    startWaveEvent,
    playAgainEvent,
    gameEndEvent,
    moveHeroEvent,
    className,
}: TowerDefenseBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();
    const { t } = useTranslate();

    // Synthetic internal event names (Canvas2D emits; board listens).
    const boardId = useId();
    const internalTileClickEvent = `td.tileClick.${boardId}`;
    const internalTileHoverEvent = `td.tileHover.${boardId}`;
    const internalTileLeaveEvent = `td.tileLeave.${boardId}`;

    const assetManifest = propAssetManifest ?? (board.assetManifest as TowerDefenseAssetManifest | undefined);

    const entityTiles: TowerDefenseTile[] = useMemo(
        () => rows(board.tiles).map(r => ({
            x: num(r.x),
            y: num(r.y),
            terrain: r.terrain == null ? undefined : str(r.terrain),
            terrainSprite: r.terrainSprite == null ? undefined : (str(r.terrainSprite) as AssetUrl),
            passable: r.passable !== false,
        })),
        [board.tiles],
    );
    const rawTiles = propTiles ?? entityTiles;
    const tiles: TowerDefenseTile[] = rawTiles.length >= TD_GRID_W * TD_GRID_H ? rawTiles : DEFAULT_TD_TILES;

    const entityPath: TowerDefensePathPoint[] = useMemo(
        () => rows(board.path).map(r => ({ x: num(r.x), y: num(r.y) })),
        [board.path],
    );
    const rawPath = propPath ?? entityPath;
    const path: TowerDefensePathPoint[] = rawPath.length > 0 ? rawPath : DEFAULT_TD_PATH;

    const entityTowers: TowerDefenseTower[] = useMemo(
        () => rows(board.towers).map(r => ({
            id: str(r.id),
            x: num(r.x),
            y: num(r.y),
            range: num(r.range),
            damage: num(r.damage),
            cooldown: num(r.cooldown),
            lastFiredAt: r.lastFiredAt == null ? undefined : num(r.lastFiredAt),
        })),
        [board.towers],
    );
    const towers = propTowers ?? entityTowers;

    const entityCreeps: TowerDefenseCreep[] = useMemo(
        () => rows(board.creeps).map(r => ({
            id: str(r.id),
            x: num(r.x),
            y: num(r.y),
            hp: num(r.hp),
            maxHp: num(r.maxHp),
            pathIndex: num(r.pathIndex),
            speed: num(r.speed),
        })),
        [board.creeps],
    );
    const creeps = propCreeps ?? entityCreeps;

    const hero: TowerDefenseHero   = propHero ?? { id: 'hero', x: 8, y: 8 };
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

    // Arrow-key hero movement: emit MOVE_HERO with {dx, dy} deltas.
    const moveHeroEventRef = useRef(moveHeroEvent);
    moveHeroEventRef.current = moveHeroEvent;
    const resultRef = useRef(result);
    resultRef.current = result;
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent): void {
            const evt = moveHeroEventRef.current;
            if (!evt || resultRef.current !== 'none') return;
            let dx = 0;
            let dy = 0;
            if (e.key === 'ArrowUp')    { dy = -1; }
            else if (e.key === 'ArrowDown')  { dy = 1; }
            else if (e.key === 'ArrowLeft')  { dx = -1; }
            else if (e.key === 'ArrowRight') { dx = 1; }
            else return;
            e.preventDefault();
            eventBus.emit(`UI:${evt}`, { dx, dy });
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [eventBus]);

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

    const isoTiles      = useMemo(() => tilesToIso(tiles, assetManifest), [tiles, assetManifest]);
    const creepUnits    = useMemo(() => creepsToUnits(creeps, assetManifest), [creeps, assetManifest]);
    const heroUnit      = useMemo(() => heroToUnit(hero, assetManifest), [hero, assetManifest]);
    const isoUnits      = useMemo(() => [...creepUnits, heroUnit], [creepUnits, heroUnit]);
    const towerFeatures = useMemo(() => towersToFeatures(towers, assetManifest), [towers, assetManifest]);

    // Live refs for stale-closure safety in listeners.
    const pathPositionsRef = useRef(pathPositions);
    pathPositionsRef.current = pathPositions;
    const towerPositionsRef = useRef(towerPositions);
    towerPositionsRef.current = towerPositions;
    const goldRef = useRef(gold);
    goldRef.current = gold;
    const towerCostRef = useRef(towerCost);
    towerCostRef.current = towerCost;

    // Tile-click: Canvas2D emits internalTileClickEvent; board listens for tower placement.
    useEventListener(`UI:${internalTileClickEvent}`, useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x == null || y == null) return;
        if (resultRef.current !== 'none') return;
        if (pathPositionsRef.current.has(`${x},${y}`)) return;
        if (towerPositionsRef.current.has(`${x},${y}`)) return;
        if (goldRef.current < towerCostRef.current) return;
        if (placeTowerEvent) {
            eventBus.emit(`UI:${placeTowerEvent}`, { x, y });
        }
    }, [placeTowerEvent, eventBus]));

    // Hover/leave listeners for local hover state.
    useEventListener(`UI:${internalTileHoverEvent}`, useCallback((evt) => {
        const x = (evt.payload as { x?: number; y?: number })?.x;
        const y = (evt.payload as { x?: number; y?: number })?.y;
        if (x != null && y != null) setHoveredTile({ x, y });
    }, []));

    useEventListener(`UI:${internalTileLeaveEvent}`, useCallback(() => {
        setHoveredTile(null);
    }, []));

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
                <Canvas2D
                    projection="isometric"
                    tiles={isoTiles}
                    units={isoUnits}
                    features={towerFeatures}
                    assetManifest={assetManifest}
                    validMoves={validMoves}
                    hoveredTile={hoveredTile}
                    tileClickEvent={internalTileClickEvent}
                    tileHoverEvent={internalTileHoverEvent}
                    tileLeaveEvent={internalTileLeaveEvent}
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
