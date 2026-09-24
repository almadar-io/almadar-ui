// @vitest-environment jsdom
/**
 * Real-organism click wire — std-api-gateway's "Create Route" button
 * (the listen-source event class, verified against production schema).
 *
 * RouteCatalog renders the toolbar's create Button (`action=CREATE`) but
 * declares NO CREATE transition; RouteCreate
 * `listens { RouteCatalog CREATE -> CREATE }` and its CREATE transition
 * renders the "New Route" form. The click must travel: Button emit →
 * scope-chain fan onto `UI:RouteOrbital.RouteCatalog.CREATE` →
 * `useBusIngress`'s listen-source subscription → kernel dispatch →
 * RouteCreate's arm → the form's render-ui in the DOM.
 *
 * Schema resolves through the REAL pipeline (`preprocessSchema` — the same
 * call the catalog server makes). No mocks.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrbitalSchema } from '@almadar/core';
import { preprocessSchema } from '@almadar/runtime';
import { BrowserPlayground } from '../BrowserPlayground';

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');
const GATEWAY_ORB = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/app/organisms/std-api-gateway.orb');
const canRunGateway = existsSync(GATEWAY_ORB);

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveGateway(): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(GATEWAY_ORB, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

// G-RUNTIME-037: the catalog slot used to collapse to the error box because the
// renderer rejected filter-group's declared-string `entity` prop by NAME.
describe('std-api-gateway — Create Route button opens the form', () => {
  it('clicking the toolbar create button renders the "New Route" form', async () => {
    const schema = await resolveGateway();
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema} fit />
      </MemoryRouter>,
    );

    // The catalog toolbar's create Button (`action=CREATE`) — addressed by its
    // action test id, never by position.
    const createButton = await screen.findByTestId('action-CREATE', {}, { timeout: 15_000 });
    expect(screen.queryByText('New Route')).toBeNull();

    fireEvent.click(createButton);
    await waitFor(() => expect(screen.queryByText('New Route')).not.toBeNull(), { timeout: 5_000 });
  }, 60_000);
});
