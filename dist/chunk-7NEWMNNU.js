import { useState, useRef, useEffect, useCallback } from 'react';

// hooks/useUISlots.ts
var DEFAULT_SLOTS = {
  main: null,
  sidebar: null,
  modal: null,
  drawer: null,
  overlay: null,
  center: null,
  toast: null,
  "hud-top": null,
  "hud-bottom": null,
  floating: null
};
var idCounter = 0;
function generateId() {
  return `slot-content-${++idCounter}-${Date.now()}`;
}
function useUISlotManager() {
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const subscribersRef = useRef(/* @__PURE__ */ new Set());
  const timersRef = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);
  const notifySubscribers = useCallback((slot, content) => {
    subscribersRef.current.forEach((callback) => {
      try {
        callback(slot, content);
      } catch (error) {
        console.error("[UISlots] Subscriber error:", error);
      }
    });
  }, []);
  const render = useCallback((config) => {
    const id = generateId();
    const content = {
      id,
      pattern: config.pattern,
      props: config.props ?? {},
      priority: config.priority ?? 0,
      animation: config.animation ?? "fade",
      onDismiss: config.onDismiss,
      sourceTrait: config.sourceTrait
    };
    if (config.autoDismissMs && config.autoDismissMs > 0) {
      content.autoDismissAt = Date.now() + config.autoDismissMs;
      const timer = setTimeout(() => {
        setSlots((prev) => {
          if (prev[config.target]?.id === id) {
            content.onDismiss?.();
            notifySubscribers(config.target, null);
            return { ...prev, [config.target]: null };
          }
          return prev;
        });
        timersRef.current.delete(id);
      }, config.autoDismissMs);
      timersRef.current.set(id, timer);
    }
    setSlots((prev) => {
      const existing = prev[config.target];
      if (existing && existing.priority > content.priority) {
        console.warn(
          `[UISlots] Slot "${config.target}" already has higher priority content (${existing.priority} > ${content.priority})`
        );
        return prev;
      }
      notifySubscribers(config.target, content);
      return { ...prev, [config.target]: content };
    });
    return id;
  }, [notifySubscribers]);
  const clear = useCallback((slot) => {
    setSlots((prev) => {
      const content = prev[slot];
      if (content) {
        const timer = timersRef.current.get(content.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(content.id);
        }
        content.onDismiss?.();
        notifySubscribers(slot, null);
      }
      return { ...prev, [slot]: null };
    });
  }, [notifySubscribers]);
  const clearById = useCallback((id) => {
    setSlots((prev) => {
      const entry = Object.entries(prev).find(([, content]) => content?.id === id);
      if (entry) {
        const [slot, content] = entry;
        const timer = timersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(id);
        }
        content.onDismiss?.();
        notifySubscribers(slot, null);
        return { ...prev, [slot]: null };
      }
      return prev;
    });
  }, [notifySubscribers]);
  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setSlots((prev) => {
      Object.entries(prev).forEach(([slot, content]) => {
        if (content) {
          content.onDismiss?.();
          notifySubscribers(slot, null);
        }
      });
      return DEFAULT_SLOTS;
    });
  }, [notifySubscribers]);
  const subscribe = useCallback((callback) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);
  const hasContent = useCallback((slot) => {
    return slots[slot] !== null;
  }, [slots]);
  const getContent = useCallback((slot) => {
    return slots[slot];
  }, [slots]);
  return {
    slots,
    render,
    clear,
    clearById,
    clearAll,
    subscribe,
    hasContent,
    getContent
  };
}

export { DEFAULT_SLOTS, useUISlotManager };
