import { describe, it, expect, vi } from 'vitest';
import { applyServerEffects } from '../runtime/OrbPreview';
import type { UISlotManager } from '../hooks/useUISlots';
import type { ServerClientEffect } from '../providers/ServerBridge';

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

const renderEffect = (traitName: string | undefined): ServerClientEffect => ({
  type: 'render-ui',
  slot: 'main',
  pattern: { type: 'box' } as ServerClientEffect['pattern'],
  traitName,
});

describe('applyServerEffects off-page trait filter', () => {
  it('drops render-ui effects from traits not mounted on the active page', () => {
    const slots = stubSlots();
    applyServerEffects(
      [renderEffect('OnPageComposer'), renderEffect('OffPageComposer')],
      slots,
      undefined,
      undefined,
      new Set(['OnPageComposer']),
    );
    expect(slots.render).toHaveBeenCalledTimes(1);
    expect(slots.render.mock.calls[0][0].sourceTrait).toBe('OnPageComposer');
  });

  it('keeps untagged (legacy) effects and all effects when no active set is given', () => {
    const slots = stubSlots();
    applyServerEffects(
      [renderEffect(undefined), renderEffect('Anything')],
      slots,
    );
    expect(slots.render).toHaveBeenCalledTimes(2);
  });

  it('still routes on-page embedded traits to the sidecar, not the slot', () => {
    const slots = stubSlots();
    applyServerEffects(
      [renderEffect('EmbeddedAtom')],
      slots,
      undefined,
      new Set(['EmbeddedAtom']),
      new Set(['HostLayout', 'EmbeddedAtom']),
    );
    expect(slots.render).not.toHaveBeenCalled();
    expect(slots.updateTraitContent).toHaveBeenCalledTimes(1);
    expect(slots.updateTraitContent.mock.calls[0][0]).toBe('EmbeddedAtom');
  });
});

// ============================================================================
// collectServerActiveTraits — the upstream twin of the render filter above.
// The set rides the bridge as `payload._activeTraits` so the server EXECUTES
// only page-relevant traits: mounted closure + pageless lifecycle traits
// (persistors/audit), excluding traits bound to OTHER pages (Gap #11).
// ============================================================================

import { collectServerActiveTraits } from '../runtime/OrbPreview';
import type { ResolvedTrait, ResolvedTraitBinding } from '@almadar/core';

function trait(name: string, embeds: string[] = []): ResolvedTrait {
  return {
    name,
    source: 'schema',
    states: [],
    events: [],
    transitions: embeds.length
      ? [{
          from: 'idle',
          to: 'idle',
          event: 'INIT',
          effects: [['render-ui', 'main', { type: 'stack', children: embeds.map((e) => `@trait.${e}`) }]],
        }]
      : [],
    guards: [],
    ticks: [],
    listens: [],
    dataEntities: [],
  };
}

function binding(t: ResolvedTrait): ResolvedTraitBinding {
  return { trait: t };
}

describe('collectServerActiveTraits page-scoped execution set', () => {
  const home = trait('HomeComposer', ['EmbeddedGrid']);
  const learn = trait('LearnComposer');
  const embedded = trait('EmbeddedGrid');
  const persistor = trait('RecordPersistor');
  const allTraits = new Map<string, ResolvedTrait>(
    [home, learn, embedded, persistor].map((t) => [t.name, t]),
  );
  const twoPages = {
    pages: new Map([
      ['/', { traits: [binding(home)] }],
      ['/learn', { traits: [binding(learn)] }],
    ]),
  };

  it('includes the mounted closure and pageless lifecycle traits, excludes other pages', () => {
    const active = collectServerActiveTraits(
      twoPages,
      allTraits,
      new Set(['HomeComposer', 'EmbeddedGrid']),
    );
    expect(active).toBeDefined();
    expect(active!.has('HomeComposer')).toBe(true);
    expect(active!.has('EmbeddedGrid')).toBe(true);
    expect(active!.has('RecordPersistor')).toBe(true);
    expect(active!.has('LearnComposer')).toBe(false);
  });

  it('treats a trait embedded by another page as page-bound, not pageless', () => {
    const learnWithEmbed = trait('LearnComposer', ['LearnOnlyChild']);
    const learnChild = trait('LearnOnlyChild');
    const all = new Map<string, ResolvedTrait>(
      [home, learnWithEmbed, embedded, learnChild, persistor].map((t) => [t.name, t]),
    );
    const active = collectServerActiveTraits(
      {
        pages: new Map([
          ['/', { traits: [binding(home)] }],
          ['/learn', { traits: [binding(learnWithEmbed)] }],
        ]),
      },
      all,
      new Set(['HomeComposer', 'EmbeddedGrid']),
    );
    expect(active!.has('LearnOnlyChild')).toBe(false);
    expect(active!.has('RecordPersistor')).toBe(true);
  });

  it('returns undefined (no scoping) for single-page schemas and missing IR', () => {
    expect(
      collectServerActiveTraits(
        { pages: new Map([['/', { traits: [binding(home)] }]]) },
        allTraits,
        new Set(['HomeComposer']),
      ),
    ).toBeUndefined();
    expect(collectServerActiveTraits(null, allTraits, new Set())).toBeUndefined();
  });
});
