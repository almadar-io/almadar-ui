/**
 * UnitCard Molecule
 *
 * Displays unit stats panel with health, traits, and attributes.
 * Uses Card, Box, Typography, HealthBar, and TraitIcon components.
 */

import React from 'react';
import {
  cn,
  Box,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Typography,
  Badge,
  HealthBar,
} from '@almadar/ui';
import { TraitIcon, TraitName, TraitState } from '../atoms/TraitIcon';

export interface UnitTrait {
    name: TraitName;
    state: TraitState;
    cooldownTurns?: number;
}

export interface UnitEntity {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    attack?: number;
    defense?: number;
    movement?: number;
    owner: string;
    equippedTraits: UnitTrait[];
    level?: number;
}

export interface UnitCardProps {
    /** The unit entity to display */
    unit: UnitEntity;
    /** Whether the card is selected */
    isSelected?: boolean;
    /** Handler for trait clicks */
    onTraitClick?: (traitName: TraitName) => void;
    /** Handler for card click */
    onClick?: () => void;
    /** Compact mode for in-game display */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function UnitCard({
    unit,
    isSelected = false,
    onTraitClick,
    onClick,
    compact = false,
    className,
}: UnitCardProps): JSX.Element {
    return (
        <Card
            variant={isSelected ? 'elevated' : 'default'}
            className={cn(
                'transition-all duration-200',
                isSelected && 'ring-2 ring-[#fbbf24]',
                onClick && 'cursor-pointer hover:shadow-lg',
                compact && 'p-2',
                className
            )}
            onClick={onClick}
        >
            <CardHeader className={compact ? 'pb-1' : undefined}>
                <Box display="flex" className="items-center justify-between">
                    <Box display="flex" className="items-center gap-2">
                        <Typography variant={compact ? 'body2' : 'h6'} className="font-bold">
                            {unit.name}
                        </Typography>
                        {unit.level && (
                            <Badge variant="secondary" size="sm">
                                Lv.{unit.level}
                            </Badge>
                        )}
                    </Box>
                    <Badge
                        variant={unit.owner === 'player' ? 'primary' : 'danger'}
                        size="sm"
                    >
                        {unit.owner === 'player' ? '🔵' : '🔴'}
                    </Badge>
                </Box>
            </CardHeader>

            <CardContent className={compact ? 'py-1' : undefined}>
                {/* Health Bar */}
                <Box marginY={compact ? 'xs' : 'sm'}>
                    <HealthBar
                        current={unit.health}
                        max={unit.maxHealth}
                        format={compact ? 'bar' : 'hearts'}
                        size={compact ? 'sm' : 'md'}
                    />
                    {!compact && (
                        <Typography variant="caption" className="mt-1 opacity-70">
                            {unit.health} / {unit.maxHealth} HP
                        </Typography>
                    )}
                </Box>

                {/* Stats (non-compact only) */}
                {!compact && (unit.attack || unit.defense || unit.movement) && (
                    <Box display="flex" className="gap-4 mt-2">
                        {unit.attack && (
                            <Box display="flex" className="items-center gap-1">
                                <Typography variant="caption" className="text-[#ef4444]">⚔️</Typography>
                                <Typography variant="body2">{unit.attack}</Typography>
                            </Box>
                        )}
                        {unit.defense && (
                            <Box display="flex" className="items-center gap-1">
                                <Typography variant="caption" className="text-[#3b82f6]">🛡️</Typography>
                                <Typography variant="body2">{unit.defense}</Typography>
                            </Box>
                        )}
                        {unit.movement && (
                            <Box display="flex" className="items-center gap-1">
                                <Typography variant="caption" className="text-[#f59e0b]">👟</Typography>
                                <Typography variant="body2">{unit.movement}</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </CardContent>

            {/* Equipped Traits */}
            {unit.equippedTraits.length > 0 && (
                <CardFooter className={compact ? 'pt-1' : undefined}>
                    <Box display="flex" className="gap-1 flex-wrap">
                        {unit.equippedTraits.map((trait) => (
                            <TraitIcon
                                key={trait.name}
                                traitName={trait.name}
                                state={trait.state}
                                cooldownTurns={trait.cooldownTurns}
                                size={compact ? 'sm' : 'md'}
                                isEquipped
                                onClick={onTraitClick ? () => onTraitClick(trait.name) : undefined}
                            />
                        ))}
                    </Box>
                </CardFooter>
            )}
        </Card>
    );
}

UnitCard.displayName = 'UnitCard';

export default UnitCard;
