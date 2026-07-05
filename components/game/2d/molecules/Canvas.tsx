'use client';
/**
 * Canvas — the unified game canvas draw-host (P6 closing).
 *
 * A single `type: canvas` host that renders authored `drawables` (the neutral
 * `draw-*` children) through the 2D painter or the 3D painter selected by `mode`.
 * Both painters consume the EXACT same `drawables`; they differ only in how a
 * `ScenePos` projects and how a sprite/shape/text is rasterized vs meshed. This
 * retires the direct use of `canvas-2d` / `game-canvas-3d` from board authoring:
 * a board writes `{ type: canvas, mode, camera, children: [...] }`.
 *
 * Camera: the neutral core `Camera` ({ mode, zoom, ... }) is mapped to each
 * host's legacy vocab here (2D `camera` string / 3D `cameraMode`; `zoom` → `scale`),
 * so the board carries one camera object regardless of painter.
 *
 * The 3D host (three.js/R3F) is lazy-imported so a 2D-only app never pulls the
 * 3D bundle — the code-split boundary the drawable atoms were built R3F-free for.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { Suspense, lazy } from 'react';
import type { Asset, AssetUrl, Camera, EventEmit } from '@almadar/core';
import type { DrawableNode } from '../../../../lib/drawable/paintDispatch';
import { Canvas2D, type CameraMode as Canvas2DCameraMode, type Projection } from './Canvas2D';
import type { GameCanvas3DProps } from '../../3d/molecules/GameCanvas3D';

/** Lazy 3D host — keeps three/R3F out of the bundle unless a 3D canvas renders. */
const GameCanvas3D = lazy(() =>
    import('../../3d/molecules/GameCanvas3D').then((m) => ({ default: m.GameCanvas3D })),
);

/** Painter selection. Same `drawables` for both; differ only in projection + rasterizer. */
export type CanvasMode = '2d' | '3d';

export interface CanvasProps {
    /** Painter: 2D sprite/shape/text raster, or 3D mesh. Default '2d'. */
    mode?: CanvasMode;
    /** Neutral drawable descriptors — the `draw-*` children. Routed to the host's painter. */
    drawables?: DrawableNode[];
    /** Neutral camera pose. Mapped to the underlying host's framing + zoom. */
    camera?: Camera;
    /** 2D grid layout (2D mode only): isometric / hex / flat / free / side. */
    projection?: Projection;

    // --- Shared view config ---
    className?: string;
    isLoading?: boolean;
    /** Unit draw-size multiplier (both painters). */
    unitScale?: number;
    /** Minimap overlay (2D). */
    showMinimap?: boolean;
    /** Backdrop: 2D uses an image (`backgroundImage`), 3D a solid `backgroundColor`. */
    backgroundImage?: AssetUrl | Asset;
    backgroundColor?: string;
    /** Side/free world bounds (2D). */
    worldWidth?: number;
    worldHeight?: number;
    /** 3D-only presentation. */
    showGrid?: boolean;
    shadows?: boolean;
    showCoordinates?: boolean;
    showTileInfo?: boolean;
    fogOfWar?: boolean[][];

    // --- Shared interaction (LOLO-owned) ---
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    unitClickEvent?: EventEmit<{ unitId: string }>;
    tileHoverEvent?: EventEmit<{ x: number; y: number }>;
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    keyMap?: Record<string, string>;
    keyUpMap?: Record<string, string>;
}

/** 2D `camera` string from the neutral Camera mode: only `follow` tracks; the fixed
 *  framings (isometric/top-down) become the 2D `fixed` camera; `chase`/`perspective`
 *  (3D-native) fall back to `pan-zoom` in 2D. */
function to2DCamera(mode: Camera['mode']): Canvas2DCameraMode {
    if (mode === 'follow') return 'follow';
    if (mode === 'isometric' || mode === 'top-down') return 'fixed';
    return 'pan-zoom';
}

/** 3D `cameraMode` maps 1:1 from the neutral Camera mode (same vocabulary). */
function to3DCameraMode(mode: Camera['mode']): GameCanvas3DProps['cameraMode'] {
    return mode ?? 'isometric';
}

export function Canvas({
    mode = '2d',
    drawables,
    camera,
    projection,
    className,
    isLoading,
    unitScale,
    showMinimap,
    backgroundImage,
    backgroundColor,
    worldWidth,
    worldHeight,
    showGrid,
    shadows,
    showCoordinates,
    showTileInfo,
    fogOfWar,
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    keyMap,
    keyUpMap,
}: CanvasProps): React.JSX.Element {
    const zoom = camera?.zoom;

    if (mode === '3d') {
        const props3d: GameCanvas3DProps = {
            className,
            drawables,
            isLoading,
            cameraMode: to3DCameraMode(camera?.mode),
            ...(zoom !== undefined ? { scale: zoom } : {}),
            unitScale,
            backgroundColor,
            showGrid,
            shadows,
            showCoordinates,
            showTileInfo,
            fogOfWar,
            keyMap,
            keyUpMap,
        };
        return (
            <Suspense fallback={null}>
                <GameCanvas3D {...props3d} />
            </Suspense>
        );
    }

    return (
        <Canvas2D
            className={className}
            drawables={drawables}
            isLoading={isLoading}
            projection={projection}
            camera={to2DCamera(camera?.mode)}
            {...(zoom !== undefined ? { scale: zoom } : {})}
            unitScale={unitScale}
            showMinimap={showMinimap}
            backgroundImage={backgroundImage}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
            tileClickEvent={tileClickEvent}
            unitClickEvent={unitClickEvent}
            tileHoverEvent={tileHoverEvent}
            tileLeaveEvent={tileLeaveEvent}
            keyMap={keyMap}
            keyUpMap={keyUpMap}
        />
    );
}

Canvas.displayName = 'Canvas';
