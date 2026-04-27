'use client';

/**
 * OrbPreview Component
 *
 * Renders a live preview of an Orbital schema (.orb program).
 * Uses static imports (no lazy loading) to ensure all providers,
 * hooks, and components share the same module instances.
 *
 * Usage:
 *   <OrbPreview schema={orbJsonStringOrObject} />
 *   <OrbPreview schema={schema} serverUrl="/api/orbitals" />
 *
 * @packageDocumentation
 */

import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { Box } from '../components/atoms/Box';
import { Typography } from '../components/atoms/Typography';
import { OrbitalProvider } from '../providers/OrbitalProvider';
import { VerificationProvider } from '../providers/VerificationProvider';
import { UISlotProvider, useUISlots } from '../context/UISlotContext';
import { UISlotRenderer } from '../components/organisms/UISlotRenderer';
import { useEventBus } from '../hooks/useEventBus';
import type { OrbitalSchema, EntityData } from '@almadar/core';
import { useResolvedSchema } from './useResolvedSchema';
import { useTraitStateMachine } from './useTraitStateMachine';
import {
  useSlotsActions,
  useSlots,
  SlotsProvider,
  slotEntriesInOrder,
  type SlotEntry,
} from './ui/SlotsContext';
import { EntitySchemaProvider } from './EntitySchemaContext';
import { ServerBridgeProvider, useServerBridge } from './ServerBridge';
import { getAllPages } from '../renderer/navigation';
import { recordTransition, recordServerResponse, type EffectTrace } from '../lib/verificationRegistry';
import { prepareSchemaForPreview } from './prepareSchemaForPreview';
import { InMemoryPersistence, type PersistenceAdapter } from '@almadar/runtime';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a PatternConfig child from flat { type, ...props } to
 * { type, props: {...} } format expected by SlotContentRenderer.
 *
 * String children pass through verbatim — they're `@trait.X` binding
 * leaves resolved by `renderPatternChildren`/`TraitFrame` downstream.
 * Destructuring a string here would coerce it to an index-keyed object
 * (`{0:"@",1:"t",…}`) with `type: undefined`, which then hits the
 * "Unknown pattern" fallback in UISlotRenderer.
 */
function normalizeChild(child: unknown): unknown {
  if (typeof child === "string") return child;
  if (child === null || typeof child !== "object" || Array.isArray(child)) {
    return child;
  }
  const { type, children, ...rest } = child as Record<string, unknown>;
  const normalizedChildren = Array.isArray(children)
    ? children.map((c) => normalizeChild(c))
    : children;
  return {
    type,
    props: { ...rest, ...(normalizedChildren !== undefined ? { children: normalizedChildren } : {}) },
  };
}

/**
 * Bridges SlotsStateContext (written by useTraitStateMachine) to
 * UISlotContext (read by UISlotRenderer). Syncs on every slot state change.
 */
/**
 * Bridges SlotsStateContext to UISlotContext. Simple pass-through: reads slot
 * patterns and forwards them to the UISlot render system. Entity resolution
 * happens reactively in SlotContentRenderer via useEntityRef (same pattern
 * as the compiled app).
 */
function SlotBridge() {
  const slots = useSlots();
  const { render, clear } = useUISlots();

  useEffect(() => {
    for (const [slotName, slotState] of Object.entries(slots)) {
      const entries = slotEntriesInOrder(slotState);
      if (entries.length === 0) {
        clear(slotName as Parameters<typeof clear>[0]);
        continue;
      }

      // Flatten each source's latest pattern into a child node. Parity with
      // the compiled path's page layout: when multiple traits contribute to
      // the same slot (`page "/x" -> TraitA, TraitB, TraitC`), they render
      // stacked in declaration order. Prior single-entry model made every
      // slot last-writer-wins, which hid sibling traits' frames behind
      // whichever most-recently rendered.
      const children = entries
        .map(({ entry }: { entry: SlotEntry }) => entry.patterns[entry.patterns.length - 1])
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((entry) => {
          const record = entry.pattern as unknown as Record<string, unknown>;
          const { type: patternType, children: nested, ...inlineProps } = record;
          const normalizedNested = Array.isArray(nested)
            ? nested.map((c) => normalizeChild(c))
            : nested;
          return {
            type: patternType as string,
            ...inlineProps,
            ...entry.props,
            ...(normalizedNested !== undefined ? { children: normalizedNested } : {}),
          };
        });

      if (children.length === 1) {
        // Single source: render directly, preserving prior behaviour so
        // slots owned by one trait (modal, toast, etc.) don't get an
        // unnecessary stack wrapper.
        const only = children[0];
        const { type, children: nested, ...rest } = only as {
          type: string;
          children?: unknown;
          [key: string]: unknown;
        };
        const lastEntry = entries[entries.length - 1];
        render({
          target: slotName as Parameters<typeof render>[0]['target'],
          pattern: type,
          props: {
            ...rest,
            ...(nested !== undefined ? { children: nested } : {}),
          },
          sourceTrait: lastEntry.entry.source?.trait,
        });
      } else {
        // Multi-source: wrap in a vertical stack so every trait's frame is
        // visible simultaneously, matching the compiled page layout.
        const lastEntry = entries[entries.length - 1];
        render({
          target: slotName as Parameters<typeof render>[0]['target'],
          pattern: 'stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            children,
          },
          sourceTrait: lastEntry.entry.source?.trait,
        });
      }
    }
  }, [slots, render, clear]);

  return null;
}

/**
 * Push each server-returned effect straight into `useUISlots` so the
 * per-trait index picks up every embedded atom (not just the last one).
 *
 * Going via `slotsActions.setSlotPatterns` would collapse N effects to a
 * single slot entry, because `SlotsProvider` stores one `{patterns, source}`
 * per slot and the next call overwrites it. The per-trait index lives on
 * `useUISlots` (hooks/useUISlots.ts), and `render()` is the only entry
 * point that populates it. Calling `render()` once per effect keeps each
 * trait's latest frame queryable via `getTraitContent(traitName)`.
 *
 * The slot state still converges to whatever the layout-owner last
 * rendered — its render-ui carries the `@trait.X` strings that
 * `<TraitFrame>` uses to embed atom frames.
 */
function applyServerEffects(
  effects: ReadonlyArray<import('./ServerBridge').ServerClientEffect>,
  uiSlots: ReturnType<typeof useUISlots>,
  onNavigate?: (path: string, params?: Record<string, unknown>) => void,
): void {
  // Call uiSlots.render() once per effect. useUISlots is multi-source
  // internally: each call merges into `slots[target][sourceTrait]`, and
  // `getContent(slot)` aggregates into a synthetic `stack` wrapper when
  // 2+ sources are active. No batch-level aggregation needed here — the
  // aggregation is stable across independent batches too, which fixes
  // the walk-step stomping that a per-batch stack couldn't cover.
  for (const eff of effects) {
    if (eff.type === 'render-ui' && eff.slot && eff.pattern) {
      const patternRecord = eff.pattern as Record<string, unknown>;
      const { type: patternType, children, ...inlineProps } = patternRecord;
      const normalizedChildren = Array.isArray(children)
        ? children.map((c) => normalizeChild(c))
        : children;
      uiSlots.render({
        target: eff.slot as Parameters<typeof uiSlots.render>[0]['target'],
        pattern: patternType as string,
        props: {
          ...inlineProps,
          ...(normalizedChildren !== undefined ? { children: normalizedChildren } : {}),
        },
        sourceTrait: eff.traitName ?? 'server',
      });
    } else if (eff.type === 'navigate' && eff.route && onNavigate) {
      onNavigate(eff.route, eff.params as Record<string, unknown> | undefined);
    }
  }
}

/**
 * Fires INIT event after mount so render-ui effects on the INIT
 * transition execute. Must be inside SlotsProvider + EntitySchemaProvider.
 *
 * When `orbitalNames` is provided (server bridge mode), events are forwarded
 * to the server after local processing. Server response provides enriched
 * patterns with entity data resolved reactively via useEntityRef.
 */
function TraitInitializer({ traits, orbitalNames, onNavigate, onLocalFallback, persistence }: {
  traits: unknown[];
  orbitalNames?: string[];
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
  /**
   * GAP-19: Called when the 5s server-bridge fallback fires (the preview server
   * never connected, so the preview is running locally instead). Lets the parent
   * surface a UI indicator so the silent fallback isn't actually silent.
   */
  onLocalFallback?: () => void;
  /**
   * Offline-preview persistence layer. Forwarded to `useTraitStateMachine`
   * so server-side effects (fetch/persist/set/ref/deref/swap!/atomic) run
   * against an in-memory store instead of being no-oped. Set by OrbPreview
   * when `autoMock` is active and no `serverUrl` is supplied.
   */
  persistence?: PersistenceAdapter;
}) {
  const slotsActions = useSlotsActions();
  const bridge = useServerBridge();
  // We call into useUISlots.render() directly for server-bridge effects so
  // that EACH trait's render-ui populates the per-trait index (needed by
  // `<TraitFrame>` to resolve `@trait.X` bindings). Going through
  // `slotsActions.setSlotPatterns` in a loop would overwrite the slot
  // state on each iteration — only the last trait would survive, and
  // every embedded atom would drop out of the index.
  const uiSlots = useUISlots();

  // Forward events to server, apply enriched effects directly to slots.
  // V2 Phase 6: the server response no longer carries `meta.data`; fetched
  // entities flow through the event bus via typed emit payloads, which the
  // state machine listeners bind into `@payload.data` and the renderer
  // consumes as pre-resolved `entity` props. No EntityStore hydration.
  const onEventProcessed = useCallback(async (event: string, payload?: Record<string, unknown>) => {
    if (!bridge.connected || !orbitalNames?.length) return;
    for (const name of orbitalNames) {
      const { effects, meta } = await bridge.sendEvent(name, event, payload);
      recordServerResponse(name, event, meta);
      applyServerEffects(effects, uiSlots, onNavigate);
    }
  }, [bridge.connected, bridge.sendEvent, orbitalNames, uiSlots, onNavigate]);

  const opts = orbitalNames
    ? { onEventProcessed, navigate: onNavigate }
    : { navigate: onNavigate, persistence };
  const { sendEvent } = useTraitStateMachine(traits as Parameters<typeof useTraitStateMachine>[0], slotsActions, opts);

  const initSentRef = useRef(false);

  // Local INIT - fires immediately when no server bridge,
  // or after 5s fallback if server bridge fails to connect.
  useEffect(() => {
    if (!orbitalNames?.length) {
      const t = setTimeout(() => sendEvent('INIT'), 50);
      return () => clearTimeout(t);
    }
    // Fallback: if server bridge doesn't connect within 5s, fire local INIT
    // and notify the parent so it can surface the fallback (GAP-19).
    const fallback = setTimeout(() => {
      if (!initSentRef.current) {
        sendEvent('INIT');
        onLocalFallback?.();
      }
    }, 5000);
    return () => clearTimeout(fallback);
  }, [traits, orbitalNames, sendEvent, onLocalFallback]);

  // Server INIT when bridge connects. Apply enriched effects to slots.
  useEffect(() => {
    if (!bridge.connected || !orbitalNames?.length || initSentRef.current) return;
    initSentRef.current = true;
    (async () => {
      for (const name of orbitalNames) {
        const { effects, meta } = await bridge.sendEvent(name, 'INIT', {});

        // Record server response in verification timeline
        recordServerResponse(name, 'INIT', meta);

        const effectTraces: EffectTrace[] = [
          { type: 'fetch', args: [], status: 'executed' as const },
          ...effects.map((eff) => ({
            type: eff.type,
            args: eff.type === 'render-ui' ? [eff.slot] : [],
            status: 'executed' as const,
          })),
        ];
        recordTransition({
          traitName: name,
          from: 'init',
          to: 'init',
          event: 'INIT',
          effects: effectTraces,
          timestamp: Date.now(),
        });

        // V2 Phase 6: `meta.data` is gone; entity data arrives through the
        // event bus via typed emit payloads, bound into the pattern tree by
        // the listener / render-ui pipeline. The server effects carry the
        // resolved data; no store hydration needed.
        applyServerEffects(effects, uiSlots, onNavigate);
      }
    })();
  }, [bridge.connected, orbitalNames, bridge.sendEvent, uiSlots, onNavigate]);

  return null;
}

/**
 * Resolves schema, mounts trait state machines, and renders the UI.
 * When `serverUrl` is provided, wraps with ServerBridgeProvider and
 * forwards events to the server after local processing.
 */
function SchemaRunner({ schema, serverUrl, mockData, pageName, onNavigate, onLocalFallback, persistence }: {
  schema: unknown;
  serverUrl?: string;
  mockData?: Record<string, unknown[]>;
  pageName?: string;
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
  /** GAP-19: forwarded to TraitInitializer to surface server-bridge fallback. */
  onLocalFallback?: () => void;
  /** Offline-preview persistence layer. */
  persistence?: PersistenceAdapter;
}) {
  const { traits, allEntities, ir } = useResolvedSchema(schema as Parameters<typeof useResolvedSchema>[0], pageName);

  // When a specific page is selected (via navigation), use only that page's
  // traits. Otherwise, for single-page schemas or initial load, collect from
  // all pages so every trait gets an INIT.
  const allPageTraits = useMemo(() => {
    // If a specific page was navigated to, use its traits only
    if (pageName && traits.length > 0) return traits;
    // For single-page schemas, just use the resolved traits
    if (!ir?.pages || ir.pages.size <= 1) return traits;
    // Initial load: collect traits from all pages
    const combined: unknown[] = [];
    const seen = new Set<string>();
    for (const page of ir.pages.values()) {
      for (const t of page.traits) {
        const binding = t as unknown as Record<string, unknown>;
        const traitObj = binding.trait as Record<string, unknown> | undefined;
        const name = (traitObj?.name ?? binding.name ?? '') as string;
        if (name && !seen.has(name)) {
          seen.add(name);
          combined.push(t);
        }
      }
    }
    return combined.length > 0 ? combined : traits;
  }, [ir, traits, pageName]);

  // Extract orbital names from schema for server event forwarding
  const orbitalNames = useMemo(() => {
    const parsed = schema as Record<string, unknown>;
    const orbitals = parsed?.orbitals as Array<Record<string, unknown>> | undefined;
    if (!orbitals) return [];
    return orbitals
      .filter((o) => typeof o.name === 'string')
      .map((o) => o.name as string);
  }, [schema]);

  // V2 Phase 6: EntityStore is gone. Standalone-preview (no serverUrl) with
  // `mockData` no longer hydrates a shared store; mock data now flows through
  // the event bus the same way a real server response does — i.e. traits
  // that `fetch` during INIT need a mock bridge to surface the data as
  // `@payload.data` on the success emit. See Almadar_Entity_V2_Plan.md §13
  // for the deferred standalone-preview mock-data wiring.
  void mockData;

  const inner = (
    <VerificationProvider enabled>
      <SlotsProvider>
        <EntitySchemaProvider
          entities={Array.from(allEntities.values())}
          traitLinkedEntities={(() => {
            const map = new Map<string, string>();
            if (ir) {
              for (const page of ir.pages.values()) {
                for (const binding of page.traits) {
                  if (binding.linkedEntity) {
                    map.set(binding.trait.name, binding.linkedEntity);
                  }
                }
              }
            }
            return map;
          })()}
        >
          <TraitInitializer
            traits={allPageTraits}
            orbitalNames={serverUrl ? orbitalNames : undefined}
            onNavigate={onNavigate}
            onLocalFallback={onLocalFallback}
            persistence={persistence}
          />
          <SlotBridge />
          {/* Content fills the available height, not hug-content. `h-full`
              makes the slot area as tall as the preview frame; nested slot
              patterns can still grow past it (overflow is handled by the
              outer Box's `overflow-auto`). Previously `min-h-full` left the
              height undefined for empty layouts, so the debug bar floated
              up near the top instead of docking at the bottom. */}
          <Box className="h-full p-4">
            <UISlotRenderer includeHud hudMode="inline" includeFloating />
          </Box>
        </EntitySchemaProvider>
      </SlotsProvider>
    </VerificationProvider>
  );

  if (serverUrl) {
    return (
      <ServerBridgeProvider schema={schema} serverUrl={serverUrl}>
        {inner}
      </ServerBridgeProvider>
    );
  }

  return inner;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface OrbPreviewProps {
  /**
   * The orbital schema. Accepts a JSON string or an `OrbitalSchema` object
   * from `@almadar/core` (the validated `.orb` program type).
   */
  schema: string | OrbitalSchema;
  /**
   * Mock entity rows keyed by entity name. The `EntityData` type from
   * `@almadar/core` is `Record<string, EntityRow[]>` where each row is a
   * `{ id?: string } & Record<string, FieldValue>`. Ignored if `autoMock`
   * is set.
   */
  mockData?: EntityData;
  /**
   * When true, run the schema through `prepareSchemaForPreview` before
   * rendering: auto-generate mock entity rows and flip two-state INIT
   * machines so the data state is initial. This is the same pipeline the
   * playground uses, so consumers (docs MDX, playground) all share one path.
   *
   * Ignored when `serverUrl` is set — server-driven previews provide their
   * own data.
   */
  autoMock?: boolean;
  /** Preview container height. Default: '400px'. */
  height?: string;
  /** CSS class for the outer container. */
  className?: string;
  /** Server URL for dual execution (e.g. "/api/orbitals"). When set, events are forwarded to the server. */
  serverUrl?: string;
}

/**
 * Renders a live preview of an Orbital schema.
 *
 * Uses static imports for all runtime components to ensure providers
 * and hooks share the same module instances (no context duplication).
 *
 * @example
 * ```tsx
 * <OrbPreview schema={orbJsonString} height="300px" />
 * <OrbPreview schema={schema} autoMock />
 * <OrbPreview schema={schema} serverUrl="/api/orbitals" />
 * ```
 */
export function OrbPreview({
  schema,
  mockData,
  autoMock = false,
  height = '400px',
  className,
  serverUrl,
}: OrbPreviewProps): React.ReactElement {
  // GAP-19: track when the server bridge falls back to local execution.
  // The 5s timeout in TraitInitializer fires onLocalFallback if the bridge
  // never connected. We surface a banner + emit UI:NOTIFY for any toast listener.
  const [localFallback, setLocalFallback] = useState(false);
  const eventBus = useEventBus();
  const handleLocalFallback = useCallback(() => {
    if (localFallback) return;
    setLocalFallback(true);
    eventBus.emit('UI:NOTIFY', {
      message: 'Preview server unreachable — running locally without server-side state.',
      severity: 'warning',
    });
  }, [localFallback, eventBus]);
  // Parse + (optionally) run the auto-mock pipeline. The pipeline:
  //   1. Generates mock entity rows from field definitions (EntityData)
  //   2. Flips two-state INIT state machines so the data state is initial
  // It's the same logic the playground uses, so docs and playground render
  // schemas the same way. `autoMock` is ignored when a server URL is set.
  //
  // Functional signature (in @almadar/core types):
  //   string | OrbitalSchema  →  { schema: OrbitalSchema, mockData: EntityData }
  type ParsedResult =
    | { ok: true; schema: OrbitalSchema; mockData: EntityData }
    | { ok: false; error: string };

  const parseResult = useMemo<ParsedResult>(() => {
    let parsed: OrbitalSchema;
    if (typeof schema === 'string') {
      try {
        parsed = JSON.parse(schema) as OrbitalSchema;
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    } else {
      parsed = schema;
    }

    if (autoMock && !serverUrl) {
      const prepared = prepareSchemaForPreview(parsed);
      return { ok: true, schema: prepared.schema, mockData: prepared.mockData };
    }

    return { ok: true, schema: parsed, mockData: mockData ?? {} };
  }, [schema, autoMock, serverUrl, mockData]);

  const parsedSchema = parseResult.ok ? parseResult.schema : null;
  const effectiveMockData: EntityData = parseResult.ok ? parseResult.mockData : {};

  // Offline-preview persistence. When `autoMock` is on and no `serverUrl`
  // is set, build an `InMemoryPersistence` seeded from the generated mock
  // rows and hand it to the state machine. The runtime's
  // `createServerEffectHandlers` layers on top of the client handlers, so
  // `fetch` / `persist` / `set` / `ref` / `deref` / `swap!` / `atomic` /
  // `callService` run the same semantics `OrbitalServerRuntime` would on
  // the server — just against in-memory storage. This is what makes
  // 3-state `loading → browsing` schemas like `std-list` advance past the
  // initial spinner without a real server.
  //
  // The adapter is built once per schema parse — re-parses (schema swap
  // in the playground) reset the persistence to the fresh seed.
  const persistence = useMemo<PersistenceAdapter | undefined>(() => {
    if (!parsedSchema || serverUrl) return undefined;
    if (!autoMock) return undefined;
    const adapter = new InMemoryPersistence();
    adapter.seed(effectiveMockData as Record<string, import('@almadar/core').EntityRow[]>);
    return adapter;
  }, [parsedSchema, serverUrl, autoMock, effectiveMockData]);

  // Discover pages from schema for effect-driven navigation
  const pages = useMemo(() => {
    if (!parsedSchema) return [];
    try {
      return getAllPages(parsedSchema);
    } catch {
      return [];
    }
  }, [parsedSchema]);

  const [currentPage, setCurrentPage] = useState<string | undefined>(undefined);

  // Navigate handler: when a ['navigate', '/path'] effect fires,
  // find the matching page and switch to it.
  const handleNavigate = useCallback((path: string) => {
    const match = pages.find(({ page }) => page.path === path);
    if (match) {
      setCurrentPage(match.page.name);
    }
  }, [pages]);

  if (!parseResult.ok) {
    return (
      <Box className={className} style={{ height }}>
        <Typography as="pre" color="error" variant="small" className="font-mono whitespace-pre-wrap break-all m-0 p-4">
          Parse error: {parseResult.error}
        </Typography>
      </Box>
    );
  }

  // Intercept <a> clicks inside the preview to route through handleNavigate
  // instead of causing real browser navigation. Capture phase ensures we
  // run before any React handler or native navigation.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || pages.length <= 1) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? anchor.getAttribute('to') ?? '';
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleNavigate(href);
    };
    el.addEventListener('click', handler, true);
    return () => el.removeEventListener('click', handler, true);
  }, [pages, handleNavigate]);

  return (
    <Box
      ref={containerRef}
      className={`overflow-auto border border-[var(--color-border)] rounded-[var(--radius-md)] ${className ?? ''}`}
      style={{ height }}
    >
      {/* GAP-19: visible banner when the preview server bridge fell back to local execution.
          The 5s timeout in TraitInitializer fires this when serverUrl was set but the
          ServerBridge never connected. Without this, the user couldn't tell why state
          wasn't persisting to the server. */}
      {localFallback && (
        <Box className="px-3 py-2 bg-[var(--color-warning)] bg-opacity-10 border-b border-[var(--color-warning)] flex items-center gap-2">
          <Typography variant="caption" className="text-[var(--color-warning-foreground)] flex-1">
            Preview server unreachable — running locally. Server-side state and persistence are disabled.
          </Typography>
        </Box>
      )}
      <OrbitalProvider initialData={effectiveMockData} skipTheme verification>
        <UISlotProvider>
          <SchemaRunner
            schema={parsedSchema}
            serverUrl={serverUrl}
            mockData={effectiveMockData}
            pageName={currentPage}
            onNavigate={handleNavigate}
            onLocalFallback={handleLocalFallback}
            persistence={persistence}
          />
        </UISlotProvider>
      </OrbitalProvider>
    </Box>
  );
}

OrbPreview.displayName = 'OrbPreview';
