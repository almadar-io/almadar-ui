'use client';

import React from 'react';
import type { AssetUrl, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import IsometricCanvas from '../molecules/IsometricCanvas';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
import type { DisplayStateProps } from '../../core/organisms/types';
import type { IsometricCanvasProps } from '../molecules/IsometricCanvas';

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
    /** Asset sprite manifest (same shape as IsometricCanvas.assetManifest) */
    assetManifest?: IsometricCanvasProps['assetManifest'];
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
            <IsometricCanvas
                tileLayout="flat"
                tiles={tiles}
                units={units}
                features={features}
                assetManifest={assetManifest}
                scale={scale}
                showMinimap={showMinimap}
                enableCamera={enableCamera}
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
