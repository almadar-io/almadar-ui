/**
 * ResourceBar Component
 *
 * Displays player resources: Gold, Resonance, Trait Shards.
 */

import React from 'react';
import { Box, Typography, HStack, cn } from '@almadar/ui';
import { Resources, ResourceType, RESOURCE_INFO } from '../types/resources';

export interface ResourceBarProps {
    /** Current resources */
    resources: Resources;
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

    return (
        <HStack
            className={cn(
                'items-center rounded-lg border',
                compact ? 'gap-1 px-2 py-1' : 'gap-2 px-3 py-2',
                'bg-slate-800/80 border-slate-600'
            )}
        >
            <Typography variant="body1" className={compact ? 'text-lg' : 'text-xl'}>
                {info.icon}
            </Typography>
            <Typography
                variant={compact ? 'body2' : 'h5'}
                className="font-bold"
                style={{ color: info.color }}
            >
                {amount.toLocaleString()}
            </Typography>
            {!compact && (
                <Typography variant="caption" className="text-gray-400 hidden sm:block">
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
    const coreResources: ResourceType[] = ['gold', 'resonance', 'traitShards'];
    const extendedResources: ResourceType[] = ['wood', 'stone', 'crystal'];

    const getAmount = (type: ResourceType): number => {
        switch (type) {
            case 'gold': return resources.gold;
            case 'resonance': return resources.resonance;
            case 'traitShards': return resources.traitShards;
            case 'wood': return resources.wood ?? 0;
            case 'stone': return resources.stone ?? 0;
            case 'crystal': return resources.crystal ?? 0;
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
