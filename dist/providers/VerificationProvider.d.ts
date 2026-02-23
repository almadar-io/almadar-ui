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
import React, { type ReactNode } from 'react';
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
export interface VerificationProviderProps {
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
export declare function VerificationProvider({ children, enabled, runtimeManager, traitStateGetter, }: VerificationProviderProps): React.ReactElement;
export declare namespace VerificationProvider {
    var displayName: string;
}
export {};
