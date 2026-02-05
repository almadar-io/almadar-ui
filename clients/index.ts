/**
 * Client-specific components
 *
 * Re-exports all client design system components for use in the builder
 * and compiled shells.
 *
 * NOTE: Some exports renamed to avoid collisions with core molecules/organisms.
 * NOTE: trait-wars excluded due to asset import issues in build.
 */

// Blaz Klemenc - Fitness Training
export * from "./blaz-kelemnc";

// Builder - IDE components
export * from "./builder";

// Inspection System - explicit exports to avoid collisions
// (RepeatableFormSection and WizardStep conflict with core components)
export {
  LawReferenceBadge,
  type LawReferenceBadgeProps,
  PhaseIndicator,
  type PhaseIndicatorProps,
  type InspectionPhase,
  RuleCheckItem,
  type RuleCheckItemProps,
  type RuleSeverity,
  ProgressHeader,
  type ProgressHeaderProps,
  type ProgressStep,
  ConditionalField,
  type ConditionalFieldProps,
  type FieldType,
  type FieldCondition,
  type FieldOption,
  EntitySearch,
  type EntitySearchProps,
  type EntitySearchItem,
  ParticipantList,
  type ParticipantListProps,
  type Participant,
  PhotoAttachment,
  type PhotoAttachmentProps,
  type Photo,
  CardSelector,
  type CardSelectorProps,
  type CardSelectorOption,
  ObjectionRecorder,
  type ObjectionRecorderProps,
  type Objection,
  DocumentPreview,
  type DocumentPreviewProps,
  type DocumentStatus,
  InspectionTimeline,
  type InspectionTimelineProps,
  type TimelineItem,
  type TimelineEventType,
  ComplianceSummary,
  type ComplianceSummaryProps,
  type ComplianceStats,
  InspectorCard,
  type InspectorCardProps,
  type InspectorCardData,
  CompanyCard,
  type CompanyCardProps,
  type CompanyCardData,
  InspectionCard,
  type InspectionCardProps,
  type InspectionCardData,
  type InspectionStatus,
  InspectionChecklist,
  type InspectionChecklistProps,
  type ChecklistRule,
  ChecklistItem,
  type ChecklistItemProps,
  InspectionSummary,
  type InspectionSummaryProps,
  type InspectionSummaryData,
  ViolationForm,
  type ViolationFormProps,
  type ViolationFormData,
  ViolationListItem,
  type ViolationListItemProps,
  type ViolationListItemData,
  type ViolationSeverity,
  type ViolationStatus,
  EvidenceGallery,
  type EvidenceGalleryProps,
  type EvidencePhoto,
  EvidenceThumbnail,
  EvidenceThumbnailRow,
  type EvidenceThumbnailProps,
  type EvidenceThumbnailRowProps,
  InspectionWizardStep,
  WizardStepIndicator,
  type InspectionWizardStepProps,
  type WizardStepIndicatorProps,
  type StepStatus,
  CompanyInfoCard,
  type CompanyInfoCardProps,
  type CompanyInfoData,
  FloatingActionMenu,
  type FloatingActionMenuProps,
  type FloatingAction,
  SignatureCapture,
  type SignatureCaptureProps,
  InspectionsTemplate,
  type InspectionsTemplateProps,
  type InspectionData,
  CompaniesTemplate,
  type CompaniesTemplateProps,
  type CompanyData,
  InspectorsTemplate,
  type InspectorsTemplateProps,
  type InspectorData,
  InspectionWizardTemplate,
  type InspectionWizardTemplateProps,
  InspectionProcessTemplate,
  type InspectionProcessTemplateProps,
  InspectionFormDemoTemplate,
  type InspectionFormDemoTemplateProps,
} from "./inspection-system";

// Renamed exports for inspection-system to avoid collision
export {
  RepeatableFormSection as InspectionRepeatableFormSection,
  type RepeatableFormSectionProps as InspectionRepeatableFormSectionProps,
} from "./inspection-system/molecules/RepeatableFormSection";

export {
  type WizardStep as InspectionTemplateWizardStep,
} from "./inspection-system/templates/InspectionWizardTemplate";

// KFlow - Learning/Mind Maps
export * from "./kflow";

// Winning 11 - Trust/Relationships
export * from "./winning-11";
