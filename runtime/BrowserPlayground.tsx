'use client';

/**
 * BrowserPlayground — in-browser Almadar runtime mount.
 *
 * Runs `OrbitalServerRuntime` (mock mode) in-process and threads it through
 * `<OrbPreview>` via the `ServerBridgeTransport` adapter. Equivalent to
 * canonical playground-runtime's server-mode mount, but without Express,
 * fork, or HTTP — invokes `runtime.processOrbitalEvent` directly.
 *
 * Same React tree as `runtime-verify` (and apps/builder server-mode) speak,
 * so any `@almadar/runtime` fix flows in through one bump cycle.
 *
 * @example
 * ```tsx
 * <BrowserPlayground schema={schema} mode="mock" height="100%" />
 * ```
 *
 * @packageDocumentation
 */

import React, { useMemo, useState, useEffect } from 'react';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import type { EventPayload, OrbitalSchema } from '@almadar/core';
import { OrbPreview } from './OrbPreview';
import type { ServerBridgeTransport } from './ServerBridge';

export interface BrowserPlaygroundProps {
  /** OrbitalSchema to render. */
  schema: OrbitalSchema;
  /** Persistence mode for the in-process runtime. Default: 'mock' (Faker-seeded MockPersistenceAdapter). */
  mode?: 'mock';
  /** Initial page path to render (forwarded to OrbPreview). */
  initialPagePath?: string;
  /** Preview container height. Default: '400px'. */
  height?: string;
  /** CSS class for the outer container. */
  className?: string;
}

export function BrowserPlayground({
  schema,
  mode = 'mock',
  initialPagePath,
  height,
  className,
}: BrowserPlaygroundProps): React.ReactElement {
  const [runtime] = useState(
    () => new OrbitalServerRuntime({ mode, debug: false }),
  );

  // Register on schema change; unregister-all on unmount.
  useEffect(() => {
    void runtime.register(schema);
    return () => {
      runtime.unregisterAll();
    };
  }, [runtime, schema]);

  const transport = useMemo<ServerBridgeTransport>(() => ({
    register: async (s) => {
      await runtime.register(s as OrbitalSchema);
      return true;
    },
    unregister: async () => {
      runtime.unregisterAll();
    },
    sendEvent: async (orbitalName, event, payload) => {
      // OrbitalServerRuntime.processOrbitalEvent returns the same
      // OrbitalEventResponse shape ServerBridge consumes from HTTP, so the
      // cascade-rebroadcast logic in ServerBridge runs identically against
      // both transports.
      // ServerBridgeTransport widens payload to `Record<string, unknown>`
      // (HTTP semantics: arbitrary JSON in transit). OrbitalServerRuntime
      // narrows to `EventPayload` (structured value type). Single-step cast
      // at this boundary is the same widening every HTTP transport already
      // does on JSON.parse — runtime contract enforced server-side.
      return runtime.processOrbitalEvent(orbitalName, {
        event,
        payload: payload as EventPayload | undefined,
      });
    },
  }), [runtime]);

  return (
    <OrbPreview
      schema={schema}
      transport={transport}
      initialPagePath={initialPagePath}
      height={height}
      className={className}
    />
  );
}

export default BrowserPlayground;
