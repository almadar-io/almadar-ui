/**
 * FetchedDataProvider
 *
 * Provides server-fetched entity data to the client runtime.
 * This context stores data returned from compiled event handlers
 * via the `data` field in EventResponse.
 *
 * Data Flow:
 * 1. Client sends event to server
 * 2. Server executes compiled handler with fetch effects
 * 3. Server returns { data: { EntityName: [...records] }, clientEffects: [...] }
 * 4. Provider stores data in this context
 * 5. Pattern components access data via useFetchedData hook
 *
 * Used by both Builder preview and compiled shell.
 *
 * @packageDocumentation
 */
import React from 'react';
export interface EntityRecord {
    id: string;
    [key: string]: unknown;
}
export interface FetchedDataState {
    /** Entity data by entity name (e.g., { Task: [...], User: [...] }) */
    data: Record<string, EntityRecord[]>;
    /** Timestamp of last fetch per entity */
    fetchedAt: Record<string, number>;
    /** Whether data is currently being fetched */
    loading: boolean;
    /** Last error message */
    error: string | null;
}
export interface FetchedDataContextValue {
    /** Get all records for an entity */
    getData: (entityName: string) => EntityRecord[];
    /** Get a single record by ID */
    getById: (entityName: string, id: string) => EntityRecord | undefined;
    /** Check if entity data exists */
    hasData: (entityName: string) => boolean;
    /** Get fetch timestamp for entity */
    getFetchedAt: (entityName: string) => number | undefined;
    /** Update data from server response */
    setData: (data: Record<string, unknown[]>) => void;
    /** Clear all fetched data */
    clearData: () => void;
    /** Clear data for specific entity */
    clearEntity: (entityName: string) => void;
    /** Current loading state */
    loading: boolean;
    /** Set loading state */
    setLoading: (loading: boolean) => void;
    /** Current error */
    error: string | null;
    /** Set error */
    setError: (error: string | null) => void;
}
export declare const FetchedDataContext: React.Context<FetchedDataContextValue | null>;
export interface FetchedDataProviderProps {
    /** Initial data (optional) */
    initialData?: Record<string, unknown[]>;
    /** Children */
    children: React.ReactNode;
}
/**
 * FetchedDataProvider - Provides server-fetched entity data
 *
 * @example
 * ```tsx
 * <FetchedDataProvider>
 *   <OrbitalProvider>
 *     <App />
 *   </OrbitalProvider>
 * </FetchedDataProvider>
 * ```
 */
export declare function FetchedDataProvider({ initialData, children, }: FetchedDataProviderProps): React.ReactElement;
/**
 * Access the fetched data context.
 * Returns null if not within a FetchedDataProvider.
 */
export declare function useFetchedDataContext(): FetchedDataContextValue | null;
/**
 * Access fetched data with fallback behavior.
 * If not in a provider, returns empty data.
 */
export declare function useFetchedData(): FetchedDataContextValue;
/**
 * Access fetched data for a specific entity.
 * Provides a convenient API for entity-specific operations.
 */
export declare function useFetchedEntity(entityName: string): {
    /** All fetched records for this entity */
    records: EntityRecord[];
    /** Get a record by ID */
    getById: (id: string) => EntityRecord | undefined;
    /** Whether data has been fetched for this entity */
    hasData: boolean;
    /** When data was last fetched */
    fetchedAt: number | undefined;
    /** Whether data is loading */
    loading: boolean;
    /** Current error */
    error: string | null;
};
