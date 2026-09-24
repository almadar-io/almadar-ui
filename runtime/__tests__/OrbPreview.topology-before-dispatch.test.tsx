// @vitest-environment jsdom
/**
 * std-realtime-chat "sending does nothing", stateless topology: the page's
 * mount INITs were posted while the bridge's `register()` (which reports the
 * topology) was still pending, so they went out in the stateful shape (no
 * carried circuit state) to a stateless server, whose fresh-frame default
 * rows then overwrote the conversation the rail had just opened. No dispatch
 * may be posted before the transport's topology is known.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { EntityRow, OrbitalEventRequest, OrbitalSchema } from '@almadar/core';
import {
  buildTraitIndex,
  createInProcessTransport,
  createIndexStageRunner,
  evaluateOrbitalEvent,
  InMemoryPersistence,
  StateMachineManager,
  type EventTransport,
} from '@almadar/runtime';
import { OrbPreview } from '../OrbPreview';

function schema(): OrbitalSchema {
  return {
    name: 'topology-before-dispatch',
    version: '1.0.0',
    orbitals: [{
      name: 'NoteOrbital',
      entity: { name: 'Note', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }, { name: 'title', type: 'string' }] },
      traits: [{
        name: 'NoteList',
        scope: 'instance',
        linkedEntity: 'Note',
        stateMachine: {
          states: [{ name: 'loading', isInitial: true }, { name: 'ready' }],
          events: [],
          transitions: [
            { from: 'loading', to: 'loading', event: 'INIT', effects: [['fetch', 'Note', { emit: { success: 'LOADED' } }]] },
            { from: 'loading', to: 'ready', event: 'LOADED', effects: [['render-ui', 'main', { type: 'typography', content: 'loaded' }]] },
          ],
        },
      }],
      pages: [{ name: 'NotePage', path: '/notes', traits: [{ ref: 'NoteList' }] }],
    }],
  } as OrbitalSchema;
}

function delayedRegisterStatelessTransport(s: OrbitalSchema, sends: Array<{ registered: boolean; request: OrbitalEventRequest }>): EventTransport {
  const traitIndex = buildTraitIndex(s.orbitals);
  const persistence = new InMemoryPersistence();
  const base = createInProcessTransport(async (_orbital, request) => {
    const manager = new StateMachineManager([...traitIndex.byName.values()].map((e) => e.traitDef));
    const frames = new Map<string, EntityRow>();
    return evaluateOrbitalEvent(
      { traitIndex, manager, persistence, frames, runEffects: createIndexStageRunner({ traitIndex, persistence, frames, manager, schema: s }), runtimeRowSentinel: true },
      request,
    );
  }, { carriesCircuitState: true });
  let registered = false;
  return {
    ...base,
    async register(schemaArg) {
      await new Promise((r) => setTimeout(r, 50));
      const result = await base.register(schemaArg);
      registered = true;
      return result;
    },
    async send(orbital, request) {
      sends.push({ registered, request });
      return base.send(orbital, request);
    },
  };
}

describe('mount dispatches wait for the bridge topology', () => {
  it('no event is posted before register() reports the topology; the INIT goes out stateless-shaped', async () => {
    const s = schema();
    const sends: Array<{ registered: boolean; request: OrbitalEventRequest }> = [];
    render(
      <MemoryRouter>
        <OrbPreview schema={s} transport={delayedRegisterStatelessTransport(s, sends)} initialPagePath="/notes" isolated />
      </MemoryRouter>,
    );
    await screen.findByText('loaded', {}, { timeout: 10_000 });
    expect(sends.length).toBeGreaterThan(0);
    expect(sends.filter((x) => !x.registered).map((x) => x.request.event)).toEqual([]);
    expect(sends[0].request.traits).toBeDefined();
  }, 30_000);
});
