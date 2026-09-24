/**
 * useTraitStateMachine — W5b thin React adapter (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * The client's copy of "play this event against this orbital" no longer
 * lives here. It is `@almadar/runtime`'s client-role composition
 * (`createClientKernel`/`dispatchWithServerLeg`/`applyOrbitalEventResponse`
 * — the JS twin of `orbital-client`'s `ClientKernel`), the SAME
 * `evaluateOrbitalEvent` every stateful/stateless server host runs. This
 * hook is a composer over the single-purpose adapters in `hooks/circuit/`:
 *
 * - `useCircuitKernel`  — the store + trait index + client kernel
 * - `useBusIngress`     — bus key → `dispatchAndSettle`
 * - `useSlotFlush`      — kernel outcome client effects → UI slots
 * - `useCallsiteCapture`— `@trait.X`-embedded child re-render
 * - `useClientTicks`    — ticks while the client holds state
 * - `useEntityBindingSource` — the render-time binding surface
 *
 * `commitServerEntity`/`applyServerStates` are GONE from the public return:
 * they existed only to patch around the old two-bus-hop echo problem
 * (G-RUNTIME-022/026 fixes) — `postServerLeg`/`applyOrbitalEventResponse`
 * fold the server's response in-process, with no bus round-trip to patch
 * around. `OrbPreview` (their only caller) no longer needs them.
 *
 * @packageDocumentation
 */
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type {
  EntityRow,
  EventPayload,
  OrbitalDefinition,
  ResolvedTraitBinding,
  ServiceParams,
  TraitConfig,
  UserContext,
} from '@almadar/core';
import { LIFECYCLE_EVENTS, type EventTransport, type PersistenceAdapter, type TraitState } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import { useEventBus } from './useEventBus';
import { useUser } from '../providers/UserContext';
import type { EntityBindingSource } from '../providers/EntityBindingContext';
import { ALL_SLOTS } from './useUISlots';
import { registerTrait, unregisterTrait, type TraitDebugInfo } from '../lib/traitRegistry';
import { bindTraitStateGetter, registerTraitSnapshot } from '../lib/verificationRegistry';
import { createCircuitVerificationObserver } from '../lib/circuitVerificationObserver';
import type { TraitStateSnapshot } from '@almadar/core';
import type { useUISlots } from '../providers/UISlotContext';
import { useCircuitKernel } from './circuit/useCircuitKernel';
import { useBusIngress } from './circuit/useBusIngress';
import { useSlotFlush } from './circuit/useSlotFlush';
import { useCallsiteCapture } from './circuit/useCallsiteCapture';
import { useClientTicks } from './circuit/useClientTicks';
import { useEntityBindingSource } from './circuit/useEntityBindingSource';

const stateLog = createLogger('almadar:ui:state-transitions');

/** Trait names present in `prev` but absent from `next` — used to clear a
 *  dropped trait's stale slot content on page nav (unchanged pure helper,
 *  see `trait-binding-slot-cleanup.test.ts`). */
export function diffDroppedTraitNames(
  prev: ReadonlySet<string>,
  next: ReadonlySet<string>,
): string[] {
  const dropped: string[] = [];
  for (const name of prev) {
    if (!next.has(name)) dropped.push(name);
  }
  return dropped;
}

function normalizeEventKey(eventKey: string): string {
  return eventKey.startsWith('UI:') ? eventKey.slice(3) : eventKey;
}

export interface TraitStateMachineResult {
  /** Current state for each trait. */
  traitStates: Map<string, TraitState>;
  /** Send an event — broadcasts to every currently-mounted trait that can
   *  handle it, decomposed into one targeted `kernel.dispatch` per trait
   *  (the client role requires exactly one seed trait per call). */
  sendEvent: (eventKey: string, payload?: EventPayload) => void;
  getTraitState: (traitName: string) => TraitState | undefined;
  canHandleEvent: (traitName: string, eventKey: string) => boolean;
  /** Live per-trait binding surface for `EntityBindingContext`. */
  entityBindingSource: EntityBindingSource;
}

export interface UseTraitStateMachineOptions {
  onEventProcessed?: (eventKey: string, payload?: EventPayload) => void;
  navigate?: (path: string, params?: Record<string, string>, crumb?: string) => void;
  navigateBack?: () => void;
  initPayload?: EventPayload;
  /** The mounted page's identity; with `initPayload` it keys the once-per-mount lifecycle guard (Runtime Spec Clause 4.1). */
  mountKey?: string;
  /** The resolved schema's full orbital set — `buildTraitIndex`'s one input. */
  orbitals: readonly OrbitalDefinition[];
  /** Caller-owned transport (server bridge). Omitted + `persistence` set =
   *  offline preview (plan G7); omitted + no `persistence` = fully local,
   *  nothing ever posts. */
  transport?: EventTransport;
  carriesCircuitState?: boolean;
  /** Hold every dispatch until the transport's topology is known. */
  awaitTopology?: boolean;
  persistence?: PersistenceAdapter;
  callService?: (service: string, action: string, params?: ServiceParams) => Promise<EventPayload>;
  traitConfigsByName?: Record<string, TraitConfig>;
  embeddedTraits?: ReadonlySet<string>;
  callsiteCaptureChildrenByTrait?: ReadonlyMap<string, ReadonlySet<string>>;
  debug?: boolean;
  logContext?: { behavior?: string; orbitalName?: string };
  /** Explicit viewer override (e.g. a persona switcher's picked identity
   *  threaded down as a prop rather than through `UserContext`). Wins over
   *  `useUser()`'s context value when supplied. */
  user?: UserContext;
}

export function useTraitStateMachine(
  traitBindings: ResolvedTraitBinding[],
  uiSlots: ReturnType<typeof useUISlots>,
  options: UseTraitStateMachineOptions,
): TraitStateMachineResult {
  const eventBus = useEventBus();
  const { user: contextViewer } = useUser();
  const userContext = (options.user ?? contextViewer ?? undefined) as UserContext | undefined;

  const observer = useMemo(() => createCircuitVerificationObserver(), []);

  const { kernel, store, traitIndex } = useCircuitKernel(traitBindings, {
    orbitals: options.orbitals,
    ...(options.traitConfigsByName !== undefined ? { traitConfigsByName: options.traitConfigsByName } : {}),
    ...(options.transport !== undefined ? { transport: options.transport } : {}),
    ...(options.carriesCircuitState !== undefined ? { carriesCircuitState: options.carriesCircuitState } : {}),
    ...(options.awaitTopology !== undefined ? { awaitTopology: options.awaitTopology } : {}),
    ...(options.persistence !== undefined ? { persistence: options.persistence } : {}),
    ...(options.callService !== undefined ? { callService: options.callService } : {}),
    ...(userContext !== undefined ? { user: userContext } : {}),
    ...(options.debug !== undefined ? { debug: options.debug } : {}),
    ...(options.logContext !== undefined ? { logContext: options.logContext } : {}),
    observer,
  });

  const slotFlush = useSlotFlush(uiSlots, options.embeddedTraits);

  const reRenderCallsiteCaptureChildren = useCallsiteCapture(traitBindings, store, traitIndex, slotFlush, {
    ...(options.callsiteCaptureChildrenByTrait !== undefined ? { callsiteCaptureChildrenByTrait: options.callsiteCaptureChildrenByTrait } : {}),
    eventBus,
    ...(options.navigate !== undefined ? { navigate: options.navigate } : {}),
    ...(options.navigateBack !== undefined ? { navigateBack: options.navigateBack } : {}),
    ...(userContext !== undefined ? { user: userContext } : {}),
  });

  useClientTicks(traitBindings, store, traitIndex, {
    eventBus,
    slotFlush,
    ...(options.traitConfigsByName !== undefined ? { traitConfigsByName: options.traitConfigsByName } : {}),
    ...(options.navigate !== undefined ? { navigate: options.navigate } : {}),
    ...(options.navigateBack !== undefined ? { navigateBack: options.navigateBack } : {}),
    ...(userContext !== undefined ? { user: userContext } : {}),
  });

  const entityBindingSource = useEntityBindingSource(store, traitIndex);

  // Traits mounted on THIS page (`useSlotFlush.applyClientEffects`'s
  // off-page filter, Gap #11). Ref-backed so a late-settling dispatch is
  // judged against whichever page is ACTUALLY active when its response
  // lands (same reasoning `OrbPreview`'s own `activeTraitNamesRef` used to
  // apply, now generalized here since the composer owns every dispatch).
  const activeTraitNamesRef = useRef<ReadonlySet<string>>(new Set());
  useEffect(() => {
    activeTraitNamesRef.current = new Set(traitIndex.byName.keys());
  }, [traitIndex]);

  // Register/unregister the per-trait debug registry + verification
  // snapshot getters on every bindings change (page nav) — unchanged in
  // intent from the pre-adapter hook, now reading `store.manager` instead
  // of a hook-local manager ref.
  useEffect(() => {
    const ids: string[] = [];
    for (const binding of traitBindings) {
      const trait = binding.trait;
      const state = store.manager.getState(trait.name);
      const info: TraitDebugInfo = {
        id: trait.name,
        name: trait.name,
        currentState: state?.currentState ?? trait.states[0]?.name ?? 'unknown',
        states: trait.states.map((s: { name: string }) => s.name),
        transitions: trait.transitions.flatMap((t) => {
          const froms = Array.isArray(t.from) ? t.from : [t.from];
          return froms.map((f) => ({ from: f, to: t.to, event: t.event, guard: t.guard ? String(t.guard) : undefined }));
        }),
        guards: trait.transitions.filter((t) => t.guard).map((t) => ({ name: String(t.guard) })),
        transitionCount: 0,
      };
      registerTrait(info);
      ids.push(trait.name);
    }
    bindTraitStateGetter((traitName) => store.manager.getState(traitName)?.currentState);
    // The trait's live frame under its entity's name — what a verifier reads to
    // see the entity the trait holds (riya: the body's seeded skateCurve).
    const snapshotData = (traitName: string): Record<string, EntityRow[]> => {
      const entry = traitIndex.byName.get(traitName);
      const frame = entry !== undefined ? store.frames.get(entry.frameKey) : undefined;
      const entityName = entry?.entity.name;
      return frame !== undefined && entityName !== undefined ? { [entityName]: [{ ...frame }] } : {};
    };
    const snapshotUnregs = traitBindings.map((binding) => registerTraitSnapshot(binding.trait.name, (): TraitStateSnapshot => {
      const currentState = store.manager.getState(binding.trait.name)?.currentState ?? binding.trait.states[0]?.name ?? 'unknown';
      return {
        traitName: binding.trait.name,
        currentState,
        states: binding.trait.states.map((s) => s.name),
        events: binding.trait.events.map((e) => e.key),
        data: snapshotData(binding.trait.name),
        cascadeReceived: [],
      };
    }));
    return () => {
      for (const id of ids) unregisterTrait(id);
      for (const unreg of snapshotUnregs) unreg();
    };
  }, [traitBindings, store, traitIndex]);

  const dispatchAndSettle = useCallback(async (traitName: string, eventKey: string, payload: EventPayload | undefined, tick?: string): Promise<void> => {
    const entityId = typeof payload?.entityId === 'string' ? payload.entityId : undefined;
    const outcome = await kernel.dispatch({
      event: eventKey,
      ...(payload !== undefined ? { payload } : {}),
      ...(entityId !== undefined ? { entityId } : {}),
      ...(tick !== undefined ? { tick } : {}),
      targetTrait: traitName,
    });
    slotFlush.applyClientEffects(
      outcome.response.clientEffects ?? [],
      outcome.response.clientEffectsByTrait,
      options.navigate,
      options.navigateBack,
      activeTraitNamesRef.current,
    );
    // The kernel already delivered these to its own listeners; republish for
    // bus subscribers outside it (providers, components, other hook instances).
    for (const emitted of outcome.response.emittedEvents) {
      eventBus.emit(`UI:${emitted.event}`, emitted.payload, { ...(emitted.source ?? {}), dispatched: true });
    }
    stateLog.debug('dispatch:settled', { traitName, eventKey, mode: outcome.mode, transitioned: outcome.response.transitioned });
    if (outcome.response.transitioned) {
      const entityByTrait: Record<string, EntityRow> = {};
      for (const [name, entry] of traitIndex.byName) {
        const row = store.frames.get(entry.frameKey);
        if (row !== undefined) entityByTrait[name] = row;
      }
      await reRenderCallsiteCaptureChildren(traitName, payload ?? {}, entityByTrait);
    }
    options.onEventProcessed?.(eventKey, payload);
  }, [kernel, slotFlush, traitIndex, store, eventBus, reRenderCallsiteCaptureChildren, options.navigate, options.navigateBack, options.onEventProcessed]);

  useBusIngress(traitBindings, traitIndex, dispatchAndSettle, eventBus);

  const sendEvent = useCallback((eventKey: string, payload?: EventPayload): void => {
    const normalized = normalizeEventKey(eventKey);
    for (const [traitName] of traitIndex.byName) {
      if (!store.manager.canHandleEvent(traitName, normalized)) continue;
      void dispatchAndSettle(traitName, normalized, payload);
    }
  }, [traitIndex, store, dispatchAndSettle]);

  const getTraitState = useCallback((traitName: string) => store.manager.getState(traitName), [store]);

  const canHandleEvent = useCallback((traitName: string, eventKey: string): boolean =>
    store.manager.canHandleEvent(traitName, normalizeEventKey(eventKey)), [store]);

  // Page nav: a trait that drops out of `traitBindings` never emits an
  // empty render of its own, so its last paint would stack with the new
  // page's writes into the same slot. Clear dropped traits from every slot
  // before the mount-lifecycle effect below re-initializes.
  const prevActiveTraitNamesRef = useRef<ReadonlySet<string>>(new Set());
  useEffect(() => {
    const nextActiveTraitNames = new Set(
      traitBindings.map((b) => b.trait.name).filter((n): n is string => !!n),
    );
    const dropped = diffDroppedTraitNames(prevActiveTraitNamesRef.current, nextActiveTraitNames);
    if (dropped.length > 0) {
      for (const traitName of dropped) {
        for (const slot of ALL_SLOTS) {
          uiSlots.clearBySource(slot, traitName);
        }
      }
    }
    prevActiveTraitNamesRef.current = nextActiveTraitNames;
  }, [traitBindings, uiSlots]);

  // Mount-time lifecycle (INIT/LOAD/$MOUNT): each trait's own matching
  // lifecycle event dispatches ONCE, targeted — naturally O(traits), no
  // broadcast-then-filter N² shape (the old hook's own concern) since a
  // targeted `kernel.dispatch` never touches an unrelated trait.
  // Once per mount: a new page, new route params or a new circuit store is a remount; identity churn is not.
  const mountedRef = useRef<{ key: string; store: typeof store; initialized: Set<string> } | null>(null);
  const mountKey = `${options.mountKey ?? ''}\u0000${JSON.stringify(Object.entries(options.initPayload ?? {}).sort(([a], [b]) => a.localeCompare(b)))}`;
  useEffect(() => {
    const prev = mountedRef.current;
    const mount = prev !== null && prev.key === mountKey && prev.store === store
      ? prev
      : { key: mountKey, store, initialized: new Set<string>() };
    const active = new Set(traitBindings.map((b) => b.trait.name));
    const left = [...mount.initialized].filter((traitName) => !active.has(traitName));
    for (const traitName of left) mount.initialized.delete(traitName);
    store.mount.unmounted(left);
    // Every entering trait awaits its own lifecycle event BEFORE any of them
    // dispatches: a sibling's INIT cascade must not reach it first.
    const entering: Array<{ traitName: string; lifecycleEvent: string }> = [];
    for (const binding of traitBindings) {
      const traitName = binding.trait.name;
      if (mount.initialized.has(traitName)) continue;
      mount.initialized.add(traitName);
      const lifecycleEvent = LIFECYCLE_EVENTS.find((evt: string) => store.manager.canHandleEvent(traitName, evt));
      if (lifecycleEvent !== undefined) entering.push({ traitName, lifecycleEvent });
    }
    store.mount.mounting(entering.map((e) => e.traitName));
    for (const { traitName, lifecycleEvent } of entering) {
      void dispatchAndSettle(traitName, lifecycleEvent, { ...(options.initPayload ?? {}) });
    }
    mountedRef.current = mount;
  }, [traitBindings, store, dispatchAndSettle, mountKey]);

  // Re-render on every committed circuit change (mirrors the old hook's own
  // `setTraitStates(manager.getAllStates())` after each dispatch) — the
  // store's `notify()` is the ONE place `dispatchWithServerLeg`/
  // `applyOrbitalEventResponse` signal "state changed" (plan §4.2 P2).
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const traitStates = useMemo(() => store.manager.getAllStates(), [store, store.getVersion()]);

  return { traitStates, sendEvent, getTraitState, canHandleEvent, entityBindingSource };
}
