/**
 * CostDisplay Atom
 *
 * Renders resource cost as icon + amount pairs.
 * Extracted from HoMM3CastleTemplate for reuse across castle/building UI.
 */

import React from 'react';
import { HStack, Typography, cn } from '@almadar/ui';
import { ResourceCost, RESOURCE_INFO } from '../types';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIResourceIconUrl, GameUIResourceIconType } from '../assets';

export interface CostDisplayProps {
    /** Resource cost to display */
    cost: ResourceCost;
    /** Additional CSS classes */
    className?: string;
}

/**
 * CostDisplay - Inline resource cost with icons.
 */
export function CostDisplay({ cost, className }: CostDisplayProps): JSX.Element {
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;

    return (
        <HStack className={cn('gap-2 flex-wrap', className)}>
            {Object.entries(cost).map(([type, amount]) => {
                if (!amount) return null;
                const info = RESOURCE_INFO[type as keyof typeof RESOURCE_INFO];
                const iconUrl = getGameUIResourceIconUrl(manifest, type as GameUIResourceIconType);
                return (
                    <Typography key={type} variant="caption" className="text-foreground/80 inline-flex items-center gap-1">
                        {iconUrl
                            ? <img src={iconUrl} alt={type} className="w-4 h-4 inline-block" />
                            : (info?.icon || '•')
                        } {amount}
                    </Typography>
                );
            })}
        </HStack>
    );
}

CostDisplay.displayName = 'CostDisplay';

export default CostDisplay;
