/**
 * Entity Store
 *
 * Simple module-level store for runtime entities.
 * No providers needed - hooks import and use directly.
 *
 * NOTE: Mutations create new Map instances to trigger React rerenders
 * when using useSyncExternalStore.
 */
import { type EntityFilterValue, type FilterOperator, type EntityFilters, applyFilters, createFilter } from './filtering';
export type { EntityFilterValue, FilterOperator, EntityFilters };
export { applyFilters, createFilter };
export interface Entity {
    id: string;
    type: string;
    [key: string]: unknown;
}
type Listener = () => void;
/**
 * Subscribe to store changes
 */
export declare function subscribe(listener: Listener): () => void;
/**
 * Get all entities
 */
export declare function getEntities(): Map<string, Entity>;
/**
 * Get entity by ID
 */
export declare function getEntity(id: string): Entity | undefined;
/**
 * Get entities by type
 */
export declare function getByType(type: string | string[]): Entity[];
/**
 * Get all entities as array
 */
export declare function getAllEntities(): Entity[];
/**
 * Get singleton entity by type (first of that type)
 */
export declare function getSingleton(type: string): Entity | undefined;
/**
 * Spawn a new entity
 */
export declare function spawnEntity(config: {
    type: string;
    id?: string;
    [key: string]: unknown;
}): string;
/**
 * Update an entity
 */
export declare function updateEntity(id: string, updates: Partial<Entity>): void;
/**
 * Update singleton entity by type
 */
export declare function updateSingleton(type: string, updates: Partial<Entity>): void;
/**
 * Remove an entity
 */
export declare function removeEntity(id: string): void;
/**
 * Clear all entities
 */
export declare function clearEntities(): void;
/**
 * Set a filter for an entity type
 * @param entityType - The entity type to filter (e.g., "Player", "Enemy")
 * @param field - The filter key (e.g., 'status' or 'date_from')
 * @param value - The filter value
 * @param operator - The comparison operator
 * @param targetField - The actual record field to compare (defaults to field)
 */
export declare function setFilter(entityType: string, field: string, value: unknown, operator?: FilterOperator, targetField?: string): void;
/**
 * Clear a specific filter
 */
export declare function clearFilter(entityType: string, field: string): void;
/**
 * Clear all filters for an entity type
 */
export declare function clearAllFilters(entityType: string): void;
/**
 * Get active filters for an entity type
 */
export declare function getFilters(entityType: string): EntityFilters;
/**
 * Get entities by type with optional filtering
 */
export declare function getByTypeFiltered(type: string | string[]): Entity[];
/**
 * Get snapshot for React useSyncExternalStore
 */
export declare function getSnapshot(): Map<string, Entity>;
/**
 * Get filter snapshot for React useSyncExternalStore
 */
export declare function getFilterSnapshot(): Map<string, EntityFilters>;
