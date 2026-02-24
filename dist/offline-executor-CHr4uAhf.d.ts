/**
 * Shared Renderer Types
 *
 * Type definitions used by both Builder and compiled shells for
 * the dual execution model. These types define the contract between
 * server and client for effect execution.
 *
 * @packageDocumentation
 */
/**
 * A client effect is a tuple where the first element is the effect type
 * and the remaining elements are the arguments.
 *
 * @example
 * ['render-ui', 'main', { type: 'entity-table', ... }]
 * ['navigate', '/tasks/123']
 * ['notify', 'Task created!', { type: 'success' }]
 * ['emit', 'TASK_CREATED', { id: '123' }]
 */
type ClientEffect = ['render-ui', string, PatternConfig | null] | ['navigate', string, Record<string, unknown>?] | ['notify', string, NotifyOptions?] | ['emit', string, unknown?];
/**
 * Options for notify effect
 */
interface NotifyOptions {
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}
/**
 * Configuration for a pattern to render in a slot.
 * This is what render-ui effects carry as their payload.
 */
interface PatternConfig {
    /** Pattern type from registry (e.g., 'entity-table', 'form-section') */
    type: string;
    /** Entity name for data binding */
    entity?: string;
    /** Additional props for the pattern component */
    [key: string]: unknown;
}
/**
 * Resolved pattern with component information from component-mapping.json
 */
interface ResolvedPattern {
    /** Component name (e.g., 'DataTable') */
    component: string;
    /** Import path for the component */
    importPath: string;
    /** Pattern category (e.g., 'display', 'form') */
    category: string;
    /** Validated and normalized props */
    validatedProps: Record<string, unknown>;
}
/**
 * Response from server after processing an event.
 * This is the unified response format for both Builder and compiled shells.
 */
interface EventResponse {
    /** Whether the event was processed successfully */
    success: boolean;
    /** New state after transition (if transition occurred) */
    newState?: string;
    /** Data fetched by server effects (e.g., { Task: [...] }) */
    data?: Record<string, unknown[]>;
    /** Client effects to execute (render-ui, navigate, notify, emit) */
    clientEffects?: ClientEffect[];
    /** Results of individual effect executions (for debugging) */
    effectResults?: Array<{
        effect: string;
        success: boolean;
        data?: unknown;
        error?: string;
    }>;
    /** Error message if success is false */
    error?: string;
}
/**
 * Configuration for the client effect executor.
 * Provides implementations for each effect type.
 */
interface ClientEffectExecutorConfig {
    /**
     * Render a pattern to a slot.
     * Called for 'render-ui' effects.
     */
    renderToSlot: (slot: string, pattern: PatternConfig | null) => void;
    /**
     * Navigate to a route.
     * Called for 'navigate' effects.
     */
    navigate: (path: string, params?: Record<string, unknown>) => void;
    /**
     * Show a notification.
     * Called for 'notify' effects.
     */
    notify: (message: string, options?: NotifyOptions) => void;
    /**
     * Emit an event to the event bus.
     * Called for 'emit' effects.
     */
    eventBus: {
        emit: (event: string, payload?: unknown) => void;
    };
    /**
     * Optional: Data from server response for render-ui.
     * Components can use this to access fetched entity data.
     */
    data?: Record<string, unknown[]>;
    /**
     * Optional: Callback when all effects have been executed.
     */
    onComplete?: () => void;
}
/**
 * Valid UI slot names
 */
type UISlot = 'main' | 'sidebar' | 'modal' | 'drawer' | 'overlay' | 'center' | 'toast' | 'hud-top' | 'hud-bottom' | 'floating';
/**
 * Slot type classification
 */
type SlotType = 'inline' | 'portal';
/**
 * Definition of a slot including its rendering behavior
 */
interface SlotDefinition {
    /** Slot name */
    name: UISlot;
    /** Whether to render inline or via portal */
    type: SlotType;
    /** For portal slots: where to render (default: document.body) */
    portalTarget?: string;
    /** Z-index for portal slots */
    zIndex?: number;
}
/**
 * Context for resolving entity data.
 * Supports multiple data sources with priority.
 */
interface DataContext {
    /** Server-provided data (highest priority) */
    fetchedData?: Record<string, unknown[]>;
    /** In-memory mock data (for Builder preview) */
    entityStore?: {
        getRecords: (entityName: string) => unknown[];
    };
    /** Query singleton for filtering */
    querySingleton?: {
        getFilters: (queryRef: string) => Record<string, unknown>;
    };
}
/**
 * Result of data resolution
 */
interface DataResolution {
    /** Resolved data array */
    data: unknown[];
    /** Whether data is still loading */
    loading: boolean;
    /** Error if resolution failed */
    error?: Error;
}

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

/**
 * Effect that needs to be synced to server when online
 */
interface PendingSyncEffect {
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
interface OfflineExecutorConfig extends ClientEffectExecutorConfig {
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
interface OfflineExecutorState {
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
declare class OfflineExecutor {
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
declare function createOfflineExecutor(config: OfflineExecutorConfig): OfflineExecutor;
/**
 * Options for useOfflineExecutor hook
 */
interface UseOfflineExecutorOptions extends OfflineExecutorConfig {
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
interface UseOfflineExecutorResult {
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
declare function useOfflineExecutor(options: UseOfflineExecutorOptions): UseOfflineExecutorResult;

export { type ClientEffect as C, type DataContext as D, type EventResponse as E, type NotifyOptions as N, OfflineExecutor as O, type PatternConfig as P, type ResolvedPattern as R, type SlotDefinition as S, type UseOfflineExecutorResult as U, type UseOfflineExecutorOptions as a, type ClientEffectExecutorConfig as b, type DataResolution as c, type UISlot as d, type SlotType as e, type OfflineExecutorConfig as f, type OfflineExecutorState as g, type PendingSyncEffect as h, createOfflineExecutor as i, useOfflineExecutor as u };
