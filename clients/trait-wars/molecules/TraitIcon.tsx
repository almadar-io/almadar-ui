/**
 * TraitIcon Component
 *
 * Visual icon representation for different trait categories.
 */

import React from 'react';
import { Box, cn } from '@almadar/ui';

// Icon mappings for trait categories
const TRAIT_ICONS: Record<string, string> = {
    combat: '⚔️',
    support: '💚',
    utility: '⚙️',
    passive: '✨',
    // Archetype icons
    innocent: '🕊️',
    orphan: '🌑',
    caregiver: '💚',
    hero: '⚔️',
    explorer: '🧭',
    rebel: '🔥',
    lover: '❤️',
    creator: '🎨',
    jester: '🎭',
    sage: '📚',
    magician: '🔮',
    ruler: '👑',
};

const CATEGORY_COLORS: Record<string, string> = {
    combat: '#ef4444',
    support: '#22c55e',
    utility: '#3b82f6',
    passive: '#a855f7',
};

export interface TraitIconProps {
    /** Trait ID or category (combat, support, utility, passive, or archetype) */
    traitId: string;
    /** Size in pixels */
    size?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * TraitIcon renders an icon representing a trait category or archetype.
 */
export function TraitIcon({
    traitId,
    size = 24,
    className,
}: TraitIconProps): JSX.Element {
    const icon = TRAIT_ICONS[traitId.toLowerCase()] || '❓';
    const color = CATEGORY_COLORS[traitId.toLowerCase()] || '#9ca3af';

    return (
        <Box
            display="flex"
            className={cn(
                'items-center justify-center rounded',
                className
            )}
            style={{
                width: size,
                height: size,
                fontSize: size * 0.7,
                backgroundColor: `${color}20`,
                border: `1px solid ${color}40`,
            }}
        >
            <span role="img" aria-label={traitId}>
                {icon}
            </span>
        </Box>
    );
}

export default TraitIcon;
