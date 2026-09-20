/**
 * BrowserPlayground on the REAL in-process runtime — the one wire (`docs/
 * Almadar_Compiler_Gaps.md` §156) end to end: schema → `OrbitalServerRuntime
 * .register` → OrbPreview's INIT → `ServerBridge` consumes the
 * `OrbitalEventResponse` → the server's `render-ui` reaches the `main` slot.
 * Nothing is mocked: this is the exact tree apps/builder's canvas preview
 * mounts. Every other suite mocks one side of ui ↔ runtime, so a wire drift
 * between the two packages was invisible until the 2026-09-19 preview
 * regression (`docs/Almadar_UI_Gaps.md`, "Preview wire never tested on the
 * real runtime").
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { OrbitalSchema, OrbitalEventResponse } from '@almadar/core';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import { BrowserPlayground } from '../BrowserPlayground';

function schema(): OrbitalSchema {
  return {
    name: 'wire-preview',
    version: '1.0.0',
    orbitals: [
      {
        name: 'Greeting',
        entity: { name: 'Greeting', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
        pages: [{ name: 'Home', path: '/', isInitial: true, traits: [{ ref: 'Greeter' }] }],
        traits: [
          {
            name: 'Greeter',
            scope: 'instance',
            linkedEntity: 'Greeting',
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }, { name: 'ready' }],
              events: [{ key: 'INIT', name: 'INIT' }],
              transitions: [
                {
                  from: 'idle',
                  to: 'ready',
                  event: 'INIT',
                  effects: [['render-ui', 'main', { type: 'typography', content: 'wire-ok' }]],
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BrowserPlayground — real runtime wire', () => {
  it("INIT's render-ui travels OrbitalServerRuntime → ServerBridge → main slot with no bridge error", async () => {
    // Real implementation kept; the spy only captures what crossed the wire.
    const processSpy = vi.spyOn(OrbitalServerRuntime.prototype, 'processOrbitalEvent');
    const consoleError = vi.spyOn(console, 'error');
    const consoleWarn = vi.spyOn(console, 'warn');

    render(<BrowserPlayground schema={schema()} />);

    await waitFor(
      () => expect(processSpy.mock.calls.some(([orbital, req]) => orbital === 'Greeting' && req.event === 'INIT')).toBe(true),
      { timeout: 10_000 },
    );
    const initCall = processSpy.mock.results[
      processSpy.mock.calls.findIndex(([orbital, req]) => orbital === 'Greeting' && req.event === 'INIT')
    ]!;
    const response: OrbitalEventResponse = await initCall.value;

    // The response is the canonical wire: required fields present, the
    // transition fired, and the server produced the render-ui tuple.
    expect(response.success).toBe(true);
    expect(response.transitioned).toBe(true);
    expect(response.states).toEqual({ Greeter: 'ready' });
    expect(Array.isArray(response.emittedEvents)).toBe(true);
    expect(response.clientEffects?.some((e) => e[0] === 'render-ui' && e[1] === 'main')).toBe(true);

    // ...and the bridge consumed it. The DOM check alone would NOT prove
    // that: the hybrid trait paints `render-ui` locally as well, so a
    // broken wire still shows `wire-ok` (probed 2026-09-19 by dropping
    // `emittedEvents` from the response — the text still rendered, and the
    // only trace was `sendEvent`'s catch logging `response:network`). The
    // console assertion is therefore the discriminator.
    expect(await screen.findByText('wire-ok', {}, { timeout: 10_000 })).toBeInTheDocument();
    const bridgeFailures = [...consoleError.mock.calls, ...consoleWarn.mock.calls].filter((args) =>
      args.some((a) => typeof a === 'string' && a.includes('response:network')),
    );
    expect(bridgeFailures).toEqual([]);
  });
});
