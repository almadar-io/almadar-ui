/**
 * Designer L2 "screens" view: one card per DISTINCT render. Transitions whose
 * rendered output is identical collapse; different renders of one state
 * (spinner / list / error) stay separate cards.
 */
import { describe, it, expect } from 'vitest';
import type { OrbitalSchema } from '@almadar/core';
import { orbitalToExpandedGraph } from '../avl-preview-converter';

const list = { type: 'data-list', entity: 'Task' };
const schema = {
  name: 'screens',
  version: '1.0.0',
  orbitals: [
    {
      name: 'Tasks',
      entity: { name: 'Task', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
      traits: [
        {
          name: 'Browse',
          scope: 'collection',
          linkedEntity: 'Task',
          stateMachine: {
            states: [{ name: 'browsing', isInitial: true }],
            events: [],
            transitions: [
              { from: 'browsing', to: 'browsing', event: 'INIT', effects: [['render-ui', 'main', { type: 'loading-state' }]] },
              { from: 'browsing', to: 'browsing', event: 'LOADED', effects: [['render-ui', 'main', list]] },
              { from: 'browsing', to: 'browsing', event: 'LOAD_FAILED', effects: [['render-ui', 'main', { type: 'error-state' }]] },
              { from: 'browsing', to: 'browsing', event: 'REFRESHED', effects: [['set', '@entity.x', 1], ['render-ui', 'main', list]] },
              { from: 'browsing', to: 'browsing', event: 'SAVED', effects: [['render-ui', 'main', list]] },
            ],
          },
        },
      ],
      pages: [{ name: 'Main', path: '/tasks', traits: [{ ref: 'Browse' }] }],
    },
  ],
} as OrbitalSchema;

describe('orbitalToExpandedGraph — screens view', () => {
  const transitions = orbitalToExpandedGraph(schema, 'Tasks').nodes;
  const screens = orbitalToExpandedGraph(schema, 'Tasks', undefined, undefined, 'screens').nodes;

  it('the default (architect) view keeps one card per transition', () => {
    expect(transitions.map((n) => n.data.transitionEvent)).toEqual(['INIT', 'LOADED', 'LOAD_FAILED', 'REFRESHED', 'SAVED']);
  });

  it('identical renders collapse into one screen; distinct renders stay separate', () => {
    expect(screens.map((n) => n.data.transitionEvent)).toEqual(['INIT', 'LOADED', 'LOAD_FAILED']);
  });

  it('a screen card records every event that shows it, in declaration order', () => {
    const listCard = screens.find((n) => n.data.transitionEvent === 'LOADED');
    expect(listCard?.data.enteredBy).toEqual(['LOADED', 'REFRESHED', 'SAVED']);
    expect(listCard?.data.cardLabel).toBe('screen');
  });

  it('transition cards are not marked as screens', () => {
    expect(transitions.every((n) => n.data.cardLabel === undefined)).toBe(true);
  });
});
