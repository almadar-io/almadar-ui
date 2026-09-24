// @vitest-environment jsdom
/**
 * Game keyboard input (std-snake, std-pong), real organisms, BOTH topologies:
 * the canvas's `keyMap` turns a window keydown into its semantic event
 * (ArrowUp -> UP, KeyW -> LEFT_UP); the play trait turns it into an intent
 * (TURN, PADDLE_MOVE) and the game's MECHANIC must run it — the observable
 * consequence (the snake turns, the paddle moves). Owner report: keyboard
 * does nothing in games under runtime-verify --catalog.
 */
import { describe, it, expect } from 'vitest';
import { getTransitionsForTrait } from '../../lib/verificationRegistry';
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
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

const GAMES_DIR = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/game/organisms');
const GAMES = [
  { orb: join(GAMES_DIR, 'std-snake.orb'), page: '/snake', code: 'ArrowUp', trait: 'SnakeMechanic', event: 'TURN' },
  { orb: join(GAMES_DIR, 'std-pong.orb'), page: '/pong', code: 'KeyW', trait: 'PongMechanic', event: 'PADDLE_MOVE' },
].filter((g) => existsSync(g.orb));
const cases = GAMES.flatMap((g) => (['stateful', 'stateless'] as const).map((topology) => ({ ...g, topology })));

describe.each(cases)('$page keyboard ($topology)', ({ orb, page, code, trait, event, topology }) => {
  it(`${code} runs ${trait}.${event}`, async () => {
    const h = harness(await resolveOrb(orb), topology, page);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => expect(getTransitionsForTrait(trait).length).toBeGreaterThan(0), { timeout: 15_000 });
    // The canvas registers its window keydown listener once its drawables mount.
    await new Promise((r) => setTimeout(r, 1500));
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
    });
    await waitFor(() => expect(getTransitionsForTrait(trait).map((t) => t.event)).toContain(event), { timeout: 10_000 });
  }, 60_000);
});
