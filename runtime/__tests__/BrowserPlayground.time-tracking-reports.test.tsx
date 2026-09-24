// @vitest-environment jsdom
/**
 * G-RUNTIME-012 — std-time-tracking /reports: the stat tiles and chart show 0
 * although the aggregators' fetches return rows. Real organism through the
 * real preprocessSchema + BrowserPlayground tree (in-process runtime, mock
 * persistence seeds Timesheet rows with non-zero totalHours).
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrbitalSchema } from '@almadar/core';
import { preprocessSchema } from '@almadar/runtime';
import { BrowserPlayground } from '../BrowserPlayground';

const REPO_ROOT = join(__dirname, '..', '..', '..', '..');
const TT_ORB = join(REPO_ROOT, 'packages/almadar-behaviors/behaviors/registry/app/organisms/std-time-tracking.orb');
const canRun = existsSync(TT_ORB);

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveTimeTracking(): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(TT_ORB, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, {
    basePath: join(REPO_ROOT, 'packages/almadar-behaviors'),
    stdLibPath: join(REPO_ROOT, 'packages/almadar-std'),
    allowOutsideBasePath: true,
  });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}


describe('std-time-tracking /reports — stat tiles show aggregated values', () => {
  it('Total Hours tile renders the sum of seeded timesheet hours, not 0', async () => {
    const schema = await resolveTimeTracking();
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema} initialPagePath="/reports" fit />
      </MemoryRouter>,
    );
    const label = await screen.findByText('Total Hours', {}, { timeout: 15_000 });
    const tile = label.closest('[data-pattern]') ?? label.parentElement?.parentElement ?? label;
    await waitFor(() => {
      const text = tile.textContent ?? '';
      const value = Number(text.replace('Total Hours', '').replace(/[^0-9.]/g, ''));
      expect(value).toBeGreaterThan(0);
    }, { timeout: 10_000 });
  }, 60_000);

  it('Billable vs Non-Billable chart renders the grouped hours, not an empty "0"', async () => {
    const schema = await resolveTimeTracking();
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema} initialPagePath="/reports" fit />
      </MemoryRouter>,
    );
    const title = await screen.findByText('Billable vs Non-Billable Hours', {}, { timeout: 15_000 });
    const card = title.closest('[data-pattern]') ?? title.parentElement?.parentElement ?? title;
    await waitFor(() => {
      const text = (card.textContent ?? '').replace('Billable vs Non-Billable Hours', '');
      expect(text).not.toMatch(/Active:|Pending:|Inactive:/);
      expect(text).toMatch(/true|false/);
    }, { timeout: 10_000 });
  }, 60_000);
});
