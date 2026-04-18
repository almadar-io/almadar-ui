'use client';
/**
 * useUISlots Hook
 *
 * Core hook for managing UI slot rendering in the trait-driven architecture.
 * Traits use render_ui effects to dynamically render content into slots.
 *
 * Slots:
 * - main: Primary content area
 * - sidebar: Left/right sidebar
 * - modal: Modal overlay
 * - drawer: Slide-in drawer
 * - overlay: Full-screen overlay
 * - center: Centered popup
 * - toast: Toast notifications
 * - hud-top: Game HUD top bar
 * - hud-bottom: Game HUD bottom bar
 * - floating: Draggable floating panel
 *
 * @packageDocumentation
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Valid UI slot names
 */
export type UISlot =
  | 'main'
  | 'sidebar'
  | 'modal'
  | 'drawer'
  | 'overlay'
  | 'center'
  | 'toast'
  | 'hud-top'
  | 'hud-bottom'
  | 'hud-left'
  | 'hud-right'
  | 'floating';

/**
 * Animation types for slot transitions
 */
export type SlotAnimation = 'fade' | 'slide' | 'scale' | 'none';

/**
 * Content rendered in a slot
 */
export interface SlotContent {
  /** Unique ID for this content */
  id: string;
  /** Pattern/component type to render */
  pattern: string;
  /** Props to pass to the pattern component */
  props: Record<string, unknown>;
  /** Priority for conflict resolution (higher wins) */
  priority: number;
  /** Animation for showing/hiding */
  animation?: SlotAnimation;
  /** Auto-dismiss timestamp (for toasts) */
  autoDismissAt?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Source trait that rendered this content */
  sourceTrait?: string;
  /** Stable node ID from the schema pattern tree (for edit mode overlay targeting) */
  nodeId?: string;
}

/**
 * Configuration for render_ui effect
 */
export interface RenderUIConfig {
  /** Target slot */
  target: UISlot;
  /** Pattern/component to render */
  pattern: string;
  /** Props for the pattern */
  props?: Record<string, unknown>;
  /** Priority (default: 0) */
  priority?: number;
  /** Animation type */
  animation?: SlotAnimation;
  /** Auto-dismiss after ms (for toasts) */
  autoDismissMs?: number;
  /** Callback on dismiss */
  onDismiss?: () => void;
  /** Source trait name */
  sourceTrait?: string;
}

/**
 * Callback for slot changes
 */
export type SlotChangeCallback = (slot: UISlot, content: SlotContent | null) => void;

/**
 * Fires when a specific trait's current render-ui output changes.
 * Used by `<TraitFrame>` to subscribe only to the trait it embeds,
 * avoiding wide re-renders when unrelated slots update.
 *
 * Per-trait index stores exactly one entry per trait (the most recent
 * render), so the callback signature carries just the new content —
 * no per-slot disambiguation needed.
 */
export type TraitChangeCallback = (content: SlotContent | null) => void;

/**
 * UI Slot Manager interface
 */
export interface UISlotManager {
  /** Current content for each slot */
  slots: Record<UISlot, SlotContent | null>;
  /** Render content to a slot */
  render: (config: RenderUIConfig) => string;
  /** Clear a specific slot */
  clear: (slot: UISlot) => void;
  /** Clear content by ID */
  clearById: (id: string) => void;
  /** Clear all slots */
  clearAll: () => void;
  /** Subscribe to slot changes */
  subscribe: (callback: SlotChangeCallback) => () => void;
  /** Check if a slot has content */
  hasContent: (slot: UISlot) => boolean;
  /** Get content for a slot */
  getContent: (slot: UISlot) => SlotContent | null;
  /**
   * Look up the most recent `render-ui` output a given trait produced,
   * keyed by `SlotContent.sourceTrait`. Returns `null` when the trait
   * hasn't rendered yet.
   *
   * Backs the `@trait.X` binding's client-side resolution via
   * `<TraitFrame>`. See `docs/Almadar_Std_Gaps.md` §3.8. The binding is
   * single-segment — there's intentionally no slot disambiguation.
   */
  getTraitContent: (traitName: string) => SlotContent | null;
  /**
   * Subscribe to changes in a specific trait's render output. Returns
   * an unsubscribe function.
   *
   * Scoped per-trait so `<TraitFrame>` components only re-render when
   * the trait they embed actually changes — not on every slot update.
   */
  subscribeTrait: (traitName: string, callback: TraitChangeCallback) => () => void;
}

// ============================================================================
// Default Slots State
// ============================================================================

const DEFAULT_SLOTS: Record<UISlot, SlotContent | null> = {
  main: null,
  sidebar: null,
  modal: null,
  drawer: null,
  overlay: null,
  center: null,
  toast: null,
  'hud-top': null,
  'hud-bottom': null,
  'hud-left': null,
  'hud-right': null,
  floating: null,
};

// ============================================================================
// ID Generator
// ============================================================================

let idCounter = 0;
function generateId(): string {
  return `slot-content-${++idCounter}-${Date.now()}`;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Create a UI Slot Manager instance.
 *
 * This is the internal hook that creates the manager.
 * Use `useUISlots()` from context in components.
 */
export function useUISlotManager(): UISlotManager {
  const [slots, setSlots] = useState<Record<UISlot, SlotContent | null>>(DEFAULT_SLOTS);
  const subscribersRef = useRef<Set<SlotChangeCallback>>(new Set());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Reverse index: traitName → most-recent SlotContent. Built
  // opportunistically from `SlotContent.sourceTrait` as each `render()`
  // fires. Per-trait, not per-trait-per-slot — the `@trait.X` binding is
  // single-segment (no `.slot` suffix), so consumers only need the
  // trait's last-emitted frame regardless of which slot it targeted.
  const traitIndexRef = useRef<Map<string, SlotContent>>(new Map());
  const traitSubscribersRef = useRef<Map<string, Set<TraitChangeCallback>>>(new Map());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  // Notify subscribers of slot changes
  const notifySubscribers = useCallback((slot: UISlot, content: SlotContent | null) => {
    subscribersRef.current.forEach((callback) => {
      try {
        callback(slot, content);
      } catch (error) {
        console.error('[UISlots] Subscriber error:', error);
      }
    });
  }, []);

  // Fire trait-scoped subscriptions when a specific trait's output
  // changes (either because it rendered something new, or its content
  // was cleared). Safe against subscriber errors so one bad consumer
  // doesn't silence the rest.
  const notifyTraitSubscribers = useCallback(
    (traitName: string, content: SlotContent | null) => {
      const subs = traitSubscribersRef.current.get(traitName);
      if (!subs) return;
      subs.forEach((callback) => {
        try {
          callback(content);
        } catch (error) {
          console.error(`[UISlots] Trait subscriber error (${traitName}):`, error);
        }
      });
    },
    [],
  );

  // Single-entry per trait. A new render for a trait replaces the
  // previous entry regardless of slot — consumers only see the most
  // recent frame.
  const indexTraitRender = useCallback(
    (traitName: string, content: SlotContent) => {
      traitIndexRef.current.set(traitName, content);
    },
    [],
  );

  // Drop a trait's entry entirely (called when the underlying slot
  // content is cleared).
  const unindexTrait = useCallback((traitName: string) => {
    traitIndexRef.current.delete(traitName);
  }, []);

  // Render content to a slot
  const render = useCallback((config: RenderUIConfig): string => {
    const id = generateId();
    const content: SlotContent = {
      id,
      pattern: config.pattern,
      props: config.props ?? {},
      priority: config.priority ?? 0,
      animation: config.animation ?? 'fade',
      onDismiss: config.onDismiss,
      sourceTrait: config.sourceTrait,
    };

    // Set auto-dismiss timer if specified
    if (config.autoDismissMs && config.autoDismissMs > 0) {
      content.autoDismissAt = Date.now() + config.autoDismissMs;
      const timer = setTimeout(() => {
        setSlots((prev) => {
          if (prev[config.target]?.id === id) {
            // Call onDismiss callback
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

      // Priority-based conflict resolution
      if (existing && existing.priority > content.priority) {
        console.warn(
          `[UISlots] Slot "${config.target}" already has higher priority content (${existing.priority} > ${content.priority})`
        );
        return prev;
      }

      // Maintain the trait-scoped reverse index + notify per-trait
      // subscribers. The index stores one entry per trait regardless of
      // slot, so we don't remove the previous trait's entry just because
      // a new trait took the slot — the old trait's last frame remains
      // queryable until the owning trait is explicitly cleared.
      if (content.sourceTrait) {
        indexTraitRender(content.sourceTrait, content);
        notifyTraitSubscribers(content.sourceTrait, content);
      }

      notifySubscribers(config.target, content);
      return { ...prev, [config.target]: content };
    });

    return id;
  }, [notifySubscribers, notifyTraitSubscribers, indexTraitRender]);

  // Clear a specific slot
  const clear = useCallback((slot: UISlot) => {
    setSlots((prev) => {
      const content = prev[slot];
      if (content) {
        // Clear any auto-dismiss timer
        const timer = timersRef.current.get(content.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(content.id);
        }
        // Call onDismiss callback
        content.onDismiss?.();
        // Trait-scoped cleanup: drop the trait's index entry and notify
        // its subscribers so embedding <TraitFrame>s re-render to empty.
        if (content.sourceTrait) {
          unindexTrait(content.sourceTrait);
          notifyTraitSubscribers(content.sourceTrait, null);
        }
        notifySubscribers(slot, null);
      }
      return { ...prev, [slot]: null };
    });
  }, [notifySubscribers, notifyTraitSubscribers, unindexTrait]);

  // Clear content by ID
  const clearById = useCallback((id: string) => {
    setSlots((prev) => {
      const entry = Object.entries(prev).find(([, content]) => content?.id === id);
      if (entry) {
        const [slot, content] = entry as [UISlot, SlotContent];
        // Clear any auto-dismiss timer
        const timer = timersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(id);
        }
        // Call onDismiss callback
        content.onDismiss?.();
        if (content.sourceTrait) {
          unindexTrait(content.sourceTrait);
          notifyTraitSubscribers(content.sourceTrait, null);
        }
        notifySubscribers(slot, null);
        return { ...prev, [slot]: null };
      }
      return prev;
    });
  }, [notifySubscribers, notifyTraitSubscribers, unindexTrait]);

  // Clear all slots
  const clearAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setSlots((prev) => {
      // Call onDismiss for all content
      Object.entries(prev).forEach(([slot, content]) => {
        if (content) {
          content.onDismiss?.();
          if (content.sourceTrait) {
            notifyTraitSubscribers(content.sourceTrait, null);
          }
          notifySubscribers(slot as UISlot, null);
        }
      });
      return DEFAULT_SLOTS;
    });
    // Wipe the whole trait index after clearing.
    traitIndexRef.current.clear();
  }, [notifySubscribers, notifyTraitSubscribers]);

  // Subscribe to slot changes
  const subscribe = useCallback((callback: SlotChangeCallback): (() => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Check if slot has content
  const hasContent = useCallback((slot: UISlot): boolean => {
    return slots[slot] !== null;
  }, [slots]);

  // Get content for a slot
  const getContent = useCallback((slot: UISlot): SlotContent | null => {
    return slots[slot];
  }, [slots]);

  // Look up the last-rendered content for a given trait. Single-entry
  // per trait — no per-slot disambiguation.
  const getTraitContent = useCallback(
    (traitName: string): SlotContent | null => {
      return traitIndexRef.current.get(traitName) ?? null;
    },
    [],
  );

  // Subscribe to a specific trait's render changes. Returns an unsubscribe.
  const subscribeTrait = useCallback(
    (traitName: string, callback: TraitChangeCallback): (() => void) => {
      let set = traitSubscribersRef.current.get(traitName);
      if (!set) {
        set = new Set();
        traitSubscribersRef.current.set(traitName, set);
      }
      set.add(callback);
      return () => {
        const s = traitSubscribersRef.current.get(traitName);
        if (!s) return;
        s.delete(callback);
        if (s.size === 0) {
          traitSubscribersRef.current.delete(traitName);
        }
      };
    },
    [],
  );

  return {
    slots,
    render,
    clear,
    clearById,
    clearAll,
    subscribe,
    hasContent,
    getContent,
    getTraitContent,
    subscribeTrait,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_SLOTS };
