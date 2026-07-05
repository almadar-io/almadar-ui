/**
 * Game 3D (three.js)
 *
 * Three.js components, hooks, loaders, renderers, and the GameCanvas3D family.
 * Code-split behind the `@almadar/ui/components/molecules/game/three` subpath.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
export { Scene3D, type Scene3DProps } from './Scene3D';
export { Camera3D, type Camera3DProps, type Camera3DHandle, type CameraMode } from './Camera3D';
export { Lighting3D, type Lighting3DProps } from './Lighting3D';

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------
export {
    Canvas3DLoadingState,
    type Canvas3DLoadingStateProps,
} from './Canvas3DLoadingState';
export {
    Canvas3DErrorBoundary,
    type Canvas3DErrorBoundaryProps,
    type Canvas3DErrorBoundaryState,
} from './Canvas3DErrorBoundary';
export {
    ModelLoader,
    type ModelLoaderProps,
} from './ModelLoader';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export {
    useThree,
    type UseThreeOptions,
    type UseThreeReturn,
} from '../hooks/useThree';

export {
    useAssetLoader,
    type UseAssetLoaderOptions,
    type UseAssetLoaderReturn,
    type AssetLoadingState,
} from '../hooks/useAssetLoader';

export {
    useSceneGraph,
    type UseSceneGraphReturn,
    type SceneGraphNode,
    type NodeType,
} from '../hooks/useSceneGraph';

export {
    useRaycaster,
    type UseRaycasterOptions,
    type UseRaycasterReturn,
    type RaycastHit,
    type GridHit,
} from '../hooks/useRaycaster';

export {
    useGameCanvas3DEvents,
    type UseGameCanvas3DEventsOptions,
    type UseGameCanvas3DEventsReturn,
    type GameCanvas3DEventConfig,
} from '../hooks/useGameCanvas3DEvents';

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------
export {
    AssetLoader,
    assetLoader,
    type LoadedModel,
} from '../lib/AssetLoader';

export type { UnitAnimationState } from '../../shared/spriteAnimationTypes';

// ---------------------------------------------------------------------------
// GameCanvas3D + Templates (re-exported here so the component registry can
// lazy-load ALL Three.js-dependent components from a single external path)
// ---------------------------------------------------------------------------
export { GameCanvas3D, type GameCanvas3DProps } from './GameCanvas3D';

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
export {
    gridToWorld,
    worldToGrid,
    raycastToPlane,
    raycastToObjects,
    gridDistance,
    gridManhattanDistance,
    getNeighbors,
    isInBounds,
    getCellsInRadius,
    createGridHighlight,
    normalizeMouseCoordinates,
    type Grid3DConfig,
    type GridCoordinate,
} from '../lib/grid3D';

// ---------------------------------------------------------------------------
// AVL 3D (exported here because Three.js-dependent, not from avl/index.ts)
// ---------------------------------------------------------------------------
export { Avl3DViewer, type Avl3DViewerProps } from '../../../avl/organisms/Avl3DViewer';
export { Avl3DApplicationScene, type Avl3DApplicationSceneProps } from '../../../avl/organisms/Avl3DApplicationScene';
export { Avl3DOrbitalScene, type Avl3DOrbitalSceneProps } from '../../../avl/organisms/Avl3DOrbitalScene';
export { Avl3DTraitScene, type Avl3DTraitSceneProps } from '../../../avl/organisms/Avl3DTraitScene';
export { Avl3DTransitionScene, type Avl3DTransitionSceneProps } from '../../../avl/organisms/Avl3DTransitionScene';
export { Avl3DEffects, type Avl3DEffectsProps } from '../../../avl/organisms/Avl3DEffects';
export { Avl3DContext, useAvl3DConfig, type Avl3DModelOverrides, type Avl3DConfig } from '../../../avl/providers/avl-3d-context';
export {
    AVL_3D_COLORS,
    CAMERA_POSITIONS,
    goldenSpiralPositions,
    fibonacciSpherePositions,
    orbitRingPositions,
    arcCurve3D,
    selfLoopCurve3D,
    treeLayout3D,
    type Position3D,
} from '../../../avl/lib/avl-3d-layout';

// ---------------------------------------------------------------------------
// Culling utils
// ---------------------------------------------------------------------------
export {
    isInFrustum,
    filterByFrustum,
    getVisibleIndices,
    calculateLODLevel,
    updateInstanceLOD,
    cullInstancedMesh,
    SpatialHashGrid,
    type CullingOptions,
    type LODLevel,
    type LODConfig,
} from '../lib/culling';
