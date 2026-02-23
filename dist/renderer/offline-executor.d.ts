/**
 * Offline Effect Executor
 *
 * Enables client-only mode for applications that need to work without
 * server connectivity. Provides:
 * - Mock data providers for simulating server responses
 * - Local effect execution without server round-trip
 * - Sync queue for effects that need server persistence when back online
 *
 * Used by both Builder preview (offline mode) and compiled shells (PWA mode).
 *
 * @packageDocumentation
 */
import type { ClientEffect, ClientEffectExecutorConfig, EventResponse } from './types';
/**
 * Effect that needs to be synced to server when online
 */
export interface PendingSyncEffect {
    /** Unique ID for this effect */
    id: string;
    /** Timestamp when effect was queued */
    timestamp: number;
    /** Effect type (persist, call-service, etc.) */
    type: string;
    /** Effect payload */
    payload: unknown;
    /** Number of retry attempts */
    retries: number;
    /** Maximum retries before giving up */
    maxRetries: number;
}
/**
 * Configuration for offline executor
 */
export interface OfflineExecutorConfig extends ClientEffectExecutorConfig {
    /**
     * Mock data provider for simulating fetch responses.
     * Returns data for a given entity name.
     */
    mockDataProvider?: (entityName: string) => unknown[];
    /**
     * Whether to queue server effects for sync when online.
     * Default: true
     */
    enableSyncQueue?: boolean;
    /**
     * Maximum number of effects to queue before dropping oldest.
     * Default: 100
     */
    maxQueueSize?: number;
    /**
     * Callback when an effect is added to sync queue.
     */
    onEffectQueued?: (effect: PendingSyncEffect) => void;
    /**
     * Callback when sync queue changes.
     */
    onQueueChange?: (queue: PendingSyncEffect[]) => void;
}
/**
 * Offline executor state
 */
export interface OfflineExecutorState {
    /** Whether we're in offline mode */
    isOffline: boolean;
    /** Pending effects waiting for sync */
    syncQueue: PendingSyncEffect[];
    /** Number of effects processed locally */
    localEffectsProcessed: number;
    /** Number of effects synced to server */
    effectsSynced: number;
    /** Last sync attempt timestamp */
    lastSyncAttempt?: number;
    /** Last successful sync timestamp */
    lastSuccessfulSync?: number;
}
/**
 * OfflineExecutor - Handles effects in offline/client-only mode.
 *
 * Features:
 * - Executes client effects immediately (render-ui, navigate, notify, emit)
 * - Queues server effects (persist, fetch, call-service) for later sync
 * - Provides mock data for fetch effects when offline
 * - Syncs queued effects when connection is restored
 *
 * @example
 * ```typescript
 * const executor = new OfflineExecutor({
 *   renderToSlot: (slot, pattern) => slotManager.render(slot, pattern),
 *   navigate: (path) => router.push(path),
 *   notify: (message, opts) => toast.show(message, opts),
 *   eventBus: { emit: (event, payload) => bus.emit(event, payload) },
 *   mockDataProvider: (entityName) => mockStore.getAll(entityName),
 * });
 *
 * // Process effects locally
 * const response = executor.processEventOffline('LOAD', { id: '123' });
 *
 * // When back online
 * await executor.syncPendingEffects(serverUrl);
 * ```
 */
export declare class OfflineExecutor {
    private config;
    private state;
    private storage;
    constructor(config: OfflineExecutorConfig);
    /**
     * Check if we're online (browser API)
     */
    private checkOnline;
    /**
     * Handle going online
     */
    private handleOnline;
    /**
     * Handle going offline
     */
    private handleOffline;
    /**
     * Load sync queue from localStorage
     */
    private loadSyncQueue;
    /**
     * Save sync queue to localStorage
     */
    private saveSyncQueue;
    /**
     * Add an effect to the sync queue
     */
    private queueForSync;
    /**
     * Execute client effects immediately.
     */
    executeClientEffects(effects: ClientEffect[]): void;
    /**
     * Process an event in offline mode.
     *
     * Returns a simulated EventResponse with mock data.
     * Client effects are executed immediately.
     * Server effects are queued for sync.
     */
    processEventOffline(event: string, payload?: Record<string, unknown>, effects?: Array<unknown[]>): EventResponse;
    /**
     * Sync pending effects to server.
     *
     * @param serverUrl - Base URL for the orbital server
     * @param authToken - Optional auth token for requests
     * @returns Number of successfully synced effects
     */
    syncPendingEffects(serverUrl: string, authToken?: string): Promise<number>;
    /**
     * Get current executor state
     */
    getState(): OfflineExecutorState;
    /**
     * Get number of pending effects
     */
    getPendingCount(): number;
    /**
     * Clear the sync queue
     */
    clearQueue(): void;
    /**
     * Dispose the executor and clean up listeners
     */
    dispose(): void;
}
/**
 * Create an offline executor with sensible defaults.
 *
 * @example
 * ```typescript
 * const executor = createOfflineExecutor({
 *   renderToSlot: slotManager.render,
 *   navigate: router.push,
 *   notify: toast.show,
 *   eventBus: { emit: bus.emit },
 *   mockDataProvider: (entity) => store.getAll(entity),
 * });
 * ```
 */
export declare function createOfflineExecutor(config: OfflineExecutorConfig): OfflineExecutor;
/**
 * Options for useOfflineExecutor hook
 */
export interface UseOfflineExecutorOptions extends OfflineExecutorConfig {
    /** Server URL for syncing */
    serverUrl?: string;
    /** Auth token for server requests */
    authToken?: string;
    /** Auto-sync when coming back online */
    autoSync?: boolean;
}
/**
 * Result of useOfflineExecutor hook
 */
export interface UseOfflineExecutorResult {
    /** Current executor state */
    state: OfflineExecutorState;
    /** Whether we're offline */
    isOffline: boolean;
    /** Number of pending effects */
    pendingCount: number;
    /** Execute client effects */
    executeClientEffects: (effects: ClientEffect[]) => void;
    /** Process event offline */
    processEventOffline: (event: string, payload?: Record<string, unknown>, effects?: Array<unknown[]>) => EventResponse;
    /** Manually trigger sync */
    sync: () => Promise<number>;
    /** Clear the queue */
    clearQueue: () => void;
}
/**
 * React hook for offline effect execution.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOffline, pendingCount, processEventOffline, sync } = useOfflineExecutor({
 *     renderToSlot: slotManager.render,
 *     navigate: router.push,
 *     notify: toast.show,
 *     eventBus: { emit: bus.emit },
 *     serverUrl: '/api/orbitals',
 *     autoSync: true,
 *   });
 *
 *   return (
 *     <div>
 *       {isOffline && <Banner>Offline - {pendingCount} changes pending</Banner>}
 *       <button onClick={() => processEventOffline('SAVE', data)}>Save</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useOfflineExecutor(options: UseOfflineExecutorOptions): UseOfflineExecutorResult;
