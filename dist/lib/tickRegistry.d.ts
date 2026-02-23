/**
 * Tick Registry - Tracks scheduled tick executions for debugging
 *
 * @packageDocumentation
 */
export interface TickExecution {
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
type ChangeListener = () => void;
export declare function registerTick(tick: TickExecution): void;
export declare function updateTickExecution(id: string, timestamp: number): void;
export declare function setTickActive(id: string, isActive: boolean): void;
export declare function unregisterTick(id: string): void;
export declare function getAllTicks(): TickExecution[];
export declare function getTick(id: string): TickExecution | undefined;
export declare function subscribeToTickChanges(listener: ChangeListener): () => void;
export declare function clearTicks(): void;
export {};
