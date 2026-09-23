/**
 * useBusIngress — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1 G2).
 *
 * The ONE bus subscription: a component still emits onto the event bus
 * exactly as before (`TraitScopeProvider`'s qualified `UI:<Orbital>.<Trait>.
 * <EVENT>` key; a composed atom's own `(emit EVENT)` reaching sibling atoms
 * via the bare `UI:<EVENT>` key). This hook's ONLY job is translating that
 * bus key into one settled dispatch (`dispatch`, the composer's
 * `dispatchAndSettle`: kernel dispatch → slot flush) — no echo dropping, no effect-name
 * scans, no listen relay. The kernel's own composition
 * (`evaluateOrbitalEvent`'s `collectListenerTargets` fan-out, run internally
 * by `dispatchWithServerLeg`) owns cross-trait `listens{}` delivery; nothing
 * here re-derives it.
 *
 * R-RUNTIME-020 (no ping-pong): the kernel's emit sink is in-memory and
 * feeds only its own listen fan-out. The composer republishes those emits
 * on the real bus with `dispatched: true` for subscribers outside the
 * kernel; this hook drops a republished emit whose source trait is in its
 * own `traitIndex`, since the kernel already delivered it.
 *
 * A bare-key emit fans to every trait `traitIndex` currently holds that
 * transitions on that event — `dispatchWithServerLeg` requires exactly one
 * seed trait per call (plan §4.2 P4), so a broadcast-shaped bare emit
 * becomes N single-trait `kernel.dispatch` calls; the kernel's own FIFO
 * queue (plan §5.1 G1) serializes them.
 *
 * @packageDocumentation
 */
import { useEffect } from 'react';
import type { BusEventSource, EventPayload, ResolvedTraitBinding } from '@almadar/core';
import { LIFECYCLE_EVENTS, type TraitIndex } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import type { EventBusContextType } from '../../types/event-bus-types';

const log = createLogger('almadar:ui:circuit:bus-ingress');

export type BusDispatch = (
  traitName: string,
  eventKey: string,
  payload: EventPayload | undefined,
  tick?: string,
) => Promise<void>;

export function useBusIngress(
  traitBindings: readonly ResolvedTraitBinding[],
  traitIndex: TraitIndex,
  settle: BusDispatch,
  eventBus: EventBusContextType,
): void {
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];
    const subscribedQualified = new Set<string>();
    const subscribedBare = new Set<string>();

    // A republished kernel emit from one of THIS kernel's traits was already
    // delivered by the kernel's own listen fan-out.
    const deliveredHere = (source: BusEventSource | undefined): boolean =>
      source?.dispatched === true && source.trait !== undefined && traitIndex.byName.has(source.trait);

    const dispatch = (
      traitName: string,
      eventKey: string,
      payload: EventPayload | undefined,
      tick: string | undefined,
    ): void => {
      void settle(traitName, eventKey, payload, tick).catch((err: Error) => {
        log.error('dispatch:failed', { trait: traitName, event: eventKey, error: String(err) });
      });
    };

    for (const binding of traitBindings) {
      const traitName = binding.trait.name;
      const orbitalName = traitIndex.byName.get(traitName)?.orbitalName;
      if (orbitalName === undefined) continue;

      for (const transition of binding.trait.transitions) {
        const eventKey = transition.event;
        if ((LIFECYCLE_EVENTS as readonly string[]).includes(eventKey)) continue;

        const qualifiedKey = `UI:${orbitalName}.${traitName}.${eventKey}`;
        if (!subscribedQualified.has(qualifiedKey)) {
          subscribedQualified.add(qualifiedKey);
          const unsub = eventBus.on(qualifiedKey, (event) => {
            if (deliveredHere(event.source)) return;
            log.debug('qualified:fire', { key: qualifiedKey });
            dispatch(traitName, eventKey, event.payload, event.source?.tick);
          });
          unsubscribes.push(unsub);
        }

        const bareKey = `UI:${eventKey}`;
        if (!subscribedBare.has(bareKey)) {
          subscribedBare.add(bareKey);
          const unsub = eventBus.on(bareKey, (event) => {
            if (deliveredHere(event.source)) return;
            for (const [name, entry] of traitIndex.byName) {
              if (!entry.traitDef.transitions.some((t: { event: string }) => t.event === eventKey)) continue;
              log.debug('bare:fire', { key: bareKey, trait: name });
              dispatch(name, eventKey, event.payload, event.source?.tick);
            }
          });
          unsubscribes.push(unsub);
        }
      }
    }

    return () => {
      for (const unsub of unsubscribes) unsub();
    };
  }, [traitBindings, traitIndex, settle, eventBus]);
}
