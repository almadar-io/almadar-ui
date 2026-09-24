// @vitest-environment jsdom
/**
 * std-realtime-chat, real organism, BOTH topologies (owner's most critical
 * report): (1) the conversation rail lists the seeded mock memberships,
 * (2) picking a conversation opens it, (3) sending a message persists it and
 * it appears in the thread. Stateful = BrowserPlayground (OrbitalServerRuntime
 * in-process); stateless = OrbPreview over a fresh-manager-per-request
 * evaluator carrying circuit state (the hosted playground topology).
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const CHAT_ORB = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/app/organisms/std-realtime-chat.orb');
// project-friday imports std-realtime-chat's whole ChatMessageOrbital.
const PF_ORB = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/project-friday/organisms/project-friday.orb');

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveChat(orbPath: string = CHAT_ORB): Promise<OrbitalSchema> {
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
    element: <OrbPreview schema={s} transport={transport} initialPagePath="/chat" isolated />,
    persistence,
    ready,
  };
}

/** Seed one known message into the conversation the rail auto-opens (the
 *  viewer's most recent membership). */
async function seedMessageInOpenConversation(h: Harness, content: string): Promise<void> {
  await h.ready;
  const memberships = (await h.persistence.list('ChannelMember'))
    .filter((m) => m['member'] === 'viewer-1')
    .sort((a, b) => String(b['lastMessageAt'] ?? '').localeCompare(String(a['lastMessageAt'] ?? '')));
  const channel = memberships[0]?.['channel'];
  if (typeof channel !== 'string') throw new Error('seed has no viewer membership');
  await h.persistence.create('ChatMessage', { channel, content, sender: 'viewer-1', senderName: 'Dev Viewer', timestamp: '2026-09-24T00:00:00.000Z' });
}

const topologies: Array<['stateful' | 'stateless', string]> = [
  ['stateful', CHAT_ORB],
  ['stateless', CHAT_ORB],
  ['stateful', PF_ORB],
  ['stateless', PF_ORB],
].filter(([, p]) => existsSync(p)) as Array<['stateful' | 'stateless', string]>;

describe.each(topologies)('chat (%s, %s)', (topology, orbPath) => {
  it('lists the seeded conversations in the rail', async () => {
    const h = harness(await resolveChat(orbPath), topology);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => {
      expect(screen.queryByText('No conversations yet.')).toBeNull();
      expect(screen.getAllByText(/^# /).length).toBeGreaterThan(0);
    }, { timeout: 15_000 });
  }, 60_000);

  it('the auto-opened conversation shows its seeded messages', async () => {
    const h = harness(await resolveChat(orbPath), topology);
    await seedMessageInOpenConversation(h, 'hello from seed');
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await screen.findByText('hello from seed', {}, { timeout: 15_000 });
  }, 60_000);

  it('clicking another conversation in the rail opens it', async () => {
    const h = harness(await resolveChat(orbPath), topology);
    await h.ready;
    const memberships = (await h.persistence.list('ChannelMember')).filter((m) => m['member'] === 'viewer-1')
      .sort((a, b) => String(b['lastMessageAt'] ?? '').localeCompare(String(a['lastMessageAt'] ?? '')));
    const other = memberships[memberships.length - 1];
    await h.persistence.create('ChatMessage', { channel: other['channel'], content: 'in the other room', sender: 'viewer-1', senderName: 'Dev Viewer', timestamp: '2026-09-24T00:00:00.000Z' });
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const title = other['isDirect'] === true ? String(other['channelName']) : `# ${String(other['channelName'])}`;
    fireEvent.click(await screen.findByText(title, {}, { timeout: 15_000 }));
    await screen.findByText('in the other room', {}, { timeout: 15_000 });
  }, 60_000);

  it('typing and pressing Send shows the message in the thread', async () => {
    const h = harness(await resolveChat(orbPath), topology);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText(/^# /).length).toBeGreaterThan(0), { timeout: 15_000 });
    const box = await screen.findByPlaceholderText('Write a message…', {}, { timeout: 15_000 });
    fireEvent.change(box, { target: { value: 'typed and sent' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));
    await screen.findByText('typed and sent', {}, { timeout: 15_000 });
  }, 60_000);

  it('a second message sends too (without leaving the page)', async () => {
    const h = harness(await resolveChat(orbPath), topology);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const box = await screen.findByPlaceholderText('Write a message…', {}, { timeout: 15_000 });
    for (const text of ['first of two', 'second of two']) {
      fireEvent.change(box, { target: { value: text } });
      fireEvent.click(screen.getByRole('button', { name: /Send/ }));
      await screen.findByText(text, {}, { timeout: 15_000 });
    }
  }, 60_000);
});
