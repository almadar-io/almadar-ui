/**
 * GuardDisplay Component
 * 
 * Visual indicator for defense/guard status during combat.
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';
import { cn } from '@almadar/ui';

export interface GuardDisplayProps {
    /** Current defense value */
    defense: number;
    /** Whether guard is active (defending) */
    isGuarding: boolean;
    /** Temporary defense bonus */
    bonus?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
}

const sizeConfig = {
    sm: { icon: 'text-lg', text: 'text-xs', padding: 'p-1' },
    md: { icon: 'text-2xl', text: 'text-sm', padding: 'p-2' },
    lg: { icon: 'text-3xl', text: 'text-base', padding: 'p-3' },
};

export function GuardDisplay({
    defense,
    isGuarding,
    bonus = 0,
    size = 'md',
    className,
}: GuardDisplayProps): JSX.Element {
    const config = sizeConfig[size];
    const totalDefense = defense + bonus;

    return (
        <Box
            display="inline-flex"
            className={cn(
                'items-center gap-1 rounded-lg',
                config.padding,
                isGuarding
                    ? 'bg-blue-500/30 border-2 border-blue-400 animate-pulse'
                    : 'bg-gray-700/50 border border-gray-600',
                className
            )}
        >
            <span className={cn(config.icon, isGuarding ? 'animate-bounce' : '')}>
                🛡️
            </span>
            <Box className="flex flex-col items-center">
                <Typography
                    variant="caption"
                    className={cn(
                        config.text,
                        'font-bold',
                        isGuarding ? 'text-blue-300' : 'text-gray-300'
                    )}
                >
                    {totalDefense}
                </Typography>
                {bonus > 0 && (
                    <Typography variant="caption" className="text-green-400 text-xs">
                        +{bonus}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default GuardDisplay;
