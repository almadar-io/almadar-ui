'use client';

import React from 'react';
import type { AssetUrl, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Canvas2D } from './Canvas2D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../shared/isometricTypes';
import type { DisplayStateProps } from '../../core/organisms/types';
import type { Canvas2DProps } from './Canvas2D';

// =============================================================================
// Types
// =============================================================================

export interface MinigolfBoardProps extends DisplayStateProps {
    /** Isometric grid tiles */
    tiles?: IsometricTile[];
    /** Units on the board */
    units?: IsometricUnit[];
    /** Features (holes, obstacles, etc.) on the board */
    features?: IsometricFeature[];
    /** Asset sprite manifest (same shape as Canvas2D.assetManifest) */
    assetManifest?: Canvas2DProps['assetManifest'];
    /** Base URL prepended to manifest sprite paths */
    assetBaseUrl?: AssetUrl;
    /** Render scale */
    scale?: number;
    /** Show minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: EventEmit<{ unitId: string }>;
}

// =============================================================================
// Component
// =============================================================================

export function MinigolfBoard({
    tiles,
    units,
    features,
    assetManifest,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = true,
    enableCamera = true,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: MinigolfBoardProps): React.ReactElement {
    return (
        <div className={cn('minigolf-board relative w-full h-full', className)}>
            <Canvas2D
                projection="isometric"
                tiles={tiles}
                units={units}
                features={features}
                assetManifest={assetManifest}
                scale={scale}
                showMinimap={showMinimap}
                camera={enableCamera ? 'pan-zoom' : 'fixed'}
                tileClickEvent={tileClickEvent}
                unitClickEvent={unitClickEvent}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}

MinigolfBoard.displayName = 'MinigolfBoard';

export default MinigolfBoard;
