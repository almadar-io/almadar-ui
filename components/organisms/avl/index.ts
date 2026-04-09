/**
 * AVL Organisms - Interactive orbital visualizations.
 *
 * V3: FlowCanvas is the primary organism. AvlCosmicZoom delegates to it.
 *
 * @packageDocumentation
 */

// Primary V3 organisms
export { FlowCanvas, type FlowCanvasProps } from './FlowCanvas';
export { OrbInspector, type OrbInspectorProps } from './OrbInspector';
export { ZoomBreadcrumb, type ZoomBreadcrumbProps } from './ZoomBreadcrumb';
export { ZoomLegend, type ZoomLegendProps } from './ZoomLegend';

// Facade (preserves V2 interface)
export { AvlCosmicZoom, type AvlCosmicZoomProps } from './AvlCosmicZoom';

// Pure SVG orbital interaction visualization (for docs, no React Flow)
export { AvlOrbitalsCosmicZoom, type AvlOrbitalsCosmicZoomProps } from './AvlOrbitalsCosmicZoom';

// Retained scene renderers (used by BehaviorView and DetailView internally)
export { AvlTraitScene, type AvlTraitSceneProps } from './AvlTraitScene';
export { AvlTransitionScene, type AvlTransitionSceneProps } from './AvlTransitionScene';

// Utilities
export { AvlClickTarget, type AvlClickTargetProps } from './AvlClickTarget';
export { AvlLegend, type AvlLegendProps } from './AvlLegend';

// Parser
export {
  parseApplicationLevel,
  parseOrbitalLevel,
  parseTraitLevel,
  parseTransitionLevel,
  type ApplicationLevelData,
  type OrbitalLevelData,
  type TraitLevelData,
  type TransitionLevelData,
  type CrossLink,
  type ExprTreeNode,
} from './avl-schema-parser';

// Zoom state
export {
  zoomReducer,
  initialZoomState,
  getBreadcrumbs,
  type ZoomLevel,
  type ZoomState,
  type ZoomAction,
  type BreadcrumbSegment,
} from './avl-zoom-state';
