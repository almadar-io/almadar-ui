'use client';

import React from 'react';
import type { AssetUrl } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { GameCanvas2D } from '../molecules/GameCanvas2D';
import type { DisplayStateProps } from '../../core/organisms/types';

// =============================================================================
// Types
// =============================================================================

export interface SpaceShmupBoardProps extends DisplayStateProps {
    /** Background image URL (starfield / space scene) */
    backgroundImage?: AssetUrl;
    /** Base URL prefix for asset URLs */
    assetBaseUrl?: AssetUrl;
    /** Canvas width in pixels */
    width?: number;
    /** Canvas height in pixels */
    height?: number;
    /** Target frames per second */
    fps?: number;
}

// =============================================================================
// Component
// =============================================================================

export function SpaceShmupBoard({
    backgroundImage,
    assetBaseUrl,
    width = 800,
    height = 600,
    fps = 60,
    isLoading,
    error,
    className,
}: SpaceShmupBoardProps): React.ReactElement {
    return (
        <div className={cn('space-shmup-board relative w-full h-full', className)}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <span className="text-white text-sm">Loading…</span>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 z-10">
                    <span className="text-white text-sm">{error.message}</span>
                </div>
            )}
            <GameCanvas2D
                backgroundImage={backgroundImage}
                assetBaseUrl={assetBaseUrl}
                width={width}
                height={height}
                fps={fps}
            />
        </div>
    );
}

SpaceShmupBoard.displayName = 'SpaceShmupBoard';

export default SpaceShmupBoard;
