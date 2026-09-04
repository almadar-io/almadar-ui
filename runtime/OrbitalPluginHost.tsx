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

  // Snapshot every trait's INITIAL state as soon as registration completes,
  // so `useOrbitalPluginHost().getState` / `useDeclaredCaptureTable` read the
  // real starting state instead of "no data yet" before the first dispatch.
  useEffect(() => {
    let cancelled = false;
    void registrationReady.then(() => {
      if (cancelled || !mockRuntime) return;
      const states: Array<readonly [string, string, TraitState]> = [];
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
      if (states.length > 0) onDispatched(plugin.id, null, states);
    }).catch((err) => {
      if (!cancelled) onError(plugin.id, err instanceof Error ? err.message : String(err));
    });
    return () => {
      cancelled = true;
    };
  }, [registrationReady, mockRuntime, plugin, onDispatched, onError]);

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

      // Outbound: re-emit only events sourced from one of the PLUGIN's OWN
      // orbitals (not a host-protocol orbital it merely composes), and never
      // echo the trigger we just dispatched back onto the bus.
      for (const entry of response.emittedEvents ?? []) {
        if (entry.event === row.trigger) continue;
        const sourceOrbital = entry.source?.orbital;
        if (sourceOrbital !== undefined && ownOrbitals.has(sourceOrbital)) {
          bus.emit(`UI:${entry.event}`, entry.payload, entry.source);
        }
      }

      const states: Array<readonly [string, string, TraitState]> = [];
      for (const [traitName, stateName] of Object.entries(response.states)) {
        states.push([row.orbital, traitName, toTraitState(mockRuntime, row.orbital, traitName, stateName, row.trigger)]);
        onTransition?.(plugin.id, row.orbital, traitName, stateName);
      }
      onDispatched(plugin.id, row.trigger, states);
    },
    [registrationReady, mockRuntime, mode, transport, plugin, bus, ownOrbitals, onError, onTransition, onDispatched],
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
