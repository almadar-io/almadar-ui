/**
 * A tick's `(emit X)` reaches a sibling through its declared `listens { Source.X -> Y }`, the
 * same as an emit from an event. Ticks run outside the kernel, so the route has to come from
 * the bus: the orb.almadar.io demo diagrams heard a learning transport's Step button but never
 * its running clock.
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema, TraitEventListener } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function program(watcherHears: 'listens' | 'bare'): OrbitalSchema {
  const listens: TraitEventListener[] = watcherHears === 'listens'
    ? [{ event: 'BEAT', source: { kind: 'trait', trait: 'Clock' }, triggers: 'HEARD' }]
    : [];
  const heardOn = watcherHears === 'listens' ? 'HEARD' : 'BEAT';
  return {
    name: `tick-${watcherHears}`,
    version: '1.0.0',
    orbitals: [{
      name: 'Lab',
      entity: { name: 'LabState', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
      traits: [
        {
          name: 'Clock', linkedEntity: 'LabState', category: 'interaction', scope: 'instance',
          stateMachine: {
            states: [{ name: 'idle', isInitial: true }],
            events: [{ key: 'INIT', name: 'INIT' }],
            transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: 'Ticking' }]] }],
          },
          emits: [{ event: 'BEAT', scope: 'external' }],
          ticks: [{ name: 'beat', interval: 30, effects: [['emit', 'BEAT']] }],
        },
        {
          name: 'Watcher', linkedEntity: 'LabState', category: 'interaction', scope: 'instance',
          stateMachine: {
            states: [{ name: 'waiting', isInitial: true }, { name: 'heard' }],
            events: [{ key: 'INIT', name: 'INIT' }, { key: heardOn, name: heardOn }],
            transitions: [
              { from: 'waiting', to: 'waiting', event: 'INIT', effects: [['render-ui', 'sidebar', { type: 'typography', content: 'Waiting' }]] },
              { from: 'waiting', to: 'heard', event: heardOn, effects: [['render-ui', 'sidebar', { type: 'typography', content: 'Heard the clock' }]] },
            ],
          },
          listens,
        },
      ],
      pages: [{ name: 'Home', path: '/', traits: [{ ref: 'Clock' }, { ref: 'Watcher' }] }],
    }],
  };
}

describe('BrowserPlayground: a tick emit and declared listens', () => {
  it('reaches a sibling through its listens route', async () => {
    render(<MemoryRouter><BrowserPlayground schema={program('listens')} /></MemoryRouter>);
    expect(await screen.findByText('Heard the clock', {}, { timeout: 5_000 })).toBeTruthy();
  }, 20_000);

  it('control: reaches a sibling with a same-name arm', async () => {
    render(<MemoryRouter><BrowserPlayground schema={program('bare')} /></MemoryRouter>);
    expect(await screen.findByText('Heard the clock', {}, { timeout: 5_000 })).toBeTruthy();
  }, 20_000);
});
