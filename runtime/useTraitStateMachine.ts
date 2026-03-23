/**
 * useTraitStateMachine Hook
 *
 * Manages trait state machines with event-driven transitions.
 * Subscribes to eventBus events and executes effects when transitions occur.
 *
 * CONSOLIDATED RUNTIME:
 * - Uses StateMachineManager from @almadar/runtime for state management
 * - Uses the same state machine logic as the server runtime (OrbitalServerRuntime)
 * - Ensures consistent behavior between client preview and server execution
 *
 * SLOT MANAGEMENT:
 * - Collects all render-ui effects from a transition, groups by slot
 * - Sets each slot's patterns array atomically via SlotsActions
 * - No stacking logic, no priority system — transition produces complete slot content
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
// Use hooks from @almadar/ui
import { useEventBus } from '../hooks';
import { useFetchedDataContext } from '../providers';
import { isCircuitEvent } from '@almadar/core';
import type { PatternConfig, ResolvedTraitTick } from '@almadar/core';
import {
    StateMachineManager,
    EffectExecutor,
    interpolateValue,
    createContextFromBindings,
    type TraitState,
    type TraitDefinition,
    type EffectHandlers,
    type BindingContext,
    type EffectContext,
} from '@almadar/runtime';
import { isEntityAwarePattern } from '@almadar/patterns';
import { createClientEffectHandlers } from './createClientEffectHandlers';
import type { ResolvedTraitBinding } from './types';
import type { SlotsActions, SlotPatternEntry, SlotSource } from './ui/SlotsContext';
import { useEntitySchema } from './EntitySchemaContext';
import {
    registerTrait,
    unregisterTrait,
    updateTraitState,
    type TraitDebugInfo,
} from '../lib/traitRegistry';
import { recordTransition, type EffectTrace } from '../lib/verificationRegistry';

// ============================================================================
// Types
// ============================================================================

export type { TraitState };

export interface TraitStateMachineResult {
    /** Current state for each trait */
    traitStates: Map<string, TraitState>;
    /** Send an event to trigger a transition */
    sendEvent: (eventKey: string, payload?: Record<string, unknown>) => void;
    /** Get current state for a specific trait */
    getTraitState: (traitName: string) => TraitState | undefined;
    /** Check if a trait can handle an event from its current state */
    canHandleEvent: (traitName: string, eventKey: string) => boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert ResolvedTraitBinding to TraitDefinition for StateMachineManager
 */
function toTraitDefinition(binding: ResolvedTraitBinding): TraitDefinition {
    return {
        name: binding.trait.name,
        states: binding.trait.states,
        transitions: binding.trait.transitions,
        listens: binding.trait.listens,
    };
}

/**
 * Normalize event key - strip UI: prefix if present
 */
function normalizeEventKey(eventKey: string): string {
    return eventKey.startsWith('UI:') ? eventKey.slice(3) : eventKey;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export interface UseTraitStateMachineOptions {
    /** Callback invoked after each event is processed (for server forwarding) */
    onEventProcessed?: (eventKey: string, payload?: Record<string, unknown>) => void;
    /** Router navigate function for navigate effects */
    navigate?: (path: string, params?: Record<string, unknown>) => void;
    /** Notification function for notify effects */
    notify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * useTraitStateMachine - Manages state machines for multiple traits
 *
 * Uses the shared StateMachineManager for consistent behavior with server runtime.
 * Collects render-ui effects per transition and sets slot content atomically.
 */
export function useTraitStateMachine(
    traitBindings: ResolvedTraitBinding[],
    slotsActions: SlotsActions,
    options?: UseTraitStateMachineOptions
): TraitStateMachineResult {
    const eventBus = useEventBus();
    const { entities } = useEntitySchema();
    const fetchedDataContext = useFetchedDataContext();

    // Create StateMachineManager - shared with server runtime
    const manager = useMemo(() => {
        const traitDefs = traitBindings.map(toTraitDefinition);
        return new StateMachineManager(traitDefs);
    }, [traitBindings]);

    // Track state for React re-renders
    const [traitStates, setTraitStates] = useState<Map<string, TraitState>>(() => {
        return manager.getAllStates();
    });

    // Actor model queue: events are enqueued and drained one at a time,
    // awaiting all effects before processing the next event.
    const eventQueueRef = useRef<Array<{ eventKey: string; payload?: Record<string, unknown> }>>([]);
    const processingRef = useRef(false);

    // Keep refs for callbacks to avoid stale closures
    const traitBindingsRef = useRef(traitBindings);
    const managerRef = useRef(manager);
    const slotsActionsRef = useRef(slotsActions);
    const optionsRef = useRef(options);

    useEffect(() => {
        traitBindingsRef.current = traitBindings;
    }, [traitBindings]);

    useEffect(() => {
        managerRef.current = manager;
        setTraitStates(manager.getAllStates());
    }, [manager]);

    useEffect(() => {
        slotsActionsRef.current = slotsActions;
    }, [slotsActions]);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Refs for tick loop callbacks — read current values without causing re-renders.
    // Mirror of traitStates and fetchedDataContext kept in sync on every render so
    // that RAF/interval callbacks always see the latest values without needing to
    // be recreated (mirrors the _tickStateRef/_tickEntityRef pattern in the compiled shell).
    const traitStatesRef = useRef<Map<string, TraitState>>(traitStates);
    const fetchedDataContextRef = useRef(fetchedDataContext);

    useEffect(() => { traitStatesRef.current = traitStates; }, [traitStates]);
    useEffect(() => { fetchedDataContextRef.current = fetchedDataContext; }, [fetchedDataContext]);


    // Register traits with debug registry and clean up on unmount/rebind
    useEffect(() => {
        const mgr = managerRef.current;
        const bindings = traitBindingsRef.current;
        const ids: string[] = [];

        for (const binding of bindings) {
            const trait = binding.trait;
            const state = mgr.getState(trait.name);
            const info: TraitDebugInfo = {
                id: trait.name,
                name: trait.name,
                currentState: state?.currentState ?? trait.states[0]?.name ?? 'unknown',
                states: trait.states.map((s: { name: string }) => s.name),
                transitions: trait.transitions.flatMap((t) => {
                    const froms = Array.isArray(t.from) ? t.from : [t.from];
                    return froms.map((f) => ({
                        from: f,
                        to: t.to,
                        event: t.event,
                        guard: t.guard ? String(t.guard) : undefined,
                    }));
                }),
                guards: trait.transitions
                    .filter((t) => t.guard)
                    .map((t) => ({ name: String(t.guard) })),
                transitionCount: 0,
            };
            registerTrait(info);
            ids.push(trait.name);
        }

        return () => {
            for (const id of ids) {
                unregisterTrait(id);
            }
        };
    }, [traitBindings]);

    // Reinitialize when trait bindings change (e.g., page navigation)
    useEffect(() => {
        const newManager = managerRef.current;
        newManager.resetAll();
        setTraitStates(newManager.getAllStates());

        console.log('[TraitStateMachine] Reset states for page navigation:',
            Array.from(newManager.getAllStates().keys()).join(', '));
    }, [traitBindings]);

    /**
     * Execute a single tick's effects synchronously.
     *
     * Mirrors the compiled shell output (orbital-shell-typescript/src/backend.rs lines 5353-5516):
     * - `set` effects mutate a local entity copy, then batch-persist to FetchedDataContext
     * - `render-ui` effects resolve bindings and flush slots
     * - No EffectExecutor (async) — ticks must be synchronous to work inside RAF
     * - `@payload` is empty (invalid in tick context per the Rust validator)
     */
    const runTickEffects = useCallback((tick: ResolvedTraitTick, binding: ResolvedTraitBinding) => {
        const fdc = fetchedDataContextRef.current;
        const actions = slotsActionsRef.current;
        const linkedEntity = binding.linkedEntity ?? '';
        const currentState = traitStatesRef.current.get(binding.trait.name)?.currentState ?? '';

        // appliesTo: empty array means fire in all states (same as Rust OirTick default)
        if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return;

        // Build entity data — same shape as processEvent
        const records = linkedEntity && fdc ? fdc.getData(linkedEntity) : [];
        const entityData: Record<string, unknown> = records.length > 0
            ? Object.assign([...(records as unknown[])], records[0] as Record<string, unknown>) as unknown as Record<string, unknown>
            : {};

        const bindingCtx: BindingContext = { entity: entityData, payload: {}, state: currentState };
        const evalCtx = createContextFromBindings(bindingCtx);

        // Guard: use interpolateValue to evaluate the s-expression (returns truthy/falsy)
        if (tick.guard !== undefined) {
            const passed = interpolateValue(tick.guard, evalCtx);
            if (!passed) return;
        }

        // Process effects synchronously — set effects first so render-ui sees updated values
        const entityMutations = new Map<string, unknown>();
        const pendingSlots = new Map<string, Array<{ pattern: PatternConfig; props: Record<string, unknown> }>>();

        const slotSource: SlotSource = {
            trait: binding.trait.name,
            state: currentState,
            transition: `${currentState}->tick:${tick.name}`,
            effects: tick.effects,
            traitDefinition: binding.trait,
        };

        // Helper: enrich entity-aware pattern nodes (same logic as processEvent's enrichNode)
        const enrichTickNode = (node: unknown): unknown => {
            if (!node || typeof node !== 'object') return node;
            const rec = node as Record<string, unknown>;
            const nodeType = rec.type as string | undefined;

            let enriched = rec;
            if (Array.isArray(rec.children)) {
                enriched = { ...rec, children: (rec.children as unknown[]).map(enrichTickNode) };
            }

            if (nodeType && isEntityAwarePattern(nodeType) && fdc) {
                let injected = false;
                if (typeof enriched.entity === 'string') {
                    const entityRecords = fdc.getData(enriched.entity as string);
                    if (entityRecords.length > 0) { enriched = { ...enriched, entity: entityRecords }; injected = true; }
                } else if (!enriched.entity && linkedEntity) {
                    const entityRecords = fdc.getData(linkedEntity);
                    if (entityRecords.length > 0) { enriched = { ...enriched, entity: entityRecords }; injected = true; }
                }
                if (injected && !enriched.fields && !enriched.columns) {
                    const sample = (enriched.entity as unknown[])[0];
                    if (sample && typeof sample === 'object') {
                        const keys = Object.keys(sample as Record<string, unknown>).filter(k => k !== 'id' && k !== '_id');
                        enriched = { ...enriched, fields: keys.map((k, i) => ({ name: k, variant: i === 0 ? 'h4' : 'body' })), children: undefined };
                    }
                }
            }
            return enriched;
        };

        for (const effect of tick.effects) {
            if (!Array.isArray(effect)) continue;
            const op = effect[0] as string;

            if (op === 'set') {
                const path = effect[1];
                if (typeof path !== 'string' || !path.startsWith('@entity.')) continue;
                const field = path.slice('@entity.'.length);
                // Re-create evalCtx after each mutation so chained sets see updated values
                const updatedCtx = createContextFromBindings(bindingCtx);
                const value = interpolateValue(effect[2] as unknown, updatedCtx);
                (bindingCtx.entity as Record<string, unknown>)[field] = value;
                entityMutations.set(field, value);

            } else if (op === 'render-ui' || op === 'render') {
                const slot = effect[1] as string;
                const rawPattern = effect[2];
                if (rawPattern === null || rawPattern === undefined) {
                    pendingSlots.set(slot, []);
                    continue;
                }
                // Resolve bindings (same as EffectExecutor.resolveArgs for render-ui args)
                const updatedCtx = createContextFromBindings(bindingCtx);
                const resolved = interpolateValue(rawPattern, updatedCtx);
                const enriched = enrichTickNode(resolved);
                const existing = pendingSlots.get(slot) ?? [];
                existing.push({ pattern: enriched as PatternConfig, props: {} });
                pendingSlots.set(slot, existing);
            }
        }

        // Flush slots atomically
        for (const [slot, patterns] of pendingSlots) {
            if (patterns.length === 0) {
                actions.clearSlot(slot);
            } else {
                actions.setSlotPatterns(slot, patterns, slotSource);
            }
        }

        // Batch-persist entity mutations (single setData call like compiled shell's dispatchReducer TICK)
        if (linkedEntity && entityMutations.size > 0 && fdc) {
            const latestRecords = fdc.getData(linkedEntity);
            if (latestRecords.length > 0) {
                const updated = (latestRecords as Record<string, unknown>[]).map((r, i) =>
                    i === 0 ? { ...r, ...Object.fromEntries(entityMutations) } : r
                );
                fdc.setData({ [linkedEntity]: updated as unknown[] });
            }
        }
    }, []);

    /**
     * RAF loop for frame-interval ticks (interval: "frame").
     * Reads traitBindingsRef.current every frame so it never needs to restart
     * when bindings change — mirrors the generated shell's requestAnimationFrame pattern.
     */
    useEffect(() => {
        // Check if any binding has frame ticks before starting the loop
        const hasFrameTicks = traitBindingsRef.current.some(b =>
            b.trait.ticks?.some(t => t.interval === 'frame')
        );
        if (!hasFrameTicks) return;

        let running = true;
        let rafId = 0;

        const frame = () => {
            if (!running) return;
            for (const binding of traitBindingsRef.current) {
                for (const tick of binding.trait.ticks ?? []) {
                    if (tick.interval !== 'frame') continue;
                    runTickEffects(tick, binding);
                }
            }
            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);
        return () => {
            running = false;
            cancelAnimationFrame(rafId);
        };
    // Re-run when bindings change (new behaviors may add/remove frame ticks)
    }, [traitBindings, runTickEffects]);

    /**
     * Interval loops for time-based ticks (interval: number ms).
     * One setInterval per tick. Re-created when bindings change.
     */
    useEffect(() => {
        const intervals: ReturnType<typeof setInterval>[] = [];

        for (const binding of traitBindings) {
            for (const tick of binding.trait.ticks ?? []) {
                if (tick.interval === 'frame') continue;
                const ms = tick.interval as number;
                intervals.push(setInterval(() => {
                    runTickEffects(tick, binding);
                }, ms));
            }
        }

        return () => {
            for (const id of intervals) clearInterval(id);
        };
    }, [traitBindings, runTickEffects]);

    /**
     * Process a single event through the state machine and AWAIT all effects.
     *
     * This is the core of the actor model: one event is fully processed (including
     * all async effects like fetch, persist, emit) before the next event is dequeued.
     * This guarantees that emitted events (which get enqueued) only run after the
     * current transition's effects have completed and entity mutations are persisted.
     */
    const processEventQueued = useCallback(async (
        eventKey: string,
        payload?: Record<string, unknown>
    ): Promise<void> => {
        const normalizedEvent = normalizeEventKey(eventKey);
        const bindings = traitBindingsRef.current;
        const currentManager = managerRef.current;
        const actions = slotsActionsRef.current;

        console.log('[TraitStateMachine] Processing event:', normalizedEvent, 'payload:', payload);

        // Find the binding that matches each trait for linkedEntity info
        const bindingMap = new Map(bindings.map(b => [b.trait.name, b]));

        // Send event through StateMachineManager (shared runtime)
        const results = currentManager.sendEvent(normalizedEvent, payload);

        // Execute effects for each transition that occurred
        for (const { traitName, result } of results) {
            const binding = bindingMap.get(traitName);
            const traitState = currentManager.getState(traitName);

            if (!binding || !traitState) continue;

            if (result.executed && result.effects.length > 0) {
                console.log(
                    '[TraitStateMachine] Executing',
                    result.effects.length,
                    'effects for',
                    traitName,
                    '| linkedEntity:',
                    binding.linkedEntity,
                    '| transition:',
                    `${result.previousState} -> ${result.newState}`,
                    '| effects:',
                    JSON.stringify(result.effects),
                );

                // Get entity data for context from FetchedDataContext (server data)
                const linkedEntity = binding.linkedEntity || '';
                const entityId = payload?.entityId as string | undefined;
                const entityData = (() => {
                    if (!linkedEntity || !fetchedDataContext) return payload || {};
                    if (entityId) {
                        return (fetchedDataContext.getById(linkedEntity, entityId) as Record<string, unknown>) || {};
                    }
                    // No entityId: expose the full records array so @entity resolves to all
                    // records (for list patterns like `items: "@entity"`), while also
                    // spreading first-record fields onto the array so @entity.field access
                    // (e.g. @entity.dialogue, @entity.cacheHits) still works correctly.
                    const records = fetchedDataContext.getData(linkedEntity);
                    if (records.length === 0) return payload || {};
                    const firstRecord = records[0] as Record<string, unknown>;
                    return Object.assign([...records], firstRecord) as unknown as Record<string, unknown>;
                })();

                // Accumulator for render-ui effects -- grouped by slot
                const pendingSlots = new Map<string, SlotPatternEntry[]>();
                const slotSource: SlotSource = {
                    trait: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    effects: result.effects,
                    traitDefinition: binding.trait,
                };

                // Build handlers using factory from @almadar/runtime
                const handlers = createClientEffectHandlers({
                    eventBus,
                    slotSetter: {
                        addPattern: (slot, pattern, props) => {
                            const existing = pendingSlots.get(slot) || [];
                            existing.push({ pattern: pattern as PatternConfig, props: props || {} });
                            pendingSlots.set(slot, existing);
                        },
                        clearSlot: (slot) => {
                            pendingSlots.set(slot, []);
                        },
                    },
                    navigate: optionsRef.current?.navigate,
                    notify: optionsRef.current?.notify,
                    enrichPattern: (pattern) => {
                        const enrichNode = (node: unknown): unknown => {
                            if (!node || typeof node !== 'object') return node;
                            const rec = node as Record<string, unknown>;
                            const nodeType = rec.type as string | undefined;

                            // Recursively enrich children first
                            let enriched = rec;
                            if (Array.isArray(rec.children)) {
                                const enrichedChildren = (rec.children as unknown[]).map(enrichNode);
                                enriched = { ...rec, children: enrichedChildren };
                            }

                            // Enrich this node if it's entity-aware
                            if (nodeType && isEntityAwarePattern(nodeType) && fetchedDataContext) {
                                let injected = false;
                                if (typeof enriched.entity === 'string') {
                                    const records = fetchedDataContext.getData(enriched.entity as string);
                                    if (records.length > 0) {
                                        enriched = { ...enriched, entity: records };
                                        injected = true;
                                    }
                                } else if (!enriched.entity && linkedEntity) {
                                    const records = fetchedDataContext.getData(linkedEntity);
                                    if (records.length > 0) {
                                        enriched = { ...enriched, entity: records };
                                        injected = true;
                                    }
                                }

                                // Auto-generate fields for data-iterating patterns when
                                // entity data was injected but no fields/columns are defined.
                                // Schema children are pattern configs (not render functions),
                                // so DataList can't use them; fields-based rendering works.
                                if (injected && !enriched.fields && !enriched.columns) {
                                    const sample = (enriched.entity as unknown[])[0];
                                    if (sample && typeof sample === 'object') {
                                        const keys = Object.keys(sample as Record<string, unknown>)
                                            .filter(k => k !== 'id' && k !== '_id');
                                        enriched = {
                                            ...enriched,
                                            fields: keys.map((k, i) => ({
                                                name: k,
                                                variant: i === 0 ? 'h4' : 'body',
                                            })),
                                            // Remove pattern-config children that components
                                            // can't render (they expect a function or nothing)
                                            children: undefined,
                                        };
                                    }
                                }
                            }

                            return enriched;
                        };
                        return enrichNode(pattern);
                    },
                });

                const bindingCtx: BindingContext = {
                    entity: entityData,
                    payload: payload || {},
                    state: result.previousState,
                };

                // Pre-process ["set", "@entity.field", value] effects.
                // createClientEffectHandlers treats "set" as server-only (no-op on client).
                // We handle it here: evaluate the value expression and mutate bindingCtx.entity
                // so subsequent render-ui effects see the updated field values.
                const entityMutations = new Map<string, unknown>();
                for (const effect of result.effects) {
                    if (!Array.isArray(effect) || effect[0] !== 'set') continue;
                    const path = effect[1];
                    if (typeof path !== 'string' || !path.startsWith('@entity.')) continue;
                    const field = path.slice('@entity.'.length);
                    const evalCtx = createContextFromBindings(bindingCtx);
                    const value = interpolateValue(effect[2] as unknown, evalCtx);
                    if (bindingCtx.entity !== null && typeof bindingCtx.entity === 'object') {
                        (bindingCtx.entity as Record<string, unknown>)[field] = value;
                    }
                    entityMutations.set(field, value);
                }

                const effectContext: EffectContext = {
                    traitName: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    linkedEntity,
                    entityId,
                };

                const executor = new EffectExecutor({ handlers, bindings: bindingCtx, context: effectContext });

                // AWAIT effects: the actor model requires all effects (fetch, persist,
                // emit) to complete before the next event is dequeued. Emitted events
                // land in eventQueueRef synchronously during executeAll (the bus is sync),
                // but they won't be processed until this await resolves and the drain
                // loop picks up the next entry.
                try {
                    await executor.executeAll(result.effects);

                    console.log(
                        '[TraitStateMachine] After executeAll, pendingSlots:',
                        Object.fromEntries(pendingSlots.entries()),
                    );

                    // Flush accumulated slot content atomically
                    for (const [slot, patterns] of pendingSlots) {
                        if (patterns.length === 0) {
                            actions.clearSlot(slot);
                        } else {
                            actions.setSlotPatterns(slot, patterns, slotSource);
                        }
                    }

                    // Persist entity mutations from ["set"] effects back to FetchedDataContext
                    // so the next render/event sees the updated field values.
                    if (linkedEntity && entityMutations.size > 0 && fetchedDataContext) {
                        const records = fetchedDataContext.getData(linkedEntity);
                        if (records.length > 0) {
                            const updated = (records as Record<string, unknown>[]).map((r, i) =>
                                i === 0 ? { ...r, ...Object.fromEntries(entityMutations) } : r
                            );
                            fetchedDataContext.setData({ [linkedEntity]: updated as unknown[] });
                        }
                    }

                    // Handle ["persist", action, entityType, data] effects client-side.
                    // The handler in createClientEffectHandlers is a no-op stub.
                    // We apply create/update/delete mutations to FetchedDataContext here
                    // so the playground and any client-only runtime sees entity changes.
                    if (fetchedDataContext) {
                        for (const effect of result.effects) {
                            if (!Array.isArray(effect) || effect[0] !== 'persist') continue;
                            const action = effect[1] as string;
                            const entityType = (effect[2] as string) || linkedEntity;
                            if (!entityType) continue;
                            const records = fetchedDataContext.getData(entityType) as Record<string, unknown>[];

                            if (action === 'create') {
                                const evalCtx = createContextFromBindings(bindingCtx);
                                const rawData = effect[3] as Record<string, unknown> | undefined;
                                const newRecord: Record<string, unknown> = { id: `${entityType}-${Date.now()}` };
                                if (rawData) {
                                    for (const [k, v] of Object.entries(rawData)) {
                                        newRecord[k] = interpolateValue(v, evalCtx);
                                    }
                                }
                                // Also include any set mutations from this transition
                                for (const [k, v] of entityMutations) {
                                    newRecord[k] = v;
                                }
                                fetchedDataContext.setData({ [entityType]: [...records, newRecord] });
                            } else if (action === 'delete') {
                                const deleteId = effect[3] as string | undefined;
                                if (deleteId) {
                                    const filtered = records.filter(r => r.id !== deleteId);
                                    fetchedDataContext.setData({ [entityType]: filtered });
                                }
                            } else if (action === 'update') {
                                const updateId = effect[3] as string | undefined;
                                const updateData = effect[4] as Record<string, unknown> | undefined;
                                if (updateId && updateData) {
                                    const evalCtx = createContextFromBindings(bindingCtx);
                                    const updated = records.map(r => {
                                        if (r.id !== updateId) return r;
                                        const patched = { ...r };
                                        for (const [k, v] of Object.entries(updateData)) {
                                            patched[k] = interpolateValue(v, evalCtx);
                                        }
                                        return patched;
                                    });
                                    fetchedDataContext.setData({ [entityType]: updated });
                                }
                            }
                        }
                    }
                } catch (error: unknown) {
                    console.error(
                        '[TraitStateMachine] Effect execution error:',
                        error,
                        '| effects:',
                        JSON.stringify(result.effects)
                    );
                }
            } else if (!result.executed) {
                // Log guard failures and missing transitions
                if (result.guardResult === false) {
                    console.log(
                        '[TraitStateMachine] Guard blocked transition:',
                        traitName,
                        result.previousState,
                        '->',
                        result.transition?.to
                    );
                } else if (!result.transition) {
                    if (isCircuitEvent(normalizedEvent)) {
                        console.warn(
                            `[CLOSED CIRCUIT VIOLATION] Trait "${traitName}" in state "${traitState.currentState}" received event "${normalizedEvent}" but has no transition to handle it.\n` +
                            `   This is likely a schema issue. To fix, add a transition:\n` +
                            `   { from: "${traitState.currentState}", to: "<target_state>", event: "${normalizedEvent}", effects: [...] }\n` +
                            `   Or ensure the previous action (that opened this UI) properly transitions back before emitting this event.`
                        );
                    } else {
                        console.log(
                            '[TraitStateMachine] No transition for',
                            traitName,
                            'from state:',
                            traitState.currentState,
                            'on event:',
                            normalizedEvent
                        );
                    }
                }
            }
        }

        // Update debug registries for each transition
        for (const { traitName, result } of results) {
            if (result.executed) {
                updateTraitState(traitName, result.newState);
                const effectTraces: EffectTrace[] = result.effects.map(
                    (e: unknown) => {
                        const eff = e as Record<string, unknown>;
                        return {
                            type: String(eff.type ?? 'unknown'),
                            args: Array.isArray(eff.args) ? eff.args : [],
                            status: 'executed' as const,
                        };
                    }
                );
                recordTransition({
                    traitName,
                    from: result.previousState,
                    to: result.newState,
                    event: normalizedEvent,
                    effects: effectTraces,
                    timestamp: Date.now(),
                });
            }
        }

        // Sync React state from manager
        if (results.length > 0) {
            setTraitStates(currentManager.getAllStates());
        }

        // Forward event to server (dual execution model)
        const onEventProcessed = optionsRef.current?.onEventProcessed;
        if (onEventProcessed) {
            onEventProcessed(normalizedEvent, payload);
        }
    }, [entities, fetchedDataContext, eventBus]);

    /**
     * Drain the event queue one entry at a time (actor model).
     *
     * While draining, any new events (e.g. from emit effects hitting the bus)
     * are appended to the queue and processed in FIFO order after the current
     * event's effects complete. The processingRef guard prevents re-entrant
     * draining: if an emit causes a synchronous bus delivery that calls
     * enqueueAndDrain, the new event is queued but drainEventQueue returns
     * immediately because processingRef is already true.
     */
    const drainEventQueue = useCallback(async () => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
            while (eventQueueRef.current.length > 0) {
                const entry = eventQueueRef.current.shift()!;
                await processEventQueued(entry.eventKey, entry.payload);
            }
        } finally {
            processingRef.current = false;
        }
    }, [processEventQueued]);

    /**
     * Enqueue an event and start draining if not already in progress.
     *
     * This replaces direct processEvent calls. Events arriving while the queue
     * is draining (e.g. from emit effects) are appended and processed in order.
     */
    const enqueueAndDrain = useCallback((eventKey: string, payload?: Record<string, unknown>) => {
        eventQueueRef.current.push({ eventKey, payload });
        void drainEventQueue();
    }, [drainEventQueue]);

    /**
     * Legacy synchronous processEvent -- delegates to the actor queue.
     * Kept for backward compatibility with any code that calls processEvent directly.
     */
    const processEvent = useCallback((
        eventKey: string,
        payload?: Record<string, unknown>
    ) => {
        enqueueAndDrain(eventKey, payload);
    }, [enqueueAndDrain]);

    /**
     * Public API to send an event
     */
    const sendEvent = useCallback((
        eventKey: string,
        payload?: Record<string, unknown>
    ) => {
        enqueueAndDrain(eventKey, payload);
    }, [enqueueAndDrain]);

    // Re-process INIT when FetchedDataContext receives server data.
    // On first INIT, entity data is empty (server hasn't responded). When the server
    // bridge stores fetched data via setData(), re-run INIT so render-ui effects
    // resolve entity bindings against the now-populated data.
    const dataSeenRef = useRef(false);
    useEffect(() => {
        console.log('[TraitStateMachine] fetchedDataContext effect fired, context:', fetchedDataContext ? 'exists' : 'null');
        if (!fetchedDataContext) return;
        const bindings = traitBindingsRef.current;
        for (const binding of bindings) {
            const entityName = binding.linkedEntity;
            if (!entityName) continue;
            const records = fetchedDataContext.getData(entityName);
            console.log('[TraitStateMachine] Data check for', entityName, ':', records.length, 'records, loading:', fetchedDataContext.loading, 'dataSeen:', dataSeenRef.current);
            if (records.length > 0 && !dataSeenRef.current) {
                dataSeenRef.current = true;
                console.log('[TraitStateMachine] FetchedDataContext received data, re-processing INIT');
                enqueueAndDrain('INIT');
                return;
            }
        }
    }, [fetchedDataContext, enqueueAndDrain]);

    /**
     * Get current state for a specific trait
     */
    const getTraitState = useCallback((traitName: string): TraitState | undefined => {
        return managerRef.current.getState(traitName);
    }, []);

    /**
     * Check if any trait can handle an event from its current state
     */
    const canHandleEvent = useCallback((traitName: string, eventKey: string): boolean => {
        const normalizedEvent = normalizeEventKey(eventKey);
        return managerRef.current.canHandleEvent(traitName, normalizedEvent);
    }, []);

    // Subscribe to eventBus events -- uses enqueueAndDrain for actor model ordering
    useEffect(() => {
        const allEvents = new Set<string>();

        for (const binding of traitBindings) {
            for (const event of binding.trait.events) {
                allEvents.add(event.key);
            }
            for (const transition of binding.trait.transitions) {
                allEvents.add(transition.event);
            }
        }

        console.log('[TraitStateMachine] Subscribing to events:', Array.from(allEvents));

        const unsubscribes: Array<() => void> = [];

        for (const eventKey of allEvents) {
            if (eventKey === 'INIT' || eventKey === 'LOAD' || eventKey === '$MOUNT') {
                continue;
            }

            const unsub = eventBus.on(`UI:${eventKey}`, (event) => {
                console.log('[TraitStateMachine] Received event:', `UI:${eventKey}`, event);
                enqueueAndDrain(eventKey, event.payload as Record<string, unknown>);
            });
            unsubscribes.push(unsub);
        }

        return () => {
            for (const unsub of unsubscribes) {
                unsub();
            }
        };
    }, [traitBindings, eventBus, enqueueAndDrain]);

    return {
        traitStates,
        sendEvent,
        getTraitState,
        canHandleEvent,
    };
}

export default useTraitStateMachine;
