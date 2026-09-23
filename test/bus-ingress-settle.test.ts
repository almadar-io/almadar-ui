import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { OrbitalId, OrbitalSchema, ResolvedTraitBinding } from '@almadar/core';
import { createEmptyResolvedTrait } from '@almadar/core';
import { buildTraitIndex } from '@almadar/runtime';
import { useBusIngress, type BusDispatch } from '../hooks/circuit/useBusIngress';
import { useEventBus } from '../hooks/useEventBus';

function orbitals(): OrbitalSchema['orbitals'] {
  return [{
    name: 'IngressOrbital',
    id: 'orb_ingress' as OrbitalId,
    pages: [],
    entity: { name: 'Item', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
    traits: [{
      name: 'Picker',
      scope: 'instance',
      linkedEntity: 'Item',
      stateMachine: {
        states: [{ name: 'idle', isInitial: true }],
        events: [],
        transitions: [{ from: 'idle', to: 'idle', event: 'PICK', effects: [] }],
      },
    }],
  }];
}

function binding(): ResolvedTraitBinding {
  const trait = createEmptyResolvedTrait('Picker', 'schema');
  trait.transitions = [{ from: 'idle', to: 'idle', event: 'PICK', effects: [] }];
  return { trait, linkedEntity: 'Item' };
}

describe('useBusIngress', () => {
  it('settles a click, skips its own republished emit, accepts a foreign one', () => {
    const settle = vi.fn<BusDispatch>(async () => {});
    const traitIndex = buildTraitIndex(orbitals());
    const bindings = [binding()];
    const { result: bus } = renderHook(() => useEventBus());
    renderHook(() => useBusIngress(bindings, traitIndex, settle, bus.current));

    bus.current.emit('UI:IngressOrbital.Picker.PICK', { id: 'a' });
    expect(settle).toHaveBeenCalledWith('Picker', 'PICK', { id: 'a' }, undefined);

    settle.mockClear();
    bus.current.emit('UI:PICK', { id: 'b' }, { trait: 'Picker', dispatched: true });
    expect(settle).not.toHaveBeenCalled();

    bus.current.emit('UI:PICK', { id: 'c' }, { trait: 'OtherHostTrait', dispatched: true });
    expect(settle).toHaveBeenCalledWith('Picker', 'PICK', { id: 'c' }, undefined);
  });
});
