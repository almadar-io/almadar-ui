/**
 * @almadar/ui/avl
 *
 * Almadar Visual Language (AVL) — Formal visual notation for .orb constructs.
 * V3: Unified with React Flow. AVL primitives render inside React Flow nodes.
 */

// AVL Atoms - Tier 1: Structural Primitives
export { AvlOrbital, type AvlOrbitalProps } from '../components/avl/atoms';
export { AvlEntity, type AvlEntityProps } from '../components/avl/atoms';
export { AvlTrait, type AvlTraitProps } from '../components/avl/atoms';
export { AvlPage, type AvlPageProps } from '../components/avl/atoms';
export { AvlApplication, type AvlApplicationProps } from '../components/avl/atoms';

// AVL Atoms - Tier 2: Behavioral Primitives
export { AvlState, type AvlStateProps } from '../components/avl/atoms';
export { AvlTransition, type AvlTransitionProps } from '../components/avl/atoms';
export { AvlEvent, type AvlEventProps } from '../components/avl/atoms';
export { AvlGuard, type AvlGuardProps } from '../components/avl/atoms';
export { AvlEffect, type AvlEffectProps } from '../components/avl/atoms';

// AVL Atoms - Tier 3: Data Primitives
export { AvlField, type AvlFieldProps } from '../components/avl/atoms';
export { AvlFieldType, type AvlFieldTypeProps } from '../components/avl/atoms';
export { AvlBinding, type AvlBindingProps } from '../components/avl/atoms';
export { AvlPersistence, type AvlPersistenceProps } from '../components/avl/atoms';

// AVL Atoms - Tier 4: Expression Primitives
export { AvlOperator, type AvlOperatorProps } from '../components/avl/atoms';
export { AvlSExpr, type AvlSExprProps } from '../components/avl/atoms';
export { AvlLiteral, type AvlLiteralProps } from '../components/avl/atoms';
export { AvlBindingRef, type AvlBindingRefProps } from '../components/avl/atoms';

// AVL Types + Constants
export type {
  AvlBaseProps,
  AvlEffectType,
  AvlFieldTypeKind,
  AvlPersistenceKind,
  AvlOperatorNamespace,
} from '../components/avl/atoms';
export { AVL_OPERATOR_COLORS, AVL_FIELD_TYPE_SHAPES } from '../components/avl/atoms';
// V2 color system
export type { StateRole, EffectCategory } from '../components/avl/atoms';
export { STATE_COLORS, EFFECT_CATEGORY_COLORS, EFFECT_TYPE_TO_CATEGORY, CONNECTION_COLORS, getStateRole } from '../components/avl/atoms';

// AVL Molecules (SVG composites)
export { AvlStateMachine, type AvlStateMachineProps, type AvlStateMachineState, type AvlStateMachineTransition } from '../components/avl/molecules';
export { AvlOrbitalUnit, type AvlOrbitalUnitProps, type AvlOrbitalUnitTrait, type AvlOrbitalUnitPage } from '../components/avl/molecules';
export { AvlClosedCircuit, type AvlClosedCircuitProps, type AvlClosedCircuitState, type AvlClosedCircuitTransition } from '../components/avl/molecules';
export { AvlEmitListen, type AvlEmitListenProps } from '../components/avl/molecules';
export { AvlSlotMap, type AvlSlotMapProps, type AvlSlotMapSlot } from '../components/avl/molecules';
export { AvlExprTree, type AvlExprTreeProps, type AvlExprTreeNode } from '../components/avl/molecules';
export { AvlBehaviorGlyph, type AvlBehaviorGlyphProps, type BehaviorLevel, type GlyphSize, type BehaviorGlyphChild, type BehaviorGlyphConnection, DOMAIN_COLORS } from '../components/avl/molecules';
export { AvlTransitionLane, type AvlTransitionLaneProps } from '../components/avl/molecules';
export { AvlSwimLane, type AvlSwimLaneProps } from '../components/avl/molecules';

// Layout utilities
export { ringPositions, arcPath, radialPositions, gridPositions, curveControlPoint } from '../components/avl/molecules';

// V3: Canvas types
export { type ZoomBand, type AvlNodeData, type AvlEdgeData, ZOOM_BAND_THRESHOLDS } from '../components/avl/molecules/avl-canvas-types';
export { computeZoomBand, zoomProgress, useZoomBand, ZoomBandContext } from '../components/avl/molecules/avl-zoom-band';
export { schemaToFlowGraph } from '../components/avl/molecules/avl-flow-converter';

// V3: React Flow node types
export { SystemNode } from '../components/avl/molecules/SystemNode';
export { ModuleCard } from '../components/avl/molecules/ModuleCard';
export { MiniStateMachine } from '../components/avl/molecules/MiniStateMachine';
export { BehaviorView } from '../components/avl/molecules/BehaviorView';
export { DetailView } from '../components/avl/molecules/DetailView';
export { AvlOrbitalNode } from '../components/avl/molecules/AvlOrbitalNode';

// V3: React Flow edge types
export { AvlTransitionEdge, type AvlTransitionEdgeData } from '../components/avl/molecules/AvlTransitionEdge';
export { AvlEventWireEdge, type AvlEventWireEdgeData } from '../components/avl/molecules/AvlEventWireEdge';
export { AvlBackwardEdge } from '../components/avl/molecules/AvlBackwardEdge';
export { AvlPageEdge } from '../components/avl/molecules/AvlPageEdge';
export { AvlBindingEdge } from '../components/avl/molecules/AvlBindingEdge';

// V3: ELK layout (shared)
export { computeTraitLayout, edgePath, type LayoutNode, type LayoutEdge, type ElkLayout } from '../components/avl/molecules/avl-elk-layout';

// V3 Revised: UI Projection components
export { type ViewLevel, type PreviewNodeData, type EventEdgeData, type PatternEventSource, type RenderUIEntry } from '../components/avl/molecules/avl-preview-types';
export { schemaToOverviewGraph, orbitalToExpandedGraph } from '../components/avl/molecules/avl-preview-converter';
export { OrbPreviewNode } from '../components/avl/molecules/OrbPreviewNode';
export { EventFlowEdge } from '../components/avl/molecules/EventFlowEdge';

// Canvas DnD (mirrors useDataDnd; pointer-sensor based so it works inside
// React Flow nodes — the HTML5 DnD path was swallowed by RF's pan/zoom).
export {
  CanvasDndProvider,
  useCanvasDraggable,
  useCanvasDroppable,
  type CanvasDragKind,
  type CanvasDragPayload,
  type CanvasContainerNode,
  type CanvasDropTarget,
  type CanvasDropEvent,
  type CanvasDndProviderProps,
  type UseCanvasDraggableArgs,
  type UseCanvasDraggableResult,
  type UseCanvasDroppableArgs,
  type UseCanvasDroppableResult,
} from '../components/avl/molecules/useCanvasDnd';

// V3 Revised: Behavior Compose
export { type ComposeViewLevel, type BehaviorComposeNodeData, type BehaviorWireEdgeData, type BehaviorCanvasEntry, type ConnectableEvent } from '../components/avl/molecules/avl-behavior-compose-types';
export { BehaviorComposeNode } from '../components/avl/molecules/BehaviorComposeNode';
export { behaviorsToComposeGraph, registryEntryToCanvasEntry, type BehaviorRegistryRecord } from '../components/avl/molecules/avl-behavior-compose-converter';

// OrbInspector
export { OrbInspector, type OrbInspectorProps } from '../components/avl/organisms/OrbInspector';

// AVL Organisms — Interactive Cosmic Zoom
export {
  FlowCanvas,
  type FlowCanvasProps,
  ZoomBreadcrumb,
  type ZoomBreadcrumbProps,
  ZoomLegend,
  type ZoomLegendProps,
  AvlCosmicZoom,
  type AvlCosmicZoomProps,
  AvlOrbitalsCosmicZoom,
  type AvlOrbitalsCosmicZoomProps,
  AvlTraitScene,
  type AvlTraitSceneProps,
  AvlTransitionScene,
  type AvlTransitionSceneProps,
  AvlClickTarget,
  type AvlClickTargetProps,
  parseApplicationLevel,
  parseOrbitalLevel,
  parseTraitLevel,
  parseTransitionLevel,
  type ApplicationLevelData,
  type OrbitalLevelData,
  type TraitLevelData,
  type TransitionLevelData,
  type CrossLink,
  type ZoomLevel,
} from '../components/avl/organisms';
