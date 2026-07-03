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
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Grid, Billboard, Text } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AssetLoader, assetLoader } from '../../shared/lib/AssetLoader';
import { useAssetLoader } from '../../shared/hooks/useAssetLoader';
import { useGameCanvas3DEvents, type MinimalMouseEvent } from '../../shared/hooks/useGameCanvas3DEvents';
import { Canvas3DLoadingState } from './Canvas3DLoadingState';
import { Canvas3DErrorBoundary } from './Canvas3DErrorBoundary';
import { ModelLoader } from './ModelLoader';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../../shared/isometricTypes';
import type { ResolvedFrame } from '../../shared/spriteAnimationTypes';
import { useUnitSpriteAtlas, unitAtlasUrl } from '../../shared/hooks/useUnitSpriteAtlas';
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

/**
 * Camera controller component for imperative handle integration
 */
function CameraController({
    onCameraChange,
}: {
    onCameraChange?: (pos: { x: number; y: number; z: number }) => void;
}): null {
    const { camera } = useThree();

    useEffect(() => {
        if (onCameraChange) {
            onCameraChange({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            });
        }
    }, [camera.position, onCameraChange]);

    return null;
}

/**
 * Billboarded sprite-sheet plane for a unit. Loads the atlas's PNG sheet as a
 * texture and crops a SINGLE frame via UV `repeat`/`offset`, advancing per
 * animation state. Mirrors the 2D canvas: one frame, never the whole sheet.
 */
function UnitSpriteBillboard({
    sheetUrl,
    resolveFrame,
    height = 1.2,
}: {
    sheetUrl: string;
    resolveFrame: () => ResolvedFrame | null;
    height?: number;
}): React.JSX.Element | null {
    const texture = useLoader(THREE.TextureLoader, sheetUrl);
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshBasicMaterial>(null);
    const [aspect, setAspect] = useState(1);

    useFrame(() => {
        const frame = resolveFrame();
        if (!frame || !texture.image) return;
        const imgW = texture.image.width as number;
        const imgH = texture.image.height as number;
        if (!imgW || !imgH) return;

        // Crop one frame: repeat = frame size / sheet size, offset from top-left.
        texture.repeat.set((frame.flipX ? -1 : 1) * (frame.sw / imgW), frame.sh / imgH);
        texture.offset.set(
            frame.flipX ? (frame.sx + frame.sw) / imgW : frame.sx / imgW,
            1 - (frame.sy + frame.sh) / imgH,
        );
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        const nextAspect = frame.sw / frame.sh;
        if (Math.abs(nextAspect - aspect) > 0.001) setAspect(nextAspect);

        if (matRef.current) matRef.current.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef} position={[0, height / 2, 0]}>
            <planeGeometry args={[height * aspect, height]} />
            <meshBasicMaterial
                ref={matRef}
                map={texture}
                transparent
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/**
 * Camera that smooth-tracks a world-space target (side-view player or selected unit).
 * OrbitControls is disabled while following — the camera is authoritative.
 */
function FollowCamera({
    target,
    offset,
}: {
    target: [number, number, number];
    offset: [number, number, number];
}): null {
    const { camera } = useThree();
    const look = useRef(new THREE.Vector3(target[0], target[1], target[2]));
    const goal = useRef(new THREE.Vector3());
    useFrame((_, delta) => {
        const t = Math.min(1, delta * 5);
        goal.current.set(target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]);
        camera.position.lerp(goal.current, t);
        look.current.lerp(goal.current.set(target[0], target[1], target[2]), t);
        camera.lookAt(look.current);
    });
    return null;
}

/**
 * Group that smooth-lerps toward its target position between LOLO tick snapshots
 * (the 3D analogue of Canvas2D's `interpolateUnits`). Disabled → snaps.
 */
function LerpedGroup({
    target,
    enabled,
    children,
}: {
    target: [number, number, number];
    enabled: boolean;
    children: React.ReactNode;
}): React.JSX.Element {
    const ref = useRef<THREE.Group>(null);
    const goal = useRef(new THREE.Vector3());
    useFrame((_, delta) => {
        const g = ref.current;
        if (!g) return;
        goal.current.set(target[0], target[1], target[2]);
        if (enabled) g.position.lerp(goal.current, Math.min(1, delta * 10));
        else g.position.copy(goal.current);
    });
    return (
        <group ref={ref} position={target}>
            {children}
        </group>
    );
}

/** Fallback platform colors by type — mirrors the 2D SideView palette. */
const SIDE_PLATFORM_COLORS: Record<string, string> = {
    ground: '#5b8c3e',
    platform: '#8b5a2b',
    hazard: '#cc4444',
    goal: '#4488cc',
};

/**
 * Side-scroller scene: renders the LOLO-owned pixel-space `player`/`platforms`
 * as 3D geometry. Physics stays in the board's tick (same contract as Canvas2D's
 * SideView) — this only maps px → world units and draws.
 */
function SideScene({
    player,
    platforms,
    worldHeight,
    ppu,
    playerSprite,
    tileSprites,
    interpolate,
    features = [],
    events = [],
    assetManifest,
}: {
    player: SidePlayer;
    platforms: Platform[];
    worldHeight: number;
    ppu: number;
    playerSprite?: Asset;
    tileSprites?: Record<string, Asset>;
    interpolate: boolean;
    /** Side-view features (collectibles/props) — x/y are PIXELS like platforms. */
    features?: IsometricFeature[];
    /** Feedback markers — x/y are PIXELS in side view. */
    events?: GameEvent[];
    assetManifest?: GameCanvas3DAssetManifest;
}): React.JSX.Element {
    const pw = player.width ?? 32;
    const ph = player.height ?? 48;
    const playerPos: [number, number, number] = [
        (player.x + pw / 2) / ppu,
        (worldHeight - player.y - ph) / ppu,
        0,
    ];
    const playerH = Math.max(ph / ppu, 0.5);
    return (
        <group>
            {platforms.map((p, i) => {
                const platformType = p.type ?? 'platform';
                const model = tileSprites?.[platformType]?.url;
                const topY = (worldHeight - p.y) / ppu;
                if (model) {
                    // Tile the platform with unit blocks, top edge on the AABB top.
                    const cells = Math.max(1, Math.round(p.width / ppu));
                    const x0 = p.x / ppu;
                    return (
                        <group key={`plat-${i}`}>
                            {Array.from({ length: cells }, (_, c) => (
                                <group key={c} position={[x0 + c + 0.5, topY - 0.475, 0]}>
                                    <ModelLoader url={model} scale={0.95} fallbackGeometry="box" castShadow receiveShadow />
                                </group>
                            ))}
                        </group>
                    );
                }
                // No model — exact AABB box in the 2D palette color.
                return (
                    <mesh
                        key={`plat-${i}`}
                        position={[(p.x + p.width / 2) / ppu, topY - p.height / 2 / ppu, 0]}
                    >
                        <boxGeometry args={[p.width / ppu, p.height / ppu, 1]} />
                        <meshStandardMaterial color={SIDE_PLATFORM_COLORS[platformType] ?? '#888888'} />
                    </mesh>
                );
            })}
            {/* Side-view features (collectibles/props) — pixel coords, LOLO owns pickup logic */}
            {features.map((feature, i) => {
                const model = feature.assetUrl ?? assetManifest?.features?.[feature.type];
                const fx = feature.x / ppu;
                const fy = (worldHeight - feature.y) / ppu;
                if (!model?.url) return null;
                return (
                    <group key={feature.id ?? `sfeat-${i}`} position={[fx, fy, 0]}>
                        <ModelLoader url={model.url} scale={0.6} tint={feature.color} fallbackGeometry="sphere" castShadow />
                    </group>
                );
            })}

            {/* Feedback markers — pixel coords */}
            {events.map((ev, i) => (
                <EventMarker
                    key={ev.id ?? `sev-${i}`}
                    event={ev}
                    position={[ev.x / ppu, (worldHeight - (ev.y ?? 0)) / ppu + 0.8, 0.2]}
                />
            ))}

            <LerpedGroup target={playerPos} enabled={interpolate}>
                {playerSprite?.url ? (
                    <group position={[0, playerH / 2, 0]}>
                        <ModelLoader
                            url={playerSprite.url}
                            scale={playerH}
                            rotation={[0, player.facingRight ? 90 : -90, 0]}
                            animation={player.animation ?? 'idle'}
                            fallbackGeometry="box"
                            castShadow
                        />
                    </group>
                ) : (
                    <mesh position={[0, playerH / 2, 0]}>
                        <capsuleGeometry args={[playerH * 0.25, playerH * 0.5, 4, 8]} />
                        <meshStandardMaterial color="#4488ff" />
                    </mesh>
                )}
            </LerpedGroup>
        </group>
    );
}

const UNIT_BASE_MODEL_SCALE = 0.5;
const UNIT_BASE_BILLBOARD_HEIGHT = 1.2;
const UNIT_BASE_PRIMITIVE_RADIUS = 0.3;
// Y offset that seats a base-pivoted unit/feature model on the tile surface.
// Tiles render flush at grid-Y (primitive plate is 0.2 tall → top ≈ 0.1; GLB
// terrain plates are similarly thin), so units/features sit just above that.
// NOT the old hardcoded +0.5, which floated Kenney GLBs ~½ cell above the board.
const TILE_TOP_OFFSET = 0.1;

/** Feedback colors by GameEvent.type — hit/damage red, heal/pickup green/gold, death dark, else white. */
const EVENT_COLORS: Record<string, string> = {
    hit: '#ff5544',
    damage: '#ff5544',
    attack: '#ff8844',
    heal: '#44dd66',
    pickup: '#ffcc33',
    score: '#ffcc33',
    death: '#aa3333',
    win: '#66ff88',
    lose: '#ff6666',
};

/**
 * Floating combat/feedback marker for one `GameEvent` — billboarded text above the
 * cell. Lifetime is LOLO-owned: boards append events on actions and expire them in
 * their tick (same contract as the 2D effects array).
 */
function EventMarker({
    event,
    position,
}: {
    event: GameEvent;
    position: [number, number, number];
}): React.JSX.Element {
    return (
        <Billboard position={position}>
            <Text
                fontSize={0.32}
                color={EVENT_COLORS[event.type] ?? '#ffffff'}
                outlineWidth={0.02}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
            >
                {event.message ?? event.type}
            </Text>
        </Billboard>
    );
}

/**
 * Default renderers live at MODULE scope so their component identity is stable.
 * Defining them inside GameCanvas3D (via useCallback) gave React a new component
 * type whenever a dep changed (hover, per-tick validMoves), which unmounted and
 * remounted every tile/unit/feature — reloading every GLB and flickering.
 */
function DefaultTile({
    tile,
    position,
    model,
    isSelected,
    isHovered,
    isValidMove,
    isAttackTarget,
    onTileClick,
    onTileHover,
}: {
    tile: IsometricTile;
    position: [number, number, number];
    model?: Asset;
    isSelected: boolean;
    isHovered: boolean;
    isValidMove: boolean;
    isAttackTarget: boolean;
    onTileClick: (tile: IsometricTile, event: MinimalMouseEvent) => void;
    onTileHover: (tile: IsometricTile | null, event: MinimalMouseEvent) => void;
}): React.JSX.Element {
    let color = 0x808080;
    if (tile.type === 'water') color = 0x4488cc;
    else if (tile.type === 'grass') color = 0x44aa44;
    else if (tile.type === 'sand') color = 0xddcc88;
    else if (tile.type === 'rock') color = 0x888888;
    else if (tile.type === 'snow') color = 0xeeeeee;

    let emissive = 0x000000;
    if (isSelected) emissive = 0x444444;
    else if (isAttackTarget) emissive = 0x440000;
    else if (isValidMove) emissive = 0x004400;
    else if (isHovered) emissive = 0x222222;

    // GLB tile (box fallback while loading / on error); the procedural
    // color/emissive path below is only for tiles without a model.
    if (model?.url) {
        return (
            <group
                position={position}
                onClick={(e) => onTileClick(tile, e)}
                onPointerEnter={(e) => onTileHover(tile, e)}
                onPointerLeave={(e) => onTileHover(null, e)}
                userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
            >
                <ModelLoader
                    url={model.url}
                    scale={0.95}
                    rotation={[0, tile.rotation ?? 0, 0]}
                    fallbackGeometry="box"
                    castShadow
                    receiveShadow
                />
            </group>
        );
    }

    return (
        <mesh
            position={position}
            onClick={(e) => onTileClick(tile, e)}
            onPointerEnter={(e) => onTileHover(tile, e)}
            onPointerLeave={(e) => onTileHover(null, e)}
            userData={{ type: 'tile', tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y }}
        >
            <boxGeometry args={[0.95, 0.2, 0.95]} />
            <meshStandardMaterial color={color} emissive={emissive} />
        </mesh>
    );
}

function DefaultUnit({
    unit,
    position,
    model,
    isSelected,
    unitScale,
    cellSize,
    resolveUnitFrame,
    onUnitClick,
}: {
    unit: IsometricUnit;
    position: [number, number, number];
    model?: Asset;
    isSelected: boolean;
    unitScale: number;
    cellSize: number;
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
    onUnitClick: (unit: IsometricUnit, event: MinimalMouseEvent) => void;
}): React.JSX.Element {
    const color = unit.faction === 'player' ? 0x4488ff : unit.faction === 'enemy' ? 0xff4444 : 0xffff44;
    const hasAtlas = unitAtlasUrl(unit) !== null;
    const initialFrame = hasAtlas ? resolveUnitFrame(unit.id) : null;

    const modelScale = UNIT_BASE_MODEL_SCALE * unitScale * cellSize;
    // Billboard height is proportional to one cell so units stay
    // tile-sized regardless of board dimensions or cellSize.
    const billboardHeight = UNIT_BASE_BILLBOARD_HEIGHT * unitScale * cellSize;
    const primitiveRadius = UNIT_BASE_PRIMITIVE_RADIUS * unitScale * cellSize;

    return (
        <group
            position={position}
            onClick={(e) => onUnitClick(unit, e)}
            userData={{ type: 'unit', unitId: unit.id }}
        >
            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                </mesh>
            )}

            {hasAtlas && initialFrame ? (
                /* Animated sprite-sheet billboard — single cropped frame, by state */
                <Billboard>
                    <UnitSpriteBillboard
                        sheetUrl={initialFrame.sheetUrl}
                        resolveFrame={() => resolveUnitFrame(unit.id)}
                        height={billboardHeight}
                    />
                </Billboard>
            ) : model?.url ? (
                /* GLB unit model — LOLO's `animation` field drives the named clip;
                   `heading` (radians) faces the model along its travel direction (driving). */
                <ModelLoader
                    url={model.url}
                    scale={modelScale}
                    rotation={[0, unit.heading ?? 0, 0]}
                    animation={unit.animation ?? 'idle'}
                    fallbackGeometry="box"
                    castShadow
                />
            ) : (
                <>
                    {/* Base */}
                    <mesh position={[0, primitiveRadius, 0]}>
                        <cylinderGeometry args={[primitiveRadius, primitiveRadius, primitiveRadius * 0.33, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>

                    {/* Body */}
                    <mesh position={[0, primitiveRadius * 2, 0]}>
                        <capsuleGeometry args={[primitiveRadius * 0.67, primitiveRadius * 1.33, 4, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>

                    {/* Head */}
                    <mesh position={[0, primitiveRadius * 3, 0]}>
                        <sphereGeometry args={[primitiveRadius * 0.4, 8, 8]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                </>
            )}

            {/* Health bar */}
            {unit.health !== undefined && unit.maxHealth !== undefined && (
                <group position={[0, billboardHeight, 0]}>
                    <mesh position={[-0.25, 0, 0]}>
                        <planeGeometry args={[0.5, 0.05]} />
                        <meshBasicMaterial color={0x333333} />
                    </mesh>
                    <mesh
                        position={[
                            -0.25 + (0.5 * (unit.health / unit.maxHealth)) / 2,
                            0,
                            0.01,
                        ]}
                    >
                        <planeGeometry args={[0.5 * (unit.health / unit.maxHealth), 0.05]} />
                        <meshBasicMaterial
                            color={
                                unit.health / unit.maxHealth > 0.5
                                    ? 0x44aa44
                                    : unit.health / unit.maxHealth > 0.25
                                      ? 0xaaaa44
                                      : 0xff4444
                            }
                        />
                    </mesh>
                </group>
            )}
        </group>
    );
}

function DefaultFeature({
    feature,
    position,
    model,
    onFeatureClick,
}: {
    feature: IsometricFeature;
    position: [number, number, number];
    model?: Asset;
    onFeatureClick: (feature: IsometricFeature, event: MinimalMouseEvent | null) => void;
}): React.JSX.Element | null {
    if (model?.url) {
        return (
            <ModelLoader
                url={model.url}
                position={position}
                scale={0.5}
                rotation={[0, feature.rotation ?? 0, 0]}
                tint={feature.color}
                onClick={() => onFeatureClick(feature, null)}
                fallbackGeometry="box"
            />
        );
    }

    if (feature.type === 'tree') {
        return (
            <group
                position={position}
                onClick={(e) => onFeatureClick(feature, e)}
                userData={{ type: 'feature', featureId: feature.id }}
            >
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
                    <meshStandardMaterial color={0x8b4513} />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                    <coneGeometry args={[0.5, 0.8, 8]} />
                    <meshStandardMaterial color={0x228b22} />
                </mesh>
            </group>
        );
    }

    if (feature.type === 'rock') {
        return (
            <mesh
                position={[position[0], position[1] + 0.3, position[2]]}
                onClick={(e) => onFeatureClick(feature, e)}
                userData={{ type: 'feature', featureId: feature.id }}
            >
                <dodecahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color={0x808080} />
            </mesh>
        );
    }

    return null;
}

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
            backgroundColor = '#1a1a2e',
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

        // Convert grid coordinates to world position
        const gridToWorld = useCallback(
            (x: number, z: number, y: number = 0): [number, number, number] => {
                const worldX = (x - gridBounds.minX) * gridConfig.cellSize;
                const worldZ = (z - gridBounds.minZ) * gridConfig.cellSize;
                return [worldX, y * gridConfig.cellSize, worldZ];
            },
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
            const d = size * 1.5;

            switch (cameraMode) {
                case 'isometric':
                    return {
                        position: [cx + d, d * 0.8, cz + d] as [number, number, number],
                        fov: 45,
                    };
                case 'top-down':
                    return {
                        position: [cx, d * 2, cz] as [number, number, number],
                        fov: 45,
                    };
                case 'follow':
                    // Initial framing only — FollowCamera takes over per-frame.
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

        // Default tile renderer

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
                        <CameraController onCameraChange={eventHandlers.handleCameraChange} />
                        {(cameraMode === 'follow' || cameraMode === 'chase') && (
                            <FollowCamera
                                target={followTarget}
                                offset={followOffset}
                            />
                        )}

                        {/* Lighting — bias tuned against shadow acne on flat low-poly faces */}
                        <ambientLight intensity={0.6} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={0.8}
                            castShadow={shadows}
                            shadow-mapSize={[2048, 2048]}
                            shadow-bias={-0.0004}
                            shadow-normalBias={0.04}
                        />
                        <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#362d1d" />

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
                                cellColor="#444444"
                                sectionSize={5}
                                sectionThickness={1.5}
                                sectionColor="#666666"
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
                            <SideScene
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
                                    <DefaultTile
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
                                    <DefaultFeature
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
                                    <LerpedGroup key={unit.id} target={position} enabled={interpolateUnits}>
                                        {CustomUnitRenderer ? (
                                            <CustomUnitRenderer unit={unit} position={[0, 0, 0]} />
                                        ) : (
                                            <DefaultUnit
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
                                    </LerpedGroup>
                                );
                            })}

                            {/* Feedback markers — grid coords, lifetime LOLO-owned */}
                            {events.map((ev, i) => {
                                const position = gridToWorld(ev.x, ev.z ?? ev.y ?? 0, 0);
                                return (
                                    <EventMarker
                                        key={ev.id ?? `ev-${i}`}
                                        event={ev}
                                        position={[position[0], position[1] + 1.4, position[2]]}
                                    />
                                );
                            })}
                        </group>
                        )}

                        {/* Custom children */}
                        {children}

                        {/* Camera controls — disabled while FollowCamera is authoritative */}
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
