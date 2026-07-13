'use client';
/**
 * Canvas3DHost — the thin 3D draw-host: the `canvas` host's 3D painter backend
 * (the R3F "vessel" behind the neutral drawables), the exact 3D analogue of the
 * 2D `Painter2D` seam. Reached only via the lazy `@almadar/ui/.../game/three`
 * subpath so three.js never enters a 2D bundle.
 *
 * The 3D twin of Canvas2D: the board authors a `drawables` list (the neutral
 * `draw-*` children) and this host maps each descriptor through `Drawable3D` to a
 * three.js mesh (a raw descriptor NEVER reaches `<group>{children}` — R3F throws).
 * It owns NO game data — tiles, units, features, selection, health bars and labels
 * are all `draw-*` children composed in `.lolo`, not props here. Only view state
 * (camera, error boundary) is local.
 *
 * Camera: `isometric`/`perspective`/`top-down` frame the scene bounds (derived from
 * the drawn descriptors); `follow`/`chase` track the neutral core `Camera.target`
 * (forwarded as `followTarget`), falling back to the scene centre.
 *
 * Interaction: keyboard maps to semantic events (device-agnostic input). Pointer
 * click/hover on neutral drawables needs a per-entity id + a scene-space raycast
 * the descriptors don't yet carry — that hit-test is a tracked fork
 * (docs/Almadar_Std_Game_V2_PLAN.md); the click/hover event props are accepted but
 * not yet emitted from a raycast.
 *
 * @packageDocumentation
 */

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { EventEmit, Asset, ScenePos } from '@almadar/core';
import { useEventBus } from '../../../hooks/useEventBus';
import { collectDrawnItems, buildHitIndex } from '../hitTest';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameCanvas3DEvents } from './hooks/useGameCanvas3DEvents';
import { Canvas3DLoadingState } from './Canvas3DLoadingState';
import { Canvas3DErrorBoundary } from './Canvas3DErrorBoundary';
import { Lighting3D } from './Lighting3D';
import { CameraController3D, FollowCamera3D } from './GameCamera3D';
import { Drawable3D } from './Drawable3D';
import { create3DProjector } from '../projector3d';
import type { DrawableNode } from '../paintDispatch';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../isometricTypes';
import { GRID_COLORS_3D, DEFAULT_BACKGROUND_3D } from './game3dTheme';
import { cn } from '../../cn';
import './Canvas3DHost.css';

// Re-export types for convenience
export type { IsometricTile, IsometricUnit, IsometricFeature };

/** Camera mode for 3D view.
 *  - `follow` tracks `followTarget` (the neutral `Camera.target`) from a fixed offset.
 *  - `chase` sits behind + above the target. */
export type CameraMode = 'isometric' | 'perspective' | 'top-down' | 'follow' | 'chase';

/** Per-role model manifest (retained type export; the thin host no longer resolves
 *  models from a manifest — a `draw-sprite` carries its own `Asset`). */
export interface GameCanvas3DAssetManifest {
    terrains?: Record<string, Asset>;
    units?: Record<string, Asset>;
    features?: Record<string, Asset>;
    effects?: Record<string, Asset>;
}

/** Map orientation */
export type MapOrientation = 'standard' | 'rotated';

/** Overlay control */
export type OverlayControl = 'default' | 'hidden' | 'minimap';

/** Props for GameCanvas3D component */
export interface Canvas3DHostProps {
    // --- Closed-circuit ---
    /** Additional CSS classes */
    className?: string;
    /** Children to render inside the 3D canvas (e.g., physics objects, custom meshes) */
    children?: React.ReactNode;
    /** Neutral drawable descriptors — the same `children` vocabulary as Canvas2D. The
     *  host maps each through `Drawable3D` to a mesh. */
    drawables?: DrawableNode[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: string | null;
    /** Fog of war data (accepted for API parity; presentation-only). */
    fogOfWar?: boolean[][];
    /** Map orientation (data attribute). */
    orientation?: MapOrientation;
    /** Camera mode */
    cameraMode?: CameraMode;
    /** Follow-camera target in scene space (the neutral core `Camera.target`). */
    followTarget?: ScenePos;
    /** Show grid */
    showGrid?: boolean;
    /** Show coordinates overlay (accepted for API parity). */
    showCoordinates?: boolean;
    /** Show tile information (accepted for API parity). */
    showTileInfo?: boolean;
    /** Overlay control mode (data attribute). */
    overlay?: OverlayControl;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Declarative event: tile click. Emitted from a ground-plane raycast → scene cell
     *  `{ x, z }` (the FSM validates the cell). `tileId` is optional — the neutral host
     *  has no per-tile id, and the board FSMs key off the coordinate. */
    tileClickEvent?: EventEmit<{ x: number; z: number; tileId?: string; type?: string; terrain?: string; elevation?: number }>;
    /** Declarative event: unit click. Emitted `{ unitId, x, z }` when the raycast lands on a
     *  cell whose descriptor carries an `id` (a tagged unit sprite). */
    unitClickEvent?: EventEmit<{ unitId: string; x: number; z: number; unitType?: string; name?: string; team?: string; faction?: string; health?: number; maxHealth?: number }>;
    /** Declarative event: feature click. Accepted; not yet emitted (see `tileClickEvent`). */
    featureClickEvent?: EventEmit<{ featureId: string; x: number; z: number; type?: string; elevation?: number }>;
    /** Declarative event: canvas (background) click. */
    canvasClickEvent?: EventEmit<{ clientX: number; clientY: number; button: number }>;
    /** Declarative event: tile hover. Accepted; not yet emitted (see `tileClickEvent`). */
    tileHoverEvent?: EventEmit<{ tileId: string; x: number; z: number; type?: string }>;
    /** Declarative event: tile leave. */
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Declarative event: unit animation. */
    unitAnimationEvent?: EventEmit<{ unitId: string; state: string; timestamp: number }>;
    /** Declarative event: camera change. */
    cameraChangeEvent?: EventEmit<{ position: { x: number; y: number; z: number }; timestamp: number }>;
    /** Loading message */
    loadingMessage?: string;
    /** Unit draw-size multiplier (accepted for API parity; sizing is drawable-authored). */
    unitScale?: number;
    /** Board zoom (accepted for API parity; 3D zoom is camera-driven, not group-scaled). */
    scale?: number;
    /** Maps a keydown `e.code` → the board's SEMANTIC event (device-agnostic input). */
    keyMap?: Record<string, string>;
    /** Maps a keyup `e.code` → the board's SEMANTIC event. */
    keyUpMap?: Record<string, string>;
    /** Side-view world size in pixels (accepted for API parity). */
    worldWidth?: number;
    /** Side-view world size in pixels (accepted for API parity). */
    worldHeight?: number;
    /** Pixel→world-unit divisor for pixel-authored (side-view) scenes: world size =
     *  scene size ÷ `pixelsPerUnit`. Omitted → 1 world unit per scene unit (grid boards). */
    pixelsPerUnit?: number;
}

/** Grid configuration */
interface GridConfig {
    cellSize: number;
    offsetX: number;
    offsetZ: number;
}

/** Default grid config */
const DEFAULT_GRID_CONFIG: GridConfig = {
    cellSize: 1,
    offsetX: 0,
    offsetZ: 0,
};

/** Imperative handle for GameCanvas3D */
export interface Canvas3DHostHandle {
    /** Get current camera position */
    getCameraPosition: () => THREE.Vector3 | null;
    /** Set camera position */
    setCameraPosition: (x: number, y: number, z: number) => void;
    /** Look at a specific point */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset camera to default position */
    resetCamera: () => void;
    /** Take a screenshot */
    screenshot: () => string | null;
}

/**
 * Canvas3DHost — thin 3D draw-host. Walks `drawables` through `Drawable3D`.
 */
export const Canvas3DHost = forwardRef<Canvas3DHostHandle, Canvas3DHostProps>(
    (
        {
            cameraMode = 'isometric',
            followTarget,
            showGrid = true,
            orientation = 'standard',
            overlay = 'default',
            shadows = true,
            backgroundColor = DEFAULT_BACKGROUND_3D,
            className,
            isLoading: externalLoading,
            error: externalError,
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
            loadingMessage = 'Loading 3D Scene...',
            keyMap,
            keyUpMap,
            pixelsPerUnit,
            children,
            drawables,
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const controlsRef = useRef<OrbitControlsImpl | null>(null);
        const [internalError, setInternalError] = useState<string | null>(null);
        const eventBus = useEventBus();
        const keysRef = useRef<Set<string>>(new Set());

        // Keyboard → the board's SEMANTIC events via the declarative keyMap/keyUpMap.
        // The input layer only translates device keycodes; the FSM stays device-agnostic.
        useEffect(() => {
            if (!keyMap && !keyUpMap) return;
            const down = (e: KeyboardEvent): void => {
                if (keysRef.current.has(e.code)) return;
                keysRef.current.add(e.code);
                const ev = keyMap?.[e.code];
                if (ev) {
                    eventBus.emit(`UI:${ev}`, {});
                    e.preventDefault();
                }
            };
            const up = (e: KeyboardEvent): void => {
                keysRef.current.delete(e.code);
                const ev = keyUpMap?.[e.code];
                if (ev) eventBus.emit(`UI:${ev}`, {});
            };
            window.addEventListener('keydown', down);
            window.addEventListener('keyup', up);
            return () => {
                window.removeEventListener('keydown', down);
                window.removeEventListener('keyup', up);
            };
        }, [keyMap, keyUpMap, eventBus]);

        // Event handlers (canvas/background click + camera change use these; the
        // per-entity tile/unit/feature handlers await the drawable hit-test fork).
        const eventHandlers = useGameCanvas3DEvents({
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
        });

        // Scene bounds + click hit-index derived from the drawn descriptors (no tile data prop).
        const drawnItems = useMemo(() => collectDrawnItems(drawables ?? []), [drawables]);
        const scenePositions = useMemo(() => drawnItems.map((i) => i.pos), [drawnItems]);
        const hitIndex = useMemo(() => buildHitIndex(drawnItems), [drawnItems]);
        const gridBounds = useMemo(() => {
            if (scenePositions.length === 0) {
                return { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
            }
            let minX = Infinity;
            let maxX = -Infinity;
            let minZ = Infinity;
            let maxZ = -Infinity;
            for (const p of scenePositions) {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minZ) minZ = p.y;
                if (p.y > maxZ) maxZ = p.y;
            }
            return { minX, maxX, minZ, maxZ };
        }, [scenePositions]);

        // World units per scene unit: 1 for grid-authored scenes; pixel-authored
        // (side-view) scenes are divided down by `pixelsPerUnit` so framing distances,
        // follow offsets and the far clip plane stay in their calibrated ranges.
        const cellSize =
            pixelsPerUnit !== undefined && pixelsPerUnit > 0
                ? 1 / pixelsPerUnit
                : DEFAULT_GRID_CONFIG.cellSize;

        // Camera target (centre of the scene bounds, in world space — the projector
        // anchors world X/Z on the bounds' min, so the centre is the half-extent).
        const cameraTarget = useMemo(
            () =>
                [
                    ((gridBounds.maxX - gridBounds.minX) / 2) * cellSize,
                    0,
                    ((gridBounds.maxZ - gridBounds.minZ) / 2) * cellSize,
                ] as [number, number, number],
            [gridBounds, cellSize]
        );

        const gridConfig = useMemo(
            () => ({
                cellSize,
                offsetX: -(gridBounds.maxX - gridBounds.minX) / 2,
                offsetZ: -(gridBounds.maxZ - gridBounds.minZ) / 2,
            }),
            [gridBounds, cellSize]
        );

        // Neutral projector for drawable descriptors — anchors on the scene bounds so
        // a drawable at scene `{x, y}` lands at world `((x-minX)·cell, (y-minZ)·cell)`.
        const drawableProjector = useMemo(
            () =>
                create3DProjector({
                    cellSize: gridConfig.cellSize,
                    offsetX: -gridBounds.minX * gridConfig.cellSize,
                    offsetZ: -gridBounds.minZ * gridConfig.cellSize,
                }),
            [gridBounds, gridConfig]
        );

        // Imperative handle (camera control + screenshot only).
        useImperativeHandle(ref, () => ({
            getCameraPosition: () => {
                if (controlsRef.current) {
                    const pos = controlsRef.current.object.position;
                    return new THREE.Vector3(pos.x, pos.y, pos.z);
                }
                return null;
            },
            setCameraPosition: (x: number, y: number, z: number) => {
                if (controlsRef.current) {
                    controlsRef.current.object.position.set(x, y, z);
                    controlsRef.current.update();
                }
            },
            lookAt: (x: number, y: number, z: number) => {
                if (controlsRef.current) {
                    controlsRef.current.target.set(x, y, z);
                    controlsRef.current.update();
                }
            },
            resetCamera: () => {
                if (controlsRef.current) {
                    controlsRef.current.reset();
                }
            },
            screenshot: () => {
                const canvas = containerRef.current?.querySelector('canvas');
                if (canvas) {
                    return canvas.toDataURL('image/png');
                }
                return null;
            },
        }));

        // Camera configuration based on mode. Framing size is in WORLD units (the
        // scene extent × cellSize) so pixel-authored worlds stay inside the far plane.
        const cameraConfig = useMemo(() => {
            const size = Math.max(
                (gridBounds.maxX - gridBounds.minX) * cellSize,
                (gridBounds.maxZ - gridBounds.minZ) * cellSize,
                4  // minimum framing distance so a tiny board isn't zoomed in
            );
            const cx = cameraTarget[0];
            const cz = cameraTarget[2];
            const d = size * 1.0;

            switch (cameraMode) {
                case 'isometric':
                    return { position: [cx + d, d * 0.8, cz + d] as [number, number, number], fov: 45 };
                case 'top-down':
                    // A small forward tilt avoids the OrbitControls gimbal lock at exactly-overhead.
                    return { position: [cx, d * 2, cz + d * 0.35] as [number, number, number], fov: 45 };
                case 'follow':
                    return { position: [cx, d * 0.5, cz + d] as [number, number, number], fov: 45 };
                case 'perspective':
                default:
                    return { position: [cx + d, d, cz + d] as [number, number, number], fov: 45 };
            }
        }, [cameraMode, gridBounds, cellSize, cameraTarget]);

        // Follow target in world space — the neutral `Camera.target`, else scene centre.
        const followWorld = useMemo((): [number, number, number] => {
            if (followTarget) return drawableProjector.toWorld(followTarget);
            return cameraTarget;
        }, [followTarget, drawableProjector, cameraTarget]);

        // Follow offset from the target (fixed per mode; no per-entity heading in the
        // thin host — a `chase` heading would ride the neutral Camera in a later pass).
        // `follow` is the side-view tracking camera: high + far enough that a 400px-deep
        // (12.5-unit) pixel-authored world fits the 45° fov without foreground occlusion.
        const followOffset = useMemo(
            (): [number, number, number] => (cameraMode === 'chase' ? [0, 4, -7] : [0, 12, 14]),
            [cameraMode]
        );

        // Ground-plane raycast → scene cell (the drawable projector's inverse) → id
        // hit-test. A cell with a tagged descriptor (a unit) → unitClick {unitId,x,z};
        // else tileClick {x,z}. The board FSM validates the cell.
        const handleGroundClick = useCallback((e: ThreeEvent<MouseEvent>) => {
            if (!tileClickEvent && !unitClickEvent) return;
            e.stopPropagation();
            const cell = {
                x: Math.round(e.point.x / gridConfig.cellSize + gridBounds.minX),
                y: Math.round(e.point.z / gridConfig.cellSize + gridBounds.minZ),
            };
            const hitId = hitIndex.get(`${cell.x},${cell.y}`);
            if (hitId !== undefined && unitClickEvent) {
                eventBus.emit(`UI:${unitClickEvent}`, { unitId: hitId, x: cell.x, z: cell.y });
            } else if (tileClickEvent) {
                eventBus.emit(`UI:${tileClickEvent}`, { x: cell.x, z: cell.y });
            }
        }, [tileClickEvent, unitClickEvent, gridConfig, gridBounds, hitIndex, eventBus]);

        // Loading state.
        if (externalLoading) {
            return (
                <Canvas3DLoadingState
                    progress={1}
                    loaded={1}
                    total={1}
                    message={loadingMessage}
                    className={className}
                />
            );
        }

        // Error state.
        const displayError = externalError || internalError;
        if (displayError) {
            return (
                <Canvas3DErrorBoundary>
                    <div className="game-canvas-3d game-canvas-3d--error">
                        <div className="game-canvas-3d__error">Error: {displayError}</div>
                    </div>
                </Canvas3DErrorBoundary>
            );
        }

        return (
            <Canvas3DErrorBoundary
                onError={(err) => setInternalError(err.message)}
                onReset={() => setInternalError(null)}
            >
                <div
                    ref={containerRef}
                    className={cn('game-canvas-3d relative w-full overflow-hidden', className)}
                    style={{ flex: '1 1 0', minHeight: '400px' }}
                    data-orientation={orientation}
                    data-camera-mode={cameraMode}
                    data-overlay={overlay}
                >
                    <Canvas
                        shadows={shadows}
                        camera={{
                            position: cameraConfig.position,
                            fov: cameraConfig.fov,
                            near: 0.1,
                            far: 1000,
                        }}
                        style={{ background: backgroundColor, position: 'absolute', inset: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                eventHandlers.handleCanvasClick(e);
                            }
                        }}
                    >
                        <CameraController3D onCameraChange={eventHandlers.handleCameraChange} />
                        {(cameraMode === 'follow' || cameraMode === 'chase') && (
                            <FollowCamera3D target={followWorld} offset={followOffset} />
                        )}

                        <Lighting3D
                            shadows={shadows}
                            shadowBias={-0.0004}
                            shadowNormalBias={0.04}
                            shadowCameraSize={5}
                            shadowCameraNear={0.5}
                            shadowCameraFar={500}
                        />

                        {showGrid && (
                            <Grid
                                args={[
                                    Math.max((gridBounds.maxX - gridBounds.minX + 2) * cellSize, 10),
                                    Math.max((gridBounds.maxZ - gridBounds.minZ + 2) * cellSize, 10),
                                ]}
                                position={[
                                    ((gridBounds.maxX - gridBounds.minX) / 2) * cellSize - cellSize / 2,
                                    0,
                                    ((gridBounds.maxZ - gridBounds.minZ) / 2) * cellSize - cellSize / 2,
                                ]}
                                cellSize={1}
                                cellThickness={1}
                                cellColor={GRID_COLORS_3D.cell}
                                sectionSize={5}
                                sectionThickness={1.5}
                                sectionColor={GRID_COLORS_3D.section}
                                fadeDistance={50}
                                fadeStrength={1}
                            />
                        )}

                        {/* Neutral drawable scene — the draw-host walk. Each descriptor is
                            mapped through Drawable3D to a mesh; raw descriptors never reach
                            `<group>{children}` (R3F throws). Same `children` vocabulary as
                            Canvas2D — this is what makes the two hosts one interface. */}
                        {drawables && drawables.length > 0 && (
                            <group>
                                {drawables.map((node, i) => (
                                    <Drawable3D key={i} node={node} projector={drawableProjector} />
                                ))}
                            </group>
                        )}

                        {/* Invisible ground plane for click hit-testing: a raycast lands
                            on the plane cell, resolved to a scene coord + id. */}
                        {(tileClickEvent || unitClickEvent) && (
                            <mesh
                                rotation={[-Math.PI / 2, 0, 0]}
                                position={[
                                    ((gridBounds.maxX - gridBounds.minX) / 2) * cellSize,
                                    0,
                                    ((gridBounds.maxZ - gridBounds.minZ) / 2) * cellSize,
                                ]}
                                onClick={handleGroundClick}
                            >
                                <planeGeometry
                                    args={[
                                        (gridBounds.maxX - gridBounds.minX + 4) * cellSize,
                                        (gridBounds.maxZ - gridBounds.minZ + 4) * cellSize,
                                    ]}
                                />
                                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                            </mesh>
                        )}

                        {/* Custom children */}
                        {children}

                        {/* Camera controls — disabled while FollowCamera3D is authoritative */}
                        <OrbitControls
                            ref={controlsRef}
                            enabled={cameraMode !== 'follow' && cameraMode !== 'chase'}
                            target={cameraTarget}
                            enableDamping
                            dampingFactor={0.05}
                            enableZoom
                            enablePan
                            touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
                            minDistance={2}
                            maxDistance={100}
                            maxPolarAngle={Math.PI / 2 - 0.1}
                        />
                    </Canvas>
                </div>
            </Canvas3DErrorBoundary>
        );
    }
);

Canvas3DHost.displayName = 'Canvas3DHost';

export default Canvas3DHost;
