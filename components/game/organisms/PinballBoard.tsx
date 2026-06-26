'use client';

import React from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import type { DisplayStateProps } from '../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

export interface PinballBoardProps extends DisplayStateProps {
    /** Playfield tiles */
    tiles?: readonly EntityRow[];
    /** Ball units on the board */
    units?: readonly EntityRow[];
    /** Features (bumpers, paddles, etc.) on the board */
    features?: readonly EntityRow[];
    /** Asset sprite manifest */
    assetManifest?: string;
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

export function PinballBoard({
    tiles: _tiles,
    units: _units,
    features: _features,
    assetManifest: _assetManifest,
    assetBaseUrl,
    scale = 1,
    showMinimap: _showMinimap = false,
    enableCamera: _enableCamera = false,
    tileClickEvent: _tileClickEvent,
    unitClickEvent: _unitClickEvent,
    isLoading,
    error,
    className,
}: PinballBoardProps): React.ReactElement {
    if (isLoading) {
        return (
            <div className={cn('pinball-board relative w-full h-full flex items-center justify-center', className)}>
                <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn('pinball-board relative w-full h-full flex items-center justify-center', className)}>
                <span className="text-sm text-destructive">{error.message}</span>
            </div>
        );
    }

    return (
        <div className={cn('pinball-board relative w-full h-full', className)}>
            <GameCanvas2D
                width={Math.round(400 * scale)}
                height={Math.round(800 * scale)}
                assetBaseUrl={assetBaseUrl}
                fps={60}
            />
        </div>
    );
}

PinballBoard.displayName = 'PinballBoard';

export default PinballBoard;
