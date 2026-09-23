/**
 * circuitEffectRunner — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * Two circuit behaviors run OUTSIDE the client-role composition
 * (`dispatchWithServerLeg`/`evaluateOrbitalEvent`) because that composition
 * is EVENT-shaped only — it has no entry point for "run this SExpr[] against
 * the trait's CURRENT state with no event" (ticks, LOLO §1 "one loop
 * primitive") or "run this transition's effects under an extra
 * `@callsitePayload` binding root" (an `@trait.X`-embedded child re-run,
 * `docs/Almadar_LOLO.md`'s callsite capture). Both need the SAME lower-level
 * primitives the composition itself is built on (`EffectExecutor` +
 * `createClientEffectHandlers`) — reusing them here (never re-deriving the
 * composition's own cross-trait/dispatch-mode/leg-posting machinery) is a
 * narrow, single-trait, single-effect-list run, not a parallel composition.
 *
 * Both hooks that need this (`useClientTicks`, `useCallsiteCapture`) share
 * ONE implementation so the `EffectExecutor` construction (bindings, client
 * handlers, slot capture) lives in exactly one place.
 *
 * @packageDocumentation
 */
import { createLogger } from '@almadar/logger';
import type {
  EntityRow,
  EventPayload,
  OrbitalId,
  PatternConfig,
  ResolvedPatternProps,
  SExpr,
  TraitConfig,
  TraitId,
  UserContext,
  BusEventSource,
} from '@almadar/core';
import {
  EffectExecutor,
  createClientEffectHandlers,
  type BindingContext,
  type CircuitStore,
  type EffectContext,
} from '@almadar/runtime';
import type { EventBusContextType } from '../types/event-bus-types';

const log = createLogger('almadar:ui:circuit:effect-runner');

export interface RunCircuitEffectsParams {
  store: CircuitStore;
  eventBus: EventBusContextType;
  traitName: string;
  frameKey: string;
  effects: SExpr[];
  state: string;
  transitionLabel: string;
  payload?: EventPayload;
  /** `@callsitePayload.<field>` — the composing effect's triggering payload
   *  for an `@trait.X`-embedded child re-run (`useCallsiteCapture`). */
  callsitePayload?: EventPayload;
  config?: TraitConfig;
  user?: UserContext;
  orbitalName?: string;
  orbitalId?: OrbitalId;
  traitId?: TraitId;
  emits?: EffectContext['emits'];
  navigate?: (path: string, params?: Record<string, string>, crumb?: string) => void;
  navigateBack?: () => void;
  /** Tick name — stamped onto every emit this run produces (source.tick),
   *  the SAME identity `EffectExecutor.sourceStamp` carries for the event
   *  path, so `useBusIngress` can recognize a tick-originated emit and
   *  dispatch it through the kernel WITH the tick coalescing stamp. */
  tickName?: string;
  onPattern: (slot: string, pattern: PatternConfig | null, props?: ResolvedPatternProps, priority?: number) => void;
}

export interface RunCircuitEffectsResult {
  emitted: string[];
  didWrite: boolean;
}

/**
 * Run one trait's effect list directly against `store.frames.get(frameKey)`
 * — the SAME live-frame object the client-role composition's own
 * `createClientEffectRunner` writes through (`@almadar/runtime`'s
 * `client-role.ts`), reproduced here for the two circuit behaviors the
 * composition doesn't cover. `(set @entity.X)` mutates the frame in place;
 * the caller (a tick's own scheduler tick, or `useCallsiteCapture`'s
 * lifecycle re-run) decides when to call `store.notify()` afterwards.
 */
export async function runCircuitEffects(params: RunCircuitEffectsParams): Promise<RunCircuitEffectsResult> {
  const { store, eventBus, traitName, frameKey, effects, payload, callsitePayload, config, user, tickName } = params;
  if (effects.length === 0) return { emitted: [], didWrite: false };

  let frame = store.frames.get(frameKey);
  if (frame === undefined) {
    frame = {} as EntityRow;
    store.frames.set(frameKey, frame);
  }

  const emitted: string[] = [];
  let didWrite = false;

  const handlers = createClientEffectHandlers({
    eventBus: {
      emit: (type: string, emitPayload?: EventPayload, source?: BusEventSource) => {
        const event = type.startsWith('UI:') ? type.slice(3) : type;
        emitted.push(event);
        eventBus.emit(type, emitPayload, tickName !== undefined ? { ...source, tick: tickName } as BusEventSource : source);
      },
    },
    slotSetter: {
      addPattern: (slot: string, pattern: PatternConfig | null, props?: ResolvedPatternProps, priority?: number) =>
        params.onPattern(slot, pattern, props, priority),
      clearSlot: (slot: string) => params.onPattern(slot, null),
    },
    navigate: params.navigate,
    navigateBack: params.navigateBack,
    liveEntity: frame,
    // Ticks and callsite re-runs never carry a persistence adapter — the
    // same bridge-mode placeholder the composition's client env delegates
    // to a leg; here there is no leg to delegate to, so the write is a
    // documented no-op (persist/call-service were never reachable from a
    // tick's SYNC_TICK_OPERATORS filter or a lifecycle re-run's effects).
    persistDelegated: true,
    callServiceDelegated: true,
    orbitalName: params.orbitalName,
  });

  const baseSet = handlers.set;
  const tracked = {
    ...handlers,
    set: async (targetId: string, field: string, value: Parameters<typeof baseSet>[2]) => {
      if (baseSet) await baseSet(targetId, field, value);
      didWrite = true;
    },
  };

  const bindingCtx: BindingContext = {
    entity: frame,
    payload: payload ?? {},
    state: params.state,
    ...(user !== undefined ? { user } : {}),
    ...(config !== undefined ? { config } : {}),
    ...(callsitePayload !== undefined ? { callsitePayload } : {}),
  };

  const effectContext: EffectContext = {
    traitName,
    ...(params.orbitalName !== undefined ? { orbitalName: params.orbitalName } : {}),
    ...(params.traitId !== undefined ? { traitId: params.traitId } : {}),
    ...(params.orbitalId !== undefined ? { orbitalId: params.orbitalId } : {}),
    ...(params.emits !== undefined ? { emits: params.emits } : {}),
    state: params.state,
    transition: params.transitionLabel,
  };

  const executor = new EffectExecutor({ handlers: tracked, bindings: bindingCtx, context: effectContext, deferRenderBindings: true });
  try {
    await executor.executeAll(effects);
  } catch (error) {
    log.error('effects:error', {
      traitName,
      transition: params.transitionLabel,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return { emitted, didWrite };
}
