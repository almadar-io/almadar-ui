/**
 * SearchInput Molecule Component
 *
 * A search input component with icon, clear button, and loading state.
 * Uses Input, Icon, Button, and Spinner atoms.
 *
 * Supports Query Singleton pattern via `query` prop for std/Search behavior.
 */
import React from 'react';
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /**
     * Search value (controlled mode)
     */
    value?: string;
    /**
     * Callback when search value changes
     */
    onSearch?: (value: string) => void;
    /**
     * Debounce delay in milliseconds
     * @default 300
     */
    debounceMs?: number;
    /**
     * Show loading state
     * @default false
     */
    isLoading?: boolean;
    /**
     * Placeholder text
     * @default 'Search...'
     */
    placeholder?: string;
    /**
     * Show clear button
     * @default true
     */
    clearable?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Event name to dispatch on search (schema metadata, wired by trait)
     * This is metadata used by the trait generator, not by the component.
     */
    event?: string;
    /**
     * Entity type for context-aware search.
     * When provided, search events include entity context.
     */
    entity?: string;
    /**
     * Query singleton binding for state management.
     * When provided, syncs search state with the query singleton.
     * Example: "@TaskQuery"
     */
    query?: string;
}
export declare const SearchInput: React.FC<SearchInputProps>;
