'use client';

/**
 * learningScene3D — the shared 3D seam for the learning canvas molecules
 * (PhysicsCanvas / BiologyCanvas / ChemistryCanvas), mirroring the game
 * `Canvas` molecule's 2D/3D split: each molecule derives neutral drawable
 * descriptors from its vocabulary and this module hosts them in the lazy
 * `Canvas3DHost`, so three.js/R3F never enters a 2D-only bundle.
 *
 * The lazy import MUST use the external `@almadar/ui/.../game/three` subpath
 * (not a relative path): with tsup `splitting:false` a relative `import()` is
 * inlined into the main chunk; the subpath form is the code-split boundary.
 *
 * Click: the host speaks `EventEmit` (a bus event-name string), so the wrapper
 * mints a per-instance, dot-qualified event name (dot-qualified flows through
 * trait-scope qualification verbatim — a bare key would be scope-rewritten and
 * never reach this listener) and bridges it back to the molecule's
 * `onShapeClick` callback contract via `useEventListener` — the same
 * bus→callback mechanism `MediaGallery`/`StateMachineView` use.
 *
 * The derivation helpers below are pure descriptor builders (no three imports).
 * Scene coordinates are cells: `x`/`y` the ground plane, `z` the height.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { Suspense, lazy, useId, useRef } from 'react';
import type { Camera } from '@almadar/core';
import type { DrawableNode } from '../../../lib/drawable/paintDispatch';
import type { Canvas3DHostProps, CanvasLighting, CanvasPost } from '../../../lib/drawable/three/Canvas3DHost';
import type { DrawMeshProps, MeshMaterial, MeshShapeKind } from '../../game/atoms/DrawMesh';
import type { DrawTextProps } from '../../game/atoms/DrawText';
import type { DrawGroupProps } from '../../game/atoms/DrawGroup';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { useEventListener } from '../../../hooks/useEventBus';
import type { UiError } from '../../core/atoms/types';

/** Lazy 3D host — see the module header for why this stays an external subpath. */
const Canvas3DHost = lazy(() =>
  import('@almadar/ui/components/molecules/game/three').then((m) => ({ default: m.Canvas3DHost })),
);

/** A point in scene space: `[x, y, z]` — x/y the ground plane, z the height (cells). */
export type Learning3DPoint = [number, number, number];

export interface LearningScene3DProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  /** Neutral drawable descriptors derived from the molecule's vocabulary. */
  drawables: DrawableNode[];
  /** Neutral camera pose; `mode` defaults to 'perspective' for learning scenes. */
  camera?: Camera;
  /** 3D scene light rig as data. Omitted → the host's standard fixed rig. */
  lighting?: CanvasLighting;
  /** 3D post-processing stack (bloom/vignette). Omitted → no post pass. */
  post?: CanvasPost;
  /** Show the 3D ground grid. Default false (the learning scenes' current look). */
  showGrid?: boolean;
  /** Enable 3D shadows. Omitted → the host default (shadows on). */
  shadows?: boolean;
  /** Enable the orbit camera controls. Omitted → the host default (controls on). */
  interactive?: boolean;
  isLoading?: boolean;
  error?: UiError | null;
  /** Fires with the `id` of a clicked descriptor (descriptors carry `id` via DrawableBase). */
  onItemClick?: (id: string) => void;
}

export function LearningScene3D({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  drawables,
  camera,
  lighting,
  post,
  showGrid = false,
  shadows,
  interactive,
  isLoading,
  error,
  onItemClick,
}: LearningScene3DProps): React.JSX.Element {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clickEvent = onItemClick ? `LEARNING_SCENE_3D.ITEM_CLICK.${instanceId}` : undefined;
  const onItemClickRef = useRef(onItemClick);
  onItemClickRef.current = onItemClick;

  useEventListener(`UI:${clickEvent ?? 'LEARNING_SCENE_3D.ITEM_CLICK.__disabled'}`, (event) => {
    const unitId = event.payload?.unitId;
    if (typeof unitId === 'string') onItemClickRef.current?.(unitId);
  });

  const props3d: Canvas3DHostProps = {
    drawables,
    isLoading,
    error: error ? error.message : null,
    cameraMode: camera?.mode ?? 'perspective',
    ...(camera?.zoom !== undefined ? { zoom: camera.zoom } : {}),
    ...(camera?.fov !== undefined ? { fov: camera.fov } : {}),
    ...(camera?.azimuth !== undefined ? { azimuth: camera.azimuth } : {}),
    ...(camera?.elevation !== undefined ? { elevation: camera.elevation } : {}),
    ...(camera?.target !== undefined ? { followTarget: camera.target } : {}),
    backgroundColor,
    showGrid,
    ...(shadows !== undefined ? { shadows } : {}),
    ...(interactive !== undefined ? { controlsEnabled: interactive } : {}),
    lighting,
    post,
    ...(clickEvent !== undefined ? { unitClickEvent: clickEvent } : {}),
  };

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <div style={{ width, height, display: 'flex' }}>
          <Suspense fallback={null}>
            <Canvas3DHost {...props3d} />
          </Suspense>
        </div>
      </VStack>
    </Card>
  );
}

LearningScene3D.displayName = 'LearningScene3D';

// ---------------------------------------------------------------------------
// Pure descriptor builders (no three imports — the 3D host rasterizes these).
// ---------------------------------------------------------------------------

export interface MeshSphereOpts {
  /** Primitive kind (default 'sphere'; organelles read well as 'capsule'). */
  shape?: MeshShapeKind;
  segments?: number;
  material?: MeshMaterial;
  opacity?: number;
}

/** A sphere (or `opts.shape` primitive) centred at the scene point, `id`-tagged for click. */
export function meshSphere(
  id: string | undefined,
  x: number,
  y: number,
  z: number,
  radius: number,
  color: string,
  opts?: MeshSphereOpts,
): DrawMeshProps {
  return {
    type: 'draw-mesh',
    ...(id !== undefined ? { id } : {}),
    shape: opts?.shape ?? 'sphere',
    position: { x, y, z },
    radius,
    pivot: 'center',
    segments: opts?.segments ?? 24,
    material: { color, ...opts?.material },
    ...(opts?.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

/** Euler `[x, y, z]` aligning a Y-axis primitive (cylinder/cone) with the segment from→to. */
function axisRotation(from: Learning3DPoint, to: Learning3DPoint): [number, number, number] {
  // Scene → world axis map: scene x → world X, scene z (height) → world Y, scene y → world Z.
  const wx = to[0] - from[0];
  const wy = to[2] - from[2];
  const wz = to[1] - from[1];
  const len = Math.sqrt(wx * wx + wy * wy + wz * wz);
  const tilt = Math.acos(Math.min(1, Math.max(-1, len > 0 ? wy / len : 1)));
  return [0, Math.atan2(wz, -wx), tilt];
}

function segmentLength(from: Learning3DPoint, to: Learning3DPoint): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** A cylinder spanning from→to, centred on the midpoint. Null when the segment is degenerate. */
export function cylinderBetween(
  from: Learning3DPoint,
  to: Learning3DPoint,
  radius: number,
  color: string,
): DrawMeshProps | null {
  const len = segmentLength(from, to);
  if (len < 1e-6) return null;
  return {
    type: 'draw-mesh',
    shape: 'cylinder',
    position: { x: (from[0] + to[0]) / 2, y: (from[1] + to[1]) / 2, z: (from[2] + to[2]) / 2 },
    radius,
    height: len,
    rotation: axisRotation(from, to),
    pivot: 'center',
    segments: 12,
    material: { color },
  };
}

/**
 * An arrow from→to as a `draw-group` (shaft cylinder + tip cone) local to `from`.
 * `shaftRadius` is in scene cells (default: a thin rod at cell scale).
 */
export function arrowBetween(
  from: Learning3DPoint,
  to: Learning3DPoint,
  color: string,
  shaftRadius = 0.08,
): DrawGroupProps | null {
  const len = segmentLength(from, to);
  if (len < 1e-6) return null;
  const tipLen = Math.min(shaftRadius * 8, len * 0.35);
  const k = (len - tipLen) / len;
  const delta: Learning3DPoint = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const shaftEnd: Learning3DPoint = [delta[0] * k, delta[1] * k, delta[2] * k];
  const tipStart: Learning3DPoint = shaftEnd;
  const tipEnd: Learning3DPoint = delta;
  const shaft = cylinderBetween([0, 0, 0], shaftEnd, shaftRadius, color);
  const tipLenActual = segmentLength(tipStart, tipEnd);
  const tip: DrawMeshProps = {
    type: 'draw-mesh',
    shape: 'cone',
    position: {
      x: (tipStart[0] + tipEnd[0]) / 2,
      y: (tipStart[1] + tipEnd[1]) / 2,
      z: (tipStart[2] + tipEnd[2]) / 2,
    },
    radius: shaftRadius * 3,
    height: tipLenActual,
    rotation: axisRotation(tipStart, tipEnd),
    pivot: 'center',
    segments: 12,
    material: { color },
  };
  return {
    type: 'draw-group',
    position: { x: from[0], y: from[1], z: from[2] },
    items: tipLenActual < 1e-6 ? (shaft ? [shaft] : []) : shaft ? [shaft, tip] : [tip],
  };
}

/** A billboarded text label above the scene point (the 3D host lifts it off the item). */
export function billboardLabel(
  text: string,
  x: number,
  y: number,
  z: number,
  opts?: { color?: string },
): DrawTextProps {
  return {
    type: 'draw-text',
    text,
    position: { x, y, z },
    color: opts?.color ?? '#111827',
  };
}

/** Label color contrasting the scene background: dark text on the (light) default
 *  stage, light text once a dark `backgroundColor` is authored. Hex `#rgb`/`#rrggbb`
 *  only; anything else falls back to the light-stage default. */
export function labelColorForBackground(backgroundColor?: string): string {
  const m = /^#(?:([0-9a-f]{3})|([0-9a-f]{6}))$/i.exec(backgroundColor ?? '');
  if (!m) return '#111827';
  const hex = m[1] !== undefined ? m[1].split('').map((c) => c + c).join('') : m[2]!;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5 ? '#e5e7eb' : '#111827';
}

/**
 * Bridge the 3D host's `{ unitId }` click back to the molecules' 2D
 * `onShapeClick({ id, index })` contract — `index` is the item's position in
 * its vocabulary array (−1 when the id is unknown).
 */
export function get3DClickPayload(
  onShapeClick: ((payload: { id?: string; type?: string; index: number }) => void) | undefined,
  idToIndex: ReadonlyMap<string, number>,
): ((id: string) => void) | undefined {
  if (!onShapeClick) return undefined;
  return (id) => onShapeClick({ id, index: idToIndex.get(id) ?? -1 });
}
