/**
 * GuardDisplay Component
 * 
 * Visual indicator for defense/guard status during combat.
 */

import React from 'react';
import { Box, Typography, cn } from '@almadar/ui';

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
                    ? 'bg-info/30 border-2 border-info animate-pulse'
                    : 'bg-muted/50 border border-border',
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
                        isGuarding ? 'text-info' : 'text-foreground/80'
                    )}
                >
                    {totalDefense}
                </Typography>
                {bonus > 0 && (
                    <Typography variant="caption" className="text-success text-xs">
                        +{bonus}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default GuardDisplay;
