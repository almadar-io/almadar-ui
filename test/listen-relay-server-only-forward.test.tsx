/**
 * Server-only listen arms on the stateful in-process topology (defect B,
 * 2026-09-22): a rebroadcast-delivered listen trigger whose arm carries
 * fetch/persist/call-service is STRANDED — the stateful server's listens
 * fan-out skips client-originated events (`originClientId`, expecting the
 * tab to relay every hop itself), the client's relay can't execute those
 * ops locally, and `onEventProcessed` refuses to forward rebroadcast tails
 * (fromBridge, R-RUNTIME-020). The chat thread's post-MESSAGE_SAVED
 * refetch never ran anywhere, so a sent message never appeared.
 *
 * The relay now forwards such triggers to the server as a FRESH dispatch
 * (never fromBridge) — but ONLY when:
 *   - the topology is `'in-process'` (the stateful path whose fan-out
 *     skips client-originated events; the stateless HTTP server runs
 *     off-page fan-outs itself and needs no forward), AND
 *   - the echo was NOT stamped `dispatched` (a dispatched echo's local leg
 *     already delivered — and forwarded — that hop; forwarding it again
 *     double-executes, the exact double-persist the originClientId guard
 *     exists to stop), AND
 *   - the triggered transition calls a server-only op (fetch/persist/
 *     call-service — the client has no handler for them in bridge mode).
 *
 * These tests drive the REAL `ServerBridgeProvider` (a stub in-process
 * transport + a mocked HTTP transport) plus the REAL
 * `useTraitStateMachine`.
 */
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { useEventBus } from '../hooks/useEventBus';
import {
  ServerBridgeProvider,
  useServerBridge,
  type ServerBridgeContextValue,
  type ServerBridgeTransport,
} from '../providers/ServerBridge';
import { EntitySchemaProvider } from '../providers/EntitySchemaContext';
import { UISlotProvider, useUISlots, type UISlotManager } from '../providers/UISlotContext';
import { useTraitStateMachine, type TraitStateMachineResult } from '../hooks/useTraitStateMachine';
import {
  asTraitId,
  createEmptyResolvedTrait,
  inferTsType,
  type BusEventSource,
  type EntityRow,
  type EventPayload,
  type OrbitalSchema,
  type OrbitalEventResponse,
  type ResolvedEntity,
  type ResolvedTraitBinding,
  type SExpr,
} from '@almadar/core';
import type { TransitionResult } from '@almadar/runtime';

const ORBITAL = 'ChatOrbital';
const COMPOSER = 'ChatComposer';
const THREAD = 'ChatThread';

const ORBITALS_BY_TRAIT: Record<string, string> = {
  [COMPOSER]: ORBITAL,
  [THREAD]: ORBITAL,
};

/** The thread's refetch arm — `fetch` is server-only in bridge mode. */
const FETCH_ARM: SExpr = ['fetch', 'ChatMessage', { emit: { success: 'BrowseItemLoaded' }, filter: ['=', ['object/get', '@entity', 'channel'], '@entity.activeChannel'] }];
/** A client-completable arm — `set` + `render-ui` only. */
const CLIENT_ARM: SExpr = ['do', ['set', '@entity.lastChannel', '@payload.channel'], ['render-ui', 'main', { type: 'stack' }]];

function makeTraits(armEffects: SExpr): ResolvedTraitBinding[] {
  const composer = createEmptyResolvedTrait(COMPOSER, 'inline');
  composer.linkedEntity = 'ChatMessage';
  composer.states = [{ name: 'ready', isInitial: true, isFinal: false }];
  composer.events = [{ key: 'CHANNEL_SELECTED', name: 'Channel selected' }];
  composer.transitions = [{ from: 'ready', to: 'ready', event: 'CHANNEL_SELECTED', effects: [CLIENT_ARM] }];

  const thread = createEmptyResolvedTrait(THREAD, 'inline');
  thread.linkedEntity = 'ChatMessage';
  thread.states = [{ name: 'loading', isInitial: true, isFinal: false }];
  thread.events = [
    { key: 'INIT', name: 'Initialize' },
    { key: 'BrowseItemLoaded', name: 'Loaded' },
  ];
  thread.listens = [
    { event: 'CHANNEL_SELECTED', triggers: 'INIT', source: { kind: 'trait', trait: COMPOSER, traitId: asTraitId('trt_composer') } },
  ];
  thread.transitions = [
    { from: 'loading', to: 'loading', event: 'INIT', effects: [armEffects] },
    { from: 'loading', to: 'browsing', event: 'BrowseItemLoaded', effects: [['render-ui', 'main', { type: 'message-list' }]] },
  ];

  return [{ trait: composer }, { trait: thread }];
}

function makeEntities(): ResolvedEntity[] {
  return [
    { name: 'ChatMessage', collection: 'chat-messages', fields: [{ name: 'id', type: 'string', tsType: inferTsType('string'), required: true }, { name: 'channel', type: 'string', tsType: inferTsType('string'), required: true }], usedByTraits: [], usedByPages: [] },
  ];
}

const SCHEMA: OrbitalSchema = { name: 'chat-app', orbitals: [] };
/** Identity-stable (a fresh `{}` per render would recreate the manager memo
 *  every render → setState loop). */
const TRAIT_CONFIGS = {};

let smRef: TraitStateMachineResult | null = null;
let bridgeRef: ServerBridgeContextValue | null = null;
let busRef: ReturnType<typeof useEventBus> | null = null;
let slotsRef: UISlotManager | null = null;

function Probe({ bindings }: { bindings: ResolvedTraitBinding[] }) {
  const uiSlots = useUISlots();
  const bridge = useServerBridge();
  // OrbPreview's onEventProcessed fan-out, verbatim in shape: forward the
  // dispatch to the owning orbital(s), never a fromBridge tail.
  const onEventProcessed = React.useCallback((
    event: string,
    payload?: EventPayload,
    dispatchedOrbitals?: Set<string>,
    _tick?: string,
    _sourceTrait?: string,
    locallyEmitted?: readonly string[],
    results?: ReadonlyArray<{ traitName: string; result: TransitionResult }>,
    entityByTrait?: Readonly<Record<string, EntityRow>>,
    fromBridge?: boolean,
  ) => {
    if (fromBridge) return;
    const targets = dispatchedOrbitals && dispatchedOrbitals.size > 0 ? Array.from(dispatchedOrbitals) : [ORBITAL];
    for (const name of targets) {
      void bridge.sendEvent(name, event, payload, undefined, undefined, locallyEmitted, results, entityByTrait);
    }
  }, [bridge]);
  const sm = useTraitStateMachine(bindings, uiSlots, {
    orbitalsByTrait: ORBITALS_BY_TRAIT,
    traitConfigsByName: TRAIT_CONFIGS,
    onEventProcessed,
  });
  useEffect(() => {
    smRef = sm;
  });
  bridgeRef = bridge;
  busRef = useEventBus();
  slotsRef = uiSlots;
  return null;
}

interface RecordedSend {
  orbitalName: string;
  event: string;
  payload?: unknown;
  results?: ReadonlyArray<{ traitName: string; result: { previousState: string } }>;
  entityByTrait?: Readonly<Record<string, unknown>>;
}

function makeStubTransport(sends: RecordedSend[]): ServerBridgeTransport {
  return {
    register: async () => true,
    unregister: async () => {},
    sendEvent: async (orbitalName, event, payload, _clientId, _tick, _sourceTrait, results, entityByTrait) => {
      sends.push({ orbitalName, event, payload, results, entityByTrait });
      const response: OrbitalEventResponse = {
        success: true,
        transitioned: true,
        states: {},
        emittedEvents: [],
      };
      return response;
    },
  };
}

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
  new Response(JSON.stringify({ success: true, transitioned: true, states: {}, emittedEvents: [] } as OrbitalEventResponse), { status: 200, headers: { 'Content-Type': 'application/json' } }),
);

beforeEach(() => {
  smRef = null;
  bridgeRef = null;
  busRef = null;
  slotsRef = null;
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

async function mountInProcess(armEffects: SExpr): Promise<RecordedSend[]> {
  const sends: RecordedSend[] = [];
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} transport={makeStubTransport(sends)}>
        <EntitySchemaProvider entities={makeEntities()}>
          <UISlotProvider>
            <Probe bindings={makeTraits(armEffects)} />
          </UISlotProvider>
        </EntitySchemaProvider>
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
  await waitFor(() => expect(bridgeRef?.connected).toBe(true));
  return sends;
}

async function mountStatelessHttp(armEffects: SExpr): Promise<void> {
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} serverUrl="http://bridge.test/api/orbitals">
        <EntitySchemaProvider entities={makeEntities()}>
          <UISlotProvider>
            <Probe bindings={makeTraits(armEffects)} />
          </UISlotProvider>
        </EntitySchemaProvider>
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
  await waitFor(() => expect(bridgeRef?.connected).toBe(true));
}

/** A stateful server over HTTP: the /register handshake DECLARES
 *  `topology: 'stateful'` (the deterministic signal — the same server
 *  binary answers 'stateless' when its one-shot interception is active). */
async function mountStatefulHttp(armEffects: SExpr): Promise<ReturnType<typeof vi.fn>> {
  const mock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
    const url = String(input);
    if (url.endsWith('/register')) {
      return new Response(JSON.stringify({ success: true, topology: 'stateful' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, transitioned: true, states: {}, emittedEvents: [] } as OrbitalEventResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', mock);
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} serverUrl="http://bridge.test/api/orbitals">
        <EntitySchemaProvider entities={makeEntities()}>
          <UISlotProvider>
            <Probe bindings={makeTraits(armEffects)} />
          </UISlotProvider>
        </EntitySchemaProvider>
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
  await waitFor(() => expect(bridgeRef?.connected).toBe(true));
  await waitFor(() => expect(bridgeRef?.stateSource).toBe('stateful-http'));
  return mock;
}

/** Rebroadcast semantics: a server-cascade event delivered by the bridge —
 *  fromBridge set, source trait stamped, NOT dispatched (the local leg never
 *  delivered it — the local persist/fetch no-ops). */
function emitRebroadcast(event: string, source: Partial<BusEventSource>): void {
  act(() => {
    busRef!.emit(`UI:${ORBITAL}.${COMPOSER}.${event}`, { channel: 'chan-1' }, {
      orbital: ORBITAL,
      trait: COMPOSER,
      fromBridge: true,
      ...source,
    });
  });
}

describe('listen relay: server-only arms on the stateful in-process topology', () => {
  it('forwards a rebroadcast-delivered fetch arm to the server as a fresh dispatch (not fromBridge)', async () => {
    const sends = await mountInProcess(FETCH_ARM);

    emitRebroadcast('CHANNEL_SELECTED', {});

    await waitFor(() => expect(sends.length).toBe(1));
    const send = sends[0]!;
    expect(send.orbitalName).toBe(ORBITAL);
    expect(send.event).toBe('INIT');
    // Scoped to the listening trait from its CURRENT state — the server
    // evaluates exactly that arm, nothing else.
    expect(send.results?.map((r) => ({ trait: r.traitName, from: r.result.previousState }))).toEqual([
      { trait: THREAD, from: 'loading' },
    ]);
    // The Fix C entity snapshot rides along (the fetch filter reads
    // @entity.activeChannel server-side).
    expect(send.entityByTrait).toBeDefined();
  });

  it('does NOT forward a dispatched-stamped echo (its local leg already delivered that hop)', async () => {
    const sends = await mountInProcess(FETCH_ARM);

    emitRebroadcast('CHANNEL_SELECTED', { dispatched: true });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(sends).toHaveLength(0);
  });

  it('does NOT forward a client-completable arm (set/render-ui execute locally)', async () => {
    const sends = await mountInProcess(CLIENT_ARM);

    emitRebroadcast('CHANNEL_SELECTED', {});

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(sends).toHaveLength(0);
  });

  it('does NOT forward on the stateless HTTP topology (the server runs off-page fan-outs itself)', async () => {
    await mountStatelessHttp(FETCH_ARM);
    const callsBefore = fetchMock.mock.calls.length;

    emitRebroadcast('CHANNEL_SELECTED', {});

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    const eventCalls = fetchMock.mock.calls.slice(callsBefore).filter((c) => String(c[0]).includes('/events'));
    expect(eventCalls).toHaveLength(0);
  });

  it('forwards on the stateful-over-HTTP topology (the register handshake declares topology: stateful)', async () => {
    const mock = await mountStatefulHttp(FETCH_ARM);

    emitRebroadcast('CHANNEL_SELECTED', {});

    // The register response's own topology declaration drives the gate —
    // the same server binary answers 'stateless' when its one-shot
    // interception is active, so no transport/response-shape sniffing.
    await waitFor(() => {
      const eventCalls = mock.mock.calls.filter((c) => String(c[0]).includes('/events'));
      expect(eventCalls.length).toBeGreaterThan(0);
    });
    const eventCalls = mock.mock.calls.filter((c) => String(c[0]).includes('/events'));
    // The mount INIT is the first /events call; the relay's forward is the
    // last one (its payload carries the rebroadcast's channel).
    const body = JSON.parse(String(eventCalls[eventCalls.length - 1]?.[1]?.body ?? '{}')) as { event?: string; payload?: Record<string, unknown>; traits?: Array<{ trait: string; from: string }> };
    expect(body.event).toBe('INIT');
    expect(body.payload?.['channel']).toBe('chan-1');
    expect(body.traits?.map((t) => `${t.trait}@${t.from}`)).toEqual([`${THREAD}@loading`]);
  });

  it('never executes a server-only arm locally on the stateless topology (no skeleton render clobbering the server\'s real render)', async () => {
    // The fetch arm also writes a payload-derived marker and renders it.
    // The mount-time INIT (payload {}) writes undefined; a relay execution
    // of the rebroadcast (payload {channel:'chan-1'}) would write 'chan-1'
    // and re-render — the skip means neither happens.
    const SKELETON_ARM: SExpr = ['do', FETCH_ARM, ['set', '@entity.relayMarker', '@payload.channel'], ['render-ui', 'main', { type: 'skeleton', rows: 4, marker: '@entity.relayMarker' }]];
    await mountStatelessHttp(SKELETON_ARM);

    emitRebroadcast('CHANNEL_SELECTED', {});

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    const content = slotsRef!.getTraitContent(THREAD) ?? slotsRef!.getContent('main');
    const props = (content as { props?: Record<string, unknown> } | null)?.props ?? {};
    expect(props['marker']).not.toBe('chan-1');
  });
});
