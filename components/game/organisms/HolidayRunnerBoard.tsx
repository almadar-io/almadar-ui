'use client';

import React from 'react';
import type { AssetUrl, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import type { DisplayStateProps } from '../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

export interface HolidayRunnerBoardProps extends DisplayStateProps {
    /** Background image URL for the runner level */
    backgroundImage?: AssetUrl;
    /** Base URL prefix for asset URLs */
    assetBaseUrl?: AssetUrl;
    /** Canvas width in pixels */
    width?: number;
    /** Canvas height in pixels */
    height?: number;
    /** Target frames per second */
    fps?: number;
    /** Render scale */
    scale?: number;
    /** Show minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Declarative event: emits UI:{tickEvent} with { dt, frame } each tick */
    tickEvent?: EventEmit<{ dt: number; frame: number }>;
    /** Declarative event: emits UI:{drawEvent} with { frame } each draw frame */
    drawEvent?: EventEmit<{ frame: number }>;
}

// =============================================================================
// Component
// =============================================================================

export function HolidayRunnerBoard({
    backgroundImage,
    assetBaseUrl,
    width = 800,
    height = 400,
    fps = 60,
    isLoading,
    error,
    className,
}: HolidayRunnerBoardProps): React.ReactElement {
    return (
        <div className={cn('holiday-runner-board relative w-full h-full', className)}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <span className="text-white text-sm">Loading…</span>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <span className="text-red-400 text-sm">{error.message}</span>
                </div>
            )}
            <GameCanvas2D
                width={width}
                height={height}
                fps={fps}
                backgroundImage={backgroundImage ?? ''}
                assetBaseUrl={assetBaseUrl}
            />
        </div>
    );
}

HolidayRunnerBoard.displayName = 'HolidayRunnerBoard';

export default HolidayRunnerBoard;
