import type { ReactNode } from "react";
import React from "react";
export interface EntityDataAdapter {
    /** Get all records for an entity */
    getData: (entity: string) => Record<string, unknown>[];
    /** Get a single record by entity name and ID */
    getById: (entity: string, id: string) => Record<string, unknown> | undefined;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Current error */
    error: string | null;
}
/**
 * Provider that bridges a host app's data source to useEntityList/useEntity hooks.
 *
 * @example
 * ```tsx
 * // In builder runtime
 * const fetchedData = useFetchedData();
 * const adapter = {
 *   getData: fetchedData.getData,
 *   getById: fetchedData.getById,
 *   isLoading: fetchedData.loading,
 *   error: fetchedData.error,
 * };
 * <EntityDataProvider adapter={adapter}>
 *   {children}
 * </EntityDataProvider>
 * ```
 */
export declare function EntityDataProvider({ adapter, children, }: {
    adapter: EntityDataAdapter;
    children: ReactNode;
}): React.FunctionComponentElement<React.ProviderProps<EntityDataAdapter | null>>;
/**
 * Access the entity data adapter (null if no provider).
 */
export declare function useEntityDataAdapter(): EntityDataAdapter | null;
export declare const entityDataKeys: {
    all: readonly ["entities"];
    lists: () => readonly ["entities", "list"];
    list: (entity: string, filters?: Record<string, unknown>) => readonly ["entities", "list", string, Record<string, unknown> | undefined];
    details: () => readonly ["entities", "detail"];
    detail: (entity: string, id: string) => readonly ["entities", "detail", string, string];
};
export type EntityDataRecord = Record<string, unknown>;
export interface UseEntityListOptions {
    /** Skip fetching */
    skip?: boolean;
}
export interface UseEntityListResult<T = Record<string, unknown>> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
export interface UseEntityDetailResult<T = Record<string, unknown>> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, unknown>;
}
export interface UsePaginatedEntityListResult<T = Record<string, unknown>> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    refetch: () => void;
}
/**
 * Hook for fetching entity list data.
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
export declare function useEntityList<T = Record<string, unknown>>(entity: string | undefined, options?: UseEntityListOptions): UseEntityListResult<T>;
/**
 * Hook for fetching a single entity by ID.
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
export declare function useEntity<T = Record<string, unknown>>(entity: string | undefined, id: string | undefined): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for fetching entity detail by ID (alias for useEntity with refetch).
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
export declare function useEntityDetail<T = Record<string, unknown>>(entity: string | undefined, id: string | undefined): UseEntityDetailResult<T>;
/**
 * Hook for fetching paginated entity list data.
 * Uses EntityDataContext if available (client-side pagination), otherwise falls back to stub.
 */
export declare function usePaginatedEntityList<T = Record<string, unknown>>(entity: string | undefined, params: PaginationParams, options?: UseEntityListOptions): UsePaginatedEntityListResult<T>;
/**
 * Suspense-compatible hook for fetching entity list data.
 *
 * Instead of returning `isLoading`/`error`, this hook **suspends** (throws a Promise)
 * when data is not ready. Use inside a `<Suspense>` boundary.
 *
 * Falls back to the adapter when available; otherwise suspends briefly for stub data.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Skeleton variant="table" />}>
 *   <ErrorBoundary>
 *     <TaskList entity="Task" />
 *   </ErrorBoundary>
 * </Suspense>
 *
 * function TaskList({ entity }: { entity: string }) {
 *   const { data } = useEntityListSuspense<Task>(entity);
 *   // No loading check needed — Suspense handles it
 *   return <DataTable data={data} ... />;
 * }
 * ```
 */
export declare function useEntityListSuspense<T = Record<string, unknown>>(entity: string): {
    data: T[];
    refetch: () => void;
};
/**
 * Suspense-compatible hook for fetching a single entity by ID.
 *
 * Suspends when data is not ready. Use inside a `<Suspense>` boundary.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Skeleton variant="form" />}>
 *   <ErrorBoundary>
 *     <TaskDetail entity="Task" id={taskId} />
 *   </ErrorBoundary>
 * </Suspense>
 *
 * function TaskDetail({ entity, id }: { entity: string; id: string }) {
 *   const { data } = useEntitySuspense<Task>(entity, id);
 *   return <DetailPanel data={data} ... />;
 * }
 * ```
 */
export declare function useEntitySuspense<T = Record<string, unknown>>(entity: string, id: string): {
    data: T | null;
    refetch: () => void;
};
export default useEntityList;
