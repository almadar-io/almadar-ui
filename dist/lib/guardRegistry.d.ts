/**
 * Guard Registry - Tracks guard evaluations for debugging
 *
 * @packageDocumentation
 */
export interface GuardContext {
    traitName?: string;
    type?: "transition" | "tick";
    transitionFrom?: string;
    transitionTo?: string;
    tickName?: string;
    [key: string]: unknown;
}
export interface GuardEvaluation {
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
type ChangeListener = () => void;
export declare function recordGuardEvaluation(evaluation: Omit<GuardEvaluation, "id" | "timestamp">): void;
export declare function getGuardHistory(): GuardEvaluation[];
export declare function getRecentGuardEvaluations(count: number): GuardEvaluation[];
export declare function getGuardEvaluationsForTrait(traitName: string): GuardEvaluation[];
export declare function subscribeToGuardChanges(listener: ChangeListener): () => void;
export declare function clearGuardHistory(): void;
export {};
