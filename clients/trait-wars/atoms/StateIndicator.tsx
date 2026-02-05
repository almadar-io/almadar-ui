/**
 * StateIndicator Component
 *
 * Displays a visual indicator for a trait's current state.
 */

import React from 'react';
import { Box, Badge, cn } from '@almadar/ui';

export type TraitState =
    | 'idle' | 'active' | 'attacking' | 'defending' | 'casting' | 'recovering' | 'cooldown'
    | 'enraged' | 'preparing' | 'exhausted' | 'hidden' | 'ready' | 'channeling';

export interface StateIndicatorProps {
    /** The current state */
    state: TraitState | string;
    /** Optional label override */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show animation */
    animated?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const stateConfig: Record<string, { color: string; icon: string; bgClass: string }> = {
    idle: { color: 'gray', icon: '⏸', bgClass: 'bg-gray-500' },
    active: { color: 'green', icon: '▶', bgClass: 'bg-green-500' },
    attacking: { color: 'red', icon: '⚔', bgClass: 'bg-red-500' },
    defending: { color: 'blue', icon: '🛡', bgClass: 'bg-blue-500' },
    casting: { color: 'purple', icon: '✨', bgClass: 'bg-purple-500' },
    recovering: { color: 'yellow', icon: '⏳', bgClass: 'bg-yellow-500' },
    cooldown: { color: 'orange', icon: '🔄', bgClass: 'bg-orange-500' },
    // Additional game states
    enraged: { color: 'red', icon: '🔥', bgClass: 'bg-red-600' },
    preparing: { color: 'cyan', icon: '📖', bgClass: 'bg-cyan-500' },
    exhausted: { color: 'gray', icon: '💤', bgClass: 'bg-gray-400' },
    hidden: { color: 'purple', icon: '👻', bgClass: 'bg-purple-400' },
    ready: { color: 'green', icon: '✓', bgClass: 'bg-green-400' },
    channeling: { color: 'indigo', icon: '🌟', bgClass: 'bg-indigo-500' },
};

// Default config for unknown states
const defaultConfig = { color: 'gray', icon: '?', bgClass: 'bg-gray-500' };

const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
};

export function StateIndicator({
    state,
    label,
    size = 'md',
    animated = true,
    className,
}: StateIndicatorProps): JSX.Element {
    const config = stateConfig[state] || defaultConfig;
    const displayLabel = label || state.charAt(0).toUpperCase() + state.slice(1);

    return (
        <Box
            display="inline-flex"
            className={cn(
                'items-center gap-1 rounded-full text-white font-medium',
                config.bgClass,
                sizeClasses[size],
                animated && state !== 'idle' && 'animate-pulse',
                className
            )}
        >
            <span>{config.icon}</span>
            <span>{displayLabel}</span>
        </Box>
    );
}

export default StateIndicator;
