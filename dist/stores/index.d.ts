/**
 * Entity Filtering Utilities
 *
 * Provides filter types and utility functions for filtering entity records.
 * Used by EntityStore and can be imported by runtime preview.
 */
/** Filter value for a single field (entity filtering) */
interface EntityFilterValue {
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
type FilterOperator = 'eq' | 'contains' | 'in' | 'date_eq' | 'date_gte' | 'date_lte' | 'search';
/** Filter state for an entity - Map of field key to filter value */
type EntityFilters = Map<string, EntityFilterValue>;
/** Record type that can be filtered */
interface FilterableRecord {
    id: string;
    [key: string]: unknown;
}
/**
 * Extract date part from ISO string or Date object.
 * Returns format: "YYYY-MM-DD"
 */
declare function getDateString(value: unknown): string | null;
/**
 * Apply a single filter to check if a record matches.
 * Returns true if the record passes the filter.
 */
declare function matchesFilter(record: FilterableRecord, filter: EntityFilterValue): boolean;
/**
 * Apply all filters to a list of records.
 * Returns only records that match ALL filters.
 */
declare function applyFilters<T extends FilterableRecord>(records: T[], entityFilters: EntityFilters): T[];
/**
 * Create a filter value with proper defaults.
 */
declare function createFilter(field: string, value: unknown, operator?: FilterOperator, targetField?: string): EntityFilterValue;

/**
 * Entity Store
 *
 * Simple module-level store for runtime entities.
 * No providers needed - hooks import and use directly.
 *
 * NOTE: Mutations create new Map instances to trigger React rerenders
 * when using useSyncExternalStore.
 */

interface Entity {
    id: string;
    type: string;
    [key: string]: unknown;
}
type Listener = () => void;
/**
 * Subscribe to store changes
 */
declare function subscribe(listener: Listener): () => void;
/**
 * Get all entities
 */
declare function getEntities(): Map<string, Entity>;
/**
 * Get entity by ID
 */
declare function getEntity(id: string): Entity | undefined;
/**
 * Get entities by type
 */
declare function getByType(type: string | string[]): Entity[];
/**
 * Get all entities as array
 */
declare function getAllEntities(): Entity[];
/**
 * Get singleton entity by type (first of that type)
 */
declare function getSingleton(type: string): Entity | undefined;
/**
 * Spawn a new entity
 */
declare function spawnEntity(config: {
    type: string;
    id?: string;
    [key: string]: unknown;
}): string;
/**
 * Update an entity
 */
declare function updateEntity(id: string, updates: Partial<Entity>): void;
/**
 * Update singleton entity by type
 */
declare function updateSingleton(type: string, updates: Partial<Entity>): void;
/**
 * Remove an entity
 */
declare function removeEntity(id: string): void;
/**
 * Clear all entities
 */
declare function clearEntities(): void;
/**
 * Set a filter for an entity type
 * @param entityType - The entity type to filter (e.g., "Player", "Enemy")
 * @param field - The filter key (e.g., 'status' or 'date_from')
 * @param value - The filter value
 * @param operator - The comparison operator
 * @param targetField - The actual record field to compare (defaults to field)
 */
declare function setFilter(entityType: string, field: string, value: unknown, operator?: FilterOperator, targetField?: string): void;
/**
 * Clear a specific filter
 */
declare function clearFilter(entityType: string, field: string): void;
/**
 * Clear all filters for an entity type
 */
declare function clearAllFilters(entityType: string): void;
/**
 * Get active filters for an entity type
 */
declare function getFilters(entityType: string): EntityFilters;
/**
 * Get entities by type with optional filtering
 */
declare function getByTypeFiltered(type: string | string[]): Entity[];
/**
 * Get snapshot for React useSyncExternalStore
 */
declare function getSnapshot(): Map<string, Entity>;
/**
 * Get filter snapshot for React useSyncExternalStore
 */
declare function getFilterSnapshot(): Map<string, EntityFilters>;

export { type Entity, type EntityFilterValue, type EntityFilters, type FilterOperator, type FilterableRecord, applyFilters, clearAllFilters, clearEntities, clearFilter, createFilter, getAllEntities, getByType, getByTypeFiltered, getDateString, getEntities, getEntity, getFilterSnapshot, getFilters, getSingleton, getSnapshot, matchesFilter, removeEntity, setFilter, spawnEntity, subscribe, updateEntity, updateSingleton };
