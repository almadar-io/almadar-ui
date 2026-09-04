'use client';
/**
 * OrbitalPluginHost — runs an ordinary behavior headless against the
 * AMBIENT event bus + slot provider (Almadar Studio V4 §14 plan, Part F1).
 *
 * A "plugin" is not a new kind of artifact: it is a `.lolo` behavior a host
 * chooses to run in its own `OrbitalServerRuntime`, wired to the SAME bus
 * and slots every other UI component uses. One runtime per plugin (mirrors
 * `BrowserPlayground`'s single-schema mount, generalized over a list).
 * Default policy denies nothing — a plugin has the full behavior power a
 * preview has (in-memory persist, mock services); `deny` is an opt-in
 * host policy, never a default sandbox.
 *
 * OUTBOUND = the runtime's internal event bus, not the direct dispatch
 * response. `response.emittedEvents` (mock mode) reflects only the effects
 * of the trait `dispatch()` DIRECTLY targeted — a sibling trait that reacts
 * through the runtime's own cascade (`setupEventListeners`, a SEPARATE
 * `processOrbitalEvent` call whose response is discarded) never shows up
 * there, so its emits never reached the ambient bus (verified 2026-09-04:
 * vim-mode's `Shell` relays `PLUGIN_ENABLED` -> `VimStudioBridge`'s
 * `ENABLED` arm emits `STATUS` + 2x `REGISTER_COMMAND`, none of which
 * reached the studio's status bar/palette). Fix: for `mode: 'mock'`, one
 * `runtime.getEventBus().onAny(...)` subscription per plugin (mounted
 * alongside the runtime, not per-dispatch) is the ONLY outbound path — it
 * sees every emit, direct or cascaded, since every `emit` effect passes
 * through that same bus. `mode: 'server'` has no local bus to subscribe to
 * (the runtime lives on the remote transport), so it keeps reading
 * `response.emittedEvents` for outbound — same single-hop-only limitation
 * this fix removes for mock mode, unaddressed here (no `mode: 'server'`
 * consumer exists yet; see `docs/Almadar_UI_Gaps.md`).
 *
 * RELAY RULE: the plugin's `inbound[]` is its host→plugin vocabulary — one
 * `UI:<busEvent>` bus event per row, dispatching `trigger` at
 * `orbital`/`trait`. Anything a plugin emits under one of those SAME
 * busEvent names (or under an inbound `trigger` name) is a relay for its
 * own siblings' `listens {}` (the runtime's internal event bus already
 * carries that fan-out), never a fresh request back to the host, and must
 * NEVER be re-broadcast — doing so re-fires the very `UI:<busEvent>`
 * listener that produced it, a synchronous self-feeding loop (verified
 * 2026-09-04, see `docs/Almadar_UI_Gaps.md`).
 *
 * @packageDocumentation
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import type { EffectHandlers, TraitState } from '@almadar/runtime';
import type {
  BusEventSource,
  EventPayload,
  OrbitalSchema,
  Trait,
  TraitConfigValue,
  UISlot,
} from '@almadar/core';
import { UI_SLOTS } from '@almadar/core';
import { createLogger } from '@almadar/logger';
import { useEventBus } from '../hooks/useEventBus';
import { useUISlots, type UISlotManager } from '../providers/UISlotContext';
import type { ServerBridgeTransport } from '../providers/ServerBridge';
import type { KeyCaptureTable } from '../hooks/useKeyboardRouter';

const log = createLogger('almadar:ui:plugin-host');

/**
 * The two dispatch paths (`OrbitalServerRuntime.processOrbitalEvent` and
 * `ServerBridgeTransport.sendEvent`) return SEPARATE `OrbitalEventResponse`
 * declarations (the transport's is a module-private interface in
 * `ServerBridge.tsx`, structurally close but not the same nominal type —
 * `emittedEvents` is optional there, required on the runtime's). This is
 * the structural subset this file actually reads, satisfied by both.
 */
interface PluginDispatchResponse {
  success: boolean;
  states: Record<string, string>;
  emittedEvents?: Array<{ event: string; payload?: EventPayload; source?: BusEventSource }>;
  error?: string;
}

const UI_SLOT_SET: ReadonlySet<string> = new Set(UI_SLOTS);
function isUISlot(value: string): value is UISlot {
  return UI_SLOT_SET.has(value);
}

/** Verbs a host may deny. Never includes `emit` — the runtime's own emit
 *  handler drives the internal `listens` cascade and must never be replaced. */
export type PluginHostDenyVerb = 'persist' | 'call-service' | 'navigate' | 'notify';

/** One bus-event → orbital-event wiring: `UI:<busEvent>` dispatches `trigger` at `orbital`/`trait`. */
export interface PluginHostInbound {
  busEvent: string;
  orbital: string;
  trait: string;
  trigger: string;
}

export interface PluginHostPlugin {
  id: string;
  schema: OrbitalSchema;
  inbound: PluginHostInbound[];
}

export interface OrbitalPluginHostProps {
  plugins: PluginHostPlugin[];
  /** 'mock' (default): in-memory persist, mock services — full behavior power, as any preview.
   *  'server': dispatch through `transport` instead of a local runtime, as `AlmadarApp`. */
  mode?: 'mock' | 'server';
  /** Required when `mode === 'server'`. */
  transport?: ServerBridgeTransport;
  /** OPTIONAL policy: verbs listed here are denied with a logged warning, never a throw. Default: none denied. */
  deny?: PluginHostDenyVerb[];
  navigate?: (path: string) => void;
  notify?: (message: string, type?: string) => void;
  onTransition?: (pluginId: string, orbital: string, trait: string, state: string) => void;
  children?: ReactNode;
}

interface OrbitalPluginHostContextValue {
  getState: (pluginId: string, orbital: string, trait: string) => TraitState | undefined;
  lastEvent: (pluginId: string) => string | undefined;
  errors: Readonly<Record<string, string>>;
  tick: number;
  getPluginSchema: (pluginId: string) => OrbitalSchema | undefined;
}

const OrbitalPluginHostContext = createContext<OrbitalPluginHostContextValue | null>(null);

function useOrbitalPluginHostContext(caller: string): OrbitalPluginHostContextValue {
  const ctx = useContext(OrbitalPluginHostContext);
  if (!ctx) {
    throw new Error(`${caller} must be used within an <OrbitalPluginHost>.`);
  }
  return ctx;
}

/** Narrows `OrbitalServerRuntime.getState(orbital, trait)`'s two-shape return to the single-trait case. */
function isTraitState(value: TraitState | Record<string, TraitState> | undefined): value is TraitState {
  return value !== undefined && typeof (value as TraitState).currentState === 'string';
}

function toTraitState(
  runtime: OrbitalServerRuntime | undefined,
  orbital: string,
  trait: string,
  stateName: string,
  lastEvent: string,
): TraitState {
  if (runtime) {
    const raw = runtime.getState(orbital, trait);
    if (isTraitState(raw)) return raw;
  }
  // 'server' mode (or a mock runtime that hasn't caught up yet): synthesize
  // from the dispatch response's `states` map — currentState is all it carries.
  return { traitName: trait, currentState: stateName, previousState: null, lastEvent, context: {} };
}

function isKeymapValue(value: TraitConfigValue | undefined): value is Readonly<Record<string, ReadonlyArray<string>>> {
  if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((entry) => Array.isArray(entry) && entry.every((k) => typeof k === 'string'));
}

/** Finds the trait AS AUTHORED INLINE on the plugin's own schema (not a `{ref, ...}` call-site wrapper). */
function findInlineTrait(schema: OrbitalSchema, orbitalName: string, traitName: string): Trait | undefined {
  const orbital = schema.orbitals.find((o) => o.name === orbitalName);
  if (!orbital) return undefined;
  for (const ref of orbital.traits) {
    if (typeof ref === 'string') continue;
    if ('ref' in ref) continue;
    if (ref.name === traitName) return ref;
  }
  return undefined;
}

function readKeymapConfig(trait: Trait | undefined, knob: string): Readonly<Record<string, ReadonlyArray<string>>> {
  const declared = trait?.config?.[knob]?.default;
  return isKeymapValue(declared) ? declared : {};
}

/** Trait names declared on an orbital, across all three `TraitRef` shapes. A
 *  `{ref, ...}` wrapper with no call-site rename is skipped — its resolved
 *  name isn't knowable without a loader, and a compiled `.orb` plugin schema
 *  carries fully-inlined `Trait` objects for its own orbitals anyway. */
function traitNamesOf(orbital: OrbitalSchema['orbitals'][number]): string[] {
  const names: string[] = [];
  for (const ref of orbital.traits) {
    if (typeof ref === 'string') {
      names.push(ref);
    } else if ('ref' in ref) {
      if (ref.name) names.push(ref.name);
    } else {
      names.push(ref.name);
    }
  }
  return names;
}

/**
 * Reads the declared `keymap` config knob off the plugin's own trait and the
 * live `currentState`, so `useKeyboardRouter`'s capture table always follows
 * the trait's actual mode. Re-derives whenever the host records a new
 * transition (the context's `tick`).
 */
export function useDeclaredCaptureTable(opts: {
  pluginId: string;
  orbital: string;
  trait: string;
  keymapKnob?: string;
  target?: string;
}): KeyCaptureTable {
  const { pluginId, orbital, trait, keymapKnob = 'keymap', target = 'shell' } = opts;
  const ctx = useOrbitalPluginHostContext('useDeclaredCaptureTable');

  return useMemo(() => {
    const schema = ctx.getPluginSchema(pluginId);
    const inlineTrait = schema ? findInlineTrait(schema, orbital, trait) : undefined;
    const keymap = readKeymapConfig(inlineTrait, keymapKnob);
    const currentState = ctx.getState(pluginId, orbital, trait)?.currentState;
    const keys = currentState !== undefined ? (keymap[currentState] ?? []) : [];
    return { [target]: { mode: currentState ?? 'unknown', keys: new Set(keys) } };
  }, [ctx, pluginId, orbital, trait, keymapKnob, target]);
}

export function useOrbitalPluginHost(): {
  getState: (pluginId: string, orbital: string, trait: string) => TraitState | undefined;
  lastEvent: (pluginId: string) => string | undefined;
  errors: Readonly<Record<string, string>>;
} {
  const ctx = useOrbitalPluginHostContext('useOrbitalPluginHost');
  return { getState: ctx.getState, lastEvent: ctx.lastEvent, errors: ctx.errors };
}

function buildMockEffectHandlers(opts: {
  pluginId: string;
  denySet: ReadonlySet<PluginHostDenyVerb>;
  slotsRef: React.MutableRefObject<UISlotManager>;
  navigateRef: React.MutableRefObject<((path: string) => void) | undefined>;
  notifyRef: React.MutableRefObject<((message: string, type?: string) => void) | undefined>;
}): Partial<EffectHandlers> {
  const { pluginId, denySet, slotsRef, navigateRef, notifyRef } = opts;

  // `renderUI` is never deny-gated: rendering into the ambient slots IS the
  // plugin's UI surface, not a policy-restricted capability. `slotsRef` keeps
  // the closure fresh without recreating the runtime (BrowserPlayground
  // precedent: the runtime is constructed once, effect handlers read refs).
  const handlers: Partial<EffectHandlers> = {
    renderUI: (slot, pattern, props, priority) => {
      if (!isUISlot(slot)) {
        log.warn('renderUI:unknown-slot', { pluginId, slot });
        return;
      }
      if (pattern === null) {
        slotsRef.current.clear(slot);
        return;
      }
      slotsRef.current.render({ target: slot, pattern: pattern.type, props, priority, sourceTrait: pluginId });
    },
  };

  if (denySet.has('navigate')) {
    handlers.navigate = (path) => log.warn('navigate:denied', { pluginId, path });
  } else if (navigateRef.current) {
    handlers.navigate = (path) => navigateRef.current?.(path);
  }

  if (denySet.has('notify')) {
    handlers.notify = (message, type) => log.warn('notify:denied', { pluginId, message, type });
  } else if (notifyRef.current) {
    handlers.notify = (message, type) => notifyRef.current?.(message, type);
  }

  // persist/call-service: present ONLY when denied. Absent, the runtime's
  // own built-in handlers stay in force — the in-memory mock persistence
  // store and mock service responses every preview already gets.
  if (denySet.has('persist')) {
    handlers.persist = async (action, entityType) => {
      log.warn('persist:denied', { pluginId, action, entityType });
      return undefined;
    };
  }

  if (denySet.has('call-service')) {
    handlers.callService = async (service, action) => {
      log.warn('call-service:denied', { pluginId, service, action });
      return null;
    };
  }

  return handlers;
}

interface PluginRuntimeMountProps {
  plugin: PluginHostPlugin;
  mode: 'mock' | 'server';
  transport?: ServerBridgeTransport;
  deny?: PluginHostDenyVerb[];
  navigate?: (path: string) => void;
  notify?: (message: string, type?: string) => void;
  onTransition?: OrbitalPluginHostProps['onTransition'];
  /** `trigger === null` marks a post-registration initial-state snapshot — not an actual dispatch. */
  onDispatched: (
    pluginId: string,
    trigger: string | null,
    states: ReadonlyArray<readonly [string, string, TraitState]>,
  ) => void;
  onError: (pluginId: string, message: string) => void;
}

function PluginRuntimeMount({
  plugin,
  mode,
  transport,
  deny,
  navigate,
  notify,
  onTransition,
  onDispatched,
  onError,
}: PluginRuntimeMountProps): null {
  const bus = useEventBus();
  const slots = useUISlots();
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // One runtime per plugin, created once (StrictMode-safe: the constructor
  // + register() below tolerate the dev double-invoke exactly like
  // BrowserPlayground's `useState`-held runtime). `deny`'s SHAPE (which
  // verbs are stubbed at all) is fixed at this first render — matching
  // OrbitalServerRuntime's own effectHandlers, which aren't hot-swapped
  // after construction either. The actual navigate/notify function VALUES
  // stay live via the refs above.
  const [mockRuntime] = useState<OrbitalServerRuntime | undefined>(() => {
    if (mode !== 'mock') return undefined;
    return new OrbitalServerRuntime({
      mode: 'mock',
      debug: false,
      effectHandlers: buildMockEffectHandlers({
        pluginId: plugin.id,
        denySet: new Set(deny ?? []),
        slotsRef,
        navigateRef,
        notifyRef,
      }),
    });
  });

  const registrationReady = useMemo(() => {
    if (mockRuntime) return mockRuntime.register(plugin.schema);
    if (mode === 'server' && transport) return transport.register(plugin.schema);
    return Promise.resolve();
  }, [mockRuntime, transport, mode, plugin.schema]);

  useEffect(() => {
    if (mode === 'server' && !transport) {
      onError(plugin.id, 'OrbitalPluginHost: mode "server" requires a transport');
    }
  }, [mode, transport, plugin.id, onError]);

  // Deferred unmount cleanup — BrowserPlayground.tsx precedent. React
  // StrictMode's dev double-mount runs setup → cleanup → setup; an immediate
  // teardown here would unregister the orbital the real mount still needs.
  const teardownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (teardownTimerRef.current !== null) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }
    return () => {
      teardownTimerRef.current = setTimeout(() => {
        teardownTimerRef.current = null;
        if (mockRuntime) {
          mockRuntime.unregisterAll();
        } else if (mode === 'server' && transport) {
          void transport.unregister();
        }
      }, 0);
    };
  }, [mockRuntime, transport, mode]);

  const ownOrbitals = useMemo(
    () => new Set(plugin.schema.orbitals.map((o) => o.name)),
    [plugin.schema],
  );

  // The plugin's own inbound vocabulary — see the file-header note on the
  // relay rule. Any event this plugin emits under one of these names is the
  // host's own trigger being relayed to a sibling `listens {}`, never a
  // fresh request back to the host.
  const inboundBusEvents = useMemo(
    () => new Set(plugin.inbound.map((row) => row.busEvent)),
    [plugin.inbound],
  );

  // Belt-and-braces relay guard: the inbound TRIGGER names too (distinct
  // from `busEvent` whenever a row renames on the way in, e.g. `PING` ->
  // `HOST_PING`). `processOrbitalEvent`'s own dispatch of the trigger never
  // puts it on the internal bus by itself (only an explicit `emit` effect
  // does), but a schema that re-emits its own trigger name as an effect
  // must not have that treated as a fresh outbound request either.
  const inboundTriggerNames = useMemo(
    () => new Set(plugin.inbound.map((row) => row.trigger)),
    [plugin.inbound],
  );

  // Full snapshot of every trait's CURRENT state, across every orbital this
  // plugin owns. Shared by the initial post-registration seed below and by
  // the cascade resync effect that follows it.
  const snapshotAllStates = useCallback((): Array<readonly [string, string, TraitState]> => {
    const states: Array<readonly [string, string, TraitState]> = [];
    if (!mockRuntime) return states;
    for (const orbital of plugin.schema.orbitals) {
      // Per-trait `getState(orbital, trait)` lazily initializes on first
      // read (`StateMachineManager.getOrInitState`); the bulk
      // `getState(orbital)` form does NOT — it only reflects traits that
      // have already processed an event, so it can't seed the snapshot.
      for (const traitName of traitNamesOf(orbital)) {
        const raw = mockRuntime.getState(orbital.name, traitName);
        if (isTraitState(raw)) states.push([orbital.name, traitName, raw]);
      }
    }
    return states;
  }, [mockRuntime, plugin.schema]);

  // Snapshot every trait's INITIAL state as soon as registration completes,
  // so `useOrbitalPluginHost().getState` / `useDeclaredCaptureTable` read the
  // real starting state instead of "no data yet" before the first dispatch.
  useEffect(() => {
    let cancelled = false;
    void registrationReady.then(() => {
      if (cancelled || !mockRuntime) return;
      const states = snapshotAllStates();
      if (states.length > 0) onDispatched(plugin.id, null, states);
    }).catch((err) => {
      if (!cancelled) onError(plugin.id, err instanceof Error ? err.message : String(err));
    });
    return () => {
      cancelled = true;
    };
  }, [registrationReady, mockRuntime, plugin, onDispatched, onError, snapshotAllStates]);

  // Cascade resync: a cross-trait `listens {}` fan-out fires through the
  // runtime's OWN internal event-bus subscription (`setupEventListeners`),
  // via a SEPARATE `processOrbitalEvent` call the host's own `dispatch()`
  // below never sees or awaits — its `response.states`/`emittedEvents`
  // reflect only the trait `dispatch()` directly targeted. Without this,
  // `useOrbitalPluginHost().getState()` on a trait that only ever changes
  // via a sibling's cascade (never the plugin's own `inbound` dispatch)
  // stayed frozen at its initial snapshot forever — the state machine had
  // genuinely transitioned, but nothing told the host's cached snapshot.
  //
  // The cascade's own `processOrbitalEvent` call is fire-and-forget from
  // `EventBus.emit`'s synchronous listener loop — `setupEventListeners`'s
  // handler is `async` and awaits `ensureOsHandlers()`/
  // `ensureAgentSubstrateHandlers()` before touching the state machine, so
  // the trait hasn't actually transitioned yet at the moment the triggering
  // emit fires. A same-tick snapshot would just re-read the pre-cascade
  // state. Coalesce onto a macrotask (`setTimeout(0)`) instead of resyncing
  // synchronously inside the listener — long enough for that pending-promise
  // chain (already-resolved after the first dispatch, so at most a couple of
  // microtask turns) to drain, short enough to stay invisible to a human,
  // and de-duped so a burst of cascaded emits schedules exactly one resync.
  useEffect(() => {
    if (!mockRuntime) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleResync = (): void => {
      if (timer !== null) return;
      timer = setTimeout(() => {
        timer = null;
        const states = snapshotAllStates();
        if (states.length > 0) onDispatched(plugin.id, null, states);
      }, 0);
    };
    const unsub = mockRuntime.getEventBus().onAny(scheduleResync);
    return () => {
      unsub();
      if (timer !== null) clearTimeout(timer);
    };
  }, [mockRuntime, plugin.id, onDispatched, snapshotAllStates]);

  // Outbound bridging — see the file-header note. One `onAny` subscription
  // per plugin, mounted for the lifetime of the runtime (not re-armed per
  // dispatch), is the ONLY outbound path for `mode: 'mock'`: it sees every
  // `emit` effect the runtime ever executes, whether from the directly
  // dispatched trait or from a sibling reacting through
  // `setupEventListeners`'s internal cascade. `dispatch()` below no longer
  // re-broadcasts from `response.emittedEvents` when `mockRuntime` exists,
  // so nothing here is emitted twice.
  useEffect(() => {
    if (!mockRuntime) return;
    // Defensive de-dupe keyed on the event object itself: a real bus
    // `emit()` call fires this listener exactly once per event, so this
    // only guards against an accidental double-subscription (e.g. an
    // overlapping effect re-run), never fires in normal operation.
    const rebroadcast = new WeakSet<object>();
    const unsub = mockRuntime.getEventBus().onAny((event) => {
      if (rebroadcast.has(event)) return;
      // RELAY RULE: this plugin's own inbound vocabulary (busEvent or
      // trigger name) is always a relay for a sibling's `listens {}`,
      // never a fresh request back to the host — see file header.
      if (inboundBusEvents.has(event.type) || inboundTriggerNames.has(event.type)) return;
      // Only re-broadcast events sourced from one of the PLUGIN's OWN
      // orbitals, never a host-protocol orbital it merely composes.
      const sourceOrbital = event.source?.orbital;
      if (sourceOrbital === undefined || !ownOrbitals.has(sourceOrbital)) return;
      rebroadcast.add(event);
      bus.emit(`UI:${event.type}`, event.payload, event.source);
    });
    return () => {
      unsub();
    };
  }, [mockRuntime, bus, ownOrbitals, inboundBusEvents, inboundTriggerNames]);

  const dispatch = useCallback(
    async (row: PluginHostInbound, payload: EventPayload | undefined) => {
      await registrationReady;

      let response: PluginDispatchResponse;
      if (mockRuntime) {
        response = await mockRuntime.processOrbitalEvent(row.orbital, {
          event: row.trigger,
          payload,
          targetTrait: row.trait,
        });
      } else if (mode === 'server' && transport) {
        response = await transport.sendEvent(row.orbital, row.trigger, payload);
      } else {
        return;
      }

      if (!response.success) {
        onError(plugin.id, response.error ?? `${plugin.id}: ${row.trigger} failed`);
      }

      // Outbound: for `mode: 'mock'`, the plugin-lifetime `onAny`
      // subscription above is the ONLY outbound path (see file header) —
      // reading `response` here is deliberately skipped so nothing is
      // emitted twice. `mode: 'server'` has no local runtime/bus to
      // subscribe to (the runtime lives on the remote transport), so it
      // still re-emits from the dispatch response: never echo the trigger
      // we just dispatched back onto the bus, and never re-broadcast a
      // RELAY (this plugin's own inbound busEvent vocabulary — see the
      // RELAY RULE).
      if (!mockRuntime) {
        for (const entry of response.emittedEvents ?? []) {
          if (entry.event === row.trigger) continue;
          if (inboundBusEvents.has(entry.event)) continue;
          const sourceOrbital = entry.source?.orbital;
          if (sourceOrbital !== undefined && ownOrbitals.has(sourceOrbital)) {
            bus.emit(`UI:${entry.event}`, entry.payload, entry.source);
          }
        }
      }

      const states: Array<readonly [string, string, TraitState]> = [];
      for (const [traitName, stateName] of Object.entries(response.states)) {
        states.push([row.orbital, traitName, toTraitState(mockRuntime, row.orbital, traitName, stateName, row.trigger)]);
        onTransition?.(plugin.id, row.orbital, traitName, stateName);
      }
      onDispatched(plugin.id, row.trigger, states);
    },
    [registrationReady, mockRuntime, mode, transport, plugin, bus, ownOrbitals, inboundBusEvents, onError, onTransition, onDispatched],
  );

  useEffect(() => {
    const unsubs = plugin.inbound.map((row) =>
      bus.on(`UI:${row.busEvent}`, (event) => {
        void dispatch(row, event.payload).catch((err) => {
          onError(plugin.id, err instanceof Error ? err.message : String(err));
        });
      }),
    );
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [bus, plugin, dispatch, onError]);

  return null;
}

/**
 * Mounts one headless `OrbitalServerRuntime` per plugin against the ambient
 * event bus + slot provider. Renders nothing of its own besides an optional
 * `children` passthrough — MUST be mounted inside `EventBusProvider` +
 * `UISlotProvider`.
 */
export function OrbitalPluginHost({
  plugins,
  mode = 'mock',
  transport,
  deny,
  navigate,
  notify,
  onTransition,
  children,
}: OrbitalPluginHostProps): React.ReactElement {
  const [tick, setTick] = useState(0);
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({});
  const statesRef = useRef<Map<string, Map<string, TraitState>>>(new Map());
  const lastEventRef = useRef<Map<string, string>>(new Map());

  const pluginSchemas = useMemo(
    () => new Map(plugins.map((plugin) => [plugin.id, plugin.schema] as const)),
    [plugins],
  );

  const handleDispatched = useCallback(
    (pluginId: string, trigger: string | null, states: ReadonlyArray<readonly [string, string, TraitState]>) => {
      if (trigger !== null) {
        lastEventRef.current.set(pluginId, trigger);
      }
      let byKey = statesRef.current.get(pluginId);
      if (!byKey) {
        byKey = new Map();
        statesRef.current.set(pluginId, byKey);
      }
      for (const [orbital, trait, state] of states) {
        byKey.set(`${orbital}.${trait}`, state);
      }
      setTick((t) => t + 1);
    },
    [],
  );

  const handleError = useCallback((pluginId: string, message: string) => {
    setErrors((prev) => (prev[pluginId] === message ? prev : { ...prev, [pluginId]: message }));
  }, []);

  const contextValue = useMemo<OrbitalPluginHostContextValue>(
    () => ({
      getState: (pluginId, orbital, trait) => statesRef.current.get(pluginId)?.get(`${orbital}.${trait}`),
      lastEvent: (pluginId) => lastEventRef.current.get(pluginId),
      errors,
      tick,
      getPluginSchema: (pluginId) => pluginSchemas.get(pluginId),
    }),
    [errors, tick, pluginSchemas],
  );

  return (
    <OrbitalPluginHostContext.Provider value={contextValue}>
      {plugins.map((plugin) => (
        <PluginRuntimeMount
          key={plugin.id}
          plugin={plugin}
          mode={mode}
          transport={transport}
          deny={deny}
          navigate={navigate}
          notify={notify}
          onTransition={onTransition}
          onDispatched={handleDispatched}
          onError={handleError}
        />
      ))}
      {children ?? null}
    </OrbitalPluginHostContext.Provider>
  );
}

export default OrbitalPluginHost;
