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

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import type { EventPayload, OrbitalSchema } from '@almadar/core';
import { createLogger } from '@almadar/logger';
import { OrbPreview } from './OrbPreview';
import type { ServerBridgeTransport } from './ServerBridge';

const playgroundLog = createLogger('almadar:ui:browser-playground');

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

  // Deferred unmount cleanup. React StrictMode in dev runs every effect's
  // setup → cleanup → setup at mount to surface effect bugs. A naive
  // `useEffect(() => () => runtime.unregisterAll(), [])` would fire the
  // cleanup during that simulated unmount, drop every orbital, and then
  // the schema-keyed effect below would re-register asynchronously —
  // INIT dispatches from the SchemaRunner land in the gap and the
  // runtime replies `Orbital not found`, blanking the canvas.
  //
  // Defer the cleanup via setTimeout(0). When StrictMode immediately
  // re-mounts the component, the next setup cancels the pending teardown
  // before it fires. Real unmount lets the timer fire and `unregisterAll`
  // runs (we need that — `unregisterAll` clears ticks, event listeners,
  // and mock persistence, which leak otherwise).
  const teardownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (teardownTimerRef.current !== null) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }
    return () => {
      teardownTimerRef.current = setTimeout(() => {
        teardownTimerRef.current = null;
        playgroundLog.debug('unregisterAll:unmount');
        runtime.unregisterAll();
      }, 0);
    };
  }, [runtime]);

  // Re-register orbitals on schema ref change. `registerOrbitalAsync` is
  // idempotent (`this.orbitals.set(name, ...)` overwrites), so back-to-back
  // registers are safe. Stale orbitals removed from the new schema linger
  // until full unmount; for the live-editing flow that's fine (mutations
  // add/modify, rarely remove).
  useEffect(() => {
    const orbitalNames = schema.orbitals.map((o) => o.name);
    playgroundLog.debug('register:start', { schema: schema.name, orbitalNames });
    void runtime.register(schema).then(() => {
      playgroundLog.debug('register:done', { schema: schema.name, orbitalNames });
    });
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
