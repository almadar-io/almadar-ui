/**
 * SlotsContext - React state-based UI slot management
 *
 * Replaces the UIEnvironment observable store with plain React state.
 * No stacking logic, no priority system, no source tracking for arbitration.
 *
 * A transition's effects produce the COMPLETE content for each slot.
 * The runtime collects all render-ui effects from a transition, groups by slot,
 * and sets each slot's patterns array in one atomic operation.
 *
 * @packageDocumentation
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PatternConfig } from '@almadar/core';
import type { ResolvedTrait } from '@almadar/core';

// ============================================================================
// Types
// ============================================================================

/** A single pattern entry in a slot */
export interface SlotPatternEntry {
    pattern: PatternConfig;
    props: Record<string, unknown>;
}

/**
 * Source metadata for a rendered slot.
 * Used by the Slot Inspector to show debug info.
 */
export interface SlotSource {
    trait: string;
    state: string;
    transition: string;
    effects?: unknown[];
    /** Full trait definition for inspector */
    traitDefinition?: ResolvedTrait;
}

/** Full state of a single slot */
export interface SlotState {
    patterns: SlotPatternEntry[];
    source?: SlotSource;
}

/** All slots state */
export type SlotsState = Record<string, SlotState>;

/** Mutation functions for slots (stable references, won't trigger re-renders) */
export interface SlotsActions {
    /** Set all patterns for a slot atomically (replaces previous content) */
    setSlotPatterns: (slot: string, patterns: SlotPatternEntry[], source?: SlotSource) => void;
    /** Clear a single slot */
    clearSlot: (slot: string) => void;
    /** Clear all slots */
    clearAllSlots: () => void;
}

// ============================================================================
// Context
// ============================================================================

const SlotsStateContext = createContext<SlotsState>({});
const SlotsActionsContext = createContext<SlotsActions | null>(null);

// ============================================================================
// Provider
// ============================================================================

export interface SlotsProviderProps {
    children: React.ReactNode;
}

/**
 * SlotsProvider - Manages UI slot state via React useState.
 *
 * Replaces UIEnvironmentProvider. No observable store, no stacking logic.
 * Slots are set atomically per transition — React diffs and re-renders.
 */
export function SlotsProvider({ children }: SlotsProviderProps): React.ReactElement {
    const [slots, setSlots] = useState<SlotsState>({});

    const setSlotPatterns = useCallback((slot: string, patterns: SlotPatternEntry[], source?: SlotSource) => {
        setSlots(prev => ({
            ...prev,
            [slot]: { patterns, source },
        }));
    }, []);

    const clearSlot = useCallback((slot: string) => {
        setSlots(prev => {
            // Keep the key with an empty `patterns` array rather than delete it.
            // `SlotBridge` iterates `Object.entries(slots)` and dispatches
            // `uiSlots.clear(slotName)` when `patterns.length === 0`. Deleting
            // the key skipped that branch entirely, so a `(render-ui modal
            // null)` CLOSE transition updated SlotsStateContext but never
            // propagated into UISlotContext — the modal DOM kept its stale
            // content across open→closed. VG1's portal probe caught this as
            // "expected to be cleared but has N child(ren)". The empty-array
            // shape matches the already-cleared slot from `setSlotPatterns`
            // with `patterns=[]`, so bridge + renderer handle both branches
            // uniformly.
            const existing = prev[slot];
            if (existing && existing.patterns.length === 0 && !existing.source) {
                return prev;
            }
            return { ...prev, [slot]: { patterns: [] } };
        });
    }, []);

    const clearAllSlots = useCallback(() => {
        setSlots({});
    }, []);

    // Stable actions ref — mutations don't cause re-renders of action consumers
    const actionsRef = useRef<SlotsActions>({ setSlotPatterns, clearSlot, clearAllSlots });
    actionsRef.current = { setSlotPatterns, clearSlot, clearAllSlots };

    // Stable actions object that delegates to ref
    const [stableActions] = useState<SlotsActions>(() => ({
        setSlotPatterns: (...args) => actionsRef.current.setSlotPatterns(...args),
        clearSlot: (...args) => actionsRef.current.clearSlot(...args),
        clearAllSlots: () => actionsRef.current.clearAllSlots(),
    }));

    return (
        <SlotsActionsContext.Provider value={stableActions}>
            <SlotsStateContext.Provider value={slots}>
                {children}
            </SlotsStateContext.Provider>
        </SlotsActionsContext.Provider>
    );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Get the full slots state. Triggers re-render on ANY slot change.
 * Prefer useSlotContent(name) for individual slot subscriptions.
 */
export function useSlots(): SlotsState {
    return useContext(SlotsStateContext);
}

/**
 * Get content for a specific slot. Returns null if slot is empty.
 */
export function useSlotContent(slotName: string): SlotState | null {
    const slots = useContext(SlotsStateContext);
    return slots[slotName] || null;
}

/**
 * Get slot mutation actions. Stable reference — never triggers re-renders.
 */
export function useSlotsActions(): SlotsActions {
    const actions = useContext(SlotsActionsContext);
    if (!actions) {
        throw new Error('useSlotsActions must be used within a SlotsProvider');
    }
    return actions;
}
