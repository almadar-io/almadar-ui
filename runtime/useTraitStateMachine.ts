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
import { createLogger } from '../lib/logger';
import { isCircuitEvent } from '@almadar/core';
import type { PatternConfig, ResolvedTraitTick, EventPayload, EntityRow, TraitConfig } from '@almadar/core';
import {
    StateMachineManager,
    EffectExecutor,
    interpolateValue,
    createContextFromBindings,
    createServerEffectHandlers,
    type TraitState,
    type TraitDefinition,
    type EffectHandlers,
    type BindingContext,
    type EffectContext,
} from '@almadar/runtime';
import { createClientEffectHandlers } from './createClientEffectHandlers';
import type { ResolvedTraitBinding, ResolvedTraitListener } from './types';
import type { SlotsActions, SlotPatternEntry, SlotSource } from './ui/SlotsContext';
import { useEntitySchema } from './EntitySchemaContext';
import {
    registerTrait,
    unregisterTrait,
    updateTraitState,
    type TraitDebugInfo,
} from '../lib/traitRegistry';
import { recordTransition, bindTraitStateGetter, registerTraitSnapshot, type EffectTrace } from '../lib/verificationRegistry';
import type { TraitStateSnapshot } from '@almadar/core';

// ============================================================================
// Types
// ============================================================================

export type { TraitState };

export interface TraitStateMachineResult {
    /** Current state for each trait */
    traitStates: Map<string, TraitState>;
    /** Send an event to trigger a transition */
    sendEvent: (eventKey: string, payload?: EventPayload) => void;
    /** Get current state for a specific trait */
    getTraitState: (traitName: string) => TraitState | undefined;
    /** Check if a trait can handle an event from its current state */
    canHandleEvent: (traitName: string, eventKey: string) => boolean;
}

const crossTraitLog = createLogger('almadar:ui:cross-trait');

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
    /**
     * Callback invoked after each event is processed (for server forwarding).
     *
     * `dispatchedOrbitals` is the set of orbital names whose traits actually
     * executed a transition for this event. The server-bridge fan-out should
     * be scoped to this set; sending the event to other orbitals fires
     * same-named transitions in unrelated orbitals and stacks their UI into
     * the wrong slot (gap #11 in `docs/Almadar_Std_Verification.md`). Empty
     * set means no local transition matched — leave the legacy fallback to
     * the consumer.
     */
    onEventProcessed?: (
        eventKey: string,
        payload?: EventPayload,
        dispatchedOrbitals?: Set<string>,
    ) => void | Promise<void>;
    /** Router navigate function for navigate effects */
    navigate?: (path: string, params?: Record<string, unknown>) => void;
    /** Notification function for notify effects */
    notify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    /**
     * Offline-preview persistence layer. When set, the client runtime merges
     * `@almadar/runtime` `createServerEffectHandlers` on top of the default
     * client handlers so `fetch` / `persist` / `set` / `ref` / `deref` /
     * `swap!` / `atomic` / `callService` run against this adapter — matching
     * what `OrbitalServerRuntime` would do on the server. Left unset in the
     * server-bridge path; effects there flow to the real server.
     */
    persistence?: import('@almadar/runtime').PersistenceAdapter;
    /** Optional consumer `call-service` hook forwarded to the mock server handlers. */
    callService?: (service: string, action: string, params: unknown) => Promise<unknown>;
    /**
     * Trait configs keyed by trait name. Threaded into setTraitConfig so
     * `@config.X` resolves inside guard expressions on the client. Page-level
     * `ResolvedTraitBinding`s often arrive without a config (the orbital-level
     * config doesn't propagate through `@almadar/core`'s page resolver), so the
     * caller assembles this map from the orbital schema directly.
     */
    traitConfigsByName?: Record<string, import('@almadar/core').TraitConfig>;
    /**
     * Trait → orbital map built from `schema.orbitals[].traits[]` by the
     * caller. Threaded down so bus emits (`UI:Orbital.Trait.Event`) and
     * subscriptions can carry the qualified `Orbital.Trait` scope —
     * gap #13 unification. Same mechanism as `traitConfigsByName`: the
     * orbital boundary doesn't propagate through `@almadar/core`'s
     * `ResolvedTraitBinding`, so the caller assembles the map directly.
     */
    orbitalsByTrait?: Record<string, string>;
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
    // Mirrors OrbitalServerRuntime's setTraitConfig loop so the client-side
    // guard evaluator sees @config.X. Page-level bindings often arrive with
    // config undefined; the caller's `traitConfigsByName` map (built from the
    // orbital schema) backfills the missing entries.
    const traitConfigsByName = options?.traitConfigsByName;
    const orbitalsByTrait = options?.orbitalsByTrait;
    const manager = useMemo(() => {
        const traitDefs = traitBindings.map(toTraitDefinition);
        const m = new StateMachineManager(traitDefs);
        for (const binding of traitBindings) {
            const cfg = binding.config ?? traitConfigsByName?.[binding.trait.name];
            if (cfg !== undefined) {
                m.setTraitConfig(binding.trait.name, cfg);
            }
        }
        return m;
    }, [traitBindings, traitConfigsByName]);

    // Track state for React re-renders
    const [traitStates, setTraitStates] = useState<Map<string, TraitState>>(() => {
        return manager.getAllStates();
    });

    // Actor model queue: events are enqueued and drained one at a time,
    // awaiting all effects before processing the next event.
    const eventQueueRef = useRef<Array<{ eventKey: string; payload?: EventPayload }>>([]);
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
    // Mirror of traitStates kept in sync on every render so that RAF/interval
    // callbacks always see the latest values without needing to be recreated.
    const traitStatesRef = useRef<Map<string, TraitState>>(traitStates);

    useEffect(() => { traitStatesRef.current = traitStates; }, [traitStates]);

    // Per-trait post-transition history for TraitStateSnapshot's payload/cascade
    // fields. Keyed by trait name. `lastPayload` = the payload the trait just
    // processed (source for `@payload.X` binding assertions — VG11a). `data`
    // = rows the trait received via `@payload.data` in its most recent fetch
    // cascade (source for `@entity.X` bindings + VG11b). `cascadeReceived` =
    // events that hit this trait via `listens { Source SRC → EVENT }` since
    // the last user-initiated event, used to validate cascade fan-out (VG4).
    // Read by `registerTraitSnapshot`'s getter; the bindings gate doesn't
    // need to plumb anything other than the trait name.
    const traitSnapshotDataRef = useRef<Map<string, {
        lastPayload?: EventPayload;
        lastEventDispatched?: { event: string; payload?: EventPayload; timestamp: number };
        data: Record<string, EntityRow[]>;
        cascadeReceived: Array<{ event: string; payload?: EventPayload; timestamp: number }>;
    }>>(new Map());


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

        // Bind trait state getter so verification tools can query current state
        bindTraitStateGetter((traitName) => {
            const allStates = newManager.getAllStates();
            if (allStates instanceof Map) {
                const val = allStates.get(traitName);
                return typeof val === 'string' ? val : undefined;
            }
            const state = newManager.getState(traitName);
            return typeof state === 'string' ? state : undefined;
        });

        // Per-trait snapshot getter: feeds `window.__orbitalVerification
        // .getTraitSnapshots()`, which runtime-verify / orbital-verify poll via
        // `readTraitSnapshots(page)` for the click-path state diff (VG3) and
        // the binding / delta gates (VG11a-c, VG4). Before this registration
        // existed the snapshot map was always empty, so every VG3 check
        // reported "no trait state advanced" — a silent false negative that
        // masked a working state machine. VG18.
        //
        // `data` / `lastPayload` / `lastEventDispatched` / `cascadeReceived`
        // stay empty here. Filling them requires threading the per-transition
        // payload through `enqueueAndDrain`; the VG4/VG11 gates that consume
        // those fields will enrich this getter as a follow-up. VG3 only needs
        // `traitName` + `currentState`.
        const snapshotUnregs: Array<() => void> = [];
        for (const binding of traitBindingsRef.current) {
            const traitName = binding.trait.name;
            // Seed snapshot data per trait — the transition hook below
            // enriches `lastPayload` / `data` / `cascadeReceived` on each
            // processed event. Keyed on trait name so rebinding picks up a
            // clean slate.
            if (!traitSnapshotDataRef.current.has(traitName)) {
                traitSnapshotDataRef.current.set(traitName, {
                    data: {},
                    cascadeReceived: [],
                });
            }
            const unreg = registerTraitSnapshot(traitName, (): TraitStateSnapshot => {
                const managerState = managerRef.current.getState(traitName);
                const currentState = managerState?.currentState
                    ?? binding.trait.states[0]?.name
                    ?? 'unknown';
                const live = traitSnapshotDataRef.current.get(traitName) ?? {
                    data: {},
                    cascadeReceived: [],
                };
                return {
                    traitName,
                    currentState,
                    states: binding.trait.states.map((s) => s.name),
                    events: binding.trait.events.map((e) => e.key),
                    data: live.data,
                    ...(live.lastPayload !== undefined ? { lastPayload: live.lastPayload } : {}),
                    ...(live.lastEventDispatched !== undefined ? { lastEventDispatched: live.lastEventDispatched } : {}),
                    cascadeReceived: live.cascadeReceived,
                };
            });
            snapshotUnregs.push(unreg);
        }

        console.log('[TraitStateMachine] Reset states for page navigation:',
            Array.from(newManager.getAllStates().keys()).join(', '));

        return () => {
            for (const unreg of snapshotUnregs) unreg();
        };
    }, [traitBindings]);

    /**
     * Execute a single tick's effects synchronously.
     *
     * Mirrors the compiled shell output (orbital-shell-typescript/src/backend.rs lines 5353-5516):
     * - `set` effects are server-side only
     * - `render-ui` effects resolve bindings and flush slots
     * - No EffectExecutor (async) — ticks must be synchronous to work inside RAF
     * - `@payload` is empty (invalid in tick context per the Rust validator)
     */
    const runTickEffects = useCallback((tick: ResolvedTraitTick, binding: ResolvedTraitBinding) => {
        const actions = slotsActionsRef.current;
        const currentState = traitStatesRef.current.get(binding.trait.name)?.currentState ?? '';

        // appliesTo: empty array means fire in all states (same as Rust OirTick default)
        if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return;

        const bindingCtx: BindingContext = { entity: {}, payload: {}, state: currentState };
        if (binding.config) {
            bindingCtx.config = binding.config as TraitConfig;
        }
        const evalCtx = createContextFromBindings(bindingCtx);

        // Guard: use interpolateValue to evaluate the s-expression (returns truthy/falsy)
        if (tick.guard !== undefined) {
            const passed = interpolateValue(tick.guard, evalCtx);
            if (!passed) return;
        }

        // Process effects synchronously
        const pendingSlots = new Map<string, Array<{ pattern: PatternConfig; props: Record<string, unknown> }>>();

        const slotSource: SlotSource = {
            trait: binding.trait.name,
            state: currentState,
            transition: `${currentState}->tick:${tick.name}`,
            effects: tick.effects,
            traitDefinition: binding.trait,
        };

        for (const effect of tick.effects) {
            if (!Array.isArray(effect)) continue;
            const op = effect[0] as string;

            if (op === 'render-ui' || op === 'render') {
                const slot = effect[1] as string;
                const rawPattern = effect[2];
                if (rawPattern === null || rawPattern === undefined) {
                    pendingSlots.set(slot, []);
                    continue;
                }
                const updatedCtx = createContextFromBindings(bindingCtx);
                const resolved = interpolateValue(rawPattern, updatedCtx);
                const existing = pendingSlots.get(slot) ?? [];
                existing.push({ pattern: resolved as PatternConfig, props: {} });
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
        payload?: EventPayload
    ): Promise<void> => {
        const normalizedEvent = normalizeEventKey(eventKey);
        const bindings = traitBindingsRef.current;
        const currentManager = managerRef.current;
        const actions = slotsActionsRef.current;

        console.log('[TraitStateMachine] Processing event:', normalizedEvent, 'payload:', payload);
        crossTraitLog.debug('processEvent:enter', {
            event: normalizedEvent,
            traitCount: bindings.length,
            traitNames: bindings.map((b) => b.trait.name).join(','),
            orbitalsByTrait: JSON.stringify(orbitalsByTrait ?? null),
        });

        // Find the binding that matches each trait for linkedEntity info
        const bindingMap = new Map(bindings.map(b => [b.trait.name, b]));

        // Send event through StateMachineManager (shared runtime)
        const results = currentManager.sendEvent(normalizedEvent, payload);
        crossTraitLog.debug('processEvent:results', {
            event: normalizedEvent,
            executedCount: results.length,
            executedTraits: results.map((r) => r.traitName).join(','),
        });

        // Track every event each trait's effects emit during this dispatch.
        // Populated inside the effects loop via a wrapped emit handler;
        // consumed in the recordTransition loop to build the per-transition
        // ServerResponseTrace.emittedEvents — the canonical signal the
        // verifier's data-mutation observer reads via lastServerResponseFor.
        // Without this, the runtime path silently drops the persist's
        // declared emit.success and serverResponse arrives as null.
        const emittedByTrait = new Map<string, string[]>();

        // Execute effects for each transition that occurred
        for (const { traitName, result } of results) {
            const binding = bindingMap.get(traitName);
            const traitState = currentManager.getState(traitName);

            if (!binding || !traitState) continue;

            // Enrich snapshot buffer for VG11a/b/c/VG4 gates. Record the
            // payload this trait just processed + append to cascadeReceived
            // if the event arrived via a `listens` subscription (i.e. not
            // the event the user directly dispatched — we mark that below).
            // Keeps the state-bridge snapshot close to what the reducer saw
            // so assertions like "expected @payload.data in DOM" have the
            // data they need to resolve.
            const snap = traitSnapshotDataRef.current.get(traitName);
            if (snap && result.executed) {
                snap.lastPayload = payload;
                snap.lastEventDispatched = {
                    event: normalizedEvent,
                    ...(payload !== undefined ? { payload } : {}),
                    timestamp: Date.now(),
                };
                // Cache entity rows received via @payload.data so @entity.X
                // bindings resolve after a fetch cascade. Gracefully skip
                // when the payload doesn't carry row data.
                const pdata = (payload as { data?: unknown } | undefined)?.data;
                if (Array.isArray(pdata) && binding.linkedEntity) {
                    snap.data[binding.linkedEntity] = pdata as EntityRow[];
                }
                // cascadeReceived: if this trait has a `listens` entry that
                // maps the incoming event to a trigger, count it as cascade.
                // Distinguishes user-direct from cascade-triggered for VG4.
                const listensEntry = (binding.trait.listens ?? []).find(
                    (l) => l.event === normalizedEvent || l.triggers === normalizedEvent,
                );
                if (listensEntry) {
                    snap.cascadeReceived.push({
                        event: normalizedEvent,
                        ...(payload !== undefined ? { payload } : {}),
                        timestamp: Date.now(),
                    });
                }
            }

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

                const linkedEntity = binding.linkedEntity || '';
                const entityId = payload?.entityId as string | undefined;

                // Accumulator for render-ui effects -- grouped by slot
                const pendingSlots = new Map<string, SlotPatternEntry[]>();
                const slotSource: SlotSource = {
                    trait: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    effects: result.effects,
                    traitDefinition: binding.trait,
                };

                // Build handlers using factory from @almadar/runtime.
                // Entity resolution happens in SlotContentRenderer via useEntityRef.
                const clientHandlers = createClientEffectHandlers({
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
                });

                // Offline-preview mode: when `persistence` is supplied, layer
                // `createServerEffectHandlers` on top so `fetch` / `persist` /
                // `set` / `ref` / `deref` / `swap!` / `atomic` / `callService`
                // run locally with the same semantics as `OrbitalServerRuntime`.
                // Keep the client `emit` / `renderUI` / `navigate` / `notify`
                // (they own the slot setter + router + toaster).
                const persistence = optionsRef.current?.persistence;
                let handlers: EffectHandlers = clientHandlers;
                if (persistence) {
                    // Bindings object is mutable — ServerEffectHandlers writes
                    // fetched rows onto it so downstream render-ui can resolve
                    // `@entity` bindings without a second round-trip. We alloc
                    // it BEFORE building the bindingCtx below, then reuse.
                    const sharedBindings: BindingContext = {
                        entity: (payload ?? {}) as unknown as EntityRow,
                        payload: payload || {},
                        state: result.previousState,
                    };
                    if (binding.config) {
                        sharedBindings.config = binding.config as TraitConfig;
                    }
                    const serverHandlers = createServerEffectHandlers({
                        persistence,
                        eventBus,
                        entityType: linkedEntity,
                        entityId,
                        bindings: sharedBindings,
                        context: {
                            traitName: binding.trait.name,
                            state: result.previousState,
                            transition: `${result.previousState}->${result.newState}`,
                            linkedEntity,
                            entityId,
                        },
                        source: { trait: binding.trait.name },
                        callService: optionsRef.current?.callService,
                    });
                    handlers = {
                        ...serverHandlers,
                        // Client handlers own UI + emit: keep the slot setter
                        // and pre-prefixed UI:* emit path intact.
                        emit: clientHandlers.emit,
                        renderUI: clientHandlers.renderUI,
                        navigate: clientHandlers.navigate,
                        notify: clientHandlers.notify,
                    };
                }

                // The payload shape is a superset of EntityRow at runtime
                // (both are plain JSON-ish objects of primitive-ish values),
                // but TS distinguishes them nominally. `@entity.X` lookups
                // walk the same keys in either case — the cast acknowledges
                // that the caller pattern of seeding entity from payload
                // on INIT-style events is shape-compatible.
                const entityFromPayload = (payload ?? {}) as unknown as EntityRow;
                const bindingCtx: BindingContext = {
                    entity: entityFromPayload,
                    payload: payload || {},
                    state: result.previousState,
                };
                // Surface the trait ref's call-site `config: { ... }` so
                // `@config.X` bindings resolve in render-ui patterns (e.g.
                // std-modal reads `@config.icon`, `@config.title`,
                // `@config.fields` from the molecule's call-site config).
                // Mirrors the server-side threading in
                // `OrbitalServerRuntime.executeEffects`.
                if (binding.config) {
                    bindingCtx.config = binding.config as TraitConfig;
                }

                const effectContext: EffectContext = {
                    traitName: binding.trait.name,
                    state: result.previousState,
                    transition: `${result.previousState}->${result.newState}`,
                    linkedEntity,
                    entityId,
                };

                // Capture every event this trait's effects emit during
                // execution. The verifier's data-mutation observer reads
                // them off the per-transition ServerResponseTrace so the
                // declared persist `emit.success` becomes a verifiable
                // signal on the runtime path (parity with the compiled
                // path's recordServerResponse for server-bridge events).
                const emittedDuringExec: string[] = [];
                emittedByTrait.set(traitName, emittedDuringExec);
                const baseEmit = handlers.emit;
                const trackingHandlers: EffectHandlers = {
                    ...handlers,
                    emit: (event, eventPayload, source) => {
                        emittedDuringExec.push(event);
                        baseEmit(event, eventPayload, source);
                    },
                };

                const executor = new EffectExecutor({ handlers: trackingHandlers, bindings: bindingCtx, context: effectContext });

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
                        // Effects are s-expression arrays: ["fetch", "Entity"], ["render-ui", "slot", {...}], etc.
                        if (Array.isArray(e)) {
                            return {
                                type: String(e[0] ?? 'unknown'),
                                args: e.slice(1),
                                status: 'executed' as const,
                            };
                        }
                        const eff = e as Record<string, unknown>;
                        return {
                            type: String(eff.type ?? 'unknown'),
                            args: Array.isArray(eff.args) ? eff.args : [],
                            status: 'executed' as const,
                        };
                    }
                );
                const emittedEvents = emittedByTrait.get(traitName) ?? [];
                recordTransition({
                    traitName,
                    from: result.previousState,
                    to: result.newState,
                    event: normalizedEvent,
                    effects: effectTraces,
                    timestamp: Date.now(),
                    // Populate ServerResponseTrace.emittedEvents whenever this
                    // trait's effects fired anything via handlers.emit (e.g.
                    // a persist's declared emit.success → ITEM_CREATED).
                    // Without this, the verifier's data-mutation observer's
                    // `frame.serverResponse?.emittedEvents` arrives null and
                    // the cascade-was-empty fail surfaces despite the runtime
                    // having dispatched the event correctly.
                    ...(emittedEvents.length > 0 && {
                        serverResponse: {
                            // orbitalName is metadata for the debug timeline;
                            // the verifier reads emittedEvents only.
                            orbitalName: '',
                            success: true,
                            clientEffects: effectTraces.length,
                            dataEntities: {},
                            emittedEvents,
                            timestamp: Date.now(),
                        },
                    }),
                });
            }
        }

        // Re-broadcast each successfully-transitioned event on the bus so
        // cross-trait `listens { SourceTrait EVENT → Trigger }` wiring
        // fires. Without this, user-driven events drive the source trait's
        // transition but never fan out to sibling traits (the std-cart
        // Persistor never hears SAVE, the cart never grows).
        //
        // Parity with:
        // - Compiled path's useOrbitalBridge (re-emits transition event
        //   with fromBridge flag after HTTP success) — backend.rs:3520+
        // - @almadar/runtime 4.9.0's OrbitalServerRuntime re-emit — for
        //   server-bus listeners in non-playground runtime setups
        //
        // Skip lifecycle events (INIT / LOAD / $MOUNT / $UNMOUNT) and the
        // client-only $FRAME machinery to avoid re-dispatching on mount.
        const LIFECYCLE_EVENTS = new Set(['INIT', 'LOAD', '$MOUNT', '$UNMOUNT', '$FRAME']);
        if (!LIFECYCLE_EVENTS.has(normalizedEvent)) {
            for (const { traitName, result } of results) {
                if (!result.executed) continue;
                // Gap #13: re-emit on the qualified `UI:Orbital.Trait.EVENT`
                // bus key so cross-trait listens (subscribed under the
                // qualified form) see this echo. The qualified key carries
                // source identity directly — no `source.trait !== own`
                // predicate needed (which is how pre-unification cross-
                // trait fan-out worked).
                const orbitalName = orbitalsByTrait?.[traitName];
                if (!orbitalName) continue;
                eventBus.emit(`UI:${orbitalName}.${traitName}.${normalizedEvent}`, payload, {
                    orbital: orbitalName,
                    trait: traitName,
                    fromBridge: true,
                });
            }
        }

        // Sync React state from manager
        if (results.length > 0) {
            setTraitStates(currentManager.getAllStates());
        }

        // Forward event to server (dual execution model)
        // Await so server response (re-fetched data, re-rendered UI) is applied before continuing
        const onEventProcessed = optionsRef.current?.onEventProcessed;
        if (onEventProcessed) {
            // Gap #11: pass the set of orbitals whose traits executed this
            // event. The TraitInitializer side uses this to scope the server
            // fan-out so cross-orbital traits with the same event name don't
            // pile their modals into one slot.
            const dispatchedOrbitals = new Set<string>();
            for (const { traitName, result } of results) {
                if (!result.executed) continue;
                const orbital = orbitalsByTrait?.[traitName];
                if (orbital) dispatchedOrbitals.add(orbital);
            }
            await onEventProcessed(normalizedEvent, payload, dispatchedOrbitals);
        }
    }, [entities, eventBus]);

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
    const enqueueAndDrain = useCallback((eventKey: string, payload?: EventPayload) => {
        eventQueueRef.current.push({ eventKey, payload });
        void drainEventQueue();
    }, [drainEventQueue]);

    /**
     * Legacy synchronous processEvent -- delegates to the actor queue.
     * Kept for backward compatibility with any code that calls processEvent directly.
     */
    const processEvent = useCallback((
        eventKey: string,
        payload?: EventPayload
    ) => {
        enqueueAndDrain(eventKey, payload);
    }, [enqueueAndDrain]);

    /**
     * Public API to send an event
     */
    const sendEvent = useCallback((
        eventKey: string,
        payload?: EventPayload
    ) => {
        enqueueAndDrain(eventKey, payload);
    }, [enqueueAndDrain]);

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

        // Gap #13: subscribe to the qualified `UI:Orbital.Trait.EVENT` keys
        // that codegen-emitted producers (button hosts, bridge re-emits)
        // now send. Each transition trigger subscribes for every trait
        // that has it; the trait dispatches its OWN trigger when its
        // qualified key fires. Skip bridge echoes on the OWN key — the
        // post-transition re-broadcast targets cross-trait listeners,
        // not the originating trait (which would loop infinitely).
        for (const binding of traitBindings) {
            const traitName = binding.trait.name;
            const orbitalName = orbitalsByTrait?.[traitName];
            if (!orbitalName) continue;
            for (const transition of binding.trait.transitions) {
                const eventKey = transition.event;
                if (eventKey === 'INIT' || eventKey === 'LOAD' || eventKey === '$MOUNT') {
                    continue;
                }
                const unsub = eventBus.on(`UI:${orbitalName}.${traitName}.${eventKey}`, (event) => {
                    if (event.source && (event.source as { fromBridge?: boolean }).fromBridge) {
                        return;
                    }
                    enqueueAndDrain(eventKey, event.payload);
                });
                unsubscribes.push(unsub);
            }
        }

        // Cross-trait `listens { SourceTrait EVENT → Trigger }` wiring.
        // Subscribes to the qualified `UI:Orbital.Trait.EVENT` form. When
        // the listen omits the orbital (intra-orbital listen), the OWN
        // orbital is used. The qualified key carries source identity, so
        // no `event.source.trait` predicate is needed.
        for (const binding of traitBindings) {
            const ownOrbital = orbitalsByTrait?.[binding.trait.name];
            const listens: ResolvedTraitListener[] = (binding.trait.listens ?? []);
            crossTraitLog.debug('listen:subscribe', {
                trait: binding.trait.name,
                ownOrbital,
                listenCount: listens.length,
                listens: listens.map((l) => `${l.source?.trait ?? '?'}.${l.event}->${l.triggers}`).join(','),
            });
            for (const listen of listens) {
                const sourceTrait = listen.source?.trait;
                if (!sourceTrait) continue; // wildcard listens are out-of-scope post-unification
                const sourceOrbital = listen.source?.orbital ?? ownOrbital;
                if (!sourceOrbital) continue;
                const busKey = `UI:${sourceOrbital}.${sourceTrait}.${listen.event}`;
                crossTraitLog.debug('listen:subscribed', { busKey, targetTrait: binding.trait.name, triggers: listen.triggers });
                const unsub = eventBus.on(busKey, (event) => {
                    crossTraitLog.info('listen:fired', { busKey, targetTrait: binding.trait.name, triggers: listen.triggers });
                    enqueueAndDrain(listen.triggers, event.payload);
                });
                unsubscribes.push(unsub);
            }
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
