/**
 * Section Component
 *
 * A semantic section wrapper with optional title, description, and action.
 * Perfect for grouping related content with consistent spacing.
 */
import React from 'react';
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionVariant = 'default' | 'card' | 'bordered' | 'filled';
export interface SectionProps {
    /** Section title */
    title?: string;
    /** Section subtitle/description */
    description?: string;
    /** Action element (e.g., button, link) */
    action?: React.ReactNode;
    /** Padding amount */
    padding?: SectionPadding;
    /** Visual variant */
    variant?: SectionVariant;
    /** Show divider below header */
    divider?: boolean;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React.ReactNode;
    /** Header custom class name */
    headerClassName?: string;
    /** Content custom class name */
    contentClassName?: string;
    /** HTML element to render as */
    as?: React.ElementType;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * Section - Semantic content grouping with header
 */
export declare const Section: React.FC<SectionProps>;
export default Section;
