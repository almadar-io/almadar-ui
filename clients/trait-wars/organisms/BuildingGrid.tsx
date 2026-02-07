/**
 * BuildingGrid Component
 *
 * Castle building placement UI showing available buildings and their status.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, cn } from '@almadar/ui';
import { Building, BuildingType, ResourceCost, RESOURCE_INFO, canAfford, Resources } from '../types/resources';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIResourceIconUrl, GameUIResourceIconType } from '../assets';

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
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;

    return (
        <HStack className="gap-2 flex-wrap">
            {Object.entries(cost).map(([type, amount]) => {
                if (!amount) return null;
                const info = RESOURCE_INFO[type as keyof typeof RESOURCE_INFO];
                const iconUrl = getGameUIResourceIconUrl(manifest, type as GameUIResourceIconType);
                return (
                    <Typography key={type} variant="caption" className="text-foreground/80 inline-flex items-center gap-1">
                        {iconUrl
                            ? <img src={iconUrl} alt={type} className="w-4 h-4 inline-block" />
                            : info.icon
                        } {amount}
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
                'bg-card hover:bg-muted',
                selected && 'ring-2 ring-primary border-primary',
                !selected && 'border-border',
                isBuilt && 'border-success'
            )}
            onClick={onClick}
        >
            <HStack className="justify-between items-start mb-2">
                <HStack className="gap-2 items-center">
                    <Typography variant="h4" className="text-2xl">
                        {icon}
                    </Typography>
                    <VStack className="gap-0">
                        <Typography variant="h6" className="text-foreground">
                            {building.name}
                        </Typography>
                        {isBuilt && (
                            <Typography variant="caption" className="text-success">
                                Level {building.level}/{building.maxLevel}
                            </Typography>
                        )}
                    </VStack>
                </HStack>
                {isMaxLevel && (
                    <Badge variant="success" size="sm">MAX</Badge>
                )}
            </HStack>

            <Typography variant="body2" className="text-muted-foreground mb-3">
                {building.description}
            </Typography>

            {!isMaxLevel && (
                <>
                    <Typography variant="caption" className="text-muted-foreground block mb-1">
                        {isBuilt ? 'Upgrade Cost:' : 'Build Cost:'}
                    </Typography>
                    <CostDisplay cost={building.cost} />

                    {onBuild && (
                        <Box
                            className={cn(
                                'mt-3 py-2 rounded text-center font-medium transition-colors',
                                affordable
                                    ? 'bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] cursor-pointer'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
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
