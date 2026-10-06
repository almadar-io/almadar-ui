/**
 * A preview of one program can sit inside another program's server bridge (the Studio
 * shell is a program and the app preview renders inside it). The inner preview must
 * register and run its own program; only a lazy page of the same program reuses the
 * bridge above it (see OrbPreview.lazy-pages.test.tsx).
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema } from '@almadar/core';
import { createInProcessTransport, type EventTransport } from '@almadar/runtime';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import { OrbPreview } from '../OrbPreview';
import { ServerBridgeProvider } from '../../providers/ServerBridge';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function program(name: string, text: string): OrbitalSchema {
  return {
    name,
    orbitals: [{
      name: `${name}Orbital`,
      entity: { name: `${name}State`, persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
      traits: [{
        name: `${name}View`,
        scope: 'instance',
        linkedEntity: `${name}State`,
        stateMachine: {
          states: [{ name: 'idle', isInitial: true }],
          events: [],
          transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: text }]] }],
        },
      }],
      pages: [{ name: `${name}Page`, path: '/', traits: [{ ref: `${name}View` }] }],
    }],
  } as OrbitalSchema;
}

const shell = program('shell', 'Studio chrome');
const app = program('app', 'Notes');

async function transportFor(schema: OrbitalSchema, lifecycle: string[]): Promise<EventTransport> {
  const runtime = new OrbitalServerRuntime();
  await runtime.register(schema);
  return createInProcessTransport((orbital, request) => runtime.processOrbitalEvent(orbital, request), {
    onRegister: (s) => { lifecycle.push(`register ${s.name}`); },
    onUnregister: () => { lifecycle.push('unregister'); },
  });
}

describe('a preview inside another program\'s bridge', () => {
  it('registers and runs its own program', async () => {
    const shellLife: string[] = [];
    const appLife: string[] = [];
    const shellTransport = await transportFor(shell, shellLife);
    const appTransport = await transportFor(app, appLife);
    render(
      <MemoryRouter>
        <ServerBridgeProvider schema={shell} transport={shellTransport}>
          <OrbPreview schema={app} transport={appTransport} isolated />
        </ServerBridgeProvider>
      </MemoryRouter>,
    );
    await screen.findByText('Notes', {}, { timeout: 10_000 });
    expect(appLife).toEqual(['register app']);
    expect(shellLife).toEqual(['register shell']);
  }, 30_000);

  it('control: a preview with no bridge above registers its program once', async () => {
    const appLife: string[] = [];
    render(
      <MemoryRouter>
        <OrbPreview schema={app} transport={await transportFor(app, appLife)} isolated />
      </MemoryRouter>,
    );
    await screen.findByText('Notes', {}, { timeout: 10_000 });
    expect(appLife).toEqual(['register app']);
  }, 30_000);
});
