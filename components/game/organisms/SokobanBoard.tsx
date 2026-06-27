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

export interface SokobanBoardProps extends DisplayStateProps {
    /** Grid tiles (floor, wall, target) */
    tiles?: IsometricTile[];
    /** Units on the board (the pusher character) */
    units?: IsometricUnit[];
    /** Features (crates) on the board */
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

export function SokobanBoard({
    tiles,
    units,
    features,
    assetManifest,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = false,
    enableCamera = false,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: SokobanBoardProps): React.ReactElement {
    return (
        <div className={cn('sokoban-board relative w-full h-full', className)}>
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

SokobanBoard.displayName = 'SokobanBoard';

export default SokobanBoard;
