/**
 * The kernel-backed client role: a `ClientKernel` (the surface `useCircuitKernel` hands every hook)
 * whose decisions are the Rust client-role kernel's, run as WebAssembly. A dispatch, a fold, a rollback
 * and a tick frame are `Kernel` calls; this module only moves their results: server legs go out over the
 * provider's transport and come back through `applyServerResponse`, and each response is mirrored into the
 * `CircuitStore` so the hooks that read it (`useEntityBindingSource`, the awaiting registry, the trait
 * machine's `canHandleEvent`) see the kernel's states and rows.
 *
 * @packageDocumentation
 */
import type { EventPayload, OrbitalEventRequest, OrbitalEventResponse, TransitionRejection } from '@almadar/core';
import {
  TraitMountError,
  type CircuitStore,
  type ClientDispatchHooks,
  type ClientKernel,
  type ClientKernelOutcome,
  type EventTransport,
  type TraitIndex,
  type TransitionObserver,
} from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import type { FrameScheduler } from './kernel-frames';
import type { AppliedWire, AwaitingTrait, DispatchWire, FrameWire, MountWire, TraitSnapshot } from '@almadar/core/kernel-wire';
import type { KernelInstance } from './kernel-wire';

const log = createLogger('almadar:ui:kernel-client');

type MountOutcome = Awaited<ReturnType<ClientKernel['dispatchMount']>>;
type MountHooks = Parameters<ClientKernel['dispatchMount']>[1];
type MountBase = Parameters<ClientKernel['dispatchMount']>[2];
type ServerEffects = NonNullable<ClientKernelOutcome['serverEffects']>;

export interface KernelClient extends ClientKernel {
  /** One host frame of the kernel's tick clock; each tick's cascade is an outcome. Never waits on the dispatch queue. */
  frame(nowMs: number): Promise<ClientKernelOutcome[]>;
  framePause(): void;
  frameResume(): void;
  /**
   * Drive the tick clock: one host frame per scheduled frame (`requestAnimationFrame` unless the host gives its own
   * clock), paused while the document is hidden. The kernel decides which ticks are due; `onFrame` paints the outcomes.
   * Returns the stop.
   */
  startFrames(onFrame: (outcomes: ClientKernelOutcome[]) => void, schedule?: FrameScheduler): () => void;
  /** Declare a new mount (a page switch): the tick clock runs the ticks of `traits` only. Applied before the next frame. */
  remount(traits: readonly string[]): Promise<void>;
  /** Add traits to the current mount; the first mount declared scopes the tick clock to it. */
  mount(traits: readonly string[]): Promise<void>;
  /** Traits leaving the mount: their ticks stop. */
  unmount(traits: readonly string[]): Promise<void>;
  /** The kernel's current state of a trait; `undefined` until the WebAssembly is loaded. */
  traitState(traitName: string): string | undefined;
}

export interface KernelClientOptions {
  instance: Promise<KernelInstance>;
  store: CircuitStore;
  traitIndex: TraitIndex;
  transport?: EventTransport;
  /** The transport's confirmed topology: a stateful host is posted legs without the circuit state they carry. */
  topology: Promise<{ carriesCircuitState: boolean }>;
  /** Hears every executed hop of every response the kernel produces (the verification timeline). */
  observer?: TransitionObserver;
}

const defaultFrameScheduler: FrameScheduler = (callback) => {
  if (typeof requestAnimationFrame === 'function') {
    const handle = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(handle);
  }
  const timer = setTimeout(() => callback(performance.now()), 16);
  return () => clearTimeout(timer);
};

function parse<T>(text: string): T {
  return JSON.parse(text);
}

function payloadJson(payload: EventPayload | undefined): string | undefined {
  return payload === undefined ? undefined : JSON.stringify(payload);
}

function stripCircuitState(leg: OrbitalEventRequest): OrbitalEventRequest {
  const stripped: OrbitalEventRequest = { ...leg };
  delete stripped.traits;
  delete stripped.entityByTrait;
  return stripped;
}

export function createKernelClient(opts: KernelClientOptions): KernelClient {
  const { store, traitIndex, transport } = opts;
  let loaded: KernelInstance | undefined;
  const ready = opts.instance.then((k) => {
    loaded = k;
    return k;
  });
  // The load failure reaches every call that awaits `ready`; a client nothing dispatches through stays quiet.
  ready.catch(() => undefined);

  let queueTail: Promise<void> = Promise.resolve();
  const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
    const result = queueTail.then(run);
    queueTail = result.then(() => undefined, () => undefined);
    return result;
  };
  let progressTail: Promise<void> = Promise.resolve();
  // Mount declarations apply in call order and before any frame that follows them.
  let scopeTail: Promise<void> = Promise.resolve();
  const declareScope = (apply: (k: KernelInstance) => void): Promise<void> => {
    const applied = scopeTail.then(() => ready).then(apply);
    scopeTail = applied.then(() => undefined, () => undefined);
    return applied;
  };

  const mirror = (response: OrbitalEventResponse): void => {
    for (const [trait, state] of Object.entries(response.states)) {
      if (store.manager.getState(trait)?.currentState !== state) store.manager.seedState(trait, state);
    }
    for (const [trait, row] of Object.entries(response.entityByTrait ?? {})) {
      const frameKey = traitIndex.byName.get(trait)?.frameKey;
      if (frameKey === undefined) continue;
      store.frames.set(frameKey, { ...(store.frames.get(frameKey) ?? {}), ...row });
    }
    for (const effect of response.clientEffectsByTrait ?? []) {
      if (effect.callsitePayload !== undefined) store.callsitePayloads.set(effect.traitName, effect.callsitePayload);
    }
  };

  const trace = (response: OrbitalEventResponse): void => {
    const observer = opts.observer;
    if (observer === undefined) return;
    for (const hop of response.transitions ?? []) {
      observer.onTransition({
        traitName: hop.trait,
        from: hop.from,
        to: hop.to,
        event: hop.event,
        ...(hop.guardResult !== undefined ? { guardResult: hop.guardResult } : {}),
        effects: hop.effects,
      });
    }
  };

  const syncStates = (k: KernelInstance, traits: readonly string[]): void => {
    for (const trait of traits) {
      const state = k.getState(trait);
      if (state !== '' && store.manager.getState(trait)?.currentState !== state) store.manager.seedState(trait, state);
    }
  };

  const restore = (k: KernelInstance, wire: DispatchWire, entityId: string | undefined): ServerEffects => {
    const snapshot: TraitSnapshot | null = wire.snapshot;
    if (snapshot === null) return { clientEffects: [], clientEffectsByTrait: [] };
    const trait = wire.seed.trait;
    const repaint = parse<OrbitalEventResponse>(k.restore(trait, entityId, JSON.stringify(snapshot)));
    const frameKey = traitIndex.byName.get(trait)?.frameKey ?? trait;
    if (snapshot.state !== '') store.manager.rollbackState(trait, snapshot.state, entityId, 'server-rejected');
    const entity = snapshot.entity;
    if (entity !== null && typeof entity === 'object' && !Array.isArray(entity)) store.frames.set(frameKey, { ...entity });
    else store.frames.delete(frameKey);
    mirror(repaint);
    store.notify();
    return { clientEffects: repaint.clientEffects ?? [], clientEffectsByTrait: repaint.clientEffectsByTrait ?? [] };
  };

  interface Posted {
    response: OrbitalEventResponse;
    serverEffects: ServerEffects;
    success: boolean;
    error?: string;
    rejections: TransitionRejection[];
    foldedEmits: OrbitalEventResponse['emittedEvents'];
    rolledBack?: ServerEffects;
  }

  /** One request to post and what folding its answer needs. */
  interface PlannedLeg {
    orbital: string;
    leg: OrbitalEventRequest;
    /** The leg keeps the circuit state it carries (a stateless host, or a seed no host holds). */
    keepsState: boolean;
    alreadyDelivered: Array<[string, string]>;
    foldSeeded: string[];
    /** The dispatches this leg answers for: rolled back when it fails. */
    wires: DispatchWire[];
  }

  const planDispatch = (wire: DispatchWire, carriesCircuitState: boolean): { legs: PlannedLeg[]; awaiting: AwaitingTrait[] } => {
    if (wire.serverLegs.length > 0) {
      return {
        awaiting: wire.awaiting,
        legs: wire.serverLegs.map(({ orbital, leg }) => ({
          orbital,
          leg,
          keepsState: carriesCircuitState || wire.mode === 'hybridClientOnly',
          alreadyDelivered: wire.alreadyDelivered,
          foldSeeded: wire.foldSeeded,
          wires: [wire],
        })),
      };
    }
    // A host that holds the circuit state is posted the event itself, so it advances its copy.
    if (!carriesCircuitState && wire.statefulLeg !== null) {
      return {
        awaiting: wire.statefulLeg.awaiting,
        legs: [{ orbital: wire.statefulLeg.orbital, leg: wire.statefulLeg.leg, keepsState: true, alreadyDelivered: wire.alreadyDelivered, foldSeeded: [], wires: [wire] }],
      };
    }
    return { legs: [], awaiting: [] };
  };

  /** Send each planned leg and fold each answer through the kernel. */
  const sendLegs = async (
    k: KernelInstance,
    legs: readonly PlannedLeg[],
    request: Pick<OrbitalEventRequest, 'locale' | 'entityId'>,
    flags: { rollback: boolean; mount: boolean },
    initial: OrbitalEventResponse,
  ): Promise<Posted> => {
    const out: Posted = {
      response: initial,
      serverEffects: { clientEffects: [], clientEffectsByTrait: [] },
      success: true,
      rejections: [],
      foldedEmits: [],
    };
    if (transport === undefined) return out;
    // A fold can owe the host more (a refetch after a browser-stored write): those legs follow, in order.
    const queue = [...legs];
    for (let planned = queue.shift(); planned !== undefined; planned = queue.shift()) {
      const shaped = planned.keepsState ? planned.leg : stripCircuitState(planned.leg);
      const sent: OrbitalEventRequest = request.locale !== undefined ? { ...shaped, locale: request.locale } : shaped;
      const base = k.foldBase(sent.entityByTrait !== undefined ? JSON.stringify(sent.entityByTrait) : undefined, JSON.stringify(planned.foldSeeded), sent.entityId);
      let posted: OrbitalEventResponse;
      try {
        posted = await transport.send(planned.orbital, sent);
      } catch (err) {
        if (flags.rollback || flags.mount) for (const wire of planned.wires) restore(k, wire, request.entityId);
        throw err instanceof Error ? err : new Error(String(err));
      }
      if (!posted.success) {
        const optimistic = planned.wires.filter((wire) => wire.mode === 'runtimeOptimistic');
        if (flags.rollback && optimistic.length > 0) {
          return { ...out, response: posted, success: false, rolledBack: restore(k, optimistic[0]!, request.entityId) };
        }
        if (flags.mount) for (const wire of optimistic) restore(k, wire, request.entityId);
      }
      const applied = parse<AppliedWire>(k.applyServerResponse(JSON.stringify(posted), JSON.stringify(planned.alreadyDelivered), base));
      // The kernel reconciles the server's states and rows but hands back only the cascade it ran: the
      // server's own renders and emits are the host's to carry, and the states are read back from the kernel.
      log.debug('fold', { orbital: planned.orbital, event: sent.event, posted: { success: posted.success, states: posted.states, emitted: posted.emittedEvents.map((e) => e.event) }, applied: applied.applied, cascadeEmitted: applied.response.emittedEvents.map((e) => e.event) });
      trace(applied.response);
      for (const routed of applied.serverLegs) {
        queue.push({ orbital: routed.orbital, leg: routed.leg, keepsState: true, alreadyDelivered: [], foldSeeded: [], wires: [] });
      }
      mirror(posted);
      mirror(applied.response);
      syncStates(k, [...Object.keys(posted.states), ...applied.applied.map(([trait]) => trait)]);
      store.notify();
      const fold = applied.response;
      const delivered = new Set(planned.alreadyDelivered.map(([trait, event]) => `${trait}\u0000${event}`));
      const serverEmits = posted.emittedEvents.filter((e) => !delivered.has(`${e.source?.trait ?? ''}\u0000${e.event}`));
      const effects = [...(posted.clientEffects ?? []), ...(fold.clientEffects ?? [])];
      const byTrait = [...(posted.clientEffectsByTrait ?? []), ...(fold.clientEffectsByTrait ?? [])];
      out.serverEffects.clientEffects?.push(...effects);
      out.serverEffects.clientEffectsByTrait?.push(...byTrait);
      out.foldedEmits.push(...serverEmits, ...fold.emittedEvents);
      out.response = {
        ...out.response,
        emittedEvents: [...out.response.emittedEvents, ...serverEmits, ...fold.emittedEvents],
        clientEffects: [...(out.response.clientEffects ?? []), ...effects],
        clientEffectsByTrait: [...(out.response.clientEffectsByTrait ?? []), ...byTrait],
        effectResults: [...(out.response.effectResults ?? []), ...(fold.effectResults ?? [])],
      };
      out.success = out.success && posted.success;
      if (posted.error !== undefined) out.error = posted.error;
      out.rejections.push(...(fold.rejections ?? []).filter((r) => r.code === 'effect-failed'));
    }
    return out;
  };

  /** Post every leg of one dispatch (the awaiting window spans the sends). */
  const post = async (
    k: KernelInstance,
    wire: DispatchWire,
    request: Pick<OrbitalEventRequest, 'locale' | 'entityId'>,
    flags: { rollback: boolean; awaiting: boolean },
  ): Promise<Posted> => {
    const topology = await opts.topology;
    const plan = planDispatch(wire, topology.carriesCircuitState);
    const awaiting = flags.awaiting ? plan.awaiting : [];
    store.awaiting.begin(awaiting);
    try {
      return await sendLegs(k, plan.legs, request, { rollback: flags.rollback, mount: false }, wire.response);
    } finally {
      store.awaiting.end(awaiting.map((a) => a.trait));
    }
  };

  const dispatchOne = async (request: OrbitalEventRequest, hooks: ClientDispatchHooks[], progress: boolean): Promise<ClientKernelOutcome> => {
    const traitName = request.targetTrait;
    if (traitName === undefined) throw new Error('dispatch requires request.targetTrait (the seed trait)');
    const k = await ready;
    const indexed = traitIndex.byName.get(traitName);
    if (request.runTick !== undefined) {
      const response = parse<OrbitalEventResponse>(k.tick(request.runTick.trait, request.runTick.tick, request.entityId));
      mirror(response);
      store.notify();
      return { response, mode: indexed?.dispatchMode ?? 'hybridClientOnly' };
    }
    const wire = parse<DispatchWire>(k.dispatch(traitName, request.entityId, request.event, payloadJson(request.payload)));
    log.debug('dispatch', { trait: traitName, event: request.event, mode: wire.mode, legs: wire.serverLegs.length, success: wire.response.success, states: wire.response.states, effects: (wire.response.clientEffectsByTrait ?? []).map((e) => `${e.traitName}:${e.effect[0]}:${e.effect[1] ?? ''}`), emitted: wire.response.emittedEvents.map((e) => e.event) });
    trace(wire.response);
    mirror(wire.response);
    store.notify();
    if (transport === undefined || (wire.serverLegs.length === 0 && wire.statefulLeg === null)) return { response: wire.response, mode: wire.mode };
    const painters = hooks.filter((h) => h.onLocal !== undefined);
    for (const h of painters) h.onLocal?.(wire.response);
    const posted = await post(k, wire, request, { rollback: true, awaiting: !progress });
    const localPainted = painters.length > 0;
    if (posted.rolledBack !== undefined) {
      return { response: posted.response, mode: wire.mode, ...(localPainted ? { localPainted, serverEffects: posted.rolledBack } : {}) };
    }
    return localPainted
      ? { response: posted.response, mode: wire.mode, localPainted, serverEffects: posted.serverEffects }
      : { response: posted.response, mode: wire.mode };
  };

  const client: KernelClient = {
    store,
    dispatch: (request, hooks) => enqueue(() => dispatchOne(request, hooks !== undefined ? [hooks] : [], false)),
    dispatchProgress: (request) => {
      const outcome = progressTail.then(() => dispatchOne(request, [], true));
      progressTail = outcome.then(() => undefined, () => undefined);
      return outcome;
    },
    foldHostDispatch: (request, response) => enqueue(async () => {
      const k = await ready;
      const mode = (request.targetTrait !== undefined ? traitIndex.byName.get(request.targetTrait)?.dispatchMode : undefined) ?? 'persistedAwaited';
      if (!response.success) return { response: { ...response, clientEffects: [], clientEffectsByTrait: [] }, mode };
      const applied = parse<AppliedWire>(k.applyServerResponse(JSON.stringify(response), '[]'));
      trace(applied.response);
      mirror(response);
      mirror(applied.response);
      syncStates(k, [...Object.keys(response.states), ...applied.applied.map(([trait]) => trait)]);
      store.notify();
      return {
        response: {
          ...response,
          clientEffects: [...(response.clientEffects ?? []), ...(applied.response.clientEffects ?? [])],
          clientEffectsByTrait: [...(response.clientEffectsByTrait ?? []), ...(applied.response.clientEffectsByTrait ?? [])],
        },
        mode,
      };
    }),
    dispatchMount: (seeds, hooks?: MountHooks, base?: MountBase) => enqueue(async (): Promise<MountOutcome> => {
      const k = await ready;
      await scopeTail;
      const baseRequest = base ?? {};
      k.mount(JSON.stringify(seeds.map((s) => s.trait)));
      const mount = parse<MountWire>(k.dispatchMount(JSON.stringify(seeds), baseRequest.entityId, payloadJson(baseRequest.payload)));
      if (mount.failed !== null) {
        const failed = mount.failed;
        throw new TraitMountError(failed.trait, failed.event, new Error(failed.message));
      }
      const wires = mount.seeds;
      for (const wire of wires) {
        log.debug('mount', { trait: wire.seed.trait, event: wire.seed.event, mode: wire.mode, legs: wire.serverLegs.length, success: wire.response.success });
        trace(wire.response);
        mirror(wire.response);
      }
      store.notify();
      for (const wire of wires) hooks?.onLocal?.(wire.seed.trait, wire.response);
      const outcome: MountOutcome = {
        seeds: wires.map((w) => ({ trait: w.seed.trait, event: w.seed.event, mode: w.mode, local: w.response })),
        posted: false,
        success: true,
        rejections: [],
        serverEffects: { clientEffects: [], clientEffectsByTrait: [] },
        emittedEvents: [],
      };
      if (transport === undefined) return outcome;
      const topology = await opts.topology;
      for (const group of topology.carriesCircuitState ? mount.legs : mount.statefulLegs) {
        const answered = wires.filter((w) => group.seeds.some((s) => s.trait === w.seed.trait && s.event === w.seed.event));
        const planned: PlannedLeg = { orbital: group.orbital, leg: group.leg, keepsState: true, alreadyDelivered: group.alreadyDelivered, foldSeeded: group.foldSeeded, wires: answered };
        store.awaiting.begin(group.awaiting);
        let posted: Posted;
        try {
          posted = await sendLegs(k, [planned], baseRequest, { rollback: false, mount: true }, answered[0]?.response ?? outcome.seeds[0]!.local);
        } finally {
          store.awaiting.end(group.awaiting.map((a) => a.trait));
        }
        outcome.posted = true;
        outcome.success = outcome.success && posted.success;
        if (posted.error !== undefined) outcome.error = posted.error;
        outcome.rejections.push(...posted.rejections);
        outcome.serverEffects.clientEffects?.push(...(posted.serverEffects.clientEffects ?? []));
        outcome.serverEffects.clientEffectsByTrait?.push(...(posted.serverEffects.clientEffectsByTrait ?? []));
        outcome.emittedEvents.push(...posted.foldedEmits);
      }
      return outcome;
    }),
    remount: (traits) => declareScope((k) => k.remount(JSON.stringify(traits))),
    mount: (traits) => declareScope((k) => k.mount(JSON.stringify(traits))),
    unmount: (traits) => declareScope((k) => k.unmount(JSON.stringify(traits))),
    frame: async (nowMs) => {
      const k = await ready;
      await scopeTail;
      const text = k.frame(nowMs);
      if (text === undefined) return [];
      const wire = parse<FrameWire>(text);
      for (const message of wire.errors) log.warn('frame-tick-failed', { error: message });
      mirror(wire.response);
      for (const d of wire.dispatches) {
        trace(d.response);
        mirror(d.response);
      }
      store.notify();
      const outcomes: ClientKernelOutcome[] = [{ response: wire.response, mode: 'hybridClientOnly' }];
      // A tick's data in the browser store is written by the leg the kernel hands back; its answer is folded like any other.
      for (const routed of wire.browserLegs) {
        if (transport === undefined) continue;
        const planned: PlannedLeg = { orbital: routed.orbital, leg: routed.leg, keepsState: true, alreadyDelivered: [], foldSeeded: [], wires: [] };
        const tickSettled = sendLegs(k, [planned], {}, { rollback: false, mount: false }, wire.response).then(
          (posted): Pick<OrbitalEventResponse, 'clientEffects' | 'clientEffectsByTrait'> => posted.serverEffects,
          (err) => {
            log.warn('tick-browser-leg-failed', { trait: routed.leg.targetTrait, error: String(err) });
            return undefined;
          },
        );
        outcomes.push({ response: { success: true, transitioned: false, states: {}, emittedEvents: [] }, mode: 'hybridClientOnly', tickSettled });
      }
      for (const d of wire.dispatches) {
        if (transport === undefined || (d.serverLegs.length === 0 && d.statefulLeg === null)) {
          outcomes.push({ response: d.response, mode: d.mode });
          continue;
        }
        const tickSettled = post(k, d, {}, { rollback: false, awaiting: false }).then(
          (posted): Pick<OrbitalEventResponse, 'clientEffects' | 'clientEffectsByTrait'> => posted.serverEffects,
          (err) => {
            log.warn('tick-post-failed', { trait: d.trait, error: String(err) });
            return undefined;
          },
        );
        outcomes.push({ response: d.response, mode: d.mode, tickSettled });
      }
      return outcomes;
    },
    framePause: () => loaded?.framePause(),
    frameResume: () => loaded?.frameResume(),
    startFrames: (onFrame, schedule = defaultFrameScheduler) => {
      let stopped = false;
      let cancel: (() => void) | undefined;
      const step = (nowMs: number): void => {
        void client.frame(nowMs).then(
          (outcomes) => { if (!stopped && outcomes.length > 0) onFrame(outcomes); },
          (error: Error) => log.error('kernel-frame-failed', { error: error.message }),
        ).then(() => { if (!stopped) cancel = schedule(step); });
      };
      const onVisibility = (): void => {
        if (document.visibilityState === 'hidden') client.framePause();
        else client.frameResume();
      };
      document.addEventListener('visibilitychange', onVisibility);
      cancel = schedule(step);
      return () => {
        stopped = true;
        cancel?.();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
    traitState: (traitName) => loaded?.getState(traitName),
  };
  return client;
}
