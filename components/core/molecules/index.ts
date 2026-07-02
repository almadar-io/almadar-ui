export { ErrorBoundary, type ErrorBoundaryProps } from './ErrorBoundary';
export { JsonTreeEditor, type JsonTreeEditorProps } from './JsonTreeEditor';
export { NodeSlotEditor, type NodeSlotEditorProps } from './NodeSlotEditor';
export { FileTree, type FileTreeProps, type FileTreeNode } from './FileTree';
export { FormField, type FormFieldProps } from './FormField';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { LoadingState, type LoadingStateProps } from './LoadingState';
export { ErrorState, type ErrorStateProps } from './ErrorState';
export { Skeleton, type SkeletonProps, type SkeletonVariant } from './Skeleton';

// Migrated molecules
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion';
export { Alert, type AlertProps, type AlertVariant } from './Alert';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './Breadcrumb';
export { ButtonGroup, type ButtonGroupProps } from './ButtonGroup';
export { FilterGroup, type FilterGroupProps, type FilterDefinition } from './FilterGroup';
export { Card as ActionCard, type CardProps as ActionCardProps, type CardAction } from './Card';
export { Container, type ContainerProps } from './Container';
export { Flex, type FlexProps } from './Flex';
export { FloatingActionButton, type FloatingActionButtonProps, type FloatingAction } from './FloatingActionButton';
export { Grid, type GridProps } from './Grid';
export { InputGroup, type InputGroupProps } from './InputGroup';
export { Menu, type MenuProps, type MenuItem } from './Menu';
export { Modal, type ModalProps, type ModalSize } from './Modal';
export { Pagination, type PaginationProps } from './Pagination';
export { Popover, type PopoverProps } from './Popover';
export {
  Coachmark,
  useAnchorRect,
  type CoachmarkProps,
  type CoachmarkPlacement,
  type CoachmarkAnchor,
} from './Coachmark';
export {
  OnboardingSpotlight,
  type OnboardingSpotlightProps,
  type SpotlightStep,
} from './OnboardingSpotlight';
export { RelationSelect, type RelationSelectProps, type RelationOption } from './RelationSelect';
export { SearchInput, type SearchInputProps } from './SearchInput';
export { SidePanel, type SidePanelProps } from './SidePanel';
export { SimpleGrid, type SimpleGridProps } from './SimpleGrid';
export { Tabs, type TabsProps, type TabItem } from './Tabs';
export { Toast, type ToastProps, type ToastVariant } from './Toast';
export { Tooltip, type TooltipProps } from './Tooltip';
export { Drawer, type DrawerProps, type DrawerPosition, type DrawerSize } from './Drawer';
export { WizardProgress, type WizardProgressProps, type WizardProgressStep } from './WizardProgress';
export { WizardNavigation, type WizardNavigationProps } from './WizardNavigation';

// Markdown components
export { MarkdownContent, type MarkdownContentProps } from './markdown/MarkdownContent';
export {
  CodeBlock,
  type CodeBlockProps,
  type CodeLanguage,
  type CodeViewerMode,
  type DiffLine,
  type CodeViewerFile,
  type CodeViewerAction,
  toCodeLanguage,
} from './markdown/CodeBlock';

// Quiz
export { QuizBlock, type QuizBlockProps } from './QuizBlock';

// Diagram scaling
export { ScaledDiagram, type ScaledDiagramProps } from './ScaledDiagram';

// Calendar
export { CalendarGrid, type CalendarGridProps } from './CalendarGrid';

// Inspection form components
export { RepeatableFormSection, type RepeatableFormSectionProps, type RepeatableItem } from './RepeatableFormSection';
export { ViolationAlert, type ViolationAlertProps, type ViolationRecord } from './ViolationAlert';
export { FormSectionHeader, type FormSectionHeaderProps } from './FormSectionHeader';
export { FlipCard, type FlipCardProps } from './FlipCard';
export {
  GridPicker,
  type GridPickerProps,
  type PickerItem,
  type GridPickerCellSize,
} from './GridPicker';
export { AssetPicker, type AssetPickerProps } from './AssetPicker';
export { IconPicker, type IconPickerProps } from './IconPicker';

// Chart molecules
export { DateRangePicker, type DateRangePickerProps, type DateRangePickerPreset } from './DateRangePicker';
export { DateRangeSelector, type DateRangeSelectorProps, type DateRangeSelectorOption } from './DateRangeSelector';
export { ChartLegend, type ChartLegendProps, type ChartLegendItem } from './ChartLegend';
export { LineChart, type LineChartProps, type ChartDataPoint } from './LineChart';
export { ProgressDots, type ProgressDotsProps, type DotState, type DotSize } from './ProgressDots';

// Game molecules
export * from '../../game/2d/molecules/index';

// Learning canvas molecules
export {
  MathCanvas,
  type MathCanvasProps,
  type MathCurve,
  type MathPoint,
  type MathVector,
} from '../../learning/molecules/MathCanvas';
export {
  PhysicsCanvas,
  type PhysicsCanvasProps,
  type LearningPhysicsBody,
  type LearningPhysicsConstraint,
} from '../../learning/molecules/PhysicsCanvas';
export {
  BiologyCanvas,
  type BiologyCanvasProps,
  type BiologyNode,
  type BiologyEdge,
} from '../../learning/molecules/BiologyCanvas';
export {
  ChemistryCanvas,
  type ChemistryCanvasProps,
  type ChemistryAtom,
  type ChemistryBond,
  type ChemistryArrow,
} from '../../learning/molecules/ChemistryCanvas';
export {
  AlgorithmCanvas,
  type AlgorithmCanvasProps,
  type AlgorithmBar,
  type AlgorithmCell,
  type AlgorithmPointer,
} from '../../learning/molecules/AlgorithmCanvas';

// Graph visualization
export { GraphView, type GraphViewProps, type GraphViewNode, type GraphViewEdge } from './GraphView';

// Map visualization
export { MapView, type MapViewProps, type MapMarkerData, type MapRouteData, type MapRouteWaypoint } from './MapView';

// UX Phase 1 molecules
export { NumberStepper, type NumberStepperProps, type NumberStepperSize } from './NumberStepper';
export { StarRating, type StarRatingProps, type StarRatingSize, type StarRatingPrecision } from './StarRating';
export { UploadDropZone, type UploadDropZoneProps } from './UploadDropZone';
export { Lightbox, type LightboxProps, type LightboxImage } from './Lightbox';

// Data iteration molecules (simplified from organisms)
export { DataGrid, type DataGridProps, type DataGridField, type DataGridItemAction } from './DataGrid';
export { DataList, type DataListProps, type DataListField, type DataListItemAction } from './DataList';
export { TableView, type TableViewProps, type TableViewColumn } from './TableView';

// Stat display molecule (behavior-safe replacement for StatCard organism)
export { StatDisplay, type StatDisplayProps } from './StatDisplay';

// Meter molecule (relocated from organisms - no entity prop)
export { Meter, type MeterProps, type MeterVariant, type MeterThreshold, type MeterAction } from './Meter';

// UX Phase 5 molecules
export { SwipeableRow, type SwipeableRowProps, type SwipeAction } from './SwipeableRow';
export { SortableList, type SortableListProps } from './SortableList';

// Carousel and PullToRefresh
export { Carousel, type CarouselProps } from './Carousel';
export { PullToRefresh, type PullToRefreshProps } from './PullToRefresh';

// Landing page / marketing molecules
export { InstallBox, type InstallBoxProps } from '../../marketing/molecules/InstallBox';
export { FeatureCard, type FeatureCardProps } from '../../marketing/molecules/FeatureCard';
export { FeatureGrid, type FeatureGridProps } from './FeatureGrid';
export { CTABanner, type CTABannerProps, type CTABannerBackground } from '../../marketing/molecules/CTABanner';
export { HeroSection, type HeroSectionProps } from '../../marketing/molecules/HeroSection';
export { PricingCard, type PricingCardProps } from '../../marketing/molecules/PricingCard';
export { PricingGrid, type PricingGridProps } from '../../marketing/molecules/PricingGrid';
export { StatsGrid, type StatsGridProps } from '../../marketing/molecules/StatsGrid';
export { ServiceCatalog, type ServiceCatalogProps, type ServiceCatalogItem } from '../../marketing/molecules/ServiceCatalog';
export { CaseStudyCard, type CaseStudyCardProps } from '../../marketing/molecules/CaseStudyCard';
export { ArticleSection, type ArticleSectionProps } from '../../marketing/molecules/ArticleSection';

export { SocialProof, type SocialProofProps, type SocialProofItem } from './SocialProof';
export { StepFlow, type StepFlowProps, type StepItemProps } from '../../marketing/molecules/StepFlow';
export { SplitSection, type SplitSectionProps } from '../../marketing/molecules/SplitSection';
export { TagCloud, type TagCloudProps, type TagCloudItem } from '../../marketing/molecules/TagCloud';
export { TagInput, type TagInputProps } from './TagInput';
export { CommunityLinks, type CommunityLinksProps } from '../../marketing/molecules/CommunityLinks';
export { TeamCard, type TeamCardProps } from '../../marketing/molecules/TeamCard';
export { ShowcaseCard, type ShowcaseCardProps } from '../../marketing/molecules/ShowcaseCard';

// Decorative pattern molecules
export { GeometricPattern, type GeometricPatternProps } from '../../marketing/molecules/GeometricPattern';
export { EdgeDecoration, type EdgeDecorationProps, type EdgeVariant, type EdgeSide } from './EdgeDecoration';

// Phase 10 molecules — generic primitives (community/forum, survey, content authoring, layout)
export { VoteStack, type VoteStackProps } from './VoteStack';
export { LikertScale, type LikertScaleProps, type LikertOption, DEFAULT_LIKERT_OPTIONS } from './LikertScale';
export { MatrixQuestion, type MatrixQuestionProps, type MatrixRow, type MatrixColumn, DEFAULT_MATRIX_COLUMNS } from './MatrixQuestion';
export { QrScanner, type QrScannerProps, type QrScanResult } from './QrScanner';
export { OptionConstraintGroup, type OptionConstraintGroupProps, type OptionConstraintOption, type OptionConstraint } from './OptionConstraintGroup';
export { PositionedCanvas, type PositionedCanvasProps, type CanvasItemStatus, type CanvasItemShape } from './PositionedCanvas';
// Demoted from organisms — no entity binding
export { RichBlockEditor, type RichBlockEditorProps, type RichBlock, type BlockType } from './RichBlockEditor';
export { ReplyTree, type ReplyTreeProps } from './ReplyTree';
export { BranchingLogicBuilder, type BranchingLogicBuilderProps, type BranchingQuestion, type BranchingRule } from './BranchingLogicBuilder';
export { VersionDiff, type VersionDiffProps, type DiffRevision, type DiffLine as VersionDiffLine, type DiffLineType } from './VersionDiff';

// Documentation molecules — public surface for std behaviors that render
// help-center / docs-style content (std-public-help-center,
// std-document-mgmt). Promoted alongside the G7 pattern-sync export filter.
export { DocBreadcrumb, type DocBreadcrumbProps, type DocBreadcrumbItem } from './DocBreadcrumb';
export { DocPagination, type DocPaginationProps, type DocPaginationLink } from './DocPagination';
export { DocSearch, type DocSearchProps, type DocSearchResult } from './DocSearch';
export { DocSidebar, type DocSidebarProps, type DocSidebarItem } from './DocSidebar';
export { DocTOC, type DocTOCProps, type DocTOCItem } from './DocTOC';

// Marketing-page molecules — used by std-marketing-campaign render-ui.
export { GradientDivider, type GradientDividerProps } from './GradientDivider';
export { MarketingFooter, type MarketingFooterProps, type FooterLinkColumn, type FooterLinkItem } from '../../marketing/molecules/MarketingFooter';
export { PullQuote, type PullQuoteProps } from '../../marketing/molecules/PullQuote';

// AVL (Almadar Visual Language) molecules surfaced for std behaviors
// (behavior-view, module-card).
export { BehaviorView, type BehaviorViewProps } from '../../avl/molecules/BehaviorView';
export { ModuleCard, type ModuleCardProps } from '../../avl/molecules/ModuleCard';

// Relocated from organisms (presentational — no entity manipulation)
export {
  PageHeader,
  type PageHeaderProps,
  type PageBreadcrumb,
} from "./PageHeader";
export {
  FormSection,
  FormLayout,
  FormActions,
  type FormSectionProps,
  type FormLayoutProps,
  type FormActionsProps,
} from "./FormSection";
export { PropertyInspector, type PropertyInspectorProps } from "./PropertyInspector";
export { Header, type HeaderProps } from "./Header";
export {
  Navigation,
  type NavigationProps,
  type NavigationItem,
} from "./Navigation";
export { Section, type SectionProps } from "./Section";
export { Sidebar, type SidebarProps, type SidebarItem } from "./Sidebar";
export { Split, type SplitProps } from "./Split";
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
} from "./ConfirmDialog";
export {
  WizardContainer,
  type WizardContainerProps,
  type WizardStep,
} from "./WizardContainer";
export {
  OrbitalVisualization,
  type OrbitalVisualizationProps,
} from "./OrbitalVisualization";
export {
  JazariStateMachine,
  type JazariStateMachineProps,
} from "./JazariStateMachine";
export {
  ContentRenderer,
  type ContentRendererProps,
} from "./ContentRenderer";
export {
  Chart,
  type ChartProps,
  type ChartType,
  type ChartSeries,
} from "./Chart";
export {
  SignaturePad,
  type SignaturePadProps,
} from "./SignaturePad";
export {
  DocumentViewer,
  type DocumentViewerProps,
  type DocumentType,
} from "./DocumentViewer";
export {
  GraphCanvas,
  type GraphCanvasProps,
  type GraphNode,
  type GraphEdge,
} from "./GraphCanvas";

// Learning-science molecules (generative-UI primitives)
export { ActivationBlock, type ActivationBlockProps } from './ActivationBlock';
export { ReflectionBlock, type ReflectionBlockProps } from './ReflectionBlock';
export { ConnectionBlock, type ConnectionBlockProps } from './ConnectionBlock';
export { BloomQuizBlock, type BloomQuizBlockProps, type BloomLevel } from './BloomQuizBlock';
export { parseLessonSegments, type LessonSegment, type LessonUserProgress } from './parseLessonSegments';
export { parseMarkdownWithCodeBlocks, type MixedSegment } from './lessonSegmentUtils';
