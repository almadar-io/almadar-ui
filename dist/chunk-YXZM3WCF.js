import { createContext, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { jsx } from 'react/jsx-runtime';

// providers/EventBusProvider.tsx
function setGlobalEventBus(bus) {
  if (typeof window !== "undefined") {
    window.__kflowEventBus = bus;
  }
}
function getGlobalEventBus() {
  if (typeof window !== "undefined") {
    return window.__kflowEventBus ?? null;
  }
  return null;
}
var fallbackListeners = /* @__PURE__ */ new Map();
var fallbackAnyListeners = /* @__PURE__ */ new Set();
var fallbackEventBus = {
  emit: (type, payload) => {
    const event = {
      type,
      payload,
      timestamp: Date.now()
    };
    const handlers = fallbackListeners.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for '${type}':`, error);
        }
      });
    }
    fallbackAnyListeners.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Error in onAny listener for '${type}':`, error);
      }
    });
  },
  on: (type, listener) => {
    if (!fallbackListeners.has(type)) {
      fallbackListeners.set(type, /* @__PURE__ */ new Set());
    }
    fallbackListeners.get(type).add(listener);
    return () => {
      const handlers = fallbackListeners.get(type);
      if (handlers) {
        handlers.delete(listener);
        if (handlers.size === 0) {
          fallbackListeners.delete(type);
        }
      }
    };
  },
  once: (type, listener) => {
    const wrappedListener = (event) => {
      fallbackListeners.get(type)?.delete(wrappedListener);
      listener(event);
    };
    return fallbackEventBus.on(type, wrappedListener);
  },
  hasListeners: (type) => {
    const handlers = fallbackListeners.get(type);
    return handlers !== void 0 && handlers.size > 0;
  },
  onAny: (listener) => {
    fallbackAnyListeners.add(listener);
    return () => {
      fallbackAnyListeners.delete(listener);
    };
  }
};
function useEventBus() {
  const context = useContext(EventBusContext);
  return context ?? getGlobalEventBus() ?? fallbackEventBus;
}
function useEventListener(event, handler) {
  const eventBus = useEventBus();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const wrappedHandler = (evt) => {
      handlerRef.current(evt);
    };
    const unsub = eventBus.on(event, wrappedHandler);
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [event, eventBus]);
}
function useEmitEvent() {
  const eventBus = useEventBus();
  return useCallback(
    (type, payload) => {
      eventBus.emit(type, payload);
    },
    [eventBus]
  );
}
var EventBusContext = createContext(null);
function EventBusProvider({ children, debug = false }) {
  const listenersRef = useRef(/* @__PURE__ */ new Map());
  const anyListenersRef = useRef(/* @__PURE__ */ new Set());
  const deprecationWarningShown = useRef(false);
  const getSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        "[EventBus] getSelectedEntity is deprecated. Use SelectionProvider and useSelection hook instead. See SelectionProvider.tsx for migration guide."
      );
      deprecationWarningShown.current = true;
    }
    return null;
  }, []);
  const clearSelectedEntity = useCallback(() => {
    if (!deprecationWarningShown.current) {
      console.warn(
        "[EventBus] clearSelectedEntity is deprecated. Use SelectionProvider and useSelection hook instead. See SelectionProvider.tsx for migration guide."
      );
      deprecationWarningShown.current = true;
    }
  }, []);
  const emit = useCallback((type, payload) => {
    const event = {
      type,
      payload,
      timestamp: Date.now()
    };
    const listeners = listenersRef.current.get(type);
    const listenerCount = listeners?.size ?? 0;
    if (debug) {
      if (listenerCount > 0) {
        console.log(`[EventBus] Emit: ${type} \u2192 ${listenerCount} listener(s)`, payload);
      } else {
        console.warn(`[EventBus] Emit: ${type} (NO LISTENERS - event may be lost!)`, payload);
      }
    }
    if (listeners) {
      const listenersCopy = Array.from(listeners);
      for (const listener of listenersCopy) {
        try {
          listener(event);
        } catch (error) {
          console.error(`[EventBus] Error in listener for '${type}':`, error);
        }
      }
    }
    const anyListeners = Array.from(anyListenersRef.current);
    for (const listener of anyListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`[EventBus] Error in onAny listener for '${type}':`, error);
      }
    }
  }, [debug]);
  const on = useCallback((type, listener) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, /* @__PURE__ */ new Set());
    }
    const listeners = listenersRef.current.get(type);
    listeners.add(listener);
    if (debug) {
      console.log(`[EventBus] Subscribed to '${type}', total: ${listeners.size}`);
    }
    return () => {
      listeners.delete(listener);
      if (debug) {
        console.log(`[EventBus] Unsubscribed from '${type}', remaining: ${listeners.size}`);
      }
      if (listeners.size === 0) {
        listenersRef.current.delete(type);
      }
    };
  }, [debug]);
  const once = useCallback((type, listener) => {
    const wrappedListener = (event) => {
      listenersRef.current.get(type)?.delete(wrappedListener);
      listener(event);
    };
    return on(type, wrappedListener);
  }, [on]);
  const hasListeners = useCallback((type) => {
    const listeners = listenersRef.current.get(type);
    return listeners !== void 0 && listeners.size > 0;
  }, []);
  const onAny = useCallback((listener) => {
    anyListenersRef.current.add(listener);
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
  const contextValue = useMemo(
    () => ({
      emit,
      on,
      once,
      hasListeners,
      onAny,
      getSelectedEntity,
      clearSelectedEntity
    }),
    [emit, on, once, hasListeners, onAny, getSelectedEntity, clearSelectedEntity]
  );
  useEffect(() => {
    setGlobalEventBus(contextValue);
    return () => {
      setGlobalEventBus(null);
    };
  }, [contextValue]);
  return /* @__PURE__ */ jsx(EventBusContext.Provider, { value: contextValue, children });
}

export { EventBusContext, EventBusProvider, useEmitEvent, useEventBus, useEventListener };
