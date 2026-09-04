// @vitest-environment jsdom
/**
 * OrbitalPluginHost — real `OrbitalServerRuntime` end to end (Almadar Studio
 * V4 §14 plan, P2 F1/F5). A minimal 2-state `PingOrbital` schema stands in
 * for a `.lolo` plugin: `IDLE --PING--> PONGED` echoes both its own trigger
 * (dropped by the echo guard) and `PONG` (re-emitted), and persists a
 * `PingRecord` row so the default-vs-`deny:['persist']` behavior is real.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { EventBusProvider } from '../providers/EventBusProvider';
import { useEventBus, type EventBusContextType } from '../hooks/useEventBus';
import { UISlotProvider } from '../providers/UISlotContext';
import {
  OrbitalPluginHost,
  useOrbitalPluginHost,
  useDeclaredCaptureTable,
  type PluginHostPlugin,
} from '../runtime/OrbitalPluginHost';

function pingSchema(): OrbitalSchema {
  return {
    name: 'ping-plugin',
    orbitals: [
      {
        name: 'PingOrbital',
        entity: { name: 'PingerData', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
        pages: [],
        traits: [
          {
            name: 'Pinger',
            scope: 'instance',
            linkedEntity: 'PingerData',
            stateMachine: {
              states: [{ name: 'IDLE', isInitial: true }, { name: 'PONGED' }],
              events: [{ key: 'PING', name: 'PING' }, { key: 'RESET', name: 'RESET' }],
              transitions: [
                {
                  from: 'IDLE',
                  to: 'PONGED',
                  event: 'PING',
                  effects: [
                    ['emit', 'PING', {}],
                    ['emit', 'PONG', {}],
                    ['persist', 'create', 'PingRecord', {}],
                  ],
                },
                { from: 'PONGED', to: 'IDLE', event: 'RESET', effects: [] },
              ],
            },
            emits: [{ event: 'PONG', scope: 'external' }],
            listens: [{ event: 'PING', triggers: 'PING' }, { event: 'RESET', triggers: 'RESET' }],
            config: {
              keymap: { type: 'map', default: { IDLE: ['p'], PONGED: ['r'] } },
            },
          },
        ],
      },
    ],
  };
}

function pingPlugin(): PluginHostPlugin {
  return {
    id: 'ping',
    schema: pingSchema(),
    inbound: [{ busEvent: 'PING', orbital: 'PingOrbital', trait: 'Pinger', trigger: 'PING' }],
  };
}

function CaptureTableProbe() {
  const table = useDeclaredCaptureTable({ pluginId: 'ping', orbital: 'PingOrbital', trait: 'Pinger' });
  return <div data-testid="capture-table" data-json={JSON.stringify({ ...table.shell, keys: Array.from(table.shell.keys) })} />;
}

function renderHost(opts: { deny?: Array<'persist' | 'call-service' | 'navigate' | 'notify'>; onTransition?: (...args: unknown[]) => void; withCaptureTable?: boolean } = {}) {
  const onTransition = opts.onTransition ?? vi.fn();
  let bus!: EventBusContextType;
  function BusGrabber() {
    bus = useEventBus();
    return null;
  }
  let getHost!: ReturnType<typeof useOrbitalPluginHost>;
  function HostGrabber() {
    getHost = useOrbitalPluginHost();
    return null;
  }
  const utils = render(
    <EventBusProvider isolated>
      <UISlotProvider>
        <OrbitalPluginHost plugins={[pingPlugin()]} deny={opts.deny} onTransition={onTransition}>
          <BusGrabber />
          <HostGrabber />
          {opts.withCaptureTable ? <CaptureTableProbe /> : null}
        </OrbitalPluginHost>
      </UISlotProvider>
    </EventBusProvider>,
  );
  return { bus, host: () => getHost, onTransition, ...utils };
}

describe('OrbitalPluginHost', () => {
  it('dispatches an inbound bus event through the real runtime and re-emits PONG with source, dropping the PING echo', async () => {
    const { bus } = renderHost();
    const pongListener = vi.fn();
    const pingListener = vi.fn();
    bus.on('UI:PONG', pongListener);
    bus.on('UI:PING', pingListener);

    bus.emit('UI:PING', {});
    expect(pingListener).toHaveBeenCalledTimes(1); // our own manual emit

    await waitFor(() => expect(pongListener).toHaveBeenCalledTimes(1));

    expect(pongListener.mock.calls[0][0].source?.orbital).toBe('PingOrbital');
    expect(pingListener).toHaveBeenCalledTimes(1); // no bounce from the echo guard
  });

  it('reflects the transition through useOrbitalPluginHost().getState and calls onTransition', async () => {
    const { bus, host, onTransition } = renderHost();

    await waitFor(() => expect(host().getState('ping', 'PingOrbital', 'Pinger')?.currentState).toBe('IDLE'));

    bus.emit('UI:PING', {});

    await waitFor(() => expect(host().getState('ping', 'PingOrbital', 'Pinger')?.currentState).toBe('PONGED'));
    expect(onTransition).toHaveBeenCalledWith('ping', 'PingOrbital', 'Pinger', 'PONGED');
  });

  it('default (no deny) persists successfully and still transitions', async () => {
    const { bus, host } = renderHost();

    bus.emit('UI:PING', {});

    await waitFor(() => expect(host().getState('ping', 'PingOrbital', 'Pinger')?.currentState).toBe('PONGED'));
    expect(host().errors.ping).toBeUndefined();
  });

  it('deny:["persist"] logs and still transitions (never throws)', async () => {
    const { bus, host } = renderHost({ deny: ['persist'] });

    bus.emit('UI:PING', {});

    await waitFor(() => expect(host().getState('ping', 'PingOrbital', 'Pinger')?.currentState).toBe('PONGED'));
    expect(host().errors.ping).toBeUndefined();
  });

  it('useDeclaredCaptureTable follows currentState through the declared keymap config', async () => {
    const { bus, getByTestId } = renderHost({ withCaptureTable: true });

    const readTable = () => JSON.parse(getByTestId('capture-table').dataset.json ?? '{}') as { mode: string; keys: string[] };

    await waitFor(() => expect(readTable().mode).toBe('IDLE'));
    expect(readTable().keys).toEqual(['p']);

    bus.emit('UI:PING', {});

    await waitFor(() => expect(readTable().mode).toBe('PONGED'));
    expect(readTable().keys).toEqual(['r']);
  });
});
