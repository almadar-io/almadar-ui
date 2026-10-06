/**
 * The Studio Builder preview renders the e2e fixture app (a persistent `Note` collection,
 * one page at /notes) in a BrowserPlayground; its INIT render must reach the page.
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

const fixture: OrbitalSchema = {
  name: 'E2E Palette Fixture',
  version: '1.0',
  orbitals: [{
    name: 'Notes',
    entity: { name: 'Note', collection: 'notes', fields: [{ name: 'title', type: 'string' }] },
    traits: [{
      name: 'NoteInteraction',
      category: 'interaction',
      scope: 'collection',
      linkedEntity: 'Note',
      stateMachine: {
        states: [{ name: 'Browsing', isInitial: true }],
        events: [{ key: 'INIT', name: 'INIT' }],
        transitions: [{ from: 'Browsing', to: 'Browsing', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: 'Notes' }]] }],
      },
    }],
    pages: [{ name: 'NotesPage', path: '/notes', traits: [{ ref: 'NoteInteraction' }] }],
  }],
} as OrbitalSchema;

describe('BrowserPlayground: the Builder e2e fixture', () => {
  it('renders the INIT content on its page', async () => {
    const { unmount } = render(<MemoryRouter><BrowserPlayground schema={fixture} initialPagePath="/notes" height="100%" /></MemoryRouter>);
    expect(await screen.findByText('Notes', {}, { timeout: 10_000 })).toBeTruthy();
    unmount();
  }, 30_000);

  it('renders the INIT content with no initial page path', async () => {
    const { unmount } = render(<MemoryRouter><BrowserPlayground schema={fixture} height="100%" /></MemoryRouter>);
    expect(await screen.findByText('Notes', {}, { timeout: 10_000 })).toBeTruthy();
    unmount();
  }, 30_000);
});
