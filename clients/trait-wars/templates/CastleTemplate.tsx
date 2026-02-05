/**
 * CastleTemplate Component
 *
 * Castle management screen: build structures, recruit units.
 */

import React, { useState } from 'react';
import { Box, Typography, HStack, VStack, Badge, cn } from '@almadar/ui';
import { ResourceBar } from '../molecules/ResourceBar';
import { BuildingGrid } from '../organisms/BuildingGrid';
import { Resources, Building, CastleData, canAfford, spendResources } from '../types/resources';

export interface CastleTemplateProps {
    /** Castle data */
    castle: CastleData;
    /** Player resources */
    resources: Resources;
    /** Handler when building is constructed/upgraded */
    onBuild?: (building: Building, newResources: Resources) => void;
    /** Handler for recruiting units */
    onRecruit?: (unitType: string, count: number) => void;
    /** Handler to exit castle */
    onExit?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * CastleTemplate displays the castle management interface.
 */
export function CastleTemplate({
    castle,
    resources,
    onBuild,
    onRecruit,
    onExit,
    className,
}: CastleTemplateProps): JSX.Element {
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [currentResources, setCurrentResources] = useState(resources);

    const handleBuild = (building: Building) => {
        if (canAfford(currentResources, building.cost)) {
            const newResources = spendResources(currentResources, building.cost);
            setCurrentResources(newResources);
            onBuild?.(building, newResources);
        }
    };

    return (
        <Box
            className={cn(
                'min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
                className
            )}
        >
            {/* Top Bar */}
            <Box className="p-4 bg-slate-900/80 border-b border-slate-700">
                <HStack justify="between" className="max-w-6xl mx-auto">
                    <HStack className="gap-4 items-center">
                        <Typography variant="h4" className="text-2xl">🏰</Typography>
                        <VStack className="gap-0">
                            <Typography variant="h4" className="text-white">
                                {castle.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400">
                                Defense: {castle.defense} | Garrison: {castle.garrisonSize}/{castle.maxGarrison}
                            </Typography>
                        </VStack>
                    </HStack>
                    <HStack className="gap-4 items-center">
                        <ResourceBar resources={currentResources} compact />
                        <Box
                            className="px-4 py-2 bg-slate-600 text-white font-medium rounded-lg cursor-pointer hover:bg-slate-500 transition-colors"
                            onClick={onExit}
                        >
                            Exit Castle
                        </Box>
                    </HStack>
                </HStack>
            </Box>

            {/* Main Content */}
            <Box className="max-w-6xl mx-auto p-6">
                <HStack className="gap-6 items-start">
                    {/* Buildings Section */}
                    <Box className="flex-1">
                        <Typography variant="h4" className="text-white mb-4">
                            Buildings
                        </Typography>
                        <BuildingGrid
                            buildings={castle.buildings}
                            playerResources={currentResources}
                            selectedId={selectedBuilding?.id}
                            onBuildingClick={setSelectedBuilding}
                            onBuild={handleBuild}
                        />
                    </Box>

                    {/* Info Panel */}
                    <Box className="w-80">
                        {/* Selected Building Details */}
                        {selectedBuilding && (
                            <Box className="p-4 bg-slate-800 rounded-lg border border-amber-500/50 mb-6">
                                <Typography variant="h5" className="text-amber-400 mb-2">
                                    {selectedBuilding.name}
                                </Typography>
                                <Typography variant="body2" className="text-gray-300 mb-4">
                                    {selectedBuilding.description}
                                </Typography>
                                {selectedBuilding.level > 0 && (
                                    <Badge variant="success" className="mb-2">
                                        Level {selectedBuilding.level}/{selectedBuilding.maxLevel}
                                    </Badge>
                                )}
                                {selectedBuilding.income && (
                                    <Box className="mt-4 p-2 bg-green-900/30 rounded border border-green-600/50">
                                        <Typography variant="caption" className="text-green-400">
                                            Income per turn:
                                        </Typography>
                                        <Typography variant="body2" className="text-white">
                                            🪙 +{selectedBuilding.income.gold} | 🔮 +{selectedBuilding.income.resonance}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Garrison */}
                        <Box className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                            <Typography variant="h5" className="text-white mb-3">
                                Garrison
                            </Typography>
                            <Box className="h-32 flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
                                <Typography variant="body2" className="text-gray-500">
                                    {castle.garrisonSize > 0
                                        ? `${castle.garrisonSize} units stationed`
                                        : 'No units stationed'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </HStack>
            </Box>
        </Box>
    );
}

export default CastleTemplate;
