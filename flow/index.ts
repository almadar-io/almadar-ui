/**
 * @almadar/ui/flow
 *
 * OrbitalFlow — React Flow-based interactive graph editor for .orb structures.
 * Atoms are pure visual primitives. Molecules are custom React Flow node/edge types.
 */

// Flow Atoms
export {
  FlowPort,
  type FlowPortProps,
  FlowNodeShell,
  type FlowNodeShellProps,
  FlowLabel,
  type FlowLabelProps,
  type FlowLabelVariant,
  FlowWire,
  type FlowWireProps,
  type FlowWireType,
  type FlowWireStatus,
  type FlowWireStyle,
  getFlowWireStyle,
  FlowMinimap,
  type FlowMinimapProps,
  MINIMAP_COLORS,
} from '../components/atoms/flow';

// Flow Molecules — React Flow custom node types
export {
  FlowStateNode,
  type StateFlowNode,
  OrbitalNode,
  type OrbitalNodeData,
  type OrbitalFlowNode,
  BehaviorNode,
  type BehaviorNodeData,
  type BehaviorFlowNode,
  ExprNode,
  type ExprNodeData,
  type ExprFlowNode,
  EffectNode,
  type EffectNodeData,
  type EffectFlowNode,
} from '../components/molecules/flow';

// Flow Molecules — React Flow custom edge types
export {
  TransitionEdge,
  type TransitionEdgeData,
  type TransitionFlowEdge,
  EventWireEdge,
  type EventWireEdgeData,
  type EventWireFlowEdge,
} from '../components/molecules/flow';

// Flow Molecules — Sidebar
export {
  NodePalette,
  type NodePaletteProps,
  type NodePaletteCategory,
} from '../components/molecules/flow';
