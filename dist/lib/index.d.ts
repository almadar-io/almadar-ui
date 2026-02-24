export { C as ContentSegment, D as DEFAULT_CONFIG, a as DomEntityBox, b as DomLayoutData, c as DomOutputsBox, d as DomStateNode, e as DomTransitionLabel, f as DomTransitionPath, E as EntityDefinition, R as RenderOptions, S as StateDefinition, g as StateMachineDefinition, T as TransitionDefinition, V as VisualizerConfig, h as cn, i as extractOutputsFromTransitions, j as extractStateMachine, k as formatGuard, l as getEffectSummary, p as parseContentSegments, m as parseMarkdownWithCodeBlocks, r as renderStateMachineToDomData, n as renderStateMachineToSvg } from '../cn-BoBXsxuX.js';
import 'clsx';

/**
 * API Client - HTTP client for backend API calls
 *
 * Provides typed methods for making API requests.
 * All requests go through the backend server, NOT directly to Firestore.
 *
 * @packageDocumentation
 */
/**
 * API Error class for handling HTTP errors
 */
declare class ApiError extends Error {
    status: number;
    statusText: string;
    constructor(status: number, statusText: string, message?: string);
}
/**
 * API client with typed methods
 */
declare const apiClient: {
    /**
     * GET request
     */
    get<T>(endpoint: string): Promise<T>;
    /**
     * POST request
     */
    post<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = void>(endpoint: string): Promise<T>;
};

/**
 * Debug utilities for development
 */
declare function isDebugEnabled(): boolean;
declare function debug(...args: unknown[]): void;
declare function debugGroup(label: string): void;
declare function debugGroupEnd(): void;
declare function debugWarn(...args: unknown[]): void;
declare function debugError(...args: unknown[]): void;
declare function debugTable(data: unknown): void;
declare function debugTime(label: string): void;
declare function debugTimeEnd(label: string): void;
/**
 * Debug input events (keyboard, mouse, touch)
 * @param inputType - Type of input (e.g., 'keydown', 'keyup', 'mouse')
 * @param data - Input data to log
 */
declare function debugInput(inputType: string, data: unknown): void;
/**
 * Debug collision events between entities
 * @param entityA - First entity in collision
 * @param entityB - Second entity in collision
 * @param details - Additional collision details
 */
declare function debugCollision(entityA: {
    id?: string;
    type?: string;
}, entityB: {
    id?: string;
    type?: string;
}, details?: unknown): void;
/**
 * Debug physics updates (position, velocity)
 * @param entityId - Entity identifier
 * @param physics - Physics data to log
 */
declare function debugPhysics(entityId: string, physics: unknown): void;
/**
 * Debug game state changes
 * @param stateName - Name of the state that changed
 * @param value - New state value
 */
declare function debugGameState(stateName: string, value: unknown): void;

/**
 * Debug Utilities - Functions for toggling and checking debug mode
 *
 * @packageDocumentation
 */
type DebugToggleListener = (enabled: boolean) => void;
/**
 * Enable or disable debug mode
 */
declare function setDebugEnabled(enabled: boolean): void;
/**
 * Toggle debug mode
 */
declare function toggleDebug(): boolean;
/**
 * Subscribe to debug mode changes
 */
declare function onDebugToggle(listener: DebugToggleListener): () => void;
/**
 * Initialize debug mode from keyboard shortcut (Ctrl+Shift+D)
 */
declare function initDebugShortcut(): () => void;

/**
 * Entity Debug - Provides entity state snapshots for debugging
 *
 * @packageDocumentation
 */
interface EntityState {
    id: string;
    type: string;
    fields: Record<string, unknown>;
    lastUpdated: number;
}
interface RuntimeEntity {
    id: string;
    type: string;
    data: Record<string, unknown>;
}
interface PersistentEntityInfo {
    loaded: boolean;
    count: number;
}
interface EntitySnapshot {
    entities: EntityState[];
    timestamp: number;
    totalCount: number;
    /** Singleton entities by name */
    singletons: Record<string, unknown>;
    /** Runtime entities (in-memory) */
    runtime: RuntimeEntity[];
    /** Persistent entities info by type */
    persistent: Record<string, PersistentEntityInfo>;
}
type EntityProvider = () => EntityState[];
declare function setEntityProvider(provider: EntityProvider): void;
declare function clearEntityProvider(): void;
declare function getEntitySnapshot(): EntitySnapshot | null;
declare function getEntityById(id: string): EntityState | undefined;
declare function getEntitiesByType(type: string): EntityState[];

/**
 * Debug Registry - Central event log for debugging
 *
 * @packageDocumentation
 */
type DebugEventType = 'state-change' | 'event-fired' | 'effect-executed' | 'guard-evaluated' | 'error' | 'warning' | 'info';
interface DebugEvent {
    id: string;
    type: DebugEventType;
    source: string;
    message: string;
    data?: Record<string, unknown>;
    timestamp: number;
}
type ChangeListener$4 = () => void;
declare function logDebugEvent(type: DebugEventType, source: string, message: string, data?: Record<string, unknown>): void;
declare function logStateChange(source: string, from: string, to: string, event?: string): void;
declare function logEventFired(source: string, eventName: string, payload?: unknown): void;
declare function logEffectExecuted(source: string, effectType: string, details?: unknown): void;
declare function logError(source: string, message: string, error?: unknown): void;
declare function logWarning(source: string, message: string, data?: Record<string, unknown>): void;
declare function logInfo(source: string, message: string, data?: Record<string, unknown>): void;
declare function getDebugEvents(): DebugEvent[];
declare function getRecentEvents(count: number): DebugEvent[];
declare function getEventsByType(type: DebugEventType): DebugEvent[];
declare function getEventsBySource(source: string): DebugEvent[];
declare function subscribeToDebugEvents(listener: ChangeListener$4): () => void;
declare function clearDebugEvents(): void;

/**
 * Guard Registry - Tracks guard evaluations for debugging
 *
 * @packageDocumentation
 */
interface GuardContext {
    traitName?: string;
    type?: "transition" | "tick";
    transitionFrom?: string;
    transitionTo?: string;
    tickName?: string;
    [key: string]: unknown;
}
interface GuardEvaluation {
    id: string;
    traitName: string;
    guardName: string;
    expression: string;
    result: boolean;
    context: GuardContext;
    timestamp: number;
    /** Input values used in guard evaluation */
    inputs: Record<string, unknown>;
}
type ChangeListener$3 = () => void;
declare function recordGuardEvaluation(evaluation: Omit<GuardEvaluation, "id" | "timestamp">): void;
declare function getGuardHistory(): GuardEvaluation[];
declare function getRecentGuardEvaluations(count: number): GuardEvaluation[];
declare function getGuardEvaluationsForTrait(traitName: string): GuardEvaluation[];
declare function subscribeToGuardChanges(listener: ChangeListener$3): () => void;
declare function clearGuardHistory(): void;

/**
 * Tick Registry - Tracks scheduled tick executions for debugging
 *
 * @packageDocumentation
 */
interface TickExecution {
    id: string;
    traitName: string;
    /** Tick name (display name) */
    name: string;
    /** Tick identifier */
    tickName: string;
    interval: number;
    /** Last execution timestamp */
    lastRun: number;
    lastExecuted: number | null;
    nextExecution: number | null;
    /** Number of times this tick has run */
    runCount: number;
    executionCount: number;
    /** Average execution time in ms */
    executionTime: number;
    /** Whether the tick is currently active */
    active: boolean;
    isActive: boolean;
    /** Guard name if this tick has a guard */
    guardName?: string;
    /** Whether the guard passed on last evaluation */
    guardPassed?: boolean;
}
type ChangeListener$2 = () => void;
declare function registerTick(tick: TickExecution): void;
declare function updateTickExecution(id: string, timestamp: number): void;
declare function setTickActive(id: string, isActive: boolean): void;
declare function unregisterTick(id: string): void;
declare function getAllTicks(): TickExecution[];
declare function getTick(id: string): TickExecution | undefined;
declare function subscribeToTickChanges(listener: ChangeListener$2): () => void;
declare function clearTicks(): void;

/**
 * Trait Registry - Tracks active traits and their state machines for debugging
 *
 * @packageDocumentation
 */
interface TraitTransition {
    from: string;
    to: string;
    event: string;
    guard?: string;
}
interface TraitGuard {
    name: string;
    lastResult?: boolean;
}
interface TraitDebugInfo {
    id: string;
    name: string;
    currentState: string;
    states: string[];
    transitions: TraitTransition[];
    guards: TraitGuard[];
    transitionCount: number;
}
type ChangeListener$1 = () => void;
declare function registerTrait(info: TraitDebugInfo): void;
declare function updateTraitState(id: string, newState: string): void;
declare function updateGuardResult(traitId: string, guardName: string, result: boolean): void;
declare function unregisterTrait(id: string): void;
declare function getAllTraits(): TraitDebugInfo[];
declare function getTrait(id: string): TraitDebugInfo | undefined;
declare function subscribeToTraitChanges(listener: ChangeListener$1): () => void;
declare function clearTraits(): void;

/**
 * Verification Registry - Tracks runtime verification checks and transition traces
 *
 * Provides:
 * 1. A checklist of pass/fail checks (INIT has fetch, bridge connected, etc.)
 * 2. A full transition timeline with effect execution results
 * 3. ServerBridge health snapshot
 * 4. window.__orbitalVerification for Playwright/automation
 *
 * @packageDocumentation
 */
type CheckStatus = "pass" | "fail" | "pending" | "warn";
interface VerificationCheck {
    id: string;
    label: string;
    status: CheckStatus;
    details?: string;
    /** Timestamp when status last changed */
    updatedAt: number;
}
interface EffectTrace {
    type: string;
    args: unknown[];
    status: "executed" | "failed" | "skipped";
    error?: string;
    durationMs?: number;
}
interface TransitionTrace {
    id: string;
    traitName: string;
    from: string;
    to: string;
    event: string;
    guardExpression?: string;
    guardResult?: boolean;
    effects: EffectTrace[];
    timestamp: number;
}
interface BridgeHealth {
    connected: boolean;
    eventsForwarded: number;
    eventsReceived: number;
    lastError?: string;
    lastHeartbeat: number;
}
interface VerificationSummary {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    pending: number;
}
interface VerificationSnapshot {
    checks: VerificationCheck[];
    transitions: TransitionTrace[];
    bridge: BridgeHealth | null;
    summary: VerificationSummary;
}
type ChangeListener = () => void;
declare function registerCheck(id: string, label: string, status?: CheckStatus, details?: string): void;
declare function updateCheck(id: string, status: CheckStatus, details?: string): void;
declare function getAllChecks(): VerificationCheck[];
declare function recordTransition(trace: Omit<TransitionTrace, "id">): void;
declare function getTransitions(): TransitionTrace[];
declare function getTransitionsForTrait(traitName: string): TransitionTrace[];
declare function updateBridgeHealth(health: BridgeHealth): void;
declare function getBridgeHealth(): BridgeHealth | null;
declare function getSummary(): VerificationSummary;
declare function getSnapshot(): VerificationSnapshot;
declare function subscribeToVerification(listener: ChangeListener): () => void;
/** Exposed on window for Playwright to query */
interface OrbitalVerificationAPI {
    getSnapshot: () => VerificationSnapshot;
    getChecks: () => VerificationCheck[];
    getTransitions: () => TransitionTrace[];
    getBridge: () => BridgeHealth | null;
    getSummary: () => VerificationSummary;
    /** Wait for a specific event to be processed */
    waitForTransition: (event: string, timeoutMs?: number) => Promise<TransitionTrace | null>;
    /** Send an event into the runtime (requires eventBus binding) */
    sendEvent?: (event: string, payload?: Record<string, unknown>) => void;
    /** Get current trait state */
    getTraitState?: (traitName: string) => string | undefined;
}
declare global {
    interface Window {
        __orbitalVerification?: OrbitalVerificationAPI;
    }
}
/**
 * Wait for a transition matching the given event to appear.
 * Returns the trace or null on timeout.
 */
declare function waitForTransition(event: string, timeoutMs?: number): Promise<TransitionTrace | null>;
/**
 * Bind the EventBus so automation can send events.
 * Call this during app initialization.
 */
declare function bindEventBus(eventBus: {
    emit: (type: string, payload?: Record<string, unknown>) => void;
}): void;
/**
 * Bind a trait state getter so automation can query current states.
 */
declare function bindTraitStateGetter(getter: (traitName: string) => string | undefined): void;
declare function clearVerification(): void;

/**
 * Get Nested Value Utility
 *
 * Safely retrieves nested values from objects using dot-notation paths.
 * Used by display components to support relation field access like "company.name".
 *
 * @packageDocumentation
 */
/**
 * Get a nested value from an object using dot-notation path.
 *
 * @param obj - The object to traverse
 * @param path - Dot-notation path (e.g., "company.name", "address.city")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * const data = { company: { name: "Acme Corp", address: { city: "NYC" } } };
 * getNestedValue(data, "company.name");         // => "Acme Corp"
 * getNestedValue(data, "company.address.city"); // => "NYC"
 * getNestedValue(data, "company.missing");      // => undefined
 */
declare function getNestedValue(obj: Record<string, unknown> | null | undefined, path: string): unknown;
/**
 * Format a nested field path as a human-readable label.
 *
 * @param path - Dot-notation path (e.g., "company.name")
 * @returns Formatted label (e.g., "Company Name")
 *
 * @example
 * formatFieldLabel("company.name");    // => "Company Name"
 * formatFieldLabel("address.zipCode"); // => "Address Zip Code"
 */
declare function formatNestedFieldLabel(path: string): string;

export { ApiError, type BridgeHealth, type CheckStatus, type DebugEvent, type DebugEventType, type EffectTrace, type EntitySnapshot, type EntityState, type GuardContext, type GuardEvaluation, type PersistentEntityInfo, type RuntimeEntity, type TickExecution, type TraitDebugInfo, type TraitGuard, type TraitTransition, type TransitionTrace, type VerificationCheck, type VerificationSnapshot, type VerificationSummary, apiClient, bindEventBus, bindTraitStateGetter, clearDebugEvents, clearEntityProvider, clearGuardHistory, clearTicks, clearTraits, clearVerification, debug, debugCollision, debugError, debugGameState, debugGroup, debugGroupEnd, debugInput, debugPhysics, debugTable, debugTime, debugTimeEnd, debugWarn, formatNestedFieldLabel, getAllChecks, getAllTicks, getAllTraits, getBridgeHealth, getDebugEvents, getEntitiesByType, getEntityById, getEntitySnapshot, getEventsBySource, getEventsByType, getGuardEvaluationsForTrait, getGuardHistory, getNestedValue, getRecentEvents, getRecentGuardEvaluations, getSnapshot, getSummary, getTick, getTrait, getTransitions, getTransitionsForTrait, initDebugShortcut, isDebugEnabled, logDebugEvent, logEffectExecuted, logError, logEventFired, logInfo, logStateChange, logWarning, onDebugToggle, recordGuardEvaluation, recordTransition, registerCheck, registerTick, registerTrait, setDebugEnabled, setEntityProvider, setTickActive, subscribeToDebugEvents, subscribeToGuardChanges, subscribeToTickChanges, subscribeToTraitChanges, subscribeToVerification, toggleDebug, unregisterTick, unregisterTrait, updateBridgeHealth, updateCheck, updateGuardResult, updateTickExecution, updateTraitState, waitForTransition };
