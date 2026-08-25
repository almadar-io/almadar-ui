/**
 * resolveRenderBindingMarkers — render-time evaluation of `$renderBinding`
 * prop leaves against the source trait's live bindings. Pins:
 * - markers resolve to the current entity values (the live-update half of
 *   the eager-flush-eval fix),
 * - identity preservation: no markers → the ORIGINAL props reference is
 *   returned (Form's normalizedInitialData contract),
 * - foreign `_sourceTrait` subtrees (multi-source slot stacks) stay raw so
 *   the child's own renderer resolves them against ITS trait,
 * - markers in array position that evaluate to arrays splice flat
 *   (`array/map` children expressions).
 */
import { describe, it, expect } from 'vitest';
import { RENDER_BINDING_MARKER, type RenderBindingMarker } from '@almadar/core';
import { resolveRenderBindingMarkers } from '../lib/resolve-render-bindings';
import type { SlotProps, SlotPropValue } from '../providers/UISlotContext';

const marker = (expression: RenderBindingMarker['expression']): RenderBindingMarker => ({
  [RENDER_BINDING_MARKER]: true,
  expression,
});

describe('resolveRenderBindingMarkers', () => {
  it('resolves pure and embedded entity bindings against the live row', () => {
    const props: SlotProps = {
      content: marker('HP: @entity.hp / @entity.maxHp'),
      value: marker('@entity.hp'),
    };
    const out = resolveRenderBindingMarkers(props, 'Hero', { hp: 7, maxHp: 12 }, undefined, 'playing');
    expect(out.content).toBe('HP: 7 / 12');
    expect(out.value).toBe(7);
  });

  it('evaluates s-expression markers with config in scope', () => {
    const props: SlotProps = {
      content: marker(['str/concat', 'Round ', '@entity.round', ' of ', '@config.maxRounds']),
    };
    const out = resolveRenderBindingMarkers(
      props,
      'Board',
      { round: 3 },
      { maxRounds: 9 },
      'playing',
    );
    expect(out.content).toBe('Round 3 of 9');
  });

  it('returns the original props reference when no markers are present', () => {
    const props: SlotProps = { content: 'static', items: [1, 2, 3] };
    expect(resolveRenderBindingMarkers(props, 'Hero', { hp: 7 }, undefined, '')).toBe(props);
  });

  it('leaves foreign _sourceTrait subtrees raw for their own renderer', () => {
    const foreign = {
      type: 'typography',
      content: marker('@entity.turn'),
      _sourceTrait: 'SideTurn',
    } as unknown as SlotPropValue;
    const props: SlotProps = { children: [foreign] };
    const out = resolveRenderBindingMarkers(props, '__multi_source_stack__', {}, undefined, '');
    const child = (out.children as readonly Record<string, SlotPropValue>[])[0];
    expect(child.content).toBe(foreign && (foreign as Record<string, SlotPropValue>).content);
  });

  it('resolves same-trait nested children', () => {
    const props: SlotProps = {
      children: [{ type: 'typography', content: marker('@entity.turn') }],
    };
    const out = resolveRenderBindingMarkers(props, 'SideTurn', { turn: 4 }, undefined, '');
    const child = (out.children as readonly Record<string, SlotPropValue>[])[0];
    expect(child.content).toBe(4);
  });

  it('splices markers that evaluate to arrays flat into array position', () => {
    const props: SlotProps = {
      children: [
        { type: 'typography', content: 'head' },
        marker('@entity.entries'),
      ],
    };
    const out = resolveRenderBindingMarkers(
      props,
      'SideChronicle',
      { entries: [{ type: 'typography', content: 'a' }, { type: 'typography', content: 'b' }] },
      undefined,
      '',
    );
    const children = out.children as readonly Record<string, SlotPropValue>[];
    expect(children).toHaveLength(3);
    expect(children[1].content).toBe('a');
    expect(children[2].content).toBe('b');
  });

  it('memoizes per (marker, entity, config, state): repeat inputs preserve the original container identity', () => {
    const m = marker('@entity.hp');
    const props: SlotProps = { value: m, other: 'static' };
    const entity = { hp: 7 };
    const first = resolveRenderBindingMarkers(props, 'Hero', entity, undefined, 'playing');
    expect(first.value).toBe(7);
    expect(first).not.toBe(props);
    // Cache hit reports unchanged, so the walk returns the ORIGINAL props
    // reference — non-entity re-renders keep a stable identity downstream.
    const second = resolveRenderBindingMarkers(props, 'Hero', entity, undefined, 'playing');
    expect(second).toBe(props);
  });

  it('a new entity snapshot re-resolves (cache keyed on snapshot identity)', () => {
    const m = marker('@entity.hp');
    const props: SlotProps = { value: m };
    const first = resolveRenderBindingMarkers(props, 'Hero', { hp: 7 }, undefined, 'playing');
    const second = resolveRenderBindingMarkers(props, 'Hero', { hp: 9 }, undefined, 'playing');
    expect(second.value).toBe(9);
    expect(second).not.toBe(first);
  });

  it('state changes re-resolve even with the same entity snapshot', () => {
    const m = marker('@entity.hp');
    const props: SlotProps = { value: m };
    const entity = { hp: 7 };
    const a = resolveRenderBindingMarkers(props, 'Hero', entity, undefined, 'playing');
    const b = resolveRenderBindingMarkers(props, 'Hero', entity, undefined, 'dead');
    expect(b).not.toBe(props);
    expect(b).not.toBe(a);
  });
});
