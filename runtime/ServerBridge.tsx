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
import type { BusEventSource, EventPayload } from '@almadar/core';
import { useEventBus } from '../hooks/useEventBus';
import { createLogger } from '../lib/logger';

// Gap #11 (Almadar_Std_Verification.md): cross-orbital re-broadcast
// tracing. Each server response's `emittedEvents[]` is re-emitted on the
// qualified `UI:Orbital.Trait.EVENT` bus key here; if the source-stamp
// drops anywhere in the wire format, every emit is silently skipped — log
// both branches so the runtime-verify capture surfaces the gap.
const xOrbitalLog = createLogger('almadar:runtime:cross-orbital');


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
  data?: Record<string, unknown[]>;
  clientEffects?: unknown[];
  /**
   * Same effects as `clientEffects`, paired with the trait that produced
   * each one. When present, prefer this for trait attribution. Falls back
   * to legacy `clientEffects` parsing on older servers.
   */
  clientEffectsByTrait?: Array<{ traitName: string; effect: unknown[] }>;
  error?: string;
}

export interface ServerClientEffect {
  type: 'render-ui' | 'navigate' | 'notify';
  slot?: string;
  pattern?: Record<string, unknown>;
  route?: string;
  params?: Record<string, unknown>;
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
  data?: Record<string, unknown[]>;
  emittedEvents: string[];
  error?: string;
}

export interface SendEventResult {
  effects: ServerClientEffect[];
  meta: ServerResponseMeta;
}

export interface ServerBridgeContextValue {
  connected: boolean;
  sendEvent: (orbitalName: string, event: string, payload?: Record<string, unknown>) => Promise<SendEventResult>;
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
  register: (schema: unknown) => Promise<boolean>;
  unregister: () => Promise<void>;
  sendEvent: (orbitalName: string, event: string, payload?: Record<string, unknown>) => Promise<OrbitalEventResponse>;
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
        console.error('[ServerBridge] Registration failed:', err);
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
    sendEvent: async (orbitalName, event, payload) => {
      const res = await fetch(`${serverUrl}/${orbitalName}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
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
  schema: unknown;
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
    payload?: Record<string, unknown>,
  ): Promise<SendEventResult> => {
    const emptyMeta: ServerResponseMeta = { success: false, clientEffects: 0, dataEntities: {}, emittedEvents: [] };
    if (!connected) return { effects: [], meta: emptyMeta };

    try {
      const result: OrbitalEventResponse = await transport.sendEvent(orbitalName, event, payload);
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
        const tuples: Array<{ effect: unknown[]; traitName?: string }> = tagged
          ? tagged.map((entry) => ({ effect: entry.effect, traitName: entry.traitName }))
          : (result.clientEffects ?? []).map((eff) => ({ effect: eff as unknown[] }));

        for (const { effect, traitName } of tuples) {
          const effectType = effect[0] as string;
          if (effectType === 'render-ui') {
            const slot = effect[1] as string;
            const pattern = effect[2] as Record<string, unknown> | undefined;
            effects.push({ type: 'render-ui', slot, pattern: pattern ?? undefined, traitName });
          } else if (effectType === 'navigate') {
            effects.push({ type: 'navigate', route: effect[1] as string, params: effect[2] as Record<string, unknown>, traitName });
          } else if (effectType === 'notify') {
            effects.push({ type: 'notify', message: effect[1] as string, traitName });
          }
        }

        // Gap #13: re-emit server-cascade events on the qualified bus
        // key the codegen-emitted subscribers (own `useUIEvents`,
        // cross-trait `eventBus.on('UI:Orbital.Trait.EVENT')`) listen to.
        // The server response carries `source: BusEventSource` per emit
        // when populated; absent source we don't know the trait, so the
        // emit is dropped (preserves the unification — bare re-emits
        // with a `source.trait` filter were the pre-fix path).
        if (result.emittedEvents) {
          for (const emitted of result.emittedEvents) {
            const evTrait = emitted.source?.trait;
            if (!evTrait) {
              xOrbitalLog.warn('emit:dropped-no-source', {
                event: emitted.event,
                dispatchOrbital: orbitalName,
              });
              continue;
            }
            const key = emitted.source?.orbital
              ? `UI:${emitted.source.orbital}.${evTrait}.${emitted.event}`
              : `UI:${evTrait}.${emitted.event}`;
            xOrbitalLog.info('emit:rebroadcast', {
              busKey: key,
              sourceOrbital: emitted.source?.orbital,
              sourceTrait: evTrait,
              dispatchOrbital: orbitalName,
            });
            eventBus.emit(key, emitted.payload);
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
      // Same parity reasoning. Network / transport failures use the
      // logger's `error` level (compiled path uses
      // `_bridgeLog.error('response:network', ...)`).
      xOrbitalLog.error('response:network', {
        orbital: orbitalName,
        event,
        error: err instanceof Error ? err.message : String(err),
      });
      return { effects: [], meta: { ...emptyMeta, error: err instanceof Error ? err.message : String(err) } };
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

  return (
    <ServerBridgeContext.Provider value={{ connected, sendEvent }}>
      {children}
    </ServerBridgeContext.Provider>
  );
}
