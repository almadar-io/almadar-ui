/**
 * A tick's `(emit X)` reaches a sibling through its declared `listens { Source.X -> Y }`, the
 * same as an emit from an event, and only through it: a sibling that merely has an arm named X
 * stays idle (G-UI-103 retired; EXEC-TICK-2). The emitter's own arm for X still runs (the
 * same-trait cascade). Ticks run outside the kernel, so the route has to come from the bus.
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema, TraitEventListener, TypedEffect } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

const ownArmRender: TypedEffect = ['render-ui', 'main', { type: 'typography', content: 'Own arm ran' }];

function program(watcherHears: 'listens' | 'bare', clockArm = false): OrbitalSchema {
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
            events: [{ key: 'INIT', name: 'INIT' }, ...(clockArm ? [{ key: 'BEAT', name: 'BEAT' }] : [])],
            transitions: [
              { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: 'Ticking' }]] },
              ...(clockArm ? [{ from: 'idle', to: 'idle', event: 'BEAT', effects: [ownArmRender] }] : []),
            ],
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

  it('a sibling with a same-name arm and no listens stays idle', async () => {
    render(<MemoryRouter><BrowserPlayground schema={program('bare')} /></MemoryRouter>);
    expect(await screen.findByText('Waiting', {}, { timeout: 5_000 })).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(screen.queryByText('Heard the clock')).toBeNull();
  }, 20_000);

  it('control: the emitting trait\'s own same-name arm runs', async () => {
    render(<MemoryRouter><BrowserPlayground schema={program('bare', true)} /></MemoryRouter>);
    expect(await screen.findByText('Own arm ran', {}, { timeout: 5_000 })).toBeTruthy();
  }, 20_000);
});
