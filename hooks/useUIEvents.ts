'use client';
/**
 * useUIEvents - UI Event to State Machine Bridge
 *
 * Listens for UI:* events from the event bus and dispatches them
 * to the trait state machine. The UI: prefix is stripped and the
 * event name is passed through as-is. No translation, no mapping.
 *
 * Components emit `UI:{EVENT}` where {EVENT} matches the trait's
 * event key exactly. The schema is the source of truth for event names.
 */

import { useEffect, useState, useMemo, useContext } from "react";
import { useEventBus, type BusEvent } from "./useEventBus";
import { SelectionContext } from "../providers/SelectionProvider";

const UI_PREFIX = 'UI:';

/**
 * Hook to bridge UI events to state machine dispatch
 *
 * @param dispatch - The state machine dispatch function
 * @param validEvents - Optional array of valid event names (filters which events to handle)
 * @param eventBusInstance - Optional event bus instance (for testing, uses hook if not provided)
 */
export function useUIEvents<E extends string>(
  dispatch: (event: E, payload?: unknown) => void,
  validEvents?: readonly E[],
  eventBusInstance?: ReturnType<typeof useEventBus>,
): void {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;

  // Stabilize validEvents to prevent re-subscriptions when array reference changes
  // but contents are the same. This is critical because generated trait hooks
  // pass inline arrays which create new references on every render.
  const validEventsKey = validEvents
    ? validEvents.slice().sort().join(",")
    : "";
  const stableValidEvents = useMemo(
    () => validEvents,
    [validEventsKey], // intentional — validEventsKey is the stable dep, not validEvents array ref
  );

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // Build the set of event names to listen for.
    // If validEvents is provided, subscribe to UI:{event} for each.
    // Otherwise subscribe to a wildcard via onAny.
    if (stableValidEvents) {
      for (const smEvent of stableValidEvents) {
        // Listen for UI:EVENT (what components and verify bridge emit)
        const prefixedHandler = (event: BusEvent) => {
          dispatch(smEvent, event.payload);
        };
        unsubscribes.push(eventBus.on(`${UI_PREFIX}${smEvent}`, prefixedHandler));

        // Also listen for EVENT directly (cross-trait internal events)
        const directHandler = (event: BusEvent) => {
          dispatch(smEvent, event.payload);
        };
        unsubscribes.push(eventBus.on(smEvent, directHandler));
      }
    }

    // UI:DISPATCH carries the event name in payload.event (generic dispatch)
    const genericHandler = (event: BusEvent) => {
      const eventName = event.payload?.event as string | undefined;
      if (eventName) {
        const smEvent = eventName as E;
        if (!stableValidEvents || stableValidEvents.includes(smEvent)) {
          dispatch(smEvent, event.payload);
        }
      }
    };
    unsubscribes.push(eventBus.on(`${UI_PREFIX}DISPATCH`, genericHandler));

    return () => {
      for (const unsub of unsubscribes) {
        if (typeof unsub === 'function') unsub();
      }
    };
  }, [eventBus, dispatch, stableValidEvents]);
}

/**
 * Hook for selected entity tracking
 * Many list UIs need to track which item is selected.
 *
 * This hook uses SelectionProvider if available (preferred),
 * otherwise falls back to listening to events directly.
 *
 * @example Using with SelectionProvider (recommended)
 * ```tsx
 * function MyPage() {
 *   return (
 *     <EventBusProvider>
 *       <SelectionProvider>
 *         <MyComponent />
 *       </SelectionProvider>
 *     </EventBusProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [selected, setSelected] = useSelectedEntity<Order>();
 *   // selected is automatically updated when UI:VIEW/UI:SELECT events fire
 * }
 * ```
 */
export function useSelectedEntity<T>(
  eventBusInstance?: ReturnType<typeof useEventBus>,
): [T | null, (entity: T | null) => void] {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;

  // Try to use SelectionProvider context first (preferred - survives component mount/unmount)
  // Import dynamically to avoid circular dependency
  const selectionContext = useSelectionContext<T>();

  // Local state for fallback mode (when SelectionProvider is not available)
  const [localSelected, setLocalSelected] = useState<T | null>(null);

  // Track if we're using context mode
  const usingContext = selectionContext !== null;

  // Listen for selection events (fallback mode only - when no SelectionProvider)
  useEffect(() => {
    // Skip event listening if we have a SelectionProvider (it handles events itself)
    if (usingContext) return;

    const handleSelect = (event: BusEvent) => {
      const row = event.payload?.row as T | undefined;
      if (row) {
        setLocalSelected(row);
      }
    };

    const handleDeselect = () => {
      setLocalSelected(null);
    };

    const unsubSelect = eventBus.on("UI:SELECT", handleSelect);
    const unsubView = eventBus.on("UI:VIEW", handleSelect);
    const unsubDeselect = eventBus.on("UI:DESELECT", handleDeselect);
    const unsubClose = eventBus.on("UI:CLOSE", handleDeselect);
    const unsubCancel = eventBus.on("UI:CANCEL", handleDeselect);

    return () => {
      [unsubSelect, unsubView, unsubDeselect, unsubClose, unsubCancel].forEach(
        (unsub) => { if (typeof unsub === 'function') unsub(); }
      );
    };
  }, [eventBus, usingContext]);

  // Return context values if available, otherwise local state
  if (selectionContext) {
    return [selectionContext.selected, selectionContext.setSelected];
  }

  return [localSelected, setLocalSelected];
}

/**
 * Internal hook to safely access SelectionContext without throwing.
 * Returns null if SelectionProvider is not in the tree.
 */
function useSelectionContext<T>(): {
  selected: T | null;
  setSelected: (entity: T | null) => void;
} | null {
  // useContext returns null if the context is not available (no provider in tree)
  const context = useContext(SelectionContext);
  return context as {
    selected: T | null;
    setSelected: (entity: T | null) => void;
  } | null;
}
