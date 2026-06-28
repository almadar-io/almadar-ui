'use client';

import React from 'react';
import type { Asset, AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { makeAsset } from '../../shared/makeAsset';
import { cn } from '../../../../lib/cn';
import { Canvas2D } from '../molecules/Canvas2D';
import type { DisplayStateProps } from '../../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

/** Asset manifest shape for PinballBoard. */
type PinballAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const PINBALL_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_PINBALL_ASSET_MANIFEST: PinballAssetManifest = {
    ui: {
        'ball-count': makeAsset(`${PINBALL_CDN}/ui-pinball-board/default/ui/ball-count.png`, 'ui', { category: 'ball-count' }),
        key:          makeAsset(`${PINBALL_CDN}/ui-pinball-board/default/ui/key.png`,         'ui', { category: 'key' }),
        star:         makeAsset(`${PINBALL_CDN}/ui-pinball-board/default/ui/star.png`,        'ui', { category: 'star' }),
    },
};

export interface PinballBoardProps extends DisplayStateProps {
    /** Playfield tiles */
    tiles?: readonly EntityRow[];
    /** Ball units on the board */
    units?: readonly EntityRow[];
    /** Features (bumpers, paddles, etc.) on the board */
    features?: readonly EntityRow[];
    /** Asset sprite manifest */
    assetManifest?: PinballAssetManifest;
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

// NOTE: assetBaseUrl is not forwarded — Canvas2D has no assetBaseUrl prop.
// NOTE: width/height (computed from scale) are dropped — Canvas2D auto-sizes via ResizeObserver.
export function PinballBoard({
    tiles: _tiles,
    units: _units,
    features: _features,
    assetManifest = DEFAULT_PINBALL_ASSET_MANIFEST,
    assetBaseUrl: _assetBaseUrl,
    scale: _scale = 1,
    showMinimap = false,
    enableCamera = false,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: PinballBoardProps): React.ReactElement {
    return (
        <div className={cn('pinball-board relative w-full h-full', className)}>
            <Canvas2D
                projection="free"
                assetManifest={assetManifest}
                showMinimap={showMinimap}
                camera={enableCamera ? 'pan-zoom' : 'fixed'}
                tileClickEvent={tileClickEvent}
                unitClickEvent={unitClickEvent}
                animate={{ fps: 60 }}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}

PinballBoard.displayName = 'PinballBoard';

export default PinballBoard;
