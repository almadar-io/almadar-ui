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
import { useEventBus } from '../hooks/index';
import { createLogger } from '@almadar/logger';
import { isCircuitEvent } from '@almadar/core';
import type { PatternConfig, ResolvedTraitTick, EventPayload, EntityRow, TraitConfig } from '@almadar/core';
import {
    StateMachineManager,
    EffectExecutor,
    interpolateValue,
    createContextFromBindings,
    createServerEffectHandlers,
    collectDeclaredConfigDefaults,
    type TraitState,
    type TraitDefinition,
    type EffectHandlers,
    type BindingContext,
    type EffectContext,
} from '@almadar/runtime';
import { evaluateGuard } from '@almadar/evaluator';
import { createClientEffectHandlers } from './createClientEffectHandlers';
import type { ResolvedTraitBinding, ResolvedTraitListener } from './types';
import type { SlotPatternEntry, SlotSource } from './ui/slot-types';
import type { useUISlots, SlotProps } from '../context/UISlotContext';
import { convertFnFormLambdasInProps } from './fn-form-lambda';
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

// `almadar:ui:slot-flush` — diagnostic for the consolidated slot store.
// Every flushSlot decision (clear / embed-route / slot-render) is
// recorded here at info level. With both halves of the runtime now
// going through this single helper, a missing log means the flush
// didn't run; otherwise the log shows whether we landed in the
// per-trait sidecar (embedded) or the global slot.
const flushLog = createLogger('almadar:ui:slot-flush');

// State-transition + effect-dispatch diagnostic. Records every
// `(trait, fromState -> toState, slotsTouched)` triple so verifier
// transition logs can answer "did trait X actually transition to
// state Y and dispatch the expected render-ui spec?" without reading
// the React DOM.
const stateLog = createLogger('almadar:ui:state-transitions');

// Tick-loop diagnostic. Records each tick's synchronous effect run —
// which `set` effects fired, what they wrote into the per-trait field
// state, and which slots were flushed — so a non-moving game board can
// be diagnosed from logs ("did the 33ms physics tick's `(set @entity.x)`
// actually mutate the entity?") instead of by assumption.
const tickLog = createLogger('almadar:ui:tick-effects');

// Synchronous effect operators a tick may run. `set` / `emit` /
// `render-ui` (+ navigate/notify/log) resolve without awaiting; the
// async ops (`fetch`/`persist`/`call-service`/`swap!`/`ref`/`deref`/
// `atomic`/`spawn`/`despawn`/`os/*`/`watch`) cannot be awaited inside a
// RAF/setInterval frame, so ticks skip them. This is the fixed tick
// contract, not a heuristic.
const SYNC_TICK_OPERATORS: ReadonlySet<string> = new Set([
    'set',
    'emit',
    'render-ui',
    'render',
    'navigate',
    'notify',
    'log',
    // Synchronous structural forms that wrap sync effects. A tick authored as
    // a single top-level `(let ((..)) (do (set ..) (render-ui ..)))` or
    // `(if cond (set ..) ..)` is one of these at its head — the EffectExecutor
    // resolves the binding values / condition through the canonical evaluator
    // and runs the wrapped sync effects. Without these in the allow-list the
    // whole tick is filtered out (its head op isn't `set`/`emit`/...), so the
    // physics/gameflow/AI tick never runs.
    'let',
    'if',
    'do',
    'when',
]);

// Lifecycle (mount-time) events. They are NOT user-driven, so the event-bus
// self-subscription skips them — instead they are fired once per trait on mount
// (see the mount-init effect) so single-state boards' INIT `set` effects seed
// the entity before the first user event.
const LIFECYCLE_EVENTS = ['INIT', 'LOAD', '$MOUNT'] as const;

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
    /**
     * Set of trait names referenced via `@trait.X` by some sibling
     * layout in the resolved schema. Slot writes from these traits go
     * to the per-trait sidecar via `uiSlots.updateTraitContent`; the
     * layout owns the slot and embeds via `<TraitFrame>`. Mirrors
     * compiled-path codegen semantics.
     */
    embeddedTraits?: ReadonlySet<string>;
}

/**
 * useTraitStateMachine - Manages state machines for multiple traits
 *
 * Uses the shared StateMachineManager for consistent behavior with server runtime.
 * Collects render-ui effects per transition and sets slot content atomically.
 *
 * Slot writes go directly to `useUISlots` (the canonical store the DOM
 * reads from) instead of routing through the now-removed `SlotsContext`
 * + `SlotBridge` mirror. Trait names listed in `embeddedTraits` are
 * referenced via `@trait.X` by some sibling layout's render-ui — for
 * those, slot writes update the per-trait sidecar (via
 * `updateTraitContent`) so `<TraitFrame>` can pick them up without the
 * atom landing as a separate slot source. Mirrors compiled-path
 * codegen, where atom views are inlined as JSX inside the layout's
 * pattern rather than each writing a shared slot.
 */
export function useTraitStateMachine(
    traitBindings: ResolvedTraitBinding[],
    uiSlots: ReturnType<typeof useUISlots>,
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

    // Trait names whose mount-time lifecycle event (INIT/LOAD/$MOUNT) has
    // already fired this mount. Single-state game boards seed their entity in
    // INIT's `set` effects; nothing else dispatches INIT, so it must fire once
    // on mount. Guard prevents a re-render or repeated bindings-effect run from
    // re-firing it. Cleared when bindings change (page nav rebuilds the SM).
    const initedTraitsRef = useRef<Set<string>>(new Set());

    // Keep refs for callbacks to avoid stale closures
    const traitBindingsRef = useRef(traitBindings);
    const managerRef = useRef(manager);
    const uiSlotsRef = useRef(uiSlots);
    const embeddedTraitsRef = useRef(options?.embeddedTraits);
    const optionsRef = useRef(options);

    useEffect(() => {
        traitBindingsRef.current = traitBindings;
    }, [traitBindings]);

    useEffect(() => {
        managerRef.current = manager;
        setTraitStates(manager.getAllStates());
    }, [manager]);

    useEffect(() => {
        uiSlotsRef.current = uiSlots;
    }, [uiSlots]);

    useEffect(() => {
        embeddedTraitsRef.current = options?.embeddedTraits;
    }, [options?.embeddedTraits]);

    /**
     * Flush this trait's accumulated render-ui patterns for a slot to the
     * shared `useUISlots` store. Empty patterns clear this trait's
     * contribution to the slot. Non-empty patterns take the LAST entry,
     * unwrap `{ type, children, ...inlineProps }`, and either land in
     * the slot via `render` (layout traits) or in the per-trait sidecar
     * via `updateTraitContent` (atom traits referenced via `@trait.X`
     * by some sibling layout). Mirrors the compiled-path codegen which
     * inlines atom views as JSX inside the layout's pattern.
     */
    const flushSlot = useCallback(
        (
            traitName: string,
            slot: string,
            patterns: SlotPatternEntry[],
            source?: { event?: string; state?: string; entity?: string },
        ): void => {
            const slots = uiSlotsRef.current;
            const embedded = embeddedTraitsRef.current;
            if (patterns.length === 0) {
                flushLog.debug('clear', { traitName, slot });
                slots.clearBySource(slot as Parameters<typeof slots.clearBySource>[0], traitName);
                return;
            }
            const last = patterns[patterns.length - 1];
            const record = (last.pattern ?? {}) as SlotProps;
            const { type: patternType, children: nested, ...inlineProps } = record;
            // Convert `["fn", argName, body]` lambdas into render-prop
            // functions before they land in `useUISlots` (mirrors
            // OrbPreview.applyServerEffects).
            const rawProps: SlotProps = {
                ...inlineProps,
                ...(last.props as SlotProps),
                ...(nested !== undefined ? { children: nested } : {}),
            };
            const props = convertFnFormLambdasInProps(rawProps);
            const isEmbedded = embedded?.has(traitName) ?? false;
            if (isEmbedded) {
                flushLog.debug('embed-route', {
                    traitName,
                    slot,
                    patternType: typeof patternType === 'string' ? patternType : undefined,
                    embeddedSize: embedded?.size ?? 0,
                });
                slots.updateTraitContent(traitName, {
                    pattern: patternType as string,
                    props,
                    priority: 0,
                    animation: 'fade',
                    transitionEvent: source?.event,
                    fromState: source?.state,
                    entity: source?.entity,
                });
                return;
            }
            flushLog.debug('slot-render', () => ({
                traitName,
                slot,
                patternType: typeof patternType === 'string' ? patternType : undefined,
                embedded: Array.from(embedded ?? []),
            }));
            slots.render({
                target: slot as Parameters<typeof slots.render>[0]['target'],
                pattern: patternType as string,
                props,
                sourceTrait: traitName,
                transitionEvent: source?.event,
                fromState: source?.state,
                entity: source?.entity,
            });
        },
        [],
    );

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Refs for tick loop callbacks — read current values without causing re-renders.
    // Mirror of traitStates kept in sync on every render so that RAF/interval
    // callbacks always see the latest values without needing to be recreated.
    const traitStatesRef = useRef<Map<string, TraitState>>(traitStates);

    useEffect(() => { traitStatesRef.current = traitStates; }, [traitStates]);

    // Per-trait post-transition history for TraitStateSnapshot's payload/cascade
    // fields. Verifier-only debug snapshot (VG3, VG4, VG11a-c). Not a binding
    // source. `data` is left empty: `@entity.X` resolves from
    // `traitFieldStatesRef` (explicit `(set @entity.X Y)` writes), not from
    // any reducer-mirror.
    const traitSnapshotDataRef = useRef<Map<string, {
        lastPayload?: EventPayload;
        lastEventDispatched?: { event: string; payload?: EventPayload; timestamp: number };
        data: Record<string, EntityRow[]>;
        cascadeReceived: Array<{ event: string; payload?: EventPayload; timestamp: number }>;
    }>>(new Map());

    // Per-trait scalar entity state populated EXCLUSIVELY by `(set @entity.X Y)`
    // effects. Mirrors compiled's `state.fields` reducer. `bindingCtx.entity`
    // resolves from this map — no implicit seeding from persistence, no
    // post-fetch write-through, no payload mirror. Initial empty per trait.
    const traitFieldStatesRef = useRef<Map<string, EntityRow>>(new Map());


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

        stateLog.debug('reset-states-for-nav', () => ({
            traits: Array.from(newManager.getAllStates().keys()).join(', '),
        }));

        return () => {
            for (const unreg of snapshotUnregs) unreg();
        };
    }, [traitBindings]);

    /**
     * Execute one transition's (or tick's) effects through the canonical
     * `EffectExecutor` + `createClientEffectHandlers`, against the in-memory
     * `[runtime]`-entity store `traitFieldStatesRef`.
     *
     * This is the SINGLE effect-execution path. Both `processEventQueued`
     * (events) and `runTickEffects` (RAF/interval ticks) call it so a tick
     * runs EXACTLY what an event runs for in-memory entities: `set` mutates
     * the trait's field state, `emit` fires on the bus, `render-ui` flushes
     * slots.
     *
     * `bindingCtx.entity` is seeded from `traitFieldStatesRef` (the trait's
     * current field state) — NOT `{}` — so `@entity.player` resolves; the
     * wrapped `set` writes results back into `traitFieldStatesRef` so the
     * next tick and the render-ui read the advanced state.
     *
     * `syncOnly` (tick path) drops async effects up front: they can't be
     * awaited inside a RAF/setInterval frame. The set/emit/render-ui work a
     * tick relies on is synchronous and completes within the frame.
     *
     * Returns the events this trait's effects emitted (for the event path's
     * `recordTransition` ServerResponseTrace).
     */
    const executeTransitionEffects = useCallback(async (params: {
        binding: ResolvedTraitBinding;
        effects: unknown[];
        previousState: string;
        newState: string;
        payload?: EventPayload;
        flushEvent: string;
        syncOnly: boolean;
        log: ReturnType<typeof createLogger>;
    }): Promise<string[]> => {
        const { binding, previousState, newState, payload, flushEvent, syncOnly, log } = params;
        const traitName = binding.trait.name;
        const linkedEntity = binding.linkedEntity || '';
        const entityId = payload?.entityId as string | undefined;

        // ONE live `[runtime]`-entity store per trait. The canonical client
        // `set` (createClientEffectHandlers) writes through to THIS object, the
        // executor reads `@entity.*` from it during the same `executeAll`, and
        // the next tick + guards seed from it — no detached binding clone, no
        // guard-vs-render split. Created once (lazily) and reused thereafter so
        // every read/write hits the same identity.
        let liveEntity = traitFieldStatesRef.current.get(traitName);
        if (!liveEntity) {
            liveEntity = {} as EntityRow;
            traitFieldStatesRef.current.set(traitName, liveEntity);
        }

        // Ticks must stay synchronous — drop async effects that can't be
        // awaited inside RAF/setInterval. Deterministic op allow-list.
        const effects = syncOnly
            ? params.effects.filter(
                (e) => Array.isArray(e) && SYNC_TICK_OPERATORS.has(String(e[0])),
            )
            : params.effects;
        if (effects.length === 0) return [];

        const pendingSlots = new Map<string, SlotPatternEntry[]>();
        const slotSource: SlotSource = {
            trait: traitName,
            state: previousState,
            transition: `${previousState}->${newState}`,
            effects,
            traitDefinition: binding.trait,
        };

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
            callService: optionsRef.current?.callService,
            // The canonical client `set` writes `(set @entity.X)` straight into
            // the trait's one live store — the same object bound below. This is
            // what makes a [runtime] entity's set (from ticks AND events) reach
            // the render-ui + next tick + guards.
            liveEntity,
        });

        // Offline-preview mode: when `persistence` is supplied, layer
        // `createServerEffectHandlers` on top so `fetch` / `persist` /
        // `set` / `ref` / `deref` / `swap!` / `atomic` / `callService`
        // run locally with the same semantics as `OrbitalServerRuntime`.
        // Keep the client `emit` / `renderUI` / `navigate` / `notify`.
        // Skipped for `syncOnly` ticks (they never run async ops).
        const persistence = syncOnly ? undefined : optionsRef.current?.persistence;
        let handlers: EffectHandlers = clientHandlers;
        if (persistence) {
            const sharedBindings: BindingContext = {
                // Seed `@entity` from the trait's scalar field state (a real
                // EntityRow), the same source the executor's own bindingCtx
                // uses below. `@payload.*` resolves from `payload` separately,
                // so dropping the prior `payload as EntityRow` cast loses
                // nothing — it just stops mislabelling the payload as an entity.
                entity: liveEntity,
                payload: payload || {},
                state: previousState,
            };
            const sharedDeclared = collectDeclaredConfigDefaults(binding.trait);
            const sharedCallSite = binding.config as TraitConfig | undefined;
            if (sharedDeclared || sharedCallSite) {
                sharedBindings.config = {
                    ...(sharedDeclared ?? {}),
                    ...(sharedCallSite ?? {}),
                } as TraitConfig;
            }
            const serverHandlers = createServerEffectHandlers({
                persistence,
                eventBus,
                entityType: linkedEntity,
                entityId,
                bindings: sharedBindings,
                context: {
                    traitName,
                    state: previousState,
                    transition: `${previousState}->${newState}`,
                    linkedEntity,
                    entityId,
                },
                source: { trait: traitName },
                callService: optionsRef.current?.callService,
            });
            handlers = {
                ...serverHandlers,
                emit: clientHandlers.emit,
                renderUI: clientHandlers.renderUI,
                navigate: clientHandlers.navigate,
                notify: clientHandlers.notify,
            };
        }

        // Observe each `(set @entity.X)` write for the tick/transition log
        // without owning the write — the canonical client `set` (and, in
        // offline-preview, the server `set`) already mutate `liveEntity`.
        // A second writing wrapper here would be a parallel store; this just
        // taps the value as it passes through for diagnostics.
        const baseSet = handlers.set;
        handlers = {
            ...handlers,
            set: async (targetId, field, value) => {
                if (baseSet) await baseSet(targetId, field, value);
                log.debug('set:write', {
                    traitName,
                    field,
                    value: JSON.stringify(value),
                    transition: `${previousState}->${newState}`,
                });
            },
        };

        // `@entity.X` resolves against the ONE live store the client `set`
        // writes through to — same object, read live by render-ui in this same
        // `executeAll` and seeded by the next tick.
        const bindingCtx: BindingContext = {
            entity: liveEntity,
            payload: payload || {},
            state: previousState,
        };
        const declaredDefaults = collectDeclaredConfigDefaults(binding.trait);
        const callSiteConfig = binding.config as TraitConfig | undefined;
        if (declaredDefaults || callSiteConfig) {
            bindingCtx.config = {
                ...(declaredDefaults ?? {}),
                ...(callSiteConfig ?? {}),
            } as TraitConfig;
        }

        const effectContext: EffectContext = {
            traitName,
            state: previousState,
            transition: `${previousState}->${newState}`,
            linkedEntity,
            entityId,
        };

        // Capture every event this trait's effects emit during execution.
        const emittedDuringExec: string[] = [];
        const baseEmit = handlers.emit;
        const trackingHandlers: EffectHandlers = {
            ...handlers,
            emit: (event, eventPayload, source) => {
                emittedDuringExec.push(event);
                baseEmit(event, eventPayload, source);
            },
        };

        const executor = new EffectExecutor({ handlers: trackingHandlers, bindings: bindingCtx, context: effectContext });

        void slotSource;
        try {
            await executor.executeAll(effects);

            log.debug('effects:executed', () => ({
                traitName,
                transition: `${previousState}->${newState}`,
                event: flushEvent,
                effectCount: effects.length,
                emitted: emittedDuringExec.join(','),
                entityAfter: JSON.stringify(traitFieldStatesRef.current.get(traitName) ?? {}),
                slotsTouched: Array.from(pendingSlots.keys()).join(','),
            }));

            for (const [slot, patterns] of pendingSlots) {
                log.debug('flush:slot', {
                    traitName,
                    slot,
                    patternCount: patterns.length,
                    event: flushEvent,
                    transition: `${previousState}->${newState}`,
                    cleared: patterns.length === 0,
                });
                flushSlot(traitName, slot, patterns, {
                    event: flushEvent,
                    state: previousState,
                    entity: binding.linkedEntity,
                });
            }
        } catch (error: unknown) {
            log.error('effects:error', {
                traitName,
                transition: `${previousState}->${newState}`,
                event: flushEvent,
                error: error instanceof Error ? error.message : String(error),
                effectCount: effects.length,
            });
        }

        return emittedDuringExec;
    }, [eventBus, flushSlot]);

    /**
     * Execute a single tick's effects through the SAME canonical executor
     * the event path uses (`executeTransitionEffects`), synchronously.
     *
     * `[runtime]` entities live only in memory, so a tick's effects run
     * client-side exactly like an event's do: `(set @entity.player.x …)`
     * mutates `traitFieldStatesRef`, the next frame reads it back, things
     * move. Async effects are skipped (`syncOnly`); guard + appliesTo are
     * honored.
     */
    const runTickEffects = useCallback((tick: ResolvedTraitTick, binding: ResolvedTraitBinding) => {
        const traitName = binding.trait.name;
        const currentState = traitStatesRef.current.get(traitName)?.currentState ?? '';

        // appliesTo: empty array means fire in all states (same as Rust OirTick default)
        if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return;

        // Guard: evaluate against the SEEDED entity state so `@entity.X`
        // guards see the advancing values, not `{}`.
        if (tick.guard !== undefined) {
            const guardCtx: BindingContext = {
                entity: traitFieldStatesRef.current.get(traitName) ?? ({} as EntityRow),
                payload: {},
                state: currentState,
            };
            if (binding.config) {
                guardCtx.config = binding.config as TraitConfig;
            }
            // Use the canonical boolean guard evaluator (same as the event path in
            // StateMachineCore) — NOT interpolateValue, which resolves bindings but
            // returns a truthy value, so `(== @entity.result "none")` never went false
            // and the tick (e.g. game physics/scoring) never stopped on win/lose.
            const passed = evaluateGuard(
                tick.guard as Parameters<typeof evaluateGuard>[0],
                createContextFromBindings(guardCtx),
            );
            if (!passed) {
                tickLog.debug('guard-blocked', { traitName, tick: tick.name, state: currentState });
                return;
            }
        }

        void executeTransitionEffects({
            binding,
            effects: tick.effects,
            previousState: currentState,
            newState: currentState,
            flushEvent: `tick:${tick.name}`,
            syncOnly: true,
            log: tickLog,
        });
    }, [executeTransitionEffects]);

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

        crossTraitLog.debug('processEvent:enter', () => ({
            event: normalizedEvent,
            payload: JSON.stringify(payload ?? null),
            traitCount: bindings.length,
            traitNames: bindings.map((b) => b.trait.name).join(','),
            orbitalsByTrait: JSON.stringify(orbitalsByTrait ?? null),
        }));

        // Find the binding that matches each trait for linkedEntity info
        const bindingMap = new Map(bindings.map(b => [b.trait.name, b]));

        // Build per-trait entity overrides from `traitFieldStatesRef` so guards
        // reading `@entity.X` see scalar values written by prior `(set @entity.X)`
        // effects. Required for [runtime] entities that have no persistence row
        // to reload — otherwise guard ctx.entity is `{}` and any `@entity.X`
        // reference resolves undefined, blocking step-skip protection guards
        // (e.g. wizard step3 requiring step1 + step2 to have committed values).
        const entityByTrait: Record<string, EntityRow> = {};
        for (const [name, fields] of traitFieldStatesRef.current) {
            if (fields && Object.keys(fields).length > 0) {
                entityByTrait[name] = fields;
            }
        }

        // Send event through StateMachineManager (shared runtime)
        const results = currentManager.sendEvent(
            normalizedEvent,
            payload,
            undefined,
            entityByTrait
        );
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
                // Per-trait reducer mirror. When THIS trait owns the event
                // being processed (declared in `events`, not just listened
                // to via `listens`), and the payload carries `data: Array`,
                // write the array into `snap.data[<linkedEntity>]`. Fetch
                // emits land here (`XLoaded` from `(fetch X {emit:{success}})`),
                // so the verifier's `mergeEntityData` reads up-to-date rows
                // for `entityChanges` diffing. Restricted to declared events
                // to avoid the prior cross-trait bug: a listener trait
                // (e.g. Pagination listening to BrowseItemLoaded) would
                // otherwise store the source trait's rows under its own
                // `linkedEntity`, corrupting `@entity.X` reads.
                if (binding.linkedEntity) {
                    const ownsEvent = binding.trait.events?.some(
                        (e) => e.key === normalizedEvent,
                    ) ?? false;
                    if (ownsEvent) {
                        const payloadData = (payload as { data?: unknown } | undefined)?.data;
                        if (Array.isArray(payloadData)) {
                            snap.data[binding.linkedEntity] = payloadData as EntityRow[];
                        }
                    }
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
                stateLog.debug('executing-effects', () => ({
                    effectCount: result.effects.length,
                    traitName,
                    linkedEntity: binding.linkedEntity,
                    transition: `${result.previousState} -> ${result.newState}`,
                    effects: JSON.stringify(result.effects),
                }));

                // Run the transition's effects through the ONE canonical
                // executor path shared with the tick loop. Full async set
                // (fetch/persist/emit) is awaited here — the actor model
                // requires all effects to complete before the next event
                // is dequeued.
                const emittedDuringExec = await executeTransitionEffects({
                    binding,
                    effects: result.effects,
                    previousState: result.previousState,
                    newState: result.newState,
                    payload,
                    flushEvent: eventKey,
                    syncOnly: false,
                    log: stateLog,
                });
                emittedByTrait.set(traitName, emittedDuringExec);
            } else if (!result.executed) {
                if (result.guardResult === false) {
                    stateLog.debug('guard-blocked-transition', {
                        traitName,
                        from: result.previousState,
                        to: result.transition?.to,
                    });
                } else if (!result.transition) {
                    if (isCircuitEvent(normalizedEvent)) {
                        stateLog.warn('closed-circuit-violation', {
                            traitName,
                            currentState: traitState.currentState,
                            event: normalizedEvent,
                            remediation: `Add transition { from: "${traitState.currentState}", to: "<target_state>", event: "${normalizedEvent}", effects: [...] } — or ensure the previous action (that opened this UI) transitions back before emitting.`,
                        });
                    } else {
                        stateLog.debug('no-transition', {
                            traitName,
                            from: traitState.currentState,
                            event: normalizedEvent,
                        });
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

        // No post-transition re-broadcast: the originating event already
        // arrived via the qualified bus key (Form / Button via TraitScopeProvider
        // emit `UI:Orbital.Trait.X` directly), so every cross-trait listener
        // subscribed to that key has already fired once. Re-broadcasting on
        // the same key would fire each cross-trait listener a second time —
        // root cause of the std-cart "two entities created on Save" bug.

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

        stateLog.debug('subscribing-to-events', () => ({ events: Array.from(allEvents) }));

        const unsubscribes: Array<() => void> = [];

        // Gap #13: subscribe to the qualified `UI:Orbital.Trait.EVENT` keys
        // that codegen-emitted producers (button hosts, bridge re-emits)
        // now send. Each transition trigger subscribes for every trait
        // that has it; the trait dispatches its OWN trigger when its
        // qualified key fires. Skip bridge echoes on the OWN key — the
        // post-transition re-broadcast targets cross-trait listeners,
        // not the originating trait (which would loop infinitely).
        //
        // Dedupe by (orbital, trait, eventKey) so a trait with multiple
        // transitions on the same event (e.g. wizard with `NEXT -> step2`
        // in step1 AND `NEXT -> step3` in step2) registers ONE bus
        // listener — not one-per-transition. Without this dedupe, one
        // form submit produced two listener invocations and the state
        // machine processed `step1 -> step2 -> step3` in a single tick,
        // skipping the intermediate state's render entirely.
        const subscribedBusKeys = new Set<string>();
        for (const binding of traitBindings) {
            const traitName = binding.trait.name;
            const orbitalName = orbitalsByTrait?.[traitName];
            if (!orbitalName) continue;
            for (const transition of binding.trait.transitions) {
                const eventKey = transition.event;
                if ((LIFECYCLE_EVENTS as readonly string[]).includes(eventKey)) {
                    continue;
                }
                const selfBusKey = `UI:${orbitalName}.${traitName}.${eventKey}`;
                if (subscribedBusKeys.has(selfBusKey)) continue;
                subscribedBusKeys.add(selfBusKey);
                crossTraitLog.debug('self:subscribe', { traitName, busKey: selfBusKey, eventKey });
                const unsub = eventBus.on(selfBusKey, (event) => {
                    // Skip bridge echoes of THIS event's own dispatch
                    // (`dispatched: true` flag). Server-side emits via
                    // (emit) / fetch.emit.success carry `fromBridge: true`
                    // but NOT `dispatched`, so they reach the trait's
                    // transition handler — that's how in-trait cascades
                    // (e.g. loading → browsing on BrowseItemLoaded) work.
                    if (event.source && (event.source as { dispatched?: boolean }).dispatched) {
                        crossTraitLog.debug('self:fire-skipped-bridge-echo', { traitName, busKey: selfBusKey, eventKey });
                        return;
                    }
                    crossTraitLog.debug('self:fire', { traitName, busKey: selfBusKey, eventKey });
                    enqueueAndDrain(eventKey, event.payload);
                });
                unsubscribes.push(() => {
                    crossTraitLog.debug('self:unsubscribe', { traitName, busKey: selfBusKey, eventKey });
                    unsub();
                });
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
                crossTraitLog.debug('listen:subscribed', { busKey, targetTrait: binding.trait.name, sourceOrbital, sourceTrait, listenEvent: listen.event, triggers: listen.triggers });
                const unsub = eventBus.on(busKey, (event) => {
                    crossTraitLog.debug('listen:fired', { busKey, targetTrait: binding.trait.name, triggers: listen.triggers });
                    enqueueAndDrain(listen.triggers, event.payload);
                });
                unsubscribes.push(() => {
                    crossTraitLog.debug('listen:unsubscribe', { busKey, targetTrait: binding.trait.name, triggers: listen.triggers });
                    unsub();
                });
            }
        }

        return () => {
            crossTraitLog.debug('cleanup:start', { unsubscribeCount: unsubscribes.length });
            for (const unsub of unsubscribes) {
                unsub();
            }
            crossTraitLog.debug('cleanup:done', {});
        };
    }, [traitBindings, eventBus, enqueueAndDrain]);

    // Fire the mount-time lifecycle transition (INIT / LOAD / $MOUNT) once per
    // trait. The state machine has just been reset to its initial state (the
    // `resetAll()` effect above runs first — effects fire in declaration order),
    // so `canHandleEvent` tests whether the trait's INITIAL state declares the
    // lifecycle transition. Single-state game boards (`initial: playing`,
    // `INIT -> playing`) DO — their INIT effects (`set @entity.result "none"`,
    // `set @entity.platforms @config.platforms`) seed `traitFieldStatesRef`
    // before any user event, so the first guard read sees the seeded values.
    // Two-state browse behaviors flipped by `prepareSchemaForPreview` to start
    // in their data state typically DON'T handle INIT there, so they are left
    // untouched; if their initial state does handle INIT, firing it is correct.
    // Dispatched through `enqueueAndDrain` — the ONE event path — so INIT's
    // effects run through `executeTransitionEffects` exactly like a user event.
    useEffect(() => {
        const mgr = managerRef.current;
        const inited = initedTraitsRef.current;
        for (const binding of traitBindings) {
            const traitName = binding.trait.name;
            if (inited.has(traitName)) continue;
            const lifecycleEvent = LIFECYCLE_EVENTS.find((evt) =>
                mgr.canHandleEvent(traitName, evt),
            );
            if (lifecycleEvent === undefined) continue;
            inited.add(traitName);
            stateLog.debug('mount:fire-lifecycle', { traitName, event: lifecycleEvent });
            enqueueAndDrain(lifecycleEvent, {});
        }
        return () => {
            // New bindings (page nav) rebuild the manager + reset states, so a
            // re-mounted trait must fire its lifecycle event again.
            initedTraitsRef.current = new Set();
        };
    }, [traitBindings, enqueueAndDrain]);

    return {
        traitStates,
        sendEvent,
        getTraitState,
        canHandleEvent,
    };
}

export default useTraitStateMachine;
