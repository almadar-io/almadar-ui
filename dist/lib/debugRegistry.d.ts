/**
 * Debug Registry - Central event log for debugging
 *
 * @packageDocumentation
 */
export type DebugEventType = 'state-change' | 'event-fired' | 'effect-executed' | 'guard-evaluated' | 'error' | 'warning' | 'info';
export interface DebugEvent {
    id: string;
    type: DebugEventType;
    source: string;
    message: string;
    data?: Record<string, unknown>;
    timestamp: number;
}
type ChangeListener = () => void;
export declare function logDebugEvent(type: DebugEventType, source: string, message: string, data?: Record<string, unknown>): void;
export declare function logStateChange(source: string, from: string, to: string, event?: string): void;
export declare function logEventFired(source: string, eventName: string, payload?: unknown): void;
export declare function logEffectExecuted(source: string, effectType: string, details?: unknown): void;
export declare function logError(source: string, message: string, error?: unknown): void;
export declare function logWarning(source: string, message: string, data?: Record<string, unknown>): void;
export declare function logInfo(source: string, message: string, data?: Record<string, unknown>): void;
export declare function getDebugEvents(): DebugEvent[];
export declare function getRecentEvents(count: number): DebugEvent[];
export declare function getEventsByType(type: DebugEventType): DebugEvent[];
export declare function getEventsBySource(source: string): DebugEvent[];
export declare function subscribeToDebugEvents(listener: ChangeListener): () => void;
export declare function clearDebugEvents(): void;
export {};
