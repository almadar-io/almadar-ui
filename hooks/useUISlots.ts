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
 * Multi-source model (2026-04-24):
 * A slot can receive renders from multiple source traits across independent
 * batches (e.g. in the playground, ProbeCreate renders "main" on INIT, then
 * later ProbePersistor cascades a render into "main" too). Prior code stored
 * a single SlotContent per slot and last-writer-wins silently dropped
 * earlier traits' frames. Internally the manager now holds a
 * `Record<UISlot, Record<sourceKey, SlotContent>>` map and consumers see an
 * aggregated view: a single SlotContent for single-source slots, or a
 * synthetic `stack` wrapper when 2+ sources are active simultaneously.
 * This mirrors the compiled-path page layout's VStack-of-trait-views.
 *
 * @packageDocumentation
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { EventPayload } from '@almadar/core';

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
 * Pattern-specific props carried by a rendered slot. Pattern authors decide
 * the concrete shape; the slot manager treats this as an opaque record of
 * field-like values sourced from the event-bus payload vocabulary so the
 * same types round-trip through render-ui → useUISlots → UISlotRenderer
 * without a private re-coercion boundary.
 */
export type SlotProps = Record<string, EventPayload[string] | unknown>;

/**
 * Content rendered in a slot
 */
export interface SlotContent {
  /** Unique ID for this content */
  id: string;
  /** Pattern/component type to render */
  pattern: string;
  /** Props to pass to the pattern component */
  props: SlotProps;
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
  props?: SlotProps;
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
  /**
   * Current aggregate content for each slot. Single-source slots hold
   * that source's SlotContent; multi-source slots hold a synthetic
   * `stack` wrapper whose `children` prop is the list of per-source
   * pattern configs in insertion order. Single consumers can continue
   * to read `slots[slot]` without knowing the slot is multi-source.
   */
  slots: Record<UISlot, SlotContent | null>;
  /** Render content to a slot */
  render: (config: RenderUIConfig) => string;
  /** Clear all source entries from a slot */
  clear: (slot: UISlot) => void;
  /** Clear a single source's contribution from a slot, keeping others */
  clearBySource: (slot: UISlot, sourceTrait: string) => void;
  /** Clear content by ID */
  clearById: (id: string) => void;
  /** Clear all slots */
  clearAll: () => void;
  /** Subscribe to slot changes */
  subscribe: (callback: SlotChangeCallback) => () => void;
  /** Check if a slot has content */
  hasContent: (slot: UISlot) => boolean;
  /** Get aggregated content for a slot (single or synthetic stack) */
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

/** Per-source slot entry map: key = sourceTrait (or sentinel when none). */
type SlotSources = Record<string, SlotContent>;

/** Sentinel source key for renders that arrive without a `sourceTrait`. */
const DEFAULT_SOURCE_KEY = '__default__';

/** Sentinel source-trait name on the synthetic stack wrapper. */
const MULTI_SOURCE_STACK_TRAIT = '__multi_source_stack__';

// ============================================================================
// Default Slots State
// ============================================================================

const ALL_SLOTS: readonly UISlot[] = [
  'main',
  'sidebar',
  'modal',
  'drawer',
  'overlay',
  'center',
  'toast',
  'hud-top',
  'hud-bottom',
  'hud-left',
  'hud-right',
  'floating',
];

const DEFAULT_SLOTS: Record<UISlot, SlotContent | null> = ALL_SLOTS.reduce(
  (acc, slot) => {
    acc[slot] = null;
    return acc;
  },
  {} as Record<UISlot, SlotContent | null>,
);

const DEFAULT_SOURCES: Record<UISlot, SlotSources> = ALL_SLOTS.reduce(
  (acc, slot) => {
    acc[slot] = {};
    return acc;
  },
  {} as Record<UISlot, SlotSources>,
);

// ============================================================================
// ID Generator
// ============================================================================

let idCounter = 0;
function generateId(): string {
  return `slot-content-${++idCounter}-${Date.now()}`;
}

// ============================================================================
// Aggregation
// ============================================================================

/**
 * Collapse a slot's per-source SlotContent map into a single SlotContent
 * that the renderer can consume. Sources iterate in insertion order
 * (Object.keys preserves string-key insertion order in modern runtimes),
 * which matches the `.lolo` page-level trait declaration order.
 *
 * - 0 sources → null (empty slot).
 * - 1 source → that SlotContent verbatim.
 * - 2+ sources → synthetic `stack` wrapper whose children are the
 *   pattern configs of each source in order.
 */
function aggregateSlot(sources: SlotSources | undefined): SlotContent | null {
  if (!sources) return null;
  const entries = Object.entries(sources);
  if (entries.length === 0) return null;
  if (entries.length === 1) return entries[0][1];

  // Multi-source: build a stack wrapper.
  const children = entries.map(([, entry]) => ({
    type: entry.pattern,
    ...entry.props,
  }));
  const stackId = `slot-content-stack-${entries.map(([k]) => k).join('-')}`;
  return {
    id: stackId,
    pattern: 'stack',
    props: {
      direction: 'vertical',
      gap: 'lg',
      children,
    },
    priority: 0,
    animation: 'fade',
    sourceTrait: MULTI_SOURCE_STACK_TRAIT,
  };
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
  // Canonical state: per-slot, per-source SlotContent. Everything else
  // (the exposed `slots` aggregate map, trait reverse index, etc.) is
  // derived from this.
  const [sources, setSources] = useState<Record<UISlot, SlotSources>>(DEFAULT_SOURCES);
  const subscribersRef = useRef<Set<SlotChangeCallback>>(new Set());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Reverse index: traitName → most-recent SlotContent. Built
  // opportunistically from `SlotContent.sourceTrait` as each `render()`
  // fires. Per-trait, not per-trait-per-slot — the `@trait.X` binding is
  // single-segment (no `.slot` suffix), so consumers only need the
  // trait's last-emitted frame regardless of which slot it targeted.
  const traitIndexRef = useRef<Map<string, SlotContent>>(new Map());
  const traitSubscribersRef = useRef<Map<string, Set<TraitChangeCallback>>>(new Map());

  // Computed aggregate `slots` — memoised so React consumers only see
  // identity changes when a slot's actual content changes.
  const slots = useMemo<Record<UISlot, SlotContent | null>>(() => {
    const out: Record<UISlot, SlotContent | null> = { ...DEFAULT_SLOTS };
    for (const slot of ALL_SLOTS) {
      out[slot] = aggregateSlot(sources[slot]);
    }
    return out;
  }, [sources]);

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
  const render = useCallback(
    (config: RenderUIConfig): string => {
      const id = generateId();
      const sourceKey = config.sourceTrait ?? DEFAULT_SOURCE_KEY;
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
          setSources((prev) => {
            const slotSources = prev[config.target];
            if (slotSources && slotSources[sourceKey]?.id === id) {
              content.onDismiss?.();
              const next = { ...slotSources };
              delete next[sourceKey];
              const updated = { ...prev, [config.target]: next };
              notifySubscribers(config.target, aggregateSlot(next));
              return updated;
            }
            return prev;
          });
          timersRef.current.delete(id);
        }, config.autoDismissMs);
        timersRef.current.set(id, timer);
      }

      setSources((prev) => {
        const slotSources = prev[config.target] ?? {};
        const existing = slotSources[sourceKey];

        // Priority-based conflict resolution within the same source.
        // Cross-source renders coexist; within a single source, a higher-
        // priority content wins over a newer lower-priority content.
        if (existing && existing.priority > content.priority) {
          console.warn(
            `[UISlots] Slot "${config.target}" source "${sourceKey}" already has higher priority content (${existing.priority} > ${content.priority})`,
          );
          return prev;
        }

        const nextSources: SlotSources = {
          ...slotSources,
          [sourceKey]: content,
        };
        const nextAll = { ...prev, [config.target]: nextSources };

        // Maintain the trait-scoped reverse index + notify per-trait
        // subscribers. The index stores one entry per trait regardless
        // of slot, so we don't remove the previous trait's entry just
        // because a new trait took a slot — the old trait's last frame
        // remains queryable until the owning trait is explicitly cleared.
        if (content.sourceTrait) {
          indexTraitRender(content.sourceTrait, content);
          notifyTraitSubscribers(content.sourceTrait, content);
        }

        notifySubscribers(config.target, aggregateSlot(nextSources));
        return nextAll;
      });

      return id;
    },
    [notifySubscribers, notifyTraitSubscribers, indexTraitRender],
  );

  // Clear a specific slot — wipes all source entries.
  const clear = useCallback(
    (slot: UISlot) => {
      setSources((prev) => {
        const slotSources = prev[slot];
        if (!slotSources || Object.keys(slotSources).length === 0) {
          return prev;
        }
        // Fire onDismiss + trait cleanups for every source in the slot.
        for (const content of Object.values(slotSources)) {
          const timer = timersRef.current.get(content.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(content.id);
          }
          content.onDismiss?.();
          if (content.sourceTrait) {
            unindexTrait(content.sourceTrait);
            notifyTraitSubscribers(content.sourceTrait, null);
          }
        }
        notifySubscribers(slot, null);
        return { ...prev, [slot]: {} };
      });
    },
    [notifySubscribers, notifyTraitSubscribers, unindexTrait],
  );

  // Clear a single source's contribution from a slot.
  const clearBySource = useCallback(
    (slot: UISlot, sourceTrait: string) => {
      const sourceKey = sourceTrait;
      setSources((prev) => {
        const slotSources = prev[slot];
        if (!slotSources || !(sourceKey in slotSources)) return prev;
        const content = slotSources[sourceKey];
        const timer = timersRef.current.get(content.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(content.id);
        }
        content.onDismiss?.();
        if (content.sourceTrait) {
          unindexTrait(content.sourceTrait);
          notifyTraitSubscribers(content.sourceTrait, null);
        }
        const nextSources: SlotSources = { ...slotSources };
        delete nextSources[sourceKey];
        notifySubscribers(slot, aggregateSlot(nextSources));
        return { ...prev, [slot]: nextSources };
      });
    },
    [notifySubscribers, notifyTraitSubscribers, unindexTrait],
  );

  // Clear content by ID — finds and removes the matching entry.
  const clearById = useCallback(
    (id: string) => {
      setSources((prev) => {
        for (const slot of ALL_SLOTS) {
          const slotSources = prev[slot];
          if (!slotSources) continue;
          const matchKey = Object.keys(slotSources).find(
            (k) => slotSources[k].id === id,
          );
          if (!matchKey) continue;
          const content = slotSources[matchKey];
          const timer = timersRef.current.get(id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
          }
          content.onDismiss?.();
          if (content.sourceTrait) {
            unindexTrait(content.sourceTrait);
            notifyTraitSubscribers(content.sourceTrait, null);
          }
          const nextSources: SlotSources = { ...slotSources };
          delete nextSources[matchKey];
          notifySubscribers(slot, aggregateSlot(nextSources));
          return { ...prev, [slot]: nextSources };
        }
        return prev;
      });
    },
    [notifySubscribers, notifyTraitSubscribers, unindexTrait],
  );

  // Clear all slots
  const clearAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();

    setSources((prev) => {
      // Call onDismiss for every source entry and notify subscribers.
      for (const slot of ALL_SLOTS) {
        const slotSources = prev[slot];
        if (!slotSources) continue;
        for (const content of Object.values(slotSources)) {
          content.onDismiss?.();
          if (content.sourceTrait) {
            notifyTraitSubscribers(content.sourceTrait, null);
          }
        }
        notifySubscribers(slot, null);
      }
      return DEFAULT_SOURCES;
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
  const hasContent = useCallback(
    (slot: UISlot): boolean => slots[slot] !== null,
    [slots],
  );

  // Get aggregated content for a slot.
  const getContent = useCallback(
    (slot: UISlot): SlotContent | null => slots[slot],
    [slots],
  );

  // Look up the last-rendered content for a given trait. Single-entry
  // per trait — no per-slot disambiguation.
  const getTraitContent = useCallback(
    (traitName: string): SlotContent | null =>
      traitIndexRef.current.get(traitName) ?? null,
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
    clearBySource,
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
