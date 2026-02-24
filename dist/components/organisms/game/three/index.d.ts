import React__default, { Component, ReactNode, ErrorInfo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { I as IsometricTile, a as IsometricUnit, b as IsometricFeature } from '../../../../isometric-ynNHVPZx.js';

/**
 * Scene3D
 *
 * Three.js scene wrapper component for React Three Fiber.
 * Manages the scene environment, fog, and background.
 *
 * @packageDocumentation
 */

interface Scene3DProps {
    /** Background color or URL */
    background?: string;
    /** Fog configuration */
    fog?: {
        color: string;
        near: number;
        far: number;
    };
    /** Children to render in scene */
    children?: React__default.ReactNode;
}
/**
 * Scene3D Component
 *
 * Manages Three.js scene settings like background and fog.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Scene3D background="#1a1a2e" fog={{ color: '#1a1a2e', near: 10, far: 50 }}>
 *         <GameObjects />
 *     </Scene3D>
 * </Canvas>
 * ```
 */
declare function Scene3D({ background, fog, children }: Scene3DProps): React__default.JSX.Element;

/**
 * Camera3D
 *
 * Three.js camera component with orbit controls.
 * Supports isometric, perspective, and top-down camera modes.
 *
 * @packageDocumentation
 */

type CameraMode$1 = 'isometric' | 'perspective' | 'top-down';
interface Camera3DProps {
    /** Camera mode */
    mode?: CameraMode$1;
    /** Initial camera position */
    position?: [number, number, number];
    /** Target to look at */
    target?: [number, number, number];
    /** Zoom level */
    zoom?: number;
    /** Field of view (perspective mode only) */
    fov?: number;
    /** Enable orbit controls */
    enableOrbit?: boolean;
    /** Minimum zoom distance */
    minDistance?: number;
    /** Maximum zoom distance */
    maxDistance?: number;
    /** Called when camera changes */
    onChange?: (camera: THREE.Camera) => void;
}
interface Camera3DHandle {
    /** Get current camera */
    getCamera: () => THREE.Camera;
    /** Set camera position */
    setPosition: (x: number, y: number, z: number) => void;
    /** Look at target */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset to initial position */
    reset: () => void;
    /** Get current view bounds */
    getViewBounds: () => {
        min: THREE.Vector3;
        max: THREE.Vector3;
    };
}
/**
 * Camera3D Component
 *
 * Configurable camera with orbit controls and multiple modes.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Camera3D mode="isometric" position={[10, 10, 10]} target={[0, 0, 0]} />
 * </Canvas>
 * ```
 */
declare const Camera3D: React__default.ForwardRefExoticComponent<Camera3DProps & React__default.RefAttributes<Camera3DHandle>>;

/**
 * Lighting3D
 *
 * Default lighting setup for 3D game scenes.
 * Includes ambient, directional, and optional point lights.
 *
 * @packageDocumentation
 */

interface Lighting3DProps {
    /** Ambient light intensity */
    ambientIntensity?: number;
    /** Ambient light color */
    ambientColor?: string;
    /** Directional light intensity */
    directionalIntensity?: number;
    /** Directional light color */
    directionalColor?: string;
    /** Directional light position */
    directionalPosition?: [number, number, number];
    /** Enable shadows */
    shadows?: boolean;
    /** Shadow map size */
    shadowMapSize?: number;
    /** Shadow camera size */
    shadowCameraSize?: number;
    /** Show helper for directional light */
    showHelpers?: boolean;
}
/**
 * Lighting3D Component
 *
 * Pre-configured lighting setup for game scenes.
 *
 * @example
 * ```tsx
 * <Canvas>
 *     <Lighting3D
 *         ambientIntensity={0.6}
 *         directionalIntensity={1.0}
 *         shadows={true}
 *     />
 * </Canvas>
 * ```
 */
declare function Lighting3D({ ambientIntensity, ambientColor, directionalIntensity, directionalColor, directionalPosition, shadows, shadowMapSize, shadowCameraSize, showHelpers, }: Lighting3DProps): React__default.JSX.Element;

/**
 * Canvas3DLoadingState
 *
 * Loading state component for 3D canvas with progress indicator.
 * Displays asset loading progress and estimated time remaining.
 *
 * @packageDocumentation
 */

interface Canvas3DLoadingStateProps {
    /** Current loading progress (0-100) */
    progress?: number;
    /** Number of assets loaded */
    loaded?: number;
    /** Total assets to load */
    total?: number;
    /** Loading message */
    message?: string;
    /** Secondary details message */
    details?: string;
    /** Whether to show spinner */
    showSpinner?: boolean;
    /** Custom className */
    className?: string;
}
/**
 * Canvas3DLoadingState Component
 *
 * Displays loading progress for 3D assets.
 *
 * @example
 * ```tsx
 * <Canvas3DLoadingState
 *     progress={65}
 *     loaded={13}
 *     total={20}
 *     message="Loading 3D models..."
 *     details="character-knight.glb"
 * />
 * ```
 */
declare function Canvas3DLoadingState({ progress, loaded, total, message, details, showSpinner, className, }: Canvas3DLoadingStateProps): React__default.JSX.Element;

/**
 * Canvas3DErrorBoundary
 *
 * Error boundary for 3D canvas components.
 * Catches Three.js and React Three Fiber errors gracefully.
 *
 * @packageDocumentation
 */

interface Canvas3DErrorBoundaryProps {
    /** Child components */
    children: ReactNode;
    /** Custom fallback component */
    fallback?: ReactNode;
    /** Error callback */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Reset callback */
    onReset?: () => void;
}
interface Canvas3DErrorBoundaryState {
    /** Whether an error has occurred */
    hasError: boolean;
    /** The error that occurred */
    error: Error | null;
    /** Error info from React */
    errorInfo: ErrorInfo | null;
}
/**
 * Canvas3DErrorBoundary Component
 *
 * Catches errors in 3D canvas and displays a user-friendly fallback.
 *
 * @example
 * ```tsx
 * <Canvas3DErrorBoundary
 *     onError={(error) => console.error('3D Error:', error)}
 *     onReset={() => console.log('Resetting...')}
 * >
 *     <GameCanvas3D {...props} />
 * </Canvas3DErrorBoundary>
 * ```
 */
declare class Canvas3DErrorBoundary extends Component<Canvas3DErrorBoundaryProps, Canvas3DErrorBoundaryState> {
    constructor(props: Canvas3DErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Canvas3DErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleReset: () => void;
    render(): ReactNode;
}

/**
 * ModelLoader Component
 *
 * React Three Fiber component for loading and displaying GLB/GLTF models from URLs.
 * Handles loading states and errors without requiring React Suspense.
 *
 * @packageDocumentation
 */

interface ModelLoaderProps {
    /** URL to the GLB/GLTF model */
    url: string;
    /** Position [x, y, z] */
    position?: [number, number, number];
    /** Scale - either a single number or [x, y, z] */
    scale?: number | [number, number, number];
    /** Rotation in degrees [x, y, z] */
    rotation?: [number, number, number];
    /** Whether the model is selected */
    isSelected?: boolean;
    /** Whether the model is hovered */
    isHovered?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Hover handler */
    onHover?: (hovered: boolean) => void;
    /** Fallback geometry type */
    fallbackGeometry?: 'box' | 'sphere' | 'cylinder' | 'none';
    /** Enable shadows */
    castShadow?: boolean;
    /** Receive shadows */
    receiveShadow?: boolean;
    /**
     * Base path for shared resources (textures, materials).
     * If not provided, auto-detected from the URL by looking for a `/3d/` segment.
     * E.g. "https://host/3d/" so that "Textures/colormap.png" resolves correctly.
     */
    resourceBasePath?: string;
}
/**
 * ModelLoader component for rendering GLB models in React Three Fiber
 */
declare function ModelLoader({ url, position, scale, rotation, isSelected, isHovered, onClick, onHover, fallbackGeometry, castShadow, receiveShadow, resourceBasePath, }: ModelLoaderProps): React__default.JSX.Element;

/**
 * PhysicsObject3D Component
 *
 * Three.js component that syncs a 3D object's position with physics state.
 * Use this to render physics-enabled entities in GameCanvas3D.
 *
 * @example
 * ```tsx
 * <PhysicsObject3D
 *   entityId="player-1"
 *   modelUrl="https://trait-wars-assets.web.app/3d/medieval/props/barrels.glb"
 *   initialPosition={[0, 10, 0]}
 *   mass={1}
 * />
 * ```
 *
 * @packageDocumentation
 */

interface Physics3DState {
    id: string;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    rx: number;
    ry: number;
    rz: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    mass: number;
    state: 'Active' | 'Frozen';
}
interface PhysicsObject3DProps {
    /** Unique entity ID */
    entityId: string;
    /** GLB model URL */
    modelUrl: string;
    /** Initial position [x, y, z] */
    initialPosition?: [number, number, number];
    /** Initial velocity [vx, vy, vz] */
    initialVelocity?: [number, number, number];
    /** Mass for collision response */
    mass?: number;
    /** Gravity force (default: 9.8) */
    gravity?: number;
    /** Ground plane Y position (default: 0) */
    groundY?: number;
    /** Model scale */
    scale?: number | [number, number, number];
    /** Called when physics state updates */
    onPhysicsUpdate?: (state: Physics3DState) => void;
    /** Called when object hits ground */
    onGroundHit?: () => void;
    /** Called when collision occurs */
    onCollision?: (otherEntityId: string) => void;
}
/**
 * 3D Physics-enabled object for GameCanvas3D
 */
declare function PhysicsObject3D({ entityId, modelUrl, initialPosition, initialVelocity, mass, gravity, groundY, scale, onPhysicsUpdate, onGroundHit, onCollision, }: PhysicsObject3DProps): React__default.JSX.Element;
/**
 * Hook for controlling a PhysicsObject3D from parent component
 */
declare function usePhysics3DController(entityId: string): {
    applyForce: (fx: number, fy: number, fz: number) => void;
    setVelocity: (vx: number, vy: number, vz: number) => void;
    setPosition: (x: number, y: number, z: number) => void;
    jump: (force?: number) => void;
};

/**
 * AssetLoader
 *
 * Three.js asset loading manager for 3D models and textures.
 * Supports GLB/GLTF (primary), OBJ (fallback), and texture loading.
 * Implements caching for performance.
 *
 * @packageDocumentation
 */

interface LoadedModel {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
}
declare class AssetLoader {
    private objLoader;
    private textureLoader;
    private modelCache;
    private textureCache;
    private loadingPromises;
    constructor();
    /**
     * Load a GLB/GLTF model
     * @param url - URL to the .glb or .gltf file
     * @returns Promise with loaded model scene and animations
     */
    loadModel(url: string): Promise<LoadedModel>;
    /**
     * Load an OBJ model (fallback for non-GLB assets)
     * @param url - URL to the .obj file
     * @returns Promise with loaded object group
     */
    loadOBJ(url: string): Promise<THREE.Group>;
    /**
     * Load a texture
     * @param url - URL to the texture image
     * @returns Promise with loaded texture
     */
    loadTexture(url: string): Promise<THREE.Texture>;
    /**
     * Preload multiple assets
     * @param urls - Array of asset URLs to preload
     * @returns Promise that resolves when all assets are loaded
     */
    preload(urls: string[]): Promise<void>;
    /**
     * Check if a model is cached
     * @param url - Model URL
     */
    hasModel(url: string): boolean;
    /**
     * Check if a texture is cached
     * @param url - Texture URL
     */
    hasTexture(url: string): boolean;
    /**
     * Get cached model (throws if not cached)
     * @param url - Model URL
     */
    getModel(url: string): LoadedModel;
    /**
     * Get cached texture (throws if not cached)
     * @param url - Texture URL
     */
    getTexture(url: string): THREE.Texture;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        models: number;
        textures: number;
        loading: number;
    };
}
declare const assetLoader: AssetLoader;

type CameraMode = 'isometric' | 'perspective' | 'top-down';
interface UseThreeOptions {
    /** Camera mode for viewing the scene */
    cameraMode?: CameraMode;
    /** Initial camera position [x, y, z] */
    cameraPosition?: [number, number, number];
    /** Background color */
    backgroundColor?: string;
    /** Enable shadows */
    shadows?: boolean;
    /** Enable grid helper */
    showGrid?: boolean;
    /** Grid size */
    gridSize?: number;
    /** Asset loader instance */
    assetLoader?: AssetLoader;
}
interface UseThreeReturn {
    /** Canvas element reference (for React Three Fiber) */
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    /** Three.js renderer */
    renderer: THREE.WebGLRenderer | null;
    /** Three.js scene */
    scene: THREE.Scene | null;
    /** Three.js camera */
    camera: THREE.Camera | null;
    /** Orbit controls */
    controls: OrbitControls | null;
    /** Is scene ready */
    isReady: boolean;
    /** Canvas dimensions */
    dimensions: {
        width: number;
        height: number;
    };
    /** Set camera position */
    setCameraPosition: (x: number, y: number, z: number) => void;
    /** Look at a specific point */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset camera to initial position */
    resetCamera: () => void;
    /** Fit view to bounds */
    fitView: (bounds: {
        minX: number;
        maxX: number;
        minZ: number;
        maxZ: number;
    }) => void;
}
/**
 * Hook for managing a Three.js scene
 * This is a lower-level hook used by GameCanvas3D
 */
declare function useThree(options?: UseThreeOptions): UseThreeReturn;

interface UseAssetLoaderOptions {
    /** URLs to preload on mount */
    preloadUrls?: string[];
    /** Asset loader instance (uses singleton if not provided) */
    loader?: AssetLoader;
}
interface AssetLoadingState {
    /** Whether assets are currently loading */
    isLoading: boolean;
    /** Loading progress (0-100) */
    progress: number;
    /** Number of loaded assets */
    loaded: number;
    /** Total assets to load */
    total: number;
    /** Any loading errors */
    errors: string[];
}
interface UseAssetLoaderReturn extends AssetLoadingState {
    /** Load a single model */
    loadModel: (url: string) => Promise<LoadedModel>;
    /** Load a single OBJ model */
    loadOBJ: (url: string) => Promise<THREE.Group>;
    /** Load a single texture */
    loadTexture: (url: string) => Promise<THREE.Texture>;
    /** Preload multiple assets */
    preload: (urls: string[]) => Promise<void>;
    /** Check if model is cached */
    hasModel: (url: string) => boolean;
    /** Check if texture is cached */
    hasTexture: (url: string) => boolean;
    /** Get cached model */
    getModel: (url: string) => LoadedModel | undefined;
    /** Get cached texture */
    getTexture: (url: string) => THREE.Texture | undefined;
    /** Clear all caches */
    clearCache: () => void;
}
/**
 * Hook for managing 3D asset loading in React components
 *
 * @example
 * ```tsx
 * const { loadModel, isLoading, progress } = useAssetLoader({
 *     preloadUrls: ['/assets/model.glb']
 * });
 *
 * useEffect(() => {
 *     loadModel('/assets/character.glb').then((model) => {
 *         scene.add(model.scene);
 *     });
 * }, []);
 * ```
 */
declare function useAssetLoader(options?: UseAssetLoaderOptions): UseAssetLoaderReturn;

type NodeType = 'tile' | 'unit' | 'feature' | 'highlight' | 'effect';
interface SceneGraphNode {
    /** Unique node identifier */
    id: string;
    /** Node type classification */
    type: NodeType;
    /** Three.js object */
    mesh: THREE.Object3D;
    /** World position */
    position: {
        x: number;
        y: number;
        z: number;
    };
    /** Grid position */
    gridPosition: {
        x: number;
        z: number;
    };
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}
interface UseSceneGraphReturn {
    /** Reference to the nodes map */
    nodesRef: React.MutableRefObject<Map<string, SceneGraphNode>>;
    /** Add a node to the scene */
    addNode: (node: SceneGraphNode) => void;
    /** Remove a node from the scene */
    removeNode: (id: string) => void;
    /** Get a node by ID */
    getNode: (id: string) => SceneGraphNode | undefined;
    /** Update node position */
    updateNodePosition: (id: string, x: number, y: number, z: number) => void;
    /** Update node grid position */
    updateNodeGridPosition: (id: string, gridX: number, gridZ: number) => void;
    /** Get node at grid position */
    getNodeAtGrid: (x: number, z: number, type?: NodeType) => SceneGraphNode | undefined;
    /** Get all nodes of a specific type */
    getNodesByType: (type: NodeType) => SceneGraphNode[];
    /** Get all nodes within a bounding box */
    getNodesInBounds: (minX: number, maxX: number, minZ: number, maxZ: number) => SceneGraphNode[];
    /** Clear all nodes */
    clearNodes: () => void;
    /** Count nodes by type */
    countNodes: (type?: NodeType) => number;
}
/**
 * Hook for managing the 3D scene graph
 *
 * @example
 * ```tsx
 * const { addNode, removeNode, getNodeAtGrid } = useSceneGraph();
 *
 * // Add a tile
 * addNode({
 *     id: 'tile-0-0',
 *     type: 'tile',
 *     mesh: tileMesh,
 *     position: { x: 0, y: 0, z: 0 },
 *     gridPosition: { x: 0, z: 0 }
 * });
 * ```
 */
declare function useSceneGraph(): UseSceneGraphReturn;

interface RaycastHit {
    /** Intersected object */
    object: THREE.Object3D;
    /** Intersection point */
    point: THREE.Vector3;
    /** Distance from camera */
    distance: number;
    /** UV coordinates (if available) */
    uv?: THREE.Vector2;
    /** Face normal */
    face?: THREE.Face;
    /** Face index */
    faceIndex?: number;
    /** Instance ID (for instanced meshes) */
    instanceId?: number;
}
interface GridHit {
    /** Grid X coordinate */
    gridX: number;
    /** Grid Z coordinate */
    gridZ: number;
    /** World position */
    worldPosition: THREE.Vector3;
    /** Intersected object type */
    objectType?: 'tile' | 'unit' | 'feature';
    /** Object ID if available */
    objectId?: string;
}
interface UseRaycasterOptions {
    /** Camera reference */
    camera: THREE.Camera | null;
    /** Canvas element for coordinate conversion */
    canvas: HTMLCanvasElement | null;
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
}
interface UseRaycasterReturn {
    /** Raycaster instance */
    raycaster: React.MutableRefObject<THREE.Raycaster>;
    /** Mouse vector instance */
    mouse: React.MutableRefObject<THREE.Vector2>;
    /** Get intersection at client coordinates */
    getIntersection: (clientX: number, clientY: number, objects: THREE.Object3D[]) => RaycastHit | null;
    /** Get all intersections at client coordinates */
    getAllIntersections: (clientX: number, clientY: number, objects: THREE.Object3D[]) => RaycastHit[];
    /** Get grid coordinates at client position */
    getGridCoordinates: (clientX: number, clientY: number) => {
        x: number;
        z: number;
    } | null;
    /** Get tile at client position from scene */
    getTileAtPosition: (clientX: number, clientY: number, scene: THREE.Scene) => GridHit | null;
    /** Convert client coordinates to normalized device coordinates */
    clientToNDC: (clientX: number, clientY: number) => {
        x: number;
        y: number;
    };
    /** Check if point is within canvas bounds */
    isWithinCanvas: (clientX: number, clientY: number) => boolean;
}
/**
 * Hook for 3D raycasting operations
 *
 * @example
 * ```tsx
 * const { getIntersection, getGridCoordinates } = useRaycaster({
 *     camera,
 *     canvas: canvasRef.current
 * });
 *
 * const handleClick = (e: MouseEvent) => {
 *     const hit = getIntersection(e.clientX, e.clientY, tileMeshes);
 *     if (hit) {
 *         const grid = getGridCoordinates(e.clientX, e.clientY);
 *         console.log('Clicked grid:', grid);
 *     }
 * };
 * ```
 */
declare function useRaycaster(options: UseRaycasterOptions): UseRaycasterReturn;

interface GameCanvas3DEventConfig {
    /** Event name for tile clicks */
    tileClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
    /** Event name for feature clicks */
    featureClickEvent?: string;
    /** Event name for canvas clicks */
    canvasClickEvent?: string;
    /** Event name for tile hover */
    tileHoverEvent?: string;
    /** Event name for tile leave */
    tileLeaveEvent?: string;
    /** Event name for unit animation changes */
    unitAnimationEvent?: string;
    /** Event name for camera changes */
    cameraChangeEvent?: string;
}
interface UseGameCanvas3DEventsOptions extends GameCanvas3DEventConfig {
    /** Callback for tile clicks (direct) */
    onTileClick?: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Callback for unit clicks (direct) */
    onUnitClick?: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Callback for feature clicks (direct) */
    onFeatureClick?: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Callback for canvas clicks (direct) */
    onCanvasClick?: (event: React.MouseEvent) => void;
    /** Callback for tile hover (direct) */
    onTileHover?: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Callback for unit animation changes (direct) */
    onUnitAnimation?: (unitId: string, state: string) => void;
}
interface UseGameCanvas3DEventsReturn {
    /** Handle tile click - emits event and calls callback */
    handleTileClick: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Handle unit click - emits event and calls callback */
    handleUnitClick: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Handle feature click - emits event and calls callback */
    handleFeatureClick: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Handle canvas click - emits event and calls callback */
    handleCanvasClick: (event: React.MouseEvent) => void;
    /** Handle tile hover - emits event and calls callback */
    handleTileHover: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Handle unit animation - emits event and calls callback */
    handleUnitAnimation: (unitId: string, state: string) => void;
    /** Handle camera change - emits event */
    handleCameraChange: (position: {
        x: number;
        y: number;
        z: number;
    }) => void;
}
/**
 * Hook for integrating GameCanvas3D with the event bus
 *
 * Supports both declarative event props (tileClickEvent) and
 * direct callback props (onTileClick).
 *
 * @example
 * ```tsx
 * const events = useGameCanvas3DEvents({
 *     tileClickEvent: 'TILE_SELECTED',
 *     unitClickEvent: 'UNIT_SELECTED',
 *     onTileClick: (tile) => console.log('Tile:', tile)
 * });
 *
 * // In component:
 * <TileRenderer onTileClick={events.handleTileClick} />
 * ```
 */
declare function useGameCanvas3DEvents(options: UseGameCanvas3DEventsOptions): UseGameCanvas3DEventsReturn;

/**
 * TileRenderer
 *
 * Renders isometric tiles using Three.js InstancedMesh for performance.
 * Supports texture mapping and custom tile geometries.
 *
 * @packageDocumentation
 */

interface TileRendererProps {
    /** Array of tiles to render */
    tiles: IsometricTile[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Use instancing for performance */
    useInstancing?: boolean;
    /** Terrain color mapping */
    terrainColors?: Record<string, string>;
    /** Called when tile is clicked */
    onTileClick?: (tile: IsometricTile) => void;
    /** Called when tile is hovered */
    onTileHover?: (tile: IsometricTile | null) => void;
    /** Selected tile IDs */
    selectedTileIds?: string[];
    /** Valid move tile coordinates */
    validMoves?: Array<{
        x: number;
        z: number;
    }>;
    /** Attack target coordinates */
    attackTargets?: Array<{
        x: number;
        z: number;
    }>;
}
/**
 * TileRenderer Component
 *
 * Renders grid tiles with instancing for optimal performance.
 *
 * @example
 * ```tsx
 * <TileRenderer
 *     tiles={tiles}
 *     cellSize={1}
 *     onTileClick={handleTileClick}
 *     validMoves={[{ x: 1, z: 1 }]}
 * />
 * ```
 */
declare function TileRenderer({ tiles, cellSize, offsetX, offsetZ, useInstancing, terrainColors, onTileClick, onTileHover, selectedTileIds, validMoves, attackTargets, }: TileRendererProps): React__default.JSX.Element;

/**
 * UnitRenderer
 *
 * Renders animated units in the 3D scene.
 * Supports skeletal animations, health bars, and selection indicators.
 *
 * @packageDocumentation
 */

type UnitAnimationState = 'idle' | 'walk' | 'attack' | 'hurt' | 'die';
interface UnitRendererProps {
    /** Array of units to render */
    units: IsometricUnit[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Called when unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when unit animation state changes */
    onAnimationStateChange?: (unitId: string, state: UnitAnimationState) => void;
    /** Animation speed multiplier */
    animationSpeed?: number;
}
/**
 * UnitRenderer Component
 *
 * Renders all units in the scene.
 *
 * @example
 * ```tsx
 * <UnitRenderer
 *     units={units}
 *     cellSize={1}
 *     selectedUnitId="unit-1"
 *     onUnitClick={handleUnitClick}
 * />
 * ```
 */
declare function UnitRenderer({ units, cellSize, offsetX, offsetZ, selectedUnitId, onUnitClick, onAnimationStateChange, animationSpeed, }: UnitRendererProps): React__default.JSX.Element;

/**
 * FeatureRenderer
 *
 * Renders static features (trees, rocks, buildings) in the 3D scene.
 * Supports different feature types and selection states.
 *
 * @packageDocumentation
 */

interface FeatureRendererProps {
    /** Array of features to render */
    features: IsometricFeature[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Called when feature is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when feature is hovered */
    onFeatureHover?: (feature: IsometricFeature | null) => void;
    /** Selected feature IDs */
    selectedFeatureIds?: string[];
    /** Feature color overrides */
    featureColors?: Record<string, string>;
}
/**
 * FeatureRenderer Component
 *
 * Renders all features in the scene.
 *
 * @example
 * ```tsx
 * <FeatureRenderer
 *     features={features}
 *     cellSize={1}
 *     onFeatureClick={handleFeatureClick}
 * />
 * ```
 */
declare function FeatureRenderer({ features, cellSize, offsetX, offsetZ, onFeatureClick, onFeatureHover, selectedFeatureIds, featureColors, }: FeatureRendererProps): React__default.JSX.Element;

/**
 * FeatureRenderer3D
 *
 * Renders 3D features with GLB model loading from CDN.
 * Supports assetUrl property on features for external model loading.
 *
 * @packageDocumentation
 */

interface FeatureRenderer3DProps {
    /** Array of features to render */
    features: IsometricFeature[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Called when feature is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when feature is hovered */
    onFeatureHover?: (feature: IsometricFeature | null) => void;
    /** Selected feature IDs */
    selectedFeatureIds?: string[];
}
/**
 * FeatureRenderer3D Component
 *
 * Renders 3D features with GLB model loading support.
 *
 * @example
 * ```tsx
 * <FeatureRenderer3D
 *     features={[
 *         { id: 'gate', x: 0, y: 0, type: 'gate', assetUrl: 'https://.../gate.glb' }
 *     ]}
 *     cellSize={1}
 * />
 * ```
 */
declare function FeatureRenderer3D({ features, cellSize, offsetX, offsetZ, onFeatureClick, onFeatureHover, selectedFeatureIds, }: FeatureRenderer3DProps): React__default.JSX.Element;

declare function preloadFeatures(urls: string[]): void;

/**
 * Grid 3D Utilities
 *
 * Utility functions for 3D grid coordinate transformations,
 * raycasting, and spatial calculations for GameCanvas3D.
 *
 * @packageDocumentation
 */

interface Grid3DConfig {
    /** Size of each grid cell */
    cellSize: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Grid Y height (elevation) */
    elevation?: number;
}
interface GridCoordinate {
    x: number;
    y: number;
    z: number;
}
/**
 * Convert grid coordinates to world position
 * @param gridX - Grid X coordinate
 * @param gridZ - Grid Z coordinate
 * @param config - Grid configuration
 * @returns World position vector
 */
declare function gridToWorld(gridX: number, gridZ: number, config?: Grid3DConfig): THREE.Vector3;
/**
 * Convert world position to grid coordinates
 * @param worldX - World X position
 * @param worldZ - World Z position
 * @param config - Grid configuration
 * @returns Grid coordinates
 */
declare function worldToGrid(worldX: number, worldZ: number, config?: Grid3DConfig): {
    x: number;
    z: number;
};
/**
 * Raycast from camera through mouse position to find grid intersection
 * @param camera - Three.js camera
 * @param mouseX - Mouse X position (normalized -1 to 1)
 * @param mouseY - Mouse Y position (normalized -1 to 1)
 * @param planeY - Y height of the intersection plane (default: 0)
 * @returns Intersection point or null
 */
declare function raycastToPlane(camera: THREE.Camera, mouseX: number, mouseY: number, planeY?: number): THREE.Vector3 | null;
/**
 * Raycast from camera through mouse position against a set of objects
 * @param camera - Three.js camera
 * @param mouseX - Mouse X position (normalized -1 to 1)
 * @param mouseY - Mouse Y position (normalized -1 to 1)
 * @param objects - Array of objects to test
 * @returns First intersection or null
 */
declare function raycastToObjects(camera: THREE.Camera, mouseX: number, mouseY: number, objects: THREE.Object3D[]): THREE.Intersection | null;
/**
 * Calculate distance between two grid coordinates
 * @param a - First grid coordinate
 * @param b - Second grid coordinate
 * @returns Distance in grid units
 */
declare function gridDistance(a: {
    x: number;
    z: number;
}, b: {
    x: number;
    z: number;
}): number;
/**
 * Calculate Manhattan distance between two grid coordinates
 * @param a - First grid coordinate
 * @param b - Second grid coordinate
 * @returns Manhattan distance
 */
declare function gridManhattanDistance(a: {
    x: number;
    z: number;
}, b: {
    x: number;
    z: number;
}): number;
/**
 * Get neighboring grid cells
 * @param x - Center X coordinate
 * @param z - Center Z coordinate
 * @param includeDiagonal - Whether to include diagonal neighbors
 * @returns Array of neighbor coordinates
 */
declare function getNeighbors(x: number, z: number, includeDiagonal?: boolean): {
    x: number;
    z: number;
}[];
/**
 * Check if a grid coordinate is within bounds
 * @param x - X coordinate
 * @param z - Z coordinate
 * @param bounds - Bounds object
 * @returns Whether the coordinate is within bounds
 */
declare function isInBounds(x: number, z: number, bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}): boolean;
/**
 * Get all grid cells within a circular radius
 * @param centerX - Center X coordinate
 * @param centerZ - Center Z coordinate
 * @param radius - Radius in grid units
 * @returns Array of coordinates within radius
 */
declare function getCellsInRadius(centerX: number, centerZ: number, radius: number): {
    x: number;
    z: number;
}[];
/**
 * Create a highlight mesh for grid cells
 * @param color - Highlight color
 * @param opacity - Opacity (0-1)
 * @returns Mesh that can be positioned at grid cells
 */
declare function createGridHighlight(color?: number, opacity?: number): THREE.Mesh;
/**
 * Normalize mouse coordinates to NDC (-1 to 1)
 * @param clientX - Mouse client X
 * @param clientY - Mouse client Y
 * @param element - Canvas element
 * @returns Normalized coordinates
 */
declare function normalizeMouseCoordinates(clientX: number, clientY: number, element: HTMLElement): {
    x: number;
    y: number;
};

/**
 * Culling Utilities
 *
 * Frustum culling and LOD (Level of Detail) management for 3D scene optimization.
 *
 * @packageDocumentation
 */

interface CullingOptions {
    /** Camera frustum for culling */
    camera: THREE.Camera;
    /** Optional padding around frustum */
    padding?: number;
}
interface LODLevel {
    /** Distance threshold for this LOD level */
    distance: number;
    /** Geometry or mesh for this level */
    geometry?: THREE.BufferGeometry;
    /** Scale multiplier for this level */
    scale?: number;
    /** Whether to use simplified material */
    simpleMaterial?: boolean;
}
interface LODConfig {
    /** LOD levels from closest to farthest */
    levels: LODLevel[];
    /** Transition smoothness (0-1) */
    transitionSmoothness?: number;
}
/**
 * Frustum culling check for a position
 * @param position - World position to check
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Whether the position is within the frustum
 */
declare function isInFrustum(position: THREE.Vector3, camera: THREE.Camera, padding?: number): boolean;
/**
 * Filter an array of positions to only those within the frustum
 * @param positions - Array of world positions
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Array of positions within frustum
 */
declare function filterByFrustum(positions: THREE.Vector3[], camera: THREE.Camera, padding?: number): THREE.Vector3[];
/**
 * Get indices of visible items from an array
 * @param positions - Array of world positions
 * @param camera - Camera to check against
 * @param padding - Optional padding in world units
 * @returns Set of visible indices
 */
declare function getVisibleIndices(positions: THREE.Vector3[], camera: THREE.Camera, padding?: number): Set<number>;
/**
 * Calculate LOD level based on distance from camera
 * @param position - Object position
 * @param camera - Camera position
 * @param lodLevels - Array of distance thresholds (sorted closest to farthest)
 * @returns Index of the LOD level to use
 */
declare function calculateLODLevel(position: THREE.Vector3, camera: THREE.Camera, lodLevels: number[]): number;
/**
 * Create a distance-based LOD system for an instanced mesh
 * @param instancedMesh - The instanced mesh to manage
 * @param positions - Array of instance positions
 * @param camera - Camera to calculate distances from
 * @param lodDistances - Distance thresholds for LOD levels
 * @returns Array of LOD indices for each instance
 */
declare function updateInstanceLOD(instancedMesh: THREE.InstancedMesh, positions: THREE.Vector3[], camera: THREE.Camera, lodDistances: number[]): Uint8Array;
/**
 * Create visibility data for instanced mesh culling
 * Updates the instance matrix to hide/show instances
 * @param instancedMesh - The instanced mesh
 * @param positions - Array of instance positions
 * @param visibleIndices - Set of visible indices
 * @returns Updated count of visible instances
 */
declare function cullInstancedMesh(instancedMesh: THREE.InstancedMesh, positions: THREE.Vector3[], visibleIndices: Set<number>): number;
/**
 * Spatial hash grid for efficient object queries
 */
declare class SpatialHashGrid {
    private cellSize;
    private cells;
    private objectPositions;
    constructor(cellSize?: number);
    /**
     * Get cell key for a position
     */
    private getCellKey;
    /**
     * Insert an object into the grid
     */
    insert(id: string, position: THREE.Vector3): void;
    /**
     * Remove an object from the grid
     */
    remove(id: string): void;
    /**
     * Update an object's position
     */
    update(id: string, newPosition: THREE.Vector3): void;
    /**
     * Query objects within a radius of a position
     */
    queryRadius(center: THREE.Vector3, radius: number): string[];
    /**
     * Query objects within a bounding box
     */
    queryBox(minX: number, maxX: number, minZ: number, maxZ: number): string[];
    /**
     * Clear all objects from the grid
     */
    clear(): void;
    /**
     * Get statistics about the grid
     */
    getStats(): {
        objects: number;
        cells: number;
    };
}

export { AssetLoader, type AssetLoadingState, Camera3D, type Camera3DHandle, type Camera3DProps, type CameraMode$1 as CameraMode, Canvas3DErrorBoundary, type Canvas3DErrorBoundaryProps, type Canvas3DErrorBoundaryState, Canvas3DLoadingState, type Canvas3DLoadingStateProps, type CullingOptions, FeatureRenderer, FeatureRenderer3D, type FeatureRenderer3DProps, type FeatureRendererProps, type GameCanvas3DEventConfig, type Grid3DConfig, type GridCoordinate, type GridHit, type LODConfig, type LODLevel, Lighting3D, type Lighting3DProps, type LoadedModel, ModelLoader, type ModelLoaderProps, type NodeType, type Physics3DState, PhysicsObject3D, type PhysicsObject3DProps, type RaycastHit, Scene3D, type Scene3DProps, type SceneGraphNode, SpatialHashGrid, TileRenderer, type TileRendererProps, type UnitAnimationState, UnitRenderer, type UnitRendererProps, type UseAssetLoaderOptions, type UseAssetLoaderReturn, type UseGameCanvas3DEventsOptions, type UseGameCanvas3DEventsReturn, type UseRaycasterOptions, type UseRaycasterReturn, type UseSceneGraphReturn, type UseThreeOptions, type UseThreeReturn, assetLoader, calculateLODLevel, createGridHighlight, cullInstancedMesh, filterByFrustum, getCellsInRadius, getNeighbors, getVisibleIndices, gridDistance, gridManhattanDistance, gridToWorld, isInBounds, isInFrustum, normalizeMouseCoordinates, preloadFeatures, raycastToObjects, raycastToPlane, updateInstanceLOD, useAssetLoader, useGameCanvas3DEvents, usePhysics3DController, useRaycaster, useSceneGraph, useThree, worldToGrid };
