/**
 * The playground's bridge unregisters the program when it unmounts. React StrictMode (and
 * any key change above the preview) mounts it, unmounts it and mounts it again, so the
 * second mount must register the program again — waiting on the first registration left
 * the Studio Builder preview blank.
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function notesSaying(text: string): OrbitalSchema {
  return {
    ...notes,
    orbitals: notes.orbitals.map((o) => ({
      ...o,
      traits: o.traits.map((t) => (typeof t === 'object' && 'stateMachine' in t && t.stateMachine
        ? { ...t, stateMachine: { ...t.stateMachine, transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: text }]] }] } }
        : t)),
    })),
  } as OrbitalSchema;
}

const notes: OrbitalSchema = {
  name: 'notes',
  orbitals: [{
    name: 'NotesOrbital',
    entity: { name: 'NotesState', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
    traits: [{
      name: 'NotesView',
      scope: 'instance',
      linkedEntity: 'NotesState',
      stateMachine: {
        states: [{ name: 'idle', isInitial: true }],
        events: [],
        transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: 'Notes' }]] }],
      },
    }],
    pages: [{ name: 'NotesPage', path: '/', traits: [{ ref: 'NotesView' }] }],
  }],
} as OrbitalSchema;

describe('BrowserPlayground remount', () => {
  it('renders the program under StrictMode (mount, unmount, mount again)', async () => {
    render(
      <React.StrictMode>
        <MemoryRouter>
          <BrowserPlayground schema={notes} />
        </MemoryRouter>
      </React.StrictMode>,
    );
    expect(await screen.findByText('Notes', {}, { timeout: 10_000 })).toBeTruthy();
  }, 30_000);

  it('control: renders the program on a single mount', async () => {
    render(
      <MemoryRouter>
        <BrowserPlayground schema={notes} />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Notes', {}, { timeout: 10_000 })).toBeTruthy();
  }, 30_000);

  it('edge: renders again after the playground is unmounted and mounted fresh', async () => {
    const first = render(<MemoryRouter><BrowserPlayground schema={notes} /></MemoryRouter>);
    await screen.findByText('Notes', {}, { timeout: 10_000 });
    first.unmount();
    render(<MemoryRouter><BrowserPlayground schema={notes} /></MemoryRouter>);
    expect(await screen.findByText('Notes', {}, { timeout: 10_000 })).toBeTruthy();
  }, 30_000);

  it('a new schema while mounted (the Studio swaps in the resolved one) is registered and rendered', async () => {
    const view = render(<MemoryRouter><BrowserPlayground schema={notesSaying('Draft')} /></MemoryRouter>);
    await screen.findByText('Draft', {}, { timeout: 10_000 });
    view.rerender(<MemoryRouter><BrowserPlayground schema={notesSaying('Resolved')} /></MemoryRouter>);
    expect(await screen.findByText('Resolved', {}, { timeout: 10_000 })).toBeTruthy();
  }, 30_000);

  it('control: the same schema re-rendered keeps rendering', async () => {
    const schema = notesSaying('Steady');
    const view = render(<MemoryRouter><BrowserPlayground schema={schema} /></MemoryRouter>);
    await screen.findByText('Steady', {}, { timeout: 10_000 });
    view.rerender(<MemoryRouter><BrowserPlayground schema={schema} /></MemoryRouter>);
    expect(await screen.findByText('Steady', {}, { timeout: 10_000 })).toBeTruthy();
  }, 30_000);
});
