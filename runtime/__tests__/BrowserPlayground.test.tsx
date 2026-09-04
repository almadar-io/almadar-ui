/**
 * BrowserPlayground — `paused` prop.
 *
 * Mocks the in-process `OrbitalServerRuntime` and `OrbPreview` so the test
 * stays scoped to BrowserPlayground's own wiring: does the `paused` prop
 * reach `runtime.pauseTicks()`/`resumeTicks()`, and does an omitted prop
 * leave the runtime exactly as it behaves today (untouched).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

interface MockRuntime {
  register: ReturnType<typeof vi.fn>;
  unregisterAll: ReturnType<typeof vi.fn>;
  processOrbitalEvent: ReturnType<typeof vi.fn>;
  pauseTicks: ReturnType<typeof vi.fn>;
  resumeTicks: ReturnType<typeof vi.fn>;
  areTicksPaused: ReturnType<typeof vi.fn>;
}

const mockRuntimeInstances: MockRuntime[] = [];

vi.mock('@almadar/runtime/OrbitalServerRuntime', () => {
  class MockOrbitalServerRuntime implements MockRuntime {
    register = vi.fn().mockResolvedValue(undefined);
    unregisterAll = vi.fn();
    processOrbitalEvent = vi.fn().mockResolvedValue({});
    pauseTicks = vi.fn();
    resumeTicks = vi.fn();
    areTicksPaused = vi.fn().mockReturnValue(false);
    constructor() {
      mockRuntimeInstances.push(this);
    }
  }
  return { OrbitalServerRuntime: MockOrbitalServerRuntime };
});

vi.mock('../OrbPreview', () => ({
  OrbPreview: () => null,
}));

function schema(): OrbitalSchema {
  return { name: 'App', version: '1.0.0', orbitals: [] } as unknown as OrbitalSchema;
}

describe('BrowserPlayground — paused prop', () => {
  beforeEach(() => {
    mockRuntimeInstances.length = 0;
  });

  it('never calls pauseTicks/resumeTicks when paused is omitted (unchanged default behavior)', () => {
    render(<BrowserPlayground schema={schema()} />);
    const runtime = mockRuntimeInstances[0];
    expect(runtime.pauseTicks).not.toHaveBeenCalled();
    expect(runtime.resumeTicks).not.toHaveBeenCalled();
  });

  it('calls runtime.pauseTicks() when paused=true', () => {
    render(<BrowserPlayground schema={schema()} paused={true} />);
    const runtime = mockRuntimeInstances[0];
    expect(runtime.pauseTicks).toHaveBeenCalledTimes(1);
    expect(runtime.resumeTicks).not.toHaveBeenCalled();
  });

  it('calls runtime.resumeTicks() when paused=false is passed explicitly', () => {
    render(<BrowserPlayground schema={schema()} paused={false} />);
    const runtime = mockRuntimeInstances[0];
    expect(runtime.resumeTicks).toHaveBeenCalledTimes(1);
    expect(runtime.pauseTicks).not.toHaveBeenCalled();
  });

  it('calls resumeTicks() when the prop flips from true to false across a rerender', () => {
    const { rerender } = render(<BrowserPlayground schema={schema()} paused={true} />);
    const runtime = mockRuntimeInstances[0];
    expect(runtime.pauseTicks).toHaveBeenCalledTimes(1);

    rerender(<BrowserPlayground schema={schema()} paused={false} />);
    expect(runtime.resumeTicks).toHaveBeenCalledTimes(1);
  });
});
