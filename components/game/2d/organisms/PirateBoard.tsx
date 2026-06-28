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

/** Asset manifest shape for PirateBoard. */
type PirateAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const PIRATE_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_PIRATE_ASSET_MANIFEST: PirateAssetManifest = {
    ui: {
        cannon: makeAsset(`${PIRATE_CDN}/ui-pirate-board/default/ui/cannon.png`, 'ui', { category: 'cannon' }),
    },
};

export interface PirateBoardProps extends DisplayStateProps {
    /** Sea/island grid tiles */
    tiles?: IsometricTile[];
    /** Ship and crew units on the board */
    units?: IsometricUnit[];
    /** Features (ports, treasures, etc.) on the board */
    features?: IsometricFeature[];
    /** Asset sprite manifest */
    assetManifest?: PirateAssetManifest;
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

export function PirateBoard({
    tiles,
    units,
    features,
    assetManifest = DEFAULT_PIRATE_ASSET_MANIFEST,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = true,
    enableCamera = true,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: PirateBoardProps): React.ReactElement {
    return (
        <div className={cn('pirate-board relative w-full h-full', className)}>
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

PirateBoard.displayName = 'PirateBoard';

export default PirateBoard;
