/**
 * useSlotFlush — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * Kernel-outcome client effects → UI slots, including a bare `@trait.X`
 * string payload (G-RUNTIME-025) and `navigate`/`navigate-back`. Replaces
 * the old hook's inline `flushSlot` AND `OrbPreview`'s two copy-pasted
 * effect-tuple walkers (`applyServerEffects`'s local-path duplicate) — one
 * owner for "how does a `ClientEffectTuple` become a slot write."
 *
 * Two entry points:
 * - `flushSlot` — a GROUPED per-(trait, slot) pattern list, for a caller
 *   that already has one (`useClientTicks`, `useCallsiteCapture`, and the
 *   composer's own per-dispatch flush of `ClientKernelOutcome.response`).
 * - `applyClientEffects` — a FLAT `ClientEffectTuple[]` (optionally
 *   per-trait via `clientEffectsByTrait`), the shape `OrbitalEventResponse`
 *   itself carries; used directly for every kernel dispatch outcome.
 *
 * @packageDocumentation
 */
import { useCallback, useMemo, useRef } from 'react';
import type { ClientEffectByTrait, ClientEffectTuple, EventPayload, PatternNode } from '@almadar/core';
import { isNotificationSlot } from '../../lib/slot-definitions';
import { createLogger } from '@almadar/logger';
import { convertFnFormLambdasInProps } from '../../lib/fn-form-lambda';
import type { SlotPatternEntry, SlotSource } from '../../types/slot-types';
import type { useUISlots, SlotProps } from '../../providers/UISlotContext';

const flushLog = createLogger('almadar:ui:circuit:slot-flush');

export interface FlushSlotSource {
  event?: string;
  state?: string;
  entity?: string;
}

export interface SlotFlushHandle {
  flushSlot: (traitName: string, slot: string, patterns: SlotPatternEntry[], source?: FlushSlotSource) => void;
  applyClientEffects: (
    clientEffects: readonly ClientEffectTuple[],
    clientEffectsByTrait: ReadonlyArray<ClientEffectByTrait> | undefined,
    onNavigate?: (path: string, params?: Record<string, string>, crumb?: string) => void,
    onNavigateBack?: () => void,
    activeTraits?: ReadonlySet<string>,
  ) => void;
}

function unwrapPattern(record: PatternNode | string | null): { bareTraitRef?: string; props?: SlotProps; patternType?: string } {
  if (typeof record === 'string') return { bareTraitRef: record };
  if (record === null) return {};
  const { type, children, ...inlineProps } = record as PatternNode;
  const props = { ...(inlineProps as SlotProps), ...(children !== undefined ? { children } : {}) };
  return { patternType: type as string | undefined, props };
}

export function useSlotFlush(
  uiSlots: ReturnType<typeof useUISlots>,
  embeddedTraits: ReadonlySet<string> | undefined,
): SlotFlushHandle {
  const uiSlotsRef = useRef(uiSlots);
  uiSlotsRef.current = uiSlots;
  const embeddedTraitsRef = useRef(embeddedTraits);
  embeddedTraitsRef.current = embeddedTraits;

  const flushSlot = useCallback((
    traitName: string,
    slot: string,
    patterns: SlotPatternEntry[],
    source?: FlushSlotSource,
  ): void => {
    const slots = uiSlotsRef.current;
    const embedded = embeddedTraitsRef.current;
    if (patterns.length === 0) {
      flushLog.debug('clear', { traitName, slot });
      slots.clearBySource(slot as Parameters<typeof slots.clearBySource>[0], traitName);
      return;
    }
    const last = patterns[patterns.length - 1];
    const { bareTraitRef, patternType, props: unwrapped } = unwrapPattern(last.pattern as PatternNode | string | null);
    const rawProps: SlotProps | string = bareTraitRef !== undefined
      ? bareTraitRef
      : { ...(unwrapped ?? {}), ...(last.props as SlotProps) };
    const props = convertFnFormLambdasInProps(rawProps);
    // An embedded trait's frame holds its inline renders; a portal slot
    // (toast, modal, drawer, …) renders in that slot like any trait's.
    const isEmbedded = (embedded?.has(traitName) ?? false) && !isNotificationSlot(slot);
    if (isEmbedded) {
      slots.updateTraitContent(traitName, {
        pattern: patternType as string,
        props,
        slot,
        priority: 0,
        animation: 'fade',
        transitionEvent: source?.event,
        fromState: source?.state,
        entity: source?.entity,
      });
      return;
    }
    slots.render({
      target: slot as Parameters<typeof slots.render>[0]['target'],
      pattern: patternType as string,
      props,
      sourceTrait: traitName,
      transitionEvent: source?.event,
      fromState: source?.state,
      entity: source?.entity,
    });
  }, []);

  const applyClientEffects = useCallback((
    clientEffects: readonly ClientEffectTuple[],
    clientEffectsByTrait: ReadonlyArray<ClientEffectByTrait> | undefined,
    onNavigate?: (path: string, params?: Record<string, string>, crumb?: string) => void,
    onNavigateBack?: () => void,
    /**
     * Traits mounted on THIS page (`useCircuitKernel`'s restricted
     * `TraitIndex`). `applyOrbitalEventResponse`'s fold returns
     * `clientEffects`/`clientEffectsByTrait` verbatim off the server's
     * response with no page filter of its own (a REAL multi-page stateful
     * server initializes every trait it holds, not just this page's) — this
     * is the client-side half of that scoping (Gap #11's "orbital-granular
     * over-execution": drop an off-page trait's render effect for parity
     * with the local path, which never mounted it). A tagged effect with no
     * `activeTraits` given (or no `traitName`) is never filtered.
     */
    activeTraits?: ReadonlySet<string>,
  ): void => {
    const slots = uiSlotsRef.current;
    const embedded = embeddedTraitsRef.current;
    const tuples: Array<Partial<ClientEffectByTrait> & { effect: ClientEffectTuple }> = clientEffectsByTrait
      ? [...clientEffectsByTrait]
      : clientEffects.map((effect) => ({ effect }));

    for (const { effect, traitName, event, fromState } of tuples) {
      if (traitName !== undefined && activeTraits !== undefined && !activeTraits.has(traitName)) continue;
      const kind = effect[0];
      if (kind === 'render-ui') {
        const [, slot, pattern, rawProps] = effect;
        const sourceTrait = traitName ?? 'kernel';
        const { bareTraitRef, patternType, props: unwrapped } = unwrapPattern(pattern as PatternNode | null);
        const isEmbedded = (embedded?.has(sourceTrait) ?? false) && !isNotificationSlot(slot);
        const propsValue: SlotProps | string = bareTraitRef !== undefined
          ? bareTraitRef
          : { ...(unwrapped ?? {}), ...(rawProps as SlotProps | undefined) };
        const props = convertFnFormLambdasInProps(propsValue);
        if (pattern === null) {
          slots.clearBySource(slot as Parameters<typeof slots.clearBySource>[0], sourceTrait);
        } else if (isEmbedded) {
          slots.updateTraitContent(sourceTrait, { pattern: patternType as string, props, slot, priority: 0, animation: 'fade', transitionEvent: event, fromState });
        } else {
          slots.render({ target: slot as Parameters<typeof slots.render>[0]['target'], pattern: patternType as string, props, sourceTrait, transitionEvent: event, fromState });
        }
      } else if (kind === 'navigate') {
        const [, route, params, options] = effect;
        onNavigate?.(route, params as Record<string, string> | undefined, (options as { crumb?: string } | undefined)?.crumb);
      } else if (kind === 'navigate-back') {
        onNavigateBack?.();
      }
    }
  }, []);

  // The handle object must be identity-stable: `useTraitStateMachine`'s
  // dispatchAndSettle deps on it, and the mount-lifecycle INIT effect deps on
  // dispatchAndSettle — a fresh object per render refires INIT forever
  // (INIT → fetch → notify → re-render → refire storm, verified live
  // 2026-09-23 via init:lifecycle-storm instrumentation).
  return useMemo(() => ({ flushSlot, applyClientEffects }), [flushSlot, applyClientEffects]);
}

export type { SlotSource, EventPayload };
