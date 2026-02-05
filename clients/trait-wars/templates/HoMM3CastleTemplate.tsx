/**
 * HoMM3 CastleTemplate
 *
 * Castle management with visual castle backdrop showing:
 * - Faction-themed castle with building slots
 * - Clickable buildings that appear when constructed
 * - Integrated army recruitment panel
 * - Garrison management
 */

import React, { useState, useMemo } from 'react';
import { Box, Typography, HStack, VStack, Button, Badge, cn } from '@almadar/ui';
import { ResourceBar } from '../molecules/ResourceBar';
import { BuildingSlot } from '../molecules/BuildingSlot';
import { BuildingType } from '../assets';
import {
    Resources,
    ResourceCost,
    StrategicCastle,
    CastleBuilding,
    GarrisonUnit,
    RecruitableUnit,
    CASTLE_FACTIONS,
    CastleFaction,
    FACTION_BUILDING_NAMES,
    FACTION_BUILDINGS,
    canAfford,
    spendResources,
    RESOURCE_INFO,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface HoMM3CastleTemplateProps {
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
    /** Additional CSS classes */
    className?: string;
}

// Building visual positions for castle backdrop (relative percentages)
const BUILDING_POSITIONS: Record<string, { x: number; y: number; width: number; height: number }> = {
    townHall: { x: 40, y: 35, width: 20, height: 25 },
    barracks: { x: 10, y: 50, width: 15, height: 20 },
    stables: { x: 75, y: 50, width: 15, height: 20 },
    arcaneTower: { x: 80, y: 25, width: 12, height: 30 },
    traitForge: { x: 5, y: 30, width: 12, height: 20 },
    resonanceWell: { x: 55, y: 60, width: 10, height: 15 },
    treasury: { x: 25, y: 55, width: 12, height: 15 },
    fortress: { x: 45, y: 15, width: 10, height: 15 },
    marketplace: { x: 65, y: 55, width: 12, height: 15 },
    library: { x: 15, y: 35, width: 12, height: 18 },
    portal: { x: 85, y: 60, width: 10, height: 20 },
};

// Building icons
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

function CostDisplay({ cost }: { cost: ResourceCost }): JSX.Element {
    return (
        <HStack className="gap-2 flex-wrap">
            {Object.entries(cost).map(([type, amount]) => {
                if (!amount) return null;
                const info = RESOURCE_INFO[type as keyof typeof RESOURCE_INFO];
                return (
                    <Typography key={type} variant="caption" className="text-gray-300">
                        {info?.icon || '•'} {amount}
                    </Typography>
                );
            })}
        </HStack>
    );
}

/**
 * HoMM3CastleTemplate - Visual castle management with faction themes.
 */
export function HoMM3CastleTemplate({
    castle,
    resources,
    availableUnits,
    onBuild,
    onRecruit,
    onTransferUnit,
    onExit,
    className,
}: HoMM3CastleTemplateProps): JSX.Element {
    const [selectedBuilding, setSelectedBuilding] = useState<CastleBuilding | null>(null);
    const [selectedTab, setSelectedTab] = useState<'buildings' | 'recruit' | 'garrison'>('buildings');
    const [recruitCounts, setRecruitCounts] = useState<Record<string, number>>({});

    const faction = CASTLE_FACTIONS[castle.faction];
    const factionBuildings = FACTION_BUILDINGS[castle.faction];
    const factionNames = FACTION_BUILDING_NAMES[castle.faction];

    // Get building at a specific type
    const getBuildingByType = (type: string) => castle.buildings.find((b) => b.type === type);

    // Calculate total recruitment cost
    const getRecruitmentCost = () => {
        let totalGold = 0;
        let totalResonance = 0;
        availableUnits.forEach((unit) => {
            const count = recruitCounts[unit.id] || 0;
            if (count > 0) {
                totalGold += (unit.cost.gold || 0) * count;
                totalResonance += (unit.cost.resonance || 0) * count;
            }
        });
        return { gold: totalGold, resonance: totalResonance };
    };

    const handleRecruit = () => {
        Object.entries(recruitCounts).forEach(([unitId, count]) => {
            if (count > 0) {
                onRecruit?.(unitId, count);
            }
        });
        setRecruitCounts({});
    };

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
                {/* Castle Visualization */}
                <Box className="flex-1 p-6 flex items-center justify-center">
                    <Box
                        className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${faction.colors.primary}40, ${faction.colors.secondary}20)`,
                            border: `3px solid ${faction.colors.primary}`,
                        }}
                    >
                        {/* Castle backdrop gradient */}
                        <Box className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />

                        {/* Faction banner */}
                        <Box
                            className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-lg"
                            style={{ backgroundColor: faction.colors.primary }}
                        >
                            <Typography variant="h5" className="text-white font-bold">
                                {faction.name}
                            </Typography>
                        </Box>

                        {/* Building slots */}
                        {factionBuildings.map((buildingType) => {
                            const building = getBuildingByType(buildingType);
                            const position = BUILDING_POSITIONS[buildingType];
                            const icon = BUILDING_ICONS[buildingType];
                            const name = factionNames[buildingType] || buildingType;
                            const isSelected = selectedBuilding?.type === buildingType;

                            if (!position) return null;

                            return (
                                <Box
                                    key={buildingType}
                                    className="absolute"
                                    style={{
                                        left: `${position.x}%`,
                                        top: `${position.y}%`,
                                        width: `${position.width}%`,
                                        height: `${position.height}%`,
                                    }}
                                >
                                    <BuildingSlot
                                        buildingType={buildingType as BuildingType}
                                        name={name}
                                        level={building?.level ?? 0}
                                        maxLevel={building?.maxLevel ?? 3}
                                        isSelected={isSelected}
                                        fallbackIcon={icon}
                                        onClick={() => setSelectedBuilding(building || { type: buildingType, id: buildingType, name: name, level: 0, maxLevel: 3, description: '', cost: {} } as any)}
                                        className="w-full h-full"
                                    />
                                </Box>
                            );
                        })}

                        {/* Defense indicator */}
                        <Box className="absolute bottom-4 left-4 p-2 bg-slate-900/80 rounded-lg">
                            <Typography variant="caption" className="text-gray-400">Defense</Typography>
                            <Typography variant="h5" className="text-amber-400">🛡️ {castle.defense}</Typography>
                        </Box>

                        {/* Income indicator */}
                        <Box className="absolute bottom-4 right-4 p-2 bg-slate-900/80 rounded-lg">
                            <Typography variant="caption" className="text-gray-400">Daily Income</Typography>
                            <Typography variant="body2" className="text-green-400">
                                +{castle.income.gold}🪙 +{castle.income.resonance}🔮
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Side Panel */}
                <Box className="w-96 bg-slate-800/90 border-l border-slate-700 flex flex-col">
                    {/* Tabs */}
                    <HStack className="border-b border-slate-700">
                        {(['buildings', 'recruit', 'garrison'] as const).map((tab) => (
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
                        {selectedTab === 'buildings' && (
                            <VStack className="gap-4">
                                {selectedBuilding ? (
                                    <Box className="p-4 bg-slate-900 rounded-lg border border-slate-600">
                                        <HStack className="gap-3 mb-3">
                                            <Typography variant="h4" className="text-2xl">
                                                {BUILDING_ICONS[selectedBuilding.type]}
                                            </Typography>
                                            <VStack className="gap-0">
                                                <Typography variant="h5" className="text-white">
                                                    {factionNames[selectedBuilding.type] || selectedBuilding.name}
                                                </Typography>
                                                <Typography variant="caption" className="text-gray-400">
                                                    Level {selectedBuilding.level}/{selectedBuilding.maxLevel}
                                                </Typography>
                                            </VStack>
                                        </HStack>
                                        <Typography variant="body2" className="text-gray-300 mb-4">
                                            {selectedBuilding.description || 'Upgrade to unlock new capabilities.'}
                                        </Typography>
                                        {selectedBuilding.level < selectedBuilding.maxLevel && (
                                            <>
                                                <Typography variant="caption" className="text-gray-500 block mb-1">
                                                    {selectedBuilding.level === 0 ? 'Build Cost:' : 'Upgrade Cost:'}
                                                </Typography>
                                                <CostDisplay cost={selectedBuilding.cost} />
                                                <Button
                                                    onClick={() => onBuild?.(selectedBuilding.id)}
                                                    className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                                                    disabled={!canAfford(resources, selectedBuilding.cost)}
                                                >
                                                    {selectedBuilding.level === 0 ? 'Build' : 'Upgrade'}
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" className="text-gray-500 text-center py-8">
                                        Click a building slot to view details
                                    </Typography>
                                )}
                            </VStack>
                        )}

                        {selectedTab === 'recruit' && (
                            <VStack className="gap-3">
                                {availableUnits.map((unit) => (
                                    <Box
                                        key={unit.id}
                                        className="p-3 bg-slate-900 rounded-lg border border-slate-600"
                                    >
                                        <HStack className="justify-between items-center mb-2">
                                            <HStack className="gap-2 items-center">
                                                <Badge
                                                    variant="default"
                                                    className={cn(
                                                        'text-white',
                                                        unit.tier === 1 && 'bg-gray-600',
                                                        unit.tier === 2 && 'bg-green-600',
                                                        unit.tier === 3 && 'bg-blue-600',
                                                        unit.tier === 4 && 'bg-purple-600'
                                                    )}
                                                >
                                                    T{unit.tier}
                                                </Badge>
                                                <Typography variant="body1" className="text-white">
                                                    {unit.name}
                                                </Typography>
                                            </HStack>
                                            <Typography variant="caption" className="text-gray-400">
                                                {unit.available} available
                                            </Typography>
                                        </HStack>
                                        <CostDisplay cost={unit.cost} />
                                        <HStack className="mt-2 gap-2 items-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setRecruitCounts((p) => ({ ...p, [unit.id]: Math.max(0, (p[unit.id] || 0) - 1) }))}
                                                className="px-2"
                                            >
                                                -
                                            </Button>
                                            <Typography variant="body1" className="text-white w-8 text-center">
                                                {recruitCounts[unit.id] || 0}
                                            </Typography>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setRecruitCounts((p) => ({ ...p, [unit.id]: Math.min(unit.available, (p[unit.id] || 0) + 1) }))}
                                                className="px-2"
                                            >
                                                +
                                            </Button>
                                        </HStack>
                                    </Box>
                                ))}
                                {Object.values(recruitCounts).some((c) => c > 0) && (
                                    <Box className="p-3 bg-amber-900/30 rounded-lg border border-amber-600">
                                        <Typography variant="caption" className="text-amber-400 block mb-2">
                                            Total Cost:
                                        </Typography>
                                        <CostDisplay cost={getRecruitmentCost()} />
                                        <Button
                                            onClick={handleRecruit}
                                            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                                        >
                                            Recruit Units
                                        </Button>
                                    </Box>
                                )}
                            </VStack>
                        )}

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
                                    castle.garrison.map((unit) => (
                                        <Box
                                            key={unit.id}
                                            className="p-3 bg-slate-900 rounded-lg border border-slate-600"
                                        >
                                            <HStack className="justify-between items-center">
                                                <HStack className="gap-2 items-center">
                                                    <Badge
                                                        variant="default"
                                                        className={cn(
                                                            'text-white',
                                                            unit.tier === 1 && 'bg-gray-600',
                                                            unit.tier === 2 && 'bg-green-600',
                                                            unit.tier === 3 && 'bg-blue-600',
                                                            unit.tier === 4 && 'bg-purple-600'
                                                        )}
                                                    >
                                                        T{unit.tier}
                                                    </Badge>
                                                    <Typography variant="body1" className="text-white">
                                                        {unit.name}
                                                    </Typography>
                                                </HStack>
                                                <Typography variant="h5" className="text-amber-400">
                                                    x{unit.count}
                                                </Typography>
                                            </HStack>
                                        </Box>
                                    ))
                                )}
                            </VStack>
                        )}
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
}

export default HoMM3CastleTemplate;
