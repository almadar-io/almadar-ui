import React from "react";
export interface FormSectionProps {
    /** Section title */
    title?: string;
    /** Section description */
    description?: string;
    /** Form fields */
    children: React.ReactNode;
    /** Collapsible */
    collapsible?: boolean;
    /** Default collapsed state */
    defaultCollapsed?: boolean;
    /** Use card wrapper */
    card?: boolean;
    /** Grid columns for fields */
    columns?: 1 | 2 | 3;
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
export declare const FormSection: React.FC<FormSectionProps>;
/**
 * Form layout with multiple sections
 */
export interface FormLayoutProps {
    children: React.ReactNode;
    /** Show section dividers */
    dividers?: boolean;
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
export declare const FormLayout: React.FC<FormLayoutProps>;
/**
 * Form actions bar (submit/cancel buttons)
 */
export interface FormActionsProps {
    children: React.ReactNode;
    /** Sticky at bottom */
    sticky?: boolean;
    /** Alignment */
    align?: "left" | "right" | "between" | "center";
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
export declare const FormActions: React.FC<FormActionsProps>;
