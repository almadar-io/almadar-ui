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
  createLocalStoreTransport,
  createMemoryCircuitStore,
  createResidenceTransport,
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
import { recordingTransport } from '../../lib/verificationRegistry';
import { useTranslate, useRenderI18n } from '../useTranslate';

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
  /** The browser store for `[persistent: x, local]` entities: legs over their
   *  data run in-process against it, every other leg goes to `transport`. */
  browserStore?: PersistenceAdapter;
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
  /** Every trait of the app (all pages); `traitIndex` is the current page's. */
  appTraitNames: ReadonlySet<string>;
  /** The server the kernel posts to; its pushes are settled by the caller. */
  transport: EventTransport | undefined;
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
export function getTabClientId(): string {
  if (tabClientId === undefined) tabClientId = crypto.randomUUID();
  return tabClientId;
}

const log = createLogger('almadar:ui:circuit-kernel');

function postUnmounts(transport: EventTransport, traits: ReadonlyArray<readonly [string, string]>, locale: string): void {
  for (const [traitName, orbitalName] of traits) {
    transport
      .send(orbitalName, { event: UNMOUNT_EVENT, targetTrait: traitName, clientId: getTabClientId(), locale })
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
  // A host that runs the whole program (an extension worker) runs every trait; this view only shows them.
  const hostRunsProgram = options.transport?.hostsBrowserStore === true;
  const fullTraitIndex = useMemo(
    () => buildTraitIndex(options.orbitals, options.traitConfigsByName, { hostRunsProgram }),
    [options.orbitals, options.traitConfigsByName, hostRunsProgram],
  );
  const appTraitNames = useMemo(() => new Set(fullTraitIndex.byName.keys()), [fullTraitIndex]);
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
  const { locale } = useTranslate();
  const i18n = useRenderI18n();
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const transport = options.transport;
  const topologyPending = options.awaitTopology === true;
  useEffect(() => {
    if (transport === undefined || topologyPending) return;
    const mounted = mountedRef.current;
    const dropped = [...mounted].filter(([name]) => !traitIndex.byName.has(name));
    mounted.clear();
    for (const [name, entry] of traitIndex.byName) mounted.set(name, entry.orbitalName);
    postUnmounts(transport, dropped, localeRef.current);
  }, [traitIndex, transport, topologyPending]);
  useEffect(() => {
    if (transport === undefined) return;
    const mounted = mountedRef.current;
    return () => postUnmounts(transport, [...mounted], localeRef.current);
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

  const localTransportOptions = {
    traitIndex,
    store,
    ...(options.callService !== undefined ? { callService: options.callService } : {}),
    ...(options.user !== undefined ? { user: options.user } : {}),
    ...(options.guardMode !== undefined ? { guardMode: options.guardMode } : {}),
    ...(options.strictBindings !== undefined ? { strictBindings: options.strictBindings } : {}),
    ...(options.contextExtensions !== undefined ? { contextExtensions: options.contextExtensions } : {}),
    ...(options.debug !== undefined ? { debug: options.debug } : {}),
    ...(options.logContext !== undefined ? { logContext: options.logContext } : {}),
  };
  const offlineTransport = useMemo(
    () => (options.transport !== undefined || options.persistence === undefined
      ? undefined
      : createLocalStoreTransport({ ...localTransportOptions, persistence: options.persistence })),
    [options.transport, options.persistence, traitIndex, store, options.callService, options.user,
      options.guardMode, options.strictBindings, options.contextExtensions, options.debug, options.logContext],
  );
  const routedTransport = useMemo(() => {
    if (options.browserStore === undefined) return undefined;
    // The client relays a browser leg's emits itself, as a compiled client does.
    const local = createLocalStoreTransport({ ...localTransportOptions, traitIndex: fullTraitIndex, persistence: options.browserStore, clientRelays: true });
    const remote = options.transport ?? offlineTransport;
    return createResidenceTransport({ local, ...(remote !== undefined ? { remote } : {}), traitIndex: fullTraitIndex });
  }, [options.browserStore, options.transport, offlineTransport, fullTraitIndex, store, options.callService, options.user,
    options.guardMode, options.strictBindings, options.contextExtensions, options.debug, options.logContext]);

  const baseTransport = routedTransport ?? options.transport ?? offlineTransport;
  const effectiveTransport = useMemo(
    () => (baseTransport === undefined ? undefined : recordingTransport(baseTransport)),
    [baseTransport],
  );
  const orbitalName = options.orbitals[0]?.name ?? '';

  // The transport's topology, confirmed once its register() settles: the
  // kernel paints every local arm at once and holds only its posts on this.
  const topology = useMemo(() => {
    let resolve: (t: { carriesCircuitState: boolean }) => void = () => undefined;
    const promise = new Promise<{ carriesCircuitState: boolean }>((r) => { resolve = r; });
    return { promise, resolve };
  }, [effectiveTransport]);
  const awaitTopology = options.awaitTopology === true;
  const confirmedCarries = options.carriesCircuitState ?? false;
  useEffect(() => {
    if (!awaitTopology) topology.resolve({ carriesCircuitState: confirmedCarries });
  }, [awaitTopology, confirmedCarries, topology]);

  const rawKernel = useMemo(() => createClientKernel({
    orbitalName,
    traitIndex,
    fullTraitIndex,
    store,
    ...(options.persistence !== undefined ? { persistence: options.persistence } : {}),
    ...(options.user !== undefined ? { user: options.user } : {}),
    locale,
    ...(i18n !== undefined ? { messages: { [i18n.locale]: i18n.messages } } : {}),
    ...(options.guardMode !== undefined ? { guardMode: options.guardMode } : {}),
    ...(options.strictBindings !== undefined ? { strictBindings: options.strictBindings } : {}),
    ...(options.contextExtensions !== undefined ? { contextExtensions: options.contextExtensions } : {}),
    ...(options.debug !== undefined ? { debug: options.debug } : {}),
    ...(options.logContext !== undefined ? { logContext: options.logContext } : {}),
    carriesCircuitState: false,
    topology: topology.promise,
    ...(effectiveTransport !== undefined ? { transport: effectiveTransport } : {}),
  }), [
    orbitalName,
    traitIndex,
    fullTraitIndex,
    store,
    options.persistence,
    options.user,
    locale,
    i18n,
    options.guardMode,
    options.strictBindings,
    options.contextExtensions,
    options.debug,
    options.logContext,
    topology,
    effectiveTransport,
  ]);

  // Stamp the per-tab clientId and the viewer's locale onto every dispatch
  // that doesn't already carry them, so callers (`useBusIngress`, the composer) never have to
  // know about tab identity — same posted-leg field the old
  // `ServerBridge.tsx`'s `buildEventRequest` stamped by hand.
  const kernel = useMemo<ClientKernel>(() => {
    const stamp = <R extends { clientId?: string; locale?: string }>(request: R): R => ({
      ...request,
      clientId: request.clientId ?? getTabClientId(),
      locale: request.locale ?? locale,
    });
    return {
      store: rawKernel.store,
      dispatch: (request, hooks) => rawKernel.dispatch(stamp(request), hooks),
      dispatchMount: (seeds, hooks, base = {}) => rawKernel.dispatchMount(seeds, hooks, stamp(base)),
      dispatchProgress: (request: import('@almadar/core').OrbitalEventRequest) => rawKernel.dispatchProgress(stamp(request)),
      foldHostDispatch: (request, response) => rawKernel.foldHostDispatch(request, response),
    };
  }, [rawKernel, locale]);

  return { kernel, store, traitIndex, appTraitNames, transport: effectiveTransport };
}
