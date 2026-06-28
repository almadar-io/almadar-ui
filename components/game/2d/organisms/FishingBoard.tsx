'use client';

import React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { makeAsset } from '../../shared/makeAsset';
import { cn } from '../../../../lib/cn';
import { Canvas2D } from '../molecules/Canvas2D';
import type { DisplayStateProps } from '../../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

/** Asset manifest shape for FishingBoard. */
type FishingAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const FISHING_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_FISHING_ASSET_MANIFEST: FishingAssetManifest = {
    ui: {
        'catch-count': makeAsset(`${FISHING_CDN}/ui-fishing-board/default/ui/catch-count.png`, 'ui', { category: 'catch-count' }),
        depth:         makeAsset(`${FISHING_CDN}/ui-fishing-board/default/ui/depth.png`,       'ui', { category: 'depth' }),
        score:         makeAsset(`${FISHING_CDN}/ui-fishing-board/default/ui/score.png`,       'ui', { category: 'score' }),
    },
};

export interface FishingBoardProps extends DisplayStateProps {
    /** Background image asset for the fishing scene */
    backgroundImage?: Asset;
    /** Asset sprite manifest */
    assetManifest?: FishingAssetManifest;
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
    assetManifest = DEFAULT_FISHING_ASSET_MANIFEST,
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
                assetManifest={assetManifest}
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
