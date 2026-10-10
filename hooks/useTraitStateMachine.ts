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
  MountSeed,
  OrbitalDefinition,
  ResolvedTraitBinding,
  ServiceParams,
  TraitConfig,
  UserContext,
} from '@almadar/core';
import { collectListenerTargets, LIFECYCLE_EVENTS, TraitMountError, type ClientKernelOutcome, type EventTransport, type TraitState } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import { useEventBus } from './useEventBus';
import { useUser } from '../providers/UserContext';
import { useTranslate } from './useTranslate';
import type { EntityBindingSource } from '../providers/EntityBindingContext';
import type { AwaitingSkeletonSource } from '../providers/AwaitingSkeletonContext';
import { ALL_SLOTS } from './useUISlots';
import { registerTrait, unregisterTrait, type TraitDebugInfo } from '../lib/traitRegistry';
import { bindTraitStateGetter, registerTraitSnapshot } from '../lib/verificationRegistry';
import { createCircuitVerificationObserver, recordDispatchVerdict } from '../lib/circuitVerificationObserver';
import { TRAIT_MOUNT_ERROR_TESTID, configReferencesCallsitePayload, traitReferencesCallsitePayload, traitsEmbeddedByEvent, type TraitStateSnapshot, type PersistenceAdapter, type TransitionRejection } from '@almadar/core';
import type { useUISlots } from '../providers/UISlotContext';
import { getTabClientId, useCircuitKernel } from './circuit/useCircuitKernel';
import { useBusIngress } from './circuit/useBusIngress';
import { useSlotFlush, type SlotCheckpoint } from './circuit/useSlotFlush';
import { useCallsiteCapture } from './circuit/useCallsiteCapture';
import { useClientTicks } from './circuit/useClientTicks';
import { useEntityBindingSource } from './circuit/useEntityBindingSource';
import { useAwaitingSkeletonSource } from './circuit/useAwaitingSkeletonSource';

/** The slot source a failed lifecycle step's error renders under, cleared on the next mount. */
const MOUNT_ERROR_SOURCE = '$mount';

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
  /** Awaiting-server skeletons for `AwaitingSkeletonContext`. */
  awaitingSkeletonSource: AwaitingSkeletonSource;
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
  /** The browser store for `[persistent: x, local]` entities (see `useCircuitKernel`). */
  browserStore?: PersistenceAdapter;
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
  const { t } = useTranslate();
  const userContext = (options.user ?? contextViewer ?? undefined) as UserContext | undefined;

  const observer = useMemo(() => createCircuitVerificationObserver(), []);

  const { kernel, store, traitIndex, appTraitNames, transport } = useCircuitKernel(traitBindings, {
    orbitals: options.orbitals,
    ...(options.traitConfigsByName !== undefined ? { traitConfigsByName: options.traitConfigsByName } : {}),
    ...(options.transport !== undefined ? { transport: options.transport } : {}),
    ...(options.carriesCircuitState !== undefined ? { carriesCircuitState: options.carriesCircuitState } : {}),
    ...(options.awaitTopology !== undefined ? { awaitTopology: options.awaitTopology } : {}),
    ...(options.persistence !== undefined ? { persistence: options.persistence } : {}),
    ...(options.browserStore !== undefined ? { browserStore: options.browserStore } : {}),
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
    hostRunsProgram: transport?.hostsBrowserStore === true,
    ...(options.traitConfigsByName !== undefined ? { traitConfigsByName: options.traitConfigsByName } : {}),
    ...(options.navigate !== undefined ? { navigate: options.navigate } : {}),
    ...(options.navigateBack !== undefined ? { navigateBack: options.navigateBack } : {}),
    ...(userContext !== undefined ? { user: userContext } : {}),
  });

  const entityBindingSource = useEntityBindingSource(store, traitIndex);
  const awaitingSkeletonSource = useAwaitingSkeletonSource(store, traitIndex, options.embeddedTraits);

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

  // A transitioned dispatch re-renders its callsite-capture children; a child
  // the response already repainted was composed under the payload that really
  // fired (a fetch's success, not this dispatch's INIT) — its frame stays.
  const afterSettle = useCallback(async (
    traitName: string,
    eventKey: string,
    payload: EventPayload | undefined,
    transitioned: boolean,
    repaints: ReadonlyArray<{ traitName: string }>,
    composedBefore: ReadonlyMap<string, EventPayload>,
  ): Promise<void> => {
    if (transitioned) {
      const entityByTrait: Record<string, EntityRow> = {};
      for (const [name, entry] of traitIndex.byName) {
        const row = store.frames.get(entry.frameKey);
        if (row !== undefined) entityByTrait[name] = row;
      }
      const repainted = new Set(repaints.map((e) => e.traitName));
      const serverComposed = new Set([...store.callsitePayloads].filter(([child, composed]) => composedBefore.get(child) !== composed).map(([child]) => child));
      const irTrait = traitIndex.byName.get(traitName)?.irTrait;
      const composedBy = irTrait !== undefined ? traitsEmbeddedByEvent(irTrait, eventKey) : undefined;
      await reRenderCallsiteCaptureChildren(traitName, payload ?? {}, entityByTrait, repainted, serverComposed, false, composedBy);
    }
    options.onEventProcessed?.(eventKey, payload);
  }, [traitIndex, store, reRenderCallsiteCaptureChildren, options.onEventProcessed]);

  // Paint a kernel outcome's settled effects, republish its emits and run the
  // capture-children repaint — every dispatch lane ends here.
  const settleOutcome = useCallback(async (
    traitName: string,
    eventKey: string,
    payload: EventPayload | undefined,
    outcome: ClientKernelOutcome,
    composedBefore: ReadonlyMap<string, EventPayload>,
  ): Promise<void> => {
    recordDispatchVerdict(traitIndex.byName.get(traitName)?.orbitalName ?? traitName, eventKey, { response: outcome.response });
    const settledEffects = outcome.localPainted && outcome.serverEffects !== undefined ? outcome.serverEffects : outcome.response;
    slotFlush.applyClientEffects(
      settledEffects.clientEffects ?? [],
      settledEffects.clientEffectsByTrait,
      options.navigate,
      options.navigateBack,
      activeTraitNamesRef.current,
    );
    // A tick lane posts without blocking the drain; what its fold adds (a
    // refetch's render) paints when the post lands.
    void outcome.tickSettled?.then((later) => {
      if (later === undefined) return;
      slotFlush.applyClientEffects(later.clientEffects ?? [], later.clientEffectsByTrait, options.navigate, options.navigateBack, activeTraitNamesRef.current);
    });
    // The kernel already delivered these to its own listeners; republish for
    // bus subscribers outside it (providers, components, other hook instances).
    for (const emitted of outcome.response.emittedEvents) {
      eventBus.emit(`UI:${emitted.event}`, emitted.payload, { ...(emitted.source ?? {}), dispatched: true });
    }
    stateLog.debug('dispatch:settled', { traitName, eventKey, mode: outcome.mode, transitioned: outcome.response.transitioned });
    await afterSettle(traitName, eventKey, payload, outcome.response.transitioned, outcome.response.clientEffectsByTrait ?? [], composedBefore);
  }, [slotFlush, traitIndex, eventBus, options.navigate, options.navigateBack, afterSettle]);

  const dispatchAndSettle = useCallback(async (traitName: string, eventKey: string, payload: EventPayload | undefined, tick?: string): Promise<void> => {
    const entityId = typeof payload?.entityId === 'string' ? payload.entityId : undefined;
    const orbitalName = traitIndex.byName.get(traitName)?.orbitalName ?? traitName;
    let outcome: Awaited<ReturnType<typeof kernel.dispatch>>;
    const composedBefore = new Map(store.callsitePayloads);
    // Paint local first: the transition's own render-ui (its loading
    // skeleton) paints the moment the local arm runs, not after the server
    // round trip; a failed leg rolls the slots back with the state.
    let beforeLocalPaint: SlotCheckpoint | undefined;
    try {
      outcome = await kernel.dispatch({
        event: eventKey,
        ...(payload !== undefined ? { payload } : {}),
        ...(entityId !== undefined ? { entityId } : {}),
        ...(tick !== undefined ? { tick } : {}),
        targetTrait: traitName,
      }, {
        onLocal: (local) => {
          beforeLocalPaint = slotFlush.checkpoint();
          slotFlush.applyClientEffects(
            local.clientEffects ?? [],
            local.clientEffectsByTrait,
            options.navigate,
            options.navigateBack,
            activeTraitNamesRef.current,
          );
        },
      });
    } catch (err: unknown) {
      if (beforeLocalPaint !== undefined) slotFlush.rollback(beforeLocalPaint);
      recordDispatchVerdict(orbitalName, eventKey, { error: err instanceof Error ? err : String(err) });
      throw err;
    }
    if (outcome.localPainted && !outcome.response.success && beforeLocalPaint !== undefined) {
      slotFlush.rollback(beforeLocalPaint);
    }
    await settleOutcome(traitName, eventKey, payload, outcome, composedBefore);
  }, [kernel, slotFlush, traitIndex, store, options.navigate, options.navigateBack, settleOutcome]);

  // A live message of this tab's own running call: the progress lane, outside
  // the FIFO that is still waiting on that call.
  const progressAndSettle = useCallback(async (traitName: string, eventKey: string, payload: EventPayload | undefined): Promise<void> => {
    const entityId = typeof payload?.entityId === 'string' ? payload.entityId : undefined;
    const composedBefore = new Map(store.callsitePayloads);
    const outcome = await kernel.dispatchProgress({
      event: eventKey,
      ...(payload !== undefined ? { payload } : {}),
      ...(entityId !== undefined ? { entityId } : {}),
      targetTrait: traitName,
    });
    await settleOutcome(traitName, eventKey, payload, outcome, composedBefore);
  }, [kernel, store, settleOutcome]);

  // Server-pushed events (Almadar_Live_Push.md) reach their listeners through
  // the same settle as a bus-entered dispatch, so they repaint.
  useEffect(() => {
    if (!transport?.subscribe) return;
    return transport.subscribe((emitted, target) => {
      const listeners = collectListenerTargets(traitIndex, emitted.source, emitted.event, emitted.payload);
      if (target !== 'origin') {
        for (const t of listeners) void dispatchAndSettle(t.listenerTrait, t.triggers, t.payload);
        return;
      }
      // A call-service `onMessage` event is the calling trait's own (like `success`): it runs
      // there, and on any trait that listens to it.
      const caller = emitted.source?.trait;
      if (caller !== undefined && traitIndex.byName.has(caller) && !listeners.some((t) => t.listenerTrait === caller && t.triggers === emitted.event)) {
        void progressAndSettle(caller, emitted.event, emitted.payload);
      }
      for (const t of listeners) void progressAndSettle(t.listenerTrait, t.triggers, t.payload);
    }, { clientId: getTabClientId() });
  }, [transport, traitIndex, progressAndSettle, dispatchAndSettle]);

  // A dispatch the host ran on its own (a declared input) shows here as the host's result; it never
  // runs again in this view.
  useEffect(() => {
    if (!transport?.subscribeHostDispatches) return;
    return transport.subscribeHostDispatches((_orbitalName, request, response) => {
      const traitName = request.targetTrait;
      if (traitName === undefined || !traitIndex.byName.has(traitName)) return;
      const composedBefore = new Map(store.callsitePayloads);
      void kernel.foldHostDispatch(request, response).then((outcome) =>
        settleOutcome(traitName, request.event, request.payload, outcome, composedBefore));
    }, { clientId: getTabClientId() });
  }, [transport, traitIndex, kernel, store, settleOutcome]);


  // Mount in one round trip: every entering trait's lifecycle arm runs and
  // paints at once, then one mount leg is posted and folded.
  // Resolves with the first seed whose lifecycle arm failed (a contained `effect-failed`), so the
  // mount site can name it on the card the same way as a thrown mount error.
  const mountAndSettle = useCallback(async (seeds: MountSeed[], payload: EventPayload): Promise<TransitionRejection | undefined> => {
    const composedBefore = new Map(store.callsitePayloads);
    let beforeLocalPaint: SlotCheckpoint | undefined;
    let outcome: Awaited<ReturnType<typeof kernel.dispatchMount>>;
    try {
      outcome = await kernel.dispatchMount(seeds, {
        onLocal: (_trait, local) => {
          if (beforeLocalPaint === undefined) beforeLocalPaint = slotFlush.checkpoint();
          slotFlush.applyClientEffects(local.clientEffects ?? [], local.clientEffectsByTrait, options.navigate, options.navigateBack, activeTraitNamesRef.current);
        },
      }, { payload });
    } catch (err: unknown) {
      if (beforeLocalPaint !== undefined) slotFlush.rollback(beforeLocalPaint);
      for (const seed of seeds) {
        recordDispatchVerdict(traitIndex.byName.get(seed.trait)?.orbitalName ?? seed.trait, seed.event, { error: err instanceof Error ? err : String(err) });
      }
      throw err;
    }
    if (!outcome.success && beforeLocalPaint !== undefined) slotFlush.rollback(beforeLocalPaint);
    slotFlush.applyClientEffects(outcome.serverEffects.clientEffects ?? [], outcome.serverEffects.clientEffectsByTrait, options.navigate, options.navigateBack, activeTraitNamesRef.current);
    const emitted = [...outcome.seeds.flatMap((seed) => seed.local.emittedEvents), ...outcome.emittedEvents];
    for (const e of emitted) {
      eventBus.emit(`UI:${e.event}`, e.payload, { ...(e.source ?? {}), dispatched: true });
    }
    const serverRepaints = outcome.serverEffects.clientEffectsByTrait ?? [];
    for (const seed of outcome.seeds) {
      recordDispatchVerdict(traitIndex.byName.get(seed.trait)?.orbitalName ?? seed.trait, seed.event, {
        response: {
          ...seed.local,
          success: outcome.success,
          ...(outcome.error !== undefined ? { error: outcome.error } : {}),
          rejections: [...(seed.local.rejections ?? []), ...outcome.rejections.filter((r) => r.trait === seed.trait)],
        },
      });
      stateLog.debug('mount:settled', { traitName: seed.trait, eventKey: seed.event, mode: seed.mode, transitioned: seed.local.transitioned });
      await afterSettle(seed.trait, seed.event, payload, seed.local.transitioned, [...(seed.local.clientEffectsByTrait ?? []), ...serverRepaints], composedBefore);
    }
    return [...outcome.seeds.flatMap((seed) => seed.local.rejections ?? []), ...outcome.rejections].find((r) => r.code === 'effect-failed');
  }, [kernel, slotFlush, traitIndex, store, eventBus, options.navigate, options.navigateBack, afterSettle]);

  useBusIngress(traitBindings, traitIndex, dispatchAndSettle, eventBus, appTraitNames);

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
  // A mount still settling when the host unmounts must not render into the torn-down tree.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);
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
    const entering: MountSeed[] = [];
    const embeddedChildren = new Set([...(options.callsiteCaptureChildrenByTrait?.values() ?? [])].flatMap((c) => [...c]));
    for (const binding of traitBindings) {
      const traitName = binding.trait.name;
      if (mount.initialized.has(traitName)) continue;
      mount.initialized.add(traitName);
      // An embedded child that reads its composer's payload and only repaints on mount waits
      // for that composer (the capture pass paints it), as the compiled path renders it inline.
      const indexed = traitIndex.byName.get(traitName);
      if (
        embeddedChildren.has(traitName) &&
        indexed !== undefined &&
        (traitReferencesCallsitePayload(indexed.irTrait) || configReferencesCallsitePayload(indexed.config)) &&
        store.manager.repaintLifecycleEvent(traitName) !== undefined &&
        !store.callsitePayloads.has(traitName)
      ) {
        continue;
      }
      const lifecycleEvent = LIFECYCLE_EVENTS.find((evt) => store.manager.canHandleEvent(traitName, evt));
      if (lifecycleEvent !== undefined) entering.push({ trait: traitName, event: lifecycleEvent });
    }
    store.mount.mounting(entering.map((e) => e.trait));
    if (entering.length > 0) {
      uiSlots.clearBySource('main', MOUNT_ERROR_SOURCE);
      void mountAndSettle(entering, { ...(options.initPayload ?? {}) }).then((failure) => {
        if (failure === undefined || !aliveRef.current) return;
        const failed = failure.trait ?? entering.map((e) => e.trait).join(', ');
        const message = failure.error ?? failure.code;
        stateLog.warn('mount:effect-failed', { failed, event: failure.event, error: message });
        uiSlots.render({
          target: 'main',
          pattern: 'error-state',
          props: { title: t('error.traitMountFailed', { trait: failed }), message, 'data-testid': TRAIT_MOUNT_ERROR_TESTID },
          sourceTrait: MOUNT_ERROR_SOURCE,
        });
      }, (err) => {
        const traits = entering.map((e) => e.trait);
        const message = err instanceof Error ? err.message : String(err);
        const failed = err instanceof TraitMountError ? err.trait : traits.join(', ');
        const cause = err instanceof TraitMountError ? err.original : err;
        stateLog.warn('mount:failed', { traits, failed, error: message, stack: cause instanceof Error ? cause.stack : undefined });
        if (!aliveRef.current) return;
        uiSlots.render({
          target: 'main',
          pattern: 'error-state',
          props: { title: t('error.traitMountFailed', { trait: failed }), message, 'data-testid': TRAIT_MOUNT_ERROR_TESTID },
          sourceTrait: MOUNT_ERROR_SOURCE,
        });
      });
    }
    mountedRef.current = mount;
  }, [traitBindings, store, mountAndSettle, mountKey, uiSlots, traitIndex, options.callsiteCaptureChildrenByTrait, t]);

  // Re-render on every committed circuit change (mirrors the old hook's own
  // `setTraitStates(manager.getAllStates())` after each dispatch) — the
  // store's `notify()` is the ONE place `dispatchWithServerLeg`/
  // `applyOrbitalEventResponse` signal "state changed" (plan §4.2 P2).
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  const traitStates = useMemo(() => store.manager.getAllStates(), [store, store.getVersion()]);

  return { traitStates, sendEvent, getTraitState, canHandleEvent, entityBindingSource, awaitingSkeletonSource };
}
