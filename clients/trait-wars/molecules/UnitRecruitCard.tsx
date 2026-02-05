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
    1: 'bg-gray-600',
    2: 'bg-green-600',
    3: 'bg-blue-600',
    4: 'bg-purple-600',
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
                'p-3 bg-slate-900 rounded-lg border border-slate-600',
                'transition-all duration-200 hover:border-slate-500',
                disabled && 'opacity-50',
                className
            )}
        >
            {/* Header: Tier badge + Name + Available count */}
            <HStack className="justify-between items-center mb-2">
                <HStack className="gap-2 items-center">
                    <Badge
                        variant="default"
                        className={cn('text-white', TIER_COLORS[tier] || TIER_COLORS[1])}
                    >
                        T{tier}
                    </Badge>
                    <Typography variant="body1" className="text-white font-semibold">
                        {name}
                    </Typography>
                </HStack>
                <Typography variant="caption" className="text-gray-400">
                    {available} available
                </Typography>
            </HStack>

            {/* Portrait + Stats */}
            <HStack className="gap-3 mb-3">
                {/* Portrait */}
                <Box className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
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
                            <Typography variant="caption" className="text-red-400">⚔️</Typography>
                            <Typography variant="caption" className="text-gray-300">{attack}</Typography>
                        </HStack>
                        <HStack className="gap-1 items-center">
                            <Typography variant="caption" className="text-blue-400">🛡️</Typography>
                            <Typography variant="caption" className="text-gray-300">{defense}</Typography>
                        </HStack>
                    </HStack>
                    <HStack className="gap-4">
                        <HStack className="gap-1 items-center">
                            <Typography variant="caption" className="text-green-400">❤️</Typography>
                            <Typography variant="caption" className="text-gray-300">{health}</Typography>
                        </HStack>
                        {movement !== undefined && (
                            <HStack className="gap-1 items-center">
                                <Typography variant="caption" className="text-amber-400">👟</Typography>
                                <Typography variant="caption" className="text-gray-300">{movement}</Typography>
                            </HStack>
                        )}
                    </HStack>
                </VStack>
            </HStack>

            {/* Cost display */}
            <HStack className="gap-2 mb-3">
                <Badge variant="secondary" className="text-yellow-400 border-yellow-600">
                    💰 {goldCost}
                </Badge>
                {resonanceCost !== undefined && resonanceCost > 0 && (
                    <Badge variant="secondary" className="text-purple-400 border-purple-600">
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
                <Typography variant="body1" className="text-white w-8 text-center">
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
                        className="ml-auto bg-amber-500 hover:bg-amber-400 text-black"
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
