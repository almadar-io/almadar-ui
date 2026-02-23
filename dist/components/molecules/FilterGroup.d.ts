/**
 * FilterGroup Molecule Component
 *
 * A component for filtering entity data. Composes atoms (Button, Select, Badge, HStack)
 * and follows the design system using CSS variables.
 *
 * Implements the Closed Circuit principle:
 * - FilterGroup updates QuerySingleton filters via query prop
 * - FilterGroup emits UI:FILTER events for trait state machines
 * - entity-list/entity-cards read filtered data via query prop
 *
 * Supports Query Singleton pattern via `query` prop for std/Filter behavior.
 */
import React from "react";
/** Filter definition from schema */
export interface FilterDefinition {
    field: string;
    label: string;
    /** Filter type - 'date' renders a date picker, 'date-range'/'daterange' renders two date pickers */
    filterType?: "select" | "toggle" | "checkbox" | "date" | "daterange" | "date-range";
    /** Alias for filterType (schema compatibility) */
    type?: "select" | "toggle" | "checkbox" | "date" | "daterange" | "date-range";
    /** Options for select/toggle filters */
    options?: readonly string[];
}
export interface FilterGroupProps {
    /** Entity name to filter */
    entity: string;
    /** Filter definitions from schema */
    filters: readonly FilterDefinition[];
    /** Callback when a filter changes - for EntityStore integration */
    onFilterChange?: (field: string, value: string | null) => void;
    /** Callback to clear all filters */
    onClearAll?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Variant style */
    variant?: "default" | "compact" | "pills" | "vertical";
    /** Show filter icon */
    showIcon?: boolean;
    /**
     * Query singleton binding for state management.
     * When provided, syncs filter state with the query singleton.
     * Example: "@TaskQuery"
     */
    query?: string;
    /** Loading state indicator */
    isLoading?: boolean;
}
/**
 * FilterGroup - Renders filter controls for entity data
 * Uses atoms: Button, Select, Badge, HStack
 */
export declare const FilterGroup: React.FC<FilterGroupProps>;
