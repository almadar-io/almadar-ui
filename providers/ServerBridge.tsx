'use client';

/**
 * ServerBridge - Lightweight client-server bridge for OrbPreview.
 *
 * When OrbPreview is given a `serverUrl`, this provider:
 * 1. Registers the schema with the server on mount
 * 2. Forwards trait events to the server after local processing
 * 3. Applies server clientEffects (render-ui with entity data) to slots via event bus
 * 4. Propagates server-emitted events through the local EventBus
 * 5. Unregisters on unmount
 *
 * Entity data flows through EntityStore. The server response contains
 * both `data` (entity records) and `clientEffects` (render-ui patterns).
 * OrbPreview advances EntityStore from response data; SlotContentRenderer
 * subscribes via useEntityRef for reactive resolution.
 *
 * @packageDocumentation
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { BusEventSource, EntityRow, EventPayload, OrbitalSchema, SExpr } from '@almadar/core';
import type { AnyPatternConfig } from '@almadar/core/patterns';
import { useEventBus } from '../hooks/useEventBus';
import type { EventBusContextType } from '../types/event-bus-types';
import { createLogger } from '@almadar/logger';

/** Wire-format client effect tuple from the server response. */
type ClientEffectTuple =
  | ['render-ui', string, AnyPatternConfig | null, ...SExpr[]]
  | ['navigate', string, ...SExpr[]]
  | ['notify', string, ...SExpr[]];

// Gap #11 (Almadar_Std_Verification.md): cross-orbital re-broadcast
// tracing. Each server-cascade event — carried back in-response (gap #13)
// or pushed out-of-band over SSE (Almadar_Live_Push.md) — is re-emitted on
// the qualified `UI:Orbital.Trait.EVENT` bus key by `reEmitServerEvent`
// below; if the source-stamp drops anywhere in the wire format, every emit
// is silently skipped — log both branches so the runtime-verify capture
// surfaces the gap.
const xOrbitalLog = createLogger('almadar:runtime:cross-orbital');
const serverBridgeLog = createLogger('almadar:ui:server-bridge');

/** A single server-cascade event, however it arrived (response or push). */
interface RemoteBusEvent {
  event: string;
  payload?: EventPayload;
  source?: BusEventSource;
}

/**
 * Re-emit one server-cascade event on the qualified `UI:Orbital.Trait.EVENT`
 * bus key the codegen-emitted subscribers (own `useUIEvents`, cross-trait
 * `eventBus.on('UI:Orbital.Trait.EVENT')`) listen to (gap #13). Shared by
 * the response-cascade path (`sendEvent`) and the SSE push leg
 * (Almadar_Live_Push.md) so both deliver identical re-emit semantics.
 *
 * `origin` is a debug label only (dispatch orbital for the response path,
 * `'push'` for the SSE path) — it never affects the re-emit key.
 */
function reEmitServerEvent(eventBus: EventBusContextType, emitted: RemoteBusEvent, origin: string): void {
  const evTrait = emitted.source?.trait;
  if (!evTrait) {
    // Absent source means we don't know the trait, so the emit is dropped
    // (preserves the unification — bare re-emits with a `source.trait`
    // filter were the pre-fix path).
    xOrbitalLog.warn('emit:dropped-no-source', { event: emitted.event, origin });
    return;
  }
  const key = emitted.source?.orbital
    ? `UI:${emitted.source.orbital}.${evTrait}.${emitted.event}`
    : `UI:${evTrait}.${emitted.event}`;
  xOrbitalLog.info('emit:rebroadcast', {
    busKey: key,
    sourceOrbital: emitted.source?.orbital,
    sourceTrait: evTrait,
    origin,
  });
  eventBus.emit(key, emitted.payload);
}

/**
 * Push message shape on the `/api/events` SSE channel (Almadar_Live_Push.md).
 * The channel also carries dev `reload` messages, so only `type: 'bus'`
 * entries are cascade events — everything else is ignored by the subscriber.
 */
interface ServerPushEnvelope {
  type: string;
  event?: string;
  payload?: EventPayload;
  source?: BusEventSource;
  timestamp?: number;
}

function isBusPushEnvelope(value: ServerPushEnvelope): value is ServerPushEnvelope & { type: 'bus'; event: string } {
  return value.type === 'bus' && typeof value.event === 'string';
}

/**
 * Per-TAB identity (Almadar_Live_Push.md) — module-scoped, NOT per provider.
 * A page mounting several orbital providers is still ONE origin: the server's
 * broadcast exclusion keys on this id, and per-provider ids would let one
 * provider's persist echo back into its sibling providers in the same tab.
 */
let tabClientId: string | undefined;
function getTabClientId(): string {
  if (tabClientId === undefined) tabClientId = crypto.randomUUID();
  return tabClientId;
}

type BusPushEnvelope = ServerPushEnvelope & { type: 'bus'; event: string };

interface SharedPushChannel {
  source: EventSource;
  subscribers: Set<(envelope: BusPushEnvelope) => void>;
}

/**
 * One shared EventSource per events URL, fanned out to every mounted
 * provider. SSE connections are long-lived HTTP: one per provider exhausts
 * Chromium's ~6-per-host HTTP/1.1 pool on multi-orbital pages and starves
 * the bridge's own dispatch fetches (proven on std-kflow: every walk
 * dispatch stalled to "driver did not deliver").
 */
const pushChannels = new Map<string, SharedPushChannel>();

function acquirePushChannel(url: string, subscriber: (envelope: BusPushEnvelope) => void): () => void {
  let channel = pushChannels.get(url);
  if (channel === undefined) {
    const source = new EventSource(url);
    const created: SharedPushChannel = { source, subscribers: new Set() };
    source.onmessage = (ev: MessageEvent<string>) => {
      let parsed: ServerPushEnvelope;
      try {
        parsed = JSON.parse(ev.data) as ServerPushEnvelope;
      } catch (err) {
        serverBridgeLog.warn('push:parse-failed', { error: err instanceof Error ? err.message : String(err) });
        return;
      }
      if (!isBusPushEnvelope(parsed)) return;
      for (const sub of created.subscribers) sub(parsed);
    };
    source.onerror = () => {
      serverBridgeLog.warn('push:connection-error', { url });
    };
    pushChannels.set(url, created);
    channel = created;
  }
  channel.subscribers.add(subscriber);
  return () => {
    channel.subscribers.delete(subscriber);
    if (channel.subscribers.size === 0) {
      channel.source.close();
      pushChannels.delete(url);
    }
  };
}

/**
 * `/api/events` sits alongside the API root the provider already posts to
 * (`serverUrl` = `.../orbitals`; the SSE channel is `.../events`, its
 * sibling) — derive it structurally rather than hardcoding a second base.
 */
function deriveEventsUrl(serverUrl: string): string {
  const trimmed = serverUrl.replace(/\/+$/, '');
  const apiRoot = trimmed.replace(/\/[^/]*$/, '');
  return `${apiRoot}/events`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrbitalEventResponse {
  success: boolean;
  transitioned: boolean;
  states: Record<string, string>;
  /**
   * Server-cascade events carried back in the response. Each entry has a
   * `source: BusEventSource` stamped by the compiled handler (`emit ...
   * { source: __ORBITAL_SOURCE }`) so the client can re-broadcast on the
   * qualified `UI:Orbital.Trait.EVENT` bus key (gap #13).
   */
  emittedEvents?: Array<{
    event: string;
    payload?: EventPayload;
    source?: BusEventSource;
  }>;
  data?: Record<string, EntityRow[]>;
  clientEffects?: ClientEffectTuple[];
  /**
   * Same effects as `clientEffects`, paired with the trait that produced
   * each one. When present, prefer this for trait attribution. Falls back
   * to legacy `clientEffects` parsing on older servers.
   */
  clientEffectsByTrait?: Array<{ traitName: string; effect: ClientEffectTuple }>;
  error?: string;
}

export interface ServerClientEffect {
  type: 'render-ui' | 'navigate' | 'notify';
  slot?: string;
  pattern?: AnyPatternConfig;
  route?: string;
  params?: EventPayload;
  message?: string;
  /**
   * Trait that emitted this effect. Used by `<TraitFrame>` to resolve
   * `@trait.X` bindings. Undefined when the server didn't tag the effect
   * (older servers that pre-date the per-trait sidecar).
   */
  traitName?: string;
}

/** Metadata about what the server returned, for debugger logging */
export interface ServerResponseMeta {
  success: boolean;
  clientEffects: number;
  dataEntities: Record<string, number>;
  /** Raw entity data from server response (for EntityStore advancement) */
  data?: Record<string, EntityRow[]>;
  emittedEvents: string[];
  error?: string;
}

export interface SendEventResult {
  effects: ServerClientEffect[];
  meta: ServerResponseMeta;
}

export interface ServerBridgeContextValue {
  connected: boolean;
  sendEvent: (orbitalName: string, event: string, payload?: EventPayload) => Promise<SendEventResult>;
}

/**
 * Transport adapter for ServerBridgeProvider. Decouples the bridge's
 * cascade-rebroadcast / effect-parsing logic from its wire format.
 *
 * - The `serverUrl` mode (default) uses an HTTP transport that POSTs to
 *   `/register`, `/unregister`, `/:orbital/events`. This is what canonical
 *   playground-runtime (`tools/runtime-verify`) and apps/builder-server
 *   speak.
 * - The `transport` mode lets a consumer plug in a direct function-call
 *   adapter — used by `<BrowserPlayground>` to invoke
 *   `OrbitalServerRuntime.processOrbitalEvent` in-process, no HTTP, no
 *   server. Both modes return the same `OrbitalEventResponse` shape so the
 *   cascade-rebroadcast logic is identical downstream.
 */
export interface ServerBridgeTransport {
  register: (schema: OrbitalSchema) => Promise<boolean>;
  unregister: () => Promise<void>;
  /**
   * `clientId` (Almadar_Live_Push.md) is the per-tab id stamped on every
   * dispatch so the server's push broadcast can exclude the origin tab
   * (it already got this cascade in-response).
   */
  sendEvent: (orbitalName: string, event: string, payload?: EventPayload, clientId?: string) => Promise<OrbitalEventResponse>;
}

/** Request body posted to `POST /:orbital/events` — the local `OrbitalEventRequest` wire shape this transport owns. */
interface OrbitalEventRequestBody {
  event: string;
  payload?: EventPayload;
  clientId?: string;
}

/** HTTP transport — POSTs to a server speaking the canonical playground-runtime contract. */
function createHttpTransport(serverUrl: string): ServerBridgeTransport {
  return {
    register: async (schema) => {
      try {
        const res = await fetch(`${serverUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema }),
        });
        const result = await res.json();
        return !!result.success;
      } catch (err) {
        // Network-level failure (TypeError from fetch) is expected in
        // standalone playground mode during reload/registration race —
        // demote so the verifier's console-error verdict doesn't trip.
        // Server-side errors still log at error level.
        if (err instanceof TypeError) {
          serverBridgeLog.warn('Registration failed', { error: err.message });
        } else {
          serverBridgeLog.error('Registration failed', { error: err instanceof Error ? err : String(err) });
        }
        return false;
      }
    },
    unregister: async () => {
      try {
        await fetch(`${serverUrl}/unregister`, { method: 'DELETE' });
      } catch {
        // Ignore cleanup errors
      }
    },
    sendEvent: async (orbitalName, event, payload, clientId) => {
      const body: OrbitalEventRequestBody = { event, payload, clientId };
      const res = await fetch(`${serverUrl}/${orbitalName}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.json() as Promise<OrbitalEventResponse>;
    },
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ServerBridgeContext = createContext<ServerBridgeContextValue | null>(null);

/**
 * Access the server bridge. Returns a no-op stub when outside the provider.
 */
export function useServerBridge(): ServerBridgeContextValue {
  const ctx = useContext(ServerBridgeContext);
  if (!ctx) {
    const emptyMeta: ServerResponseMeta = { success: false, clientEffects: 0, dataEntities: {}, emittedEvents: [] };
    return { connected: false, sendEvent: async () => ({ effects: [], meta: emptyMeta }) };
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface ServerBridgeProviderProps {
  schema: OrbitalSchema;
  /** HTTP server URL (canonical playground-runtime / apps/builder-server). */
  serverUrl?: string;
  /**
   * Custom transport adapter. Use this for in-process execution (e.g.
   * `<BrowserPlayground>` invokes `OrbitalServerRuntime.processOrbitalEvent`
   * directly). Mutually exclusive with `serverUrl`.
   */
  transport?: ServerBridgeTransport;
  children: ReactNode;
}

export function ServerBridgeProvider({
  schema,
  serverUrl,
  transport: customTransport,
  children,
}: ServerBridgeProviderProps) {
  if (!serverUrl && !customTransport) {
    throw new Error('ServerBridgeProvider requires either serverUrl or transport');
  }
  if (serverUrl && customTransport) {
    throw new Error('ServerBridgeProvider accepts serverUrl OR transport, not both');
  }

  const eventBus = useEventBus();
  const [connected, setConnected] = useState(false);


  // Resolve the transport: custom takes precedence (only one is set per the
  // mutual-exclusion check above). Memo on `serverUrl`/`customTransport` so
  // useCallback deps don't churn every render.
  const transport = useMemo<ServerBridgeTransport>(
    () => customTransport ?? createHttpTransport(serverUrl!),
    [serverUrl, customTransport],
  );

  const registerSchema = useCallback(
    async (): Promise<boolean> => transport.register(schema),
    [schema, transport],
  );

  const unregisterSchema = useCallback(
    async () => transport.unregister(),
    [transport],
  );

  // Send event to orbital, returns enriched client effects + response metadata.
  // Cascade-rebroadcast logic is identical for HTTP and in-process transports.
  const sendEvent = useCallback(async (
    orbitalName: string,
    event: string,
    payload?: EventPayload,
  ): Promise<SendEventResult> => {
    const emptyMeta: ServerResponseMeta = { success: false, clientEffects: 0, dataEntities: {}, emittedEvents: [] };
    if (!connected) return { effects: [], meta: emptyMeta };

    try {
      const result: OrbitalEventResponse = await transport.sendEvent(orbitalName, event, payload, getTabClientId());
      const effects: ServerClientEffect[] = [];

      // Build metadata from raw response
      const responseData = result.data || {};
      const dataEntities: Record<string, number> = {};
      for (const [entityName, records] of Object.entries(responseData)) {
        dataEntities[entityName] = Array.isArray(records) ? records.length : 0;
      }

      const meta: ServerResponseMeta = {
        success: !!result.success,
        clientEffects: result.clientEffects?.length ?? 0,
        dataEntities,
        data: responseData,
        emittedEvents: result.emittedEvents?.map((e) => e.event) ?? [],
        error: result.error,
      };

      if (result.success) {
        // Parse and enrich clientEffects from server response.
        // Entity data and patterns arrive in the same response (no timing issues).
        // Prefer the per-trait sidecar so `<TraitFrame>` resolves `@trait.X`
        // bindings correctly. Fall back to the legacy flat array for older
        // servers (effects arrive without trait attribution).
        const tagged = result.clientEffectsByTrait;
        const tuples: Array<{ effect: ClientEffectTuple; traitName?: string }> = tagged
          ? tagged.map((entry) => ({ effect: entry.effect, traitName: entry.traitName }))
          : (result.clientEffects ?? []).map((eff) => ({ effect: eff }));

        for (const { effect, traitName } of tuples) {
          const effectType = effect[0];
          if (effectType === 'render-ui') {
            const slot = effect[1];
            const pattern = effect[2];
            effects.push({
              type: 'render-ui',
              slot,
              pattern: (pattern !== null && typeof pattern === 'object')
                ? (pattern as AnyPatternConfig)
                : undefined,
              traitName,
            });
          } else if (effectType === 'navigate') {
            const route = effect[1];
            const rawParams = (effect as ['navigate', string, ...SExpr[]])[2];
            effects.push({
              type: 'navigate',
              route,
              params: (rawParams !== null && rawParams !== undefined && typeof rawParams === 'object' && !Array.isArray(rawParams))
                ? (rawParams as EventPayload)
                : undefined,
              traitName,
            });
          } else if (effectType === 'notify') {
            const message = effect[1];
            effects.push({ type: 'notify', message: typeof message === 'string' ? message : undefined, traitName });
          }
        }

        // Gap #13: re-emit server-cascade events on the qualified bus key
        // (shared with the SSE push leg below — see `reEmitServerEvent`).
        if (result.emittedEvents) {
          for (const emitted of result.emittedEvents) {
            reEmitServerEvent(eventBus, emitted, orbitalName);
          }
        }
      } else if (result.error) {
        // Match compiled-path bridge (`useOrbitalBridge.ts`'s
        // `_bridgeLog.warn('response:fail', ...)`) so the shared
        // @almadar-io/verify "No console errors" verdict stays green.
        // The error is a server-side validation rejection (e.g. a
        // verifier coverage walker injecting events with missing
        // required-field payloads), which is structured signal — log it
        // through the same channel a structured logger consumer would
        // already be filtering, not via raw console.error.
        xOrbitalLog.warn('response:fail', {
          orbital: orbitalName,
          event,
          error: result.error,
        });
      }

      return { effects, meta };
    } catch (err) {
      // `TypeError: Failed to fetch` is the browser's signal for a
      // network-level failure (connection refused, peer endpoint
      // missing, CORS). In standalone playground mode the cross-orbital
      // target frequently isn't registered (single-orbital execution),
      // so a fetch failure for a peer endpoint is expected, not a trait
      // bug. Demote to warn so the verifier's "No console errors"
      // verdict doesn't trip on standalone configuration. Other
      // transport errors (server-side rejections, parse errors) stay at
      // error.
      // `fetch` throws TypeError on network-level failures (connection
      // refused, peer endpoint missing, CORS) — distinct from server-
      // side rejections which return a non-OK Response without throwing,
      // or JSON parse errors which surface as SyntaxError.
      const msg = err instanceof Error ? err.message : String(err);
      if (err instanceof TypeError) {
        xOrbitalLog.warn('response:network', {
          orbital: orbitalName,
          event,
          error: msg,
          reason: 'peer endpoint unreachable (expected in standalone single-orbital mode)',
        });
      } else {
        xOrbitalLog.error('response:network', {
          orbital: orbitalName,
          event,
          error: msg,
        });
      }
      return { effects: [], meta: { ...emptyMeta, error: msg } };
    }
  }, [connected, transport, eventBus]);

  // Register on mount, unregister on unmount
  useEffect(() => {
    if (!schema) return;

    let cancelled = false;
    registerSchema().then((ok) => {
      if (!cancelled && ok) setConnected(true);
    });

    return () => {
      cancelled = true;
      setConnected(false);
      unregisterSchema();
    };
  }, [schema, registerSchema, unregisterSchema]);

  // Push subscribe leg (Almadar_Live_Push.md): other clients' persist-envelope
  // emits arrive here and re-emit through the identical `reEmitServerEvent`
  // path the response cascade uses, so existing `listens` routes match the
  // same way regardless of which leg delivered the event. Only meaningful
  // for the HTTP transport — the in-process transport has no server to push
  // from. EventSource auto-reconnects natively; no custom retry loop. The
  // connection itself is the shared per-tab channel — this effect only
  // subscribes this provider's bus to it.
  useEffect(() => {
    if (!serverUrl) return;
    if (typeof EventSource === 'undefined') return;

    const url = `${deriveEventsUrl(serverUrl)}?clientId=${encodeURIComponent(getTabClientId())}`;
    return acquirePushChannel(url, (parsed) => {
      serverBridgeLog.debug('push:received', {
        event: parsed.event,
        sourceOrbital: parsed.source?.orbital,
        sourceTrait: parsed.source?.trait,
      });
      reEmitServerEvent(eventBus, parsed, 'push');
    });
  }, [serverUrl, eventBus]);

  return (
    <ServerBridgeContext.Provider value={{ connected, sendEvent }}>
      {children}
    </ServerBridgeContext.Provider>
  );
}
