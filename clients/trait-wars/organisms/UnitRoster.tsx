/**
 * UnitRoster Component
 *
 * Grid of recruitable units for army composition.
 * Displays unit cards with stats and selection state.
 */

import React from 'react';
import { Box, Typography, HStack, VStack, Badge, cn } from '@almadar/ui';
import { PixelCharacterSprite } from '../atoms/PixelCharacterSprite';

export interface UnitData {
    id: string;
    name: string;
    characterType: string;
    team: 'player' | 'enemy' | 'neutral';
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    movement: number;
    cost?: number;
    available?: number;
}

export interface UnitRosterProps {
    /** List of available units */
    units: UnitData[];
    /** Currently selected unit IDs */
    selectedIds?: string[];
    /** Maximum number of selectable units */
    maxSelect?: number;
    /** Columns in the grid */
    columns?: 2 | 3 | 4 | 5;
    /** Show unit costs */
    showCost?: boolean;
    /** Show availability count */
    showAvailability?: boolean;
    /** Handler when unit is selected */
    onSelect?: (unit: UnitData) => void;
    /** Handler when unit is deselected */
    onDeselect?: (unit: UnitData) => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * UnitRoster displays a grid of recruitable units for army building.
 */
export function UnitRoster({
    units,
    selectedIds = [],
    maxSelect,
    columns = 4,
    showCost = true,
    showAvailability = true,
    onSelect,
    onDeselect,
    className,
}: UnitRosterProps): JSX.Element {
    const isAtMaxSelect = maxSelect !== undefined && selectedIds.length >= maxSelect;

    const handleUnitClick = (unit: UnitData) => {
        const isSelected = selectedIds.includes(unit.id);
        if (isSelected) {
            onDeselect?.(unit);
        } else if (!isAtMaxSelect) {
            onSelect?.(unit);
        }
    };

    return (
        <Box
            className={cn(
                'grid gap-3 p-4 bg-slate-900/80 rounded-lg border border-slate-700',
                className
            )}
            style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
        >
            {units.map((unit) => {
                const isSelected = selectedIds.includes(unit.id);
                const isDisabled = !isSelected && isAtMaxSelect;

                return (
                    <Box
                        key={unit.id}
                        className={cn(
                            'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                            isSelected
                                ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/30'
                                : 'border-slate-600 bg-slate-800/50',
                            isDisabled && 'opacity-50 cursor-not-allowed',
                            !isDisabled && !isSelected && 'hover:border-slate-500 hover:bg-slate-800'
                        )}
                        onClick={() => !isDisabled && handleUnitClick(unit)}
                    >
                        {/* Unit Sprite & Name */}
                        <VStack align="center" gap={2}>
                            <PixelCharacterSprite
                                type={unit.characterType}
                                team={unit.team}
                                scale={2}
                            />
                            <Typography variant="body2" weight="semibold" className="text-white text-center">
                                {unit.name}
                            </Typography>
                        </VStack>

                        {/* Stats */}
                        <HStack justify="center" gap={3} className="mt-2">
                            <VStack align="center" gap={0}>
                                <Typography variant="caption" className="text-red-400">⚔️</Typography>
                                <Typography variant="caption" className="text-gray-300">{unit.attack}</Typography>
                            </VStack>
                            <VStack align="center" gap={0}>
                                <Typography variant="caption" className="text-blue-400">🛡️</Typography>
                                <Typography variant="caption" className="text-gray-300">{unit.defense}</Typography>
                            </VStack>
                            <VStack align="center" gap={0}>
                                <Typography variant="caption" className="text-green-400">❤️</Typography>
                                <Typography variant="caption" className="text-gray-300">{unit.health}</Typography>
                            </VStack>
                        </HStack>

                        {/* Cost & Availability */}
                        <HStack justify="center" gap={2} className="mt-2">
                            {showCost && unit.cost !== undefined && (
                                <Badge variant="outlined" colorScheme="yellow" size="sm">
                                    💰 {unit.cost}
                                </Badge>
                            )}
                            {showAvailability && unit.available !== undefined && (
                                <Badge variant="outlined" colorScheme="gray" size="sm">
                                    x{unit.available}
                                </Badge>
                            )}
                        </HStack>

                        {/* Selection indicator */}
                        {isSelected && (
                            <Box className="mt-2 text-center">
                                <Badge variant="solid" colorScheme="green" size="sm">
                                    ✓ Selected
                                </Badge>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

export default UnitRoster;
