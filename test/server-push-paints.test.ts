// @vitest-environment jsdom
// A server-pushed event (a live message of this tab's own running call, or a
// peer's persist) reaches its listener AND repaints the listener's slots —
// the same settle a bus-entered dispatch gets.
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTraitStateMachine } from '../hooks/useTraitStateMachine';
import type { UISlotManager } from '../hooks/useUISlots';
import type { EventTransport, EventTransportRegisterResult, OrbitalEventRequest, OrbitalEventResponse, PushTarget } from '@almadar/runtime';
import type { EmittedEvent, OrbitalId, OrbitalSchema, ResolvedTraitBinding, Trait } from '@almadar/core';
import { createEmptyResolvedTrait } from '@almadar/core';

const chat: Trait = {
  name: 'Chat',
  scope: 'instance',
  linkedEntity: 'Turn',
  listens: [{ event: 'STEP', source: { kind: 'trait', trait: 'Loop' }, triggers: 'STEP' }],
  stateMachine: {
    states: [{ name: 'idle', isInitial: true }],
    events: [{ key: 'STEP', name: 'Step' }],
    transitions: [
      { from: 'idle', to: 'idle', event: 'STEP', effects: [['render-ui', 'main', { type: 'typography', content: '@payload.text' }]] },
    ],
  },
};

const orbitals: OrbitalSchema['orbitals'] = [{
  name: 'ChatOrbital',
  id: 'orb_chat' as OrbitalId,
  pages: [],
  entity: { name: 'Turn', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
  traits: [chat],
}];

class PushingServer implements EventTransport {
  push: ((emitted: EmittedEvent, target: PushTarget) => void) | undefined;
  register(): Promise<EventTransportRegisterResult> { return Promise.resolve({ success: true, carriesCircuitState: false }); }
  unregister(): Promise<void> { return Promise.resolve(); }
  send(_orbital: string, _request: OrbitalEventRequest): Promise<OrbitalEventResponse> {
    return Promise.resolve({ success: true, transitioned: false, states: {}, emittedEvents: [] });
  }
  subscribe(onPush: (emitted: EmittedEvent, target: PushTarget) => void): () => void {
    this.push = onPush;
    return () => { this.push = undefined; };
  }
}

function stubSlots(): UISlotManager & { render: ReturnType<typeof vi.fn> } {
  return {
    slots: {},
    render: vi.fn(() => 'id'),
    clear: vi.fn(),
    clearBySource: vi.fn(),
    clearById: vi.fn(),
    clearAll: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    hasContent: vi.fn(() => false),
    getContent: vi.fn(() => null),
    getTraitContent: vi.fn(() => null),
    subscribeTrait: vi.fn(() => () => undefined),
    updateTraitContent: vi.fn(() => 'id'),
  };
}

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

async function pushed(event: string, target: PushTarget) {
  const slots = stubSlots();
  const server = new PushingServer();
  const binding: ResolvedTraitBinding = { trait: createEmptyResolvedTrait('Chat', 'schema'), linkedEntity: 'Turn' };
  renderHook(() => useTraitStateMachine([binding], slots, { orbitals, transport: server }));
  await settle();
  slots.render.mockClear();
  server.push?.({ event, payload: { text: 'reading Task' }, source: { orbital: 'ChatOrbital', trait: 'Loop' } }, target);
  await settle();
  await settle();
  return slots.render.mock.calls.map(([arg]) => (arg as { props?: { content?: string } }).props?.content);
}

describe('server push ingress', () => {
  it('a live message of this tab\'s own call repaints its listener', async () => {
    expect(await pushed('STEP', 'origin')).toEqual(['reading Task']);
  });

  it('a peer push repaints its listener too', async () => {
    expect(await pushed('STEP', 'peers')).toEqual(['reading Task']);
  });

  it('control: a push no trait listens to paints nothing', async () => {
    expect(await pushed('UNHEARD', 'origin')).toEqual([]);
  });
});
