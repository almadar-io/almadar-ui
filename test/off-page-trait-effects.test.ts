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
