/**
 * A described trait (`behavior/describe`, folded at build time on a static site) draws exactly
 * like the same trait read from a schema: one mapping to the diagram's trait data.
 */
import { describe, it, expect } from 'vitest';
import type { StateMachine, Trait, TraitDescription } from '@almadar/core';
import { traitLevelFromDescription, traitLevelFromTrait } from '../avl-schema-parser';

const stateMachine: StateMachine = {
  states: [{ name: 'closed', isInitial: true }, { name: 'opened' }],
  events: [{ key: 'OPEN', name: 'Open' }, { key: 'CLOSE', name: 'Close' }],
  transitions: [
    { from: 'closed', to: 'opened', event: 'OPEN', guard: ['not', '@entity.open'], effects: [['set', '@entity.open', true]] },
    { from: 'opened', to: 'closed', event: 'CLOSE', effects: [['set', '@entity.open', false], ['emit', 'DOOR_CLOSED']] },
  ],
};

const described: TraitDescription = {
  value: { behavior: 'std/std-door', trait: 'DoorLife' },
  knobs: [],
  events: { emits: ['DOOR_CLOSED'], listens: ['KNOCK'], transitions: ['OPEN', 'CLOSE'] },
  machine: { linkedEntity: 'Door', stateMachine },
  model: '',
};

describe('traitLevelFromDescription', () => {
  it('maps states, transitions (guard and effect code included) and events', () => {
    const level = traitLevelFromDescription(described);
    expect(level?.name).toBe('DoorLife');
    expect(level?.linkedEntity).toBe('Door');
    expect(level?.states.map((s) => s.name)).toEqual(['closed', 'opened']);
    expect(level?.transitions[0]).toMatchObject({ from: 'closed', to: 'opened', event: 'OPEN', guard: ['not', '@entity.open'], index: 0 });
    expect(level?.transitions[1]?.effects).toEqual([
      { type: 'set', args: ['@entity.open', false] },
      { type: 'emit', args: ['DOOR_CLOSED'] },
    ]);
    expect(level?.emittedEvents).toEqual(['DOOR_CLOSED']);
    expect(level?.listenedEvents).toEqual(['KNOCK']);
  });

  it('draws the same as the trait read from its schema', () => {
    const trait: Trait = {
      name: 'DoorLife',
      scope: 'instance',
      stateMachine,
      emits: [{ event: 'DOOR_CLOSED' }],
      listens: [{ event: 'KNOCK', triggers: 'KNOCK' }],
    };
    expect(traitLevelFromDescription(described)).toEqual(traitLevelFromTrait(trait, 'Door'));
  });

  it('control: a description without a machine (an older orb) draws nothing', () => {
    const { machine: _machine, ...older } = described;
    expect(traitLevelFromDescription(older)).toBeNull();
  });
});
