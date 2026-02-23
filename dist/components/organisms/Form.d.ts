/**
 * Form Organism Component
 *
 * A form container component with submit/reset handling.
 * Supports both children-based and schema-based form generation.
 * Renders correct input types based on field definitions including relations.
 *
 * Extended for inspection forms with:
 * - Conditional field visibility via S-expressions
 * - Hidden calculations that emit GLOBAL_VARIABLE_SET events
 * - Violation triggers that emit VIOLATION_DETECTED events
 * - Nested sections with collapsible support
 */
import React from "react";
import { type SelectOption } from "../atoms/Select";
import { type RelationOption } from "../molecules/RelationSelect";
import { type SExpr } from "@almadar/evaluator";
/**
 * S-Expression type for conditional logic (re-export from @almadar/evaluator)
 */
export type SExpression = SExpr;
/**
 * Form-specific evaluation context
 */
export interface FormEvaluationContext {
    formValues: Record<string, unknown>;
    globalVariables: Record<string, unknown>;
    localVariables?: Record<string, unknown>;
    entity?: Record<string, unknown>;
}
/**
 * Hidden calculation definition
 */
export interface HiddenCalculation {
    variableName: string;
    expression: SExpression;
    triggerFields: string[];
}
/**
 * Violation definition
 */
export interface ViolationDefinition {
    law: string;
    article: string;
    actionType: "measure" | "admin" | "penalty";
    message: string;
}
/**
 * Violation trigger definition
 */
export interface ViolationTrigger {
    condition: SExpression;
    violation: ViolationDefinition;
    fieldId?: string;
}
/**
 * Form section definition for nested sections
 */
export interface FormSection {
    id: string;
    title: string;
    condition?: SExpression;
    fields: SchemaField[];
    collapsible?: boolean;
}
/**
 * Form tab definition for tabbed inspection forms
 */
export interface FormTabDefinition {
    /** Unique tab identifier */
    id: string;
    /** Tab display label */
    label: string;
    /** Icon name for the tab (from Icon component) */
    icon?: string;
    /** Sections within this tab */
    sections: FormSection[];
    /** Condition for showing/hiding the entire tab */
    condition?: SExpression;
    /** Badge count or text to display on tab */
    badge?: string | number;
    /** Whether this tab has validation errors */
    hasErrors?: boolean;
}
/**
 * Relation configuration for foreign key fields
 */
export interface RelationConfig {
    /** Target entity name (e.g., 'User', 'Project') */
    entity: string;
    /** Field on target entity to display (defaults to 'name') */
    displayField?: string;
    /** Cardinality: one-to-one or one-to-many */
    cardinality?: "one" | "many";
}
/**
 * Schema field definition
 * Supports both 'name' and 'field' for compatibility with different schema formats
 */
export interface SchemaField {
    /** Field name (primary) */
    name?: string;
    /** Field name (alias for compatibility) */
    field?: string;
    /** Display label */
    label?: string;
    /** Field type (string, number, email, date, boolean, enum, relation, etc.) */
    type?: string;
    /** Input type for rendering (text, select, textarea, checkbox, etc.) */
    inputType?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Whether field is required */
    required?: boolean;
    /** Default value */
    defaultValue?: unknown;
    /** Options for select/enum fields - accepts readonly for generated const arrays */
    options?: readonly SelectOption[];
    /** Enum values (alternative to options, just strings) - accepts readonly for generated const arrays */
    values?: readonly string[];
    /** Relation configuration for foreign key references */
    relation?: RelationConfig;
    /** Minimum value (for number) or length (for string) */
    min?: number;
    /** Maximum value or length */
    max?: number;
    /** Pattern for validation */
    pattern?: string;
    /** Validation rules */
    validation?: Record<string, unknown>;
    /** Whether field is readonly (displays value but cannot edit) */
    readonly?: boolean;
    /** Whether field is disabled (alternative to readonly for compatibility) */
    disabled?: boolean;
}
/**
 * Form is the ONE EXCEPTION to the "no internal state" rule for organisms.
 * It manages local `formData` state for field input tracking.
 * See EntityDisplayProps in ./types.ts for documentation.
 */
export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
    /** Form fields (traditional React children) */
    children?: React.ReactNode;
    /** Submit event name for trait dispatch (emitted via eventBus as UI:{onSubmit}) */
    onSubmit?: string;
    /** Cancel event name for trait dispatch (emitted via eventBus as UI:{onCancel}) */
    onCancel?: string;
    /** Form layout */
    layout?: "vertical" | "horizontal" | "inline";
    /** Gap between fields */
    gap?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
    /** Entity type name (schema format) */
    entity?: string;
    /** Form mode - 'create' for new records, 'edit' for updating existing */
    mode?: "create" | "edit";
    /** Fields definition (schema format) - accepts readonly for generated const arrays */
    fields?: readonly Readonly<SchemaField>[];
    /** Initial form data */
    initialData?: Record<string, unknown> | unknown;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Submit button label */
    submitLabel?: string;
    /** Cancel button label (if provided, shows cancel button) */
    cancelLabel?: string;
    /** Show cancel button (defaults to true for schema forms) */
    showCancel?: boolean;
    /** Form title (used by ModalSlot to extract title) */
    title?: string;
    /** Event to dispatch on successful submit (defaults to 'SAVE') */
    submitEvent?: string;
    /** Event to dispatch on cancel (defaults to 'CANCEL') */
    cancelEvent?: string;
    /** Data for relation fields: { fieldName: RelationOption[] } */
    relationsData?: Record<string, readonly RelationOption[]>;
    /** Loading state for relation data: { fieldName: boolean } */
    relationsLoading?: Record<string, boolean>;
    /** Map of fieldId → S-expression condition for conditional field display (boolean true means enabled but config loaded separately) */
    conditionalFields?: Record<string, SExpression> | boolean;
    /** Hidden calculations that emit GLOBAL_VARIABLE_SET on field change (boolean true means enabled but config loaded separately) */
    hiddenCalculations?: HiddenCalculation[] | boolean;
    /** Violation conditions that emit VIOLATION_DETECTED when met (boolean true means enabled but config loaded separately) */
    violationTriggers?: ViolationTrigger[] | boolean;
    /** Context for S-expression evaluation - accepts flexible types from generated code */
    evaluationContext?: FormEvaluationContext | Record<string, unknown>;
    /** Nested form sections with optional conditions */
    sections?: FormSection[];
    /** Callback when any field value changes */
    onFieldChange?: (change: {
        fieldId: string;
        value: unknown;
        formValues: Record<string, unknown>;
    }) => void;
    /** Config path for form configuration (schema-driven) */
    configPath?: string;
    /** Whether the form supports repeatable entries */
    repeatable?: boolean;
}
export declare const Form: React.FC<FormProps>;
