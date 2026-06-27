'use client';

import React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import type { DisplayStateProps } from '../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

export interface FishingBoardProps extends DisplayStateProps {
    /** Background image asset for the fishing scene */
    backgroundImage?: Asset;
    /** Render scale */
    scale?: number;
    /** Show minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Canvas width in pixels */
    width?: number;
    /** Canvas height in pixels */
    height?: number;
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: EventEmit<{ unitId: string }>;
}

// =============================================================================
// Component
// =============================================================================

export function FishingBoard({
    backgroundImage,
    scale = 1,
    showMinimap = false,
    enableCamera = true,
    width = 800,
    height = 600,
    isLoading,
    error,
    className,
}: FishingBoardProps): React.ReactElement {
    return (
        <div className={cn('fishing-board relative w-full h-full', className)}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <span className="text-white text-sm">Loading…</span>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <span className="text-red-400 text-sm">{error.message}</span>
                </div>
            )}
            <GameCanvas2D
                width={width}
                height={height}
                backgroundImage={backgroundImage}
                fps={60}
                className="w-full h-full"
            />
        </div>
    );
}

FishingBoard.displayName = 'FishingBoard';

export default FishingBoard;
