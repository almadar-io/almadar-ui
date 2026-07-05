'use client';
/**
 * GameCanvas3D
 *
 * 3D game canvas component using Three.js.
 * Mirrors the IsometricCanvas API for easy migration.
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (hoveredTile, internalError, asset loading, camera) → local only
 * - Events → emitted via `useGameCanvas3DEvents()` hook for trait integration
 *
 * This component is a **pure 3D renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */

import React, {
    useEffect,
    useRef,
    useCallback,
    useState,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from 'react';
import type { EventEmit, Asset } from '@almadar/core';
import type { Platform, SidePlayer } from '../../2d/molecules/Canvas2D';
import { useEventBus } from '../../../../hooks/useEventBus';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AssetLoader, assetLoader } from '../../shared/lib/AssetLoader';
import { useAssetLoader } from '../../shared/hooks/useAssetLoader';
import { useGameCanvas3DEvents, type MinimalMouseEvent } from '../../shared/hooks/useGameCanvas3DEvents';
import { Canvas3DLoadingState } from './Canvas3DLoadingState';
import { Canvas3DErrorBoundary } from './Canvas3DErrorBoundary';
import { Lighting3D } from './Lighting3D';
import { TileMesh3D } from './TileMesh3D';
import { UnitMesh3D } from './UnitMesh3D';
import { FeatureMesh3D } from './FeatureMesh3D';
import { SideScene3D } from './SideScene3D';
import { CameraController3D, FollowCamera3D, LerpedGroup3D } from './GameCamera3D';
import { EventMarker3D } from '../atoms/EventMarker3D';
import { Drawable3D } from '../../../../lib/drawable/Drawable3D';
import { create3DProjector } from '../../../../lib/drawable/projector3d';
import type { DrawableNode } from '../../../../lib/drawable/paintDispatch';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import { useUnitSpriteAtlas } from '../../shared/hooks/useUnitSpriteAtlas';
import { GRID_COLORS_3D, DEFAULT_BACKGROUND_3D } from '../../shared/game3dTheme';
import { cn } from '../../../../lib/cn';
import './GameCanvas3D.css';

// Re-export types for convenience
export type { IsometricTile, IsometricUnit, IsometricFeature };

/** Game event for canvas display */
export interface GameEvent {
    id: string;
    type: string;
    x: number;
    z?: number;
    y?: number;
    message?: string;
}

/** Camera mode for 3D view.
 *  - `follow` tracks the side-view player (or the selected unit) from a fixed offset.
 *  - `chase` sits behind + above the followed unit relative to its `heading` (driving). */
export type CameraMode = 'isometric' | 'perspective' | 'top-down' | 'follow' | 'chase';

/** Per-role model manifest — the 3D analogue of Canvas2D's assetManifest (values are GLB Assets). */
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
export interface GameCanvas3DProps {
    // --- Closed-circuit props (MANDATORY) ---
    /** Additional CSS classes */
    className?: string;
    /** Children to render inside the 3D canvas (e.g., physics objects, custom meshes) */
    children?: React.ReactNode;
    /** Neutral drawable descriptors — the same `children` vocabulary as Canvas2D. The
     *  host maps each through `Drawable3D` to a mesh (NEVER passes a raw descriptor to
     *  `<group>{children}` — R3F throws). This is the draw-host interface; data props
     *  (tiles/units/features) remain as a fallback until the P6 migration deletes them. */
    drawables?: DrawableNode[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: string | null;
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units to render */
    units?: IsometricUnit[];
    /** Array of features to render */
    features?: IsometricFeature[];
    /** Array of events to display */
    events?: Array<GameEvent>;
    /** Fog of war data */
    fogOfWar?: boolean[][];
    /** Map orientation */
    orientation?: MapOrientation;
    /** Camera mode */
    cameraMode?: CameraMode;
    /** Show grid */
    showGrid?: boolean;
    /** Show coordinates overlay */
    showCoordinates?: boolean;
    /** Show tile information */
    showTileInfo?: boolean;
    /** Overlay control mode */
    overlay?: OverlayControl;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Callback when a tile is clicked */
    onTileClick?: (tile: IsometricTile, event: MinimalMouseEvent) => void;
    /** Callback when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit, event: MinimalMouseEvent) => void;
    /** Callback when a feature is clicked */
    onFeatureClick?: (feature: IsometricFeature, event: MinimalMouseEvent) => void;
    /** Callback when canvas is clicked (background) */
    onCanvasClick?: (event: MinimalMouseEvent) => void;
    /** Callback when mouse moves over a tile */
    onTileHover?: (tile: IsometricTile | null, event: MinimalMouseEvent) => void;
    /** Callback for unit animation state change */
    onUnitAnimation?: (unitId: string, state: string) => void;
    /** Asset loader instance (uses global singleton if not provided) */
    assetLoader?: AssetLoader;
    /** Custom tile renderer component */
    tileRenderer?: React.FC<{ tile: IsometricTile; position: [number, number, number] }>;
    /** Custom unit renderer component */
    unitRenderer?: React.FC<{ unit: IsometricUnit; position: [number, number, number] }>;
    /** Custom feature renderer component */
    featureRenderer?: React.FC<{ feature: IsometricFeature; position: [number, number, number] }>;
    /** URLs to preload */
    preloadAssets?: string[];
    /** Declarative event: tile click */
    tileClickEvent?: EventEmit<{ tileId: string; x: number; z: number; type?: string; terrain?: string; elevation?: number }>;
    /** Declarative event: unit click */
    unitClickEvent?: EventEmit<{ unitId: string; x: number; z: number; unitType?: string; name?: string; team?: string; faction?: string; health?: number; maxHealth?: number }>;
    /** Declarative event: feature click */
    featureClickEvent?: EventEmit<{ featureId: string; x: number; z: number; type?: string; elevation?: number }>;
    /** Declarative event: canvas click */
    canvasClickEvent?: EventEmit<{ clientX: number; clientY: number; button: number }>;
    /** Declarative event: tile hover */
    tileHoverEvent?: EventEmit<{ tileId: string; x: number; z: number; type?: string }>;
    /** Declarative event: tile leave */
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Declarative event: unit animation */
    unitAnimationEvent?: EventEmit<{ unitId: string; state: string; timestamp: number }>;
    /** Declarative event: camera change */
    cameraChangeEvent?: EventEmit<{ position: { x: number; y: number; z: number }; timestamp: number }>;
    /** Loading message */
    loadingMessage?: string;
    /** Whether to use instancing for tiles */
    useInstancing?: boolean;
    /** Valid move positions */
    validMoves?: Array<{ x: number; z: number }>;
    /** Attack target positions */
    attackTargets?: Array<{ x: number; z: number }>;
    /** Selected tile IDs */
    selectedTileIds?: string[];
    /** Selected unit ID */
    selectedUnitId?: string | null;
    /** Unit draw-size multiplier. 1 = default tile-proportional size. */
    unitScale?: number;
    /** Board zoom/group scale. Applied to the scene group. Default 0.45. */
    scale?: number;
    /** Maps a keydown `e.code` → the board's SEMANTIC event, e.g. `{ ArrowLeft: "LEFT", Space: "JUMP" }`.
     *  The input layer emits `UI:<event>` so the FSM stays device-agnostic — keyboard and d-pad converge. */
    keyMap?: Record<string, string>;
    /** Maps a keyup `e.code` → the board's SEMANTIC event, e.g. `{ ArrowLeft: "STOP" }`. */
    keyUpMap?: Record<string, string>;
    /** Side-view player (pixel coords, LOLO-owned physics) — presence switches to side-scroller rendering. */
    player?: SidePlayer;
    /** Side-view level geometry (pixel AABBs, same contract as Canvas2D). */
    platforms?: Platform[];
    /** Side-view world size in pixels. */
    worldWidth?: number;
    /** Side-view world size in pixels. */
    worldHeight?: number;
    /** Pixel→world-unit divisor for side view (default 32 = one 2D tile per 3D cell). */
    pixelsPerUnit?: number;
    /** Player model — named for 2D parity; in 3D the Asset's url is a GLB. */
    playerSprite?: Asset;
    /** Platform-type → model map — named for 2D parity; values are GLB Assets. */
    tileSprites?: Record<string, Asset>;
    /** Per-role model manifest; resolves tiles/units/features without explicit modelUrl/assetUrl. */
    assetManifest?: GameCanvas3DAssetManifest;
    /** Opt-in: smooth-lerp unit positions between LOLO tick snapshots. DEFAULT OFF. */
    interpolateUnits?: boolean;
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
export interface GameCanvas3DHandle {
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
    /** Export current view as data */
    export: () => { tiles: IsometricTile[]; units: IsometricUnit[]; features: IsometricFeature[] };
}

// Y offset that seats a base-pivoted unit/feature model on the tile surface.
// Tiles render flush at grid-Y (primitive plate is 0.2 tall → top ≈ 0.1; GLB
// terrain plates are similarly thin), so units/features sit just above that.
// NOT the old hardcoded +0.5, which floated Kenney GLBs ~½ cell above the board.
const TILE_TOP_OFFSET = 0.1;

/**
 * GameCanvas3D Component
 *
 * 3D game canvas that mirrors the IsometricCanvas API.
 * Uses Three.js and React Three Fiber for rendering.
 *
 * @example
 * ```tsx
 * <GameCanvas3D
 *   tiles={tiles}
 *   units={units}
 *   features={features}
 *   cameraMode="isometric"
 *   tileClickEvent="TILE_SELECTED"
 *   onTileClick={(tile) => console.log('Clicked:', tile)}
 * />
 * ```
 */
export const GameCanvas3D = forwardRef<GameCanvas3DHandle, GameCanvas3DProps>(
    (
        {
            tiles = [],
            units = [],
            features = [],
            events = [],
            orientation = 'standard',
            cameraMode = 'isometric',
            showGrid = true,
            showCoordinates = false,
            showTileInfo = false,
            overlay = 'default',
            shadows = true,
            backgroundColor = DEFAULT_BACKGROUND_3D,
            onTileClick,
            onUnitClick,
            onFeatureClick,
            onCanvasClick,
            onTileHover,
            onUnitAnimation,
            assetLoader: customAssetLoader,
            tileRenderer: CustomTileRenderer,
            unitRenderer: CustomUnitRenderer,
            featureRenderer: CustomFeatureRenderer,
            className,
            isLoading: externalLoading,
            error: externalError,
            preloadAssets = [],
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
            loadingMessage = 'Loading 3D Scene...',
            useInstancing = true,
            validMoves = [],
            attackTargets = [],
            selectedTileIds = [],
            selectedUnitId = null,
            unitScale = 1,
            keyMap,
            keyUpMap,
            player,
            platforms = [],
            worldHeight = 400,
            pixelsPerUnit = 32,
            playerSprite,
            tileSprites,
            assetManifest,
            interpolateUnits = false,
            children,
            drawables,
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const controlsRef = useRef<OrbitControlsImpl | null>(null);
        const [hoveredTile, setHoveredTile] = useState<IsometricTile | null>(null);
        const [internalError, setInternalError] = useState<string | null>(null);
        const eventBus = useEventBus();
        const keysRef = useRef<Set<string>>(new Set());

        // Keyboard → the board's SEMANTIC events via the declarative keyMap/keyUpMap.
        // Same contract as Canvas2D: the input layer only translates device keycodes;
        // the FSM stays device-agnostic and keyboard + d-pad converge on one event set.
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

        // Diagnostic: log the ancestor height chain on mount so constraint issues are visible.
        useEffect(() => {
            const el = containerRef.current;
            if (!el) return;
            let node: HTMLElement | null = el;
            let depth = 0;
            while (node && depth < 8) {
                const cs = window.getComputedStyle(node);
                const rect = node.getBoundingClientRect();
                console.log('[almadar:ui:game:3d-height]', {
                    depth,
                    tag: node.tagName,
                    id: node.id || undefined,
                    className: node.className?.slice?.(0, 60) || undefined,
                    rectHeight: rect.height,
                    computedHeight: cs.height,
                    computedMinHeight: cs.minHeight,
                    computedFlex: cs.flex,
                    computedOverflow: cs.overflow,
                });
                node = node.parentElement;
                depth++;
            }
        }, []);

        // Self-contained sprite-sheet animation: load each unit's atlas and crop one frame.
        const { sheetUrls: atlasSheetUrls, resolveUnitFrame } = useUnitSpriteAtlas(units);

        // Asset loading
        const preloadUrls = useMemo(() => [...preloadAssets, ...atlasSheetUrls], [preloadAssets, atlasSheetUrls]);
        const { isLoading: assetsLoading, progress, loaded, total } = useAssetLoader({
            preloadUrls,
            loader: customAssetLoader,
        });

        // Event handlers with event bus integration
        const eventHandlers = useGameCanvas3DEvents({
            tileClickEvent,
            unitClickEvent,
            featureClickEvent,
            canvasClickEvent,
            tileHoverEvent,
            tileLeaveEvent,
            unitAnimationEvent,
            cameraChangeEvent,
            onTileClick,
            onUnitClick,
            onFeatureClick,
            onCanvasClick,
            onTileHover,
            onUnitAnimation,
        });

        // Use custom or global asset loader
        const loader = customAssetLoader || assetLoader;

        // Calculate grid bounds
        const gridBounds = useMemo(() => {
            if (tiles.length === 0) {
                return { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
            }
            const xs = tiles.map((t) => t.x);
            const zs = tiles.map((t) => t.z || t.y || 0);
            return {
                minX: Math.min(...xs),
                maxX: Math.max(...xs),
                minZ: Math.min(...zs),
                maxZ: Math.max(...zs),
            };
        }, [tiles]);

        // Calculate camera target (center of grid)
        const cameraTarget = useMemo(() => {
            return [
                (gridBounds.minX + gridBounds.maxX) / 2,
                0,
                (gridBounds.minZ + gridBounds.maxZ) / 2,
            ] as [number, number, number];
        }, [gridBounds]);

        // Grid config
        const gridConfig = useMemo(
            () => ({
                ...DEFAULT_GRID_CONFIG,
                offsetX: -(gridBounds.maxX - gridBounds.minX) / 2,
                offsetZ: -(gridBounds.maxZ - gridBounds.minZ) / 2,
            }),
            [gridBounds]
        );

        // Convert grid coordinates to world position.
        // NOT grid3D.ts::gridToWorld — that lib fn anchors on gridConfig.offsetX/Z
        // (centered: -(max-min)/2), while this anchors on gridBounds.minX/minZ directly.
        // The two conventions only coincide for specific bounds; swapping would move
        // every existing board's tiles, so the drift is intentional here.
        const gridToWorld = useCallback(
            (x: number, z: number, y: number = 0): [number, number, number] => {
                const worldX = (x - gridBounds.minX) * gridConfig.cellSize;
                const worldZ = (z - gridBounds.minZ) * gridConfig.cellSize;
                return [worldX, y * gridConfig.cellSize, worldZ];
            },
            [gridBounds, gridConfig]
        );

        // Neutral projector for drawable descriptors — mirrors `gridToWorld`'s
        // grid-bounds-anchored convention so a drawable at scene `{x,y,z}` lands
        // exactly where the data-prop mesh at grid `(x, z=y, elevation)` does.
        const drawableProjector = useMemo(
            () =>
                create3DProjector({
                    cellSize: gridConfig.cellSize,
                    offsetX: -gridBounds.minX * gridConfig.cellSize,
                    offsetZ: -gridBounds.minZ * gridConfig.cellSize,
                }),
            [gridBounds, gridConfig]
        );

        // Imperative handle
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
            export: () => ({
                tiles,
                units,
                features,
            }),
        }));

        // Handle tile click with event bus
        const handleTileClick = useCallback(
            (tile: IsometricTile, event: MinimalMouseEvent) => {
                eventHandlers.handleTileClick(tile, event);
            },
            [eventHandlers]
        );

        // Handle unit click with event bus
        const handleUnitClick = useCallback(
            (unit: IsometricUnit, event: MinimalMouseEvent) => {
                eventHandlers.handleUnitClick(unit, event);
            },
            [eventHandlers]
        );

        // Handle feature click with event bus
        const handleFeatureClick = useCallback(
            (feature: IsometricFeature, event: MinimalMouseEvent | null) => {
                if (event) {
                    eventHandlers.handleFeatureClick(feature, event);
                }
            },
            [eventHandlers]
        );

        // Handle tile hover with event bus
        const handleTileHover = useCallback(
            (tile: IsometricTile | null, event: MinimalMouseEvent | null) => {
                setHoveredTile(tile);
                if (event) {
                    eventHandlers.handleTileHover(tile, event);
                }
            },
            [eventHandlers]
        );

        // Camera configuration based on mode
        const cameraConfig = useMemo(() => {
            const size = Math.max(
                gridBounds.maxX - gridBounds.minX,
                gridBounds.maxZ - gridBounds.minZ,
                4  // minimum framing distance so a tiny board isn't zoomed in
            );
            // Offset from the grid centre so all camera modes frame the board correctly.
            const cx = (gridBounds.minX + gridBounds.maxX) / 2;
            const cz = (gridBounds.minZ + gridBounds.maxZ) / 2;
            // Distance ∝ grid size so framing is size-invariant. The canvas is wide-but-short
            // (fov is vertical), so 1.0 fills the frame; larger just adds empty margins.
            const d = size * 1.0;

            switch (cameraMode) {
                case 'isometric':
                    return {
                        position: [cx + d, d * 0.8, cz + d] as [number, number, number],
                        fov: 45,
                    };
                case 'top-down':
                    // Slight forward offset: an EXACTLY-overhead camera gimbal-locks
                    // OrbitControls (undefined azimuth at polar 0) → the board renders
                    // as a rotated diamond. A small tilt gives a steep angled top-down.
                    return {
                        position: [cx, d * 2, cz + d * 0.35] as [number, number, number],
                        fov: 45,
                    };
                case 'follow':
                    // Initial framing only — FollowCamera3D takes over per-frame.
                    return {
                        position: [cx, d * 0.5, cz + d] as [number, number, number],
                        fov: 45,
                    };
                case 'perspective':
                default:
                    return {
                        position: [cx + d, d, cz + d] as [number, number, number],
                        fov: 45,
                    };
            }
        }, [cameraMode, gridBounds]);

        // Follow target: the side-view player when present, else the selected unit,
        // else the grid centre.
        const followTarget = useMemo((): [number, number, number] => {
            if (player) {
                return [
                    (player.x + (player.width ?? 32) / 2) / pixelsPerUnit,
                    (worldHeight - player.y - (player.height ?? 48) / 2) / pixelsPerUnit,
                    0,
                ];
            }
            const selected = units.find((u) => u.id === selectedUnitId);
            if (selected) {
                const sx = selected.x ?? selected.position?.x ?? 0;
                const sz = selected.z ?? selected.y ?? selected.position?.y ?? 0;
                return [
                    (sx - gridBounds.minX) * gridConfig.cellSize,
                    0,
                    (sz - gridBounds.minZ) * gridConfig.cellSize,
                ];
            }
            return cameraTarget;
        }, [player, pixelsPerUnit, worldHeight, units, selectedUnitId, gridBounds, gridConfig, cameraTarget]);

        // Camera offset from the follow target. `chase` rotates the offset by the
        // followed unit's heading so the camera sits behind + above the vehicle
        // (forward = [sin h, 0, cos h]; behind = -forward). `follow` keeps a fixed
        // offset (side player, or a 3/4 view of the selected unit).
        const followOffset = useMemo((): [number, number, number] => {
            if (cameraMode === 'chase') {
                const selected = units.find((u) => u.id === selectedUnitId);
                const h = selected?.heading ?? 0;
                const dist = 7;
                const height = 4;
                return [-Math.sin(h) * dist, height, -Math.cos(h) * dist];
            }
            return player ? [0, 2, 9] : [5, 7, 5];
        }, [cameraMode, units, selectedUnitId, player]);

        // Loading state
        if (externalLoading || (assetsLoading && preloadAssets.length > 0)) {
            return (
                <Canvas3DLoadingState
                    progress={progress}
                    loaded={loaded}
                    total={total}
                    message={loadingMessage}
                    className={className}
                />
            );
        }

        // Error state
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
                    // Fill available flex/grid space from the parent; fall back to a
                    // 400 px floor so R3F's react-use-measure always gets a non-zero
                    // containing-block height on the first ResizeObserver tick.
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
                        // Absolutely fill the definite-height (`85vh`) `relative` container.
                        // R3F's react-use-measure won't reliably resolve a `height:100%`/`85vh`
                        // on its own element (canvas stays at the 150px HTML default), but an
                        // absolute `inset:0` gives it a concrete box from the parent's border-box.
                        style={{ background: backgroundColor, position: 'absolute', inset: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                eventHandlers.handleCanvasClick(e);
                            }
                        }}
                    >
                        <CameraController3D onCameraChange={eventHandlers.handleCameraChange} />
                        {(cameraMode === 'follow' || cameraMode === 'chase') && (
                            <FollowCamera3D
                                target={followTarget}
                                offset={followOffset}
                            />
                        )}

                        {/* Lighting — shadow params match the pre-decomposition inline rig
                            (bias/normalBias tuned against acne on flat low-poly faces; ±5/near0.5/far500
                            = three.js default directional-shadow frustum the board was tuned against). */}
                        <Lighting3D
                            shadows={shadows}
                            shadowBias={-0.0004}
                            shadowNormalBias={0.04}
                            shadowCameraSize={5}
                            shadowCameraNear={0.5}
                            shadowCameraFar={500}
                        />

                        {/* Grid */}
                        {showGrid && (
                            <Grid
                                args={[
                                    Math.max(gridBounds.maxX - gridBounds.minX + 2, 10),
                                    Math.max(gridBounds.maxZ - gridBounds.minZ + 2, 10),
                                ]}
                                position={[
                                    (gridBounds.maxX - gridBounds.minX) / 2 - 0.5,
                                    0,
                                    (gridBounds.maxZ - gridBounds.minZ) / 2 - 0.5,
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

                        {/* Board group. NOTE: `scale` is NOT applied here — in 3D the
                            camera auto-frames the grid (distance ∝ grid size), so scaling
                            the scene group shrinks everything while the camera stays put,
                            breaking the framing. Unit/board proportion is controlled by
                            `unitScale` (per-unit). `scale` is a 2D-only concept; in 3D it
                            is accepted for API parity but zoom is camera-driven. */}
                        {player ? (
                            /* Side-scroller mode — LOLO-owned pixel space mapped to world units */
                            <SideScene3D
                                player={player}
                                platforms={platforms}
                                worldHeight={worldHeight}
                                ppu={pixelsPerUnit}
                                playerSprite={playerSprite}
                                tileSprites={tileSprites}
                                interpolate={interpolateUnits}
                                features={features}
                                events={events}
                                assetManifest={assetManifest}
                            />
                        ) : (
                        <group>
                            {/* Tiles */}
                            {tiles.map((tile, index) => {
                                const position = gridToWorld(
                                    tile.x,
                                    tile.z ?? tile.y ?? 0,
                                    tile.elevation ?? 0
                                );
                                const key = tile.id ?? `tile-${index}`;
                                if (CustomTileRenderer) {
                                    return <CustomTileRenderer key={key} tile={tile} position={position} />;
                                }
                                return (
                                    <TileMesh3D
                                        key={key}
                                        tile={tile}
                                        position={position}
                                        model={tile.modelUrl ?? assetManifest?.terrains?.[tile.terrain ?? tile.type ?? '']}
                                        isSelected={tile.id ? selectedTileIds.includes(tile.id) : false}
                                        isHovered={hoveredTile?.id === tile.id}
                                        isValidMove={validMoves.some((m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0))}
                                        isAttackTarget={attackTargets.some((m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0))}
                                        onTileClick={handleTileClick}
                                        onTileHover={handleTileHover}
                                    />
                                );
                            })}

                            {/* Features */}
                            {features.map((feature, index) => {
                                const position = gridToWorld(
                                    feature.x,
                                    feature.z ?? feature.y ?? 0,
                                    (feature.elevation ?? 0) + TILE_TOP_OFFSET
                                );
                                const key = feature.id ?? `feature-${index}`;
                                if (CustomFeatureRenderer) {
                                    return <CustomFeatureRenderer key={key} feature={feature} position={position} />;
                                }
                                return (
                                    <FeatureMesh3D
                                        key={key}
                                        feature={feature}
                                        position={position}
                                        model={feature.assetUrl ?? assetManifest?.features?.[feature.type]}
                                        onFeatureClick={handleFeatureClick}
                                    />
                                );
                            })}

                            {/* Units — 2D-format `position:{x,y}` is the tactics-board contract;
                                explicit x/z (3D format) wins when present. */}
                            {units.map((unit) => {
                                const position = gridToWorld(
                                    unit.x ?? unit.position?.x ?? 0,
                                    unit.z ?? unit.y ?? unit.position?.y ?? 0,
                                    (unit.elevation ?? 0) + TILE_TOP_OFFSET
                                );
                                return (
                                    <LerpedGroup3D key={unit.id} target={position} enabled={interpolateUnits}>
                                        {CustomUnitRenderer ? (
                                            <CustomUnitRenderer unit={unit} position={[0, 0, 0]} />
                                        ) : (
                                            <UnitMesh3D
                                                unit={unit}
                                                position={[0, 0, 0]}
                                                model={unit.modelUrl ?? assetManifest?.units?.[unit.unitType ?? '']}
                                                isSelected={selectedUnitId === unit.id}
                                                unitScale={unitScale}
                                                cellSize={gridConfig.cellSize}
                                                resolveUnitFrame={resolveUnitFrame}
                                                onUnitClick={handleUnitClick}
                                            />
                                        )}
                                    </LerpedGroup3D>
                                );
                            })}

                            {/* Feedback markers — grid coords, lifetime LOLO-owned */}
                            {events.map((ev, i) => {
                                const position = gridToWorld(ev.x, ev.z ?? ev.y ?? 0, 0);
                                return (
                                    <EventMarker3D
                                        key={ev.id ?? `ev-${i}`}
                                        event={ev}
                                        position={[position[0], position[1] + 1.4, position[2]]}
                                    />
                                );
                            })}
                        </group>
                        )}

                        {/* Neutral drawable scene — the draw-host walk. Each descriptor
                            is mapped through Drawable3D to a mesh; raw descriptors never
                            reach `<group>{children}` (R3F throws). Same `children` vocabulary
                            as Canvas2D — this is what makes the two hosts one interface. */}
                        {drawables && drawables.length > 0 && (
                            <group>
                                {drawables.map((node, i) => (
                                    <Drawable3D key={i} node={node} projector={drawableProjector} />
                                ))}
                            </group>
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

                    {/* Coordinate overlay */}
                    {showCoordinates && hoveredTile && (
                        <div className="game-canvas-3d__coordinates">
                            X: {hoveredTile.x}, Z: {hoveredTile.z ?? hoveredTile.y ?? 0}
                        </div>
                    )}

                    {/* Tile info overlay */}
                    {showTileInfo && hoveredTile && (
                        <div className="game-canvas-3d__tile-info">
                            <div className="tile-info__type">{hoveredTile.type}</div>
                            {hoveredTile.terrain && (
                                <div className="tile-info__terrain">{hoveredTile.terrain}</div>
                            )}
                        </div>
                    )}
                </div>
            </Canvas3DErrorBoundary>
        );
    }
);

GameCanvas3D.displayName = 'GameCanvas3D';

export default GameCanvas3D;
