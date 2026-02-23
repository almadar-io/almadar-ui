/**
 * Trait Registry - Tracks active traits and their state machines for debugging
 *
 * @packageDocumentation
 */
export interface TraitTransition {
    from: string;
    to: string;
    event: string;
    guard?: string;
}
export interface TraitGuard {
    name: string;
    lastResult?: boolean;
}
export interface TraitDebugInfo {
    id: string;
    name: string;
    currentState: string;
    states: string[];
    transitions: TraitTransition[];
    guards: TraitGuard[];
    transitionCount: number;
}
type ChangeListener = () => void;
export declare function registerTrait(info: TraitDebugInfo): void;
export declare function updateTraitState(id: string, newState: string): void;
export declare function updateGuardResult(traitId: string, guardName: string, result: boolean): void;
export declare function unregisterTrait(id: string): void;
export declare function getAllTraits(): TraitDebugInfo[];
export declare function getTrait(id: string): TraitDebugInfo | undefined;
export declare function subscribeToTraitChanges(listener: ChangeListener): () => void;
export declare function clearTraits(): void;
export {};
