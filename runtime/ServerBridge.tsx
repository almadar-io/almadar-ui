'use client';

/**
 * ServerBridge - Lightweight client-server bridge for OrbPreview.
 *
 * When OrbPreview is given a `serverUrl`, this provider:
 * 1. Registers the schema with the server on mount
 * 2. Forwards trait events to the server after local processing
 * 3. Stores server-fetched data in FetchedDataContext
 * 4. Propagates server-emitted events through the local EventBus
 * 5. Unregisters on unmount
 *
 * No auth, no offline mode, no Firebase. Designed for playground/verify use.
 *
 * @packageDocumentation
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useEventBus } from '../hooks/useEventBus';
import { useFetchedDataContext } from '../providers/FetchedDataProvider';

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

export interface ServerBridgeContextValue {
  connected: boolean;
  sendEvent: (orbitalName: string, event: string, payload?: Record<string, unknown>) => Promise<void>;
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
    return { connected: false, sendEvent: async () => {} };
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
  const fetchedData = useFetchedDataContext();
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

  // Send event to server orbital
  const sendEvent = useCallback(async (
    orbitalName: string,
    event: string,
    payload?: Record<string, unknown>,
  ) => {
    if (!connected) return;

    try {
      fetchedData?.setLoading(true);

      const res = await fetch(`${serverUrl}/${orbitalName}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      });
      const result: OrbitalEventResponse = await res.json();

      if (result.success) {
        // Store fetched entity data
        if (result.data && fetchedData) {
          fetchedData.setData(result.data);
        }

        // Skip clientEffects - the local state machine already executed render-ui/navigate/notify.
        // Server's value is `data` (fetched entities) and `emittedEvents` (cross-orbital).
        // After setData, emit DATA_READY so the local state machine can re-render with entity data.
        if (result.data) {
          eventBus.emit('SERVER:DATA_READY', { entities: Object.keys(result.data) });
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
        fetchedData?.setError(result.error);
      }
    } catch (err) {
      console.error('[ServerBridge] Event send failed:', err);
      fetchedData?.setError(err instanceof Error ? err.message : String(err));
    } finally {
      fetchedData?.setLoading(false);
    }
  }, [connected, serverUrl, eventBus, fetchedData]);

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
