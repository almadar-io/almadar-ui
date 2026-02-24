import { P as PatternConfig, R as ResolvedPattern, C as ClientEffect, b as ClientEffectExecutorConfig, N as NotifyOptions, D as DataContext, c as DataResolution, d as UISlot, S as SlotDefinition, e as SlotType } from '../offline-executor-CHr4uAhf.js';
export { E as EventResponse, O as OfflineExecutor, f as OfflineExecutorConfig, g as OfflineExecutorState, h as PendingSyncEffect, a as UseOfflineExecutorOptions, U as UseOfflineExecutorResult, i as createOfflineExecutor, u as useOfflineExecutor } from '../offline-executor-CHr4uAhf.js';
import * as React from 'react';
import React__default from 'react';
import { OrbitalSchema, OrbitalPage } from '@almadar/core';

/**
 * Pattern Resolver
 *
 * Resolves pattern configurations to component information.
 * Uses the central pattern registry and component mapping from orbital-shared/patterns/.
 *
 * This is the shared logic used by both Builder's PatternRenderer and
 * the compiled shell's UISlotRenderer.
 *
 * @packageDocumentation
 */

/**
 * Component mapping entry from component-mapping.json
 */
interface ComponentMappingEntry {
    component: string;
    importPath: string;
    category: string;
    deprecated?: boolean;
    replacedBy?: string;
}
/**
 * Pattern definition from registry.json
 */
interface PatternDefinition {
    type: string;
    category: string;
    description: string;
    propsSchema?: Record<string, {
        required?: boolean;
        types?: string[];
        description?: string;
    }>;
}
/**
 * Initialize the pattern resolver with mappings.
 * Called at app startup with data from JSON files.
 */
declare function initializePatternResolver(config: {
    componentMapping: Record<string, ComponentMappingEntry>;
    patternRegistry: Record<string, PatternDefinition>;
}): void;
/**
 * Set component mapping (alternative to full initialization).
 */
declare function setComponentMapping(mapping: Record<string, ComponentMappingEntry>): void;
/**
 * Set pattern registry (alternative to full initialization).
 */
declare function setPatternRegistry(registry: Record<string, PatternDefinition>): void;
/**
 * Resolve a pattern configuration to component information.
 *
 * @param config - Pattern configuration from render-ui effect
 * @returns Resolved pattern with component name, import path, and validated props
 * @throws Error if pattern type is unknown
 *
 * @example
 * ```typescript
 * const resolved = resolvePattern({
 *   type: 'entity-table',
 *   entity: 'Task',
 *   columns: ['title', 'status']
 * });
 * // resolved.component === 'DataTable'
 * // resolved.importPath === '@/components/organisms/DataTable'
 * ```
 */
declare function resolvePattern(config: PatternConfig): ResolvedPattern;
/**
 * Check if a pattern type is known.
 */
declare function isKnownPattern(type: string): boolean;
/**
 * Get all known pattern types.
 */
declare function getKnownPatterns(): string[];
/**
 * Get patterns by category.
 */
declare function getPatternsByCategory(category: string): string[];
/**
 * Get the component mapping for a pattern type.
 */
declare function getPatternMapping(type: string): ComponentMappingEntry | undefined;
/**
 * Get the pattern definition from the registry.
 */
declare function getPatternDefinition(type: string): PatternDefinition | undefined;

/**
 * Client Effect Executor
 *
 * Executes client effects returned from the server.
 * This is the core of the dual execution model - the server processes
 * events and returns client effects, which this module executes.
 *
 * Used by both Builder preview and compiled shells.
 *
 * @packageDocumentation
 */

/**
 * Execute an array of client effects.
 *
 * Effects are executed sequentially in order.
 * Errors in one effect don't prevent subsequent effects from executing.
 *
 * @param effects - Array of client effects to execute
 * @param config - Configuration providing implementations for each effect type
 *
 * @example
 * ```typescript
 * executeClientEffects(
 *   [
 *     ['render-ui', 'main', { type: 'entity-table', entity: 'Task' }],
 *     ['notify', 'Tasks loaded!', { type: 'success' }]
 *   ],
 *   {
 *     renderToSlot: (slot, pattern) => slotManager.render(slot, pattern),
 *     navigate: (path) => router.push(path),
 *     notify: (message, opts) => toast.show(message, opts),
 *     eventBus: { emit: (event, payload) => bus.emit(event, payload) }
 *   }
 * );
 * ```
 */
declare function executeClientEffects(effects: ClientEffect[], config: ClientEffectExecutorConfig): void;
/**
 * Parse a raw effect array into a typed ClientEffect.
 * Handles unknown effect formats gracefully.
 */
declare function parseClientEffect(raw: unknown[]): ClientEffect | null;
/**
 * Parse an array of raw effects into typed ClientEffects.
 * Filters out invalid effects.
 */
declare function parseClientEffects(raw: unknown[] | undefined): ClientEffect[];
/**
 * Filter effects by type.
 */
declare function filterEffectsByType<T extends ClientEffect[0]>(effects: ClientEffect[], type: T): Extract<ClientEffect, [T, ...unknown[]]>[];
/**
 * Get all render-ui effects.
 */
declare function getRenderUIEffects(effects: ClientEffect[]): Array<['render-ui', string, PatternConfig | null]>;
/**
 * Get all navigate effects.
 */
declare function getNavigateEffects(effects: ClientEffect[]): Array<['navigate', string, Record<string, unknown>?]>;
/**
 * Get all notify effects.
 */
declare function getNotifyEffects(effects: ClientEffect[]): Array<['notify', string, NotifyOptions?]>;
/**
 * Get all emit effects.
 */
declare function getEmitEffects(effects: ClientEffect[]): Array<['emit', string, unknown?]>;

/**
 * Options for the useClientEffects hook
 */
interface UseClientEffectsOptions extends ClientEffectExecutorConfig {
    /**
     * Whether to execute effects. Defaults to true.
     * Set to false to temporarily disable effect execution.
     */
    enabled?: boolean;
    /**
     * Debug mode - logs effect execution details.
     */
    debug?: boolean;
}
/**
 * Result of useClientEffects hook
 */
interface UseClientEffectsResult {
    /**
     * Number of effects executed in the last batch.
     */
    executedCount: number;
    /**
     * Whether effects are currently being executed.
     */
    executing: boolean;
    /**
     * Manually trigger effect execution.
     * Useful for imperative control.
     */
    execute: (effects: ClientEffect[]) => void;
}
/**
 * Execute client effects from server response.
 *
 * This hook automatically executes effects when they change,
 * tracking which effects have been executed to prevent duplicates.
 *
 * @param effects - Array of client effects to execute (from server response)
 * @param options - Configuration including effect implementations
 * @returns Hook result with execution state and manual trigger
 *
 * @example
 * ```typescript
 * function useMyTrait() {
 *   const [state, setState] = useState({ pendingEffects: [] });
 *   const effectConfig = useClientEffectConfig();
 *
 *   useClientEffects(state.pendingEffects, {
 *     ...effectConfig,
 *     onComplete: () => setState(s => ({ ...s, pendingEffects: [] }))
 *   });
 *
 *   // ...
 * }
 * ```
 */
declare function useClientEffects(effects: ClientEffect[] | undefined, options: UseClientEffectsOptions): UseClientEffectsResult;
declare const ClientEffectConfigContext: React.Context<ClientEffectExecutorConfig | null>;
/**
 * Provider for client effect configuration.
 */
declare const ClientEffectConfigProvider: React.Provider<ClientEffectExecutorConfig | null>;
/**
 * Hook to get the client effect configuration from context.
 *
 * @throws Error if used outside of ClientEffectConfigProvider
 *
 * @example
 * ```typescript
 * function MyTraitHook() {
 *   const effectConfig = useClientEffectConfig();
 *
 *   useClientEffects(pendingEffects, {
 *     ...effectConfig,
 *     onComplete: () => clearPendingEffects()
 *   });
 * }
 * ```
 */
declare function useClientEffectConfig(): ClientEffectExecutorConfig;
/**
 * Hook to get client effect configuration, returning null if not available.
 * Use this for optional integration where effects may not be configured.
 */
declare function useClientEffectConfigOptional(): ClientEffectExecutorConfig | null;

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
declare function resolveEntityData(entityName: string, context: DataContext): DataResolution;
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
declare function resolveEntityDataWithQuery(entityName: string, queryRef: string | undefined, context: DataContext): DataResolution;
/**
 * Get a single entity record by ID.
 */
declare function resolveEntityById(entityName: string, id: string | number, context: DataContext): unknown | null;
/**
 * Get the count of entities matching criteria.
 */
declare function resolveEntityCount(entityName: string, context: DataContext, filters?: Record<string, unknown>): number;
/**
 * Check if any entities exist for a given entity name.
 */
declare function hasEntities(entityName: string, context: DataContext): boolean;
/**
 * Create a data context from fetched data only.
 * Convenience function for compiled shells.
 */
declare function createFetchedDataContext(data: Record<string, unknown[]>): DataContext;
/**
 * Merge multiple data contexts.
 * Later contexts take precedence.
 */
declare function mergeDataContexts(...contexts: DataContext[]): DataContext;

/**
 * Slot Definitions
 *
 * Defines the available UI slots and their rendering behavior.
 * Slots are either inline (rendered in the component tree) or
 * portal (rendered to document.body via React Portal).
 *
 * @packageDocumentation
 */

/**
 * Definitions for all available UI slots.
 *
 * Inline slots render within the component hierarchy.
 * Portal slots render to document.body, breaking out of overflow containers.
 */
declare const SLOT_DEFINITIONS: Record<UISlot, SlotDefinition>;
/**
 * Get the slot definition for a slot name.
 */
declare function getSlotDefinition(slot: UISlot): SlotDefinition;
/**
 * Check if a slot is a portal slot.
 */
declare function isPortalSlot(slot: UISlot): boolean;
/**
 * Check if a slot is an inline slot.
 */
declare function isInlineSlot(slot: UISlot): boolean;
/**
 * Get all slots of a specific type.
 */
declare function getSlotsByType(type: SlotType): UISlot[];
/**
 * Get all inline slots.
 */
declare function getInlineSlots(): UISlot[];
/**
 * Get all portal slots.
 */
declare function getPortalSlots(): UISlot[];
/**
 * All valid slot names.
 */
declare const ALL_SLOTS: UISlot[];

/**
 * NavigationContext - Schema-Driven Navigation for Orbital Runtime
 *
 * Provides navigation within the orbital schema without react-router dependency.
 * Navigation works by:
 * 1. Matching path to a page in the schema
 * 2. Extracting route params (e.g., /inspection/:id → { id: "123" })
 * 3. Switching active page
 * 4. Triggering INIT with merged payload
 *
 * This approach works whether OrbitalRuntime is standalone or embedded in another app.
 *
 * Used by both:
 * - Builder runtime (interpreted execution)
 * - Compiled shells (generated applications)
 *
 * @packageDocumentation
 */

/**
 * Match a concrete path against a pattern with :param placeholders.
 * Returns null if no match, or the extracted params if match.
 *
 * @example
 * matchPath('/inspection/:id', '/inspection/123') // { id: '123' }
 * matchPath('/users/:userId/posts/:postId', '/users/42/posts/7') // { userId: '42', postId: '7' }
 * matchPath('/about', '/about') // {}
 * matchPath('/about', '/contact') // null
 */
declare function matchPath(pattern: string, path: string): Record<string, string> | null;
/**
 * Extract route params from a path given its pattern.
 * Wrapper around matchPath for explicit use.
 */
declare function extractRouteParams(pattern: string, path: string): Record<string, string>;
/**
 * Check if a path matches a pattern.
 */
declare function pathMatches(pattern: string, path: string): boolean;
/**
 * Find a page in the schema by matching its path pattern against a concrete path.
 * Returns the page and extracted route params.
 */
declare function findPageByPath(schema: OrbitalSchema, path: string): {
    page: OrbitalPage;
    params: Record<string, string>;
    orbitalName: string;
} | null;
/**
 * Find a page by name.
 */
declare function findPageByName(schema: OrbitalSchema, pageName: string): {
    page: OrbitalPage;
    orbitalName: string;
} | null;
/**
 * Get the first page in the schema (default page).
 */
declare function getDefaultPage(schema: OrbitalSchema): {
    page: OrbitalPage;
    orbitalName: string;
} | null;
/**
 * Get all pages from the schema.
 */
declare function getAllPages(schema: OrbitalSchema): Array<{
    page: OrbitalPage;
    orbitalName: string;
}>;
interface NavigationState {
    /** Current active page name */
    activePage: string;
    /** Current path (for URL sync) */
    currentPath: string;
    /** Payload to pass to INIT when page loads */
    initPayload: Record<string, unknown>;
    /** Navigation counter (increments on each navigation) */
    navigationId: number;
}
interface NavigationContextValue {
    /** Current navigation state */
    state: NavigationState;
    /** Navigate to a path with optional payload */
    navigateTo: (path: string, payload?: Record<string, unknown>) => void;
    /** Navigate to a page by name with optional payload */
    navigateToPage: (pageName: string, payload?: Record<string, unknown>) => void;
    /** The schema being navigated */
    schema: OrbitalSchema;
    /** Whether navigation is ready (schema loaded) */
    isReady: boolean;
}
interface NavigationProviderProps {
    /** The schema to navigate within */
    schema: OrbitalSchema;
    /** Initial page name (optional, defaults to first page) */
    initialPage?: string;
    /** Whether to update browser URL on navigation (default: true) */
    updateUrl?: boolean;
    /** Callback when navigation occurs */
    onNavigate?: (pageName: string, path: string, payload: Record<string, unknown>) => void;
    /** Children */
    children: React__default.ReactNode;
}
/**
 * NavigationProvider - Provides schema-driven navigation context
 *
 * @example
 * ```tsx
 * <NavigationProvider schema={mySchema}>
 *   <OrbitalRuntimeContent />
 * </NavigationProvider>
 * ```
 */
declare function NavigationProvider({ schema, initialPage, updateUrl, onNavigate, children, }: NavigationProviderProps): React__default.ReactElement;
/**
 * Hook to access navigation context.
 * Returns null if not within NavigationProvider.
 */
declare function useNavigation(): NavigationContextValue | null;
/**
 * Hook to get the navigateTo function.
 * Returns a no-op function if not within NavigationProvider.
 */
declare function useNavigateTo(): (path: string, payload?: Record<string, unknown>) => void;
/**
 * Hook to get current navigation state.
 */
declare function useNavigationState(): NavigationState | null;
/**
 * Hook to get the current INIT payload (for passing to trait INIT events).
 */
declare function useInitPayload(): Record<string, unknown>;
/**
 * Hook to get current active page name.
 */
declare function useActivePage(): string | null;
/**
 * Hook to get navigation ID (changes on each navigation, useful for triggering effects).
 */
declare function useNavigationId(): number;

/**
 * Pattern Resolver Initialization
 *
 * Loads pattern registry and component mapping from orbital-shared/patterns/
 * and initializes the pattern resolver at app startup.
 *
 * @packageDocumentation
 */
/**
 * Initialize the pattern resolver with shared pattern data.
 * Must be called once at app startup before any pattern rendering.
 * @returns The number of patterns initialized
 */
declare function initializePatterns(): number;

export { ALL_SLOTS, ClientEffect, ClientEffectConfigContext, ClientEffectConfigProvider, ClientEffectExecutorConfig, DataContext, DataResolution, type NavigationContextValue, NavigationProvider, type NavigationProviderProps, type NavigationState, NotifyOptions, PatternConfig, ResolvedPattern, SLOT_DEFINITIONS, SlotDefinition, SlotType, UISlot, type UseClientEffectsOptions, type UseClientEffectsResult, createFetchedDataContext, executeClientEffects, extractRouteParams, filterEffectsByType, findPageByName, findPageByPath, getAllPages, getDefaultPage, getEmitEffects, getInlineSlots, getKnownPatterns, getNavigateEffects, getNotifyEffects, getPatternDefinition, getPatternMapping, getPatternsByCategory, getPortalSlots, getRenderUIEffects, getSlotDefinition, getSlotsByType, hasEntities, initializePatternResolver, initializePatterns, isInlineSlot, isKnownPattern, isPortalSlot, matchPath, mergeDataContexts, parseClientEffect, parseClientEffects, pathMatches, resolveEntityById, resolveEntityCount, resolveEntityData, resolveEntityDataWithQuery, resolvePattern, setComponentMapping, setPatternRegistry, useActivePage, useClientEffectConfig, useClientEffectConfigOptional, useClientEffects, useInitPayload, useNavigateTo, useNavigation, useNavigationId, useNavigationState };
