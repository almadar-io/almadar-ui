/**
 * Retargeted from `applyServerEffects`/`collectServerActiveTraits` (deleted
 * with `OrbPreview.tsx`'s old dual round-trip — W5b,
 * `docs/Almadar_Runtime_Stateless_Stateful_PLAN.md` §5.1).
 *
 * The off-page render filter (Gap #11: "an orbital bundling several page
 * composers returns render-ui effects for traits not mounted on the active
 * page") is now `useSlotFlush.applyClientEffects`'s job — see that hook's
 * `activeTraits` parameter.
 *
 * `collectServerActiveTraits`'s job — scoping which traits the SERVER
 * EXECUTES via a `payload._activeTraits` sidecar on an untargeted/broadcast
 * dispatch — has no surviving call site: every dispatch the client role
 * makes (`dispatchWithServerLeg`) is `targetTrait`-scoped to exactly one
 * seed trait (plan §4.2 P4), including the mount-time lifecycle dispatch
 * (`useTraitStateMachine` fires each trait's own INIT/LOAD/$MOUNT
 * individually now, not as one broadcast). A page leaking another page's
 * composer requires an untargeted dispatch to exist in the first place,
 * which the new architecture never produces — the invariant is now
 * structural rather than a runtime filter, so there is nothing left here to
 * unit-test as a standalone function.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSlotFlush } from '../hooks/circuit/useSlotFlush';
import type { UISlotManager } from '../hooks/useUISlots';
import type { ClientEffectTuple } from '@almadar/core';

function stubSlots(): UISlotManager & { render: ReturnType<typeof vi.fn>; updateTraitContent: ReturnType<typeof vi.fn> } {
  return {
    slots: {},
    render: vi.fn(() => 'id'),
    clear: vi.fn(),
    clearBySource: vi.fn(),
    clearById: vi.fn(),
    clearAll: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    hasContent: vi.fn(() => false),
    getContent: vi.fn(() => null),
    getTraitContent: vi.fn(() => null),
    subscribeTrait: vi.fn(() => () => undefined),
    updateTraitContent: vi.fn(() => 'id'),
  };
}

const renderEffect = (traitName: string): { traitName: string; effect: ClientEffectTuple } => ({
  traitName,
  effect: ['render-ui', 'main', { type: 'box' }],
});

describe('useSlotFlush.applyClientEffects — off-page trait filter', () => {
  it('drops render-ui effects from traits not mounted on the active page', () => {
    const slots = stubSlots();
    const { result } = renderHook(() => useSlotFlush(slots, undefined));
    result.current.applyClientEffects(
      [],
      [renderEffect('OnPageComposer'), renderEffect('OffPageComposer')],
      undefined,
      undefined,
      new Set(['OnPageComposer']),
    );
    expect(slots.render).toHaveBeenCalledTimes(1);
    expect(slots.render.mock.calls[0][0].sourceTrait).toBe('OnPageComposer');
  });

  it('keeps every effect when no active set is given', () => {
    const slots = stubSlots();
    const { result } = renderHook(() => useSlotFlush(slots, undefined));
    result.current.applyClientEffects(
      [],
      [renderEffect('Anything'), renderEffect('AnythingElse')],
    );
    expect(slots.render).toHaveBeenCalledTimes(2);
  });

  it('still routes on-page embedded traits to the sidecar, not the slot', () => {
    const slots = stubSlots();
    const { result } = renderHook(() => useSlotFlush(slots, new Set(['EmbeddedAtom'])));
    result.current.applyClientEffects(
      [],
      [renderEffect('EmbeddedAtom')],
      undefined,
      undefined,
      new Set(['HostLayout', 'EmbeddedAtom']),
    );
    expect(slots.render).not.toHaveBeenCalled();
    expect(slots.updateTraitContent).toHaveBeenCalledTimes(1);
    expect(slots.updateTraitContent.mock.calls[0][0]).toBe('EmbeddedAtom');
  });
});
