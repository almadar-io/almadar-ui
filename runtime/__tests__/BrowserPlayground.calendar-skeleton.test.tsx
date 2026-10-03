// @vitest-environment jsdom
/**
 * std-calendar in the in-browser playground (orb.almadar.io's /playground
 * default): its loading arm paints `{ type: skeleton }` and the loaded arm then
 * paints the calendar body. The body must REPLACE the skeleton — a skeleton
 * node carrying the body's raw `children` threw React #31 ("objects are not
 * valid as a React child") and the slot fell to the error boundary.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { OrbitalSchema } from '@almadar/core';
import { preprocessSchema } from '@almadar/runtime';
import { BrowserPlayground } from '../BrowserPlayground';
import { STD_ROOT } from '../../test/helpers/behavior-packages';

const CALENDAR_ORB = join(STD_ROOT, 'behaviors/registry/ui/core/atoms/std-calendar.orb');

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

async function resolveCalendar(): Promise<OrbitalSchema> {
  const raw = JSON.parse(readFileSync(CALENDAR_ORB, 'utf-8')) as OrbitalSchema;
  const result = await preprocessSchema(raw, { basePath: STD_ROOT, stdLibPath: STD_ROOT, allowOutsideBasePath: true });
  if (!result.success) throw new Error(`preprocessSchema failed: ${result.errors.join('; ')}`);
  return result.data.schema;
}

// orb.almadar.io's catalog entry for std-calendar, vendored so the test never reads a sibling repo.
const WEBSITE_CATALOG = join(__dirname, 'fixtures/std-calendar.website-catalog.json');

describe('std-calendar in the browser playground', () => {
  it('website catalog schema in mock mode (orb.almadar.io /playground default) renders without React #31', async () => {
    const entry = JSON.parse(readFileSync(WEBSITE_CATALOG, 'utf-8')) as { schema: OrbitalSchema };
    render(
      <MemoryRouter>
        <BrowserPlayground schema={entry.schema} mode="mock" height="100%" />
      </MemoryRouter>,
    );
    await new Promise((r) => setTimeout(r, 3000));
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
    expect(screen.queryByText(/Minified React error|Objects are not valid as a React child/i)).toBeNull();
  }, 60_000);

  it('renders the calendar body without the slot falling to the error boundary', async () => {
    const schema = await resolveCalendar();
    render(
      <MemoryRouter>
        <BrowserPlayground schema={schema} fit />
      </MemoryRouter>,
    );
    await screen.findByText('Calendar', {}, { timeout: 15_000 });
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
    expect(screen.queryByText(/Objects are not valid as a React child/i)).toBeNull();
  }, 60_000);
});
