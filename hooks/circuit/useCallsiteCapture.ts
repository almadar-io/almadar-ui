/**
 * useCallsiteCapture — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * Re-run an `@trait.X`-embedded child's lifecycle transition
 * (INIT/LOAD/$MOUNT) under the composing effect's `callsitePayload`, so its
 * `@callsitePayload.<field>` captures reflect the parent transition that
 * just composed it instead of staying frozen at the child's own mount-time
 * INIT (today's `reRenderCallsiteCaptureChildren`).
 *
 * The client-role composition (`dispatchWithServerLeg`) has no entry point
 * for "run this transition under an extra binding root" — `OrbitalEventRequest`
 * carries no `callsitePayload` field, so this stays on the lower-level
 * primitives (`StateMachineManager.sendEvent` for the transition lookup +
 * commit, `runCircuitEffects` for the effect run) the composition itself is
 * built on, same as `useClientTicks`.
 *
 * @packageDocumentation
 */
import { useCallback } from 'react';
import type { EventPayload, EntityRow, PatternConfig, ResolvedPatternProps, ResolvedTraitBinding, UserContext } from '@almadar/core';
import { LIFECYCLE_EVENTS, type CircuitStore, type TraitIndex } from '@almadar/runtime';
import { createLogger } from '@almadar/logger';
import { runCircuitEffects } from '../../lib/circuitEffectRunner';
import type { EventBusContextType } from '../../types/event-bus-types';
import type { SlotFlushHandle } from './useSlotFlush';

const log = createLogger('almadar:ui:circuit:callsite-capture');

export interface UseCallsiteCaptureOptions {
  callsiteCaptureChildrenByTrait?: ReadonlyMap<string, ReadonlySet<string>>;
  eventBus: EventBusContextType;
  navigate?: (path: string, params?: Record<string, string>, crumb?: string) => void;
  navigateBack?: () => void;
  user?: UserContext;
}

export type ReRenderCallsiteCaptureChildren = (
  traitName: string,
  callsitePayload: EventPayload,
  entityByTrait: Record<string, EntityRow>,
  visited?: Set<string>,
) => Promise<void>;

export function useCallsiteCapture(
  traitBindings: readonly ResolvedTraitBinding[],
  store: CircuitStore,
  traitIndex: TraitIndex,
  slotFlush: SlotFlushHandle,
  options: UseCallsiteCaptureOptions,
): ReRenderCallsiteCaptureChildren {
  return useCallback(async function reRender(
    traitName: string,
    callsitePayload: EventPayload,
    entityByTrait: Record<string, EntityRow>,
    visited: Set<string> = new Set(),
  ): Promise<void> {
    const children = options.callsiteCaptureChildrenByTrait?.get(traitName);
    if (!children || children.size === 0) return;
    const bindingMap = new Map(traitBindings.map((b) => [b.trait.name, b]));

    for (const childName of children) {
      if (visited.has(childName)) continue;
      visited.add(childName);
      const childBinding = bindingMap.get(childName);
      if (!childBinding) continue;

      const lifecycleEvent = LIFECYCLE_EVENTS.find((evt: string) => store.manager.canHandleEvent(childName, evt));
      if (lifecycleEvent === undefined) continue;

      const [entry] = store.manager.sendEvent(lifecycleEvent, {}, undefined, entityByTrait, undefined, childName);
      if (!entry || !entry.result.executed) continue;

      const indexed = traitIndex.byName.get(childName);
      const frameKey = indexed?.frameKey ?? childName;
      log.debug('rerender', { referrer: traitName, child: childName, lifecycleEvent });

      const pendingSlots = new Map<string, Array<{ pattern: PatternConfig; props?: ResolvedPatternProps }>>();
      await runCircuitEffects({
        store,
        eventBus: options.eventBus,
        traitName: childName,
        frameKey,
        effects: entry.result.effects,
        state: entry.result.previousState,
        transitionLabel: `${entry.result.previousState}->${entry.result.newState}`,
        payload: {},
        callsitePayload,
        config: indexed?.config,
        user: options.user,
        orbitalName: indexed?.orbitalName,
        orbitalId: indexed?.orbitalId,
        traitId: indexed?.irTrait.id,
        emits: indexed?.irTrait.emits,
        navigate: options.navigate,
        navigateBack: options.navigateBack,
        onPattern: (slot, pattern, props) => {
          // `clearSlot` (a `render-ui slot null` effect) resets this slot's
          // entries to empty — `flushSlot`'s own empty-array contract clears
          // it — rather than appending a null-pattern entry.
          if (pattern === null) {
            pendingSlots.set(slot, []);
            return;
          }
          const existing = pendingSlots.get(slot) ?? [];
          existing.push({ pattern, props });
          pendingSlots.set(slot, existing);
        },
      });
      store.notify();
      for (const [slot, patterns] of pendingSlots) {
        slotFlush.flushSlot(
          childName,
          slot,
          patterns as Parameters<SlotFlushHandle['flushSlot']>[2],
          { event: lifecycleEvent, state: entry.result.previousState, entity: childBinding.linkedEntity },
        );
      }

      await reRender(childName, callsitePayload, entityByTrait, visited);
    }
  }, [traitBindings, store, traitIndex, slotFlush, options.callsiteCaptureChildrenByTrait, options.eventBus, options.navigate, options.navigateBack, options.user]);
}
