/**
 * ButtonGroup Molecule Component
 *
 * A component for grouping buttons together with connected styling.
 * Supports both children-based and form-actions pattern (primary/secondary) usage.
 * Uses Button atoms.
 */
import React from 'react';
export type ButtonGroupVariant = 'default' | 'segmented' | 'toggle';
/** Action button config for form-actions pattern */
export interface ActionButton {
    label: string;
    /** Action type - 'submit' renders as submit button, others render as button */
    actionType?: string;
    event?: string;
    navigatesTo?: string;
    /** Button variant - matches Button component variants. Accepts string for schema compatibility. */
    variant?: string;
}
/** Filter definition for filter-group pattern */
export interface FilterDefinition {
    field: string;
    label: string;
    /** Filter type (checkbox, select, etc.) */
    type?: 'checkbox' | 'select' | 'toggle';
    /** Options for select filters */
    options?: readonly string[];
}
export interface ButtonGroupProps {
    /**
     * Button group content (Button components) - use this OR primary/secondary
     */
    children?: React.ReactNode;
    /**
     * Primary action button config (for form-actions pattern)
     * Accepts Readonly for compatibility with generated const objects
     */
    primary?: Readonly<ActionButton>;
    /**
     * Secondary action buttons config (for form-actions pattern)
     * Accepts readonly array for compatibility with generated const arrays
     */
    secondary?: readonly Readonly<ActionButton>[];
    /**
     * Visual variant
     * @default 'default'
     */
    variant?: ButtonGroupVariant;
    /**
     * Orientation
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Entity type for filter-group pattern (schema metadata)
     */
    entity?: string;
    /**
     * Filter definitions for filter-group pattern
     */
    filters?: readonly FilterDefinition[];
}
export declare const ButtonGroup: React.FC<ButtonGroupProps>;
