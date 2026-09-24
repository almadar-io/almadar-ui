// @vitest-environment jsdom
/**
 * Boot order (owner report 2026-09-24: riya falls through the ground): a
 * trait never receives a routed event before its own INIT has run on this
 * mount. SineLevelData's INIT seeds RIYA_LEVEL_DATA -> RiyaSinePlay ->
 * SINE_SET_SKATE_CURVE -> SineBody; if that lands before SineBody's own INIT,
 * the INIT resets skateCurve/platforms to config defaults and riya has no
 * ground. Both topologies.
 */
import { afterEach, describe, it, expect } from 'vitest';
import { clearVerification, getTraitSnapshots, getTransitionsForTrait } from '../../lib/verificationRegistry';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
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

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveOrb(orbPath: string): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(orbPath, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
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
function harness(s: OrbitalSchema, topology: 'stateful' | 'stateless', page: string): Harness {
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
    element: <OrbPreview schema={s} transport={transport} initialPagePath={page} isolated />,
    persistence,
    ready,
  };
}

const SINE = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/riya/atoms/riya-level-sine.orb');

afterEach(() => {
  cleanup();
  clearVerification();
});

describe.each(['stateful', 'stateless'] as const)('riya-sine boot (%s)', (topology) => {
  it('SineBody runs INIT before it receives its seeded skate curve', async () => {
    const h = harness(await resolveOrb(SINE), topology, '/riya-sine');
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => expect(getTransitionsForTrait('SineBody').map((t) => t.event)).toContain('SINE_SET_SKATE_CURVE'), { timeout: 20_000 });
    await waitFor(() => expect(getTransitionsForTrait('SineBody').map((t) => t.event)).toContain('INIT'), { timeout: 10_000 });
    const order = getTransitionsForTrait('SineBody').map((t) => t.event);
    expect(order.indexOf('INIT')).toBeLessThan(order.lastIndexOf('SINE_SET_SKATE_CURVE'));
    expect(order.lastIndexOf('INIT')).toBeLessThan(order.lastIndexOf('SINE_SET_SKATE_CURVE'));
  }, 60_000);

  it('after boot settles, SineBody holds its skate curve and platforms (riya has ground)', async () => {
    const h = harness(await resolveOrb(SINE), topology, '/riya-sine');
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => expect(getTransitionsForTrait('SineBody').map((t) => t.event)).toContain('SINE_SET_SKATE_CURVE'), { timeout: 20_000 });
    await new Promise((r) => setTimeout(r, 2000));
    const body = getTraitSnapshots().find((s) => s.traitName === 'SineBody');
    const row = Object.values(body?.data ?? {})[0]?.[0];
    const curve = row?.['skateCurve'];
    const platforms = row?.['platforms'];
    expect(Array.isArray(curve) ? curve.length : 0).toBeGreaterThan(0);
    expect(Array.isArray(platforms) ? platforms.length : 0).toBeGreaterThan(0);
  }, 60_000);

  it('holding ArrowRight moves riya right', async () => {
    const h = harness(await resolveOrb(SINE), topology, '/riya-sine');
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => expect(getTransitionsForTrait('SineBody').map((t) => t.event)).toContain('SINE_SET_SKATE_CURVE'), { timeout: 20_000 });
    await new Promise((r) => setTimeout(r, 1500));
    const bodyX = (): number => {
      const row = Object.values(getTraitSnapshots().find((s) => s.traitName === 'SineBody')?.data ?? {})[0]?.[0];
      const body = row?.['body'];
      const x = body !== null && typeof body === 'object' && !Array.isArray(body) && !(body instanceof Date) ? body['x'] : undefined;
      return typeof x === 'number' ? x : NaN;
    };
    fireEvent.click(await screen.findByText('Skip', {}, { timeout: 10_000 }));
    await new Promise((r) => setTimeout(r, 500));
    const before = bodyX();
    // A held key: the math-canvas keyMap re-emits the RIGHT intent on every
    // auto-repeat keydown (hold-to-run — each STEER re-sets vx).
    for (let i = 0; i < 20; i += 1) {
      act(() => {
        window.__orbitalVerification?.sendEvent?.('SINE_RIGHT', {}, 'RiyaSineOrbital.RiyaSinePlay');
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(Number.isFinite(before)).toBe(true);
    expect(bodyX()).toBeGreaterThan(before + 0.5);
  }, 60_000);
});

