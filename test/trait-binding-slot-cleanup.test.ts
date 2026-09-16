// @vitest-environment jsdom
/**
 * Regression coverage for the "two whole-orbital-imported pages stack their
 * full AppLayout in the same slot" bug (verified 2026-09-16 on project-friday
 * navigating Sprint -> Project -> Timesheets).
 *
 * `useTraitStateMachine`'s trait-bindings-changed effect (page navigation)
 * now diffs the previous render's active trait names against the new ones
 * and clears every dropped trait's slot contribution via `clearBySource`
 * before re-initializing — see `diffDroppedTraitNames` and the effect at
 * `hooks/useTraitStateMachine.ts` (the `[traitBindings]` `useEffect`).
 *
 * No React harness exists for mounting `useTraitStateMachine` itself (see
 * `sharedEntityWriterTraits.test.ts`'s header note — same limitation, same
 * shape of workaround: exercise the exported pure diff function directly,
 * and separately prove the real `useUISlotManager` mechanism the effect
 * relies on — `clearBySource` correctly un-stacking a multi-source slot —
 * against a REAL slot manager instance, `multi-source-slot-scope.test.ts`-style).
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { diffDroppedTraitNames } from '../hooks/useTraitStateMachine';
import { useUISlotManager, ALL_SLOTS } from '../hooks/useUISlots';

describe('diffDroppedTraitNames — pure trait-set diff', () => {
  it('names a trait present in prev but absent from next', () => {
    const dropped = diffDroppedTraitNames(
      new Set(['SprintOrbitalSprintAppLayout']),
      new Set(['ProjectOrbitalProjectAppLayout']),
    );
    expect(dropped).toEqual(['SprintOrbitalSprintAppLayout']);
  });

  it('names nothing when every previously-active trait is still active', () => {
    const dropped = diffDroppedTraitNames(
      new Set(['TraitA', 'TraitB']),
      new Set(['TraitA', 'TraitB', 'TraitC']),
    );
    expect(dropped).toEqual([]);
  });

  it('names every trait on the very first render (prev empty)', () => {
    expect(diffDroppedTraitNames(new Set(), new Set(['TraitA']))).toEqual([]);
  });

  it('names multiple dropped traits, in prev-set iteration order', () => {
    const dropped = diffDroppedTraitNames(
      new Set(['TaskOrbitalTaskAppLayout', 'TaskOrbitalTaskBoard']),
      new Set(['ProjectOrbitalProjectAppLayout']),
    );
    expect(dropped).toEqual(['TaskOrbitalTaskAppLayout', 'TaskOrbitalTaskBoard']);
  });
});

describe('clearBySource on a real UISlotManager — un-stacking a dropped trait', () => {
  it('a two-source stack collapses back to the remaining single source once the other is cleared', () => {
    const { result } = renderHook(() => useUISlotManager());

    act(() => {
      result.current.render({ target: 'main', pattern: 'app-layout', sourceTrait: 'SprintOrbitalSprintAppLayout' });
      result.current.render({ target: 'main', pattern: 'app-layout', sourceTrait: 'ProjectOrbitalProjectAppLayout' });
    });
    // Both traits legitimately active at once (e.g. mid-navigation) stack —
    // this is the exact shape the bug's live DOM capture showed
    // (`slot-content-stack-SprintOrbitalSprintAppLayout-ProjectOrbitalProjectAppLayout`).
    expect(result.current.slots['main']?.pattern).toBe('stack');

    act(() => {
      // What the fix's cleanup effect does for every dropped trait, across
      // every slot (`clearBySource` is a documented no-op for a slot the
      // trait never wrote to, so iterating ALL_SLOTS is safe — exercised
      // here too, not just the one slot that actually had content).
      for (const slot of ALL_SLOTS) {
        result.current.clearBySource(slot, 'SprintOrbitalSprintAppLayout');
      }
    });

    // No more stack — the remaining page's own AppLayout is the whole slot.
    const content = result.current.slots['main'];
    expect(content?.pattern).toBe('app-layout');
    expect(content?.sourceTrait).toBe('ProjectOrbitalProjectAppLayout');
  });

  it('clearing the trait that is the ONLY source empties the slot entirely', () => {
    const { result } = renderHook(() => useUISlotManager());

    act(() => {
      result.current.render({ target: 'main', pattern: 'app-layout', sourceTrait: 'TimesheetOrbitalTimesheetAppLayout' });
    });
    expect(result.current.slots['main']).not.toBeNull();

    act(() => {
      for (const slot of ALL_SLOTS) {
        result.current.clearBySource(slot, 'TimesheetOrbitalTimesheetAppLayout');
      }
    });

    expect(result.current.slots['main']).toBeNull();
  });
});
