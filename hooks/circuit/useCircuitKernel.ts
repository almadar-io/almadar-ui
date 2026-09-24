/**
 * useCircuitKernel — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * The ONE per-page store + trait index + client kernel. Everything else in
 * `hooks/circuit/` is a thin React concern layered on top of the three
 * values this hook returns; the actual event evaluation, dispatch-mode
 * routing, server-leg posting and response fold all live in
 * `@almadar/runtime`'s client role (`createClientKernel` — plan P4).
 *
 * Rebuilt when `traitBindings` changes (page nav) — the same trigger the
 * pre-adapter hook used to rebuild its own `StateMachineManager`.
 *
 * Offline preview (no server, no explicit transport — plan G7): when the
 * caller supplies a `persistence` adapter and no `transport`, this hook
 * builds an in-process `EventTransport` whose evaluator runs
 * `evaluateOrbitalEvent` with a SERVER-role effect runner
 * (`createIndexStageRunner`) against that adapter — the same composition
 * every other host runs, just with a local `PersistenceAdapter` standing in
 * for a real server. With neither `transport` nor `persistence`, the kernel
 * has no transport at all: every dispatch runs Client-env locally and
 * nothing is ever posted (`ClientKernelOpts.transport` omitted).
 *
 * Server-pushed cascade events (`EventTransport.subscribe`, e.g. another
 * client's persist envelope) fan out through the SAME `collectListenerTargets`
 * the composition's own in-band fan-out and `applyOrbitalEventResponse`'s
 * response fold use — one matching implementation, three entry points.
 *
 * @packageDocumentation
 */
import { useEffect, useMemo, useRef } from 'react';
import type {
  EventPayload,
  OrbitalDefinition,
  ResolvedTraitBinding,
  ServiceParams,
  TraitConfig,
  UserContext,
} from '@almadar/core';
import {
  buildTraitIndex,
  collectListenerTargets,
  createClientKernel,
  createIndexStageRunner,
  createInProcessTransport,
  createMemoryCircuitStore,
  evaluateOrbitalEvent,
  type CircuitStore,
  type ClientKernel,
  type ClientKernelOutcome,
  type EvaluationContextExtensions,
  type EventTransport,
  type IndexedTrait,
  type PersistenceAdapter,
  type TraitIndex,
  type TransitionObserver,
  UNMOUNT_EVENT,
} from '@almadar/runtime';
import { createLogger } from '@almadar/logger';

export interface UseCircuitKernelOptions {
  /** The resolved schema's full orbital set (`OrbitalSchema.orbitals`) —
   *  the one input `buildTraitIndex` needs; the trait index is then
   *  restricted to the traits `traitBindings` actually mounts. */
  orbitals: readonly OrbitalDefinition[];
  /** Page-level resolved config per trait — the middle layer of
   *  `buildTraitIndex`'s three-layer merge (plan §5.1 G4). */
  traitConfigsByName?: Record<string, TraitConfig>;
  /** Caller-owned transport (server bridge, or a custom in-process one). */
  transport?: EventTransport;
  /** From the transport's `register()` result — `true` = the stateless
   *  topology (a posted leg must carry `traits`/`entityByTrait`). */
  carriesCircuitState?: boolean;
  /** `true` while the transport's topology is still unknown (its `register()`
   *  is pending): dispatches are held, then released in order onto the
   *  kernel built for the confirmed topology — a post made on the guess
   *  goes out in the wrong shape. */
  awaitTopology?: boolean;
  /** Offline-preview persistence layer (plan G7). */
  persistence?: PersistenceAdapter;
  /** Consumer `call-service` hook for the offline in-process evaluator. */
  callService?: (service: string, action: string, params?: ServiceParams) => Promise<EventPayload>;
  user?: UserContext;
  guardMode?: 'strict' | 'permissive';
  strictBindings?: boolean;
  contextExtensions?: EvaluationContextExtensions;
  debug?: boolean;
  logContext?: { behavior?: string; orbitalName?: string };
  /** Verification/perf recording — `StateMachineManager.setObserver`'s hook. */
  observer?: TransitionObserver;
}

export interface CircuitKernelHandle {
  kernel: ClientKernel;
  store: CircuitStore;
  traitIndex: TraitIndex;
}

/**
 * Per-TAB identity (Almadar_Live_Push.md) — module-scoped, NOT per hook
 * instance. A page mounting several circuit kernels is still ONE origin:
 * the server's broadcast exclusion keys on this id, and per-kernel ids
 * would let one kernel's persist echo back into a sibling kernel on the
 * same tab. Moved from the old `providers/ServerBridge.tsx`'s
 * `getTabClientId`, now the client role's own concern since dispatching
 * and subscribing both moved here.
 */
let tabClientId: string | undefined;
function getTabClientId(): string {
  if (tabClientId === undefined) tabClientId = crypto.randomUUID();
  return tabClientId;
}

const log = createLogger('almadar:ui:circuit-kernel');

function postUnmounts(transport: EventTransport, traits: ReadonlyArray<readonly [string, string]>): void {
  for (const [traitName, orbitalName] of traits) {
    transport
      .send(orbitalName, { event: UNMOUNT_EVENT, targetTrait: traitName, clientId: getTabClientId() })
      .catch((err) => log.warn('unmount-post-failed', { trait: traitName, orbital: orbitalName, error: String(err) }));
  }
}

/** Restrict a full-schema `TraitIndex` down to the traits this page mounts —
 *  the client's browser store only ever holds the current page's circuit,
 *  never an off-page trait it has nothing rendered for. */
function restrictTraitIndex(full: TraitIndex, activeNames: ReadonlySet<string>): TraitIndex {
  const byName = new Map<string, IndexedTrait>();
  for (const [name, entry] of full.byName) {
    if (activeNames.has(name)) byName.set(name, entry);
  }
  return { byName, allEntities: full.allEntities, orbitals: full.orbitals };
}

export function useCircuitKernel(
  traitBindings: readonly ResolvedTraitBinding[],
  options: UseCircuitKernelOptions,
): CircuitKernelHandle {
  const fullTraitIndex = useMemo(
    () => buildTraitIndex(options.orbitals, options.traitConfigsByName),
    [options.orbitals, options.traitConfigsByName],
  );
  // Keyed on the active trait SET, not the bindings array identity: a same-traits re-render must not rebuild the store.
  const activeTraitKey = traitBindings
    .map((b) => b.trait.name)
    .filter((n): n is string => !!n)
    .sort()
    .join('\u0000');
  const traitIndex = useMemo(
    () => restrictTraitIndex(fullTraitIndex, new Set(activeTraitKey === '' ? [] : activeTraitKey.split('\u0000'))),
    [activeTraitKey, fullTraitIndex],
  );

  // Runtime Spec Clause 8.3: a trait leaving the page (or the page tearing down) is unmounted on
  // the server, pausing its mount-scoped ticks. Held with dispatch until the topology registers.
  const mountedRef = useRef(new Map<string, string>());
  const transport = options.transport;
  const topologyPending = options.awaitTopology === true;
  useEffect(() => {
    if (transport === undefined || topologyPending) return;
    const mounted = mountedRef.current;
    const dropped = [...mounted].filter(([name]) => !traitIndex.byName.has(name));
    mounted.clear();
    for (const [name, entry] of traitIndex.byName) mounted.set(name, entry.orbitalName);
    postUnmounts(transport, dropped);
  }, [traitIndex, transport, topologyPending]);
  useEffect(() => {
    if (transport === undefined) return;
    const mounted = mountedRef.current;
    return () => postUnmounts(transport, [...mounted]);
  }, [transport]);

  const store = useMemo(() => {
    const traitDefs = Array.from(traitIndex.byName.values(), (entry: IndexedTrait) => entry.traitDef);
    const config = {
      ...(options.guardMode !== undefined ? { guardMode: options.guardMode } : {}),
      ...(options.strictBindings !== undefined ? { strictBindings: options.strictBindings } : {}),
      ...(options.contextExtensions !== undefined ? { contextExtensions: options.contextExtensions } : {}),
    };
    return createMemoryCircuitStore(traitDefs, config, options.observer);
  }, [traitIndex, options.guardMode, options.strictBindings, options.contextExtensions, options.observer]);

  const offlineTransport = useMemo(() => {
    if (options.transport !== undefined || options.persistence === undefined) return undefined;
    const persistence = options.persistence;
    return createInProcessTransport(
      async (_orbitalName: string, request: import('@almadar/core').OrbitalEventRequest) => {
        const runEffects = createIndexStageRunner({
          traitIndex,
          persistence,
          frames: store.frames,
          manager: store.manager,
          ...(options.callService !== undefined
            ? { extraEffectHandlers: { callService: options.callService } }
            : {}),
          ...(options.debug !== undefined ? { debug: options.debug } : {}),
        });
        return evaluateOrbitalEvent(
          {
            traitIndex,
            manager: store.manager,
            persistence,
            frames: store.frames,
            runEffects,
            ...(options.user !== undefined ? { user: options.user } : {}),
            ...(options.guardMode !== undefined ? { guardMode: options.guardMode } : {}),
            ...(options.strictBindings !== undefined ? { strictBindings: options.strictBindings } : {}),
            ...(options.contextExtensions !== undefined ? { contextExtensions: options.contextExtensions } : {}),
            ...(options.debug !== undefined ? { debug: options.debug } : {}),
            ...(options.logContext !== undefined ? { logContext: options.logContext } : {}),
          },
          request,
        );
      },
      { carriesCircuitState: false },
    );
  }, [
    options.transport,
    options.persistence,
    traitIndex,
    store,
    options.callService,
    options.user,
    options.guardMode,
    options.strictBindings,
    options.contextExtensions,
    options.debug,
    options.logContext,
  ]);

  const effectiveTransport = options.transport ?? offlineTransport;
  const orbitalName = options.orbitals[0]?.name ?? '';

  const rawKernel = useMemo(() => createClientKernel({
    orbitalName,
    traitIndex,
    fullTraitIndex,
    store,
    ...(options.persistence !== undefined ? { persistence: options.persistence } : {}),
    ...(options.user !== undefined ? { user: options.user } : {}),
    ...(options.guardMode !== undefined ? { guardMode: options.guardMode } : {}),
    ...(options.strictBindings !== undefined ? { strictBindings: options.strictBindings } : {}),
    ...(options.contextExtensions !== undefined ? { contextExtensions: options.contextExtensions } : {}),
    ...(options.debug !== undefined ? { debug: options.debug } : {}),
    ...(options.logContext !== undefined ? { logContext: options.logContext } : {}),
    carriesCircuitState: options.carriesCircuitState ?? false,
    ...(effectiveTransport !== undefined ? { transport: effectiveTransport } : {}),
  }), [
    orbitalName,
    traitIndex,
    fullTraitIndex,
    store,
    options.persistence,
    options.user,
    options.guardMode,
    options.strictBindings,
    options.contextExtensions,
    options.debug,
    options.logContext,
    options.carriesCircuitState,
    effectiveTransport,
  ]);

  // Stamp the per-tab clientId onto every dispatch that doesn't already
  // carry one, so callers (`useBusIngress`, the composer) never have to
  // know about tab identity — same posted-leg field the old
  // `ServerBridge.tsx`'s `buildEventRequest` stamped by hand.
  const rawKernelRef = useRef(rawKernel);
  rawKernelRef.current = rawKernel;
  const awaitTopology = options.awaitTopology === true;
  const holdRef = useRef(awaitTopology);
  holdRef.current = awaitTopology;
  const heldRef = useRef<Array<() => void>>([]);
  useEffect(() => {
    if (awaitTopology) return;
    const held = heldRef.current;
    heldRef.current = [];
    for (const release of held) release();
  }, [awaitTopology, rawKernel]);

  const kernel = useMemo<ClientKernel>(() => ({
    store: rawKernel.store,
    dispatch: (request: import('@almadar/core').OrbitalEventRequest) => {
      const stamped = request.clientId !== undefined ? request : { ...request, clientId: getTabClientId() };
      if (!holdRef.current) return rawKernel.dispatch(stamped);
      return new Promise<ClientKernelOutcome>((resolve, reject) => {
        heldRef.current.push(() => { rawKernelRef.current.dispatch(stamped).then(resolve, reject); });
      });
    },
  }), [rawKernel]);

  // `kernel` is rebuilt whenever `carriesCircuitState` resolves from its
  // pre-register guess to the transport's confirmed value (a `rawKernel`
  // dependency, needed for correct posting) — that identity change must
  // NOT itself tear down and reopen the SSE connection below, or every
  // page load pays two connects. The push-ingress effect reads the LATEST
  // kernel through this ref instead of closing over `kernel` directly.
  const kernelRef = useRef(kernel);
  kernelRef.current = kernel;

  // Server-pushed cascade ingress (e.g. another client's persist-envelope
  // emit, Almadar_Live_Push.md). Absent for a transport with no `subscribe`
  // (in-process — no server to push from). Every matched local listener
  // dispatches through the SAME kernel queue as any other event. `clientId`
  // rides the subscribe params so the server can exclude this tab's own
  // echoes, same as the old provider's push effect.
  useEffect(() => {
    if (!effectiveTransport?.subscribe) return;
    return effectiveTransport.subscribe((emitted: import('@almadar/core').EmittedEvent) => {
      const targets = collectListenerTargets(traitIndex, emitted.source, emitted.event, emitted.payload);
      for (const target of targets) {
        void kernelRef.current.dispatch({
          event: target.triggers,
          ...(target.payload !== undefined ? { payload: target.payload } : {}),
          ...(target.entityId !== undefined ? { entityId: target.entityId } : {}),
          targetTrait: target.listenerTrait,
        });
      }
    }, { clientId: getTabClientId() });
  }, [effectiveTransport, traitIndex]);

  return { kernel, store, traitIndex };
}
