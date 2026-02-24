import React__default, { ReactNode } from 'react';
import { b as ThemeDefinition } from '../ThemeContext-D9xUORq5.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { E as EventBusContextType } from '../event-bus-types-CjJduURa.js';
import { U as UseOfflineExecutorResult, a as UseOfflineExecutorOptions } from '../offline-executor-CHr4uAhf.js';

/**
 * Extended context type for backward compatibility.
 *
 * @deprecated getSelectedEntity and clearSelectedEntity are deprecated.
 * Use SelectionProvider and useSelection hook instead.
 */
interface EventBusContextTypeExtended extends EventBusContextType {
    /**
     * @deprecated Use useSelection from SelectionProvider instead.
     * This method now returns null - selection state moved to SelectionProvider.
     */
    getSelectedEntity: () => unknown | null;
    /**
     * @deprecated Use useSelection from SelectionProvider instead.
     * This method is now a no-op - selection state moved to SelectionProvider.
     */
    clearSelectedEntity: () => void;
}
declare const EventBusContext: React__default.Context<EventBusContextTypeExtended | null>;
interface EventBusProviderProps {
    children: ReactNode;
    /** Enable debug logging in development */
    debug?: boolean;
}
/**
 * Provider component for the page event bus.
 *
 * This is a pure pub/sub event bus. For selection state,
 * use SelectionProvider which listens to events and maintains state.
 *
 * @example
 * ```tsx
 * function TaskDetailPage() {
 *   return (
 *     <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
 *       <SelectionProvider>
 *         <TaskHeader />
 *         <TaskForm />
 *         <TaskActions />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
declare function EventBusProvider({ children, debug }: EventBusProviderProps): react_jsx_runtime.JSX.Element;

interface SelectionContextType<T = unknown> {
    /** The currently selected entity */
    selected: T | null;
    /** Manually set the selected entity */
    setSelected: (entity: T | null) => void;
    /** Clear the selection */
    clearSelection: () => void;
    /** Check if an entity is selected */
    isSelected: (entity: T) => boolean;
}
declare const SelectionContext: React__default.Context<SelectionContextType<unknown> | null>;
interface SelectionProviderProps {
    children: ReactNode;
    /** Enable debug logging */
    debug?: boolean;
    /** Custom comparison function for isSelected */
    compareEntities?: (a: unknown, b: unknown) => boolean;
}
/**
 * Provider component for selection state.
 *
 * Must be used within an EventBusProvider.
 *
 * @example
 * ```tsx
 * function OrderListPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider debug={process.env.NODE_ENV === 'development'}>
 *         <OrderTable />
 *         <OrderDetailDrawer />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
declare function SelectionProvider({ children, debug, compareEntities, }: SelectionProviderProps): react_jsx_runtime.JSX.Element;
/**
 * Hook to access selection state.
 *
 * @throws Error if used outside SelectionProvider
 *
 * @example
 * ```tsx
 * function OrderDetailDrawer() {
 *   const { selected, clearSelection } = useSelection<Order>();
 *
 *   if (!selected) return null;
 *
 *   return (
 *     <Drawer onClose={clearSelection}>
 *       <OrderDetail order={selected} />
 *     </Drawer>
 *   );
 * }
 * ```
 */
declare function useSelection<T = unknown>(): SelectionContextType<T>;
/**
 * Hook to access selection state with fallback for components
 * that may be used outside SelectionProvider.
 *
 * Returns null if no SelectionProvider is found.
 */
declare function useSelectionOptional<T = unknown>(): SelectionContextType<T> | null;

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

interface EntityRecord {
    id: string;
    [key: string]: unknown;
}
interface FetchedDataState {
    /** Entity data by entity name (e.g., { Task: [...], User: [...] }) */
    data: Record<string, EntityRecord[]>;
    /** Timestamp of last fetch per entity */
    fetchedAt: Record<string, number>;
    /** Whether data is currently being fetched */
    loading: boolean;
    /** Last error message */
    error: string | null;
}
interface FetchedDataContextValue {
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
declare const FetchedDataContext: React__default.Context<FetchedDataContextValue | null>;
interface FetchedDataProviderProps {
    /** Initial data (optional) */
    initialData?: Record<string, unknown[]>;
    /** Children */
    children: React__default.ReactNode;
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
declare function FetchedDataProvider({ initialData, children, }: FetchedDataProviderProps): React__default.ReactElement;
/**
 * Access the fetched data context.
 * Returns null if not within a FetchedDataProvider.
 */
declare function useFetchedDataContext(): FetchedDataContextValue | null;
/**
 * Access fetched data with fallback behavior.
 * If not in a provider, returns empty data.
 */
declare function useFetchedData(): FetchedDataContextValue;
/**
 * Access fetched data for a specific entity.
 * Provides a convenient API for entity-specific operations.
 */
declare function useFetchedEntity(entityName: string): {
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

/**
 * OrbitalProvider
 *
 * Unified provider that combines all required contexts for Orbital applications.
 * Provides a single import for both Builder preview and compiled shell.
 *
 * Combines:
 * - ThemeProvider - Theme and color mode management
 * - EventBusProvider - Page-scoped event pub/sub
 * - SelectionProvider - Selected entity tracking
 * - FetchedDataProvider - Server-fetched entity data
 *
 * @packageDocumentation
 */

interface OrbitalProviderProps {
    children: ReactNode;
    /** Custom themes (merged with built-in themes) */
    themes?: ThemeDefinition[];
    /** Default theme name */
    defaultTheme?: string;
    /** Default color mode */
    defaultMode?: 'light' | 'dark' | 'system';
    /** Optional target element ref for scoped theme application */
    targetRef?: React__default.RefObject<HTMLElement>;
    /** Skip ThemeProvider (use when already inside a themed container like shadow DOM) */
    skipTheme?: boolean;
    /** Enable debug logging for all providers */
    debug?: boolean;
    /** Initial fetched data */
    initialData?: Record<string, unknown[]>;
    /**
     * Enable Suspense mode. When true, UISlotRenderer wraps each slot in
     * `<ErrorBoundary><Suspense>` with Skeleton fallbacks.
     * Opt-in — existing isLoading prop pattern still works when false/absent.
     */
    suspense?: boolean;
    /**
     * Enable verification wiring for visual testing.
     * When true, lifecycle events are recorded and exposed via
     * `window.__orbitalVerification` for Playwright/automation.
     * Default: true in development, false in production.
     */
    verification?: boolean;
}
/**
 * OrbitalProvider - Unified context provider for Orbital applications
 *
 * Wraps your application with all required providers in the correct order.
 *
 * @example
 * ```tsx
 * // Basic usage
 * function App() {
 *   return (
 *     <OrbitalProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With configuration
 * function App() {
 *   return (
 *     <OrbitalProvider
 *       defaultTheme="minimalist"
 *       defaultMode="dark"
 *       debug={process.env.NODE_ENV === 'development'}
 *     >
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With custom themes from schema
 * import { THEMES } from './generated/theme-manifest';
 *
 * function App() {
 *   return (
 *     <OrbitalProvider themes={THEMES} defaultTheme="ocean">
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 * ```
 */
declare function OrbitalProvider({ children, themes, defaultTheme, defaultMode, targetRef, skipTheme, debug, initialData, suspense, verification, }: OrbitalProviderProps): React__default.ReactElement;
declare namespace OrbitalProvider {
    var displayName: string;
}

/**
 * VerificationProvider
 *
 * Wires the verification registry to both compiled and runtime execution paths.
 *
 * **Compiled apps**: Intercepts event bus lifecycle events
 *   (`{traitName}:DISPATCH`, `{traitName}:{event}:SUCCESS`, `{traitName}:{event}:ERROR`)
 *   emitted by `useOrbitalBridge` and records transitions via `recordTransition()`.
 *
 * **Runtime apps**: Accepts an optional `StateMachineManager` and wires its
 *   `TransitionObserver` to `recordTransition()`.
 *
 * **Both**: Calls `bindEventBus()` and `bindTraitStateGetter()` to populate
 *   `window.__orbitalVerification` for Playwright/automation.
 *
 * @packageDocumentation
 */

/**
 * Observer interface compatible with `StateMachineManager.setObserver()`.
 * Defined locally to avoid hard dependency on `@almadar/runtime`.
 */
interface TransitionObserver {
    onTransition(trace: {
        traitName: string;
        from: string;
        to: string;
        event: string;
        guardResult?: boolean;
        effects: Array<{
            type: string;
            args: unknown[];
            status: 'executed' | 'failed' | 'skipped';
            error?: string;
            durationMs?: number;
        }>;
    }): void;
}
/**
 * Minimal interface for StateMachineManager — avoids importing the full runtime.
 */
interface StateMachineManagerLike {
    setObserver(observer: TransitionObserver): void;
    getState?(traitName: string): string | undefined;
}
interface VerificationProviderProps {
    children: ReactNode;
    /** Enable verification wiring (default: true in dev, false in prod) */
    enabled?: boolean;
    /** Optional runtime StateMachineManager for interpreted mode */
    runtimeManager?: StateMachineManagerLike;
    /** Optional trait state getter for compiled apps (maps traitName → currentState) */
    traitStateGetter?: (traitName: string) => string | undefined;
}
/**
 * VerificationProvider — wires the verification registry to the event bus
 * and optional runtime manager. Renders children unchanged.
 */
declare function VerificationProvider({ children, enabled, runtimeManager, traitStateGetter, }: VerificationProviderProps): React__default.ReactElement;
declare namespace VerificationProvider {
    var displayName: string;
}

/**
 * OfflineModeProvider
 *
 * Context provider that wraps useOfflineExecutor with force-offline toggle support.
 * Enables testing offline behavior without actually disconnecting.
 *
 * @packageDocumentation
 */

interface OfflineModeContextValue extends UseOfflineExecutorResult {
    /** Force offline mode for testing */
    forceOffline: boolean;
    /** Toggle force offline mode */
    setForceOffline: (value: boolean) => void;
    /** Whether effectively offline (real or forced) */
    effectivelyOffline: boolean;
}
interface OfflineModeProviderProps extends UseOfflineExecutorOptions {
    children: React__default.ReactNode;
}
/**
 * OfflineModeProvider - Wraps offline executor with force-offline support.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <OfflineModeProvider
 *       serverUrl="/api/orbitals"
 *       authToken={token}
 *       autoSync={true}
 *       renderToSlot={slotManager.render}
 *       navigate={router.push}
 *       notify={toast.show}
 *       eventBus={{ emit: bus.emit }}
 *     >
 *       <PreviewPage />
 *     </OfflineModeProvider>
 *   );
 * }
 * ```
 */
declare function OfflineModeProvider({ children, ...executorOptions }: OfflineModeProviderProps): React__default.ReactElement;
/**
 * Access offline mode context.
 *
 * @example
 * ```tsx
 * function OfflineToggle() {
 *   const {
 *     effectivelyOffline,
 *     forceOffline,
 *     setForceOffline,
 *     pendingCount,
 *     sync,
 *   } = useOfflineMode();
 *
 *   return (
 *     <div>
 *       <Toggle
 *         checked={forceOffline}
 *         onChange={setForceOffline}
 *       >
 *         Test Offline
 *       </Toggle>
 *       {pendingCount > 0 && <Badge>{pendingCount} pending</Badge>}
 *       <Button onClick={sync}>Sync Now</Button>
 *     </div>
 *   );
 * }
 * ```
 */
declare function useOfflineMode(): OfflineModeContextValue;
/**
 * Check if offline mode provider is available (optional usage).
 */
declare function useOptionalOfflineMode(): OfflineModeContextValue | null;

export { type EntityRecord, EventBusContext, EventBusProvider, FetchedDataContext, type FetchedDataContextValue, FetchedDataProvider, type FetchedDataProviderProps, type FetchedDataState, type OfflineModeContextValue, OfflineModeProvider, type OfflineModeProviderProps, OrbitalProvider, type OrbitalProviderProps, SelectionContext, type SelectionContextType, SelectionProvider, ThemeDefinition, VerificationProvider, type VerificationProviderProps, useFetchedData, useFetchedDataContext, useFetchedEntity, useOfflineMode, useOptionalOfflineMode, useSelection, useSelectionOptional };
