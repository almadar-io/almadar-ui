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

import { useState, useCallback, useEffect, useRef, useMemo, type MutableRefObject } from 'react';
// Use hooks from @almadar/ui
import { useEventBus, useSharedEntityStore, runTickFrame, type SharedEntityWriter } from './index';
import { createLogger, setNamespaceLevel } from '@almadar/logger';
import { isCircuitEvent, walkSExpr } from '@almadar/core';
import type { PatternConfig, ResolvedTraitTick, EventPayload, EntityRow, TraitConfig, SExpr, ServiceParams, ResolvedTrait, FieldValue, EntityFieldWrite, EntityFrameState } from '@almadar/core';
import {
    StateMachineManager,
    EffectExecutor,
    interpolateValue,
    createContextFromBindings,
    createServerEffectHandlers,
    collectDeclaredConfigDefaults,
    normalizeCallSiteConfigToValues,
    createTickScheduler,
    isValidCronExpression,
    parseDurationString,
    type TraitState,
    type TraitDefinition,
    type EffectHandlers,
    type BindingContext,
    type EffectContext,
    type CreateServerEffectHandlersOptions,
} from '@almadar/runtime';
import { evaluate, evaluateGuard, executeEffects, createMinimalContext, type EvaluationContext } from '@almadar/evaluator';
import { createClientEffectHandlers } from '../lib/createClientEffectHandlers';
import type { ResolvedTraitBinding, ResolvedTraitListener } from '../types/runtime-types';
import type { SlotPatternEntry, SlotSource } from '../types/slot-types';
import type { useUISlots, SlotProps } from '../providers/UISlotContext';
import { convertFnFormLambdasInProps } from '../lib/fn-form-lambda';
import { useEntitySchema } from '../providers/EntitySchemaContext';
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
// Per-tick-set firehose: `set:write` fires for every field write of every
// tick, so a running `ticks` loop floods the console. Default its floor to
// WARN; opt back in with setNamespaceLevel('almadar:ui:tick-effects', 'DEBUG').
setNamespaceLevel('almadar:ui:tick-effects', 'WARN');

// Shared-entity seed/map/execute diagnostic. Used when a board's render trait
// reads an empty shared entity at frame 0 or writer/render traits disagree on
// the store key. Off by default; enable with
// setNamespaceLevel('almadar:ui:shared-entity', 'DEBUG').
const sharedEntityLog = createLogger('almadar:ui:shared-entity');
setNamespaceLevel('almadar:ui:shared-entity', 'WARN');

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
// Shared-entity tick folding
//
// A `[shared]` entity's state is co-mutated by several bound traits (each
// contributing writes on its own ticks/transitions) and painted by exactly
// one render trait, instead of each trait holding its own private copy. The
// helpers below classify which bound trait is which, deterministically and
// structurally (never by name), and bridge tick effects into the Phase-5
// primitive (`runTickFrame` / `useSharedEntityStore`, `@almadar/ui`).
// ============================================================================

/** Effect head-operator that writes a field onto a shared entity. */
export const SHARED_ENTITY_WRITE_OPS: ReadonlySet<string> = new Set(['set']);

/** Effect head-operators that paint a shared entity's merged state. */
export const SHARED_ENTITY_RENDER_OPS: ReadonlySet<string> = new Set(['render-ui', 'render']);

/** Every tick + transition effect a trait declares, flattened for a structural scan. */
export function collectAllTraitEffects(trait: ResolvedTrait): SExpr[] {
    return [
        ...trait.ticks.flatMap((t) => t.effects),
        ...trait.transitions.flatMap((t) => t.effects),
    ];
}

/**
 * Does ANY effect in this list call one of `ops` anywhere in its (possibly
 * `do`/`if`/`when`/`let`-nested) tree? Reuses `@almadar/core`'s canonical
 * `walkSExpr` rather than a bespoke recursive walk, and looks only at the
 * effect's head operator — a structural presence check, no name-matching.
 */
export function effectsCallOp(effects: SExpr[], ops: ReadonlySet<string>): boolean {
    for (const effect of effects) {
        let found = false;
        walkSExpr(effect, (node) => {
            if (!found && Array.isArray(node) && typeof node[0] === 'string' && ops.has(node[0])) {
                found = true;
            }
        });
        if (found) return true;
    }
    return false;
}

/** Classify one tick's effects for shared-entity scheduling. */
export function classifySharedTick(tick: ResolvedTraitTick): 'writer' | 'renderer' | 'both' | 'neither' {
    const writes = effectsCallOp(tick.effects, SHARED_ENTITY_WRITE_OPS);
    const renders = effectsCallOp(tick.effects, SHARED_ENTITY_RENDER_OPS);
    if (writes && renders) return 'both';
    if (writes) return 'writer';
    if (renders) return 'renderer';
    return 'neither';
}

/** One shared entity's bound traits, classified by what their effects do. */
interface SharedEntityGroup {
    /** `${orbital}::${entityName}` — this group's key in the shared-entity store. */
    storeKey: string;
    entityName: string;
    /** Bindings whose ticks/transitions write (`set @entity.X`) onto this entity, in binding order. */
    writerBindings: ResolvedTraitBinding[];
    /** Bindings whose ticks/transitions paint (`render-ui`) this entity's merged state. */
    renderBindings: ResolvedTraitBinding[];
    /** Declared per-field defaults (`x: number = 0`) — the frame-0 seed for the shared store. */
    defaults?: EntityRow;
}

/**
 * Build one writer trait's tick into a synchronous `SharedEntityWriter`
 * (`(scratch) => writes[]`) so `runTickFrame` can fold several writer ticks
 * into one merged commit, in binding order.
 *
 * `runTickFrame`'s writer contract is synchronous, but `@almadar/runtime`'s
 * `EffectExecutor` is inherently async (`executeAll`'s `for...of await`
 * sequencing only guarantees the FIRST top-level effect lands before a
 * fire-and-forget caller reads the result back — everything after the first
 * `await` boundary would be silently dropped). `@almadar/evaluator`'s
 * `executeEffects` is fully synchronous end-to-end (its `set`/`do`/`if`/
 * `when`/`let` dispatch never awaits), so it — not `EffectExecutor` — is the
 * correct tool here; `ctx.mutateEntity` captures each write instead of
 * applying it through a handler.
 */
export function createSharedEntityWriter(
    binding: ResolvedTraitBinding,
    tick: ResolvedTraitTick,
    traitStatesRef: MutableRefObject<Map<string, TraitState>>,
    emit: (event: string, payload?: EventPayload) => void,
): SharedEntityWriter {
    return (scratch: EntityFrameState): readonly EntityFieldWrite[] => {
        const traitName = binding.trait.name;
        const currentState = traitStatesRef.current.get(traitName)?.currentState ?? '';

        // appliesTo: empty array means fire in all states (same contract runTickEffects uses).
        if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return [];

        // A fresh mutable copy of this frame's running scratch — never the
        // shared store's own committed object — so a later same-frame writer
        // trait's `writer(scratch)` call sees this write (ordered live-read)
        // without this trait mutating anyone else's reference.
        const scratchEntity: EntityRow = { ...scratch };
        const writes: EntityFieldWrite[] = [];
        const ctx: EvaluationContext = createMinimalContext(scratchEntity, {}, currentState);
        const declaredDefaults = collectDeclaredConfigDefaults(binding.trait);
        const callSiteConfig = getBindingConfig(binding);
        if (declaredDefaults || callSiteConfig) {
            ctx.config = { ...(declaredDefaults ?? {}), ...(callSiteConfig ?? {}) } as TraitConfig;
        }
        // `evalSet` (the canonical `set` operator implementation) writes
        // through `ctx.mutateEntity` — capture the write for `runTickFrame`
        // AND apply it to `scratchEntity` so a later expression in the SAME
        // tick (e.g. a second `set` reading the first's result) sees it.
        // `changes`' values come back as `FieldValue` — the interpreter's
        // canonical evaluator never yields anything else for a `set` target.
        ctx.mutateEntity = (changes) => {
            for (const [field, value] of Object.entries(changes)) {
                const fieldValue = value as FieldValue;
                scratchEntity[field] = fieldValue;
                writes.push({ field, value: fieldValue });
            }
        };
        ctx.emit = (event, payload) => {
            emit(event, payload as EventPayload | undefined);
        };

        if (tick.guard !== undefined && !evaluateGuard(tick.guard, ctx)) {
            tickLog.debug('guard-blocked', { traitName, tick: tick.name, state: currentState });
            return [];
        }

        executeEffects(tick.effects, ctx);
        return writes;
    };
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
    navigate?: (path: string, params?: Record<string, string>) => void;
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
    callService?: (service: string, action: string, params?: ServiceParams) => Promise<EventPayload>;
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

/**
 * Evaluate a shared-entity field default when it is authored as a .lolo
 * S-expression (e.g. `(array/flatten (array/map ...))`). The compiled path
 * evaluates these defaults once before seeding the shared entity; the runtime
 * path must do the same so render traits read concrete values at frame 0.
 */
/**
 * Return the effective call-site config values for a binding.
 * The raw `.orb` call-site config stores annotated field declarations
 * (`{ type, default, label, ... }`); the runtime binding context expects
 * plain values, so we extract `.default` from declarations and pass plain
 * values through. Declared defaults are already plain values from
 * `collectDeclaredConfigDefaults`.
 */
function getBindingConfig(binding: ResolvedTraitBinding): TraitConfig | undefined {
    const raw = binding.config;
    const normalized = normalizeCallSiteConfigToValues(raw);
    sharedEntityLog.debug('getBindingConfig', { traitName: binding.trait.name, rawKeys: raw ? Object.keys(raw) : undefined, hasTiles: raw ? 'tiles' in raw : false });
    return normalized;
}

function evalFieldDefault(value: FieldValue): FieldValue {
    if (!Array.isArray(value) || value.length === 0) return value;
    const head = value[0];
    const isSExpr =
        typeof head === 'string' &&
        (head.includes('/') || head === 'let' || head === 'if' || head === 'lambda');
    if (!isSExpr) return value;
    try {
        return evaluate(value as SExpr, createMinimalContext({}, {}, '')) as FieldValue;
    } catch {
        return value;
    }
}

export function useTraitStateMachine(
    traitBindings: ResolvedTraitBinding[],
    uiSlots: ReturnType<typeof useUISlots>,
    options?: UseTraitStateMachineOptions
): TraitStateMachineResult {
    sharedEntityLog.debug('useTraitStateMachine start', { traitBindingsCount: traitBindings.length, traitNames: traitBindings.map((b) => b.trait.name) });
    const eventBus = useEventBus();
    const { entities } = useEntitySchema();
    // Mirrors OrbitalServerRuntime's setTraitConfig loop so the client-side
    // guard evaluator sees @config.X. Page-level bindings often arrive with
    // config undefined; the caller's `traitConfigsByName` map (built from the
    // orbital schema) backfills the missing entries.
    const traitConfigsByName = options?.traitConfigsByName;
    const orbitalsByTrait = options?.orbitalsByTrait;

    // One shared-entity store per running orbital instance (stable across
    // re-renders — see `useSharedEntityStore`'s own ref-backed-instance
    // pattern). Every `[shared]` entity on this page's traits lives here,
    // keyed by `${orbital}::${entityName}`.
    const sharedEntityStore = useSharedEntityStore();

    // Group trait bindings by shared entity, classified deterministically by
    // which effect operators their ticks/transitions call — never by name.
    // Non-shared entities produce no group at all, so they fall straight
    // through to today's per-trait path everywhere below.
    const sharedGroups = useMemo<Map<string, SharedEntityGroup>>(() => {
        const groups = new Map<string, SharedEntityGroup>();
        for (const binding of traitBindings) {
            const linkedEntityName = binding.linkedEntity ?? binding.trait.linkedEntity;
            if (!linkedEntityName) continue;
            const entityDef = entities.get(linkedEntityName);
            if (!entityDef?.shared) continue;
            const orbitalName = orbitalsByTrait?.[binding.trait.name] ?? '';
            const storeKey = `${orbitalName}::${linkedEntityName}`;
            let group = groups.get(storeKey);
            if (!group) {
                // Per-field declared defaults (`x: number = 0`) — the shared
                // entity's frame-0 seed, read the same way the compiled path
                // reads `OirField.default`.
                let defaults: EntityRow | undefined;
                for (const field of entityDef.fields) {
                    if (field.default !== undefined && field.default !== null) {
                        const evaluated = evalFieldDefault(field.default as FieldValue);
                        if (field.name === 'tiles') {
                            sharedEntityLog.debug('seed tiles', {
                                linkedEntityName,
                                type: typeof evaluated,
                                length: Array.isArray(evaluated) ? (evaluated as FieldValue[])?.length : undefined,
                                head: Array.isArray(evaluated) && evaluated.length > 0 ? JSON.stringify((evaluated as FieldValue[])[0]).slice(0, 80) : undefined,
                            });
                        }
                        (defaults ??= {})[field.name] = evaluated;
                    }
                }
                group = { storeKey, entityName: linkedEntityName, writerBindings: [], renderBindings: [], defaults };
                groups.set(storeKey, group);
            }
            const allEffects = collectAllTraitEffects(binding.trait);
            if (effectsCallOp(allEffects, SHARED_ENTITY_WRITE_OPS)) group.writerBindings.push(binding);
            if (effectsCallOp(allEffects, SHARED_ENTITY_RENDER_OPS)) group.renderBindings.push(binding);
        }
        return groups;
    }, [traitBindings, entities, orbitalsByTrait]);

    // Seed each shared entity's store from its declared field defaults so the
    // render trait reads those defaults at frame 0 (before any writer tick),
    // matching the compiled path. Idempotent + no-notify — safe during render.
    for (const group of sharedGroups.values()) {
        if (group.defaults) {
            sharedEntityStore.seed(group.storeKey, group.defaults);
            sharedEntityLog.debug('shared-seed', {
                storeKey: group.storeKey,
                writers: group.writerBindings.map((b) => b.trait.name),
                renderers: group.renderBindings.map((b) => b.trait.name),
                tilesLength: Array.isArray(group.defaults.tiles) ? group.defaults.tiles.length : group.defaults.tiles,
            });
        }
    }

    // Trait name -> shared-entity store key. Consulted by the ONE execution
    // path (`executeTransitionEffects`, shared by the event and tick loops)
    // to decide whether `@entity` sources from the shared store instead of
    // the per-trait `traitFieldStatesRef`. Ref-backed so callbacks read the
    // current value without depending on (and retriggering on) it directly —
    // mirrors `traitBindingsRef` / `managerRef` below.
    const sharedKeyByTraitNameRef = useRef<Map<string, string>>(new Map());
    useEffect(() => {
        const map = new Map<string, string>();
        for (const group of sharedGroups.values()) {
            for (const binding of group.writerBindings) map.set(binding.trait.name, group.storeKey);
            for (const binding of group.renderBindings) map.set(binding.trait.name, group.storeKey);
        }
        sharedKeyByTraitNameRef.current = map;
        sharedEntityLog.debug('shared-map', { map: Array.from(map.entries()).map(([k, v]) => `${k}->${v}`) });
    }, [sharedGroups]);

    const manager = useMemo(() => {
        const traitDefs = traitBindings.map(toTraitDefinition);
        const m = new StateMachineManager(traitDefs);
        for (const binding of traitBindings) {
            const cfg = getBindingConfig(binding) ?? traitConfigsByName?.[binding.trait.name];
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
        effects: SExpr[];
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

        // A `[shared]` entity's live row lives in the shared-entity store,
        // keyed by entity (not trait) — every trait bound to it reads/writes
        // the SAME row, whether the effects run from a tick or an event.
        // Non-shared traits are byte-for-byte unchanged: `liveEntity` is still
        // the per-trait `traitFieldStatesRef` object below.
        const sharedKey = sharedKeyByTraitNameRef.current.get(traitName);
        if (traitName === 'Hero' || traitName === 'Authority') {
            sharedEntityLog.debug('executeTransitionEffects sharedKey', { traitName, sharedKey, storeTilesLength: sharedKey ? (sharedEntityStore.getSnapshot(sharedKey).tiles as FieldValue[])?.length : undefined });
        }

        // ONE live `[runtime]`-entity store per trait (or, for a `[shared]`
        // entity, one live row per entity shared across its bound traits).
        // The canonical client `set` (createClientEffectHandlers) writes
        // through to THIS object, the executor reads `@entity.*` from it
        // during the same `executeAll`, and the next tick + guards seed from
        // it — no detached binding clone, no guard-vs-render split.
        let liveEntity: EntityRow;
        if (sharedKey !== undefined) {
            // Fresh mutable copy of the CURRENT committed snapshot — mutating
            // it directly would let this trait's in-flight write leak into
            // other readers before the explicit commit below.
            liveEntity = { ...sharedEntityStore.getSnapshot(sharedKey) };
        } else {
            let existing = traitFieldStatesRef.current.get(traitName);
            if (!existing) {
                existing = {} as EntityRow;
                traitFieldStatesRef.current.set(traitName, existing);
            }
            liveEntity = existing;
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
                    if (traitName === 'Hero' && slot === 'main' && props && typeof props === 'object') {
                        const canvasChild = Array.isArray(props.children) ? props.children[0] : null;
                        const grandChildren =
                            canvasChild && typeof canvasChild === 'object' && !Array.isArray(canvasChild)
                                ? (canvasChild as Record<string, FieldValue | undefined>).children
                                : null;
                        const firstLayer = Array.isArray(grandChildren) && grandChildren.length > 0 ? grandChildren[0] : null;
                        const firstLayerItems =
                            firstLayer && typeof firstLayer === 'object' && !Array.isArray(firstLayer)
                                ? (firstLayer as Record<string, FieldValue | undefined>).items
                                : null;
                        sharedEntityLog.debug('render-ui main slot', {
                            traitName,
                            slot,
                            canvasChildType:
                                canvasChild && typeof canvasChild === 'object' && !Array.isArray(canvasChild)
                                    ? (canvasChild as Record<string, FieldValue | undefined>).type
                                    : 'none',
                            firstLayerItemsLength: Array.isArray(firstLayerItems) ? firstLayerItems.length : firstLayerItems,
                        });
                    }
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
            const sharedResolved = traitConfigsByName?.[traitName];
            const sharedCallSite = getBindingConfig(binding);
            if (sharedDeclared || sharedResolved || sharedCallSite) {
                sharedBindings.config = {
                    ...(sharedDeclared ?? {}),
                    ...(sharedResolved ?? {}),
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
                // @almadar/runtime callService types params:unknown/Promise<unknown> — should be ServiceParams/EventPayload (upstream fix queued)
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
        // `declaredDefaults` reads the trait's OWN declared config schema
        // verbatim — for an embedded sub-trait authored as `config { fields:
        // @config.fields }` (e.g. std-browse's `DataGrid1`), that default IS
        // the literal forward string, since the atom's `.lolo` meant "read
        // MY embedder's config" and has no enclosing scope once flattened.
        // `traitConfigsByName` (built in OrbPreview from the same source
        // config) chains that forward through `collectEmbeddedTraitReferrers`
        // to the trait that actually embeds this one, so prefer it over the
        // raw declared defaults when present — it's a strict superset (same
        // keys, forwards substituted with concrete values where resolvable).
        const declaredDefaults = collectDeclaredConfigDefaults(binding.trait);
        const resolvedDefaults = traitConfigsByName?.[traitName];
        const callSiteConfig = getBindingConfig(binding);
        if (declaredDefaults || resolvedDefaults || callSiteConfig) {
            bindingCtx.config = {
                ...(declaredDefaults ?? {}),
                ...(resolvedDefaults ?? {}),
                ...(callSiteConfig ?? {}),
            } as TraitConfig;
        }
        if (traitName === 'Authority' || traitName === 'Hero') {
            sharedEntityLog.debug('executeTransitionEffects config tiles', {
                traitName,
                tilesType: typeof bindingCtx.config?.tiles,
                tilesLength: Array.isArray(bindingCtx.config?.tiles) ? (bindingCtx.config?.tiles as FieldValue[])?.length : undefined,
                configKeys: bindingCtx.config ? Object.keys(bindingCtx.config) : undefined,
            });
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

        if (traitName === 'Hero') {
            sharedEntityLog.debug('executeTransitionEffects effects summary', {
                traitName,
                effectsCount: effects.length,
                hasRenderUI: typeof handlers.renderUI === 'function',
                effectHeads: effects.map((e) => Array.isArray(e) ? String(e[0]) : '??'),
            });
        }
        const executor = new EffectExecutor({ handlers: trackingHandlers, bindings: bindingCtx, context: effectContext });

        void slotSource;
        try {
            await executor.executeAll(effects);
            if (traitName === 'Authority' || traitName === 'Hero') {
                sharedEntityLog.debug('executeTransitionEffects after executeAll', {
                    traitName,
                    tilesType: typeof liveEntity.tiles,
                    tilesLength: Array.isArray(liveEntity.tiles) ? (liveEntity.tiles as FieldValue[])?.length : undefined,
                    firstTilePos: Array.isArray(liveEntity.tiles) && liveEntity.tiles.length > 0 ? JSON.stringify((liveEntity.tiles as FieldValue[])[0]).slice(0, 120) : undefined,
                });
            }

            // Commit this trait's mutated view of a `[shared]` entity back to
            // the shared store — the ONLY point that notifies subscribers, so
            // the render trait's own render-ui (below, or its own tick) is
            // what paints, not this write. Non-shared traits skip this: their
            // mutation already lives in `traitFieldStatesRef` (the SAME object
            // `liveEntity` is, so nothing further to commit).
            if (sharedKey !== undefined) {
                sharedEntityStore.commit(sharedKey, liveEntity);
            }

            log.debug('effects:executed', () => ({
                traitName,
                transition: `${previousState}->${newState}`,
                event: flushEvent,
                effectCount: effects.length,
                emitted: emittedDuringExec.join(','),
                entityAfter: JSON.stringify(liveEntity ?? {}),
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
    }, [eventBus, flushSlot, sharedEntityStore]);

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
        // guards see the advancing values, not `{}`. A trait bound to a
        // `[shared]` entity reads the shared store's current snapshot here
        // instead of `traitFieldStatesRef` (which stays empty for it) —
        // matters for a render trait whose OWN tick carries a guard.
        if (tick.guard !== undefined) {
            const sharedKey = sharedKeyByTraitNameRef.current.get(traitName);
            const entity = sharedKey !== undefined
                ? sharedEntityStore.getSnapshot(sharedKey)
                : (traitFieldStatesRef.current.get(traitName) ?? ({} as EntityRow));
            const guardCtx: BindingContext = {
                entity,
                payload: {},
                state: currentState,
            };
            const bindingCfg = getBindingConfig(binding) ?? traitConfigsByName?.[traitName];
            if (bindingCfg) {
                guardCtx.config = bindingCfg;
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
    }, [executeTransitionEffects, sharedEntityStore]);

    // The emit side of a shared-entity writer tick (see
    // `createSharedEntityWriter`) — mirrors `createClientEffectHandlers`'s
    // `emit` (UI: prefixing) so a writer's `(emit ...)` behaves identically
    // to the render/event path's.
    const emitFromSharedWriter = useCallback((event: string, payload?: EventPayload) => {
        const prefixedEvent = event.startsWith('UI:') ? event : `UI:${event}`;
        eventBus.emit(prefixedEvent, payload);
    }, [eventBus]);

    /**
     * One coalesced tick clock for every binding's ticks — frame-interval
     * ("every pass") and numeric-ms ticks alike — via the shared
     * `@almadar/runtime` `TickScheduler`. Replaces two separate loops (a RAF
     * pass for frame ticks, one `setInterval` per numeric-ms tick) with a
     * single accumulator so ticks due in the same pass fire together instead
     * of on independent, uncoordinated timers. Re-built when bindings change.
     *
     * A `[shared]` entity's WRITER ticks are the one exception: they're
     * pulled out of the per-trait loop below and folded through ONE
     * `runTickFrame` driver per (shared entity, tick interval) so N writer
     * ticks due on the same pass produce exactly one merged commit, in
     * binding order — instead of N independent per-trait writes. Everything
     * else (non-shared traits, and a shared entity's render trait) keeps
     * today's exact per-trait registration; `executeTransitionEffects` is
     * what redirects a render trait's `@entity` to the shared store.
     */
    useEffect(() => {
        const scheduler = createTickScheduler();

        // Per-tick classification for shared entities. A tick is scheduled
        // through runTickFrame ONLY when it is a pure writer (set, no render-ui).
        // Ticks that paint (render-ui/render) must run through the full
        // EffectExecutor path (runTickEffects) so their render-ui handler is
        // wired; ticks that do both are also routed through runTickEffects
        // because it handles set + render-ui correctly.
        const pureWriterTickKeys = new Set<string>();
        for (const group of sharedGroups.values()) {
            const ticksByInterval = new Map<string, Array<{ binding: ResolvedTraitBinding; tick: ResolvedTraitTick }>>();
            for (const binding of group.writerBindings) {
                for (const tick of binding.trait.ticks ?? []) {
                    const classification = classifySharedTick(tick);
                    if (classification !== 'writer') continue;
                    pureWriterTickKeys.add(`${binding.trait.name}::${tick.name}`);
                    const intervalKey = String(tick.interval);
                    const entries = ticksByInterval.get(intervalKey) ?? [];
                    entries.push({ binding, tick });
                    ticksByInterval.set(intervalKey, entries);
                }
            }
            for (const entries of ticksByInterval.values()) {
                const interval = entries[0].tick.interval;
                const onDue = () => {
                    const writers = entries.map(({ binding, tick }) =>
                        createSharedEntityWriter(binding, tick, traitStatesRef, emitFromSharedWriter),
                    );
                    runTickFrame(group.storeKey, writers, sharedEntityStore);
                };
                if (interval === 'frame') {
                    scheduler.add(0, onDue);
                } else if (typeof interval === 'number') {
                    scheduler.add(interval, onDue);
                } else if (isValidCronExpression(interval)) {
                    scheduler.addCron(interval, onDue);
                } else {
                    scheduler.add(parseDurationString(interval), onDue);
                }
            }
        }

        for (const binding of traitBindings) {
            for (const tick of binding.trait.ticks ?? []) {
                // Shared-entity pure writer ticks are already folded through runTickFrame above.
                const sharedKey = sharedKeyByTraitNameRef.current.get(binding.trait.name);
                if (sharedKey !== undefined && pureWriterTickKeys.has(`${binding.trait.name}::${tick.name}`)) {
                    continue;
                }
                if (tick.interval === 'frame') {
                    scheduler.add(0, () => runTickEffects(tick, binding));
                } else if (typeof tick.interval === 'number') {
                    scheduler.add(tick.interval, () => runTickEffects(tick, binding));
                } else if (isValidCronExpression(tick.interval)) {
                    scheduler.addCron(tick.interval, () => runTickEffects(tick, binding));
                } else {
                    // Not 'frame', not a number, not a valid cron expression —
                    // must be a duration string ('5s'/'1m'/'1h'). Throws
                    // loudly if it's none of the above, rather than the old
                    // `as number` cast silently producing NaN (which
                    // TickScheduler's `add()` then busy-fired on every pass).
                    scheduler.add(parseDurationString(tick.interval), () => runTickEffects(tick, binding));
                }
            }
        }

        return () => scheduler.stopAll();
    }, [traitBindings, runTickEffects, sharedGroups, sharedEntityStore, emitFromSharedWriter]);

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
                        const payloadData = payload?.data;
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
                    // upstream gap: /runtime TransitionResult.effects is unknown[] — they are SExpr at runtime (see Almadar_UI_Gaps.md)
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
                // upstream gap: /runtime TransitionResult.effects is unknown[] — they are SExpr at runtime (see Almadar_UI_Gaps.md)
                const effectTraces: EffectTrace[] = result.effects.map(
                    (e: SExpr): EffectTrace => {
                        if (Array.isArray(e)) {
                            return {
                                type: String(e[0] ?? 'unknown'),
                                args: e.slice(1),
                                status: 'executed' as const,
                            };
                        }
                        return {
                            type: String(e),
                            args: [],
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
                listens: listens.map((l) => {
                  const src = l.source;
                  const t = src && src.kind !== 'any' ? src.trait : '?';
                  return `${t}.${l.event}->${l.triggers}`;
                }).join(','),
            });
            for (const listen of listens) {
                const src = listen.source;
                const sourceTrait = src && src.kind !== 'any' ? src.trait : undefined;
                if (!sourceTrait) continue; // wildcard listens are out-of-scope post-unification
                const sourceOrbital = (src?.kind === 'orbital' ? src.orbital : undefined) ?? ownOrbital;
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
    // event kind. `StateMachineManager.sendEvent` dispatches the event to EVERY
    // managed trait, so firing it per-trait would enqueue N lifecycle events for
    // N traits — each processing all N traits. Behaviors with many inline render
    // atoms (e.g. std-approval-request) then explode into N² self-loop transitions
    // and freeze the page. Collect the set of lifecycle events handled by any
    // trait in the current bindings and fire each once.
    useEffect(() => {
        const mgr = managerRef.current;
        const eventsToFire = new Set<string>();
        for (const binding of traitBindings) {
            const traitName = binding.trait.name;
            const lifecycleEvent = LIFECYCLE_EVENTS.find((evt) =>
                mgr.canHandleEvent(traitName, evt),
            );
            if (lifecycleEvent !== undefined) {
                eventsToFire.add(lifecycleEvent);
            }
        }
        for (const event of eventsToFire) {
            stateLog.debug('mount:fire-lifecycle', { event, traitCount: traitBindings.length });
            enqueueAndDrain(event, {});
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
