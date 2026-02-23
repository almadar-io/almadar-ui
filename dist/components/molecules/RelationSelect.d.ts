/**
 * RelationSelect Molecule Component
 *
 * A searchable select component for relation fields.
 * Allows users to search and select from related entities.
 *
 * Composed from: Box, HStack, VStack, Input, Button, Spinner, Typography atoms
 */
import React from "react";
export interface RelationOption {
    /** The value to store (typically the ID) */
    value: string;
    /** The display label */
    label: string;
    /** Optional description */
    description?: string;
    /** Whether this option is disabled */
    disabled?: boolean;
}
export interface RelationSelectProps {
    /** Current value (ID) */
    value?: string;
    /** Callback when value changes */
    onChange?: (value: string | undefined) => void;
    /** Available options - accepts readonly for compatibility with generated const arrays */
    options: readonly RelationOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Error message */
    error?: string;
    /** Allow clearing the selection */
    clearable?: boolean;
    /** Name attribute for forms */
    name?: string;
    /** Additional CSS classes */
    className?: string;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Empty state message */
    emptyMessage?: string;
}
export declare const RelationSelect: React.FC<RelationSelectProps>;
