// @vitest-environment jsdom
/**
 * Top-priority ledger entries reproduced through the real OrbPreview, both
 * topologies (stateful OrbitalServerRuntime / stateless fresh-manager host):
 * G-RUNTIME-045 (storefront stats paint their INIT zeros), G-RUNTIME-004
 * (std-menu's inline Delete sends the default row after OPEN_ITEM) and
 * G-UI-019 (the pitch deck's game form never reaches its read-back panel),
 * G-RUNTIME-009 (the riya open world drops keyboard intake on most loads).
 */
import { describe, expect, it } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clearVerification, getTransitions } from '../../lib/verificationRegistry';
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
const IO = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry');
const STOREFRONT = join(IO, 'marketing/organisms/std-storefront.orb');
const MENU = join(IO, 'app/atoms/std-menu.orb');
const DRIVER = join(IO, 'app/atoms/std-driver.orb');
const APPROVAL = join(IO, 'app/atoms/std-approval-chain.orb');
const PITCH = join(IO, 'websites/organisms/std-almadar-pitch.orb');
const RIYA_OW = join(IO, 'riya/organisms/riya-game-platformer-open-world.orb');

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;
class IntersectionObserverStub {
  constructor(private readonly callback: (entries: Array<{ isIntersecting: boolean; target: Element }>) => void) {}
  observe(target: Element): void { this.callback([{ isIntersecting: true, target }]); }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] { return []; }
}
(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver ??= IntersectionObserverStub;

async function resolve(orbPath: string): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(orbPath, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

type Topology = 'stateful' | 'stateless';

function harness(s: OrbitalSchema, topology: Topology, path: string) {
  const persistence = new MockPersistenceAdapter({ ownerId: 'viewer-1' });
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
  return { element: <OrbPreview schema={s} transport={transport} initialPagePath={path} isolated />, persistence, ready };
}

const topologies: Topology[] = ['stateful', 'stateless'];

describe.each(topologies.filter(() => existsSync(STOREFRONT)))('G-RUNTIME-045 storefront stats (%s)', (topology) => {
  it('the Products card shows the loaded catalog count, not the INIT zero', async () => {
    const h = harness(await resolve(STOREFRONT), topology, '/');
    await h.ready;
    const total = (await h.persistence.list('Product')).length;
    expect(total).toBeGreaterThan(0);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const label = await screen.findByText('Products', {}, { timeout: 30_000 });
    const card = label.closest('[data-pattern="stat-display"]') ?? label.parentElement?.parentElement ?? label;
    await waitFor(() => expect(within(card as HTMLElement).queryByText(String(total))).not.toBeNull(), { timeout: 20_000 });
  }, 120_000);
});

describe.each(topologies.filter(() => existsSync(MENU)))('G-RUNTIME-004 std-menu opened item (%s)', (topology) => {
  it('the detail shows the opened item and its Delete removes it', async () => {
    const h = harness(await resolve(MENU), topology, '/menu/manage');
    await h.ready;
    const before = await h.persistence.list('MenuItem');
    expect(before.length).toBeGreaterThan(1);
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const overflow = await screen.findAllByRole('button', { name: /actions/i }, { timeout: 30_000 });
    fireEvent.click(overflow[0]);
    fireEvent.click(await screen.findByText(/^open$/i, {}, { timeout: 10_000 }));
    const toggle = await screen.findByRole('button', { name: /toggle available/i }, { timeout: 20_000 });
    // The detail shows the opened item, not the entity's defaults.
    const opened = (await h.persistence.list('MenuItem')).find((r) => typeof r['name'] === 'string' && screen.queryAllByText(String(r['name'])).length > 0);
    expect(opened).toBeDefined();
    const deletes = screen.getAllByRole('button', { name: /delete/i })
      .filter((b) => toggle.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (deletes.length === 0) throw new Error('no Delete in the opened item');
    fireEvent.click(deletes[0]);
    await waitFor(async () => expect((await h.persistence.list('MenuItem')).length).toBe(before.length - 1), { timeout: 20_000 });
  }, 120_000);
});

describe.each(topologies.filter(() => existsSync(PITCH)))('G-UI-019 pitch game read-back (%s)', (topology) => {
  it('saving the game form opens the read-back with the typed workplace', async () => {
    const h = harness(await resolve(PITCH), topology, '/');
    const { container } = render(<MemoryRouter>{h.element}</MemoryRouter>);
    for (let i = 0; i < 2; i++) {
      const next = await screen.findAllByRole('button', {}, { timeout: 30_000 });
      const forward = next.find((b) => b.querySelector('svg.lucide-chevron-right') !== null && !b.hasAttribute('disabled'));
      if (!forward) throw new Error('no next button');
      fireEvent.click(forward);
    }
    await screen.findByText(/name a workplace/i, {}, { timeout: 20_000 });
    const workplace = container.querySelector('input[name="workplace"], textarea[name="workplace"]');
    if (!workplace) throw new Error('no workplace input');
    fireEvent.change(workplace, { target: { value: 'Harbor Bakery' } });
    const submit = screen.getAllByRole('button').find((b) => b.getAttribute('type') === 'submit');
    if (!submit) throw new Error('no submit');
    fireEvent.click(submit);
    await screen.findByText('Harbor Bakery', { selector: ':not(input)' }, { timeout: 20_000 });
  }, 120_000);
});

describe.each(topologies.filter(() => existsSync(RIYA_OW)))('G-RUNTIME-009 riya open world keyboard intake (%s)', (topology) => {
  it('ArrowRight reaches the play trait on every one of 6 fresh loads', async () => {
    const s = await resolve(RIYA_OW);
    const missed: number[] = [];
    for (let load = 0; load < 6; load++) {
      clearVerification();
      const h = harness(s, topology, '/riya-open-world');
      render(<MemoryRouter>{h.element}</MemoryRouter>);
      await waitFor(() => expect(getTransitions().some((t) => t.traitName.endsWith('OwPlay'))).toBe(true), { timeout: 30_000 });
      await new Promise((r) => setTimeout(r, 800));
      act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true })); });
      try {
        await waitFor(() => expect(getTransitions().some((t) => t.traitName.endsWith('OwPlay') && t.event === 'OW_RIGHT')).toBe(true), { timeout: 5_000 });
      } catch {
        missed.push(load);
      }
      cleanup();
    }
    expect(missed).toEqual([]);
  }, 400_000);
});

describe.each(topologies.filter(() => existsSync(DRIVER)))('G-RUNTIME-004 std-driver opened driver (%s)', (topology) => {
  it('the detail shows the opened driver and its Suspend saves on that driver', async () => {
    const h = harness(await resolve(DRIVER), topology, '/drivers');
    await h.ready;
    const [first] = await h.persistence.list('Driver');
    await h.persistence.update('Driver', String(first['id']), { status: 'active' });
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    const overflow = await screen.findAllByRole('button', { name: /actions/i }, { timeout: 30_000 });
    fireEvent.click(overflow[0]);
    fireEvent.click(await screen.findByText(/^open$/i, {}, { timeout: 10_000 }));
    const suspend = await screen.findByRole('button', { name: /^suspend$/i }, { timeout: 20_000 });
    const openedId = String(first['id']);
    const shown = screen.queryAllByText(String(first['title'])).length > 0;
    expect(shown).toBe(true);
    fireEvent.click(suspend);
    await waitFor(async () => expect((await h.persistence.getById('Driver', openedId))?.['status']).toBe('suspended'), { timeout: 20_000 });
  }, 120_000);
});

describe.each(topologies.filter(() => existsSync(APPROVAL)))('G-ORB-COMPILER-041 approval chain step display (%s)', (topology) => {
  it('advancing shows the next step, not the mounted one', async () => {
    const h = harness(await resolve(APPROVAL), topology, '/approval-chain');
    render(<MemoryRouter>{h.element}</MemoryRouter>);
    // The progress bar lists every step; the current step is the card's heading.
    await screen.findByRole('heading', { name: 'Manager Review' }, { timeout: 30_000 });
    fireEvent.click(await screen.findByRole('button', { name: /approve & continue/i }, { timeout: 10_000 }));
    await screen.findByRole('heading', { name: 'Finance Approval' }, { timeout: 20_000 });
    expect(screen.queryByRole('heading', { name: 'Manager Review' })).toBeNull();
  }, 120_000);
});
