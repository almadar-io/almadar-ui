/**
 * @almadar/ui/avl
 *
 * Almadar Visual Language (AVL) — Formal visual notation for .orb constructs.
 * V3: Unified with React Flow. AVL primitives render inside React Flow nodes.
 */

// AVL Atoms - Tier 1: Structural Primitives
export { AvlOrbital, type AvlOrbitalProps } from '../components/atoms/avl';
export { AvlEntity, type AvlEntityProps } from '../components/atoms/avl';
export { AvlTrait, type AvlTraitProps } from '../components/atoms/avl';
export { AvlPage, type AvlPageProps } from '../components/atoms/avl';
export { AvlApplication, type AvlApplicationProps } from '../components/atoms/avl';

// AVL Atoms - Tier 2: Behavioral Primitives
export { AvlState, type AvlStateProps } from '../components/atoms/avl';
export { AvlTransition, type AvlTransitionProps } from '../components/atoms/avl';
export { AvlEvent, type AvlEventProps } from '../components/atoms/avl';
export { AvlGuard, type AvlGuardProps } from '../components/atoms/avl';
export { AvlEffect, type AvlEffectProps } from '../components/atoms/avl';

// AVL Atoms - Tier 3: Data Primitives
export { AvlField, type AvlFieldProps } from '../components/atoms/avl';
export { AvlFieldType, type AvlFieldTypeProps } from '../components/atoms/avl';
export { AvlBinding, type AvlBindingProps } from '../components/atoms/avl';
export { AvlPersistence, type AvlPersistenceProps } from '../components/atoms/avl';

// AVL Atoms - Tier 4: Expression Primitives
export { AvlOperator, type AvlOperatorProps } from '../components/atoms/avl';
export { AvlSExpr, type AvlSExprProps } from '../components/atoms/avl';
export { AvlLiteral, type AvlLiteralProps } from '../components/atoms/avl';
export { AvlBindingRef, type AvlBindingRefProps } from '../components/atoms/avl';

// AVL Types + Constants
export type {
  AvlBaseProps,
  AvlEffectType,
  AvlFieldTypeKind,
  AvlPersistenceKind,
  AvlOperatorNamespace,
} from '../components/atoms/avl';
export { AVL_OPERATOR_COLORS, AVL_FIELD_TYPE_SHAPES } from '../components/atoms/avl';
// V2 color system
export type { StateRole, EffectCategory } from '../components/atoms/avl';
export { STATE_COLORS, EFFECT_CATEGORY_COLORS, EFFECT_TYPE_TO_CATEGORY, CONNECTION_COLORS, getStateRole } from '../components/atoms/avl';

// AVL Molecules (SVG composites)
export { AvlStateMachine, type AvlStateMachineProps, type AvlStateMachineState, type AvlStateMachineTransition } from '../components/molecules/avl';
export { AvlOrbitalUnit, type AvlOrbitalUnitProps, type AvlOrbitalUnitTrait, type AvlOrbitalUnitPage } from '../components/molecules/avl';
export { AvlClosedCircuit, type AvlClosedCircuitProps, type AvlClosedCircuitState, type AvlClosedCircuitTransition } from '../components/molecules/avl';
export { AvlEmitListen, type AvlEmitListenProps } from '../components/molecules/avl';
export { AvlSlotMap, type AvlSlotMapProps, type AvlSlotMapSlot } from '../components/molecules/avl';
export { AvlExprTree, type AvlExprTreeProps, type AvlExprTreeNode } from '../components/molecules/avl';
export { AvlBehaviorGlyph, type AvlBehaviorGlyphProps, type BehaviorLevel, type GlyphSize, type BehaviorGlyphChild, type BehaviorGlyphConnection, DOMAIN_COLORS } from '../components/molecules/avl';
export { AvlTransitionLane, type AvlTransitionLaneProps } from '../components/molecules/avl';
export { AvlSwimLane, type AvlSwimLaneProps } from '../components/molecules/avl';

// Layout utilities
export { ringPositions, arcPath, radialPositions, gridPositions, curveControlPoint } from '../components/molecules/avl';

// V3: Canvas types
export { type ZoomBand, type AvlNodeData, type AvlEdgeData, ZOOM_BAND_THRESHOLDS } from '../components/molecules/avl/avl-canvas-types';
export { computeZoomBand, zoomProgress, useZoomBand, ZoomBandContext } from '../components/molecules/avl/avl-zoom-band';
export { schemaToFlowGraph } from '../components/molecules/avl/avl-flow-converter';

// V3: React Flow node types
export { SystemNode } from '../components/molecules/avl/SystemNode';
export { ModuleCard } from '../components/molecules/avl/ModuleCard';
export { MiniStateMachine } from '../components/molecules/avl/MiniStateMachine';
export { BehaviorView } from '../components/molecules/avl/BehaviorView';
export { DetailView } from '../components/molecules/avl/DetailView';
export { AvlOrbitalNode } from '../components/molecules/avl/AvlOrbitalNode';

// V3: React Flow edge types
export { AvlTransitionEdge, type AvlTransitionEdgeData } from '../components/molecules/avl/AvlTransitionEdge';
export { AvlEventWireEdge, type AvlEventWireEdgeData } from '../components/molecules/avl/AvlEventWireEdge';
export { AvlBackwardEdge } from '../components/molecules/avl/AvlBackwardEdge';
export { AvlPageEdge } from '../components/molecules/avl/AvlPageEdge';
export { AvlBindingEdge } from '../components/molecules/avl/AvlBindingEdge';

// V3: ELK layout (shared)
export { computeTraitLayout, edgePath, type LayoutNode, type LayoutEdge, type ElkLayout } from '../components/molecules/avl/avl-elk-layout';

// V3 Revised: UI Projection components
export { type ViewLevel, type PreviewNodeData, type EventEdgeData, type PatternEventSource, type RenderUIEntry } from '../components/molecules/avl/avl-preview-types';
export { schemaToOverviewGraph, orbitalToExpandedGraph } from '../components/molecules/avl/avl-preview-converter';
export { OrbPreviewNode } from '../components/molecules/avl/OrbPreviewNode';
export { EventFlowEdge } from '../components/molecules/avl/EventFlowEdge';

// V3 Revised: Behavior Compose
export { type ComposeViewLevel, type BehaviorComposeNodeData, type BehaviorWireEdgeData, type BehaviorCanvasEntry, type ConnectableEvent } from '../components/molecules/avl/avl-behavior-compose-types';
export { BehaviorComposeNode } from '../components/molecules/avl/BehaviorComposeNode';
export { behaviorsToComposeGraph, registryEntryToCanvasEntry, type BehaviorRegistryRecord } from '../components/molecules/avl/avl-behavior-compose-converter';

// OrbInspector
export { OrbInspector, type OrbInspectorProps } from '../components/organisms/avl/OrbInspector';

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
} from '../components/organisms/avl';
