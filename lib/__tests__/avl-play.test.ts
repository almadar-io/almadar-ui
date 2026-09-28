import { describe, it, expect } from 'vitest';
import type { CircuitStepResult, SExpr } from '@almadar/core';
import { createMinimalContext, evaluateTraced } from '@almadar/evaluator';
import type { TraitLevelData } from '../avl-schema-parser';
import { armPosition, firedTransition, stateMachinePlayback, transitionPlayback, type AvlPlayStep } from '../avl-play';

const IS_I: SExpr = ['=', '@payload.key', 'i'];
const IS_A: SExpr = ['=', '@payload.key', 'a'];
const trait: TraitLevelData = {
  name: 'Modes',
  linkedEntity: 'Editor',
  states: [{ name: 'NORMAL', isInitial: true, isTerminal: null }, { name: 'INSERT', isInitial: null, isTerminal: null }],
  transitions: [
    { from: 'NORMAL', to: 'INSERT', event: 'KEY', guard: IS_I, effects: [{ type: 'set', args: ['@entity.mode', 'insert'] }], index: 0 },
    { from: 'NORMAL', to: 'INSERT', event: 'KEY', guard: IS_A, effects: [], index: 1 },
    { from: 'INSERT', to: 'NORMAL', event: 'ESC', guard: null, effects: [], index: 2 },
    { from: 'NORMAL', to: 'NORMAL', event: 'KEY', guard: null, effects: [], index: 3 },
  ],
  emittedEvents: [],
  listenedEvents: [],
};

const guardRun = (arm: number, guard: SExpr, key: string) => {
  const run = evaluateTraced(guard, createMinimalContext({}, { key }));
  return { arm, guard, passed: run.value === true, trace: run.trace };
};

function step(from: string, event: string, key: string, result: Omit<CircuitStepResult, 'trait' | 'event' | 'emitted' | 'effects'> & Partial<CircuitStepResult>): AvlPlayStep {
  return {
    orbital: 'EditorOrbital',
    trait: 'Modes',
    from,
    payload: { key },
    result: { trait: 'Modes', event, effects: [], emitted: [], ...result },
  };
}

const keyA = step('NORMAL', 'KEY', 'a', {
  transitionFired: true,
  guard: 'pass',
  firedArm: 1,
  state: { before: 'NORMAL', after: 'INSERT' },
  guards: [guardRun(0, IS_I, 'a'), guardRun(1, IS_A, 'a')],
});
const esc = step('INSERT', 'ESC', '', { transitionFired: true, guard: 'none', firedArm: 0, state: { before: 'INSERT', after: 'NORMAL' } });
const keyI = step('NORMAL', 'KEY', 'i', {
  transitionFired: true,
  guard: 'pass',
  firedArm: 0,
  state: { before: 'NORMAL', after: 'INSERT' },
  guards: [guardRun(0, IS_I, 'i')],
  effects: [{ type: 'set', args: ['@entity.mode', 'insert'], status: 'executed', evalTrace: evaluateTraced(['+', 1, 1], createMinimalContext()).trace }],
});
const blocked = step('NORMAL', 'KEY', 'q', { transitionFired: false, guard: 'fail', state: { before: 'NORMAL', after: 'NORMAL' }, guards: [guardRun(0, IS_I, 'q'), guardRun(1, IS_A, 'q')] });
const scene = [keyA, esc, keyI];

describe('avl-play — played steps onto the AVL views', () => {
  it('arm positions count only the same from --event--> arms, in declaration order', () => {
    expect(trait.transitions.map((t) => armPosition(trait, t))).toEqual([0, 1, 0, 2]);
  });

  it('names the exact transition that fired when several arms share the event', () => {
    expect(firedTransition(trait, keyA)?.index).toBe(1);
    expect(firedTransition(trait, keyI)?.index).toBe(0);
  });

  it('control: a blocked step fired nothing', () => {
    expect(firedTransition(trait, blocked)).toBeUndefined();
  });

  it('state machine at the cursor: active state, last fired transition, visited path', () => {
    expect(stateMachinePlayback(trait, 'EditorOrbital', scene, 1)).toEqual({ activeState: 'NORMAL', activeTransition: 2, visitedStates: ['NORMAL', 'INSERT', 'NORMAL'] });
    expect(stateMachinePlayback(trait, 'EditorOrbital', scene, 2).activeTransition).toBe(0);
  });

  it('control: before any step, and for another trait, nothing is active', () => {
    expect(stateMachinePlayback(trait, 'EditorOrbital', scene, -1)).toEqual({ visitedStates: [] });
    expect(stateMachinePlayback(trait, 'OtherOrbital', scene, 2)).toEqual({ visitedStates: [] });
  });

  it('transition detail: the arm whose guard failed shows that guard run and no effects', () => {
    const p = transitionPlayback(trait, 'EditorOrbital', trait.transitions[0], scene, 0);
    expect(p?.fired).toBe(false);
    expect(p?.guard?.passed).toBe(false);
    expect(p?.effects).toEqual([]);
  });

  it('transition detail: the arm that fired shows its guard and its traced effects', () => {
    const p = transitionPlayback(trait, 'EditorOrbital', trait.transitions[0], scene, 2);
    expect(p?.fired).toBe(true);
    expect(p?.guard?.passed).toBe(true);
    expect(p?.effects[0].evalTrace?.length).toBeGreaterThan(0);
  });

  it('transition detail follows the cursor back in time', () => {
    expect(transitionPlayback(trait, 'EditorOrbital', trait.transitions[1], scene, 0)?.fired).toBe(true);
    expect(transitionPlayback(trait, 'EditorOrbital', trait.transitions[1], scene, 2)?.fired).toBe(true);
    expect(transitionPlayback(trait, 'EditorOrbital', trait.transitions[0], scene, 0)?.step).toBe(keyA);
  });

  it('control: an arm never reached (not evaluated, not fired) has no playback', () => {
    expect(transitionPlayback(trait, 'EditorOrbital', trait.transitions[3], scene, 2)).toBeUndefined();
    expect(transitionPlayback(trait, 'EditorOrbital', trait.transitions[1], [keyI], 0)).toBeUndefined();
  });
});
