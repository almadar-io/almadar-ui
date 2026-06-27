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

export interface RacingBoardProps extends DisplayStateProps {
    /** Road + grass terrain tiles forming the race circuit */
    tiles?: IsometricTile[];
    /** Car units on the track */
    units?: IsometricUnit[];
    /** Track features (pit lane markers, start/finish line, etc.) */
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

export function RacingBoard({
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
}: RacingBoardProps): React.ReactElement {
    return (
        <div className={cn('racing-board relative w-full h-full', className)}>
            <Canvas2D
                projection="flat"
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

RacingBoard.displayName = 'RacingBoard';

export default RacingBoard;
