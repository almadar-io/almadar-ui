/**
 * FormSectionHeader
 *
 * Header component for collapsible form sections.
 * Provides consistent styling and interaction for section headers.
 */
import React from "react";
export interface FormSectionHeaderProps {
    /** Section title */
    title: string;
    /** Section subtitle */
    subtitle?: string;
    /** Whether section is collapsed */
    isCollapsed?: boolean;
    /** Toggle collapse handler (makes header clickable) */
    onToggle?: () => void;
    /** Badge text (e.g., "3 fields", "Required", "Complete") */
    badge?: string;
    /** Badge variant */
    badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
    /** Icon name to show before title */
    icon?: string;
    /** Whether section has validation errors */
    hasErrors?: boolean;
    /** Whether section is complete */
    isComplete?: boolean;
    /** Additional CSS classes */
    className?: string;
}
export declare const FormSectionHeader: React.FC<FormSectionHeaderProps>;
