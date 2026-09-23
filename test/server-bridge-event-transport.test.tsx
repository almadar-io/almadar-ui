/**
 * `ServerBridgeProvider` as a context around `@almadar/runtime`'s
 * `EventTransport` port (plan P5, W5b,
 * `docs/Almadar_Runtime_Stateless_Stateful_PLAN.md` §4.2/§4.3). The provider
 * no longer implements its own HTTP transport or push-channel — it drives
 * whatever `EventTransport` it is given (an injected in-process one here)
 * through the SAME `register`/`send`/`subscribe` port the HTTP transport
 * satisfies.
 */
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { useEventBus } from '../hooks/useEventBus';
import { ServerBridgeProvider, useServerBridge, type ServerBridgeContextValue } from '../providers/ServerBridge';
import { createInProcessTransport, type EventTransport, type OrbitalEvaluator } from '@almadar/runtime';
import type { EventBusContextType } from '../types/event-bus-types';
import type { EmittedEvent, OrbitalEventResponse, OrbitalSchema } from '@almadar/core';

const SCHEMA: OrbitalSchema = { name: 'in-process-probe', orbitals: [] };
const ORBITAL = 'ProbeOrbital';

let bridgeRef: ServerBridgeContextValue | null = null;
let busRef: EventBusContextType | null = null;

function Probe(): null {
  bridgeRef = useServerBridge();
  busRef = useEventBus();
  return null;
}

function mount(transport: EventTransport): void {
  render(
    <EventBusProvider>
      <ServerBridgeProvider schema={SCHEMA} transport={transport}>
        <Probe />
      </ServerBridgeProvider>
    </EventBusProvider>,
  );
}

beforeEach(() => {
  bridgeRef = null;
  busRef = null;
});

describe('ServerBridgeProvider drives an injected EventTransport', () => {
  it('register → carriesCircuitState default (false) → stateSource "in-process"', async () => {
    const evaluate: OrbitalEvaluator = async () => ({ success: true, transitioned: false, states: {}, emittedEvents: [] });
    mount(createInProcessTransport(evaluate));

    await waitFor(() => expect(bridgeRef?.connected).toBe(true));
    expect(bridgeRef?.stateSource).toBe('in-process');
  });

  it('register → carriesCircuitState: true → stateSource "stateless-http"', async () => {
    const evaluate: OrbitalEvaluator = async () => ({ success: true, transitioned: false, states: {}, emittedEvents: [] });
    mount(createInProcessTransport(evaluate, { carriesCircuitState: true }));

    await waitFor(() => expect(bridgeRef?.connected).toBe(true));
    expect(bridgeRef?.stateSource).toBe('stateless-http');
  });

  it('send: the transport\'s response effects/states reach the caller', async () => {
    const response: OrbitalEventResponse = {
      success: true,
      transitioned: true,
      states: { SomeTrait: 'browsing' },
      emittedEvents: [],
      clientEffects: [['render-ui', 'main', { type: 'stack' }]],
    };
    const evaluate: OrbitalEvaluator = async () => response;
    mount(createInProcessTransport(evaluate));
    await waitFor(() => expect(bridgeRef?.connected).toBe(true));

    const { effects, meta } = await bridgeRef!.sendEvent(ORBITAL, 'INIT');
    expect(meta.success).toBe(true);
    expect(meta.states).toEqual({ SomeTrait: 'browsing' });
    expect(meta.stateSource).toBe('in-process');
    expect(effects).toEqual([{ type: 'render-ui', slot: 'main', pattern: { type: 'stack' }, traitName: undefined }]);
  });

  it('subscribe: a pushed EmittedEvent re-emits on the qualified bus key', async () => {
    let pushCallback: ((emitted: EmittedEvent) => void) | undefined;
    const evaluate: OrbitalEvaluator = async () => ({ success: true, transitioned: false, states: {}, emittedEvents: [] });
    const transport: EventTransport = {
      ...createInProcessTransport(evaluate),
      subscribe: (onPush) => {
        pushCallback = onPush;
        return () => {
          pushCallback = undefined;
        };
      },
    };
    mount(transport);
    await waitFor(() => expect(bridgeRef?.connected).toBe(true));
    await waitFor(() => expect(pushCallback).toBeDefined());

    const received: unknown[] = [];
    busRef!.on(`UI:${ORBITAL}.PushTrait.PUSHED`, (event) => {
      received.push(event.payload);
    });

    act(() => {
      pushCallback!({
        event: 'PUSHED',
        payload: { value: 42 },
        source: { orbital: ORBITAL, trait: 'PushTrait' },
      });
    });

    expect(received).toEqual([{ value: 42 }]);
  });
});
