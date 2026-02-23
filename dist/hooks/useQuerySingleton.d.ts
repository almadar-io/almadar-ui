/**
 * Query state for filters and search
 */
export interface QueryState {
    search?: string;
    filters?: Record<string, unknown>;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
}
/**
 * Query singleton entity reference
 */
export interface QuerySingletonEntity {
    name: string;
    fields: Record<string, unknown>;
}
/**
 * Query singleton result type
 */
export interface QuerySingletonResult {
    state: QueryState;
    setState: (state: Partial<QueryState>) => void;
    reset: () => void;
}
export interface QuerySingletonState {
    /** Current search term */
    search: string;
    /** Set search term */
    setSearch: (value: string) => void;
    /** Current filters */
    filters: Record<string, unknown>;
    /** Set a filter value */
    setFilter: (key: string, value: unknown) => void;
    /** Clear all filters */
    clearFilters: () => void;
    /** Current sort field */
    sortField?: string;
    /** Current sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Set sort */
    setSort: (field: string, direction: 'asc' | 'desc') => void;
}
/**
 * Hook for accessing a query singleton by name
 *
 * @param query - Query singleton name (e.g., "@TaskQuery")
 * @returns Query singleton state or null if no query provided
 *
 * @example
 * ```tsx
 * const queryState = useQuerySingleton('@TaskQuery');
 *
 * // Use search state
 * queryState?.search
 * queryState?.setSearch('new search term')
 * ```
 */
export declare function useQuerySingleton(query?: string): QuerySingletonState | null;
/**
 * Parse a query binding string to extract the query singleton name
 *
 * @param binding - Binding string like "@TaskQuery.search" or "@TaskQuery"
 * @returns Object with query name and optional field path
 *
 * @example
 * ```tsx
 * parseQueryBinding('@TaskQuery.search')
 * // { query: 'TaskQuery', field: 'search' }
 *
 * parseQueryBinding('@TaskQuery')
 * // { query: 'TaskQuery', field: undefined }
 * ```
 */
export declare function parseQueryBinding(binding: string): {
    query: string;
    field?: string;
};
export default useQuerySingleton;
