/**
 * JazariStateMachine — Al-Jazari themed state machine diagram.
 *
 * Thin wrapper around StateMachineView that:
 * 1. Extracts a state machine from an orbital schema (or accepts a trait directly)
 * 2. Converts it to DomLayoutData via the visualizer lib
 * 3. Applies Al-Jazari brass/gold/lapis color theme
 * 4. Renders gear-shaped state nodes via the renderStateNode prop
 */
import React from 'react';
import type { EntityDisplayProps } from './types';
interface SmState {
    name: string;
    isInitial?: boolean;
    isTerminal?: boolean;
    isFinal?: boolean;
}
interface SmTransition {
    from: string;
    to: string;
    event: string;
    guard?: unknown;
    effects?: unknown[];
}
interface SmStateMachine {
    states: SmState[];
    transitions: SmTransition[];
}
interface SmTrait {
    name: string;
    stateMachine?: SmStateMachine;
    linkedEntity?: string;
}
interface SmEntity {
    name: string;
    fields?: Array<{
        name: string;
    }>;
}
interface SmOrbital {
    entity?: SmEntity;
    traits?: SmTrait[];
}
interface SmSchema {
    orbitals?: SmOrbital[];
}
export interface JazariStateMachineProps extends EntityDisplayProps {
    /** Full schema — extracts first trait's state machine */
    schema?: SmSchema;
    /** Or pass a single trait directly */
    trait?: SmTrait;
    /** Which trait to visualize (default: 0) */
    traitIndex?: number;
    /** Override entity field labels */
    entityFields?: string[];
    /** Text direction (default: 'ltr') */
    direction?: 'ltr' | 'rtl';
}
export declare const JazariStateMachine: React.FC<JazariStateMachineProps>;
export {};
