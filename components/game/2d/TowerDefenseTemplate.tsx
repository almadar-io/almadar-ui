/**
 * TowerDefenseTemplate
 *
 * Thin template wrapper: titled header + TowerDefenseBoard.
 * All game state is driven by the entity prop (passed through from the orbital trait).
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import type { TemplateProps } from '../../core/templates/types';
import { TowerDefenseBoard } from './TowerDefenseBoard';
import type {
    TowerDefenseTile,
    TowerDefensePathPoint,
    TowerDefenseTower,
} from './TowerDefenseBoard';
import type { EventEmit } from '@almadar/core';

export interface TowerDefenseTemplateProps extends TemplateProps {
    title?: string;
    tiles?: TowerDefenseTile[];
    path?: TowerDefensePathPoint[];
    towers?: TowerDefenseTower[];
    gold?: number;
    lives?: number;
    maxWaves?: number;
    towerCost?: number;
    towerRange?: number;
    towerDamage?: number;
    creepsPerWave?: number;
    creepBaseHp?: number;
    goldPerKill?: number;
    scale?: number;
    placeTowerEvent?: EventEmit<{ x: number; y: number }>;
    startWaveEvent?: EventEmit<{ wave: number }>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

export function TowerDefenseTemplate({
    entity,
    title = 'Tower Defense',
    tiles,
    path,
    towers,
    gold,
    lives,
    maxWaves,
    towerCost,
    scale,
    placeTowerEvent,
    startWaveEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: TowerDefenseTemplateProps): React.JSX.Element {
    const resolved =
        entity && typeof entity === 'object' && !Array.isArray(entity)
            ? (entity as EntityRow)
            : undefined;

    return (
        <Box
            display="flex"
            fullHeight
            className={cn('tower-defense-template flex-col', className)}
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
                <TowerDefenseBoard
                    entity={resolved}
                    tiles={tiles}
                    path={path}
                    towers={towers}
                    gold={gold}
                    lives={lives}
                    maxWaves={maxWaves}
                    towerCost={towerCost}
                    scale={scale}
                    placeTowerEvent={placeTowerEvent}
                    startWaveEvent={startWaveEvent}
                    playAgainEvent={playAgainEvent}
                    gameEndEvent={gameEndEvent}
                    className="h-full"
                />
            </Box>
        </Box>
    );
}

TowerDefenseTemplate.displayName = 'TowerDefenseTemplate';

export default TowerDefenseTemplate;
