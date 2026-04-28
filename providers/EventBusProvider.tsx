'use client';
/**
 * EventBusProvider - React context provider for the event bus
 *
 * Provides a page-scoped event bus for trait communication.
 * Each page has its own event bus instance.
 *
 * NOTE: Selection state has been moved to SelectionProvider.
 * Use SelectionProvider for tracking selected entities.
 *
 * @packageDocumentation
 */

import React, { createContext, useCallback, useRef, useMemo, useEffect, type ReactNode } from 'react';
import type {
  BusEvent,
  BusEventSource,
  EventListener,
  Unsubscribe,
  EventBusContextType,
} from '../hooks/event-bus-types';
import type { EventPayload } from '@almadar/core';
import { setGlobalEventBus } from '../hooks/useEventBus';
import { createLogger } from '../lib/logger';

const busLog = createLogger('almadar:eventbus');
const subLog = createLogger('almadar:eventbus:subscribe');

// ============================================================================
// Context
// ============================================================================

/**
 * Extended context type for backward compatibility.
 *
 * @deprecated getSelectedEntity and clearSelectedEntity are deprecated.
 * Use SelectionProvider and useSelection hook instead.
 */
export interface EventBusContextTypeExtended extends EventBusContextType {
  /** @deprecated Use useSelection from SelectionProvider instead. */
  getSelectedEntity: () => unknown | null;
  /** @deprecated Use useSelection from SelectionProvider instead. */
  clearSelectedEntity: () => void;
}

export const EventBusContext = createContext<EventBusContextTypeExtended | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface EventBusProviderProps {
  children: ReactNode;
  /** Enable debug logging in development */
  debug?: boolean;
}

/**
 * Provider component for the page event bus.
 *
 * This is a pure pub/sub event bus. For selection state,
 * use SelectionProvider which listens to events and maintains state.
 *
 * @example
 * ```tsx
 * function TaskDetailPage() {
 *   return (
 *     <EventBusProvider debug={process.env.NODE_ENV === 'development'}>
 *       <SelectionProvider>
 *         <TaskHeader />
 *         <TaskForm />
 *         <TaskActions />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 * ```
 */
// Per-listener identity tags. Captured at subscribe-time from the call
// stack so we can answer "who reacted to this emit?" without renaming
// every subscriber. Used by the per-listener emit log below.
const listenerTags = new WeakMap<EventListener, string>();
function captureSubscriberTag(listener: EventListener): string {
    // Prefer the listener's function.name (preserved through bundling
    // when the source declares a named function or assigns a name via
    // `Object.defineProperty(fn, 'name', ...)` — much more durable
    // than stack frames against minified code).
    const fnName = (listener as { name?: string }).name;
    if (typeof fnName === 'string' && fnName.length > 0 && fnName !== 'listener') {
        return fnName;
    }
    // Fallback: pull out the first stack frame that lives in user code
    // (skip the hook/provider frames). Browser stacks vary, so we keep
    // the shortest identifying suffix and trim node_modules noise.
    const stack = new Error().stack ?? '';
    const lines = stack.split('\n');
    for (const raw of lines.slice(2)) {
        const line = raw.trim();
        if (!line) continue;
        if (line.includes('EventBusProvider') || line.includes('useEventBus')) continue;
        if (line.includes('captureSubscriberTag')) continue;
        // Drop verbose path prefixes; keep filename:line if available.
        const match = line.match(/([^/\\)]+\.(?:tsx?|jsx?))(?::(\d+))?/);
        if (match) return match[2] ? `${match[1]}:${match[2]}` : match[1];
        return line.slice(0, 120);
    }
    return 'unknown';
}

export function EventBusProvider({ children, debug = false }: EventBusProviderProps) {
  // Store listeners by event type
  const listenersRef = useRef<Map<string, Set<EventListener>>>(new Map());

  // Store wildcard listeners (onAny)
  const anyListenersRef = useRef<Set<EventListener>>(new Set());

  // Track if deprecation warning has been shown
  const deprecationWarningShown = useRef(false);

  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   */
  const getSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        '[EventBus] getSelectedEntity is deprecated. ' +
        'Use SelectionProvider and useSelection hook instead. ' +
        'See SelectionProvider.tsx for migration guide.'
      );
      deprecationWarningShown.current = true;
    }
    return null;
  }, []);

  /**
   * @deprecated Use useSelection from SelectionProvider instead.
   */
  const clearSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        '[EventBus] clearSelectedEntity is deprecated. ' +
        'Use SelectionProvider and useSelection hook instead. ' +
        'See SelectionProvider.tsx for migration guide.'
      );
      deprecationWarningShown.current = true;
    }
  }, []);

  /**
   * Emit an event to all listeners of that type.
   */
  const emit = useCallback((type: string, payload?: EventPayload, source?: BusEventSource) => {
    const event: BusEvent = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };

    const listeners = listenersRef.current.get(type);
    const listenerCount = (listeners?.size ?? 0) + anyListenersRef.current.size;
    busLog.debug('emit', { type, payloadKeys: payload ? Object.keys(payload).length : 0, listenerCount });

    if (debug) {
      if (listenerCount > 0) {
        console.log(`[EventBus] Emit: ${type} → ${listenerCount} listener(s)`, payload);
      } else {
        console.warn(`[EventBus] Emit: ${type} (NO LISTENERS - event may be lost!)`, payload);
      }
    }

    // Per-listener invocation log. The summary `emit` line above only
    // tells us how MANY listeners ran; the slot-render investigation
    // needs to know WHICH listeners reacted to a specific event (e.g.
    // UI:FIELD_CHANGED) to identify whether any of them indirectly
    // re-render the slot tree mid-edit. Tagged at subscribe-time via
    // captureSubscriberTag so anonymous arrow-function listeners are
    // still distinguishable.
    if (listeners) {
      // Create a copy to avoid issues if listener modifies the set
      const listenersCopy = Array.from(listeners);
      for (let i = 0; i < listenersCopy.length; i++) {
        const listener = listenersCopy[i];
        busLog.debug('emit:listener', {
          type,
          kind: 'specific',
          index: i,
          tag: listenerTags.get(listener) ?? 'untagged',
        });
        try {
          listener(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for '${type}':`, error);
        }
      }
    }

    // Notify wildcard (onAny) listeners
    const anyListeners = Array.from(anyListenersRef.current);
    for (let i = 0; i < anyListeners.length; i++) {
      const listener = anyListeners[i];
      busLog.debug('emit:listener', {
        type,
        kind: 'onAny',
        index: i,
        tag: listenerTags.get(listener) ?? 'untagged',
      });
      try {
        listener(event);
      } catch (error) {
        console.error(`[EventBus] Error in onAny listener for '${type}':`, error);
      }
    }
  }, [debug]);

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  const on = useCallback((type: string, listener: EventListener): Unsubscribe => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }

    const listeners = listenersRef.current.get(type)!;
    listeners.add(listener);
    if (!listenerTags.has(listener)) listenerTags.set(listener, captureSubscriberTag(listener));
    subLog.debug('subscribe', { type, totalListeners: listeners.size, tag: listenerTags.get(listener) });

    if (debug) {
      console.log(`[EventBus] Subscribed to '${type}', total: ${listeners.size}`);
    }

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
      if (debug) {
        console.log(`[EventBus] Unsubscribed from '${type}', remaining: ${listeners.size}`);
      }
      // Clean up empty sets
      if (listeners.size === 0) {
        listenersRef.current.delete(type);
      }
    };
  }, [debug]);

  /**
   * Subscribe to an event type, but only fire once.
   */
  const once = useCallback((type: string, listener: EventListener): Unsubscribe => {
    const wrappedListener: EventListener = (event) => {
      // Remove self before calling listener
      listenersRef.current.get(type)?.delete(wrappedListener);
      listener(event);
    };

    return on(type, wrappedListener);
  }, [on]);

  /**
   * Check if there are any listeners for an event type.
   */
  const hasListeners = useCallback((type: string): boolean => {
    const listeners = listenersRef.current.get(type);
    return listeners !== undefined && listeners.size > 0;
  }, []);

  /**
   * Subscribe to ALL events regardless of type.
   */
  const onAny = useCallback((listener: EventListener): Unsubscribe => {
    anyListenersRef.current.add(listener);
    if (!listenerTags.has(listener)) listenerTags.set(listener, captureSubscriberTag(listener));
    subLog.debug('subscribe:any', { totalAnyListeners: anyListenersRef.current.size, tag: listenerTags.get(listener) });

    if (debug) {
      console.log(`[EventBus] onAny subscribed, total: ${anyListenersRef.current.size}`);
    }

    return () => {
      anyListenersRef.current.delete(listener);
      if (debug) {
        console.log(`[EventBus] onAny unsubscribed, remaining: ${anyListenersRef.current.size}`);
      }
    };
  }, [debug]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      emit,
      on,
      once,
      hasListeners,
      onAny,
      getSelectedEntity,
      clearSelectedEntity,
    }),
    [emit, on, once, hasListeners, onAny, getSelectedEntity, clearSelectedEntity]
  );

  // Bridge to global event bus system.
  // Components in other packages (like shell components) use their own useEventBus hook
  // which checks for a global event bus. Setting it here allows shell components to
  // emit events to the same bus that the main app's trait state machine listens to.
  useEffect(() => {
    setGlobalEventBus(contextValue);
    return () => {
      setGlobalEventBus(null);
    };
  }, [contextValue]);

  return (
    <EventBusContext.Provider value={contextValue}>
      {children}
    </EventBusContext.Provider>
  );
}

export type { EventBusContextType };
