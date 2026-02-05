/**
 * BuildingGrid Component
 *
 * Castle building placement UI showing available buildings and their status.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, cn } from '@almadar/ui';
import { Building, BuildingType, ResourceCost, RESOURCE_INFO, canAfford, Resources } from '../types/resources';

export interface BuildingGridProps {
    /** Available buildings */
    buildings: Building[];
    /** Player resources (for affordability check) */
    playerResources: Resources;
    /** Selected building ID */
    selectedId?: string;
    /** Handler when building is clicked */
    onBuildingClick?: (building: Building) => void;
    /** Handler when build button is clicked */
    onBuild?: (building: Building) => void;
    /** Additional CSS classes */
    className?: string;
}

const BUILDING_ICONS: Record<BuildingType, string> = {
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
                        {info.icon} {amount}
                    </Typography>
                );
            })}
        </HStack>
    );
}

function BuildingCard({
    building,
    playerResources,
    selected,
    onClick,
    onBuild,
}: {
    building: Building;
    playerResources: Resources;
    selected: boolean;
    onClick?: () => void;
    onBuild?: () => void;
}): JSX.Element {
    const icon = BUILDING_ICONS[building.type];
    const affordable = canAfford(playerResources, building.cost);
    const isMaxLevel = building.level >= building.maxLevel;
    const isBuilt = building.level > 0;

    return (
        <Box
            className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                'bg-slate-800 hover:bg-slate-700',
                selected && 'ring-2 ring-amber-400 border-amber-500',
                !selected && 'border-slate-600',
                isBuilt && 'border-green-600'
            )}
            onClick={onClick}
        >
            <HStack className="justify-between items-start mb-2">
                <HStack className="gap-2 items-center">
                    <Typography variant="h4" className="text-2xl">
                        {icon}
                    </Typography>
                    <VStack className="gap-0">
                        <Typography variant="h6" className="text-white">
                            {building.name}
                        </Typography>
                        {isBuilt && (
                            <Typography variant="caption" className="text-green-400">
                                Level {building.level}/{building.maxLevel}
                            </Typography>
                        )}
                    </VStack>
                </HStack>
                {isMaxLevel && (
                    <Badge variant="success" size="sm">MAX</Badge>
                )}
            </HStack>

            <Typography variant="body2" className="text-gray-400 mb-3">
                {building.description}
            </Typography>

            {!isMaxLevel && (
                <>
                    <Typography variant="caption" className="text-gray-500 block mb-1">
                        {isBuilt ? 'Upgrade Cost:' : 'Build Cost:'}
                    </Typography>
                    <CostDisplay cost={building.cost} />

                    {onBuild && (
                        <Box
                            className={cn(
                                'mt-3 py-2 rounded text-center font-medium transition-colors',
                                affordable
                                    ? 'bg-amber-500 text-black hover:bg-amber-400 cursor-pointer'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (affordable) onBuild();
                            }}
                        >
                            {isBuilt ? 'Upgrade' : 'Build'}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}

/**
 * BuildingGrid displays a grid of castle buildings.
 */
export function BuildingGrid({
    buildings,
    playerResources,
    selectedId,
    onBuildingClick,
    onBuild,
    className,
}: BuildingGridProps): JSX.Element {
    return (
        <Box className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
            {buildings.map((building) => (
                <BuildingCard
                    key={building.id}
                    building={building}
                    playerResources={playerResources}
                    selected={building.id === selectedId}
                    onClick={() => onBuildingClick?.(building)}
                    onBuild={() => onBuild?.(building)}
                />
            ))}
        </Box>
    );
}

export default BuildingGrid;
