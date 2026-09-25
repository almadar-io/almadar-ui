// @vitest-environment jsdom
/**
 * G-APPS-002: the orb site's hero demo mounts riya-game-platformer through
 * `BrowserPlayground` (mode "mock"). Picking a level must leave the menu and
 * start that level — on @almadar/ui 6.33.0 the menu kept the `main` slot.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrbitalSchema } from '@almadar/core';
import { preprocessSchema } from '@almadar/runtime';
import { BrowserPlayground } from '../BrowserPlayground';
import { clearVerification, getTransitionsForTrait } from '../../lib/verificationRegistry';

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');
const RIYA = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/riya/organisms/riya-game-platformer.orb');

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveRiya(): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(RIYA, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

describe.skipIf(!existsSync(RIYA))('riya hero demo level pick', () => {
  it('picking "1 · The Plain" leaves the menu and starts the level', async () => {
    clearVerification();
    render(<BrowserPlayground schema={await resolveRiya()} mode="mock" height="600px" />);
    fireEvent.click(await screen.findByRole('button', { name: /1 · The Plain/ }, { timeout: 20_000 }));
    await waitFor(() => expect(getTransitionsForTrait('RiyaPlainPlay').map((t) => t.event)).toContain('INIT'), { timeout: 20_000 });
    await waitFor(() => expect(screen.queryByRole('button', { name: /2 · The Ramp/ })).toBeNull(), { timeout: 10_000 });
  }, 90_000);
});
