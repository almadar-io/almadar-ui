// @vitest-environment jsdom
/**
 * G-RUNTIME-012 (chart half), minimal: a fetcher trait's success event reaches a
 * sibling through `listens { Fetcher.Loaded -> ITEMS_LOADED }`; the listener
 * aggregates `?data` into its own entity and renders it. The rendered value must
 * be the aggregate of the fetched rows — the std-time-tracking /reports donut
 * painted a lone "0" instead.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    name: 'listen-aggregate',
    version: '1.0.0',
    orbitals: [
      {
        name: 'ReportOrbital',
        entity: {
          name: 'Entry',
          persistence: 'runtime',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'hours', type: 'number' },
          ],
        },
        traits: [
          {
            name: 'EntryFetcher',
            scope: 'instance',
            linkedEntity: 'Entry',
            category: 'lifecycle',
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }],
              events: [],
              transitions: [
                { from: 'idle', to: 'idle', event: 'INIT', effects: [['fetch', 'Entry', { emit: { success: 'EntriesLoaded' } }]] },
              ],
            },
          },
          {
            name: 'HoursTotal',
            scope: 'instance',
            linkedEntity: 'Summary',
            listens: [{ event: 'EntriesLoaded', source: { kind: 'trait', trait: 'EntryFetcher' }, triggers: 'ITEMS_LOADED' }],
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }],
              events: [],
              transitions: [
                {
                  from: 'idle', to: 'idle', event: 'INIT',
                  effects: [['render-ui', 'main', { type: 'typography', content: ['str/concat', 'rows:', '@entity.rowCount'] }]],
                },
                {
                  from: 'idle', to: 'idle', event: 'ITEMS_LOADED',
                  effects: [
                    ['set', '@entity.rowCount', ['array/len', '@payload.data']],
                    ['render-ui', 'main', { type: 'typography', content: ['str/concat', 'rows:', '@entity.rowCount'] }],
                  ],
                },
              ],
            },
          },
        ],
        auxiliaryEntities: [
          { name: 'Summary', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'rowCount', type: 'number', default: 0 }] },
        ],
        pages: [{ name: 'ReportPage', path: '/report', traits: [{ ref: 'EntryFetcher' }, { ref: 'HoursTotal' }] }],
      },
    ],
  } as OrbitalSchema;
}

describe('listen-delivered fetch rows reach the listener render', () => {
  it('renders the row count of the fetched collection, not 0', async () => {
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema()} initialPagePath="/report" fit />
      </MemoryRouter>,
    );
    await waitFor(() => {
      const el = screen.getByText(/rows:/);
      expect(Number(el.textContent?.replace('rows:', ''))).toBeGreaterThan(0);
    }, { timeout: 10_000 });
  }, 30_000);
});
