/**
 * SlotsContext - React state-based UI slot management
 *
 * Replaces the UIEnvironment observable store with plain React state.
 * No stacking logic, no priority system.
 *
 * A transition's effects produce the COMPLETE content for each slot
 * from the POV of the trait that fired. The runtime collects all render-ui
 * effects from a transition, groups by slot, and calls
 * `setSlotPatterns(slot, patterns, source)` once per slot.
 *
 * Multi-trait parity with the compiled path (2026-04-24):
 * State is keyed by (slot, sourceTraitName). When ProbeCreate renders to
 * "main" and ProbePersistor also renders to "main", both entries coexist —
 * each source owns its own sub-entry. Consumers see them as a list in
 * insertion order. Prior model was single-entry per slot (last-writer-wins),
 * which diverged from the compiled path's VStack-of-trait-views layout.
 *
 * @packageDocumentation
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PatternConfig, EventSource, ResolvedTrait } from '@almadar/core';
import { createLogger } from '../../lib/logger';

// `almadar:ui:slot-render` — observability for the runtime-path slot
// rendering chain. Used to investigate why Form fields revert mid-edit
// in the runtime path but not in the compiled path: traces every
// setSlotPatterns / clearSlot / SlotContentRenderer render so we can
// see whether the modal slot is being re-pushed (and Form remounted)
// during a typing session.
const slotLog = createLogger('almadar:ui:slot-render');

// Gap #11 (Almadar_Std_Verification.md): cross-orbital cascade tracing
// at the slot mutation boundary. Logs every per-source slot write/clear
// at info level so the runtime-verify capture shows when traits from a
// different orbital mutate the same slot during one dispatch (e.g. modal
// stacking ContactCreate's form on top of DealCreate's during a /deals
// walk). Pairs with the `almadar:runtime:cross-orbital` channel in
// OrbPreview / ServerBridge / OrbitalServerRuntime.
const xOrbitalLog = createLogger('almadar:runtime:cross-orbital');

// Assign stable per-object ids so the log can compare entity references
// across renders. WeakMap so we don't pin the underlying row objects.
const refIds = new WeakMap<object, number>();
let nextRefId = 1;
export function refId(obj: unknown): number | null {
    if (obj === null || obj === undefined || typeof obj !== 'object') return null;
    const existing = refIds.get(obj as object);
    if (existing !== undefined) return existing;
    const id = nextRefId++;
    refIds.set(obj as object, id);
    return id;
}

export { slotLog };

// ============================================================================
// Types
// ============================================================================

/** A single pattern entry in a slot */
export interface SlotPatternEntry {
    pattern: PatternConfig;
    props: Record<string, unknown>;
}

/**
 * Source metadata for a rendered slot. Extends `@almadar/core`'s
 * `EventSource` (which owns the `{ trait, transition?, tick? }` shape
 * shared with the event bus) with UI-only debug fields used by the Slot
 * Inspector. Keeping the core subset aligned means the slot machinery
 * can round-trip with event bus metadata without re-coercion.
 */
export interface SlotSource extends EventSource {
    /** Source trait's current state at the moment of render. */
    state: string;
    /** Raw effects block that produced this render, for inspector display. */
    effects?: unknown[];
    /** Full trait definition for inspector */
    traitDefinition?: ResolvedTrait;
}

/**
 * One source's contribution to a slot. The same slot can receive
 * contributions from multiple source traits (e.g. a page-level layout
 * where ProbeCreate and ProbePersistor both render to "main").
 */
export interface SlotEntry {
    patterns: SlotPatternEntry[];
    source?: SlotSource;
}

/**
 * All source contributions to a single slot, keyed by the source trait's
 * name. The sentinel `'__default__'` key is used when `setSlotPatterns`
 * is called without a source (legacy / unscoped callers).
 *
 * Iteration order reflects insertion order — the first trait to write to
 * the slot renders first, which matches the compiled-path VStack order
 * set by the .lolo's `page ... -> Trait1, Trait2, ...` declaration.
 */
export type SlotState = Record<string, SlotEntry>;

/** All slots state */
export type SlotsState = Record<string, SlotState>;

/** Mutation functions for slots (stable references, won't trigger re-renders) */
export interface SlotsActions {
    /**
     * Set this source's contribution to a slot atomically. Replaces any
     * prior content FROM THE SAME SOURCE only; other sources' entries in
     * the slot are untouched.
     */
    setSlotPatterns: (slot: string, patterns: SlotPatternEntry[], source?: SlotSource) => void;
    /**
     * Clear a slot entirely. Wipes all source entries; consumers see an
     * empty slot (no patterns from any source).
     */
    clearSlot: (slot: string) => void;
    /** Remove a single source's contribution from a slot, keeping others. */
    clearSlotForSource: (slot: string, sourceTrait: string) => void;
    /** Clear all slots */
    clearAllSlots: () => void;
}

const DEFAULT_SOURCE_KEY = '__default__';

/** Entries in render order for a slot (insertion order, empty-filtered). */
export function slotEntriesInOrder(slot: SlotState | null | undefined): Array<{ sourceKey: string; entry: SlotEntry }> {
    if (!slot) return [];
    const out: Array<{ sourceKey: string; entry: SlotEntry }> = [];
    for (const [sourceKey, entry] of Object.entries(slot)) {
        if (entry.patterns.length > 0) {
            out.push({ sourceKey, entry });
        }
    }
    return out;
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
 * Slots are set atomically per (transition, source) — React diffs and re-renders.
 */
export function SlotsProvider({ children }: SlotsProviderProps): React.ReactElement {
    const [slots, setSlots] = useState<SlotsState>({});

    const setSlotPatterns = useCallback((slot: string, patterns: SlotPatternEntry[], source?: SlotSource) => {
        const sourceKey = source?.trait ?? DEFAULT_SOURCE_KEY;
        // Log the entity ref id for the first pattern carrying an
        // `entity` prop. If the same logical row gets pushed with a
        // different ref id every time, that's the form-reset bug
        // smoking gun.
        const entityProp = patterns[0]?.pattern && typeof patterns[0].pattern === 'object'
            ? (patterns[0].pattern as { entity?: unknown }).entity
            : undefined;
        const firstPatternType = patterns[0]?.pattern && typeof patterns[0].pattern === 'object'
            ? ((patterns[0].pattern as { type?: unknown }).type as string | undefined)
            : undefined;
        slotLog.debug('setSlotPatterns', {
            slot,
            sourceKey,
            patternCount: patterns.length,
            firstPatternType,
            entityRefId: refId(entityProp),
        });
        if (source?.trait) {
            xOrbitalLog.info('slot-set', {
                slot,
                sourceTrait: source.trait,
                patternCount: patterns.length,
                firstPatternType,
                state: source.state,
            });
        }
        setSlots(prev => {
            const prevSlot = prev[slot] ?? {};
            return {
                ...prev,
                [slot]: {
                    ...prevSlot,
                    [sourceKey]: { patterns, source },
                },
            };
        });
    }, []);

    const clearSlot = useCallback((slot: string) => {
        setSlots(prev => {
            const existing = prev[slot];
            // Keep the key with an empty object rather than delete it.
            // `SlotBridge` iterates `Object.entries(slots)` and dispatches
            // `uiSlots.clear(slotName)` when the aggregated patterns list is
            // empty. Deleting the key skipped that branch entirely, so a
            // `(render-ui modal null)` CLOSE transition updated
            // SlotsStateContext but never propagated into UISlotContext —
            // the modal DOM kept its stale content across open→closed.
            if (existing && Object.keys(existing).length === 0) {
                return prev;
            }
            return { ...prev, [slot]: {} };
        });
    }, []);

    const clearSlotForSource = useCallback((slot: string, sourceTrait: string) => {
        xOrbitalLog.info('slot-clear-source', { slot, sourceTrait });
        setSlots(prev => {
            const existing = prev[slot];
            if (!existing || !(sourceTrait in existing)) return prev;
            const next = { ...existing };
            delete next[sourceTrait];
            return { ...prev, [slot]: next };
        });
    }, []);

    const clearAllSlots = useCallback(() => {
        setSlots({});
    }, []);

    // Stable actions ref — mutations don't cause re-renders of action consumers
    const actionsRef = useRef<SlotsActions>({
        setSlotPatterns,
        clearSlot,
        clearSlotForSource,
        clearAllSlots,
    });
    actionsRef.current = { setSlotPatterns, clearSlot, clearSlotForSource, clearAllSlots };

    // Stable actions object that delegates to ref
    const [stableActions] = useState<SlotsActions>(() => ({
        setSlotPatterns: (...args) => actionsRef.current.setSlotPatterns(...args),
        clearSlot: (...args) => actionsRef.current.clearSlot(...args),
        clearSlotForSource: (...args) => actionsRef.current.clearSlotForSource(...args),
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
 * Get the per-source state map for a specific slot. Returns null if
 * nothing has written to this slot yet. To iterate sources in render
 * order, use `slotEntriesInOrder(useSlotContent(name))`.
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
