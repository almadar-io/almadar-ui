// @vitest-environment jsdom
/**
 * G-UI-012 reproduction, component level: the REAL resolved std-snake must
 * render exactly ONE game shell — SnakePlay's `main` stack embedding
 * SnakeShell's frame (canvas + HUD inside it). The live symptom (both
 * playground paths, 2026-09-23) is THREE side-by-side game-shell panels:
 * embedded traits' render-ui landing in the shared `main` slot under their
 * OWN scope instead of their per-trait sidecar — which also starves WASD,
 * because a canvas rendered under SnakeCanvas's scope alone never bubbles
 * its keyMap emit to SnakePlay's subscribed key (see
 * test/game-keyboard-routing.test.ts for the circuit contract).
 *
 * The schema runs through the REAL pipeline (`preprocessSchema`, the same
 * call the catalog server makes) and mounts through `BrowserPlayground` —
 * the exact production tree (OrbitalServerRuntime in-process →
 * createInProcessTransport → OrbPreview → TraitFrame nesting). No mocks.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrbitalSchema } from '@almadar/core';
import { preprocessSchema } from '@almadar/runtime';
import { BrowserPlayground } from '../BrowserPlayground';

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');
const SNAKE_ORB = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/game/organisms/std-snake.orb');
const canRunSnake = existsSync(SNAKE_ORB);

// jsdom has no ResizeObserver (the shell/canvas measure with it).
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveSnake(): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(SNAKE_ORB, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

describe.skipIf(!canRunSnake)('std-snake render — exactly one game shell (G-UI-012)', () => {
  it('INIT renders a single shell: embedded canvas/hud stay in the sidecar, not extra main panels', async () => {
    const schema = await resolveSnake();
    render(<BrowserPlayground schema={schema} fit />);

    // The shell HUD carries the appName from SnakeShell's call-site config.
    await screen.findByText('Snake', undefined, { timeout: 10_000 });

    // Exactly one shell ⇒ exactly one HUD appName. Three panels (the live
    // symptom) render three.
    await waitFor(
      () => expect(screen.getAllByText('Snake').length).toBe(1),
      { timeout: 10_000 },
    );
  }, 30_000);
});
