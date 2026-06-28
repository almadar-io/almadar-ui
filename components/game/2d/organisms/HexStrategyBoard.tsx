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

/** Asset manifest shape for HexStrategyBoard. */
type HexStrategyAssetManifest = {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
    ui?: Record<string, Asset>;
};

// =============================================================================
// Default manifest
// =============================================================================

const HEX_CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_HEX_STRATEGY_ASSET_MANIFEST: HexStrategyAssetManifest = {
    ui: {
        coin:   makeAsset(`${HEX_CDN}/ui-hex-strategy-board/default/ui/coin.png`,   'ui', { category: 'coin' }),
        health: makeAsset(`${HEX_CDN}/ui-hex-strategy-board/default/ui/health.png`, 'ui', { category: 'health' }),
        star:   makeAsset(`${HEX_CDN}/ui-hex-strategy-board/default/ui/star.png`,   'ui', { category: 'star' }),
    },
};

export interface HexStrategyBoardProps extends DisplayStateProps {
    /** Hex grid tiles */
    tiles?: IsometricTile[];
    /** Units on the board */
    units?: IsometricUnit[];
    /** Features (resources, structures, etc.) on the board */
    features?: IsometricFeature[];
    /** Asset sprite manifest */
    assetManifest?: HexStrategyAssetManifest;
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

export function HexStrategyBoard({
    tiles,
    units,
    features,
    assetManifest = DEFAULT_HEX_STRATEGY_ASSET_MANIFEST,
    assetBaseUrl,
    scale = 0.45,
    showMinimap = true,
    enableCamera = true,
    tileClickEvent,
    unitClickEvent,
    isLoading,
    error,
    className,
}: HexStrategyBoardProps): React.ReactElement {
    return (
        <div className={cn('hex-strategy-board relative w-full h-full', className)}>
            <Canvas2D
                projection="hex"
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

HexStrategyBoard.displayName = 'HexStrategyBoard';

export default HexStrategyBoard;
