/**
 * TraitPanel Organism
 *
 * Sidebar for managing unit traits - equip, upgrade, view details.
 * Uses Box, Card, Typography, Button, and TraitIcon components.
 */

import React from 'react';
import {
  cn,
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Badge,
} from '@almadar/ui';
import { TraitIcon, TraitName, TraitState } from '../atoms/TraitIcon';
import { UnitEntity, UnitTrait } from '../molecules/UnitCard';

export interface TraitDefinition {
    name: TraitName;
    displayName: string;
    description: string;
    cost?: number;
    requirements?: string;
    maxLevel?: number;
}

export interface TraitPanelProps {
    /** The unit being managed */
    unit: UnitEntity | null;
    /** Available traits to equip */
    availableTraits: TraitDefinition[];
    /** Handler for equipping a trait */
    onEquip?: (traitName: TraitName) => void;
    /** Handler for unequipping a trait */
    onUnequip?: (traitName: TraitName) => void;
    /** Handler for upgrading a trait */
    onUpgrade?: (traitName: TraitName) => void;
    /** Player's available resources for purchasing */
    resources?: number;
    /** Additional CSS classes */
    className?: string;
}

export function TraitPanel({
    unit,
    availableTraits,
    onEquip,
    onUnequip,
    onUpgrade,
    resources = 0,
    className,
}: TraitPanelProps): JSX.Element {
    if (!unit) {
        return (
            <Card className={cn('w-72', className)}>
                <CardContent>
                    <Box display="flex" className="items-center justify-center h-32 opacity-50">
                        <Typography variant="body2">Select a unit to manage traits</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const equippedTraitNames = unit.equippedTraits.map((t) => t.name);
    const unequippedTraits = availableTraits.filter(
        (t) => !equippedTraitNames.includes(t.name)
    );

    return (
        <Card className={cn('w-72', className)}>
            <CardHeader>
                <Box display="flex" className="items-center justify-between">
                    <Typography variant="h6" className="font-bold">
                        Trait Management
                    </Typography>
                    <Badge variant="warning" size="sm">
                        💰 {resources}
                    </Badge>
                </Box>
                <Typography variant="caption" className="opacity-70">
                    {unit.name}
                </Typography>
            </CardHeader>

            <CardContent>
                {/* Equipped Traits */}
                <Box marginY="sm">
                    <Typography variant="body2" className="font-bold mb-2">
                        Equipped Traits
                    </Typography>
                    {unit.equippedTraits.length === 0 ? (
                        <Typography variant="caption" className="opacity-50">
                            No traits equipped
                        </Typography>
                    ) : (
                        <Box className="space-y-2">
                            {unit.equippedTraits.map((trait) => (
                                <Box
                                    key={trait.name}
                                    display="flex"
                                    padding="xs"
                                    rounded="md"
                                    border
                                    className="items-center gap-2 bg-[var(--color-surface)]"
                                >
                                    <TraitIcon
                                        traitName={trait.name}
                                        state={trait.state}
                                        size="md"
                                        showTooltip={false}
                                    />
                                    <Box className="flex-1">
                                        <Typography variant="body2" className="font-bold capitalize">
                                            {trait.name}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onUnequip?.(trait.name)}
                                    >
                                        ✕
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Box className="h-px bg-[var(--color-border)] my-3" />

                {/* Available Traits */}
                <Box marginY="sm">
                    <Typography variant="body2" className="font-bold mb-2">
                        Available Traits
                    </Typography>
                    {unequippedTraits.length === 0 ? (
                        <Typography variant="caption" className="opacity-50">
                            All traits equipped
                        </Typography>
                    ) : (
                        <Box className="space-y-2">
                            {unequippedTraits.map((trait) => {
                                const canAfford = trait.cost === undefined || resources >= trait.cost;

                                return (
                                    <Box
                                        key={trait.name}
                                        display="flex"
                                        padding="xs"
                                        rounded="md"
                                        border
                                        className={cn(
                                            'items-center gap-2',
                                            !canAfford && 'opacity-50'
                                        )}
                                    >
                                        <TraitIcon
                                            traitName={trait.name}
                                            state="ready"
                                            size="md"
                                            showTooltip={false}
                                        />
                                        <Box className="flex-1">
                                            <Typography variant="body2" className="font-bold">
                                                {trait.displayName}
                                            </Typography>
                                            <Typography variant="caption" className="opacity-70">
                                                {trait.description}
                                            </Typography>
                                            {trait.cost !== undefined && (
                                                <Badge variant="warning" size="sm" className="mt-1">
                                                    💰 {trait.cost}
                                                </Badge>
                                            )}
                                        </Box>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={!canAfford}
                                            onClick={() => onEquip?.(trait.name)}
                                        >
                                            +
                                        </Button>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

TraitPanel.displayName = 'TraitPanel';

export default TraitPanel;
