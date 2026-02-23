/**
 * WizardContainer Component
 *
 * Multi-step wizard pattern with progress indicator.
 * Composes Box, Typography, and Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
/** Form field definition for wizard sections */
export interface WizardField {
    id: string;
    type: string;
    label?: string;
    required?: boolean;
    repeatable?: boolean;
    options?: Array<{
        value: string;
        label: string;
        isDefault?: boolean;
    }>;
    defaultValue?: unknown;
    condition?: unknown[];
    placeholder?: string;
    entityField?: string;
    minLength?: number;
    maxLength?: number;
    dataSource?: Record<string, unknown>;
    displayFields?: string[];
    searchConfig?: Record<string, unknown>;
    hiddenCalculations?: Array<{
        variable: string;
        expression: unknown;
        scope?: string;
    }>;
    signatureConfig?: Record<string, unknown>;
    displayTemplate?: Record<string, unknown>;
    lawReference?: Record<string, unknown>;
    contextMenu?: string[];
    calculated?: Record<string, unknown>;
    readOnly?: boolean;
    minDate?: unknown;
    stats?: Array<{
        label: string;
        value: unknown;
        icon?: string;
    }>;
    items?: Array<{
        id: string;
        label: string;
        autoCheck?: unknown;
    }>;
    [key: string]: unknown;
}
/** Section within a wizard step */
export interface WizardSection {
    id: string;
    title?: string;
    description?: string;
    fields?: WizardField[];
    subsections?: WizardSection[];
    condition?: unknown[];
    repeatable?: boolean;
    minItems?: number;
    addButtonLabel?: string;
    hiddenCalculations?: Array<{
        variable: string;
        expression: unknown;
        scope?: string;
    }>;
    dataSource?: Record<string, unknown>;
    readOnly?: boolean;
    [key: string]: unknown;
}
/** Entity mapping configuration */
export interface WizardEntityMapping {
    entity: string;
    mode: "search_or_create" | "create_multiple" | "select_one" | "update" | string;
    parentField?: string;
    idField?: string;
    [key: string]: unknown;
}
/** Validation rule for wizard steps */
export interface WizardValidationRule {
    condition: unknown[];
    message: string;
}
/** Law reference for compliance */
export interface WizardLawReference {
    law: string;
    article: string;
    description?: string;
}
export interface WizardStep {
    /** Step identifier */
    id?: string;
    /** Tab identifier (schema-driven) */
    tabId?: string;
    /** Step title */
    title?: string;
    /** Step name (schema-driven, used as title if title not provided) */
    name?: string;
    /** Step description (optional) */
    description?: string;
    /** Step content (React component mode) */
    content?: React.ReactNode;
    /** Whether this step can be skipped */
    optional?: boolean;
    /** Custom validation for this step */
    isValid?: () => boolean;
    /** Form sections within this step */
    sections?: WizardSection[];
    /** Global variables required before entering this step */
    globalVariablesRequired?: string[];
    /** Global variables set by this step */
    globalVariablesSet?: string[];
    /** Local variables scoped to this step */
    localVariables?: string[];
    /** Entity mapping configuration */
    entityMapping?: WizardEntityMapping;
    /** Validation rules for this step */
    validationRules?: WizardValidationRule[];
    /** Law references for compliance */
    lawReferences?: WizardLawReference[];
    /** Phase of the inspection process */
    phase?: string;
    /** Context menu actions */
    contextMenu?: string[];
    /** Allow additional properties from schema */
    [key: string]: unknown;
}
export interface WizardContainerProps {
    /** Wizard steps */
    steps: WizardStep[];
    /** Current step index (controlled) - accepts unknown for generated code compatibility */
    currentStep?: number | string | unknown;
    /** Callback when step changes */
    onStepChange?: (stepIndex: number) => void;
    /** Callback when wizard is completed */
    onComplete?: () => void;
    /** Show progress indicator */
    showProgress?: boolean;
    /** Allow navigation to previous steps */
    allowBack?: boolean;
    /** Modal mode (compact header, no padding) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity type name (schema-driven) */
    entity?: string;
}
/**
 * WizardContainer - Multi-step wizard
 */
export declare const WizardContainer: React.FC<WizardContainerProps>;
export default WizardContainer;
