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
export * from "./book";

// Layout organisms
export * from "./layout";

// Game organisms
export * from "../../game/organisms";

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
} from "./debug";

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

// Phase 10: organisms moved to molecules (no entity binding) or expressed in std render-ui (domain-shaped).

// FeatureRenderer — surfaced from organisms/game/three/renderers so the
// `feature-renderer` pattern resolves through the top-level
// `@almadar/ui/components` barrel. The deeper three.js modules remain
// import-on-demand via `@almadar/ui/components/organisms/game/three`.
export { FeatureRenderer, type FeatureRendererProps } from '../../game/molecules/three/renderers/FeatureRenderer';
