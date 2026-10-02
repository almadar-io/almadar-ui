// The page kernel wrapper must forward per-dispatch hooks: `onLocal` is how a
// transition's own render-ui (its loading skeleton) paints before the server
// round trip. Dropping it leaves the slot empty for the whole leg.
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { OrbitalSchema, ResolvedTraitBinding } from '@almadar/core';
import type { EventTransport, EventTransportRegisterResult, OrbitalEventRequest, OrbitalEventResponse } from '@almadar/runtime';
import { useCircuitKernel } from '../hooks/circuit/useCircuitKernel';

const orbitals: OrbitalSchema['orbitals'] = [{
  name: 'Main', pages: [],
  entity: { name: 'Note', persistence: 'persistent', collection: 'notes', fields: [{ name: 'id', type: 'string' }] },
  traits: [{
    name: 'Notes', linkedEntity: 'Note', scope: 'instance',
    stateMachine: {
      states: [{ name: 'idle', isInitial: true }], events: [],
      transitions: [
        { from: 'idle', to: 'idle', event: 'INIT', effects: [['fetch', 'Note', { emit: { success: 'LOADED' } }], ['render-ui', 'main', { type: 'skeleton', variant: 'table' }]] },
      ],
    },
  }],
}];

const binding: ResolvedTraitBinding = {
  trait: {
    name: 'Notes', source: 'schema', states: [{ name: 'idle', isInitial: true, isFinal: false }], events: [],
    transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [] }], guards: [], ticks: [], listens: [], dataEntities: [],
  },
};

class GatedServer implements EventTransport {
  readonly sent: OrbitalEventRequest[] = [];
  release: () => void = () => undefined;
  private readonly gate = new Promise<void>((r) => { this.release = r; });
  register(): Promise<EventTransportRegisterResult> { return Promise.resolve({ success: true, carriesCircuitState: true }); }
  unregister(): Promise<void> { return Promise.resolve(); }
  async send(_orbital: string, request: OrbitalEventRequest): Promise<OrbitalEventResponse> {
    this.sent.push(request);
    await this.gate;
    return { success: true, transitioned: true, states: { Notes: 'idle' }, emittedEvents: [], effectResults: [] };
  }
}

describe('useCircuitKernel forwards dispatch hooks', () => {
  it('onLocal sees the local render before the server leg settles', async () => {
    const server = new GatedServer();
    const { result } = renderHook(() => useCircuitKernel([binding], { orbitals, transport: server, carriesCircuitState: true }));
    const painted: string[] = [];
    const done = result.current.kernel.dispatch({ event: 'INIT', targetTrait: 'Notes' }, {
      onLocal: (local) => { painted.push(...(local.clientEffects ?? []).map((e) => String(e[0]))); },
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(painted).toEqual(['render-ui']);
    server.release();
    await done;
  });

  it('while the topology is pending the local arm paints and only the post waits', async () => {
    const server = new GatedServer();
    const { result, rerender } = renderHook(({ pending }) => useCircuitKernel([binding], { orbitals, transport: server, carriesCircuitState: true, awaitTopology: pending }), { initialProps: { pending: true } });
    let localSeen = false;
    const done = result.current.kernel.dispatch({ event: 'INIT', targetTrait: 'Notes' }, { onLocal: () => { localSeen = true; } });
    await new Promise((r) => setTimeout(r, 0));
    expect(localSeen).toBe(true);
    expect(server.sent).toHaveLength(0);
    rerender({ pending: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(server.sent).toHaveLength(1);
    expect(server.sent[0]?.traits).toBeDefined();
    server.release();
    await done;
  });

  it('the kernel survives the topology resolving: one dispatch is posted once, never dropped or duplicated', async () => {
    const server = new GatedServer();
    const { result, rerender } = renderHook(({ pending }) => useCircuitKernel([binding], { orbitals, transport: server, carriesCircuitState: true, awaitTopology: pending }), { initialProps: { pending: true } });
    const before = result.current.kernel;
    const done = before.dispatch({ event: 'INIT', targetTrait: 'Notes' });
    rerender({ pending: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.kernel).toBe(before);
    server.release();
    await done;
    expect(server.sent).toHaveLength(1);
  });
});
