/**
 * BuildingDetailPanel Molecule
 *
 * Displays building details with icon, level, description, cost, and build/upgrade button.
 * Extracted from HoMM3CastleTemplate for reuse in canvas-based castle templates.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Button, cn } from '@almadar/ui';
import { CostDisplay } from '../atoms/CostDisplay';
import {
    CastleBuilding,
    CastleFaction,
    Resources,
    FACTION_BUILDING_NAMES,
    canAfford,
} from '../types';

export interface BuildingDetailPanelProps {
    /** Building data */
    building: CastleBuilding;
    /** Faction for themed names */
    faction: CastleFaction;
    /** Player resources for affordability check */
    resources: Resources;
    /** Build/upgrade handler */
    onBuild?: (buildingId: string) => void;
    /** Additional CSS classes */
    className?: string;
}

/** Building icons by type */
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

/**
 * BuildingDetailPanel - Shows building info with build/upgrade action.
 */
export function BuildingDetailPanel({
    building,
    faction,
    resources,
    onBuild,
    className,
}: BuildingDetailPanelProps): JSX.Element {
    const factionNames = FACTION_BUILDING_NAMES[faction];
    const displayName = factionNames[building.type] || building.name;
    const icon = BUILDING_ICONS[building.type] || '🏗️';
    const canUpgrade = building.level < building.maxLevel;
    const affordable = canAfford(resources, building.cost);

    return (
        <Box className={cn('p-4 bg-slate-900 rounded-lg border border-slate-600', className)}>
            <HStack className="gap-3 mb-3">
                <Typography variant="h4" className="text-2xl">
                    {icon}
                </Typography>
                <VStack className="gap-0">
                    <Typography variant="h5" className="text-white">
                        {displayName}
                    </Typography>
                    <Typography variant="caption" className="text-gray-400">
                        Level {building.level}/{building.maxLevel}
                    </Typography>
                </VStack>
            </HStack>

            <Typography variant="body2" className="text-gray-300 mb-4">
                {building.description || 'Upgrade to unlock new capabilities.'}
            </Typography>

            {canUpgrade && (
                <>
                    <Typography variant="caption" className="text-gray-500 block mb-1">
                        {building.level === 0 ? 'Build Cost:' : 'Upgrade Cost:'}
                    </Typography>
                    <CostDisplay cost={building.cost} />
                    <Button
                        onClick={() => onBuild?.(building.id)}
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                        disabled={!affordable}
                    >
                        {building.level === 0 ? 'Build' : 'Upgrade'}
                    </Button>
                </>
            )}

            {!canUpgrade && (
                <Typography variant="caption" className="text-green-400">
                    Max level reached
                </Typography>
            )}
        </Box>
    );
}

BuildingDetailPanel.displayName = 'BuildingDetailPanel';

export default BuildingDetailPanel;
