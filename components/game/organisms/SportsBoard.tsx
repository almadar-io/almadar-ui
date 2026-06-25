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

export interface SportsBoardProps extends DisplayStateProps {
    /** Court/field terrain tiles */
    tiles?: IsometricTile[];
    /** Player units on the board */
    units?: IsometricUnit[];
    /** Features (goals, markers, etc.) on the board */
    features?: IsometricFeature[];
    /** Asset sprite manifest (same shape as IsometricCanvas.assetManifest) */
    assetManifest?: IsometricCanvasProps['assetManifest'];
    /** Base URL prepended to asset paths */
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

export function SportsBoard({
    tiles,
    units,
    features,
    assetManifest,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = false,
    enableCamera = true,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: SportsBoardProps): React.ReactElement {
    return (
        <div className={cn('sports-board relative w-full h-full', className)}>
            <IsometricCanvas
                tileLayout="flat"
                tiles={tiles}
                units={units}
                features={features}
                assetManifest={assetManifest}
                assetBaseUrl={assetBaseUrl}
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

SportsBoard.displayName = 'SportsBoard';

export default SportsBoard;
