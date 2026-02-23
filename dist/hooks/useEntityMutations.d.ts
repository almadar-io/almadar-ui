/**
 * useEntityMutations - Entity CRUD mutation hooks
 *
 * Provides create, update, and delete mutations for entities.
 * Used by trait hooks for persist_data effects.
 *
 * @deprecated For new code, prefer useOrbitalMutations which sends mutations
 * through the orbital events route. This ensures all mutations go through
 * trait state machines and enforce guards/effects.
 *
 * Migration:
 * ```tsx
 * // Old (deprecated):
 * const { createEntity } = useEntityMutations('Task');
 *
 * // New (recommended):
 * const { createEntity } = useOrbitalMutations('Task', 'TaskManager');
 * ```
 *
 * @see useOrbitalMutations
 */
import { type OrbitalEventResponse } from './useOrbitalMutations';
export interface EntityMutationResult {
    id: string;
    [key: string]: unknown;
}
/**
 * Hook for creating entities
 */
export declare function useCreateEntity(entityName: string): import("@tanstack/react-query").UseMutationResult<EntityMutationResult, Error, Record<string, unknown>, unknown>;
/**
 * Hook for updating entities
 */
export declare function useUpdateEntity(entityName: string): import("@tanstack/react-query").UseMutationResult<EntityMutationResult, Error, {
    id: string;
    data: Record<string, unknown>;
}, unknown>;
/**
 * Hook for deleting entities
 */
export declare function useDeleteEntity(entityName: string): import("@tanstack/react-query").UseMutationResult<{
    id: string;
}, Error, string, unknown>;
export interface UseEntityMutationsOptions {
    /**
     * If provided, mutations go through orbital events route instead of direct CRUD.
     * This is the recommended approach for Phase 7+ compliance.
     */
    orbitalName?: string;
    /**
     * Custom event names when using orbital-based mutations
     */
    events?: {
        create?: string;
        update?: string;
        delete?: string;
    };
}
/**
 * Combined hook that provides all entity mutations
 * Used by trait hooks for persist_data effects
 *
 * @param entityName - The entity type name
 * @param options - Optional configuration including orbital-based mutations
 *
 * @deprecated For new code, prefer useOrbitalMutations directly
 */
export declare function useEntityMutations(entityName: string, options?: UseEntityMutationsOptions): {
    createEntity: (entityOrData: string | Record<string, unknown>, data?: Record<string, unknown>) => Promise<OrbitalEventResponse | EntityMutationResult | undefined>;
    updateEntity: (id: string | undefined, data: Record<string, unknown>) => Promise<OrbitalEventResponse | EntityMutationResult | undefined>;
    deleteEntity: (id: string | undefined) => Promise<OrbitalEventResponse | {
        id: string;
    } | undefined>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    createError: Error | null;
    updateError: Error | null;
    deleteError: Error | null;
};
