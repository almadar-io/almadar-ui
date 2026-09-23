/**
 * Server-consumed echo payloads must reach client render surfaces
 * (2026-09-22, chat thread "No messages in this conversation yet").
 *
 * A server-side cascade consumes an emitted event for a next hop and stamps
 * `source.dispatched: true` (`TraitCascade.ts` same-trait cascade,
 * `transition-handler.ts` cross-trait fan-out). The client's self-subscribe
 * used to drop EVERY dispatched echo (R-DUAL-EXEC-SERVER-ECHO's guard
 * against re-running LOCALLY-EXECUTED transitions) — but a server-consumed
 * echo is one the local machine NEVER ran: its payload (fetch results bound
 * as `@payload.data`) is the only delivery of server-produced render data,
 * and dropping it stranded the render surface.
 *
 * `stampLocallyDeliveredEchoes` now normalizes the flag to mean exactly
 * "locally delivered": echoes the local leg delivered stay `dispatched:
 * true` (dropped — no double-execution); everything else is cleared to
 * `false` and fires locally, delivering the payload.
 *
 * These tests drive the REAL `ServerBridgeProvider` (HTTP transport mocked
 * with a recorded response whose echo is server-stamped `dispatched: true`)
 * plus the REAL `useTraitStateMachine`, and assert the trait's slot content
 * carries the payload rows. Arms are self-loops so the G-RUNTIME-022 state
 * sync (which legitimately advances the state server-side first) cannot
 * mask the delivery question.
 */
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { ServerBridgeProvider, useServerBridge, type ServerBridgeContextValue } from '../providers/ServerBridge';
import { EntitySchemaProvider } from '../providers/EntitySchemaContext';
import { UISlotProvider, useUISlots, type UISlotManager } from '../providers/UISlotContext';
import { useTraitStateMachine, type TraitStateMachineResult } from '../hooks/useTraitStateMachine';
import {
  createEmptyResolvedTrait,
  inferTsType,
  type OrbitalSchema,
  type OrbitalEventResponse,
  type ResolvedEntity,
  type ResolvedTraitBinding,
  type SExpr,
} from '@almadar/core';

const ORBITAL = 'ChatOrbital';
const THREAD = 'ChatThread';

const ORBITALS_BY_TRAIT: Record<string, string> = { [THREAD]: ORBITAL };

const RENDER_ROWS: SExpr = ['render-ui', 'main', { type: 'message-list', entity: '@payload.data' }];

function makeTraits(): ResolvedTraitBinding[] {
  const thread = createEmptyResolvedTrait(THREAD, 'inline');
  thread.linkedEntity = 'ChatMessage';
  thread.states = [{ name: 'idle', isInitial: true, isFinal: false }];
  thread.events = [
    { key: 'INIT', name: 'Initialize' },
    { key: 'BrowseItemLoaded', name: 'Loaded' },
  ];
  thread.transitions = [
    // The fetch runs SERVER-side only (the client handler set has no
    // fetch); the local INIT emits nothing, exactly the cold-mount case.
    { from: 'idle', to: 'idle', event: 'INIT', effects: [['fetch', 'ChatMessage', { emit: { success: 'BrowseItemLoaded' } }]] },
    { from: 'idle', to: 'idle', event: 'BrowseItemLoaded', effects: [RENDER_ROWS] },
    // A cross-orbital responder's completion (global search's shape): the
    // trait transitions on an event emitted by a responder on ANOTHER
    // orbital, reached only via the bare-cascade subscription.
    { from: 'idle', to: 'idle', event: 'SEARCH_RESULTS', effects: [['set', '@entity.results', '@payload.resultsJson']] },
  ];
  return [{ trait: thread }];
}

function makeEntities(): ResolvedEntity[] {
  return [
    { name: 'ChatMessage', collection: 'chat-messages', fields: [{ name: 'id', type: 'string', tsType: inferTsType('string'), required: true }, { name: 'body', type: 'string', tsType: inferTsType('string'), required: true }], usedByTraits: [], usedByPages: [] },
  ];
}

const SCHEMA: OrbitalSchema = { name: 'chat-app', orbitals: [] };
/** Identity-stable (a fresh `{}` per render would recreate the manager memo
 *  every render → setState loop). */
const TRAIT_CONFIGS = {};

let smRef: TraitStateMachineResult | null = null;
let bridgeRef: ServerBridgeContextValue | null = null;
let slotsRef: UISlotManager | null = null;

function Probe({ bindings }: { bindings: ResolvedTraitBinding[] }) {
  const uiSlots = useUISlots();
  const sm = useTraitStateMachine(bindings, uiSlots, {
    orbitalsByTrait: ORBITALS_BY_TRAIT,
    traitConfigsByName: TRAIT_CONFIGS,
  });
  useEffect(() => {
    smRef = sm;
  });
  bridgeRef = useServerBridge();
  slotsRef = uiSlots;
  return null;
}

/** A recorded INIT response whose echo the SERVER consumed (stamped
 *  `dispatched: true` by its fan-out) — the shape that used to be dropped. */
const INIT_RESPONSE: OrbitalEventResponse = {
  success: true,
  transitioned: true,
  states: { [THREAD]: 'idle' },
  emittedEvents: [
    {
      event: 'BrowseItemLoaded',
      payload: { data: [{ id: 'm1', body: 'hello from the server' }], totalCount: 1 },
      source: {
        orbital: ORBITAL,
        trait: THREAD,
        transition: 'idle--INIT-->idle',
        dispatched: true,
      },
    },
  ],
  entityByTrait: { [THREAD]: { activeChannel: 'chan-1' } },
};

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
  const url = String(input);
  if (url.endsWith('/register')) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify(INIT_RESPONSE), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

beforeEach(() => {
  smRef = null;
  bridgeRef = null;
  slotsRef = null;
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

async function mountAndRunInit(locallyEmitted?: readonly string[]): Promise<void> {
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} serverUrl="http://bridge.test/api/orbitals">
        <EntitySchemaProvider entities={makeEntities()}>
          <UISlotProvider>
            <Probe bindings={makeTraits()} />
          </UISlotProvider>
        </EntitySchemaProvider>
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
  await waitFor(() => expect(bridgeRef?.connected).toBe(true));

  // OrbPreview's "Server INIT when bridge connects" effect, verbatim.
  await act(async () => {
    const { meta } = await bridgeRef!.sendEvent(ORBITAL, 'INIT', { _activeTraits: [THREAD] }, undefined, undefined, locallyEmitted);
    if (meta.stateSource === 'stateless-http' && meta.states) {
      smRef!.applyServerStates(meta.states);
    }
    if (meta.entityByTrait) {
      for (const [traitName, entity] of Object.entries(meta.entityByTrait)) {
        smRef!.commitServerEntity(traitName, entity);
      }
    }
  });
  // Let the deferred rebroadcast + the relay's async drain settle.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
}

function renderedRows(): unknown {
  const content = slotsRef!.getTraitContent(THREAD) ?? slotsRef!.getContent('main');
  const props = (content as { props?: Record<string, unknown> } | null)?.props ?? {};
  return props['entity'];
}

/** A recorded response whose echo is a CROSS-ORBITAL responder's completion
 *  (global search's shape): emitted by a responder on a DIFFERENT orbital,
 *  consumed by a trait that transitions on the event via the bare-cascade. */
const SEARCH_RESPONSE: OrbitalEventResponse = {
  success: true,
  transitioned: true,
  states: { [THREAD]: 'idle' },
  emittedEvents: [
    {
      event: 'SEARCH_RESULTS',
      payload: { moduleKey: 'tasks', resultsJson: 'task one, task two' },
      source: {
        orbital: 'TaskOrbital',
        trait: 'TaskSearchResponder',
        transition: 'answering--TaskSearchLoaded-->idle',
        dispatched: true,
      },
    },
  ],
  entityByTrait: { [THREAD]: { activeChannel: 'chan-1' } },
};

async function mountAndRunInitWith(response: OrbitalEventResponse): Promise<void> {
  vi.stubGlobal('fetch', vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async (input) => {
    const url = String(input);
    if (url.endsWith('/register')) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }));
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} serverUrl="http://bridge.test/api/orbitals">
        <EntitySchemaProvider entities={makeEntities()}>
          <UISlotProvider>
            <Probe bindings={makeTraits()} />
          </UISlotProvider>
        </EntitySchemaProvider>
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
  await waitFor(() => expect(bridgeRef?.connected).toBe(true));

  await act(async () => {
    const { meta } = await bridgeRef!.sendEvent(ORBITAL, 'INIT', { _activeTraits: [THREAD] });
    if (meta.stateSource === 'stateless-http' && meta.states) {
      smRef!.applyServerStates(meta.states);
    }
    if (meta.entityByTrait) {
      for (const [traitName, entity] of Object.entries(meta.entityByTrait)) {
        smRef!.commitServerEntity(traitName, entity);
      }
    }
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
}

describe('server-consumed echo payloads reach client render surfaces', () => {
  it('a server-consumed (dispatched-stamped) echo fires locally and renders @payload.data', async () => {
    await mountAndRunInit();

    // The thread's BrowseItemLoaded arm ran locally with the echo's
    // payload — the message list renders the server-fetched rows.
    expect(renderedRows()).toEqual([{ id: 'm1', body: 'hello from the server' }]);
  });

  it('a locally-delivered twin stays dropped (no double-execution of an already-run transition)', async () => {
    await mountAndRunInit(['BrowseItemLoaded']);

    // The local leg delivered BrowseItemLoaded (a real local emit would
    // have executed the arm already) — the echo is stamped dispatched:true
    // and MUST be dropped: the arm does not run a second time, so the
    // payload never reaches the surface through it.
    expect(renderedRows()).not.toEqual([{ id: 'm1', body: 'hello from the server' }]);
  });

  it('a cross-orbital echo also reaches a trait that transitions on the event via the bare-cascade (global search shape)', async () => {
    await mountAndRunInitWith(SEARCH_RESPONSE);

    // The responder's SEARCH_RESULTS (a different orbital/trait) fires the
    // trait's SEARCH_RESULTS arm through the bare-cascade subscription —
    // the qualified rebroadcast alone never reaches it.
    expect(smRef!.entityBindingSource.getEntitySnapshot(THREAD).results).toBe('task one, task two');
  });
});
