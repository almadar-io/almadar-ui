/**
 * useBusIngress — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1 G2).
 *
 * The ONE bus subscription: a component still emits onto the event bus
 * exactly as before (`TraitScopeProvider`'s qualified `UI:<Orbital>.<Trait>.
 * <EVENT>` key; a composed atom's own `(emit EVENT)` reaching sibling atoms
 * via the bare `UI:<EVENT>` key). This hook's job is translating that
 * bus key into one settled dispatch (`dispatch`, the composer's
 * `dispatchAndSettle`: kernel dispatch → slot flush) — no echo dropping, no
 * effect-name scans. The kernel's own composition
 * (`evaluateOrbitalEvent`'s `collectListenerTargets` fan-out, run internally
 * by `dispatchWithServerLeg`) owns cross-trait `listens{}` delivery for
 * events that ENTER through a dispatch; the `listen-source` subscription
 * block below additionally routes bus-originated emits that land on a
 * declared listen SOURCE key straight to the listener (the emitter declares
 * no transition on the event — the CREATE-button shape), which no dispatch
 * entry point would otherwise see.
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
import type { BusEventSource, EventPayload, ResolvedTraitBinding, SExpr } from '@almadar/core';
import { applyListenPayloadMapping } from '@almadar/core';
import { evaluateListenPayloadExpr } from '@almadar/evaluator';
import { collectListenerTargets, LIFECYCLE_EVENTS, type TraitIndex } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import type { EventBusContextType } from '../../types/event-bus-types';

const log = createLogger('almadar:ui:circuit:bus-ingress');

export type BusDispatch = (
  traitName: string,
  eventKey: string,
  payload: EventPayload | undefined,
  tick?: string,
) => Promise<void>;

/** One listen route behind a shared qualified source key. */
interface ListenRoute {
  listenerTrait: string;
  triggers: string;
  payloadMapping: Record<string, SExpr> | undefined;
}

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
            // A republished echo reaching a trait through an explicit listens
            // route was already delivered on that route (server fan-out or the
            // kernel's response fold) — bare-name delivery would run it twice.
            const routed = event.source?.dispatched === true
              ? new Set(collectListenerTargets(traitIndex, event.source, eventKey, event.payload).map((t) => t.listenerTrait))
              : undefined;
            for (const [name, entry] of traitIndex.byName) {
              if (!entry.traitDef.transitions.some((t: { event: string }) => t.event === eventKey)) continue;
              if (routed?.has(name) === true) continue;
              log.debug('bare:fire', { key: bareKey, trait: name });
              dispatch(name, eventKey, event.payload, event.source?.tick);
            }
          });
          unsubscribes.push(unsub);
        }
      }
    }

    // Listen-source keys: an event whose ONLY circuit meaning is a declared
    // `listens` source — the emitter trait declares no transition on it, so
    // neither subscription above matches, and a component-originated emit on
    // the source key (e.g. std-api-gateway's "Create Route" button:
    // RouteCatalog renders the button, declares no CREATE transition;
    // RouteCreate `listens { RouteCatalog CREATE -> CREATE }`) previously
    // reached nothing and the click was a no-op. The pre-W5b hook covered
    // this with its `listen:subscribe` block; the adapter refactor dropped
    // it. One subscription per qualified source key; each fire settles every
    // listener registered for that key through the SAME kernel dispatch as
    // any other event (payload mapping applied — the client twin of the
    // composition's fan-out). Kernel-republished echoes (`dispatched: true`
    // from one of THIS kernel's traits) are skipped: the kernel's own
    // in-run `collectListenerTargets` fan-out already delivered those.
    const listenRoutesByKey = new Map<string, ListenRoute[]>();
    for (const binding of traitBindings) {
      const listenerName = binding.trait.name;
      const ownOrbital = traitIndex.byName.get(listenerName)?.orbitalName;
      if (ownOrbital === undefined) continue;
      for (const listen of binding.trait.listens ?? []) {
        const src = listen.source;
        if (src === undefined || src.kind === 'any') continue;
        const sourceOrbital = (src.kind === 'orbital' ? src.orbital : undefined) ?? ownOrbital;
        const sourceKey = `UI:${sourceOrbital}.${src.trait}.${listen.event}`;
        const route: ListenRoute = {
          listenerTrait: listenerName,
          triggers: listen.triggers,
          payloadMapping: listen.payloadMapping,
        };
        const routes = listenRoutesByKey.get(sourceKey);
        if (routes) routes.push(route);
        else listenRoutesByKey.set(sourceKey, [route]);
      }
    }
    for (const [sourceKey, routes] of listenRoutesByKey) {
      const unsub = eventBus.on(sourceKey, (event) => {
        if (deliveredHere(event.source)) return;
        for (const route of routes) {
          log.debug('listen-source:fire', { key: sourceKey, listener: route.listenerTrait, triggers: route.triggers });
          dispatch(
            route.listenerTrait,
            route.triggers,
            applyListenPayloadMapping(route.payloadMapping, event.payload, evaluateListenPayloadExpr),
            event.source?.tick,
          );
        }
      });
      unsubscribes.push(unsub);
    }

    return () => {
      for (const unsub of unsubscribes) unsub();
    };
  }, [traitBindings, traitIndex, settle, eventBus]);
}
