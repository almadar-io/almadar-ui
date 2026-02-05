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
                    'items-center gap-2 p-1 rounded bg-gray-800/80',
                    isSelected && 'ring-2 ring-yellow-400',
                    onClick && 'cursor-pointer hover:bg-gray-700',
                    className
                )}
                onClick={onClick}
            >
                <CharacterSprite type={characterType} team={team} state={spriteState} scale={2} />
                <Typography variant="caption" className="text-white">{name}</Typography>
                <StateIndicator state={state} size="sm" />
            </Box>
        );
    }

    if (variant === 'compact') {
        return (
            <Box
                display="flex"
                className={cn(
                    'flex-col items-center p-2 rounded-lg bg-gray-800 border',
                    isSelected ? 'border-yellow-400' : 'border-gray-600',
                    onClick && 'cursor-pointer hover:border-gray-500',
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
                'flex-col items-center p-3 rounded-lg bg-gray-800 border-2 transition-all duration-200',
                isSelected && 'border-yellow-400 shadow-lg shadow-yellow-400/30',
                isTargetable && !isSelected && 'border-red-400 hover:border-red-300',
                !isSelected && !isTargetable && 'border-gray-600 hover:border-gray-500',
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
                        'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800',
                        team === 'player' && 'bg-blue-500',
                        team === 'enemy' && 'bg-red-500',
                        team === 'neutral' && 'bg-gray-500'
                    )}
                />
            </Box>

            <Typography variant="body2" className="text-white font-medium mb-1 text-center">
                {name}
            </Typography>

            <Box className="w-full">
                <HealthBar current={health} max={maxHealth} size="sm" format="bar" />
                <Typography variant="caption" className="text-gray-400 text-xs text-center block mt-0.5">
                    {health}/{maxHealth}
                </Typography>
            </Box>
        </Box>
    );
}

export default GameUnit;
