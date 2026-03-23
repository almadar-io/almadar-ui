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
 * Entity data flows through props, not context. The server response contains
 * both `data` (entity records) and `clientEffects` (render-ui patterns).
 * enrichFromResponse injects records into entity-aware patterns from the
 * same response, eliminating any timing issues.
 *
 * @packageDocumentation
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useEventBus } from '../hooks/useEventBus';
import { enrichFromResponse } from './enrichFromResponse';


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
  error?: string;
}

export interface ServerClientEffect {
  type: 'render-ui' | 'navigate' | 'notify';
  slot?: string;
  pattern?: Record<string, unknown>;
  route?: string;
  params?: Record<string, unknown>;
  message?: string;
}

export interface ServerBridgeContextValue {
  connected: boolean;
  sendEvent: (orbitalName: string, event: string, payload?: Record<string, unknown>) => Promise<ServerClientEffect[]>;
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
    return { connected: false, sendEvent: async () => [] };
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

  // Send event to server orbital, returns enriched client effects
  const sendEvent = useCallback(async (
    orbitalName: string,
    event: string,
    payload?: Record<string, unknown>,
  ): Promise<ServerClientEffect[]> => {
    if (!connected) return [];

    try {
      const res = await fetch(`${serverUrl}/${orbitalName}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      });
      const result: OrbitalEventResponse = await res.json();
      const effects: ServerClientEffect[] = [];

      if (result.success) {
        const responseData = result.data || {};

        // Parse and enrich clientEffects from server response.
        // Entity data and patterns arrive in the same response (no timing issues).
        if (result.clientEffects) {
          for (const effect of result.clientEffects) {
            const arr = effect as unknown[];
            const effectType = arr[0] as string;
            if (effectType === 'render-ui') {
              const slot = arr[1] as string;
              const pattern = arr[2] as Record<string, unknown>;
              const enriched = enrichFromResponse(pattern, responseData);
              effects.push({ type: 'render-ui', slot, pattern: enriched });
            } else if (effectType === 'navigate') {
              effects.push({ type: 'navigate', route: arr[1] as string, params: arr[2] as Record<string, unknown> });
            } else if (effectType === 'notify') {
              effects.push({ type: 'notify', message: arr[1] as string });
            }
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

      return effects;
    } catch (err) {
      console.error('[ServerBridge] Event send failed:', err);
      return [];
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
