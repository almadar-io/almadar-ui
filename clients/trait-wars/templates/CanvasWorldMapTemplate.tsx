/**
 * CanvasWorldMapTemplate
 *
 * Strategic world map using IsometricGameCanvas (canvas-based) with:
 * - Asset-loaded isometric terrain, hero sprites, and feature sprites
 * - Resource nodes, castles, and portals rendered on canvas
 * - Hero movement and encounters
 * - DOM overlays: ResourceBar, hero info panel, hex tooltip
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, HStack, VStack, Button, Badge, Card, cn } from '@almadar/ui';
import {
    IsometricGameCanvas,
    isoToScreen,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
} from '../organisms/IsometricGameCanvas';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/IsometricGameCanvas';
import { ResourceBar } from '../molecules/ResourceBar';
import {
    Resources,
    StrategicWorldMap,
    WorldMapHex,
    WorldMapHero,
    HexFeatureType,
    CASTLE_FACTIONS,
    isInMovementRange,
} from '../types';
import {
    useAssetsOptional,
    DEFAULT_ASSET_MANIFEST,
    getHeroPortraitUrl,
    getTerrainVariantUrl,
    getHeroSpriteUrl,
    getWorldMapFeatureUrl,
    getIsometricCastleUrl,
    getAllCharacterSheetUrls,
    type TraitWarsAssetManifest,
    type WorldMapFeatureType,
    type TerrainType,
} from '../assets';
import { useSpriteAnimations } from '../organisms/useSpriteAnimations';

// ============================================================================
// TYPES
// ============================================================================

export interface CanvasWorldMapTemplateProps {
    /** Complete world map data */
    worldMap: StrategicWorldMap;
    /** Player resources */
    resources: Resources;
    /** Current selected hero */
    selectedHeroId?: string | null;
    /** Handler when hero is selected */
    onHeroSelect?: (heroId: string) => void;
    /** Handler when hero moves */
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Handler for entering castle */
    onEnterCastle?: (castleId: string) => void;
    /** Handler for collecting resource */
    onCollectResource?: (x: number, y: number, resourceType: string, amount: number) => void;
    /** Handler for battle encounter */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Handler for end turn */
    onEndTurn?: () => void;
    /** Canvas render scale */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
}

// Feature labels for tooltip
const FEATURE_LABELS: Record<HexFeatureType, string> = {
    none: '',
    goldMine: 'Gold Mine',
    resonanceCrystal: 'Resonance Crystal',
    traitCache: 'Trait Cache',
    salvageYard: 'Salvage Yard',
    portal: 'Portal',
    treasure: 'Treasure',
    castle: 'Castle',
    battleMarker: 'Battle Site',
    hero: 'Hero',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CanvasWorldMapTemplate({
    worldMap,
    resources,
    selectedHeroId,
    onHeroSelect,
    onHeroMove,
    onEnterCastle,
    onCollectResource,
    onBattleEncounter,
    onEndTurn,
    scale = 0.4,
    className,
}: CanvasWorldMapTemplateProps): JSX.Element {
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Sprite sheet animations
    const { syncUnits: syncSpriteAnimations, resolveUnitFrame } = useSpriteAnimations(assets);
    const spriteSheetUrls = useMemo(() => getAllCharacterSheetUrls(assets), [assets]);

    // Selected hero
    const selectedHero = useMemo(() => {
        return worldMap.heroes.find((h) => h.id === selectedHeroId);
    }, [worldMap.heroes, selectedHeroId]);

    // Convert world map hexes to isometric tiles
    const tiles: IsometricTile[] = useMemo(() => {
        return worldMap.hexes.map((hex) => ({
            x: hex.x,
            y: hex.y,
            terrain: hex.terrain,
            terrainSprite: getTerrainVariantUrl(assets, hex.terrain as TerrainType, hex.x, hex.y),
        }));
    }, [worldMap.hexes, assets]);

    // Convert heroes to isometric units
    const units: IsometricUnit[] = useMemo(() => {
        return worldMap.heroes.map((hero) => ({
            id: hero.id,
            position: hero.position,
            name: hero.name,
            team: hero.owner === 'enemy' ? 'enemy' as const : 'player' as const,
            health: 100,
            maxHealth: 100,
            heroId: hero.spriteId || hero.id,
            sprite: getHeroSpriteUrl(assets, hero.spriteId || hero.id),
        }));
    }, [worldMap.heroes, assets]);

    // Tick sprite animations (~60fps)
    useEffect(() => {
        const interval = setInterval(() => {
            syncSpriteAnimations(units, 16);
        }, 16);
        return () => clearInterval(interval);
    }, [syncSpriteAnimations, units]);

    // Convert hex features to isometric features
    const features: IsometricFeature[] = useMemo(() => {
        return worldMap.hexes
            .filter((hex) => hex.feature && hex.feature !== 'none' && hex.feature !== 'hero')
            .map((hex) => {
                // Map feature type to world map feature asset type
                const featureTypeMap: Record<string, WorldMapFeatureType> = {
                    goldMine: 'goldMine',
                    resonanceCrystal: 'resonanceCrystal',
                    traitCache: 'traitCache',
                    salvageYard: 'salvageYard',
                    portal: 'portal',
                    portalClosed: 'portalClosed',
                    treasure: 'treasure',
                    treasureOpen: 'treasureOpen',
                    battleMarker: 'battleMarker',
                    fogOfWar: 'fogOfWar',
                    powerNode: 'powerNode',
                    dataVault: 'dataVault',
                };

                // Resolve sprite: castles use isometric castle assets, others use feature map
                let sprite: string | undefined;
                if (hex.feature === 'castle') {
                    const faction = hex.featureData?.owner === 'enemy' ? 'dominion' : 'resonator';
                    sprite = assets ? getIsometricCastleUrl(assets, faction as any) : undefined;
                } else {
                    const assetType = featureTypeMap[hex.feature!];
                    sprite = assetType ? getWorldMapFeatureUrl(assets, assetType) : undefined;
                }

                return {
                    x: hex.x,
                    y: hex.y,
                    type: hex.feature!,
                    sprite,
                };
            });
    }, [worldMap.hexes, assets]);

    // Valid moves for selected hero
    const validMoves = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        const moves: Array<{ x: number; y: number }> = [];
        worldMap.hexes.forEach((hex) => {
            if (!hex.passable) return;
            if (hex.x === selectedHero.position.x && hex.y === selectedHero.position.y) return;

            if (isInMovementRange(selectedHero.position, { x: hex.x, y: hex.y }, selectedHero.movement)) {
                const occupyingHero = worldMap.heroes.find(
                    (h) => h.position.x === hex.x && h.position.y === hex.y && h.owner === 'player'
                );
                if (!occupyingHero) {
                    moves.push({ x: hex.x, y: hex.y });
                }
            }
        });
        return moves;
    }, [selectedHero, worldMap.hexes, worldMap.heroes]);

    // Attack targets (enemy heroes in range)
    const attackTargets = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        return worldMap.heroes
            .filter((h) => h.owner === 'enemy')
            .filter((h) => isInMovementRange(selectedHero.position, h.position, selectedHero.movement))
            .map((h) => h.position);
    }, [selectedHero, worldMap.heroes]);

    // Handle tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        const hex = worldMap.hexes.find((h) => h.x === x && h.y === y);
        if (!hex) return;

        if (selectedHero && validMoves.some((m) => m.x === x && m.y === y)) {
            onHeroMove?.(selectedHero.id, x, y);

            if (hex.feature === 'castle' && hex.featureData?.castleId) {
                onEnterCastle?.(hex.featureData.castleId);
            } else if (hex.feature && ['goldMine', 'resonanceCrystal', 'traitCache', 'salvageYard', 'treasure'].includes(hex.feature)) {
                onCollectResource?.(x, y, hex.featureData?.resourceType || 'gold', hex.featureData?.resourceAmount || 100);
            }
        }

        // Check for enemy hero battle
        const enemyHero = worldMap.heroes.find(
            (h) => h.position.x === x && h.position.y === y && h.owner === 'enemy'
        );
        if (selectedHero && enemyHero && attackTargets.some((t) => t.x === x && t.y === y)) {
            onBattleEncounter?.(selectedHero.id, enemyHero.id);
        }
    }, [worldMap.hexes, worldMap.heroes, selectedHero, validMoves, attackTargets, onHeroMove, onEnterCastle, onCollectResource, onBattleEncounter]);

    // Handle unit click
    const handleUnitClick = useCallback((unitId: string) => {
        const hero = worldMap.heroes.find((h) => h.id === unitId);
        if (hero && hero.owner === 'player') {
            onHeroSelect?.(unitId);
        }
    }, [worldMap.heroes, onHeroSelect]);

    // Hovered hex info
    const hoveredHexInfo = useMemo(() => {
        if (!hoveredTile) return null;
        const hex = worldMap.hexes.find((h) => h.x === hoveredTile.x && h.y === hoveredTile.y);
        if (!hex) return null;
        const hero = worldMap.heroes.find((h) => h.position.x === hoveredTile.x && h.position.y === hoveredTile.y);
        const castle = hex.feature === 'castle'
            ? worldMap.castles.find((c) => c.id === hex.featureData?.castleId)
            : null;
        return { hex, hero, castle };
    }, [hoveredTile, worldMap]);

    // Calculate tooltip position from tile coordinates
    const maxY = Math.max(...worldMap.hexes.map(h => h.y), 0);
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    return (
        <Box className={cn('min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900', className)}>
            {/* Top Bar */}
            <Box className="p-4 bg-slate-900/90 border-b border-slate-700">
                <HStack justify="between" className="max-w-7xl mx-auto">
                    <HStack className="gap-4 items-center">
                        <Typography variant="h4" className="text-white">
                            {worldMap.name}
                        </Typography>
                        <Badge variant="default" className="bg-amber-500 text-black">
                            Turn {worldMap.turnNumber}
                        </Badge>
                    </HStack>
                    <HStack className="gap-4 items-center">
                        <ResourceBar resources={resources} compact />
                        <Button onClick={onEndTurn} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                            End Turn
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            {/* Main Content */}
            <HStack className="h-[calc(100vh-72px)]">
                {/* Map Area */}
                <Box className="flex-1 overflow-auto p-4">
                    <Box className="relative">
                        <IsometricGameCanvas
                            tiles={tiles}
                            units={units}
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
                            assetManifest={assets}
                            backgroundImage={assets.backgrounds?.worldMap ? `${assets.baseUrl}/${assets.backgrounds.worldMap}` : undefined}
                            effectSpriteUrls={spriteSheetUrls}
                            resolveUnitFrame={resolveUnitFrame}
                        />

                        {/* Hover Tooltip (positioned over canvas) */}
                        {hoveredHexInfo && hoveredTile && (
                            <Box
                                className="absolute z-50 pointer-events-none animate-in fade-in duration-150"
                                style={{
                                    left: (() => {
                                        const pos = isoToScreen(hoveredTile.x, hoveredTile.y, scale, baseOffsetX);
                                        return pos.x + TILE_WIDTH * scale / 2 + 20;
                                    })(),
                                    top: (() => {
                                        const pos = isoToScreen(hoveredTile.x, hoveredTile.y, scale, baseOffsetX);
                                        return pos.y + FLOOR_HEIGHT * scale / 2;
                                    })(),
                                }}
                            >
                                <Card variant="default" className="p-3 shadow-xl bg-slate-900/95 backdrop-blur-sm border border-slate-600 min-w-[180px]">
                                    <Typography variant="body2" className="text-white font-bold mb-1">
                                        {hoveredHexInfo.hex.feature && hoveredHexInfo.hex.feature !== 'none'
                                            ? FEATURE_LABELS[hoveredHexInfo.hex.feature]
                                            : `${hoveredHexInfo.hex.terrain.charAt(0).toUpperCase() + hoveredHexInfo.hex.terrain.slice(1)}`}
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-400 block">
                                        ({hoveredTile.x}, {hoveredTile.y})
                                    </Typography>
                                    {hoveredHexInfo.hex.featureData?.resourceAmount && (
                                        <Typography variant="body2" className="text-green-400 mt-1">
                                            +{hoveredHexInfo.hex.featureData.resourceAmount} {hoveredHexInfo.hex.featureData.resourceType}
                                        </Typography>
                                    )}
                                    {hoveredHexInfo.hero && (
                                        <Box className="mt-2 p-2 bg-slate-800 rounded">
                                            <Typography variant="body2" className={hoveredHexInfo.hero.owner === 'player' ? 'text-blue-400' : 'text-red-400'}>
                                                {hoveredHexInfo.hero.name} (Lv {hoveredHexInfo.hero.level})
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-400">
                                                Army: {hoveredHexInfo.hero.army.reduce((sum, u) => sum + u.count, 0)} units
                                            </Typography>
                                        </Box>
                                    )}
                                    {hoveredHexInfo.castle && (
                                        <Box className="mt-2 p-2 bg-slate-800 rounded">
                                            <Typography variant="body2" className="text-amber-400">
                                                {hoveredHexInfo.castle.name}
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-400">
                                                {CASTLE_FACTIONS[hoveredHexInfo.castle.faction].name}
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Info Panel */}
                <Box className="w-80 bg-slate-800/90 border-l border-slate-700 p-4 overflow-y-auto">
                    {/* Selected Hero */}
                    {selectedHero && (
                        <Box className="p-4 bg-gradient-to-br from-purple-900/50 to-slate-900 rounded-lg border border-purple-500/50 mb-4">
                            <HStack className="gap-3 items-center mb-3">
                                <Box className="w-14 h-14 rounded-lg overflow-hidden border-2 border-purple-500 bg-slate-900">
                                    {getHeroPortraitUrl(assets, selectedHero.id) ? (
                                        <img
                                            src={getHeroPortraitUrl(assets, selectedHero.id)}
                                            alt={selectedHero.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Box className="w-full h-full flex items-center justify-center text-2xl">
                                            {selectedHero.owner === 'player' ? '🦸' : '👹'}
                                        </Box>
                                    )}
                                </Box>
                                <VStack className="gap-0">
                                    <Typography variant="h5" className="text-white">
                                        {selectedHero.name}
                                    </Typography>
                                    <Typography variant="caption" className="text-purple-300">
                                        Level {selectedHero.level} {selectedHero.archetype}
                                    </Typography>
                                </VStack>
                            </HStack>
                            <HStack className="gap-4">
                                <Box className="flex-1 text-center p-2 bg-slate-800 rounded">
                                    <Typography variant="caption" className="text-gray-400 block">Movement</Typography>
                                    <Typography variant="h5" className="text-green-400">
                                        {selectedHero.movement}/{selectedHero.maxMovement}
                                    </Typography>
                                </Box>
                                <Box className="flex-1 text-center p-2 bg-slate-800 rounded">
                                    <Typography variant="caption" className="text-gray-400 block">Army</Typography>
                                    <Typography variant="h5" className="text-amber-400">
                                        {selectedHero.army.reduce((sum, u) => sum + u.count, 0)}
                                    </Typography>
                                </Box>
                            </HStack>
                        </Box>
                    )}

                    {/* Player Heroes List */}
                    <Box className="mb-4">
                        <Typography variant="h6" className="text-white mb-2">Your Heroes</Typography>
                        <VStack className="gap-2">
                            {worldMap.heroes
                                .filter((h) => h.owner === 'player')
                                .map((hero) => (
                                    <Box
                                        key={hero.id}
                                        className={cn(
                                            'p-3 rounded-lg cursor-pointer transition-colors border',
                                            hero.id === selectedHeroId
                                                ? 'bg-purple-900/50 border-purple-500'
                                                : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                                        )}
                                        onClick={() => onHeroSelect?.(hero.id)}
                                    >
                                        <HStack className="gap-2 items-center">
                                            <Box className="w-8 h-8 rounded overflow-hidden border border-purple-400 bg-slate-900">
                                                {getHeroPortraitUrl(assets, hero.id) ? (
                                                    <img
                                                        src={getHeroPortraitUrl(assets, hero.id)}
                                                        alt={hero.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Box className="w-full h-full flex items-center justify-center text-sm">🦸</Box>
                                                )}
                                            </Box>
                                            <Typography variant="body2" className="text-white flex-1">
                                                {hero.name}
                                            </Typography>
                                            <Badge variant="default" className={hero.movement > 0 ? 'bg-green-600' : 'bg-gray-600'}>
                                                {hero.movement}
                                            </Badge>
                                        </HStack>
                                    </Box>
                                ))}
                        </VStack>
                    </Box>

                    {/* Enemy Heroes */}
                    {worldMap.heroes.some((h) => h.owner === 'enemy') && (
                        <Box className="mb-4">
                            <Typography variant="h6" className="text-red-400 mb-2">Enemy Heroes</Typography>
                            <VStack className="gap-2">
                                {worldMap.heroes
                                    .filter((h) => h.owner === 'enemy')
                                    .map((hero) => (
                                        <Box key={hero.id} className="p-3 bg-red-900/30 rounded-lg border border-red-600/50">
                                            <HStack className="gap-2 items-center">
                                                <Box className="w-8 h-8 rounded overflow-hidden border border-red-500 bg-slate-900">
                                                    {getHeroPortraitUrl(assets, hero.id) ? (
                                                        <img
                                                            src={getHeroPortraitUrl(assets, hero.id)}
                                                            alt={hero.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Box className="w-full h-full flex items-center justify-center text-sm">👹</Box>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" className="text-red-300 flex-1">
                                                    {hero.name}
                                                </Typography>
                                            </HStack>
                                        </Box>
                                    ))}
                            </VStack>
                        </Box>
                    )}

                    {/* Instructions */}
                    <Box className="mt-6 p-3 bg-slate-900/50 rounded border border-slate-700">
                        <Typography variant="caption" className="text-gray-400 block mb-1">Instructions</Typography>
                        <Typography variant="caption" className="text-gray-500">
                            Click a hero to select, then click a highlighted tile to move. Green = valid moves, Red = enemies.
                        </Typography>
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
}

export default CanvasWorldMapTemplate;
