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

// FeatureRenderer is three.js-backed (imports @react-three/fiber at module top)
// and is intentionally NOT exported here — a value export from this main-reachable
// barrel statically hoists @react-three/fiber into the main bundle for every app.
// It ships code-split behind the optional
// `@almadar/ui/components/molecules/game/three` subpath (see
// ../../game/molecules/three/patterns.ts) and renders lazily via the component
// registry. The pattern scanner reads that subpath, so no shadow export is needed.
