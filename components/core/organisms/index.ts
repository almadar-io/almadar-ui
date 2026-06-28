// Shared organism types — base props contract for all entity-display organisms
export {
  type DisplayStateProps,
  type UiError,
  EntityDisplayEvents,
  type SortPayload,
  type PaginatePayload,
  type SearchPayload,
  type FilterPayload,
  type SelectPayload,
} from "./types";

// Shell organisms - common UI patterns
export {
  DataTable,
  type DataTableProps,
  type Column,
  type RowAction,
} from "./DataTable";
export { StatCard, type StatCardProps } from "./StatCard";

export {
  DetailPanel,
  type DetailPanelProps,
  type DetailField,
  type DetailSection,
} from "./DetailPanel";

// Migrated organisms
export { Form, type FormProps } from "./Form";

export { List, type ListProps, type ListItem } from "./List";
export { CardGrid, type CardGridProps, type CardGridGap } from "./CardGrid";
export { MasterDetail, type MasterDetailProps } from "./MasterDetail";

// Dialog organisms

// Orbital visualization

// State machine visualization
export {
  StateMachineView,
  DomStateMachineVisualizer,
  OrbitalStateMachineView,
  type StateMachineViewProps,
  type TransitionBundle,
} from "./StateMachineView";

// Jazari state machine visualization

// Content rendering

// Book viewer
export * from "./book/index";

// Layout organisms
export * from "./layout/index";

// Game organisms
export * from "../../game/2d/molecules/index";

// UI Slot system
export {
  UISlotRenderer,
  UISlotComponent,
  SlotContentRenderer,
  type UISlotRendererProps,
} from "./UISlotRenderer";
export { ModalSlot, type ModalSlotProps } from "./ModalSlot";
export { DrawerSlot, type DrawerSlotProps } from "./DrawerSlot";
export { ToastSlot, type ToastSlotProps } from "./ToastSlot";
export { NotifyListener } from "./NotifyListener";

// Phase 7b - New core pattern organisms

export {
  Timeline,
  type TimelineProps,
  type TimelineItem,
  type TimelineItemStatus,
} from "./Timeline";
export {
  MediaGallery,
  type MediaGalleryProps,
  type MediaItem,
} from "./MediaGallery";

// Debug organisms
export {
  RuntimeDebugger,
  type RuntimeDebuggerProps,
} from "./debug/index";

// Marketing organisms
export {
  HeroOrganism,
  type HeroOrganismProps,
} from "../../marketing/organisms/HeroOrganism";
export {
  FeatureGridOrganism,
  type FeatureGridOrganismProps,
} from "../../marketing/organisms/FeatureGridOrganism";
export {
  PricingOrganism,
  type PricingOrganismProps,
} from "../../marketing/organisms/PricingOrganism";
export {
  StatsOrganism,
  type StatsOrganismProps,
} from "../../marketing/organisms/StatsOrganism";
export {
  StepFlowOrganism,
  type StepFlowOrganismProps,
} from "../../marketing/organisms/StepFlowOrganism";
export {
  ShowcaseOrganism,
  type ShowcaseOrganismProps,
} from "../../marketing/organisms/ShowcaseOrganism";
export {
  TeamOrganism,
  type TeamOrganismProps,
} from "../../marketing/organisms/TeamOrganism";
export {
  CaseStudyOrganism,
  type CaseStudyOrganismProps,
} from "../../marketing/organisms/CaseStudyOrganism";

// Generative-UI primitives (math/code/lesson)
export {
  CodeRunnerPanel,
  type CodeRunnerPanelProps,
  type CodeSimulationOutput,
} from './CodeRunnerPanel';
export {
  SegmentRenderer,
  type SegmentRendererProps,
} from './SegmentRenderer';

// Agent-trace organisms (promoted from apps/builder). Read the agent-trace
// view-model (Trace* types) from @almadar/core; own no transport.
export { ChatBar, type ChatBarProps, type ChatBarStatus } from './ChatBar';
export {
  ELEMENT_SELECTED_EVENT,
  parseEditFocus,
} from './trace-edit-focus';
export {
  SubagentTracePanel,
  type SubagentTracePanelProps,
  type TraceDisclosureLevel,
} from './SubagentTracePanel';

// Phase 10: organisms moved to molecules (no entity binding) or expressed in std render-ui (domain-shaped).

