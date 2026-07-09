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
 * Interaction: a click/hover event is one event-name string forwarded to whichever
 * painter `mode` selects. Its payload phantom is the merge of both painters' emit
 * shapes so the single value stays assignable to either host's prop (the two hosts
 * still emit their own coordinate shape at runtime).
 *
 * The 3D host (three.js/R3F) is lazy-imported so a 2D-only app never pulls the
 * 3D bundle — the code-split boundary the drawable atoms were built R3F-free for.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { Suspense, lazy } from 'react';
import { createLogger } from '@almadar/logger';
import type { Asset, AssetUrl, Camera, EventEmit } from '@almadar/core';
import type { DrawableNode } from '../../../lib/drawable/paintDispatch';
import { Canvas2D, type CameraMode as Canvas2DCameraMode, type Projection } from './Canvas2D';
import type { Canvas3DHostProps } from '../../../lib/drawable/three/Canvas3DHost';

/** Lazy 3D host — keeps three/R3F out of the bundle unless a 3D canvas renders.
 *  MUST import the external `@almadar/ui/.../game/three` subpath (not a relative
 *  path): with tsup `splitting:false`, a relative `import()` is INLINED into the
 *  main chunk (pulling R3F into every 2D app); the `@almadar/ui` external + the
 *  external-three-subpath plugin keep the subpath form a true dynamic boundary. */
const Canvas3DHost = lazy(() =>
    import('@almadar/ui/components/molecules/game/three').then((m) => ({ default: m.Canvas3DHost })),
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
    /** Backdrop image (2D iso/hex/flat/free/side). */
    backgroundImage?: AssetUrl | Asset;
    /** Solid backdrop colour — 2D `side` fill and 3D scene clear colour. */
    backgroundColor?: string;
    /** Side/free world bounds (2D `side`) and 3D world extent. */
    worldWidth?: number;
    worldHeight?: number;
    /** 3D world-unit → pixel scale (perspective/side depth). 3D only. */
    pixelsPerUnit?: number;
    /** 3D-only presentation. */
    showGrid?: boolean;
    shadows?: boolean;
    showCoordinates?: boolean;
    showTileInfo?: boolean;
    fogOfWar?: boolean[][];

    // --- Shared interaction (LOLO-owned). The painter emitted at runtime depends on
    //     `mode`, so the payload is genuinely mode-polymorphic: an INTERSECTION of the
    //     two painters' emit shapes. It stays assignable to either host's prop (for the
    //     dispatch below) while pattern-sync records it as an opaque payload — so the
    //     validator does not force a trait to declare both modes' fields at once. ---
    tileClickEvent?: EventEmit<{ x: number; y: number } & { tileId: string; z: number }>;
    unitClickEvent?: EventEmit<{ unitId: string } & { x: number; z: number }>;
    tileHoverEvent?: EventEmit<{ x: number; y: number } & { tileId: string; z: number }>;
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Feature-click event (3D only). */
    featureClickEvent?: EventEmit<{ featureId: string; x: number; z: number; type?: string; elevation?: number }>;
    keyMap?: Record<string, string>;
    keyUpMap?: Record<string, string>;
}

const canvasLog = createLogger('almadar:ui:game-canvas');

/** 2D `camera` string from the neutral Camera mode: only `follow` tracks; the fixed
 *  framings (isometric/top-down) become the 2D `fixed` camera; `chase`/`perspective`
 *  (3D-native) fall back to `pan-zoom` in 2D. */
function to2DCamera(mode: Camera['mode']): Canvas2DCameraMode {
    if (mode === 'follow') return 'follow';
    if (mode === 'isometric' || mode === 'top-down') return 'fixed';
    return 'pan-zoom';
}

/** 3D `cameraMode` maps 1:1 from the neutral Camera mode (same vocabulary). */
function to3DCameraMode(mode: Camera['mode']): Canvas3DHostProps['cameraMode'] {
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
    pixelsPerUnit,
    showGrid,
    shadows,
    showCoordinates,
    showTileInfo,
    fogOfWar,
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    featureClickEvent,
    keyMap,
    keyUpMap,
}: CanvasProps): React.JSX.Element {
    canvasLog.debug('Canvas render', { mode, drawablesCount: drawables?.length, projection, camera: camera ? JSON.stringify(camera) : undefined });
    const zoom = camera?.zoom;

    if (mode === '3d') {
        const props3d: Canvas3DHostProps = {
            className,
            drawables,
            isLoading,
            cameraMode: to3DCameraMode(camera?.mode),
            ...(zoom !== undefined ? { scale: zoom } : {}),
            ...(camera?.target !== undefined ? { followTarget: camera.target } : {}),
            unitScale,
            backgroundColor,
            worldWidth,
            worldHeight,
            pixelsPerUnit,
            showGrid,
            shadows,
            showCoordinates,
            showTileInfo,
            fogOfWar,
            tileClickEvent,
            unitClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            featureClickEvent,
            keyMap,
            keyUpMap,
        };
        return (
            <Suspense fallback={null}>
                <Canvas3DHost {...props3d} />
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
            {...(camera?.target !== undefined ? { followTarget: camera.target } : {})}
            {...(camera?.pos !== undefined ? { cameraPos: camera.pos } : {})}
            showMinimap={showMinimap}
            backgroundImage={backgroundImage}
            {...(backgroundColor !== undefined ? { bgColor: backgroundColor } : {})}
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
