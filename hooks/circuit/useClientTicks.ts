/**
 * useClientTicks — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1 G6).
 *
 * Ticks while the client holds circuit state (LOLO §1's "one loop
 * primitive": a tick runs while the trait is in its current state and stops
 * on transition out). The client-role composition has no entry point for
 * "run this SExpr[] with no event" (`dispatchWithServerLeg` always resolves
 * a declared transition) — ticks stay on the lower-level primitives the
 * composition itself is built on (`@almadar/runtime`'s `createTickScheduler`,
 * `runCircuitEffects` — this package's `EffectExecutor` wrapper) instead of
 * routing through `kernel.dispatch`.
 *
 * A `[shared]` entity's WRITER ticks (pure `set`, no `render-ui`) are still
 * pulled out of the per-trait loop and folded through ONE `runTickFrame`
 * driver per (frame, interval) so N writer ticks due on the same pass
 * produce exactly one merged commit, in binding order — `runTickFrame`
 * itself (`@almadar/ui`'s `useSharedEntityStore.ts`) is UNCHANGED; only the
 * backing store is now a thin adapter over `CircuitStore.frames` (keyed by
 * `IndexedTrait.frameKey`, already the SAME `$shared::<entity>` group key a
 * `[shared]` entity's bound traits share — no separate shared-entity store
 * needed anymore). Everything else (non-shared traits, and a `[shared]`
 * entity's render trait) keeps its own per-trait scheduler registration via
 * `runCircuitEffects`.
 *
 * A tick's own `(emit X)` still lands on the REAL event bus exactly as
 * before (stamped with the tick name) — `useBusIngress` picks it up and
 * dispatches through `kernel.dispatch` WITH the tick stamp, so the kernel's
 * own FIFO queue coalesces same-`(event, trait)` tick entries (plan §5.1 G1)
 * instead of a bespoke actor-queue coalescing policy.
 *
 * @packageDocumentation
 */
import { useEffect } from 'react';
import type {
  BusEventSource,
  EntityRow,
  EventPayload,
  FieldValue,
  OrbitalId,
  PatternConfig,
  ResolvedPatternProps,
  ResolvedTrait,
  ResolvedTraitBinding,
  ResolvedTraitTick,
  SExpr,
  TraitConfig,
  TraitConfigValue,
  UserContext,
} from '@almadar/core';
import { walkSExpr } from '@almadar/core';
import {
  collectDeclaredConfigDefaults,
  createContextFromBindings,
  createTickScheduler,
  isSExpression,
  isValidCronExpression,
  normalizeCallSiteConfigToValues,
  parseDurationString,
  type CircuitStore,
  type TraitIndex,
} from '@almadar/runtime';
import { evaluate, evaluateGuard, executeEffects, createMinimalContext } from '@almadar/evaluator';
import { createLogger } from '@almadar/logger';
import { perfTimeAsync } from '../../lib/perf';
import { runTickFrame, type SharedEntityStore, type SharedEntityWriter } from '../useSharedEntityStore';
import { runCircuitEffects } from '../../lib/circuitEffectRunner';
import type { EventBusContextType } from '../../types/event-bus-types';
import type { SlotFlushHandle } from './useSlotFlush';

const tickLog = createLogger('almadar:ui:circuit:tick-effects');

// ============================================================================
// Structural classification — unchanged from the pre-adapter hook
// ============================================================================

export const SHARED_ENTITY_WRITE_OPS: ReadonlySet<string> = new Set(['set']);
export const SHARED_ENTITY_RENDER_OPS: ReadonlySet<string> = new Set(['render-ui', 'render']);

export function collectAllTraitEffects(trait: ResolvedTrait): SExpr[] {
  return [
    ...trait.ticks.flatMap((t) => t.effects),
    ...trait.transitions.flatMap((t) => t.effects),
  ];
}

export function effectsCallOp(effects: SExpr[], ops: ReadonlySet<string>): boolean {
  for (const effect of effects) {
    let found = false;
    walkSExpr(effect, (node) => {
      if (!found && Array.isArray(node) && typeof node[0] === 'string' && ops.has(node[0])) found = true;
    });
    if (found) return true;
  }
  return false;
}

export function classifySharedTick(tick: ResolvedTraitTick): 'writer' | 'renderer' | 'both' | 'neither' {
  const writes = effectsCallOp(tick.effects, SHARED_ENTITY_WRITE_OPS);
  const renders = effectsCallOp(tick.effects, SHARED_ENTITY_RENDER_OPS);
  if (writes && renders) return 'both';
  if (writes) return 'writer';
  if (renders) return 'renderer';
  return 'neither';
}

function containsConfigForward(value: TraitConfigValue): boolean {
  if (typeof value === 'string') return value.startsWith('@config.');
  if (Array.isArray(value)) return value.some(containsConfigForward);
  if (value !== null && typeof value === 'object') return Object.values(value).some(containsConfigForward);
  return false;
}

function getBindingConfig(binding: ResolvedTraitBinding): TraitConfig | undefined {
  return normalizeCallSiteConfigToValues(binding.config);
}

/** Evaluate a shared-entity field default authored as a .lolo S-expression
 *  (e.g. `(array/flatten (array/map ...))`) — the compiled path evaluates
 *  these once before seeding; the client role must do the same so a render
 *  trait reads concrete values at frame 0. */
export function evalFieldDefault(value: FieldValue): FieldValue {
  if (!Array.isArray(value) || !isSExpression(value)) return value;
  return evaluate(value as SExpr, createMinimalContext({}, {}, '')) as FieldValue;
}

/**
 * Build one writer trait's tick into a synchronous `SharedEntityWriter`
 * (`(scratch) => writes[]`), unchanged in behavior from the pre-adapter
 * hook: `@almadar/evaluator`'s `executeEffects` is fully synchronous (unlike
 * `EffectExecutor`), so `runTickFrame` can fold several writer ticks into
 * one merged commit within a single frame.
 */
export function createSharedEntityWriter(
  binding: ResolvedTraitBinding,
  tick: ResolvedTraitTick,
  traitStatesRef: { current: Map<string, { currentState: string }> },
  emit: (event: string, payload?: EventPayload, source?: BusEventSource) => void,
  traitConfigsByName?: Record<string, TraitConfig>,
  orbitalsByTrait?: Record<string, string>,
  orbitalIdsByTrait?: Record<string, OrbitalId>,
): SharedEntityWriter {
  return (scratch) => {
    const traitName = binding.trait.name;
    const currentState = traitStatesRef.current.get(traitName)?.currentState ?? '';
    if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return [];

    const scratchEntity: EntityRow = { ...scratch };
    const writes: Array<{ field: string; value: FieldValue }> = [];
    const ctx = createMinimalContext(scratchEntity, {}, currentState);
    const declaredDefaults = collectDeclaredConfigDefaults(binding.trait);
    const resolvedByName = traitConfigsByName?.[traitName];
    const callSiteRaw = getBindingConfig(binding);
    const callSiteConfig = callSiteRaw
      ? Object.fromEntries(Object.entries(callSiteRaw).filter(([, v]) => !containsConfigForward(v)))
      : undefined;
    if (declaredDefaults || resolvedByName || callSiteConfig) {
      ctx.config = { ...(declaredDefaults ?? {}), ...(resolvedByName ?? {}), ...(callSiteConfig ?? {}) } as TraitConfig;
    }
    ctx.mutateEntity = (changes) => {
      for (const [field, value] of Object.entries(changes)) {
        const fieldValue = value as FieldValue;
        scratchEntity[field] = fieldValue;
        writes.push({ field, value: fieldValue });
      }
    };
    ctx.emit = (event, payload) => {
      emit(event, payload as EventPayload | undefined, {
        orbital: orbitalsByTrait?.[traitName],
        trait: traitName,
        tick: tick.name,
        orbitalId: orbitalIdsByTrait?.[traitName],
        traitId: binding.trait.id,
      });
    };

    if (tick.guard !== undefined && !evaluateGuard(tick.guard, ctx)) {
      tickLog.debug('guard-blocked', { traitName, tick: tick.name, state: currentState });
      return [];
    }
    executeEffects(tick.effects, ctx);
    return writes;
  };
}

export interface UseClientTicksOptions {
  eventBus: EventBusContextType;
  slotFlush: SlotFlushHandle;
  traitConfigsByName?: Record<string, TraitConfig>;
  navigate?: (path: string, params?: Record<string, string>, crumb?: string) => void;
  navigateBack?: () => void;
  user?: UserContext;
}

export function useClientTicks(
  traitBindings: readonly ResolvedTraitBinding[],
  store: CircuitStore,
  traitIndex: TraitIndex,
  options: UseClientTicksOptions,
): void {
  useEffect(() => {
    const scheduler = createTickScheduler();
    const traitStatesRef = { current: store.manager.getAllStates() };
    const refreshStates = (): void => { traitStatesRef.current = store.manager.getAllStates(); };

    const orbitalsByTrait: Record<string, string> = {};
    const orbitalIdsByTrait: Record<string, OrbitalId> = {};
    for (const [name, entry] of traitIndex.byName) {
      orbitalsByTrait[name] = entry.orbitalName;
      if (entry.orbitalId !== undefined) orbitalIdsByTrait[name] = entry.orbitalId;
    }

    const emitFromWriter = (event: string, payload?: EventPayload, source?: BusEventSource): void => {
      const prefixed = event.startsWith('UI:') ? event : `UI:${event}`;
      options.eventBus.emit(prefixed, payload, source);
    };

    // A thin `SharedEntityStore`-shaped adapter over `store.frames` so
    // `runTickFrame` (unchanged) commits through the ONE `CircuitStore`
    // instead of a separate keyed store — `frameKey` already IS the
    // `$shared::<entity>` group key every bound trait shares.
    const frameAdapter: SharedEntityStore = {
      getSnapshot: (frameKey) => store.frames.get(frameKey) ?? {},
      subscribe: (_frameKey, callback) => store.subscribe(callback),
      commit: (frameKey, next) => { store.frames.set(frameKey, next); store.notify(); },
      seed: (frameKey, initial) => { if (!store.frames.has(frameKey)) store.frames.set(frameKey, initial); },
    };

    // Group writer bindings by frameKey (shared entities) for the folded
    // driver; seed each shared frame's declared field defaults at frame 0.
    const writerTicksByFrame = new Map<string, Array<{ binding: ResolvedTraitBinding; tick: ResolvedTraitTick }>>();
    const pureWriterTickKeys = new Set<string>();
    const seededFrames = new Set<string>();
    for (const binding of traitBindings) {
      const entry = traitIndex.byName.get(binding.trait.name);
      if (!entry?.isSharedEntity) continue;
      if (!seededFrames.has(entry.frameKey)) {
        seededFrames.add(entry.frameKey);
        let defaults: EntityRow | undefined;
        for (const field of entry.entity.fields) {
          if (field.name !== undefined && field.default !== undefined && field.default !== null) {
            (defaults ??= {})[field.name] = evalFieldDefault(field.default as FieldValue);
          }
        }
        if (defaults) frameAdapter.seed(entry.frameKey, defaults);
      }
      for (const tick of binding.trait.ticks ?? []) {
        if (classifySharedTick(tick) !== 'writer') continue;
        pureWriterTickKeys.add(`${binding.trait.name}::${tick.name}`);
        const list = writerTicksByFrame.get(entry.frameKey) ?? [];
        list.push({ binding, tick });
        writerTicksByFrame.set(entry.frameKey, list);
      }
    }

    for (const [frameKey, entries] of writerTicksByFrame) {
      const byInterval = new Map<string, typeof entries>();
      for (const item of entries) {
        const key = String(item.tick.interval);
        const list = byInterval.get(key) ?? [];
        list.push(item);
        byInterval.set(key, list);
      }
      for (const group of byInterval.values()) {
        const interval = group[0].tick.interval;
        const onDue = () => perfTimeAsync(`tick:shared:${frameKey}@${String(interval)}`, () => {
          const writers = group.map(({ binding, tick }) =>
            createSharedEntityWriter(binding, tick, traitStatesRef, emitFromWriter, options.traitConfigsByName, orbitalsByTrait, orbitalIdsByTrait),
          );
          runTickFrame(frameKey, writers, frameAdapter);
        });
        if (interval === 'frame') scheduler.add(0, onDue);
        else if (typeof interval === 'number') scheduler.add(interval, onDue);
        else if (isValidCronExpression(interval)) scheduler.addCron(interval, onDue);
        else scheduler.add(parseDurationString(interval), onDue);
      }
    }

    // Everything else: non-shared traits, and a shared entity's own render
    // (or mixed writer+render) ticks — run through the full effect runner
    // so guard + set + render-ui + emit all fire, same as the event path.
    const runNonWriterTick = (binding: ResolvedTraitBinding, tick: ResolvedTraitTick): void => {
      refreshStates();
      const traitName = binding.trait.name;
      const currentState = traitStatesRef.current.get(traitName)?.currentState ?? '';
      if (tick.appliesTo.length > 0 && !tick.appliesTo.includes(currentState)) return;

      const entry = traitIndex.byName.get(traitName);
      const frameKey = entry?.frameKey ?? traitName;

      if (tick.guard !== undefined) {
        const entity = store.frames.get(frameKey) ?? {};
        const guardCtx = {
          entity,
          payload: {},
          state: currentState,
          ...(options.user ? { user: options.user } : {}),
          ...(entry?.config !== undefined ? { config: entry.config } : {}),
        };
        if (!evaluateGuard(tick.guard, createContextFromBindings(guardCtx))) {
          tickLog.debug('guard-blocked', { traitName, tick: tick.name, state: currentState });
          return;
        }
      }

      const pendingSlots = new Map<string, Array<{ pattern: PatternConfig; props?: ResolvedPatternProps }>>();
      void runCircuitEffects({
        store,
        eventBus: options.eventBus,
        traitName,
        frameKey,
        effects: tick.effects,
        state: currentState,
        transitionLabel: `${currentState}->${currentState}`,
        config: entry?.config,
        user: options.user,
        orbitalName: entry?.orbitalName,
        orbitalId: entry?.orbitalId,
        traitId: entry?.irTrait.id,
        emits: entry?.irTrait.emits,
        navigate: options.navigate,
        navigateBack: options.navigateBack,
        tickName: tick.name,
        onPattern: (slot, pattern, props) => {
          if (pattern === null) {
            pendingSlots.set(slot, []);
            return;
          }
          const existing = pendingSlots.get(slot) ?? [];
          existing.push({ pattern, props });
          pendingSlots.set(slot, existing);
        },
      }).then(() => {
        store.notify();
        for (const [slot, patterns] of pendingSlots) {
          options.slotFlush.flushSlot(
            traitName,
            slot,
            patterns as Parameters<SlotFlushHandle['flushSlot']>[2],
            { event: `tick:${tick.name}`, state: currentState, entity: binding.linkedEntity },
          );
        }
      });
    };

    for (const binding of traitBindings) {
      const entry = traitIndex.byName.get(binding.trait.name);
      for (const tick of binding.trait.ticks ?? []) {
        if (entry?.isSharedEntity && pureWriterTickKeys.has(`${binding.trait.name}::${tick.name}`)) continue;
        const key = `tick:${binding.trait.name}::${tick.name}`;
        const onDue = () => perfTimeAsync(key, () => runNonWriterTick(binding, tick));
        if (tick.interval === 'frame') scheduler.add(0, onDue);
        else if (typeof tick.interval === 'number') scheduler.add(tick.interval, onDue);
        else if (isValidCronExpression(tick.interval)) scheduler.addCron(tick.interval, onDue);
        else scheduler.add(parseDurationString(tick.interval), onDue);
      }
    }

    return () => scheduler.stopAll();
  }, [traitBindings, store, traitIndex, options.eventBus, options.slotFlush, options.traitConfigsByName, options.navigate, options.navigateBack, options.user]);
}
