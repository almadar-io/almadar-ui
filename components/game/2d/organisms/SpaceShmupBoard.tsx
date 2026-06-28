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

/** Asset manifest shape for SpaceShmupBoard. */
type SpaceShmupAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const SPACE_SHMUP_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_SPACE_SHMUP_ASSET_MANIFEST: SpaceShmupAssetManifest = {
    ui: {
        life: makeAsset(`${SPACE_SHMUP_CDN}/ui-space-shmup-board/default/ui/life.png`, 'ui', { category: 'life' }),
    },
};

export interface SpaceShmupBoardProps extends DisplayStateProps {
    /** Space terrain tiles filling the grid */
    tiles?: IsometricTile[];
    /** Player ship and enemy ships on the board */
    units?: IsometricUnit[];
    /** Features (asteroids, power-ups, etc.) on the board */
    features?: IsometricFeature[];
    /** Asset sprite manifest */
    assetManifest?: SpaceShmupAssetManifest;
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

export function SpaceShmupBoard({
    tiles,
    units,
    features,
    assetManifest = DEFAULT_SPACE_SHMUP_ASSET_MANIFEST,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = false,
    enableCamera = true,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: SpaceShmupBoardProps): React.ReactElement {
    return (
        <div className={cn('space-shmup-board relative w-full h-full', className)}>
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

SpaceShmupBoard.displayName = 'SpaceShmupBoard';

export default SpaceShmupBoard;
