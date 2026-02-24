import { OrbitalSchema } from '@almadar/core';
import { E as EventBusContextType, a as EventListener } from '../event-bus-types-CjJduURa.js';
export { K as KFlowEvent, U as Unsubscribe } from '../event-bus-types-CjJduURa.js';
export { D as DEFAULT_SLOTS, R as RenderUIConfig, b as SlotAnimation, c as SlotChangeCallback, S as SlotContent, a as UISlot, U as UISlotManager, u as useUISlotManager } from '../useUISlots-D0mttBSP.js';
import * as React from 'react';
import React__default, { ReactNode } from 'react';
import * as _tanstack_react_query from '@tanstack/react-query';
import { Entity, getEntity, getByType, getAllEntities, getSingleton, spawnEntity, updateEntity, updateSingleton, removeEntity, clearEntities } from '../stores/index.js';

declare global {
    interface Window {
        __kflowEventBus?: EventBusContextType | null;
    }
}
/**
 * Hook for accessing the event bus.
 *
 * Uses EventBusProvider context if available, otherwise falls back to
 * a simple in-memory event bus (for design system / Storybook).
 *
 * @returns Event bus instance with emit, on, once, and hasListeners methods
 *
 * @example
 * ```tsx
 * const eventBus = useEventBus();
 *
 * // Emit an event
 * eventBus.emit('UI:CLICK', { id: '123' });
 *
 * // Subscribe to an event
 * useEffect(() => {
 *   return eventBus.on('UI:CLICK', (event) => {
 *     console.log('Clicked:', event.payload);
 *   });
 * }, []);
 * ```
 */
declare function useEventBus(): EventBusContextType;
/**
 * Hook for subscribing to a specific event.
 * Automatically cleans up subscription on unmount.
 *
 * @param event - Event name to subscribe to
 * @param handler - Event handler function
 *
 * @example
 * ```tsx
 * useEventListener('UI:CLICK', (event) => {
 *   console.log('Clicked:', event.payload);
 * });
 * ```
 */
declare function useEventListener(event: string, handler: EventListener): void;
/**
 * Hook for emitting events.
 * Returns a memoized emit function.
 *
 * @returns Function to emit events
 *
 * @example
 * ```tsx
 * const emit = useEmitEvent();
 *
 * const handleClick = () => {
 *   emit('UI:CLICK', { id: '123' });
 * };
 * ```
 */
declare function useEmitEvent(): (type: string, payload?: Record<string, unknown>) => void;

interface ChangeSummary {
    added: number;
    modified: number;
    removed: number;
}
interface HistoryTimelineItem {
    id: string;
    type: 'changeset' | 'snapshot';
    version: number;
    timestamp: number;
    description: string;
    source?: string;
    summary?: ChangeSummary;
    reason?: string;
}
interface RevertResult {
    success: boolean;
    error?: string;
    restoredSchema?: OrbitalSchema;
}
interface UseOrbitalHistoryOptions {
    appId: string | null;
    /** Firebase auth token for authenticated API requests */
    authToken?: string | null;
    /** User ID for x-user-id header (required for Firestore path) */
    userId?: string | null;
    onHistoryChange?: (timeline: HistoryTimelineItem[]) => void;
    onRevertSuccess?: (restoredSchema: OrbitalSchema) => void;
}
interface UseOrbitalHistoryResult {
    timeline: HistoryTimelineItem[];
    currentVersion: number;
    isLoading: boolean;
    error: string | null;
    revertToSnapshot: (snapshotId: string) => Promise<RevertResult>;
    refresh: () => Promise<void>;
}
declare function useOrbitalHistory(options: UseOrbitalHistoryOptions): UseOrbitalHistoryResult;

interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}
type FileSystemStatus = 'idle' | 'booting' | 'ready' | 'running' | 'error';
interface FileSystemFile {
    path: string;
    content: string;
}
interface SelectedFile {
    path: string;
    content: string;
    language?: string;
    isDirty?: boolean;
}
interface UseFileSystemResult {
    status: FileSystemStatus;
    error: string | null;
    isLoading: boolean;
    files: FileNode[];
    selectedFile: SelectedFile | null;
    selectedPath: string | null;
    previewUrl: string | null;
    boot: () => Promise<void>;
    mountFiles: (files: FileSystemFile[] | Record<string, unknown>) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    selectFile: (path: string) => Promise<void>;
    updateContent: (pathOrContent: string, content?: string) => void;
    updateSelectedContent: (content: string) => void;
    refreshTree: () => Promise<void>;
    runCommand: (command: string) => Promise<{
        exitCode: number;
        output: string;
    }>;
    startDevServer: () => Promise<void>;
}
declare function useFileSystem(): UseFileSystemResult;

interface Extension {
    id: string;
    name: string;
    language?: string;
    loaded: boolean;
}
interface ExtensionEntry {
    file: string;
    language?: string;
}
interface ExtensionManifest {
    languages: Record<string, {
        extensions: string[];
        icon?: string;
        color?: string;
    }>;
    extensions: ExtensionEntry[];
}
interface UseExtensionsOptions {
    appId: string;
    loadOnMount?: boolean;
}
interface UseExtensionsResult {
    extensions: Extension[];
    manifest: ExtensionManifest;
    isLoading: boolean;
    error: string | null;
    loadExtension: (extensionId: string) => Promise<void>;
    loadExtensions: () => Promise<void>;
    getExtensionForFile: (filename: string) => Extension | null;
}
declare function useExtensions(options: UseExtensionsOptions): UseExtensionsResult;

interface OpenFile {
    path: string;
    content: string;
    isDirty: boolean;
    language?: string;
}
interface UseFileEditorOptions {
    extensions: UseExtensionsResult;
    fileSystem: UseFileSystemResult;
    onSchemaUpdate?: (schema: OrbitalSchema) => Promise<void>;
}
interface FileEditResult {
    success: boolean;
    action?: 'updated_schema' | 'converted_extension' | 'saved_extension' | 'saved';
    error?: string;
}
interface UseFileEditorResult {
    openFiles: OpenFile[];
    activeFile: OpenFile | null;
    isSaving: boolean;
    openFile: (path: string) => Promise<void>;
    closeFile: (path: string) => void;
    setActiveFile: (path: string) => void;
    updateFileContent: (path: string, content: string) => void;
    handleFileEdit: (path: string, content: string) => Promise<FileEditResult>;
    saveFile: (path: string) => Promise<void>;
    saveAllFiles: () => Promise<void>;
}
declare function useFileEditor(options: UseFileEditorOptions): UseFileEditorResult;

interface SchemaLike {
    name: string;
    version?: string;
    [key: string]: unknown;
}
type CompileStage = 'idle' | 'compiling' | 'done' | 'error';
interface CompileResult {
    success: boolean;
    files?: Array<{
        path: string;
        content: string;
    }>;
    errors?: string[];
}
interface UseCompileResult {
    isCompiling: boolean;
    stage: CompileStage;
    lastResult: CompileResult | null;
    error: string | null;
    compileSchema: (schema: SchemaLike) => Promise<CompileResult | null>;
}
declare function useCompile(): UseCompileResult;

interface PreviewApp {
    id: string;
    name: string;
    status: 'loading' | 'ready' | 'error';
    schema?: OrbitalSchema;
    graphView: {
        version: string;
    };
}
interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: number;
    read?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    autoDismiss?: boolean;
    dismissAfter?: number;
}
interface NotificationsState {
    notifications: Notification[];
    isPanelOpen: boolean;
    closePanel: () => void;
    dismissNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}
interface ErrorToast {
    message: string;
}
interface UsePreviewResult {
    previewUrl: string | null;
    isLoading: boolean;
    error: string | null;
    loadError: string | null;
    app: PreviewApp | null;
    isFullscreen: boolean;
    isExecutingEvent: boolean;
    errorToast: ErrorToast | null;
    currentStateName: string | null;
    notifications: NotificationsState;
    startPreview: () => Promise<void>;
    stopPreview: () => Promise<void>;
    refresh: () => Promise<void>;
    handleRefresh: () => Promise<void>;
    handleReset: () => Promise<void>;
    toggleFullscreen: () => void;
    setErrorToast: (toast: ErrorToast | null) => void;
    dismissErrorToast: () => void;
}
interface UsePreviewOptions {
    appId?: string;
}
declare function usePreview(options?: UsePreviewOptions): UsePreviewResult;

interface DeepAgentActionRequest {
    id: string;
    type: string;
    tool: string;
    args: Record<string, unknown>;
    description?: string;
    allowedDecisions: ('approve' | 'edit' | 'reject')[];
    status: 'pending' | 'approved' | 'rejected' | 'edited';
}
interface DeepAgentInterrupt {
    id: string;
    type: 'tool_calls' | 'confirmation' | 'error';
    message?: string;
    actionRequests: DeepAgentActionRequest[];
    timestamp: number;
    threadId?: string;
}
interface GenerationRequest {
    id: string;
    prompt: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: OrbitalSchema;
    error?: string;
}
interface GenerationProgress {
    stage: string;
    percent: number;
    message: string;
}
interface UseDeepAgentGenerationResult {
    requests: GenerationRequest[];
    currentRequest: GenerationRequest | null;
    isGenerating: boolean;
    isLoading: boolean;
    isComplete: boolean;
    progress: GenerationProgress;
    error: string | null;
    interrupt: DeepAgentInterrupt | null;
    generate: (prompt: string) => Promise<OrbitalSchema | null>;
    startGeneration: (skill: string, prompt: string, options?: Record<string, unknown>) => Promise<void>;
    cancelGeneration: () => void;
    clearRequests: () => void;
    submitInterruptDecisions: (decisions: unknown[]) => void;
}
declare function useDeepAgentGeneration(): UseDeepAgentGenerationResult;

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}
type AvatarRole = 'user' | 'assistant' | 'system';
type FileOperation = 'ls' | 'read_file' | 'write_file' | 'edit_file';
type Activity = {
    type: 'message';
    role: AvatarRole;
    content: string;
    timestamp: number;
    isStreaming?: boolean;
} | {
    type: 'tool_call';
    tool: string;
    args: Record<string, unknown>;
    timestamp: number;
    isExecuting?: boolean;
} | {
    type: 'tool_result';
    tool: string;
    result: unknown;
    success: boolean;
    timestamp: number;
} | {
    type: 'file_operation';
    operation: FileOperation;
    path: string;
    success?: boolean;
    timestamp: number;
} | {
    type: 'schema_diff';
    filePath: string;
    hunks: DiffHunk[];
    timestamp: number;
} | {
    type: 'error';
    message: string;
    code?: string;
    timestamp: number;
};
interface TodoActivity {
    type: 'thinking' | 'tool_call' | 'tool_result' | 'code_change';
    content: string;
    timestamp: number;
    tool?: string;
    success?: boolean;
    filePath?: string;
    diff?: string;
}
interface Todo {
    id: string;
    task: string;
    status: 'pending' | 'in_progress' | 'completed';
    latestActivity?: TodoActivity;
    activityHistory?: TodoActivity[];
}
interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: Array<{
        type: 'add' | 'remove' | 'context';
        content: string;
    }>;
}
interface SchemaDiff {
    id: string;
    filePath: string;
    hunks: DiffHunk[];
    timestamp: number;
    addedLines: number;
    removedLines: number;
}
type AgentStatus = 'idle' | 'running' | 'complete' | 'error' | 'interrupted';
interface UseAgentChatOptions {
    appId?: string;
    onComplete?: (schema?: unknown) => void;
    onSchemaChange?: (diff?: unknown) => void;
    onError?: (error: Error | string) => void;
}
interface UseAgentChatResult {
    messages: ChatMessage[];
    status: AgentStatus;
    activities: Activity[];
    todos: Todo[];
    schemaDiffs: SchemaDiff[];
    isLoading: boolean;
    error: string | null;
    threadId: string | null;
    interrupt: DeepAgentInterrupt | null;
    sendMessage: (content: string) => Promise<void>;
    startGeneration: (skill: string | string[], prompt: string, options?: Record<string, unknown>) => Promise<void>;
    continueConversation: (message: string | string[]) => Promise<void>;
    resumeWithDecision: (decisions: unknown[]) => Promise<void>;
    cancel: () => void;
    clearMessages: () => void;
    clearHistory: () => void;
}
declare function useAgentChat(options?: UseAgentChatOptions): UseAgentChatResult;

interface LLMErrorContext {
    rawValuePreview?: string;
    expectedType?: string;
    actualType?: string;
    source?: {
        agent: 'requirements' | 'builder' | 'view-planner';
        operation: string;
        promptHash?: string;
    };
    tokenUsage?: {
        prompt: number;
        completion: number;
    };
}
interface ValidationError {
    code: string;
    message: string;
    path?: string;
    severity: 'error' | 'warning';
    suggestion?: string;
    validValues?: string[];
    expectedShape?: string;
    fixGuidance?: string;
    llmContext?: LLMErrorContext;
}
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}
type ValidationStage = 'idle' | 'validating' | 'fixing' | 'complete';
interface UseValidationResult {
    result: ValidationResult | null;
    isValidating: boolean;
    error: string | null;
    stage: ValidationStage;
    isFixing: boolean;
    progressMessage: string | null;
    errors: ValidationError[];
    warnings: ValidationError[];
    isValid: boolean;
    validate: (appId: string) => Promise<ValidationResult>;
    clearResult: () => void;
    reset: () => void;
}
declare function useValidation(): UseValidationResult;

/**
 * Hook to bridge UI events to state machine dispatch
 *
 * @param dispatch - The state machine dispatch function
 * @param validEvents - Optional array of valid event names (filters which events to handle)
 * @param eventBusInstance - Optional event bus instance (for testing, uses hook if not provided)
 */
declare function useUIEvents<E extends string>(dispatch: (event: E, payload?: unknown) => void, validEvents?: readonly E[], eventBusInstance?: ReturnType<typeof useEventBus>): void;
/**
 * Hook for selected entity tracking
 * Many list UIs need to track which item is selected.
 *
 * This hook uses SelectionProvider if available (preferred),
 * otherwise falls back to listening to events directly.
 *
 * @example Using with SelectionProvider (recommended)
 * ```tsx
 * function MyPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider>
 *         <MyComponent />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [selected, setSelected] = useSelectedEntity<Order>();
 *   // selected is automatically updated when UI:VIEW/UI:SELECT events fire
 * }
 * ```
 */
declare function useSelectedEntity<T>(eventBusInstance?: ReturnType<typeof useEventBus>): [T | null, (entity: T | null) => void];

interface EntityDataAdapter {
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
declare function EntityDataProvider({ adapter, children, }: {
    adapter: EntityDataAdapter;
    children: ReactNode;
}): React__default.FunctionComponentElement<React__default.ProviderProps<EntityDataAdapter | null>>;
/**
 * Access the entity data adapter (null if no provider).
 */
declare function useEntityDataAdapter(): EntityDataAdapter | null;
declare const entityDataKeys: {
    all: readonly ["entities"];
    lists: () => readonly ["entities", "list"];
    list: (entity: string, filters?: Record<string, unknown>) => readonly ["entities", "list", string, Record<string, unknown> | undefined];
    details: () => readonly ["entities", "detail"];
    detail: (entity: string, id: string) => readonly ["entities", "detail", string, string];
};
type EntityDataRecord = Record<string, unknown>;
interface UseEntityListOptions {
    /** Skip fetching */
    skip?: boolean;
}
interface UseEntityListResult<T = Record<string, unknown>> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
interface UseEntityDetailResult<T = Record<string, unknown>> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
/**
 * Hook for fetching entity list data.
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
declare function useEntityList<T = Record<string, unknown>>(entity: string | undefined, options?: UseEntityListOptions): UseEntityListResult<T>;
/**
 * Hook for fetching a single entity by ID.
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
declare function useEntity$1<T = Record<string, unknown>>(entity: string | undefined, id: string | undefined): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for fetching entity detail by ID (alias for useEntity with refetch).
 * Uses EntityDataContext if available, otherwise falls back to stub.
 */
declare function useEntityDetail<T = Record<string, unknown>>(entity: string | undefined, id: string | undefined): UseEntityDetailResult<T>;
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
declare function useEntityListSuspense<T = Record<string, unknown>>(entity: string): {
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
declare function useEntitySuspense<T = Record<string, unknown>>(entity: string, id: string): {
    data: T | null;
    refetch: () => void;
};

/**
 * Query state for filters and search
 */
interface QueryState {
    search?: string;
    filters?: Record<string, unknown>;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
}
/**
 * Query singleton entity reference
 */
interface QuerySingletonEntity {
    name: string;
    fields: Record<string, unknown>;
}
/**
 * Query singleton result type
 */
interface QuerySingletonResult {
    state: QueryState;
    setState: (state: Partial<QueryState>) => void;
    reset: () => void;
}
interface QuerySingletonState {
    /** Current search term */
    search: string;
    /** Set search term */
    setSearch: (value: string) => void;
    /** Current filters */
    filters: Record<string, unknown>;
    /** Set a filter value */
    setFilter: (key: string, value: unknown) => void;
    /** Clear all filters */
    clearFilters: () => void;
    /** Current sort field */
    sortField?: string;
    /** Current sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Set sort */
    setSort: (field: string, direction: 'asc' | 'desc') => void;
}
/**
 * Hook for accessing a query singleton by name
 *
 * @param query - Query singleton name (e.g., "@TaskQuery")
 * @returns Query singleton state or null if no query provided
 *
 * @example
 * ```tsx
 * const queryState = useQuerySingleton('@TaskQuery');
 *
 * // Use search state
 * queryState?.search
 * queryState?.setSearch('new search term')
 * ```
 */
declare function useQuerySingleton(query?: string): QuerySingletonState | null;
/**
 * Parse a query binding string to extract the query singleton name
 *
 * @param binding - Binding string like "@TaskQuery.search" or "@TaskQuery"
 * @returns Object with query name and optional field path
 *
 * @example
 * ```tsx
 * parseQueryBinding('@TaskQuery.search')
 * // { query: 'TaskQuery', field: 'search' }
 *
 * parseQueryBinding('@TaskQuery')
 * // { query: 'TaskQuery', field: undefined }
 * ```
 */
declare function parseQueryBinding(binding: string): {
    query: string;
    field?: string;
};

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
declare const ENTITY_EVENTS: {
    readonly CREATE: "ENTITY_CREATE";
    readonly UPDATE: "ENTITY_UPDATE";
    readonly DELETE: "ENTITY_DELETE";
};
interface OrbitalEventPayload {
    event: string;
    payload?: Record<string, unknown>;
    entityId?: string;
}
interface OrbitalEventResponse {
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
declare function useOrbitalMutations(entityName: string, orbitalName: string, options?: {
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
    createMutation: _tanstack_react_query.UseMutationResult<OrbitalEventResponse, Error, Record<string, unknown>, unknown>;
    updateMutation: _tanstack_react_query.UseMutationResult<OrbitalEventResponse, Error, {
        id: string;
        data: Record<string, unknown>;
    }, unknown>;
    deleteMutation: _tanstack_react_query.UseMutationResult<OrbitalEventResponse, Error, string, unknown>;
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
declare function useSendOrbitalEvent(orbitalName: string): {
    sendEvent: (event: string, payload?: Record<string, unknown>, entityId?: string) => Promise<OrbitalEventResponse>;
    isPending: boolean;
    error: Error | null;
    data: OrbitalEventResponse | undefined;
};

interface EntityMutationResult {
    id: string;
    [key: string]: unknown;
}
/**
 * Hook for creating entities
 */
declare function useCreateEntity(entityName: string): _tanstack_react_query.UseMutationResult<EntityMutationResult, Error, Record<string, unknown>, unknown>;
/**
 * Hook for updating entities
 */
declare function useUpdateEntity(entityName: string): _tanstack_react_query.UseMutationResult<EntityMutationResult, Error, {
    id: string;
    data: Record<string, unknown>;
}, unknown>;
/**
 * Hook for deleting entities
 */
declare function useDeleteEntity(entityName: string): _tanstack_react_query.UseMutationResult<{
    id: string;
}, Error, string, unknown>;
interface UseEntityMutationsOptions {
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
declare function useEntityMutations(entityName: string, options?: UseEntityMutationsOptions): {
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

/**
 * Hook to access all entities
 */
declare function useEntities(): {
    entities: Map<string, Entity>;
    getEntity: typeof getEntity;
    getByType: typeof getByType;
    getAllEntities: typeof getAllEntities;
    getSingleton: typeof getSingleton;
    spawnEntity: typeof spawnEntity;
    updateEntity: typeof updateEntity;
    updateSingleton: typeof updateSingleton;
    removeEntity: typeof removeEntity;
    clearEntities: typeof clearEntities;
};
/**
 * Hook to access a specific entity by ID
 */
declare function useEntity(id: string): Entity | undefined;
/**
 * Hook to access entities of a specific type
 */
declare function useEntitiesByType(type: string): Entity[];
/**
 * Hook to access a singleton entity by type
 */
declare function useSingletonEntity<T extends Entity = Entity>(type: string): T | undefined;
/**
 * Hook for Player entity (convenience)
 */
declare function usePlayer(): {
    player: Entity | undefined;
    updatePlayer: (updates: Partial<Entity>) => void;
};
/**
 * Hook for Physics entity (convenience)
 */
declare function usePhysics(): {
    physics: Entity | undefined;
    updatePhysics: (updates: Partial<Entity>) => void;
};
/**
 * Hook for Input entity (convenience)
 */
declare function useInput(): {
    input: Entity | undefined;
    updateInput: (updates: Partial<Entity>) => void;
};

type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;
interface I18nContextValue {
    /** Current locale code (e.g. 'en', 'ar', 'sl') */
    locale: string;
    /** Text direction for the current locale */
    direction: 'ltr' | 'rtl';
    /** Translate a key, with optional interpolation params */
    t: TranslateFunction;
}
/**
 * Provider component — wrap your app or Storybook decorator with this.
 *
 * ```tsx
 * <I18nProvider value={{ locale: 'ar', direction: 'rtl', t: createTranslate(arMessages) }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
declare const I18nProvider: React.Provider<I18nContextValue>;
/**
 * Hook to access the current locale and translate function.
 * Safe to call without a provider — returns passthrough t().
 */
declare function useTranslate(): I18nContextValue;
/**
 * Create a translate function from a flat messages object.
 *
 * ```ts
 * const t = createTranslate({ 'common.save': 'Save', 'table.showing': 'Showing {{count}} of {{total}}' });
 * t('common.save') // → 'Save'
 * t('table.showing', { count: 5, total: 20 }) // → 'Showing 5 of 20'
 * t('missing.key') // → 'missing.key' (fallback)
 * ```
 */
declare function createTranslate(messages: Record<string, string>): TranslateFunction;

interface ResolvedEntity<T> {
    /** Resolved data array */
    data: T[];
    /** True when data was provided directly via props (not fetched) */
    isLocal: boolean;
    /** Loading state — always false for local data */
    isLoading: boolean;
    /** Error state — always null for local data */
    error: Error | null;
}
/**
 * Resolves entity data from either a direct `data` prop or an `entity` string.
 *
 * When `data` is provided, it is used directly (isLocal: true).
 * When only `entity` (string) is provided, data is fetched via useEntityList.
 * Direct `data` always takes precedence over auto-fetch.
 *
 * @param entity - Entity name string for auto-fetch, or undefined
 * @param data - Direct data array from trait render-ui, or undefined
 * @returns Normalized { data, isLocal, isLoading, error }
 *
 * @example
 * ```tsx
 * function MyOrganism({ entity, data, isLoading, error }: MyProps) {
 *   const resolved = useResolvedEntity<Item>(entity, data);
 *   // resolved.data is always T[] regardless of source
 *   // resolved.isLocal tells you if data came from props
 * }
 * ```
 */
declare function useResolvedEntity<T = Record<string, unknown>>(entity: string | undefined, data: readonly T[] | T[] | undefined): ResolvedEntity<T>;

/**
 * Auth Context Hook Stub
 *
 * Provides a placeholder auth context for the design system.
 * Applications should provide their own AuthContext provider
 * that implements this interface.
 */
interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}
interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signIn?: () => Promise<void>;
    signOut?: () => Promise<void>;
}
/**
 * Stub hook that returns empty auth context.
 * Applications should wrap their app with an AuthProvider
 * that supplies real auth state.
 */
declare function useAuthContext(): AuthContextValue;

/**
 * GitHub connection status
 */
interface GitHubStatus {
    connected: boolean;
    username?: string;
    avatarUrl?: string;
    scopes?: string[];
    connectedAt?: number;
    lastUsedAt?: number;
}
/**
 * GitHub repository
 */
interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    owner: string;
    isPrivate: boolean;
    description: string | null;
    defaultBranch: string;
    url: string;
}
/**
 * Hook to get GitHub connection status
 */
declare function useGitHubStatus(): _tanstack_react_query.UseQueryResult<GitHubStatus, Error>;
/**
 * Hook to connect GitHub (initiate OAuth flow)
 */
declare function useConnectGitHub(): {
    connectGitHub: () => void;
};
/**
 * Hook to disconnect GitHub
 */
declare function useDisconnectGitHub(): _tanstack_react_query.UseMutationResult<unknown, Error, void, unknown>;
/**
 * Hook to list GitHub repositories
 */
declare function useGitHubRepos(page?: number, perPage?: number): _tanstack_react_query.UseQueryResult<{
    repos: GitHubRepo[];
    page: number;
    perPage: number;
}, Error>;
/**
 * Hook to get repository details
 */
declare function useGitHubRepo(owner: string, repo: string, enabled?: boolean): _tanstack_react_query.UseQueryResult<{
    repo: GitHubRepo;
}, Error>;
/**
 * Hook to list repository branches
 */
declare function useGitHubBranches(owner: string, repo: string, enabled?: boolean): _tanstack_react_query.UseQueryResult<{
    branches: string[];
}, Error>;

export { type AuthContextValue, type AuthUser, type ChangeSummary, type CompileResult, type CompileStage, ENTITY_EVENTS, Entity, type EntityDataAdapter, EntityDataProvider, type EntityDataRecord, type EntityMutationResult, EventBusContextType, EventListener, type Extension, type ExtensionManifest, type FileSystemFile, type FileSystemStatus, type GitHubRepo, type GitHubStatus, type HistoryTimelineItem, type I18nContextValue, I18nProvider, type OpenFile, type OrbitalEventPayload, type OrbitalEventResponse, type QuerySingletonEntity, type QuerySingletonResult, type QuerySingletonState, type QueryState, type ResolvedEntity, type RevertResult, type SelectedFile, type TranslateFunction, type UseCompileResult, type UseEntityDetailResult, type UseEntityListOptions, type UseEntityListResult, type UseEntityMutationsOptions, type UseExtensionsOptions, type UseExtensionsResult, type UseFileEditorOptions, type UseFileEditorResult, type UseFileSystemResult, type UseOrbitalHistoryOptions, type UseOrbitalHistoryResult, clearEntities, createTranslate, entityDataKeys, getAllEntities, getByType, getEntity, getSingleton, parseQueryBinding, removeEntity, spawnEntity, updateEntity, updateSingleton, useAgentChat, useAuthContext, useCompile, useConnectGitHub, useCreateEntity, useDeepAgentGeneration, useDeleteEntity, useDisconnectGitHub, useEmitEvent, useEntities, useEntitiesByType, useEntity$1 as useEntity, useEntity as useEntityById, useEntityDataAdapter, useEntityDetail, useEntityList, useEntityListSuspense, useEntityMutations, useEntitySuspense, useEventBus, useEventListener, useExtensions, useFileEditor, useFileSystem, useGitHubBranches, useGitHubRepo, useGitHubRepos, useGitHubStatus, useInput, useOrbitalHistory, useOrbitalMutations, usePhysics, usePlayer, usePreview, useQuerySingleton, useResolvedEntity, useSelectedEntity, useSendOrbitalEvent, useSingletonEntity, useTranslate, useUIEvents, useUpdateEntity, useValidation };
