/**
 * TurnIndicator Molecule
 *
 * Displays current player turn, turn number, and game phase.
 * Uses Box, Typography, and Badge components.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';
import { Badge } from '../../../components/atoms/Badge';

export type GamePhase = 'deploy' | 'move' | 'action' | 'end';

export interface PlayerInfo {
    id: string;
    name: string;
    color: 'blue' | 'red';
}

export interface TurnIndicatorProps {
    /** Current player info */
    currentPlayer: PlayerInfo;
    /** Current turn number */
    turnNumber: number;
    /** Current game phase */
    phase: GamePhase;
    /** Handler for end turn button (optional) */
    onEndTurn?: () => void;
    /** Whether it's the local player's turn */
    isYourTurn?: boolean;
    /** Time remaining in turn (optional) */
    timeRemaining?: number;
    /** Compact mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const phaseLabels: Record<GamePhase, string> = {
    deploy: 'Deploy',
    move: 'Move',
    action: 'Action',
    end: 'End Turn',
};

const phaseColors: Record<GamePhase, 'primary' | 'warning' | 'success' | 'secondary'> = {
    deploy: 'secondary',
    move: 'warning',
    action: 'success',
    end: 'primary',
};

export function TurnIndicator({
    currentPlayer,
    turnNumber,
    phase,
    onEndTurn,
    isYourTurn = false,
    timeRemaining,
    compact = false,
    className,
}: TurnIndicatorProps): JSX.Element {
    const playerColorClass = currentPlayer.color === 'blue'
        ? 'text-[#3b82f6]'
        : 'text-[#ef4444]';

    const playerBorderClass = currentPlayer.color === 'blue'
        ? 'border-[#3b82f6]'
        : 'border-[#ef4444]';

    return (
        <Box
            display="flex"
            padding={compact ? 'xs' : 'sm'}
            rounded="md"
            border
            bg="surface"
            className={cn(
                'items-center gap-3',
                playerBorderClass,
                isYourTurn && 'animate-pulse',
                className
            )}
        >
            {/* Turn Number */}
            <Box display="flex" className="flex-col items-center">
                <Typography variant="caption" className="opacity-60">
                    Turn
                </Typography>
                <Typography variant={compact ? 'body1' : 'h5'} className="font-bold">
                    {turnNumber}
                </Typography>
            </Box>

            {/* Divider */}
            <Box className="w-px h-8 bg-[var(--color-border)]" />

            {/* Current Player */}
            <Box display="flex" className="flex-col">
                <Typography variant="caption" className="opacity-60">
                    {isYourTurn ? 'Your Turn' : 'Current Player'}
                </Typography>
                <Typography variant={compact ? 'body2' : 'body1'} className={cn('font-bold', playerColorClass)}>
                    {currentPlayer.color === 'blue' ? '🔵' : '🔴'} {currentPlayer.name}
                </Typography>
            </Box>

            {/* Phase */}
            <Badge variant={phaseColors[phase]} size={compact ? 'sm' : 'md'}>
                {phaseLabels[phase]}
            </Badge>

            {/* Time Remaining */}
            {timeRemaining !== undefined && (
                <Box display="flex" className="items-center gap-1">
                    <Typography variant="caption" className="opacity-60">⏱️</Typography>
                    <Typography
                        variant="body2"
                        className={cn(
                            'font-mono font-bold',
                            timeRemaining <= 10 && 'text-[#ef4444] animate-pulse'
                        )}
                    >
                        {timeRemaining}s
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

TurnIndicator.displayName = 'TurnIndicator';

export default TurnIndicator;
