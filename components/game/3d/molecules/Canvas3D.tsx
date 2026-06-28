'use client';

import React from 'react';
import type { EventEmit } from '@almadar/core';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import { GameCanvas3D } from './GameCanvas3D';

/** Props for Canvas3D — cleaned prop surface per docs/Almadar_Std_Game.md §4.4 */
export interface Canvas3DProps {
    tiles?: IsometricTile[];
    units?: IsometricUnit[];
    features?: IsometricFeature[];
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    shadows?: boolean;
    showGrid?: boolean;
    selectedUnitId?: string | null;
    validMoves?: Array<{ x: number; z: number }>;
    attackTargets?: Array<{ x: number; z: number }>;
    tileClickEvent?: EventEmit<{ tileId: string; x: number; z: number }>;
    unitClickEvent?: EventEmit<{ unitId: string; x: number; z: number }>;
    unitScale?: number;
    className?: string;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * Canvas3D — pure 3D renderer.  Game logic lives in LOLO; this component
 * receives pre-computed state via props and emits events via EventEmit props.
 *
 * Wraps GameCanvas3D under the canonical §4.4 prop surface.
 * GameCanvas3D is preserved for the Wave 4 migration; Canvas3D is the
 * stable public name going forward.
 */
export function Canvas3D(props: Canvas3DProps): React.JSX.Element {
    return <GameCanvas3D {...props} />;
}

export default Canvas3D;
