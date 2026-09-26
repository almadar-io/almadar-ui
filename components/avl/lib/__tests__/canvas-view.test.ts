/**
 * The canvas shows one orbital card (local) or every card (world); a card's
 * state is picked from a dropdown whose options are the orbital's render-ui
 * transitions — one per distinct render for designers, one per transition
 * otherwise, imported behaviors grouped by alias.
 */
import { describe, it, expect } from 'vitest';
import type { OrbitalSchema } from '@almadar/core';
import { stateOptionsOf, canvasViewGraph, initialStateOf, LIVE_STATE } from '../avl-preview-converter';

const list = { type: 'data-list', entity: 'Task' };
const schema = {
  name: 'canvas-view',
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
          emits: [{ event: 'TASK_OPENED', scope: 'external' }],
          stateMachine: {
            states: [{ name: 'browsing', isInitial: true }, { name: 'editing' }],
            events: [],
            transitions: [
              { from: 'browsing', to: 'browsing', event: 'INIT', effects: [['render-ui', 'main', { type: 'loading-state' }]] },
              { from: 'browsing', to: 'browsing', event: 'LOADED', effects: [['render-ui', 'main', list]] },
              { from: 'browsing', to: 'browsing', event: 'LOAD_FAILED', effects: [['render-ui', 'main', { type: 'error-state' }]] },
              { from: 'browsing', to: 'browsing', event: 'SAVED', effects: [['render-ui', 'main', list]] },
              { from: 'browsing', to: 'editing', event: 'EDIT', effects: [['render-ui', 'main', { type: 'form' }]] },
              { from: 'editing', to: 'browsing', event: 'CANCEL', effects: [['set', '@entity.id', 'x']] },
            ],
          },
        },
        {
          name: 'Stats',
          scope: 'instance',
          linkedEntity: 'Task',
          sourceBehavior: { alias: 'Stat', behavior: 'std-stat-card' },
          stateMachine: {
            states: [{ name: 'idle', isInitial: true }],
            events: [],
            transitions: [
              { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'aside', { type: 'stat-card' }]] },
              { from: 'idle', to: 'idle', event: 'REFRESH', effects: [['render-ui', 'aside', { type: 'stat-card', label: 'x' }]] },
            ],
          },
        },
      ],
      pages: [{ name: 'Main', path: '/tasks', traits: [{ ref: 'Browse' }] }],
    },
    {
      name: 'Notes',
      entity: { name: 'Note', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
      traits: [
        {
          name: 'Listen',
          scope: 'instance',
          linkedEntity: 'Note',
          listens: [{ event: 'TASK_OPENED', triggers: 'SHOW', scope: 'external' }],
          stateMachine: {
            states: [{ name: 'idle', isInitial: true }],
            events: [],
            transitions: [{ from: 'idle', to: 'idle', event: 'SHOW', effects: [['set', '@entity.id', 'y']] }],
          },
        },
      ],
      pages: [{ name: 'Notes', path: '/notes', traits: [{ ref: 'Listen' }] }],
    },
  ],
} as OrbitalSchema;

const events = (opts: { data: { transitionEvent?: string } }[]) => opts.map((o) => o.data.transitionEvent);

describe('stateOptionsOf', () => {
  it('designers get one option per distinct render; identical renders merge', () => {
    const { own } = stateOptionsOf(schema, 'Tasks', 'screens');
    expect(events(own)).toEqual(['INIT', 'LOADED', 'LOAD_FAILED', 'EDIT']);
    expect(own.find((o) => o.data.transitionEvent === 'LOADED')?.data.enteredBy).toEqual(['LOADED', 'SAVED']);
  });

  it('two different renders of one state stay apart, and their labels tell them apart', () => {
    const labels = stateOptionsOf(schema, 'Tasks', 'screens').own.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.filter((l) => l.startsWith('browsing'))).toHaveLength(3);
    expect(labels).toContain('editing');
  });

  it('architects and builders get one option per render-ui transition', () => {
    expect(events(stateOptionsOf(schema, 'Tasks', 'transitions').own)).toEqual(['INIT', 'LOADED', 'LOAD_FAILED', 'SAVED', 'EDIT']);
  });

  it('a transition that renders nothing is never an option', () => {
    expect(events(stateOptionsOf(schema, 'Tasks', 'transitions').own)).not.toContain('CANCEL');
  });

  it('an imported behavior is an option group holding its own states', () => {
    const { groups } = stateOptionsOf(schema, 'Tasks', 'transitions');
    expect(groups.map((g) => [g.alias, g.behaviorName])).toEqual([['Stat', 'std-stat-card']]);
    expect(events(groups[0].options)).toEqual(['INIT', 'REFRESH']);
  });

  it('an option carries the card data a state render needs', () => {
    const edit = stateOptionsOf(schema, 'Tasks', 'screens').own.find((o) => o.data.transitionEvent === 'EDIT');
    expect(edit?.data).toMatchObject({ orbitalName: 'Tasks', traitName: 'Browse', fromState: 'browsing', toState: 'editing', cardLabel: 'screen' });
  });

  it('a trait embedded in another trait\'s render is part of that screen, never a state of its own', () => {
    const embedded = structuredClone(schema);
    const [tasks] = embedded.orbitals;
    const browse = tasks.traits[0];
    if (typeof browse !== 'object' || !('stateMachine' in browse) || !browse.stateMachine) throw new Error('fixture');
    browse.stateMachine.transitions[4].effects = [['render-ui', 'main', { type: 'stack', children: ['@trait.Stats'] }]];
    const { own, groups } = stateOptionsOf(embedded, 'Tasks', 'transitions');
    expect(groups).toEqual([]);
    expect(own.map((o) => o.data.traitName)).not.toContain('Stats');
  });

  it('a list spanning several traits names the trait in each label, so no two entries read alike', () => {
    const twoLayouts = structuredClone(schema);
    const [tasks] = twoLayouts.orbitals;
    const stats = tasks.traits[1];
    if (typeof stats !== 'object' || !('stateMachine' in stats)) throw new Error('fixture');
    tasks.traits.push({ ...structuredClone(stats), name: 'DetailStats' });
    const [group] = stateOptionsOf(twoLayouts, 'Tasks', 'screens').groups;
    const labels = group.options.map((o) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.filter((l) => l.startsWith('DetailStats · '))).toHaveLength(2);
    expect(stateOptionsOf(schema, 'Tasks', 'screens').own.every((o) => !o.label.startsWith('Browse'))).toBe(true);
  });

  it('an orbital with no render-ui transitions has no options', () => {
    expect(stateOptionsOf(schema, 'Notes', 'screens')).toEqual({ own: [], groups: [] });
  });

  it('an unknown orbital has no options', () => {
    expect(stateOptionsOf(schema, 'Missing', 'screens')).toEqual({ own: [], groups: [] });
  });
});

describe('initialStateOf', () => {
  it('is the INIT state — in designer screens too, where INIT may be one of several events', () => {
    expect(initialStateOf(stateOptionsOf(schema, 'Tasks', 'screens'))).toBe('Browse:INIT:browsing:browsing');
    expect(initialStateOf(stateOptionsOf(schema, 'Tasks', 'transitions'))).toBe('Browse:INIT:browsing:browsing');
  });

  it('without an own INIT render, the first own state, then an imported behavior\'s INIT', () => {
    const own = stateOptionsOf(schema, 'Tasks', 'transitions');
    const noInit = { ...own, own: own.own.filter((o) => o.data.transitionEvent !== 'INIT') };
    expect(initialStateOf(noInit)).toBe(noInit.own[0].id);
    expect(initialStateOf({ own: [], groups: own.groups })).toBe(own.groups[0].options[0].id);
  });

  it('with no render-ui states at all, the live orbital', () => {
    expect(initialStateOf({ own: [], groups: [] })).toBe(LIVE_STATE);
  });
});

describe('canvasViewGraph', () => {
  const base = { view: 'screens' as const };

  it('local shows only the focused orbital, at the origin (its world position is irrelevant)', () => {
    const g = canvasViewGraph(schema, { ...base, scope: 'local', focusedOrbital: 'Notes' });
    expect(g.nodes.map((n) => n.id)).toEqual(['Notes']);
    expect(g.nodes[0].position).toEqual({ x: 0, y: 0 });
    const world = canvasViewGraph(schema, { ...base, scope: 'world', focusedOrbital: 'Notes' });
    expect(world.nodes.find((n) => n.id === 'Notes')?.position).not.toEqual({ x: 0, y: 0 });
    expect(g.worldPositions.Notes).toEqual(world.nodes.find((n) => n.id === 'Notes')?.position);
    expect(g.edges).toEqual([]);
    expect(g.focusedOrbital).toBe('Notes');
  });

  it('local focuses the first orbital when none (or an unknown one) is asked for', () => {
    expect(canvasViewGraph(schema, { ...base, scope: 'local' }).nodes.map((n) => n.id)).toEqual(['Tasks']);
    expect(canvasViewGraph(schema, { ...base, scope: 'local', focusedOrbital: 'Gone' }).focusedOrbital).toBe('Tasks');
  });

  it('world shows every orbital with the cross-orbital edges, and marks the focused card', () => {
    const g = canvasViewGraph(schema, { ...base, scope: 'world', focusedOrbital: 'Notes' });
    expect(g.nodes.map((n) => n.id)).toEqual(['Tasks', 'Notes']);
    expect(g.edges.map((e) => [e.source, e.target])).toEqual([['Tasks', 'Notes']]);
    expect(g.nodes.map((n) => n.data.focused)).toEqual([false, true]);
  });

  it('a card shows its INIT state by default', () => {
    const [card] = canvasViewGraph(schema, { ...base, scope: 'local' }).nodes;
    expect(card.data).toMatchObject({ traitName: 'Browse', transitionEvent: 'INIT' });
  });

  it('an orbital without render-ui states shows the live orbital', () => {
    const [card] = canvasViewGraph(schema, { ...base, scope: 'local', focusedOrbital: 'Notes' }).nodes;
    expect(card.data.traitName).toBeUndefined();
  });

  it('a picked state swaps the card to that state and keeps the card identity', () => {
    const edit = stateOptionsOf(schema, 'Tasks', 'screens').own.find((o) => o.data.transitionEvent === 'EDIT');
    const [card] = canvasViewGraph(schema, { ...base, scope: 'local', stateByOrbital: { Tasks: edit?.id ?? '' } }).nodes;
    expect(card.id).toBe('Tasks');
    expect(card.data).toMatchObject({ traitName: 'Browse', transitionEvent: 'EDIT', toState: 'editing' });
  });

  it('a state inside an imported behavior can be picked', () => {
    const refresh = stateOptionsOf(schema, 'Tasks', 'transitions').groups[0].options[1];
    const [card] = canvasViewGraph(schema, { view: 'transitions', scope: 'local', stateByOrbital: { Tasks: refresh.id } }).nodes;
    expect(card.data).toMatchObject({ traitName: 'Stats', transitionEvent: 'REFRESH' });
  });

  it('a picked state that no longer exists falls back to the INIT state', () => {
    const [card] = canvasViewGraph(schema, { ...base, scope: 'local', stateByOrbital: { Tasks: 'Browse:GONE:browsing:browsing' } }).nodes;
    expect(card.data.transitionEvent).toBe('INIT');
  });

  it('LIVE_STATE picks the live orbital', () => {
    const [card] = canvasViewGraph(schema, { ...base, scope: 'local', stateByOrbital: { Tasks: LIVE_STATE } }).nodes;
    expect(card.data.traitName).toBeUndefined();
  });

  it('an edge keeps its trigger handle only while the source card renders that trigger', () => {
    const g = canvasViewGraph(schema, { ...base, scope: 'world', stateByOrbital: { Tasks: LIVE_STATE } });
    expect(g.edges.every((e) => e.sourceHandle === undefined)).toBe(true);
  });

  it('an empty schema has no cards and no focus', () => {
    const g = canvasViewGraph({ name: 'empty', version: '1.0.0', orbitals: [] } as OrbitalSchema, { ...base, scope: 'local' });
    expect(g).toEqual({ nodes: [], edges: [], focusedOrbital: undefined, worldPositions: {} });
  });
});
