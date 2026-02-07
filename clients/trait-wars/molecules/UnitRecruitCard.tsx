/**
 * UnitRecruitCard Molecule
 *
 * Displays a recruitable unit with portrait, stats, cost, and recruit controls.
 * Used in the castle recruitment panel.
 */

import React from 'react';
import { Box, Badge, Typography, Button, HStack, VStack, cn } from '@almadar/ui';
import { RobotUnitType, useAssetsOptional, getUnitPortraitUrl, DEFAULT_ASSET_MANIFEST } from '../assets';

export interface UnitRecruitCardProps {
    /** Unit ID */
    id: string;
    /** Unit name */
    name: string;
    /** Robot unit type for portrait lookup */
    unitType: RobotUnitType;
    /** Unit tier (1-4) */
    tier: number;
    /** Attack stat */
    attack: number;
    /** Defense stat */
    defense: number;
    /** Health stat */
    health: number;
    /** Movement stat */
    movement?: number;
    /** Gold cost */
    goldCost: number;
    /** Resonance cost (optional) */
    resonanceCost?: number;
    /** Number available to recruit */
    available: number;
    /** Current recruit count selected */
    recruitCount?: number;
    /** Handler for increment recruit count */
    onIncrement?: () => void;
    /** Handler for decrement recruit count */
    onDecrement?: () => void;
    /** Handler for recruit action */
    onRecruit?: () => void;
    /** Whether recruiting is disabled (e.g., can't afford) */
    disabled?: boolean;
    /** Custom CSS classes */
    className?: string;
    /** Fallback icon if no portrait */
    fallbackIcon?: string;
}

const TIER_COLORS: Record<number, string> = {
    1: 'bg-[var(--tw-tier-1)]',
    2: 'bg-[var(--tw-tier-2)]',
    3: 'bg-[var(--tw-tier-3)]',
    4: 'bg-[var(--tw-tier-4)]',
};

/**
 * UnitRecruitCard - Displays a unit for recruitment with portrait and stats.
 */
export function UnitRecruitCard({
    id,
    name,
    unitType,
    tier,
    attack,
    defense,
    health,
    movement,
    goldCost,
    resonanceCost,
    available,
    recruitCount = 0,
    onIncrement,
    onDecrement,
    onRecruit,
    disabled = false,
    className,
    fallbackIcon = '🤖',
}: UnitRecruitCardProps): JSX.Element {
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const portraitUrl = getUnitPortraitUrl(manifest, unitType);

    return (
        <Box
            className={cn(
                'p-3 bg-background rounded-lg border border-border',
                'transition-all duration-200 hover:border-muted-foreground',
                disabled && 'opacity-50',
                className
            )}
        >
            {/* Header: Tier badge + Name + Available count */}
            <HStack className="justify-between items-center mb-2">
                <HStack className="gap-2 items-center">
                    <Badge
                        variant="default"
                        className={cn('text-foreground', TIER_COLORS[tier] || TIER_COLORS[1])}
                    >
                        T{tier}
                    </Badge>
                    <Typography variant="body1" className="text-foreground font-semibold">
                        {name}
                    </Typography>
                </HStack>
                <Typography variant="caption" className="text-muted-foreground">
                    {available} available
                </Typography>
            </HStack>

            {/* Portrait + Stats */}
            <HStack className="gap-3 mb-3">
                {/* Portrait */}
                <Box className="w-16 h-16 rounded-lg overflow-hidden bg-card border border-border flex-shrink-0">
                    {portraitUrl ? (
                        <img
                            src={portraitUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Box className="w-full h-full flex items-center justify-center">
                            <Typography variant="h4" className="text-3xl">
                                {fallbackIcon}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Stats Grid */}
                <VStack className="flex-1 gap-1">
                    <HStack className="gap-4">
                        <HStack className="gap-1 items-center">
                            <Typography variant="caption" className="text-error">⚔️</Typography>
                            <Typography variant="caption" className="text-foreground/80">{attack}</Typography>
                        </HStack>
                        <HStack className="gap-1 items-center">
                            <Typography variant="caption" className="text-info">🛡️</Typography>
                            <Typography variant="caption" className="text-foreground/80">{defense}</Typography>
                        </HStack>
                    </HStack>
                    <HStack className="gap-4">
                        <HStack className="gap-1 items-center">
                            <Typography variant="caption" className="text-success">❤️</Typography>
                            <Typography variant="caption" className="text-foreground/80">{health}</Typography>
                        </HStack>
                        {movement !== undefined && (
                            <HStack className="gap-1 items-center">
                                <Typography variant="caption" className="text-primary">👟</Typography>
                                <Typography variant="caption" className="text-foreground/80">{movement}</Typography>
                            </HStack>
                        )}
                    </HStack>
                </VStack>
            </HStack>

            {/* Cost display */}
            <HStack className="gap-2 mb-3">
                <Badge variant="secondary" className="text-primary border-primary">
                    💰 {goldCost}
                </Badge>
                {resonanceCost !== undefined && resonanceCost > 0 && (
                    <Badge variant="secondary" className="text-[var(--tw-faction-resonator)] border-[var(--tw-faction-resonator)]">
                        🔮 {resonanceCost}
                    </Badge>
                )}
            </HStack>

            {/* Recruit Controls */}
            <HStack className="gap-2 items-center">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onDecrement}
                    disabled={disabled || recruitCount <= 0}
                    className="px-2"
                >
                    -
                </Button>
                <Typography variant="body1" className="text-foreground w-8 text-center">
                    {recruitCount}
                </Typography>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onIncrement}
                    disabled={disabled || recruitCount >= available}
                    className="px-2"
                >
                    +
                </Button>
                {recruitCount > 0 && onRecruit && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onRecruit}
                        disabled={disabled}
                        className="ml-auto bg-primary hover:bg-[var(--color-primary-hover)] text-primary-foreground"
                    >
                        Recruit
                    </Button>
                )}
            </HStack>
        </Box>
    );
}

UnitRecruitCard.displayName = 'UnitRecruitCard';

export default UnitRecruitCard;
