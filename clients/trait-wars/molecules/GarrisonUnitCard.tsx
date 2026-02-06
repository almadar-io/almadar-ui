/**
 * GarrisonUnitCard Molecule
 *
 * Displays a garrison unit with portrait, tier badge, count, and optional transfer.
 * Used in the castle garrison tab and hero army panels.
 */

import React from 'react';
import { Box, Badge, Typography, Button, HStack, cn } from '@almadar/ui';
import { RobotUnitType, useAssetsOptional, getUnitPortraitUrl, DEFAULT_ASSET_MANIFEST } from '../assets';
import type { GarrisonUnit } from '../types';

export interface GarrisonUnitCardProps {
    /** Garrison unit data */
    unit: GarrisonUnit;
    /** Whether this unit is selected */
    isSelected?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Transfer handler (move to/from hero army) */
    onTransfer?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const TIER_COLORS: Record<number, string> = {
    1: 'bg-gray-600',
    2: 'bg-green-600',
    3: 'bg-blue-600',
    4: 'bg-purple-600',
};

/**
 * GarrisonUnitCard - Compact unit display for garrison management.
 */
export function GarrisonUnitCard({
    unit,
    isSelected = false,
    onClick,
    onTransfer,
    className,
}: GarrisonUnitCardProps): JSX.Element {
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const portraitUrl = getUnitPortraitUrl(manifest, unit.spriteId as RobotUnitType);

    return (
        <Box
            className={cn(
                'p-3 bg-slate-900 rounded-lg border transition-all duration-200 cursor-pointer',
                isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'border-slate-600 hover:border-slate-500',
                className
            )}
            onClick={onClick}
        >
            <HStack className="gap-3 items-center">
                {/* Portrait */}
                <Box className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    {portraitUrl ? (
                        <img
                            src={portraitUrl}
                            alt={unit.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Box className="w-full h-full flex items-center justify-center">
                            <Typography variant="caption" className="text-lg">🤖</Typography>
                        </Box>
                    )}
                </Box>

                {/* Name + Tier */}
                <HStack className="gap-2 items-center flex-1">
                    <Badge
                        variant="default"
                        className={cn('text-white', TIER_COLORS[unit.tier] || TIER_COLORS[1])}
                    >
                        T{unit.tier}
                    </Badge>
                    <Typography variant="body2" className="text-white flex-1">
                        {unit.name}
                    </Typography>
                </HStack>

                {/* Count */}
                <Typography variant="h5" className="text-amber-400 font-bold">
                    x{unit.count}
                </Typography>

                {/* Transfer button */}
                {onTransfer && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onTransfer();
                        }}
                        className="text-gray-400 hover:text-white px-2"
                    >
                        ↔
                    </Button>
                )}
            </HStack>
        </Box>
    );
}

GarrisonUnitCard.displayName = 'GarrisonUnitCard';

export default GarrisonUnitCard;
