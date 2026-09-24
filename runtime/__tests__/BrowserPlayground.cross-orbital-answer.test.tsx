// @vitest-environment jsdom
/**
 * G-RUNTIME-041 — std-global-search on project-friday /global-search sat on
 * "Searching…": the on-page searcher emits REQUESTED, an OFF-PAGE responder in
 * another orbital answers with RESULTS, and the searcher's bare
 * `listens { RESULTS }` must receive that answer and re-render.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function schema(): OrbitalSchema {
  return {
    name: 'cross-orbital-answer',
    version: '1.0.0',
    orbitals: [
      {
        name: 'SearchOrbital',
        entity: { name: 'Query', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'answer', type: 'string', default: '' }] },
        traits: [
          {
            name: 'Searcher',
            scope: 'instance',
            linkedEntity: 'Query',
            emits: [{ event: 'REQUESTED', scope: 'external', payloadSchema: [{ name: 'moduleKey', type: 'string' }] }],
            listens: [{ event: 'RESULTS', source: { kind: 'any' }, triggers: 'RESULTS' }],
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }, { name: 'searching' }],
              events: [],
              transitions: [
                { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'button', label: 'Go', action: 'GO' }]] },
                {
                  from: 'idle', to: 'searching', event: 'GO',
                  effects: [
                    ['emit', 'REQUESTED', { moduleKey: 'tasks' }],
                    ['render-ui', 'main', { type: 'typography', content: 'Searching…' }],
                  ],
                },
                {
                  from: 'searching', to: 'searching', event: 'RESULTS',
                  effects: [['render-ui', 'main', { type: 'typography', content: ['str/concat', 'answer:', '@payload.resultsJson'] }]],
                },
              ],
            },
          },
        ],
        pages: [{ name: 'SearchPage', path: '/search', traits: [{ ref: 'Searcher' }] }],
      },
      {
        name: 'TaskOrbital',
        entity: { name: 'Task', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'title', type: 'string' }] },
        traits: [
          {
            name: 'TaskResponder',
            scope: 'instance',
            linkedEntity: 'Task',
            category: 'lifecycle',
            emits: [{ event: 'RESULTS', scope: 'external', payloadSchema: [{ name: 'moduleKey', type: 'string' }, { name: 'resultsJson', type: 'string' }] }],
            listens: [{ event: 'REQUESTED', source: { kind: 'any' }, triggers: 'REQUESTED' }],
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }, { name: 'answering' }],
              events: [],
              transitions: [
                { from: 'idle', to: 'answering', event: 'REQUESTED', effects: [['fetch', 'Task', { emit: { success: 'TasksLoaded' } }]] },
                {
                  from: 'answering', to: 'idle', event: 'TasksLoaded',
                  effects: [['emit', 'RESULTS', { moduleKey: 'tasks', resultsJson: ['str/concat', 'n=', ['array/len', '@payload.data']] }]],
                },
              ],
            },
          },
        ],
        pages: [{ name: 'TaskPage', path: '/tasks', traits: [{ ref: 'TaskResponder' }] }],
      },
    ],
  } as OrbitalSchema;
}

describe('cross-orbital answer reaches an on-page bare listener', () => {
  it('an off-page responder in another orbital answers the on-page searcher', async () => {
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema()} initialPagePath="/search" fit />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByTestId('action-GO', {}, { timeout: 10_000 }));
    await waitFor(() => expect(screen.getByText(/answer:n=/)).toBeTruthy(), { timeout: 10_000 });
  }, 30_000);
});
