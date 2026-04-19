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

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useEventBus } from '../hooks/useEventBus';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrbitalEventResponse {
  success: boolean;
  transitioned: boolean;
  states: Record<string, string>;
  emittedEvents?: Array<{ event: string; payload?: unknown }>;
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
  serverUrl: string;
  children: ReactNode;
}

export function ServerBridgeProvider({
  schema,
  serverUrl,
  children,
}: ServerBridgeProviderProps) {
  const eventBus = useEventBus();
  const [connected, setConnected] = useState(false);

  // Register schema with server
  const registerSchema = useCallback(async (): Promise<boolean> => {
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
  }, [schema, serverUrl]);

  // Unregister on unmount
  const unregisterSchema = useCallback(async () => {
    try {
      await fetch(`${serverUrl}/unregister`, { method: 'DELETE' });
    } catch {
      // Ignore cleanup errors
    }
  }, [serverUrl]);

  // Send event to server orbital, returns enriched client effects + response metadata
  const sendEvent = useCallback(async (
    orbitalName: string,
    event: string,
    payload?: Record<string, unknown>,
  ): Promise<SendEventResult> => {
    const emptyMeta: ServerResponseMeta = { success: false, clientEffects: 0, dataEntities: {}, emittedEvents: [] };
    if (!connected) return { effects: [], meta: emptyMeta };

    try {
      const res = await fetch(`${serverUrl}/${orbitalName}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      });
      const result: OrbitalEventResponse = await res.json();
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

        // Propagate server-emitted events through local bus
        if (result.emittedEvents) {
          for (const emitted of result.emittedEvents) {
            eventBus.emit(`UI:${emitted.event}`, emitted.payload as Record<string, unknown>);
            eventBus.emit(emitted.event, emitted.payload as Record<string, unknown>);
          }
        }
      } else if (result.error) {
        console.error('[ServerBridge] Event error:', result.error);
      }

      return { effects, meta };
    } catch (err) {
      console.error('[ServerBridge] Event send failed:', err);
      return { effects: [], meta: { ...emptyMeta, error: err instanceof Error ? err.message : String(err) } };
    }
  }, [connected, serverUrl, eventBus]);

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
