'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { createLogger } from '@almadar/logger';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Typography } from '../../core/atoms/Typography';
import { VStack } from '../../core/atoms/Stack';
import { PlatformerCanvas } from '../molecules/PlatformerCanvas';
import type { PlatformerPlatform, PlatformerPlayer } from '../molecules/PlatformerCanvas';

const boardLog = createLogger('almadar:ui:game:platformer-board');

// =============================================================================
// Types
// =============================================================================

export interface PlatformerBoardProps {
    /** Entity containing all board state (result, lives, score, level, player, platforms) */
    entity?: EntityRow | readonly EntityRow[];
    /** Direct player state — takes priority over entity-derived player */
    player?: PlatformerPlayer;
    /** Direct platform data — takes priority over entity-derived platforms */
    platforms?: PlatformerPlatform[];
    /** Game result read from entity */
    result?: 'none' | 'won' | 'lost';
    /** Lives remaining */
    lives?: number;
    /** Current score */
    score?: number;
    /** Current level */
    level?: number;
    /** World/canvas dimensions */
    worldWidth?: number;
    worldHeight?: number;
    canvasWidth?: number;
    canvasHeight?: number;
    /** Player sprite URL */
    playerSprite?: AssetUrl;
    /** Map of platform type to tile sprite URL */
    tileSprites?: Record<string, AssetUrl>;
    /** Canvas background color */
    bgColor?: string;
    /** Event names forwarded to PlatformerCanvas */
    leftEvent?: EventEmit<{ direction: number }>;
    rightEvent?: EventEmit<{ direction: number }>;
    jumpEvent?: EventEmit<Record<string, never>>;
    stopEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{playAgainEvent} on restart */
    playAgainEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{gameEndEvent} with { result } when result becomes won/lost */
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

// =============================================================================
// Helpers — coerce EntityRow fields without `as any`
// =============================================================================

function resolveEntity(entity: EntityRow | readonly EntityRow[] | undefined): EntityRow {
    if (!entity) return {};
    if (Array.isArray(entity)) return (entity as readonly EntityRow[])[0] ?? {};
    return entity as EntityRow;
}

function numField(row: EntityRow, key: string, fallback: number): number {
    const v = row[key];
    return typeof v === 'number' ? v : fallback;
}

function strField(row: EntityRow, key: string, fallback: string): string {
    const v = row[key];
    return typeof v === 'string' ? v : fallback;
}

// =============================================================================
// Component
// =============================================================================

export function PlatformerBoard({
    entity,
    player: propPlayer,
    platforms: propPlatforms,
    result: propResult,
    lives: propLives,
    score: propScore,
    level: propLevel,
    worldWidth = 800,
    worldHeight = 400,
    canvasWidth = 800,
    canvasHeight = 400,
    playerSprite,
    tileSprites,
    bgColor,
    leftEvent = 'LEFT',
    rightEvent = 'RIGHT',
    jumpEvent = 'JUMP',
    stopEvent = 'STOP',
    playAgainEvent = 'PLAY_AGAIN',
    gameEndEvent = 'GAME_END',
    className,
}: PlatformerBoardProps): React.JSX.Element {
    const row = resolveEntity(entity);
    const eventBus = useEventBus();
    const { t } = useTranslate();

    // Entity fields (direct props win)
    const result = propResult ?? (strField(row, 'result', 'none') as 'none' | 'won' | 'lost');
    const lives = propLives ?? numField(row, 'lives', 3);
    const score = propScore ?? numField(row, 'score', 0);
    const level = propLevel ?? numField(row, 'level', 1);

    // Player state: direct prop wins over entity field
    const entityPlayer = row['player'] as PlatformerPlayer | undefined;
    const player: PlatformerPlayer = propPlayer ?? entityPlayer ?? {
        x: 80,
        y: 320,
        width: 32,
        height: 48,
        vx: 0,
        vy: 0,
        grounded: false,
        facingRight: true,
    };

    // Platforms are static level geometry passed in via the `platforms` prop
    // (the render-ui reads `@config.platforms` directly — no entity round-trip).
    const platforms = propPlatforms ?? [
        { x: 0, y: 368, width: 800, height: 32, type: 'ground' as const },
        { x: 150, y: 280, width: 160, height: 16, type: 'platform' as const },
        { x: 420, y: 220, width: 160, height: 16, type: 'platform' as const },
        { x: 580, y: 300, width: 80, height: 16, type: 'hazard' as const },
        { x: 700, y: 340, width: 64, height: 28, type: 'goal' as const },
    ];

    boardLog.debug('platforms-resolve', {
        propPlatformsCount: Array.isArray(propPlatforms) ? propPlatforms.length : null,
        usedFallback: propPlatforms === undefined,
        finalCount: platforms.length,
        player: { x: player.x, y: player.y, vx: player.vx, vy: player.vy, grounded: player.grounded },
        result,
    });

    const handleRestart = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    const isGameOver = result === 'won' || result === 'lost';

    // Ref-gate: emit GAME_END once when the tick sets result to won/lost.
    const gameEndEmittedRef = useRef(false);
    useEffect(() => {
        if ((result === 'won' || result === 'lost') && gameEndEvent) {
            if (!gameEndEmittedRef.current) {
                gameEndEmittedRef.current = true;
                eventBus.emit(`UI:${gameEndEvent}`, { result });
            }
        } else {
            gameEndEmittedRef.current = false;
        }
    }, [result, gameEndEvent, eventBus]);

    return (
        <VStack
            className={cn('platformer-board relative bg-background', className)}
            gap="none"
        >
            {/* Canvas */}
            <Box className="relative">
                <PlatformerCanvas
                    player={player}
                    platforms={platforms}
                    worldWidth={worldWidth}
                    worldHeight={worldHeight}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    followCamera
                    bgColor={bgColor}
                    playerSprite={playerSprite}
                    tileSprites={tileSprites}
                    leftEvent={leftEvent}
                    rightEvent={rightEvent}
                    jumpEvent={jumpEvent}
                    stopEvent={stopEvent}
                />

                {/* Win / Lost overlay */}
                {isGameOver && (
                    <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-container">
                        <VStack className="text-center p-8" gap="lg">
                            <Typography
                                variant="h2"
                                className={cn(
                                    'text-4xl font-black tracking-widest uppercase',
                                    result === 'won' ? 'text-warning' : 'text-error',
                                )}
                            >
                                {result === 'won'
                                    ? t('platformer.won')
                                    : t('platformer.lost')}
                            </Typography>
                            {result === 'won' && (
                                <Typography variant="body1" className="text-muted-foreground">
                                    {t('platformer.level')} {level} — {t('platformer.score')}: {score}
                                </Typography>
                            )}
                            {result === 'lost' && (
                                <Typography variant="body1" className="text-muted-foreground">
                                    {t('platformer.noLives')}
                                </Typography>
                            )}
                            <Button
                                variant="primary"
                                className="px-8 py-3 font-semibold"
                                onClick={handleRestart}
                            >
                                {result === 'won'
                                    ? t('platformer.nextLevel')
                                    : t('platformer.playAgain')}
                            </Button>
                        </VStack>
                    </Box>
                )}
            </Box>
        </VStack>
    );
}

PlatformerBoard.displayName = 'PlatformerBoard';

export default PlatformerBoard;
