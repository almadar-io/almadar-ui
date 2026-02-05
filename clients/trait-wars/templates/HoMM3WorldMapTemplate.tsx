/**
 * HoMM3 WorldMapTemplate
 *
 * Strategic world map using HexGameBoard with:
 * - Isometric hex terrain navigation
 * - Resource nodes, castles, and portals
 * - Hero movement and encounters
 * - Turn-based gameplay
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, HStack, VStack, Button, Badge, cn } from '@almadar/ui';
import { HexGameBoard, HexBoardTile } from '../organisms/HexGameBoard';
import { HexTileType } from '../atoms/HexTileSprite';
import { ResourceBar } from '../molecules/ResourceBar';
import {
    Resources,
    StrategicWorldMap,
    WorldMapHex,
    WorldMapHero,
    HexFeatureType,
    CASTLE_FACTIONS,
    CastleFaction,
    getAdjacentHexes,
    isInMovementRange,
} from '../types';
import {
    useAssetsOptional,
    DEFAULT_ASSET_MANIFEST,
    getHeroPortraitUrl,
    getWorldMapFeatureUrl,
    WorldMapFeatureType,
} from '../assets';

// ============================================================================
// TYPES
// ============================================================================

export interface HoMM3WorldMapProps {
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
    /** Additional CSS classes */
    className?: string;
}

// Feature icons for map overlay (fallback emojis)
const FEATURE_ICONS: Record<HexFeatureType, string> = {
    none: '',
    goldMine: '🪙',
    resonanceCrystal: '🔮',
    traitCache: '💎',
    salvageYard: '⚙️',
    portal: '🌀',
    treasure: '📦',
    castle: '🏰',
    battleMarker: '⚔️',
    hero: '👤',
};

// Check if feature has an image asset
const hasFeatureImage = (featureType: HexFeatureType): boolean => {
    return featureType !== 'none' && featureType !== 'hero' && featureType !== 'castle';
};

// Convert world map hex terrain to HexTileType
const TERRAIN_MAP: Record<string, HexTileType> = {
    grass: 'grass',
    dirt: 'dirt',
    stone: 'stone',
    water: 'water',
    lava: 'lava',
    ice: 'ice',
};

/**
 * HoMM3WorldMapTemplate - Strategic world map with hex-based navigation.
 */
export function HoMM3WorldMapTemplate({
    worldMap,
    resources,
    selectedHeroId,
    onHeroSelect,
    onHeroMove,
    onEnterCastle,
    onCollectResource,
    onBattleEncounter,
    onEndTurn,
    className,
}: HoMM3WorldMapProps): JSX.Element {
    // Get asset manifest
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;

    const [selectedHex, setSelectedHex] = useState<{ x: number; y: number } | null>(null);
    const [hoveredHex, setHoveredHex] = useState<{ x: number; y: number } | null>(null);

    // Get currently selected hero
    const selectedHero = useMemo(() => {
        return worldMap.heroes.find((h) => h.id === selectedHeroId);
    }, [worldMap.heroes, selectedHeroId]);

    // Convert world map hexes to board tiles
    const boardTiles: HexBoardTile[] = useMemo(() => {
        return worldMap.hexes.map((hex) => ({
            x: hex.x,
            y: hex.y,
            terrain: TERRAIN_MAP[hex.terrain] || 'grass',
        }));
    }, [worldMap.hexes]);

    // Get valid moves for selected hero
    const validMoves = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        const moves: Array<{ x: number; y: number }> = [];
        worldMap.hexes.forEach((hex) => {
            if (!hex.passable) return;
            if (hex.x === selectedHero.position.x && hex.y === selectedHero.position.y) return;

            // Check if within movement range
            if (isInMovementRange(selectedHero.position, { x: hex.x, y: hex.y }, selectedHero.movement)) {
                // Check if hex is not occupied by friendly hero
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

    // Get attack targets (enemy heroes in range)
    const attackTargets = useMemo(() => {
        if (!selectedHero || selectedHero.movement <= 0) return [];

        return worldMap.heroes
            .filter((h) => h.owner === 'enemy')
            .filter((h) => isInMovementRange(selectedHero.position, h.position, selectedHero.movement))
            .map((h) => h.position);
    }, [selectedHero, worldMap.heroes]);

    // Create units array for HexGameBoard (heroes as units)
    const units = useMemo(() => {
        return worldMap.heroes.map((hero) => ({
            id: hero.id,
            position: hero.position,
            name: hero.name,
            characterType: hero.spriteId || (hero.owner === 'player' ? 'knight' : 'skeleton'),
            team: hero.owner === 'enemy' ? 'enemy' as const : 'player' as const,
            state: 'idle' as const,
            health: 100,
            maxHealth: 100,
        }));
    }, [worldMap.heroes]);

    // Handle tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        const hex = worldMap.hexes.find((h) => h.x === x && h.y === y);
        if (!hex) return;

        setSelectedHex({ x, y });

        // If a hero is selected and this is a valid move, move there
        if (selectedHero && validMoves.some((m) => m.x === x && m.y === y)) {
            onHeroMove?.(selectedHero.id, x, y);

            // Check for features on destination
            if (hex.feature === 'castle' && hex.featureData?.castleId) {
                onEnterCastle?.(hex.featureData.castleId);
            } else if (hex.feature && ['goldMine', 'resonanceCrystal', 'traitCache', 'salvageYard', 'treasure'].includes(hex.feature)) {
                onCollectResource?.(x, y, hex.featureData?.resourceType || 'gold', hex.featureData?.resourceAmount || 100);
            }
        }

        // Check if clicking on enemy hero for battle
        const enemyHero = worldMap.heroes.find(
            (h) => h.position.x === x && h.position.y === y && h.owner === 'enemy'
        );
        if (selectedHero && enemyHero && attackTargets.some((t) => t.x === x && t.y === y)) {
            onBattleEncounter?.(selectedHero.id, enemyHero.id);
        }
    }, [worldMap.hexes, worldMap.heroes, selectedHero, validMoves, attackTargets, onHeroMove, onEnterCastle, onCollectResource, onBattleEncounter]);

    // Handle unit/hero click
    const handleUnitClick = useCallback((unitId: string) => {
        const hero = worldMap.heroes.find((h) => h.id === unitId);
        if (hero && hero.owner === 'player') {
            onHeroSelect?.(unitId);
        }
    }, [worldMap.heroes, onHeroSelect]);

    // Get hex feature info for tooltip
    const getHexInfo = (x: number, y: number) => {
        const hex = worldMap.hexes.find((h) => h.x === x && h.y === y);
        if (!hex) return null;

        const hero = worldMap.heroes.find((h) => h.position.x === x && h.position.y === y);
        const castle = hex.feature === 'castle'
            ? worldMap.castles.find((c) => c.id === hex.featureData?.castleId)
            : null;

        return { hex, hero, castle };
    };

    const hoveredInfo = hoveredHex ? getHexInfo(hoveredHex.x, hoveredHex.y) : null;

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
                    {/* Feature Overlays (rendered on top of board) */}
                    <Box className="relative">
                        <HexGameBoard
                            tiles={boardTiles}
                            units={units}
                            selectedUnitId={selectedHeroId}
                            validMoves={validMoves}
                            attackTargets={attackTargets}
                            onTileClick={handleTileClick}
                            onUnitClick={handleUnitClick}
                            onTileHover={(x, y) => setHoveredHex({ x, y })}
                            onTileLeave={() => setHoveredHex(null)}
                            scale={0.4}
                        />

                        {/* Feature icons overlay */}
                        <Box className="absolute inset-0 pointer-events-none">
                            {worldMap.hexes
                                .filter((hex) => hex.feature && hex.feature !== 'none' && hex.feature !== 'hero')
                                .map((hex) => {
                                    const scale = 0.4;
                                    const TILE_WIDTH = 256 * scale;
                                    const FLOOR_HEIGHT = 128 * scale;
                                    const HORIZONTAL_OFFSET = TILE_WIDTH / 2;
                                    const VERTICAL_OFFSET = FLOOR_HEIGHT / 2;
                                    const maxY = Math.max(...worldMap.hexes.map((h) => h.y), 0);
                                    const baseOffsetX = (maxY + 1) * HORIZONTAL_OFFSET;

                                    const posX = (hex.x - hex.y) * HORIZONTAL_OFFSET + baseOffsetX + TILE_WIDTH / 2;
                                    const posY = (hex.x + hex.y) * VERTICAL_OFFSET + 40;

                                    const featureAsset = getWorldMapFeatureUrl(assets, hex.feature as WorldMapFeatureType);
                                    return (
                                        <Box
                                            key={`feature-${hex.x}-${hex.y}`}
                                            className="absolute transform -translate-x-1/2"
                                            style={{ left: posX + 16, top: posY - 20 }}
                                        >
                                            {featureAsset ? (
                                                <img
                                                    src={featureAsset}
                                                    alt={hex.feature}
                                                    className="w-16 h-16 object-contain drop-shadow-lg"
                                                    onError={(e) => {
                                                        // Hide image on error to show fallback
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-2xl">{FEATURE_ICONS[hex.feature!]}</span>
                                            )}
                                        </Box>
                                    );
                                })}
                        </Box>
                    </Box>
                </Box>

                {/* Info Panel */}
                <Box className="w-80 bg-slate-800/90 border-l border-slate-700 p-4 overflow-y-auto">
                    {/* Selected Hero */}
                    {selectedHero && (
                        <Box className="p-4 bg-gradient-to-br from-purple-900/50 to-slate-900 rounded-lg border border-purple-500/50 mb-4">
                            <HStack className="gap-3 items-center mb-3">
                                <Box className="w-14 h-14 rounded-lg overflow-hidden border-2 border-purple-500 bg-slate-900">
                                    <img
                                        src={getHeroPortraitUrl(assets, selectedHero.id)}
                                        alt={selectedHero.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
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

                    {/* Hovered Hex Info */}
                    {hoveredInfo && (
                        <Box className="p-4 bg-slate-900 rounded-lg border border-slate-600 mb-4">
                            <Typography variant="h6" className="text-white mb-2">
                                {hoveredInfo.hex.feature && hoveredInfo.hex.feature !== 'none'
                                    ? `${FEATURE_ICONS[hoveredInfo.hex.feature]} ${hoveredInfo.hex.feature}`
                                    : `Terrain: ${hoveredInfo.hex.terrain}`}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                                Position: ({hoveredInfo.hex.x}, {hoveredInfo.hex.y})
                            </Typography>
                            {hoveredInfo.hex.featureData?.resourceAmount && (
                                <Typography variant="body2" className="text-green-400 mt-1">
                                    +{hoveredInfo.hex.featureData.resourceAmount} {hoveredInfo.hex.featureData.resourceType}
                                </Typography>
                            )}
                            {hoveredInfo.hero && (
                                <Box className="mt-2 p-2 bg-slate-800 rounded">
                                    <Typography variant="body2" className={hoveredInfo.hero.owner === 'player' ? 'text-blue-400' : 'text-red-400'}>
                                        {hoveredInfo.hero.name}
                                    </Typography>
                                </Box>
                            )}
                            {hoveredInfo.castle && (
                                <Box className="mt-2 p-2 bg-slate-800 rounded">
                                    <Typography variant="body2" className="text-amber-400">
                                        {hoveredInfo.castle.name}
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        {CASTLE_FACTIONS[hoveredInfo.castle.faction].name}
                                    </Typography>
                                </Box>
                            )}
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
                                            <Box className="w-8 h-8 rounded overflow-hidden border border-purple-400">
                                                <img
                                                    src={getHeroPortraitUrl(assets, hero.id)}
                                                    alt={hero.name}
                                                    className="w-full h-full object-cover"
                                                />
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
                        <Box>
                            <Typography variant="h6" className="text-red-400 mb-2">Enemy Heroes</Typography>
                            <VStack className="gap-2">
                                {worldMap.heroes
                                    .filter((h) => h.owner === 'enemy')
                                    .map((hero) => (
                                        <Box key={hero.id} className="p-3 bg-red-900/30 rounded-lg border border-red-600/50">
                                            <HStack className="gap-2 items-center">
                                                <Box className="w-8 h-8 rounded overflow-hidden border border-red-500">
                                                    <img
                                                        src={getHeroPortraitUrl(assets, hero.id)}
                                                        alt={hero.name}
                                                        className="w-full h-full object-cover"
                                                    />
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
                            Click a hero to select, then click a highlighted hex to move. Green = valid moves, Red = enemies.
                        </Typography>
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
}

export default HoMM3WorldMapTemplate;
