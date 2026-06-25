'use client';

import React from 'react';
import type { AssetUrl, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import type { DisplayStateProps } from '../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

export interface RacingBoardProps extends DisplayStateProps {
    /** Race track background image URL */
    backgroundImage?: AssetUrl;
    /** Base URL prepended to asset paths */
    assetBaseUrl?: AssetUrl;
    /** Canvas width in pixels */
    width?: number;
    /** Canvas height in pixels */
    height?: number;
    /** Target frames per second */
    fps?: number;
    /** Declarative event: emits UI:{tickEvent} with { dt, frame } each tick */
    tickEvent?: EventEmit<{ dt: number; frame: number }>;
    /** Declarative event: emits UI:{drawEvent} with { frame } each draw frame */
    drawEvent?: EventEmit<{ frame: number }>;
}

// =============================================================================
// Component
// =============================================================================

export function RacingBoard({
    backgroundImage,
    assetBaseUrl,
    width = 800,
    height = 600,
    fps = 60,
    tickEvent,
    drawEvent,
    className,
}: RacingBoardProps): React.ReactElement {
    return (
        <div className={cn('racing-board relative w-full h-full', className)}>
            <GameCanvas2D
                backgroundImage={backgroundImage}
                assetBaseUrl={assetBaseUrl}
                width={width}
                height={height}
                fps={fps}
                tickEvent={typeof tickEvent === 'string' ? tickEvent : undefined}
                drawEvent={typeof drawEvent === 'string' ? drawEvent : undefined}
            />
        </div>
    );
}

RacingBoard.displayName = 'RacingBoard';

export default RacingBoard;
