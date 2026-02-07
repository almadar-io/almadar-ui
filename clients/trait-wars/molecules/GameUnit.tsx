/**
 * GameUnit Component
 *
 * Compact game unit display using new roguelike sprites.
 * Designed for in-grid or sidebar display.
 */

import React from 'react';
import {
  Box,
  Typography,
  HealthBar,
  cn,
} from '@almadar/ui';
import { CharacterSprite, CharacterType } from '../atoms/CharacterSprite';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';

export interface GameUnitProps {
    /** Unit display name */
    name: string;
    /** Character sprite type */
    characterType: CharacterType;
    /** Team ownership */
    team: 'player' | 'enemy' | 'neutral';
    /** Current trait state */
    state: TraitState;
    /** Current health */
    health: number;
    /** Maximum health */
    maxHealth: number;
    /** Whether this unit is selected */
    isSelected?: boolean;
    /** Whether this unit can be targeted */
    isTargetable?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Display variant */
    variant?: 'card' | 'compact' | 'inline';
    /** Additional CSS classes */
    className?: string;
}

export function GameUnit({
    name,
    characterType,
    team,
    state,
    health,
    maxHealth,
    isSelected = false,
    isTargetable = false,
    onClick,
    variant = 'card',
    className,
}: GameUnitProps): JSX.Element {
    const spriteState = state === 'attacking' ? 'attacking' :
        state === 'defending' ? 'defending' :
            state === 'casting' ? 'casting' :
                state === 'recovering' || state === 'cooldown' ? 'wounded' : 'idle';

    if (variant === 'inline') {
        return (
            <Box
                display="inline-flex"
                className={cn(
                    'items-center gap-2 p-1 rounded bg-card/80',
                    isSelected && 'ring-2 ring-primary',
                    onClick && 'cursor-pointer hover:bg-muted',
                    className
                )}
                onClick={onClick}
            >
                <CharacterSprite type={characterType} team={team} state={spriteState} scale={2} />
                <Typography variant="caption" className="text-foreground">{name}</Typography>
                <StateIndicator state={state} size="sm" />
            </Box>
        );
    }

    if (variant === 'compact') {
        return (
            <Box
                display="flex"
                className={cn(
                    'flex-col items-center p-2 rounded-lg bg-card border',
                    isSelected ? 'border-primary' : 'border-border',
                    onClick && 'cursor-pointer hover:border-muted-foreground',
                    className
                )}
                onClick={onClick}
            >
                <CharacterSprite type={characterType} team={team} state={spriteState} scale={3} />
                <Box className="w-full mt-1">
                    <HealthBar current={health} max={maxHealth} format="bar" size="sm" />
                </Box>
            </Box>
        );
    }

    // Default card variant
    return (
        <Box
            display="flex"
            className={cn(
                'flex-col items-center p-3 rounded-lg bg-card border-2 transition-all duration-200',
                isSelected && 'border-primary shadow-lg shadow-primary/30',
                isTargetable && !isSelected && 'border-error hover:border-error/80',
                !isSelected && !isTargetable && 'border-border hover:border-muted-foreground',
                onClick && 'cursor-pointer hover:scale-105',
                className
            )}
            onClick={onClick}
        >
            <StateIndicator state={state} size="sm" className="mb-2" />

            <Box className="relative mb-2">
                <CharacterSprite type={characterType} team={team} state={spriteState} scale={4} />
                <Box
                    className={cn(
                        'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-card',
                        team === 'player' && 'bg-[var(--tw-faction-resonator)]',
                        team === 'enemy' && 'bg-[var(--tw-faction-dominion)]',
                        team === 'neutral' && 'bg-[var(--tw-faction-neutral)]'
                    )}
                />
            </Box>

            <Typography variant="body2" className="text-foreground font-medium mb-1 text-center">
                {name}
            </Typography>

            <Box className="w-full">
                <HealthBar current={health} max={maxHealth} size="sm" format="bar" />
                <Typography variant="caption" className="text-muted-foreground text-xs text-center block mt-0.5">
                    {health}/{maxHealth}
                </Typography>
            </Box>
        </Box>
    );
}

export default GameUnit;
