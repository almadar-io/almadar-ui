/**
 * TraitStateViewer Component
 *
 * Displays a state machine visualization for a trait / behavior.
 * Three variants for different complexity levels:
 * - `linear`  — simple step progression (ages 5-8)
 * - `compact` — current state + available actions (ages 9-12)
 * - `full`    — all states, transitions, guards (ages 13+)
 *
 * @packageDocumentation
 */
import React from 'react';
import { type StateStyle } from '../../atoms/game/StateIndicator';
export interface TraitTransition {
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}
export interface TraitStateMachineDefinition {
    name: string;
    states: string[];
    currentState: string;
    transitions: TraitTransition[];
    description?: string;
}
export interface TraitStateViewerProps {
    /** The trait / state machine to visualize */
    trait: TraitStateMachineDefinition;
    /** Display variant */
    variant?: 'linear' | 'compact' | 'full';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show transition labels */
    showTransitions?: boolean;
    /** Click handler for states */
    onStateClick?: (state: string) => void;
    /** Custom state styles passed to StateIndicator */
    stateStyles?: Record<string, StateStyle>;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
export declare function TraitStateViewer({ trait, variant, size, showTransitions, onStateClick, stateStyles, className, }: TraitStateViewerProps): React.JSX.Element;
export declare namespace TraitStateViewer {
    var displayName: string;
}
export default TraitStateViewer;
