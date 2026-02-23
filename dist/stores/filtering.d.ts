/**
 * Entity Filtering Utilities
 *
 * Provides filter types and utility functions for filtering entity records.
 * Used by EntityStore and can be imported by runtime preview.
 */
/** Filter value for a single field (entity filtering) */
export interface EntityFilterValue {
    /** The field key (may include suffix like _from, _to for date ranges) */
    field: string;
    /** The actual record field to compare against (defaults to field if not specified) */
    targetField?: string;
    value: unknown;
    /** Comparison operator for filtering
     * - eq: exact match (default)
     * - contains: substring match for strings
     * - in: value is in array
     * - date_eq: same date (ignoring time)
     * - date_gte: on or after date
     * - date_lte: on or before date
     */
    operator?: FilterOperator;
}
/** Operator type for filter */
export type FilterOperator = 'eq' | 'contains' | 'in' | 'date_eq' | 'date_gte' | 'date_lte' | 'search';
/** Filter state for an entity - Map of field key to filter value */
export type EntityFilters = Map<string, EntityFilterValue>;
/** Record type that can be filtered */
export interface FilterableRecord {
    id: string;
    [key: string]: unknown;
}
/**
 * Extract date part from ISO string or Date object.
 * Returns format: "YYYY-MM-DD"
 */
export declare function getDateString(value: unknown): string | null;
/**
 * Apply a single filter to check if a record matches.
 * Returns true if the record passes the filter.
 */
export declare function matchesFilter(record: FilterableRecord, filter: EntityFilterValue): boolean;
/**
 * Apply all filters to a list of records.
 * Returns only records that match ALL filters.
 */
export declare function applyFilters<T extends FilterableRecord>(records: T[], entityFilters: EntityFilters): T[];
/**
 * Create a filter value with proper defaults.
 */
export declare function createFilter(field: string, value: unknown, operator?: FilterOperator, targetField?: string): EntityFilterValue;
