import { describe, it, expect } from 'vitest';
import type { OrbitalSchema, Trait, TraitEventListener, TraitId } from '@almadar/core';
import { isTraitId } from '@almadar/core';
import { traitEventWires } from '../avl-event-wires';

const tid = (s: string): TraitId => {
  if (!isTraitId(s)) throw new Error(`not a trait id: ${s}`);
  return s;
};

const trait = (name: string, emits: string[], listens: TraitEventListener[]): Trait => ({
  name,
  scope: 'instance',
  emits: emits.map((event) => ({ event })),
  listens,
  stateMachine: { states: [{ name: 'idle', isInitial: true }], events: [], transitions: [] },
});
const listen = (event: string, source?: TraitEventListener['source']): TraitEventListener => ({
  event,
  triggers: event,
  ...(source ? { source } : {}),
});
const schema = (...orbitals: Array<{ name: string; traits: OrbitalSchema['orbitals'][number]['traits'] }>): OrbitalSchema => ({
  name: 'App',
  orbitals: orbitals.map((o) => ({ name: o.name, entity: { name: `${o.name}Row`, fields: [] }, pages: [], traits: o.traits })),
});
const pairs = (s: OrbitalSchema) => traitEventWires(s).map((w) => `${w.emitterOrbital}.${w.emitterTrait}->${w.listenerOrbital}.${w.listenerTrait}:${w.event}`);

describe('traitEventWires — who the runtime actually delivers to', () => {
  it('a trait-scoped listen hears only that trait in its own orbital, even when another orbital emits the same name', () => {
    const s = schema(
      { name: 'A', traits: [trait('Browse', ['CREATE'], []), trait('Form', [], [listen('CREATE', { kind: 'trait', trait: 'Browse' })])] },
      { name: 'B', traits: [trait('Browse', ['CREATE'], []), trait('Form', [], [listen('CREATE', { kind: 'trait', trait: 'Browse' })])] },
    );
    expect(pairs(s)).toEqual(['A.Browse->A.Form:CREATE', 'B.Browse->B.Form:CREATE']);
  });

  it('an orbital-scoped listen hears exactly the named orbital trait', () => {
    const s = schema(
      { name: 'Intake', traits: [trait('Flow', ['SUBMITTED'], [])] },
      { name: 'Other', traits: [trait('Flow', ['SUBMITTED'], [])] },
      { name: 'Patient', traits: [trait('Chart', [], [listen('SUBMITTED', { kind: 'orbital', orbital: 'Intake', trait: 'Flow' })])] },
    );
    expect(pairs(s)).toEqual(['Intake.Flow->Patient.Chart:SUBMITTED']);
  });

  it('a bare listen hears every emitter of the event, as the runtime bus delivers it', () => {
    const s = schema(
      { name: 'A', traits: [trait('Emit', ['PING'], []), trait('Hear', [], [listen('PING')])] },
      { name: 'B', traits: [trait('Emit', ['PING'], [])] },
    );
    expect(pairs(s)).toEqual(['A.Emit->A.Hear:PING', 'B.Emit->A.Hear:PING']);
  });

  it('a legacy dotted listen names its source', () => {
    const s = schema(
      { name: 'A', traits: [trait('Emit', ['PING'], [])] },
      { name: 'B', traits: [trait('Emit', ['PING'], [])] },
      { name: 'C', traits: [trait('Hear', [], [listen('B.Emit.PING')])] },
    );
    expect(pairs(s)).toEqual(['B.Emit->C.Hear:PING']);
  });

  it('control: a trait hearing its own emit is not a wire', () => {
    const s = schema({ name: 'A', traits: [trait('Loop', ['TICK'], [listen('TICK')])] });
    expect(pairs(s)).toEqual([]);
  });

  it('a composed trait is read through its resolved atom under its call-site name', () => {
    const s = schema(
      { name: 'A', traits: [{ ref: 'Lib.traits.Emitter', name: 'Sender', _resolved: trait('Emitter', ['GO'], []) }] },
      { name: 'B', traits: [trait('Hear', [], [listen('GO', { kind: 'orbital', orbital: 'A', trait: 'Sender' })])] },
    );
    expect(pairs(s)).toEqual(['A.Sender->B.Hear:GO']);
  });

  it('control: an unresolved ref contributes nothing', () => {
    const s = schema({ name: 'A', traits: [{ ref: 'Lib.traits.Emitter' }] }, { name: 'B', traits: [trait('Hear', [], [listen('GO')])] });
    expect(pairs(s)).toEqual([]);
  });

  it('a listen naming its source by id matches the emitter by id (the rename-proof path)', () => {
    const emitter = { ...trait('Create', ['SAVE'], []), id: tid('trt_create') };
    const listener = trait('Persistor', [], [listen('SAVE', { kind: 'trait', trait: 'Create', traitId: tid('trt_create') })]);
    expect(pairs(schema({ name: 'A', traits: [emitter, listener] }))).toEqual(['A.Create->A.Persistor:SAVE']);
  });

  it('control: an id that names another trait does not match, whatever the name says', () => {
    const emitter = { ...trait('Create', ['SAVE'], []), id: tid('trt_create') };
    const listener = trait('Persistor', [], [listen('SAVE', { kind: 'trait', trait: 'Create', traitId: tid('trt_other') })]);
    expect(pairs(schema({ name: 'A', traits: [emitter, listener] }))).toEqual([]);
  });
});
