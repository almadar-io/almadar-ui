'use client';

import React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Canvas2D } from '../molecules/Canvas2D';
import type { DisplayStateProps } from '../../../core/organisms/types';

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
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: FishingBoardProps): React.ReactElement {
    return (
        <div className={cn('fishing-board relative w-full h-full', className)}>
            <Canvas2D
                projection="free"
                backgroundImage={backgroundImage}
                scale={scale}
                showMinimap={showMinimap}
                camera={enableCamera ? 'pan-zoom' : 'fixed'}
                tileClickEvent={tileClickEvent}
                unitClickEvent={unitClickEvent}
                animate={{ fps: 60 }}
                isLoading={isLoading}
                error={error}
                className="w-full h-full"
            />
        </div>
    );
}

FishingBoard.displayName = 'FishingBoard';

export default FishingBoard;
