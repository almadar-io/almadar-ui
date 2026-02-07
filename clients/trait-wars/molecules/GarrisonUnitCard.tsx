/**
 * GarrisonUnitCard Molecule
 *
 * Displays a garrison unit with portrait, tier badge, count, and optional transfer.
 * Used in the castle garrison tab and hero army panels.
 */

import React from 'react';
import { Box, Badge, Typography, Button, HStack, cn } from '@almadar/ui';
import { RobotUnitType, useAssetsOptional, getUnitPortraitUrl, getGameUIBadgeUrl, GameUIBadgeType, DEFAULT_ASSET_MANIFEST } from '../assets';
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
    1: 'bg-[var(--tw-tier-1)]',
    2: 'bg-[var(--tw-tier-2)]',
    3: 'bg-[var(--tw-tier-3)]',
    4: 'bg-[var(--tw-tier-4)]',
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
    const badgeUrl = getGameUIBadgeUrl(manifest, `tier${unit.tier}` as GameUIBadgeType);

    return (
        <Box
            className={cn(
                'p-3 bg-background rounded-lg border transition-all duration-200 cursor-pointer',
                isSelected
                    ? 'border-accent ring-2 ring-accent/30'
                    : 'border-border hover:border-border',
                className
            )}
            onClick={onClick}
        >
            <HStack className="gap-3 items-center">
                {/* Portrait */}
                <Box className="w-10 h-10 rounded-lg overflow-hidden bg-card border border-border flex-shrink-0">
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
                    {badgeUrl
                        ? <img src={badgeUrl} alt={`Tier ${unit.tier}`} className="w-6 h-6 object-contain" />
                        : <Badge
                            variant="default"
                            className={cn('text-foreground', TIER_COLORS[unit.tier] || TIER_COLORS[1])}
                        >
                            T{unit.tier}
                        </Badge>
                    }
                    <Typography variant="body2" className="text-foreground flex-1">
                        {unit.name}
                    </Typography>
                </HStack>

                {/* Count */}
                <Typography variant="h5" className="text-primary font-bold">
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
                        className="text-muted-foreground hover:text-foreground px-2"
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
