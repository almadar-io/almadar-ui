/**
 * TopDownShooterTemplate
 *
 * Thin template wrapper: titled header + TopDownShooterBoard.
 * All game state is driven by the entity prop (passed through from the orbital trait).
 */

import React from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import type { TemplateProps } from '../../core/templates/types';
import { TopDownShooterBoard } from './TopDownShooterBoard';
import type {
    TopDownShooterBoardProps,
    ShooterPlayer,
    ShooterEnemy,
    ShooterProjectile,
} from './TopDownShooterBoard';

/** Narrow a template entity union to a single EntityRow without a cast. */
function isEntityRow(value: TopDownShooterTemplateProps['entity']): value is EntityRow {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export interface TopDownShooterTemplateProps extends TemplateProps {
    title?: string;
    player?: ShooterPlayer;
    enemies?: ShooterEnemy[];
    projectiles?: ShooterProjectile[];
    score?: number;
    wave?: number;
    lives?: number;
    result?: 'none' | 'won' | 'lost';
    assetManifest?: TopDownShooterBoardProps['assetManifest'];
    width?: number;
    height?: number;
    spriteSize?: number;
    moveEvent?: EventEmit<{ dx: number; dy: number }>;
    fireEvent?: EventEmit<{ tx: number; ty: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

export function TopDownShooterTemplate({
    entity,
    title = 'Arena Shooter',
    player,
    enemies,
    projectiles,
    score,
    wave,
    lives,
    result,
    assetManifest,
    width,
    height,
    spriteSize,
    moveEvent,
    fireEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: TopDownShooterTemplateProps): React.JSX.Element {
    const resolved = isEntityRow(entity) ? entity : undefined;

    return (
        <Box
            display="flex"
            fullHeight
            className={cn('top-down-shooter-template flex-col', className)}
        >
            {/* Header */}
            <HStack
                gap="sm"
                align="center"
                className="px-4 py-3 border-b-2 border-border bg-surface shrink-0"
            >
                <Typography variant="h4">{title}</Typography>
            </HStack>

            {/* Board fills remaining space */}
            <Box className="flex-1 relative overflow-hidden">
                <TopDownShooterBoard
                    entity={resolved}
                    player={player}
                    enemies={enemies}
                    projectiles={projectiles}
                    score={score}
                    wave={wave}
                    lives={lives}
                    result={result}
                    assetManifest={assetManifest}
                    width={width}
                    height={height}
                    spriteSize={spriteSize}
                    moveEvent={moveEvent}
                    fireEvent={fireEvent}
                    playAgainEvent={playAgainEvent}
                    gameEndEvent={gameEndEvent}
                    className="h-full"
                />
            </Box>
        </Box>
    );
}

TopDownShooterTemplate.displayName = 'TopDownShooterTemplate';

export default TopDownShooterTemplate;
