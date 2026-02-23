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
export type CheckStatus = "pass" | "fail" | "pending" | "warn";
export interface VerificationCheck {
    id: string;
    label: string;
    status: CheckStatus;
    details?: string;
    /** Timestamp when status last changed */
    updatedAt: number;
}
export interface EffectTrace {
    type: string;
    args: unknown[];
    status: "executed" | "failed" | "skipped";
    error?: string;
    durationMs?: number;
}
export interface TransitionTrace {
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
export interface BridgeHealth {
    connected: boolean;
    eventsForwarded: number;
    eventsReceived: number;
    lastError?: string;
    lastHeartbeat: number;
}
export interface VerificationSummary {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    pending: number;
}
export interface VerificationSnapshot {
    checks: VerificationCheck[];
    transitions: TransitionTrace[];
    bridge: BridgeHealth | null;
    summary: VerificationSummary;
}
type ChangeListener = () => void;
export declare function registerCheck(id: string, label: string, status?: CheckStatus, details?: string): void;
export declare function updateCheck(id: string, status: CheckStatus, details?: string): void;
export declare function getAllChecks(): VerificationCheck[];
export declare function recordTransition(trace: Omit<TransitionTrace, "id">): void;
export declare function getTransitions(): TransitionTrace[];
export declare function getTransitionsForTrait(traitName: string): TransitionTrace[];
export declare function updateBridgeHealth(health: BridgeHealth): void;
export declare function getBridgeHealth(): BridgeHealth | null;
export declare function getSummary(): VerificationSummary;
export declare function getSnapshot(): VerificationSnapshot;
export declare function subscribeToVerification(listener: ChangeListener): () => void;
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
export declare function waitForTransition(event: string, timeoutMs?: number): Promise<TransitionTrace | null>;
/**
 * Bind the EventBus so automation can send events.
 * Call this during app initialization.
 */
export declare function bindEventBus(eventBus: {
    emit: (type: string, payload?: Record<string, unknown>) => void;
}): void;
/**
 * Bind a trait state getter so automation can query current states.
 */
export declare function bindTraitStateGetter(getter: (traitName: string) => string | undefined): void;
export declare function clearVerification(): void;
export {};
