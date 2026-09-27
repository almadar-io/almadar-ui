// @vitest-environment jsdom
/**
 * project-friday /global-search (G-RUNTIME-041), real organism, BOTH
 * topologies: typing a query fans it out to every configured module and the
 * grouped results render under each module's heading. Stateful = an
 * in-process OrbitalServerRuntime; stateless = a fresh-manager-per-request
 * evaluator carrying circuit state (the hosted playground topology).
 */
import { describe, it } from 'vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EntityRow, OrbitalSchema } from '@almadar/core';
import {
  buildTraitIndex,
  createInProcessTransport,
  createIndexStageRunner,
  evaluateOrbitalEvent,
  MockPersistenceAdapter,
  preprocessSchema,
  StateMachineManager,
} from '@almadar/runtime';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import { OrbPreview } from '../OrbPreview';
import { IO_ROOT, STD_ROOT } from '../../test/helpers/behavior-packages';

// project-friday imports std-realtime-chat's whole ChatMessageOrbital.
const PF_ORB = join(IO_ROOT, 'behaviors/registry/project-friday/organisms/project-friday.orb');
const topologies = ['stateful', 'stateless'] as const;

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveChat(orbPath: string): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(orbPath, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: IO_ROOT,
    stdLibPath: STD_ROOT,
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

interface Harness {
  element: React.ReactElement;
  persistence: MockPersistenceAdapter;
  ready: Promise<void>;
}

/** One seeded store per test (viewer-owned memberships, as the hosted store's
 *  owner overlay provides) behind either topology. */
function harness(s: OrbitalSchema, topology: 'stateful' | 'stateless'): Harness {
  const persistence = new MockPersistenceAdapter({ ownerId: 'viewer-1', ownerFields: ['ChannelMember.member'] });
  const runtime = new OrbitalServerRuntime({ mode: 'mock', debug: false, persistence });
  const ready = runtime.register(s);
  const user = runtime.getDefaultUser();
  const traitIndex = buildTraitIndex(s.orbitals);
  const transport = topology === 'stateful'
    ? createInProcessTransport(async (orbital, request) => {
      await ready;
      return runtime.processOrbitalEvent(orbital, request);
    })
    : createInProcessTransport(async (_orbital, request) => {
      await ready;
      const manager = new StateMachineManager([...traitIndex.byName.values()].map((e) => e.traitDef));
      const frames = new Map<string, EntityRow>();
      return evaluateOrbitalEvent(
        {
          traitIndex,
          manager,
          persistence,
          frames,
          runEffects: createIndexStageRunner({ traitIndex, persistence, frames, manager, schema: s }),
          runtimeRowSentinel: true,
          ...(user !== undefined ? { user } : {}),
        },
        request,
      );
    }, { carriesCircuitState: true });
  return {
    element: <OrbPreview schema={s} transport={transport} initialPagePath="/global-search" isolated />,
    persistence,
    ready,
  };
}


describe.each(topologies)('project-friday global search (%s)', (topology) => {
  it('a query renders every module group', async () => {
    const h = harness(await resolveChat(PF_ORB), topology);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const box = await screen.findByPlaceholderText('Search tasks, clients, chat, assets, comments…', {}, { timeout: 20_000 });
    fireEvent.change(box, { target: { value: 'e' } });
    for (const moduleKey of ['tasks', 'clients', 'messages', 'assets', 'comments']) {
      await screen.findByText(moduleKey, {}, { timeout: 20_000 });
    }
  }, 90_000);
});
