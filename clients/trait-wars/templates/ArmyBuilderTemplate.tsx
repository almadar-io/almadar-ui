/**
 * ArmyBuilderTemplate Component
 *
 * Full army composition screen with unit recruitment and squad assignment.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, Button, cn } from '@almadar/ui';
import { HeroAvatar } from '../atoms/HeroAvatar';
import { UnitRoster, UnitData } from '../organisms/UnitRoster';

export interface SquadData {
    id: string;
    name: string;
    heroId?: string;
    heroName?: string;
    heroLevel?: number;
    heroArchetype?: string;
    units: UnitData[];
    maxUnits: number;
}

export interface ArmyBuilderTemplateProps {
    /** Available units for recruitment */
    availableUnits: UnitData[];
    /** Current squads in the army */
    squads: SquadData[];
    /** Player's gold/resources */
    gold: number;
    /** Maximum squads allowed */
    maxSquads?: number;
    /** Handler when unit is added to squad */
    onAddUnit?: (unit: UnitData, squadId: string) => void;
    /** Handler when unit is removed from squad */
    onRemoveUnit?: (unitId: string, squadId: string) => void;
    /** Handler to create new squad */
    onCreateSquad?: () => void;
    /** Handler to deploy army */
    onDeploy?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ArmyBuilderTemplate is the main screen for composing armies before battle.
 */
export function ArmyBuilderTemplate({
    availableUnits,
    squads,
    gold,
    maxSquads = 4,
    onAddUnit,
    onRemoveUnit,
    onCreateSquad,
    onDeploy,
    className,
}: ArmyBuilderTemplateProps): JSX.Element {
    const totalUnits = squads.reduce((sum, squad) => sum + squad.units.length, 0);
    const canCreateSquad = squads.length < maxSquads;

    return (
        <Box
            className={cn(
                'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6',
                className
            )}
        >
            {/* Header */}
            <HStack justify="between" className="mb-6">
                <VStack gap="1">
                    <Typography variant="h2" className="text-white">Army Builder</Typography>
                    <Typography variant="body2" className="text-gray-400">
                        Assemble your forces for battle
                    </Typography>
                </VStack>
                <HStack gap="4">
                    <Badge variant="subtle" colorScheme="yellow" size="lg" className="px-4 py-2">
                        💰 {gold} Gold
                    </Badge>
                    <Badge variant="subtle" colorScheme="blue" size="lg" className="px-4 py-2">
                        🎖️ {totalUnits} Units
                    </Badge>
                    {onDeploy && (
                        <Button colorScheme="green" size="lg" onClick={onDeploy}>
                            ⚔️ Deploy Army
                        </Button>
                    )}
                </HStack>
            </HStack>

            <div className="grid grid-cols-12 gap-6">
                {/* Unit Roster (Left) */}
                <Box className="col-span-5">
                    <Typography variant="h4" className="text-white mb-4">Available Units</Typography>
                    <UnitRoster
                        units={availableUnits}
                        columns={2}
                        showCost
                        showAvailability
                        onSelect={(unit) => {
                            // Add to first squad with space
                            const availableSquad = squads.find(s => s.units.length < s.maxUnits);
                            if (availableSquad) {
                                onAddUnit?.(unit, availableSquad.id);
                            }
                        }}
                    />
                </Box>

                {/* Squads (Right) */}
                <Box className="col-span-7">
                    <HStack justify="between" className="mb-4">
                        <Typography variant="h4" className="text-white">Your Squads</Typography>
                        {canCreateSquad && onCreateSquad && (
                            <Button variant="outline" size="sm" onClick={onCreateSquad}>
                                + New Squad
                            </Button>
                        )}
                    </HStack>

                    <VStack gap="4">
                        {squads.map((squad) => (
                            <SquadCard
                                key={squad.id}
                                squad={squad}
                                onRemoveUnit={(unitId) => onRemoveUnit?.(unitId, squad.id)}
                            />
                        ))}

                        {squads.length === 0 && (
                            <Box className="p-8 border-2 border-dashed border-slate-600 rounded-lg text-center">
                                <Typography variant="body1" className="text-gray-500">
                                    No squads created yet. Click "New Squad" to get started.
                                </Typography>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </div>
        </Box>
    );
}

function SquadCard({ squad, onRemoveUnit }: { squad: SquadData; onRemoveUnit?: (unitId: string) => void }) {
    return (
        <Box className="p-4 bg-slate-800/70 rounded-lg border border-slate-600">
            <HStack justify="between" className="mb-3">
                <HStack gap="3">
                    {squad.heroId && (
                        <HeroAvatar
                            heroId={squad.heroId}
                            name={squad.heroName}
                            level={squad.heroLevel}
                            archetype={squad.heroArchetype as any}
                            size="sm"
                        />
                    )}
                    <VStack gap="0">
                        <Typography variant="h5" className="text-white">{squad.name}</Typography>
                        <Typography variant="caption" className="text-gray-400">
                            {squad.units.length}/{squad.maxUnits} units
                        </Typography>
                    </VStack>
                </HStack>
                <Badge variant="subtle" colorScheme={squad.units.length === squad.maxUnits ? 'green' : 'gray'}>
                    {squad.units.length === squad.maxUnits ? 'Full' : 'Open'}
                </Badge>
            </HStack>

            {squad.units.length > 0 ? (
                <HStack gap="2" wrap="wrap">
                    {squad.units.map((unit) => (
                        <Box
                            key={unit.id}
                            className="px-2 py-1 bg-slate-700 rounded flex items-center gap-2 cursor-pointer hover:bg-slate-600 transition-colors"
                            onClick={() => onRemoveUnit?.(unit.id)}
                        >
                            <Typography variant="caption" className="text-white">{unit.name}</Typography>
                            <Typography variant="caption" className="text-red-400">×</Typography>
                        </Box>
                    ))}
                </HStack>
            ) : (
                <Typography variant="caption" className="text-gray-500">
                    Empty squad - add units from the roster
                </Typography>
            )}
        </Box>
    );
}

export default ArmyBuilderTemplate;
