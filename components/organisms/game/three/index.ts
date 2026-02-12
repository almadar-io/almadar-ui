/**
 * Three.js Subdirectory
 *
 * Core Three.js components, hooks, loaders, and utilities for GameCanvas3D.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export { useThree, type UseThreeOptions, type UseThreeReturn, type CameraMode } from './hooks/useThree';

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------
export {
    AssetLoader,
    assetLoader,
    type LoadedModel,
} from './loaders/AssetLoader';

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
} from './utils/grid3D';
