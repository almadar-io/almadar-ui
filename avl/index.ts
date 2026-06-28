/**
 * @almadar/ui/avl
 *
 * Almadar Visual Language (AVL) — Formal visual notation for .orb constructs.
 * V3: Unified with React Flow. AVL primitives render inside React Flow nodes.
 */

// AVL Atoms - Tier 1: Structural Primitives
export { AvlOrbital, type AvlOrbitalProps } from '../components/avl/atoms/index';
export { AvlEntity, type AvlEntityProps } from '../components/avl/atoms/index';
export { AvlTrait, type AvlTraitProps } from '../components/avl/atoms/index';
export { AvlPage, type AvlPageProps } from '../components/avl/atoms/index';
export { AvlApplication, type AvlApplicationProps } from '../components/avl/atoms/index';

// AVL Atoms - Tier 2: Behavioral Primitives
export { AvlState, type AvlStateProps } from '../components/avl/atoms/index';
export { AvlTransition, type AvlTransitionProps } from '../components/avl/atoms/index';
export { AvlEvent, type AvlEventProps } from '../components/avl/atoms/index';
export { AvlGuard, type AvlGuardProps } from '../components/avl/atoms/index';
export { AvlEffect, type AvlEffectProps } from '../components/avl/atoms/index';

// AVL Atoms - Tier 3: Data Primitives
export { AvlField, type AvlFieldProps } from '../components/avl/atoms/index';
export { AvlFieldType, type AvlFieldTypeProps } from '../components/avl/atoms/index';
export { AvlBinding, type AvlBindingProps } from '../components/avl/atoms/index';
export { AvlPersistence, type AvlPersistenceProps } from '../components/avl/atoms/index';

// AVL Atoms - Tier 4: Expression Primitives
export { AvlOperator, type AvlOperatorProps } from '../components/avl/atoms/index';
export { AvlSExpr, type AvlSExprProps } from '../components/avl/atoms/index';
export { AvlLiteral, type AvlLiteralProps } from '../components/avl/atoms/index';
export { AvlBindingRef, type AvlBindingRefProps } from '../components/avl/atoms/index';

// AVL Types + Constants
export type {
  AvlBaseProps,
  AvlEffectType,
  AvlFieldTypeKind,
  AvlPersistenceKind,
  AvlOperatorNamespace,
} from '../components/avl/atoms/index';
export { AVL_OPERATOR_COLORS, AVL_FIELD_TYPE_SHAPES } from '../components/avl/atoms/index';
// V2 color system
export type { StateRole, EffectCategory } from '../components/avl/atoms/index';
export { STATE_COLORS, EFFECT_CATEGORY_COLORS, EFFECT_TYPE_TO_CATEGORY, CONNECTION_COLORS, getStateRole } from '../components/avl/atoms/index';

// AVL Molecules (SVG composites)
export { AvlStateMachine, type AvlStateMachineProps, type AvlStateMachineState, type AvlStateMachineTransition } from '../components/avl/molecules/index';
export { AvlOrbitalUnit, type AvlOrbitalUnitProps, type AvlOrbitalUnitTrait, type AvlOrbitalUnitPage } from '../components/avl/molecules/index';
export { AvlClosedCircuit, type AvlClosedCircuitProps, type AvlClosedCircuitState, type AvlClosedCircuitTransition } from '../components/avl/molecules/index';
export { AvlEmitListen, type AvlEmitListenProps } from '../components/avl/molecules/index';
export { AvlSlotMap, type AvlSlotMapProps, type AvlSlotMapSlot } from '../components/avl/molecules/index';
export { AvlExprTree, type AvlExprTreeProps, type AvlExprTreeNode } from '../components/avl/molecules/index';
export { AvlBehaviorGlyph, type AvlBehaviorGlyphProps, type BehaviorLevel, type GlyphSize, type BehaviorGlyphChild, type BehaviorGlyphConnection, DOMAIN_COLORS } from '../components/avl/molecules/index';
export { AvlTransitionLane, type AvlTransitionLaneProps } from '../components/avl/molecules/index';
export { AvlSwimLane, type AvlSwimLaneProps } from '../components/avl/molecules/index';

// Layout utilities
export { ringPositions, arcPath, radialPositions, gridPositions, curveControlPoint } from '../components/avl/molecules/index';

// V3: Canvas types
export { type ZoomBand, type AvlNodeData, type AvlEdgeData, ZOOM_BAND_THRESHOLDS } from '../components/avl/types/avl-canvas-types';
export { computeZoomBand, zoomProgress, useZoomBand, ZoomBandContext } from '../components/avl/lib/avl-zoom-band';
export { schemaToFlowGraph } from '../components/avl/lib/avl-flow-converter';

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
export { computeTraitLayout, edgePath, type LayoutNode, type LayoutEdge, type ElkLayout } from '../components/avl/lib/avl-elk-layout';

// V3 Revised: UI Projection components
export { type ViewLevel, type PreviewNodeData, type EventEdgeData, type PatternEventSource, type RenderUIEntry } from '../components/avl/types/avl-preview-types';
export { schemaToOverviewGraph, orbitalToExpandedGraph } from '../components/avl/lib/avl-preview-converter';
export { OrbPreviewNode } from '../components/avl/molecules/OrbPreviewNode';
export { EventFlowEdge } from '../components/avl/molecules/EventFlowEdge';

// DOM → EditFocus (inspect primitive). Reads `data-orb-*` (incl. `data-orb-orbital`
// stamped by UISlotRenderer) off a clicked element so consumers (runtime-verify
// catalog, studio chatbox) can turn a rendered node into an EditFocus.
export { deriveEditFocusFromElement } from '../components/avl/derive-edit-focus';

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
} from '../components/avl/hooks/useCanvasDnd';

// V3 Revised: Behavior Compose
export { type ComposeViewLevel, type BehaviorComposeNodeData, type BehaviorWireEdgeData, type BehaviorCanvasEntry, type ConnectableEvent } from '../components/avl/types/avl-behavior-compose-types';
export { BehaviorComposeNode } from '../components/avl/molecules/BehaviorComposeNode';
export { behaviorsToComposeGraph, registryEntryToCanvasEntry, type BehaviorRegistryRecord } from '../components/avl/lib/avl-behavior-compose-converter';

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
} from '../components/avl/organisms/index';
