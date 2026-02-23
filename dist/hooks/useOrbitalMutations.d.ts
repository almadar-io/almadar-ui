/**
 * useOrbitalMutations - Event-based entity mutations via orbital events route
 *
 * This hook provides entity mutations that go through the orbital events route
 * instead of direct CRUD API calls. This ensures all mutations:
 * 1. Go through trait state machines
 * 2. Enforce guards
 * 3. Execute all trait effects (including persist)
 *
 * This is the Phase 7 replacement for direct CRUD mutations.
 *
 * @example
 * ```tsx
 * const { createEntity, updateEntity, deleteEntity } = useOrbitalMutations('Task', 'TaskManager');
 *
 * // Create - sends ENTITY_CREATE event to orbital
 * await createEntity({ title: 'New Task', status: 'pending' });
 *
 * // Update - sends ENTITY_UPDATE event to orbital
 * await updateEntity(taskId, { status: 'completed' });
 *
 * // Delete - sends ENTITY_DELETE event to orbital
 * await deleteEntity(taskId);
 * ```
 *
 * @packageDocumentation
 */
/**
 * Standard events for entity mutations
 * These are handled by orbitals with CRUD-capable traits
 */
export declare const ENTITY_EVENTS: {
    readonly CREATE: "ENTITY_CREATE";
    readonly UPDATE: "ENTITY_UPDATE";
    readonly DELETE: "ENTITY_DELETE";
};
export interface OrbitalEventPayload {
    event: string;
    payload?: Record<string, unknown>;
    entityId?: string;
}
export interface OrbitalEventResponse {
    success: boolean;
    transitioned: boolean;
    states: Record<string, string>;
    emittedEvents: Array<{
        event: string;
        payload?: unknown;
    }>;
    error?: string;
}
/**
 * Hook for event-based entity mutations via orbital events route
 *
 * @param entityName - The entity type name (for cache invalidation)
 * @param orbitalName - The orbital to send events to
 * @param options - Optional configuration
 */
export declare function useOrbitalMutations(entityName: string, orbitalName: string, options?: {
    /** Custom event names for create/update/delete */
    events?: {
        create?: string;
        update?: string;
        delete?: string;
    };
    /** Enable debug logging */
    debug?: boolean;
}): {
    createEntity: (data: Record<string, unknown>) => Promise<OrbitalEventResponse>;
    updateEntity: (id: string | undefined, data: Record<string, unknown>) => Promise<OrbitalEventResponse | undefined>;
    deleteEntity: (id: string | undefined) => Promise<OrbitalEventResponse | undefined>;
    createMutation: import("@tanstack/react-query").UseMutationResult<OrbitalEventResponse, Error, Record<string, unknown>, unknown>;
    updateMutation: import("@tanstack/react-query").UseMutationResult<OrbitalEventResponse, Error, {
        id: string;
        data: Record<string, unknown>;
    }, unknown>;
    deleteMutation: import("@tanstack/react-query").UseMutationResult<OrbitalEventResponse, Error, string, unknown>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isMutating: boolean;
    createError: Error | null;
    updateError: Error | null;
    deleteError: Error | null;
};
/**
 * Send a custom event to an orbital
 * For non-CRUD operations that go through trait state machines
 */
export declare function useSendOrbitalEvent(orbitalName: string): {
    sendEvent: (event: string, payload?: Record<string, unknown>, entityId?: string) => Promise<OrbitalEventResponse>;
    isPending: boolean;
    error: Error | null;
    data: OrbitalEventResponse | undefined;
};
