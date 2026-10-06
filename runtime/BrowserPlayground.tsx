'use client';

/**
 * BrowserPlayground — in-browser Almadar runtime mount.
 *
 * Runs `OrbitalServerRuntime` (mock mode) in-process and threads it through
 * `<OrbPreview>` via an `EventTransport` (`createInProcessTransport`, plan
 * P5). Equivalent to canonical playground-runtime's server-mode mount, but
 * without Express, fork, or HTTP — invokes `runtime.processOrbitalEvent`
 * directly.
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

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import { createInProcessTransport, loadLazyPage, type EventTransport, type SchemaLoader } from '@almadar/runtime';
import type { MessageCatalogs, OrbitalSchema, UserContext } from '@almadar/core';
import { localeDirection } from '@almadar/core/i18n';
import { createLogger } from '@almadar/logger';
import { OrbPreview } from './OrbPreview';
import { I18nProvider, createTranslate, type I18nContextValue } from '../hooks/useTranslate';

const playgroundLog = createLogger('almadar:ui:browser-playground');

export interface BrowserPlaygroundProps {
  /** OrbitalSchema to render. */
  schema: OrbitalSchema;
  /** Persistence mode for the in-process runtime. Default: 'mock' (seeded MockPersistenceAdapter). */
  mode?: 'mock';
  /** Initial page path to render (forwarded to OrbPreview). */
  initialPagePath?: string;
  /** Preview container height. Default: '400px'. */
  height?: string;
  /** CSS class for the outer container. */
  className?: string;
  /** Pause the in-process runtime's tick scheduler. Default: undefined (running, same as today). */
  paused?: boolean;
  /** Scale content down (never up) to fit the container without scrollbars — for fixed-size content like game canvases. Forwarded to OrbPreview. */
  fit?: boolean;
  /** Called with the page path on every in-preview page switch. Forwarded to OrbPreview. */
  onPageChange?: (path: string) => void;
  /** Who is viewing (`@user`). Default: the app's first seeded persona. */
  viewer?: UserContext;
  /** The program's message catalogs (`orb resolve`'s `<stem>.<locale>.json`), for a schema that declares `locales`. */
  messages?: MessageCatalogs;
  /** The viewer's locale. Default: the schema's first declared locale. */
  locale?: string;
  /** Loads each `lazyPages` behavior (`uses lazy`): the in-browser runtime runs them with the program, as a server does. */
  lazyLoader?: SchemaLoader;
  /** Where `schema` was loaded from — a lazy page's `orbRef` resolves against it. */
  schemaPath?: string;
}

export function BrowserPlayground({
  schema,
  mode = 'mock',
  initialPagePath,
  height,
  className,
  paused,
  fit,
  onPageChange,
  viewer,
  messages,
  locale,
  lazyLoader,
  schemaPath,
}: BrowserPlaygroundProps): React.ReactElement {
  const [runtime] = useState(
    () => new OrbitalServerRuntime({ mode, debug: false, ...(viewer !== undefined ? { defaultUser: viewer } : {}) }),
  );

  // Purely additive: `paused` undefined never calls pause/resume, so a
  // caller that doesn't pass it sees the runtime's default (running) state.
  useEffect(() => {
    if (paused === undefined) return;
    if (paused) {
      runtime.pauseTicks();
    } else {
      runtime.resumeTicks();
    }
  }, [runtime, paused]);

  // Kick registration off DURING RENDER via useMemo — not in a useEffect.
  // React fires child effects before parent effects on mount, so a parent
  // effect that calls `runtime.register(schema)` runs AFTER `TraitInitializer`'s
  // INIT useEffect (the child). INIT lands in an empty runtime and the
  // server-bridge fan-out replies `Orbital not found`, blanking the canvas
  // on every drop or page swap. useMemo's body executes inline during the
  // render pass, before any child effect commits, so registration is always
  // in-flight (or done) by the time INIT fires.
  //
  // `runtime.register` is idempotent (`this.orbitals.set(name, ...)`
  // overwrites). React StrictMode in dev calls render twice — both kicks
  // hit the same map keys, no harm.
  // `uses lazy` behaviors load once per program and ride along on every registration of it.
  const lazySchemas = useMemo<Promise<OrbitalSchema[]>>(() => {
    const lazyPages = schema.lazyPages ?? [];
    if (lazyPages.length === 0 || lazyLoader === undefined) return Promise.resolve([]);
    return Promise.all(lazyPages.map(async (page) => {
      const loaded = await loadLazyPage(lazyLoader, page, schemaPath);
      if (!loaded.success) throw new Error(loaded.error);
      return loaded.data;
    }));
  }, [schema.lazyPages, lazyLoader, schemaPath]);

  const registerProgram = useCallback((program: OrbitalSchema): Promise<void> => {
    const orbitalNames = program.orbitals.map((o) => o.name);
    playgroundLog.debug('register:start', { schema: program.name, orbitalNames });
    return lazySchemas
      .then((lazy) => runtime.register(program, { ...(messages !== undefined ? { messages } : {}), lazy }))
      .then(() => {
        playgroundLog.debug('register:done', { schema: program.name, orbitalNames });
      });
  }, [runtime, lazySchemas, messages]);

  // Dispatches wait for the newest registration: the eager one below, or the bridge's own.
  const latestRegistration = useRef<Promise<void>>(Promise.resolve());
  const registrationReady = useMemo(() => {
    const ready = registerProgram(schema);
    latestRegistration.current = ready;
    return ready;
  }, [registerProgram, schema]);

  // Deferred unmount cleanup. React StrictMode in dev runs every effect's
  // setup → cleanup → setup at mount to surface effect bugs. A naive
  // `useEffect(() => () => runtime.unregisterAll(), [])` would fire the
  // cleanup during that simulated unmount, drop every orbital, and the
  // re-registered orbital wouldn't catch up before INIT.
  //
  // Defer the cleanup via setTimeout(0). When StrictMode immediately
  // re-mounts the component, the next setup cancels the pending teardown
  // before it fires. Real unmount lets the timer fire and `unregisterAll`
  // runs (we need that — it clears ticks, event listeners, and the mock
  // persistence store, all of which leak otherwise).
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

  // `createInProcessTransport` (plan P5, `@almadar/runtime`) is the ONE
  // owner of the in-process leg now — `send`'s request/response are
  // `@almadar/core`'s `OrbitalEventRequest`/`OrbitalEventResponse` directly
  // (the same shapes `OrbitalServerRuntime.processOrbitalEvent` already
  // takes/returns), so no boundary cast is needed the way the old
  // `ServerBridgeTransport`-shaped adapter needed one.
  const transport = useMemo<EventTransport>(
    () => createInProcessTransport(
      async (orbitalName, request) => {
        // Gate every dispatch on registration completing. TraitInitializer's
        // INIT useEffect runs before our parent register useMemo's promise
        // resolves; without this await, INIT lands in an empty runtime and
        // gets `Orbital not found`. The await is a no-op once registration
        // has resolved. tick/sourceTrait (T6) pass through on `request`; the
        // coalesced cross-tab relay is a no-op here — in-process is
        // single-tab by construction, no SSE sink is wired.
        await latestRegistration.current;
        return runtime.processOrbitalEvent(orbitalName, request);
      },
      {
        // Registers what the bridge hands over (lazy behaviors included): a bridge that unregistered first gets it back.
        onRegister: (program) => {
          const ready = registerProgram(program);
          latestRegistration.current = ready;
          return ready;
        },
        onUnregister: () => {
          runtime.unregisterAll();
        },
      },
    ),
    [runtime, registerProgram, registrationReady],
  );

  const viewerLocale = locale ?? schema.locales?.[0];
  const i18n = useMemo<I18nContextValue | undefined>(() => {
    if (viewerLocale === undefined || messages === undefined) return undefined;
    const catalog = messages[viewerLocale] ?? {};
    return { locale: viewerLocale, direction: localeDirection(viewerLocale), t: createTranslate(catalog, viewerLocale), messages: catalog };
  }, [viewerLocale, messages]);

  const preview = (
    <OrbPreview
      schema={schema}
      transport={transport}
      initialPagePath={initialPagePath}
      height={height}
      className={className}
      fit={fit}
      onPageChange={onPageChange}
      user={viewer ?? null}
      lazyLoader={lazyLoader}
      schemaPath={schemaPath}
      // BrowserPlayground is always a sandboxed in-process preview embedded in
      // a host (studio canvas / preview tab). Its bus must stay context-local
      // and must NOT clobber the host's global event bus — otherwise a host
      // component that falls back to the global (e.g. a canvas node bundled
      // from @almadar/ui/avl, with no matching React context) would emit into
      // this sandbox instead of the studio.
      isolated
    />
  );
  return i18n !== undefined ? <I18nProvider value={i18n}>{preview}</I18nProvider> : preview;
}

export default BrowserPlayground;
