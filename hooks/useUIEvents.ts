'use client';
/**
 * useUIEvents - UI Event to State Machine Bridge
 *
 * Listens for `UI:{TraitName}.{EVENT}` events from the event bus and
 * dispatches them to the trait state machine. The dotted form mirrors
 * the listens-block grammar (`Trait.EVENT` / `Orbital.Trait.EVENT`),
 * so producer and consumer share one namespace and cross-orbital
 * trait contamination is mechanically impossible (gap #13).
 *
 * Components emit `eventBus.emit(\`UI:${action}\`, ...)` where `action`
 * is the qualified `Trait.EVENT` string they receive from codegen
 * (compile path) or the runtime interpreter (preview path). The schema
 * is the source of truth for event names; codegen does the
 * qualification.
 */

import { useEffect, useMemo } from "react";
import { useEventBus, type BusEvent } from "./useEventBus";
import type { EventPayload } from "@almadar/core";

const UI_PREFIX = 'UI:';

/**
 * Hook to bridge UI events to state machine dispatch.
 *
 * @param dispatch - The state machine dispatch function
 * @param traitName - Owning trait name; used to construct the qualified
 *   subscription key `UI:{traitName}.{event}`. Required — bare-key
 *   subscriptions were removed when the bus namespace unified on the
 *   listens grammar (gap #13, Phase 4 of the cross-orbital plan).
 * @param validEvents - Local event names (transition triggers) the
 *   trait reacts to. The hook subscribes to `UI:{traitName}.{event}`
 *   for each entry.
 * @param eventBusInstance - Optional event bus instance (for testing)
 */
export function useUIEvents<E extends string>(
  dispatch: (event: E, payload?: EventPayload) => void,
  traitName: string,
  validEvents: readonly E[],
  eventBusInstance?: ReturnType<typeof useEventBus>,
): void {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;

  // Stabilize validEvents to prevent re-subscriptions when the array
  // reference changes but contents are the same. Generated trait hooks
  // pass inline arrays that create a new reference on every render.
  const validEventsKey = validEvents.slice().sort().join(",");
  const stableValidEvents = useMemo(
    () => validEvents,
    [validEventsKey], // intentional — validEventsKey is the stable dep
  );

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    for (const smEvent of stableValidEvents) {
      const handler = (event: BusEvent) => {
        // Skip bridge echoes on the OWN qualified key. The orbital
        // bridge re-broadcasts every transition event on the qualified
        // bus key so cross-trait `useTraitListens` subscriptions fire.
        // Without this guard, the trait that JUST dispatched E hears
        // its own echo and dispatches E again — infinite loop. Cross-
        // trait listeners don't subscribe to their OWN qualified key
        // (different trait scope), so they're unaffected.
        if (event.source && (event.source as { fromBridge?: boolean }).fromBridge) {
          return;
        }
        dispatch(smEvent, event.payload);
      };
      unsubscribes.push(
        eventBus.on(`${UI_PREFIX}${traitName}.${smEvent}`, handler),
      );
    }

    return () => {
      for (const unsub of unsubscribes) {
        if (typeof unsub === 'function') unsub();
      }
    };
  }, [eventBus, dispatch, traitName, stableValidEvents]);
}

/**
 * Hook to subscribe to cross-trait listens (gap #13, Phase 4 codegen).
 *
 * The schema's `listens { Source EVENT -> TRIGGER }` block resolves at
 * lower-time to a typed `ListenSource` enum (intra-orbital `Trait` or
 * cross-orbital `Orbital.Trait`). Codegen materializes one
 * `useTraitListens` call per trait, listing every `(sourceTrait,
 * sourceEvent, localTrigger)` tuple from the listens block. The hook
 * subscribes to the qualified bus key — `UI:Trait.EVENT` (intra-orbital)
 * or `UI:Orbital.Trait.EVENT` (cross-orbital) — and dispatches the
 * local trigger when the source fires.
 *
 * Replaces the old bare-event cross-trait fan-out that lived inside
 * `useUIEvents`. Pre-unification, `useUIEvents` subscribed to bare
 * `EVENT` keys and matched on `source.trait !== own`; post-unification,
 * the qualified bus key carries the source identity directly, no
 * `source` filtering needed.
 */
export interface TraitListenSpec<E extends string> {
  /** Qualified `Trait.EVENT` or `Orbital.Trait.EVENT` source. */
  sourceKey: string;
  /** Local trigger event to dispatch when the source fires. */
  trigger: E;
}

export function useTraitListens<E extends string>(
  dispatch: (event: E, payload?: EventPayload) => void,
  listens: readonly TraitListenSpec<E>[],
  eventBusInstance?: ReturnType<typeof useEventBus>,
): void {
  const defaultEventBus = useEventBus();
  const eventBus = eventBusInstance ?? defaultEventBus;

  const stableKey = listens
    .map((l) => `${l.sourceKey}->${l.trigger}`)
    .sort()
    .join("|");
  const stableListens = useMemo(
    () => listens,
    [stableKey], // intentional
  );

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];
    for (const spec of stableListens) {
      const handler = (event: BusEvent) => {
        dispatch(spec.trigger, event.payload);
      };
      unsubscribes.push(eventBus.on(`${UI_PREFIX}${spec.sourceKey}`, handler));
    }
    return () => {
      for (const unsub of unsubscribes) {
        if (typeof unsub === 'function') unsub();
      }
    };
  }, [eventBus, dispatch, stableListens]);
}
