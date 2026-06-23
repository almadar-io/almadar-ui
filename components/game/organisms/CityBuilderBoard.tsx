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
import type { IsometricTile, IsometricFeature } from './types/isometric';
import { boardEntity, num, str, rows } from './boardEntity';

// =============================================================================
// Types
// =============================================================================

/** Manifest of asset base-url + per-kind sprite maps (UI value DTO). */
type CityBuilderAssetManifest = {
    baseUrl?: AssetUrl;
    terrains?: Record<string, AssetUrl>;
    units?: Record<string, AssetUrl>;
    features?: Record<string, AssetUrl>;
};

export interface CityBuilderTile {
    x: number;
    y: number;
    terrain?: string;
    terrainSprite?: AssetUrl;
    passable?: boolean;
}

export interface CityBuilderBuilding {
    id: string;
    x: number;
    y: number;
    type: string;
}

/** A placeable building type shown in the build palette (UI value DTO). */
export interface CityBuilderBuildType {
    type: string;
    label: string;
    cost: number;
}

export interface CityBuilderBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    tiles?: CityBuilderTile[];
    buildings?: CityBuilderBuilding[];
    /** Asset base-url + terrain/unit/feature sprite maps (organism owns asset choice). */
    assetManifest?: CityBuilderAssetManifest;
    buildTypes?: CityBuilderBuildType[];
    pendingBuildType?: string;
    gold?: number;
    wood?: number;
    population?: number;
    tick?: number;
    result?: 'none' | 'won' | 'lost';
    scale?: number;
    unitScale?: number;
    spriteHeightRatio?: number;
    spriteMaxWidthRatio?: number;
    selectBuildTypeEvent?: EventEmit<{ buildType: string }>;
    placeBuildingEvent?: EventEmit<{ x: number; y: number }>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

const CB_GRID_W = 12;
const CB_GRID_H = 12;

const DEFAULT_BUILD_TYPES: CityBuilderBuildType[] = [
    { type: 'house',   label: 'House',   cost: 20 },
    { type: 'farm',    label: 'Farm',    cost: 15 },
    { type: 'mine',    label: 'Mine',    cost: 25 },
    { type: 'barracks', label: 'Barracks', cost: 40 },
];

/** Resolve a manifest-relative path against the manifest baseUrl into an absolute AssetUrl. */
function resolveManifestUrl(
    manifest: CityBuilderAssetManifest | undefined,
    relative: AssetUrl | undefined,
): AssetUrl | undefined {
    if (relative == null) return undefined;
    if (/^https?:\/\//.test(relative)) return relative;
    const base = manifest?.baseUrl;
    if (base == null) return relative;
    const cleanBase = base.replace(/\/$/, '');
    const cleanRel = relative.replace(/^\//, '');
    return `${cleanBase}/${cleanRel}` as AssetUrl;
}

/** Build the default 12×12 terrain grid (alternating grass/stone/dirt variants). */
function buildDefaultCBTiles(): CityBuilderTile[] {
    const tiles: CityBuilderTile[] = [];
    for (let y = 0; y < CB_GRID_H; y++) {
        for (let x = 0; x < CB_GRID_W; x++) {
            const variant = (x * 3 + y * 5 + (x ^ y)) % 3;
            const terrainKey = ['grass', 'stone', 'dirt'][variant];
            tiles.push({ x, y, terrain: terrainKey, passable: true });
        }
    }
    return tiles;
}

const DEFAULT_CB_TILES: CityBuilderTile[] = buildDefaultCBTiles();

function tilesToIso(
    tiles: CityBuilderTile[],
    manifest: CityBuilderAssetManifest | undefined,
): IsometricTile[] {
    return tiles.map(t => {
        const key = t.terrain ?? 'grass';
        const sprite = t.terrainSprite
            ?? resolveManifestUrl(manifest, manifest?.terrains?.[key])
            ?? resolveManifestUrl(manifest, manifest?.terrains?.grass);
        return {
            x: t.x,
            y: t.y,
            terrain: t.terrain,
            terrainSprite: sprite,
            passable: t.passable,
        };
    });
}

/** Buildings render as STRUCTURES (features), not character units. */
function buildingsToFeatures(
    buildings: CityBuilderBuilding[],
    manifest: CityBuilderAssetManifest | undefined,
): IsometricFeature[] {
    return buildings.map(b => ({
        id: b.id,
        x: b.x,
        y: b.y,
        type: b.type,
        sprite: resolveManifestUrl(manifest, manifest?.features?.[b.type]),
    }));
}

// =============================================================================
// Component
// =============================================================================

export function CityBuilderBoard({
    entity,
    tiles: propTiles,
    buildings: propBuildings,
    assetManifest: propAssetManifest,
    buildTypes: propBuildTypes,
    pendingBuildType: propPendingBuildType,
    gold: propGold,
    wood: propWood,
    population: propPopulation,
    result: propResult,
    scale = 0.3,
    unitScale = 0.6,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.7,
    selectBuildTypeEvent,
    placeBuildingEvent,
    gameEndEvent,
    className,
}: CityBuilderBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const assetManifest = propAssetManifest ?? (board.assetManifest as CityBuilderAssetManifest | undefined);

    const entityTiles: CityBuilderTile[] = useMemo(
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
    const tiles: CityBuilderTile[] = rawTiles.length >= CB_GRID_W * CB_GRID_H ? rawTiles : DEFAULT_CB_TILES;

    const entityBuildings: CityBuilderBuilding[] = useMemo(
        () => rows(board.buildings).map(r => ({
            id: str(r.id),
            x: num(r.x),
            y: num(r.y),
            type: str(r.type),
        })),
        [board.buildings],
    );
    const buildings = propBuildings ?? entityBuildings;

    const buildTypes = propBuildTypes ?? DEFAULT_BUILD_TYPES;

    const gold       = propGold       ?? num(board.gold, 100);
    const wood       = propWood       ?? num(board.wood, 80);
    const population  = propPopulation ?? num(board.population, 0);
    const pendingBuildType = propPendingBuildType ?? (str(board.pendingBuildType) || buildTypes[0]?.type || '');
    const result     = (propResult ?? (str(board.result) || 'none')) as 'none' | 'won' | 'lost';

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

    const pendingCost = useMemo(
        () => buildTypes.find(b => b.type === pendingBuildType)?.cost ?? 0,
        [buildTypes, pendingBuildType],
    );

    const buildingPositions = useMemo(
        () => new Set(buildings.map(b => `${b.x},${b.y}`)),
        [buildings],
    );

    // Highlight tiles where a building can be placed (passable, empty, affordable)
    const validMoves = useMemo(() => {
        if (result !== 'none' || gold < pendingCost) return [];
        return tiles
            .filter(t =>
                t.passable !== false &&
                !buildingPositions.has(`${t.x},${t.y}`),
            )
            .map(t => ({ x: t.x, y: t.y }));
    }, [tiles, buildingPositions, result, gold, pendingCost]);

    const isoTiles         = useMemo(() => tilesToIso(tiles, assetManifest), [tiles, assetManifest]);
    const buildingFeatures = useMemo(() => buildingsToFeatures(buildings, assetManifest), [buildings, assetManifest]);

    const handleTileClick = useCallback((x: number, y: number) => {
        if (result !== 'none') return;
        if (buildingPositions.has(`${x},${y}`)) return;
        if (gold < pendingCost) return;
        if (placeBuildingEvent) {
            eventBus.emit(`UI:${placeBuildingEvent}`, { x, y });
        }
    }, [result, buildingPositions, gold, pendingCost, placeBuildingEvent, eventBus]);

    const handleSelectBuildType = useCallback((buildType: string) => {
        if (selectBuildTypeEvent) {
            eventBus.emit(`UI:${selectBuildTypeEvent}`, { buildType });
        }
    }, [selectBuildTypeEvent, eventBus]);

    const canBuild = gold >= pendingCost && result === 'none';

    return (
        <VStack className={cn('city-builder-board relative min-h-[600px] bg-background', className)} gap="none">
            {/* HUD bar */}
            <HStack
                className="px-4 py-2 border-b border-border bg-surface"
                gap="lg"
                align="center"
            >
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.gold') ?? 'Gold'}</Typography>
                    <Typography variant="body2" weight="bold" className="text-warning">{gold}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.wood') ?? 'Wood'}</Typography>
                    <Typography variant="body2" weight="bold" className="text-success">{wood}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.population') ?? 'Population'}</Typography>
                    <Typography variant="body2" weight="bold">{population}</Typography>
                </HStack>

                {/* Build palette */}
                <HStack gap="xs" align="center" className="ml-auto">
                    {buildTypes.map(b => (
                        <Button
                            key={b.type}
                            variant={b.type === pendingBuildType ? 'primary' : 'secondary'}
                            size="sm"
                            disabled={gold < b.cost || result !== 'none'}
                            onClick={() => handleSelectBuildType(b.type)}
                        >
                            {b.label} ({b.cost})
                        </Button>
                    ))}
                </HStack>
            </HStack>

            {/* Canvas */}
            <Box className="relative flex-1">
                <IsometricCanvas
                    tiles={isoTiles}
                    features={buildingFeatures}
                    assetBaseUrl={assetManifest?.baseUrl}
                    assetManifest={assetManifest}
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

                {/* Build hint */}
                {hoveredTile && canBuild && validMoves.some(m => m.x === hoveredTile.x && m.y === hoveredTile.y) && (
                    <Box className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 rounded px-3 py-1 backdrop-blur-sm pointer-events-none">
                        <Typography variant="small">
                            {t('cb.placeBuilding') ?? `Build ${pendingBuildType} (${pendingCost} gold)`}
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
                                ? (t('cb.victory') ?? 'City Thrives!')
                                : (t('cb.defeat')  ?? 'City Collapsed!')}
                        </Typography>
                        <Typography variant="body1" className="text-muted-foreground">
                            {result === 'won'
                                ? (t('cb.reachedGoal') ?? `Your city reached a population of ${population}.`)
                                : (t('cb.bankrupt') ?? 'Your city ran out of resources.')}
                        </Typography>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}

CityBuilderBoard.displayName = 'CityBuilderBoard';

export default CityBuilderBoard;
