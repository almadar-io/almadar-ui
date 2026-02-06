/**
 * CanvasCastleTemplate
 *
 * Canvas-based castle management using IsometricGameCanvas (canvas + DOM hybrid):
 * - Isometric courtyard with buildings on tiles and garrison units in open spaces
 * - DOM overlays: top bar, side panel (Buildings/Recruit/Garrison tabs), tooltip
 * - Follows the same pattern as CanvasWorldMapTemplate and CanvasBattleTemplate
 */

import React, { useState, useMemo, useCallback } from 'react';
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
import { BuildingSlot } from '../molecules/BuildingSlot';
import { BuildingDetailPanel } from '../molecules/BuildingDetailPanel';
import { GarrisonUnitCard } from '../molecules/GarrisonUnitCard';
import { UnitRecruitCard } from '../molecules/UnitRecruitCard';
import { CostDisplay } from '../atoms/CostDisplay';
import {
    useAssetsOptional,
    DEFAULT_ASSET_MANIFEST,
    getBuildingSpriteUrl,
    getRobotUnitSpriteUrl,
    getKenneyTileUrl,
    type TraitWarsAssetManifest,
    type BuildingType,
    type RobotUnitType,
} from '../assets';
import {
    Resources,
    StrategicCastle,
    CastleBuilding,
    RecruitableUnit,
    CASTLE_FACTIONS,
    FACTION_BUILDINGS,
    FACTION_BUILDING_NAMES,
    CourtyardLayout,
    COURTYARD_LAYOUTS,
    generateCourtyardWalls,
    canAfford,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface CanvasCastleTemplateProps {
    /** Castle data */
    castle: StrategicCastle;
    /** Player resources */
    resources: Resources;
    /** Units available for recruitment */
    availableUnits: RecruitableUnit[];
    /** Handler when building is constructed/upgraded */
    onBuild?: (buildingId: string) => void;
    /** Handler for recruiting units */
    onRecruit?: (unitId: string, count: number) => void;
    /** Handler when transferring units to/from garrison */
    onTransferUnit?: (unitId: string, toGarrison: boolean) => void;
    /** Handler to exit castle */
    onExit?: () => void;
    /** Canvas render scale */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// BUILDING ICONS (shared with BuildingDetailPanel)
// ============================================================================

const BUILDING_ICONS: Record<string, string> = {
    townHall: '🏛️',
    barracks: '⚔️',
    stables: '🐴',
    arcaneTower: '🗼',
    traitForge: '🔥',
    resonanceWell: '💧',
    treasury: '💰',
    fortress: '🏰',
    marketplace: '🏪',
    library: '📚',
    portal: '🌀',
};

// ============================================================================
// COURTYARD GENERATION
// ============================================================================

/** Generate courtyard tiles for IsometricGameCanvas */
function generateCourtyardTiles(
    layout: CourtyardLayout,
    assets: TraitWarsAssetManifest
): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const { gridWidth, gridHeight, floorTerrain, wallTerrain, gateTerrain, gateTiles } = layout;
    const walls = generateCourtyardWalls(gridWidth, gridHeight, gateTiles);
    const isWall = (x: number, y: number) => walls.some(w => w.x === x && w.y === y);
    const isGate = (x: number, y: number) => gateTiles.some(g => g.x === x && g.y === y);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            let terrain: string;
            let tileType: 'floor' | 'wall' | 'passage' = 'floor';

            if (isGate(x, y)) {
                terrain = gateTerrain;
                tileType = 'passage';
            } else if (isWall(x, y)) {
                terrain = wallTerrain;
                tileType = 'wall';
            } else {
                const index = Math.abs(x * 7 + y * 13) % floorTerrain.length;
                terrain = floorTerrain[index];
            }

            tiles.push({
                x,
                y,
                terrain,
                terrainSprite: getKenneyTileUrl(assets, terrain),
                passable: tileType !== 'wall',
                tileType,
            });
        }
    }
    return tiles;
}

/** Convert castle buildings to IsometricFeature[] for canvas rendering */
function buildingsToFeatures(
    castle: StrategicCastle,
    layout: CourtyardLayout,
    assets: TraitWarsAssetManifest
): IsometricFeature[] {
    return layout.buildingPositions
        .map(pos => {
            const building = castle.buildings.find(b => b.type === pos.buildingType);
            const isBuilt = building && building.level > 0;
            const spriteUrl = getBuildingSpriteUrl(assets, pos.buildingType as BuildingType);

            if (!isBuilt || !spriteUrl) return null;

            return {
                x: pos.tileX,
                y: pos.tileY,
                type: pos.buildingType,
                sprite: spriteUrl,
            };
        })
        .filter((f): f is IsometricFeature => f !== null);
}

/** Convert garrison units to IsometricUnit[] placed on open courtyard tiles */
function garrisonToUnits(
    garrison: StrategicCastle['garrison'],
    layout: CourtyardLayout,
    assets: TraitWarsAssetManifest
): IsometricUnit[] {
    // Collect occupied tiles: walls, gates, building positions
    const occupied = new Set<string>();

    // Wall tiles
    const walls = generateCourtyardWalls(layout.gridWidth, layout.gridHeight, layout.gateTiles);
    walls.forEach(w => occupied.add(`${w.x},${w.y}`));
    layout.gateTiles.forEach(g => occupied.add(`${g.x},${g.y}`));

    // Building tiles (including multi-tile footprints)
    layout.buildingPositions.forEach(pos => {
        const w = pos.width || 1;
        const h = pos.height || 1;
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                occupied.add(`${pos.tileX + dx},${pos.tileY + dy}`);
            }
        }
    });

    // Find open interior tiles
    const openTiles: Array<{ x: number; y: number }> = [];
    for (let y = 1; y < layout.gridHeight - 1; y++) {
        for (let x = 1; x < layout.gridWidth - 1; x++) {
            if (!occupied.has(`${x},${y}`)) {
                openTiles.push({ x, y });
            }
        }
    }

    // Place garrison units on open tiles
    return garrison.slice(0, openTiles.length).map((unit, i) => ({
        id: unit.id,
        position: openTiles[i],
        name: `${unit.name} x${unit.count}`,
        team: 'player' as const,
        unitType: unit.spriteId,
        sprite: getRobotUnitSpriteUrl(assets, unit.spriteId as RobotUnitType),
    }));
}

/** Find which building occupies a given tile (accounting for multi-tile footprints) */
function findBuildingAtTile(
    x: number,
    y: number,
    layout: CourtyardLayout
): string | null {
    for (const pos of layout.buildingPositions) {
        const w = pos.width || 1;
        const h = pos.height || 1;
        if (x >= pos.tileX && x < pos.tileX + w && y >= pos.tileY && y < pos.tileY + h) {
            return pos.buildingType;
        }
    }
    return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CanvasCastleTemplate({
    castle,
    resources,
    availableUnits,
    onBuild,
    onRecruit,
    onTransferUnit,
    onExit,
    scale = 0.45,
    className,
}: CanvasCastleTemplateProps): JSX.Element {
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const faction = CASTLE_FACTIONS[castle.faction];
    const layout = COURTYARD_LAYOUTS[castle.faction];
    const factionBuildings = FACTION_BUILDINGS[castle.faction];
    const factionNames = FACTION_BUILDING_NAMES[castle.faction];

    // State
    const [selectedBuilding, setSelectedBuilding] = useState<CastleBuilding | null>(null);
    const [selectedTab, setSelectedTab] = useState<'buildings' | 'recruit' | 'garrison'>('buildings');
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [recruitCounts, setRecruitCounts] = useState<Record<string, number>>({});

    // Get building by type
    const getBuildingByType = useCallback((type: string) =>
        castle.buildings.find(b => b.type === type), [castle.buildings]);

    // Canvas data
    const courtyardTiles = useMemo(
        () => generateCourtyardTiles(layout, assets),
        [layout, assets]
    );

    const buildingFeatures = useMemo(
        () => buildingsToFeatures(castle, layout, assets),
        [castle, layout, assets]
    );

    const garrisonUnits = useMemo(
        () => garrisonToUnits(castle.garrison, layout, assets),
        [castle.garrison, layout, assets]
    );

    // Hovered building info
    const hoveredBuildingInfo = useMemo(() => {
        if (!hoveredTile) return null;
        const buildingType = findBuildingAtTile(hoveredTile.x, hoveredTile.y, layout);
        if (!buildingType) return null;
        const building = getBuildingByType(buildingType);
        const name = factionNames[buildingType as BuildingType] || buildingType;
        return { buildingType, building, name };
    }, [hoveredTile, layout, getBuildingByType, factionNames]);

    // Hovered garrison unit info
    const hoveredUnitInfo = useMemo(() => {
        if (!hoveredTile) return null;
        return garrisonUnits.find(
            u => u.position.x === hoveredTile.x && u.position.y === hoveredTile.y
        ) || null;
    }, [hoveredTile, garrisonUnits]);

    // Handle tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        const buildingType = findBuildingAtTile(x, y, layout);
        if (buildingType) {
            const building = getBuildingByType(buildingType);
            const name = factionNames[buildingType as BuildingType] || buildingType;
            setSelectedBuilding(
                building || {
                    type: buildingType,
                    id: buildingType,
                    name,
                    level: 0,
                    maxLevel: 3,
                    description: '',
                    cost: {},
                } as CastleBuilding
            );
            setSelectedTab('buildings');
        }
    }, [layout, getBuildingByType, factionNames]);

    // Handle unit click on canvas
    const handleUnitClick = useCallback((_unitId: string) => {
        setSelectedTab('garrison');
    }, []);

    // Recruitment
    const getRecruitmentCost = useCallback(() => {
        let totalGold = 0;
        let totalResonance = 0;
        availableUnits.forEach(unit => {
            const count = recruitCounts[unit.id] || 0;
            if (count > 0) {
                totalGold += (unit.cost.gold || 0) * count;
                totalResonance += (unit.cost.resonance || 0) * count;
            }
        });
        return { gold: totalGold, resonance: totalResonance };
    }, [availableUnits, recruitCounts]);

    const handleRecruit = useCallback(() => {
        Object.entries(recruitCounts).forEach(([unitId, count]) => {
            if (count > 0) {
                onRecruit?.(unitId, count);
            }
        });
        setRecruitCounts({});
    }, [recruitCounts, onRecruit]);

    // Tooltip positioning
    const maxY = layout.gridHeight - 1;
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    // Highlight the tile of the selected building
    const selectedBuildingTile = useMemo(() => {
        if (!selectedBuilding) return null;
        const pos = layout.buildingPositions.find(p => p.buildingType === selectedBuilding.type);
        return pos ? `building-${pos.tileX}-${pos.tileY}` : null;
    }, [selectedBuilding, layout]);

    return (
        <Box className={cn('min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900', className)}>
            {/* Top Bar */}
            <Box
                className="p-4 border-b"
                style={{
                    backgroundColor: `${faction.colors.primary}20`,
                    borderColor: faction.colors.primary,
                }}
            >
                <HStack justify="between" className="max-w-7xl mx-auto">
                    <HStack className="gap-4 items-center">
                        <Typography variant="h4" className="text-3xl">🏰</Typography>
                        <VStack className="gap-0">
                            <Typography variant="h4" className="text-white">
                                {castle.name}
                            </Typography>
                            <Typography variant="caption" style={{ color: faction.colors.secondary }}>
                                {faction.name}
                            </Typography>
                        </VStack>
                        <Badge variant="default" className="bg-amber-600 text-white">
                            🛡️ {castle.defense}
                        </Badge>
                    </HStack>
                    <HStack className="gap-4 items-center">
                        <ResourceBar resources={resources} compact />
                        <Button onClick={onExit} variant="ghost" className="border-slate-500 text-white hover:bg-slate-700">
                            Exit Castle
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            {/* Main Content */}
            <HStack className="h-[calc(100vh-72px)]">
                {/* Canvas Area */}
                <Box className="flex-1 overflow-auto p-4">
                    <Box className="relative">
                        <IsometricGameCanvas
                            tiles={courtyardTiles}
                            units={garrisonUnits}
                            features={buildingFeatures}
                            hoveredTile={hoveredTile}
                            onTileClick={handleTileClick}
                            onUnitClick={handleUnitClick}
                            onTileHover={(x, y) => setHoveredTile({ x, y })}
                            onTileLeave={() => setHoveredTile(null)}
                            scale={scale}
                            assetManifest={assets}
                            backgroundImage={assets.backgrounds?.castle ? `${assets.baseUrl}/${assets.backgrounds.castle}` : undefined}
                        />

                        {/* Hover Tooltip: Building */}
                        {hoveredBuildingInfo && hoveredTile && !hoveredUnitInfo && (
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
                                    <HStack className="gap-2 items-center mb-1">
                                        <Typography variant="body2" className="text-lg">
                                            {BUILDING_ICONS[hoveredBuildingInfo.buildingType] || '🏗️'}
                                        </Typography>
                                        <Typography variant="body2" className="text-white font-bold">
                                            {hoveredBuildingInfo.name}
                                        </Typography>
                                    </HStack>
                                    {hoveredBuildingInfo.building ? (
                                        <Typography variant="caption" className="text-gray-400">
                                            Level {hoveredBuildingInfo.building.level}/{hoveredBuildingInfo.building.maxLevel}
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" className="text-gray-500">
                                            Not built — click to view
                                        </Typography>
                                    )}
                                </Card>
                            </Box>
                        )}

                        {/* Hover Tooltip: Garrison Unit */}
                        {hoveredUnitInfo && hoveredTile && (
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
                                <Card variant="default" className="p-3 shadow-xl bg-slate-900/95 backdrop-blur-sm border border-blue-500/50 min-w-[140px]">
                                    <Typography variant="body2" className="text-blue-400 font-bold">
                                        {hoveredUnitInfo.name}
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        Garrison Unit
                                    </Typography>
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Side Panel */}
                <Box className="w-96 bg-slate-800/90 border-l border-slate-700 flex flex-col">
                    {/* Tabs */}
                    <HStack className="border-b border-slate-700">
                        {(['buildings', 'recruit', 'garrison'] as const).map(tab => (
                            <Box
                                key={tab}
                                className={cn(
                                    'flex-1 py-3 text-center cursor-pointer transition-colors',
                                    selectedTab === tab
                                        ? 'bg-slate-700 text-white border-b-2 border-amber-500'
                                        : 'text-gray-400 hover:bg-slate-700/50'
                                )}
                                onClick={() => setSelectedTab(tab)}
                            >
                                <Typography variant="body2" className="capitalize font-medium">
                                    {tab}
                                </Typography>
                            </Box>
                        ))}
                    </HStack>

                    {/* Panel Content */}
                    <Box className="flex-1 overflow-y-auto p-4">
                        {/* Buildings Tab */}
                        {selectedTab === 'buildings' && (
                            <VStack className="gap-4">
                                {selectedBuilding ? (
                                    <BuildingDetailPanel
                                        building={selectedBuilding}
                                        faction={castle.faction}
                                        resources={resources}
                                        onBuild={onBuild}
                                    />
                                ) : (
                                    <Typography variant="body2" className="text-gray-500 text-center py-8">
                                        Click a building on the courtyard to view details
                                    </Typography>
                                )}

                                {/* All faction buildings list */}
                                <Box>
                                    <Typography variant="caption" className="text-gray-500 block mb-2">
                                        All Buildings
                                    </Typography>
                                    <Box className="grid grid-cols-3 gap-2">
                                        {factionBuildings.map(buildingType => {
                                            const building = getBuildingByType(buildingType);
                                            const name = factionNames[buildingType] || buildingType;
                                            return (
                                                <BuildingSlot
                                                    key={buildingType}
                                                    buildingType={buildingType as BuildingType}
                                                    name={name}
                                                    level={building?.level ?? 0}
                                                    maxLevel={building?.maxLevel ?? 3}
                                                    isSelected={selectedBuilding?.type === buildingType}
                                                    fallbackIcon={BUILDING_ICONS[buildingType]}
                                                    onClick={() => {
                                                        setSelectedBuilding(
                                                            building || {
                                                                type: buildingType,
                                                                id: buildingType,
                                                                name,
                                                                level: 0,
                                                                maxLevel: 3,
                                                                description: '',
                                                                cost: {},
                                                            } as CastleBuilding
                                                        );
                                                    }}
                                                    className="h-20"
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </VStack>
                        )}

                        {/* Recruit Tab */}
                        {selectedTab === 'recruit' && (
                            <VStack className="gap-3">
                                {availableUnits.length === 0 ? (
                                    <Typography variant="body2" className="text-gray-500 text-center py-8">
                                        No units available for recruitment
                                    </Typography>
                                ) : (
                                    availableUnits.map(unit => (
                                        <UnitRecruitCard
                                            key={unit.id}
                                            id={unit.id}
                                            name={unit.name}
                                            unitType={unit.spriteId as RobotUnitType}
                                            tier={unit.tier}
                                            attack={unit.stats.attack}
                                            defense={unit.stats.defense}
                                            health={unit.stats.health}
                                            movement={unit.stats.speed}
                                            goldCost={unit.cost.gold || 0}
                                            resonanceCost={unit.cost.resonance}
                                            available={unit.available}
                                            recruitCount={recruitCounts[unit.id] || 0}
                                            onIncrement={() => setRecruitCounts(p => ({
                                                ...p,
                                                [unit.id]: Math.min(unit.available, (p[unit.id] || 0) + 1),
                                            }))}
                                            onDecrement={() => setRecruitCounts(p => ({
                                                ...p,
                                                [unit.id]: Math.max(0, (p[unit.id] || 0) - 1),
                                            }))}
                                            onRecruit={() => {
                                                const count = recruitCounts[unit.id] || 0;
                                                if (count > 0) {
                                                    onRecruit?.(unit.id, count);
                                                    setRecruitCounts(p => ({ ...p, [unit.id]: 0 }));
                                                }
                                            }}
                                        />
                                    ))
                                )}

                                {/* Total cost + recruit all */}
                                {Object.values(recruitCounts).some(c => c > 0) && (
                                    <Box className="p-3 bg-amber-900/30 rounded-lg border border-amber-600">
                                        <Typography variant="caption" className="text-amber-400 block mb-2">
                                            Total Cost:
                                        </Typography>
                                        <CostDisplay cost={getRecruitmentCost()} />
                                        <Button
                                            onClick={handleRecruit}
                                            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                                        >
                                            Recruit All Units
                                        </Button>
                                    </Box>
                                )}
                            </VStack>
                        )}

                        {/* Garrison Tab */}
                        {selectedTab === 'garrison' && (
                            <VStack className="gap-3">
                                <Typography variant="h6" className="text-white">
                                    Garrison ({castle.garrison.reduce((s, u) => s + u.count, 0)} units)
                                </Typography>
                                {castle.garrison.length === 0 ? (
                                    <Typography variant="body2" className="text-gray-500 text-center py-4">
                                        No units stationed
                                    </Typography>
                                ) : (
                                    castle.garrison.map(unit => (
                                        <GarrisonUnitCard
                                            key={unit.id}
                                            unit={unit}
                                            onTransfer={onTransferUnit ? () => onTransferUnit(unit.id, false) : undefined}
                                        />
                                    ))
                                )}
                            </VStack>
                        )}
                    </Box>
                </Box>
            </HStack>

            {/* Bottom Bar: Income Summary */}
            <Box className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-700 px-6 py-2">
                <HStack justify="center" className="gap-6">
                    <Typography variant="caption" className="text-gray-500">Daily Income:</Typography>
                    <Typography variant="caption" className="text-yellow-400">
                        +{castle.income.gold} 🪙
                    </Typography>
                    <Typography variant="caption" className="text-purple-400">
                        +{castle.income.resonance} 🔮
                    </Typography>
                    <Typography variant="caption" className="text-cyan-400">
                        +{castle.income.traitShards} 💎
                    </Typography>
                </HStack>
            </Box>
        </Box>
    );
}

export default CanvasCastleTemplate;
