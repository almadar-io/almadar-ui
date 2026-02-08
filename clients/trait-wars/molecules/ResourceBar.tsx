/**
 * ResourceBar Component
 *
 * Displays player resources: Gold, Resonance, Trait Shards.
 */

import React from 'react';
import { Box, Typography, HStack, cn } from '@almadar/ui';
import { Resources, ResourceType, RESOURCE_INFO } from '../types/resources';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIResourceIconUrl, GameUIResourceIconType } from '../assets';

export interface ResourceBarProps {
    /** Current resources - either a Resources object with values, or a string[] of resource names to display (values default to 0) */
    resources: Resources | string[];
    /** Whether to show extended resources (wood, stone, crystal) */
    showExtended?: boolean;
    /** Whether bar is compact */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}

interface ResourceItemProps {
    type: ResourceType;
    amount: number;
    compact?: boolean;
}

function ResourceItem({ type, amount, compact }: ResourceItemProps): JSX.Element {
    const info = RESOURCE_INFO[type];
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const iconUrl = getGameUIResourceIconUrl(manifest, type as GameUIResourceIconType);

    return (
        <HStack
            className={cn(
                'items-center rounded-lg border',
                compact ? 'gap-1 px-2 py-1' : 'gap-2 px-3 py-2',
                'bg-card/80 border-border'
            )}
        >
            {iconUrl
                ? <img src={iconUrl} alt={info.name} className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
                : <Typography variant="body1" className={compact ? 'text-lg' : 'text-xl'}>
                    {info.icon}
                </Typography>
            }
            <Typography
                variant={compact ? 'body2' : 'h5'}
                className="font-bold"
                style={{ color: info.color }}
            >
                {amount.toLocaleString()}
            </Typography>
            {!compact && (
                <Typography variant="caption" className="text-muted-foreground hidden sm:block">
                    {info.name}
                </Typography>
            )}
        </HStack>
    );
}

/**
 * ResourceBar displays the player's current resources.
 */
export function ResourceBar({
    resources,
    showExtended = false,
    compact = false,
    className,
}: ResourceBarProps): JSX.Element {
    // Normalize resources: if string[], convert to display-only Resources with 0 values
    const normalizedResources: Resources = Array.isArray(resources)
        ? { gold: 0, resonance: 0, traitShards: 0, ...Object.fromEntries(resources.map(r => [r, 0])) } as Resources
        : resources;

    const coreResources: ResourceType[] = Array.isArray(resources)
        ? resources.filter((r): r is ResourceType => ['gold', 'resonance', 'traitShards', 'wood', 'stone', 'crystal'].includes(r))
        : ['gold', 'resonance', 'traitShards'];
    const extendedResources: ResourceType[] = Array.isArray(resources) ? [] : ['wood', 'stone', 'crystal'];

    const getAmount = (type: ResourceType): number => {
        switch (type) {
            case 'gold': return normalizedResources.gold;
            case 'resonance': return normalizedResources.resonance;
            case 'traitShards': return normalizedResources.traitShards;
            case 'wood': return normalizedResources.wood ?? 0;
            case 'stone': return normalizedResources.stone ?? 0;
            case 'crystal': return normalizedResources.crystal ?? 0;
        }
    };

    return (
        <HStack
            className={cn(
                'flex-wrap',
                compact ? 'gap-2' : 'gap-3',
                className
            )}
        >
            {coreResources.map((type) => (
                <ResourceItem
                    key={type}
                    type={type}
                    amount={getAmount(type)}
                    compact={compact}
                />
            ))}
            {showExtended && extendedResources.map((type) => {
                const amount = getAmount(type);
                if (amount === 0) return null;
                return (
                    <ResourceItem
                        key={type}
                        type={type}
                        amount={amount}
                        compact={compact}
                    />
                );
            })}
        </HStack>
    );
}

export default ResourceBar;
