/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */
export declare const EntityDisplayEvents: {
    readonly SORT: "SORT";
    readonly PAGINATE: "PAGINATE";
    readonly SEARCH: "SEARCH";
    readonly FILTER: "FILTER";
    readonly CLEAR_FILTERS: "CLEAR_FILTERS";
    readonly SELECT: "SELECT";
    readonly DESELECT: "DESELECT";
};
export interface SortPayload {
    field: string;
    direction: 'asc' | 'desc';
}
export interface PaginatePayload {
    page: number;
    pageSize?: number;
}
export interface SearchPayload {
    query: string;
}
export interface FilterPayload {
    field: string;
    operator: string;
    value: unknown;
}
export interface SelectPayload {
    ids: (string | number)[];
}
export interface EntityDisplayProps<T = unknown> {
    /** Entity name for schema-driven integration */
    entity?: string;
    /** Data array provided by the trait via render-ui */
    data?: readonly T[] | T[];
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Current sort field */
    sortBy?: string;
    /** Current sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Current search query value */
    searchValue?: string;
    /** Current page number (1-indexed) */
    page?: number;
    /** Number of items per page */
    pageSize?: number;
    /** Total number of items (for pagination display) */
    totalCount?: number;
    /** Active filters */
    activeFilters?: Record<string, unknown>;
    /** Currently selected item IDs */
    selectedIds?: readonly (string | number)[];
}
