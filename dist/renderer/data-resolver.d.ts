/**
 * Data Resolver
 *
 * Resolves entity data for pattern rendering.
 * Supports multiple data sources with priority:
 * 1. Server-provided data (from EventResponse.data)
 * 2. Entity store (Builder in-memory mock data)
 * 3. Empty array (fallback)
 *
 * Used by both Builder's PatternRenderer and compiled shell's UISlotRenderer.
 *
 * @packageDocumentation
 */
import type { DataContext, DataResolution } from './types';
/**
 * Resolve entity data from available sources.
 *
 * Priority:
 * 1. fetchedData (from server response) - highest priority
 * 2. entityStore (Builder mock data)
 * 3. Empty array (fallback)
 *
 * @param entityName - Name of the entity to resolve data for
 * @param context - Data context with available sources
 * @returns Resolved data with loading state
 *
 * @example
 * ```typescript
 * const { data, loading } = resolveEntityData('Task', {
 *   fetchedData: response.data,
 *   entityStore: mockStore
 * });
 * ```
 */
export declare function resolveEntityData(entityName: string, context: DataContext): DataResolution;
/**
 * Resolve entity data with query filtering.
 *
 * Applies query singleton filters if available.
 *
 * @param entityName - Name of the entity
 * @param queryRef - Optional query reference for filtering
 * @param context - Data context
 * @returns Filtered resolved data
 */
export declare function resolveEntityDataWithQuery(entityName: string, queryRef: string | undefined, context: DataContext): DataResolution;
/**
 * Get a single entity record by ID.
 */
export declare function resolveEntityById(entityName: string, id: string | number, context: DataContext): unknown | null;
/**
 * Get the count of entities matching criteria.
 */
export declare function resolveEntityCount(entityName: string, context: DataContext, filters?: Record<string, unknown>): number;
/**
 * Check if any entities exist for a given entity name.
 */
export declare function hasEntities(entityName: string, context: DataContext): boolean;
/**
 * Create a data context from fetched data only.
 * Convenience function for compiled shells.
 */
export declare function createFetchedDataContext(data: Record<string, unknown[]>): DataContext;
/**
 * Merge multiple data contexts.
 * Later contexts take precedence.
 */
export declare function mergeDataContexts(...contexts: DataContext[]): DataContext;
