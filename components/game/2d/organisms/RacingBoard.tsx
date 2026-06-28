'use client';

import React from 'react';
import type { Asset, AssetUrl, EventEmit } from '@almadar/core';
import { makeAsset } from '../../shared/makeAsset';
import { cn } from '../../../../lib/cn';
import { Canvas2D } from '../molecules/Canvas2D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import type { DisplayStateProps } from '../../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

/** Asset manifest shape for RacingBoard. */
type RacingAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const RACING_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_RACING_ASSET_MANIFEST: RacingAssetManifest = {
    ui: {
        lights: makeAsset(`${RACING_CDN}/ui-racing-board/default/ui/lights.png`, 'ui', { category: 'lights' }),
    },
};

export interface RacingBoardProps extends DisplayStateProps {
    /** Road + grass terrain tiles forming the race circuit */
    tiles?: IsometricTile[];
    /** Car units on the track */
    units?: IsometricUnit[];
    /** Track features (pit lane markers, start/finish line, etc.) */
    features?: IsometricFeature[];
    /** Asset sprite manifest */
    assetManifest?: RacingAssetManifest;
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
    assetManifest = DEFAULT_RACING_ASSET_MANIFEST,
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
