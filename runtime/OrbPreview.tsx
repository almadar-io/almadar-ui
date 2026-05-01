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
import type { OrbitalSchema, EntityData, ResolvedTraitBinding } from '@almadar/core';
import { useResolvedSchema } from './useResolvedSchema';
import { collectEmbeddedTraits } from './embedded-traits';
import { convertFnFormLambdasInProps } from './fn-form-lambda';
import { useTraitStateMachine } from './useTraitStateMachine';
import { EntitySchemaProvider } from './EntitySchemaContext';
import { ServerBridgeProvider, useServerBridge, type ServerBridgeTransport } from './ServerBridge';
import { getAllPages } from '../renderer/navigation';
import { recordTransition, recordServerResponse, type EffectTrace } from '../lib/verificationRegistry';
import { prepareSchemaForPreview } from './prepareSchemaForPreview';
import { InMemoryPersistence, type PersistenceAdapter } from '@almadar/runtime';
import { createLogger } from '../lib/logger';

// Gap #11 (Almadar_Std_Verification.md): cross-orbital cascade tracing on
// the UI side. Pairs with the server-side `almadar:runtime:cross-orbital`
// channel; logs `SchemaRunner:mount`, per-trait subscribe in
// `TraitInitializer`, and slot writes via `applyServerEffects` so the
// runtime-verify console capture can reconstruct which traits actually
// rendered into a slot during a dispatch.
const xOrbitalLog = createLogger('almadar:runtime:cross-orbital');

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
  embeddedTraits?: ReadonlySet<string>,
): void {
  // Call uiSlots.render() once per effect. useUISlots is multi-source
  // internally: each call merges into `slots[target][sourceTrait]`, and
  // `getContent(slot)` aggregates into a synthetic `stack` wrapper when
  // 2+ sources are active.
  //
  // Embed-aware routing: when an effect's `traitName` is in
  // `embeddedTraits` (i.e. the trait is referenced via `@trait.X` by a
  // sibling layout's render-ui), bypass the slot write and update only
  // the per-trait sidecar. The sibling layout owns the slot; its
  // `<TraitFrame traitName="X"/>` reads the sidecar at render time.
  // This mirrors what compiled-path codegen does (atoms inlined as JSX
  // inside the layout's pattern, never writing a shared slot).
  for (const eff of effects) {
    if (eff.type === 'render-ui' && eff.slot && eff.pattern) {
      const patternRecord = eff.pattern as Record<string, unknown>;
      const { type: patternType, children, ...inlineProps } = patternRecord;
      const normalizedChildren = Array.isArray(children)
        ? children.map((c) => normalizeChild(c))
        : children;
      const sourceTrait = eff.traitName ?? 'server';
      const isEmbedded = embeddedTraits?.has(sourceTrait) ?? false;
      // Convert any `["fn", argName, body]` lambda values (RenderItemLambda)
      // into actual React render-prop functions before the props land in
      // `useUISlots`. By the time `<SlotContentRenderer>` and DataGrid
      // receive these props, the converted function is already at
      // `children` (per the renderItem→children alias documented on the
      // consumer components), so the consumer's
      // `typeof children === 'function'` branch fires and the rows render.
      // See `runtime/fn-form-lambda.ts` for the helper. xOrbitalLog
      // emits `fn-lambda:upstream-convert` per converted prop so the
      // verifier transcript can confirm the conversion at the dispatch
      // boundary.
      const rawProps: Record<string, unknown> = {
        ...inlineProps,
        ...(normalizedChildren !== undefined ? { children: normalizedChildren } : {}),
      };
      // Diagnostic: log the rawProps' renderItem shape at the dispatch
      // boundary so we can trace whether BindingResolver preserved or
      // stripped the fn-form lambda en-route from .orb → server bridge
      // → here. If renderItemHead is "fn", my BindingResolver patch is
      // working and the upstream conversion will fire next.
      if (typeof patternType === 'string' && (patternType === 'data-grid' || patternType === 'data-list')) {
        const r = rawProps.renderItem;
        xOrbitalLog.info('apply-server:data-grid', {
          sourceTrait,
          patternType,
          rawKeys: Object.keys(rawProps).slice(0, 10),
          renderItemTypeOf: typeof r,
          renderItemIsArray: Array.isArray(r),
          renderItemHead: Array.isArray(r) && r.length >= 1 ? String(r[0]) : '',
          renderItemLen: Array.isArray(r) ? r.length : -1,
        });
      }
      const props = convertFnFormLambdasInProps(rawProps);

      if (isEmbedded) {
        xOrbitalLog.info('slot:embed-routed', {
          sourceTrait,
          slot: eff.slot,
          patternType: typeof patternType === 'string' ? patternType : undefined,
        });
        uiSlots.updateTraitContent(sourceTrait, {
          pattern: patternType as string,
          props,
          priority: 0,
          animation: 'fade',
        });
      } else {
        xOrbitalLog.info('slot-write', {
          slot: eff.slot,
          sourceTrait,
          patternType: typeof patternType === 'string' ? patternType : undefined,
        });
        uiSlots.render({
          target: eff.slot as Parameters<typeof uiSlots.render>[0]['target'],
          pattern: patternType as string,
          props,
          sourceTrait,
        });
      }
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
function TraitInitializer({ traits, orbitalNames, onNavigate, onLocalFallback, persistence, traitConfigsByName, orbitalsByTrait, embeddedTraits }: {
  traits: unknown[];
  orbitalNames?: string[];
  traitConfigsByName?: Record<string, import('@almadar/core').TraitConfig>;
  /** Trait → orbital map; gap #13 qualified bus key. */
  orbitalsByTrait?: Record<string, string>;
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
  /**
   * Set of trait names referenced via `@trait.X` by some sibling layout
   * in the resolved schema. When an effect's `traitName` is in this set,
   * `applyServerEffects` updates only the per-trait sidecar and skips
   * the slot write — the layout owns the slot and embeds via TraitFrame.
   * Mirrors compiled-path codegen semantics.
   */
  embeddedTraits?: ReadonlySet<string>;
}) {
  const bridge = useServerBridge();
  // Single slot store: `useUISlots`. Both the server-bridge path
  // (`applyServerEffects`) and the local trait state-machine path
  // (`useTraitStateMachine`) write here directly. Pre-consolidation
  // there were two stores (`SlotsContext.slots` mirrored into
  // `useUISlots` by a SlotBridge effect) — those races caused the
  // SlotBridge to clear the layout that `applyServerEffects` had
  // just written. Removed entirely; this is the single source of truth.
  const uiSlots = useUISlots();

  // Forward events to server, apply enriched effects directly to slots.
  // V2 Phase 6: the server response no longer carries `meta.data`; fetched
  // entities flow through the event bus via typed emit payloads, which the
  // state machine listeners bind into `@payload.data` and the renderer
  // consumes as pre-resolved `entity` props. No EntityStore hydration.
  //
  // Gap #11: scope the server fan-out to the orbitals whose traits actually
  // transitioned this event. Pre-fix, the loop dispatched every event to
  // every registered orbital, so a single click of DealCreate's CREATE button
  // also fired ContactCreate.CREATE and NoteCompose.CREATE on the server,
  // and their render-ui patterns landed in the same modal slot — three
  // orbitals' UI stacked at once. `dispatchedOrbitals` (passed by
  // useTraitStateMachine) is the set of owning orbitals for the traits that
  // actually executed; only those need a server round-trip.
  const onEventProcessed = useCallback(async (
    event: string,
    payload?: Record<string, unknown>,
    dispatchedOrbitals?: Set<string>,
  ) => {
    if (!bridge.connected || !orbitalNames?.length) return;
    const targets = dispatchedOrbitals && dispatchedOrbitals.size > 0
      ? orbitalNames.filter((n) => dispatchedOrbitals.has(n))
      : orbitalNames;
    xOrbitalLog.info('TraitInitializer:fanout', {
      event,
      sentTo: targets,
      skipped: orbitalNames.filter((n) => !targets.includes(n)),
      dispatchedOrbitalsSize: dispatchedOrbitals?.size ?? 0,
    });
    for (const name of targets) {
      const { effects, meta } = await bridge.sendEvent(name, event, payload);
      recordServerResponse(name, event, meta);
      applyServerEffects(effects, uiSlots, onNavigate, embeddedTraits);
    }
  }, [bridge.connected, bridge.sendEvent, orbitalNames, uiSlots, onNavigate, embeddedTraits]);

  const opts = orbitalNames
    ? { onEventProcessed, navigate: onNavigate, traitConfigsByName, orbitalsByTrait, embeddedTraits }
    : { navigate: onNavigate, persistence, traitConfigsByName, orbitalsByTrait, embeddedTraits };
  const { sendEvent } = useTraitStateMachine(traits as Parameters<typeof useTraitStateMachine>[0], uiSlots, opts);

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
        applyServerEffects(effects, uiSlots, onNavigate, embeddedTraits);
      }
    })();
  }, [bridge.connected, orbitalNames, bridge.sendEvent, uiSlots, onNavigate, embeddedTraits]);

  return null;
}

/**
 * Resolves schema, mounts trait state machines, and renders the UI.
 * When `serverUrl` is provided, wraps with ServerBridgeProvider and
 * forwards events to the server after local processing.
 */
function SchemaRunner({ schema, serverUrl, transport, mockData, pageName, onNavigate, onLocalFallback, persistence }: {
  schema: unknown;
  serverUrl?: string;
  transport?: ServerBridgeTransport;
  mockData?: Record<string, unknown[]>;
  pageName?: string;
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
  /** GAP-19: forwarded to TraitInitializer to surface server-bridge fallback. */
  onLocalFallback?: () => void;
  /** Offline-preview persistence layer. */
  persistence?: PersistenceAdapter;
}) {
  const { traits, allEntities, ir } = useResolvedSchema(schema as Parameters<typeof useResolvedSchema>[0], pageName);

  // Gap #13: orbitals are bound to pages, so trait subscriptions must be
  // route-scoped. Pre-fix, this branch collected traits from every page on
  // initial load — so on standalone preview (where no `navigate` effect
  // ever fires) ALL orbitals' traits mounted simultaneously. A bare CREATE
  // dispatched on the Deals page reached ContactCreate too, opening the
  // wrong modal (gap #13 evidence: runtime-verify and orbital-verify
  // frames showed Contact modals on Deal walks).
  //
  // Fix: when no page is explicitly active, mount only the FIRST page's
  // traits — a single orbital's worth, matching the compiled-shell
  // route-mounted layout. Cross-orbital channels still flow via the
  // qualified `UI:Orbital.Trait.EVENT` bus key (Phase 4 unification);
  // orbital isolation is now enforced at both subscription and dispatch
  // layers.
  const allPageTraits = useMemo<ResolvedTraitBinding[]>(() => {
    // If a specific page was navigated to, use its traits only.
    if (pageName && traits.length > 0) return traits;
    // For single-page schemas the resolved traits are already the right set.
    if (!ir?.pages || ir.pages.size <= 1) return traits;
    // Initial load with multiple pages: pick the first page's traits.
    // The schema's first `page` declaration is the canonical default
    // landing page, mirroring the compiled shell's `<Route index>`.
    const firstPage = ir.pages.values().next().value;
    if (!firstPage) return traits;
    const firstPageTraits: ResolvedTraitBinding[] = [];
    const seen = new Set<string>();
    for (const binding of firstPage.traits) {
      const name = binding.trait.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        firstPageTraits.push(binding);
      }
    }
    return firstPageTraits.length > 0 ? firstPageTraits : traits;
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

  // Gap #13: trait-name → owning-orbital-name map. Built from
  // `schema.orbitals[].traits[]` so `useTraitStateMachine` can construct
  // the qualified `UI:Orbital.Trait.EVENT` bus key at both subscribe and
  // emit sites — same scope shape the compiled codegen produces.
  const orbitalsByTrait = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const parsed = schema as OrbitalSchema | undefined;
    if (!parsed?.orbitals) return map;
    for (const orb of parsed.orbitals) {
      for (const traitRef of orb.traits) {
        let traitName: string | undefined;
        if (typeof traitRef === 'string') {
          const parts = traitRef.split('.');
          traitName = parts[parts.length - 1];
        } else if ('ref' in traitRef && typeof traitRef.ref === 'string') {
          const parts = traitRef.ref.split('.');
          traitName = traitRef.name ?? parts[parts.length - 1];
        } else if ('name' in traitRef && typeof traitRef.name === 'string') {
          traitName = traitRef.name;
        }
        if (traitName) map[traitName] = orb.name;
      }
    }
    return map;
  }, [schema]);

  // Per-trait linkedEntity map for EntitySchemaProvider. Walks every
  // page's bindings once. Wrapped in `useMemo` so the resulting `Map`
  // reference is stable across renders — downstream provider memo
  // depends on it.
  const traitLinkedEntitiesMap = useMemo<ReadonlyMap<string, string>>(() => {
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
  }, [ir]);

  // `orbitalsByTrait` shaped as a `ReadonlyMap` for EntitySchemaProvider.
  // Same source of truth as the Record above (`orbitalsByTrait`), just
  // the Map shape the provider's context expects. Memoized against the
  // Record so it only rebuilds when the schema changes.
  const orbitalsByTraitMap = useMemo<ReadonlyMap<string, string>>(
    () => new Map(Object.entries(orbitalsByTrait)),
    [orbitalsByTrait],
  );

  // Stable array of resolved entities for EntitySchemaProvider. Without
  // memoization the inline `Array.from(...)` allocation produces a new
  // array reference per render, busting downstream `useMemo` deps.
  const entitiesArray = useMemo(() => Array.from(allEntities.values()), [allEntities]);

  // Gap #11: orbitals whose traits are mounted on the active page. The
  // server-bridge fan-out (both user-event and INIT) restricts to this
  // subset so off-page orbitals don't initialize server-side and leak
  // their `(render-ui main {...})` patterns into the active page's slot.
  // Cross-orbital `listens` still fire because the server has every
  // orbital registered; this only narrows the client's dispatch breadth.
  const pageOrbitalNames = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const binding of allPageTraits) {
      const orb = orbitalsByTrait[binding.trait.name];
      if (orb) set.add(orb);
    }
    return Array.from(set);
  }, [allPageTraits, orbitalsByTrait]);

  // Gap #11: emit allPageTraits at mount/page-change so runtime-verify's
  // console capture shows which traits the runtime path believes belong on
  // the active page. Compare against the .lolo `page "X" -> ...` declaration
  // and against compiled codegen to detect under-mount or over-mount.
  useEffect(() => {
    const traitNames = allPageTraits.map((b) => b.trait.name);
    const orbitalsByTraitForPage: Record<string, string> = {};
    for (const name of traitNames) {
      const orb = orbitalsByTrait[name];
      if (orb) orbitalsByTraitForPage[name] = orb;
    }
    xOrbitalLog.info('SchemaRunner:mount', {
      pageName,
      traitNames,
      orbitalsByTraitForPage,
      pageOrbitalNames: pageOrbitalNames.join(','),
    });
  }, [pageName, allPageTraits, orbitalsByTrait, pageOrbitalNames]);

  // Map trait name → TraitConfig from the orbital-level traits[] entries.
  // @almadar/core's page resolver doesn't propagate config from the
  // orbital level into the page-level binding, so the client-side
  // StateMachineManager would otherwise see no config and OPEN guards
  // like `["or", ["=", "@config.mode", "create"], "@payload.row"]` would
  // reject the create flow.
  const traitConfigsByName = useMemo(() => {
    const map: Record<string, import('@almadar/core').TraitConfig> = {};
    const parsed = schema as Record<string, unknown>;
    const orbitals = parsed?.orbitals as Array<Record<string, unknown>> | undefined;
    if (!orbitals) return map;
    for (const orb of orbitals) {
      const traits = orb.traits as Array<Record<string, unknown>> | undefined;
      if (!traits) continue;
      for (const t of traits) {
        const name = (t.name ?? t.ref) as string | undefined;
        const config = t.config as import('@almadar/core').TraitConfig | undefined;
        if (typeof name === 'string' && config !== undefined) {
          map[name] = config;
        }
      }
    }
    return map;
  }, [schema]);

  // V2 Phase 6: EntityStore is gone. Standalone-preview (no serverUrl) with
  // `mockData` no longer hydrates a shared store; mock data now flows through
  // the event bus the same way a real server response does — i.e. traits
  // that `fetch` during INIT need a mock bridge to surface the data as
  // `@payload.data` on the success emit. See Almadar_Entity_V2_Plan.md §13
  // for the deferred standalone-preview mock-data wiring.
  void mockData;

  // Embed-aware slot routing: walk the resolved schema once, collect
  // every trait name referenced via `@trait.X` by some sibling layout's
  // render-ui. `applyServerEffects` uses this to route those traits'
  // render outputs to per-trait sidecars instead of the global slot.
  // Mirrors compiled-path codegen which inlines atom views as JSX
  // inside the layout's pattern rather than writing a shared slot.
  const embeddedTraits = useMemo(() => {
    const set = collectEmbeddedTraits(schema as OrbitalSchema | undefined);
    xOrbitalLog.info('SchemaRunner:embeddedTraits', {
      pageName,
      embedded: Array.from(set),
      embeddedCount: set.size,
    });
    return set;
  }, [schema, pageName]);

  const inner = (
    <VerificationProvider enabled>
      <EntitySchemaProvider
        entities={entitiesArray}
        traitLinkedEntities={traitLinkedEntitiesMap}
        orbitalsByTrait={orbitalsByTraitMap}
      >
        <TraitInitializer
          traits={allPageTraits}
          orbitalNames={(serverUrl || transport) ? pageOrbitalNames : undefined}
          traitConfigsByName={traitConfigsByName}
          orbitalsByTrait={orbitalsByTrait}
          embeddedTraits={embeddedTraits}
          onNavigate={onNavigate}
          onLocalFallback={onLocalFallback}
          persistence={persistence}
        />
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
    </VerificationProvider>
  );

  if (serverUrl || transport) {
    return (
      <ServerBridgeProvider schema={schema} serverUrl={serverUrl} transport={transport}>
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
  /**
   * Custom transport for in-process execution. Mutually exclusive with
   * `serverUrl`. Used by `<BrowserPlayground>` to invoke
   * `OrbitalServerRuntime.processOrbitalEvent` directly without HTTP.
   */
  transport?: ServerBridgeTransport;
  /**
   * Initial page path to render (e.g. `/deals`). Resolves against the
   * schema's `pages[]` to seed `currentPage` so the right orbital's traits
   * mount on first render. Without this the playground falls back to the
   * schema's first page binding (gap #13 Phase 5). runtime-verify uses this
   * to walk DealCreate, NoteCompose, etc. on their owning pages.
   */
  initialPagePath?: string;
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
  transport,
  initialPagePath,
}: OrbPreviewProps): React.ReactElement {
  if (serverUrl && transport) {
    throw new Error('OrbPreview accepts serverUrl OR transport, not both');
  }
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

    // Skip the legacy autoMock prep pipeline when a runtime transport is
    // wired (`<BrowserPlayground>` runs `OrbitalServerRuntime` with
    // MockPersistenceAdapter — that's the single mock source).
    if (autoMock && !serverUrl && !transport) {
      const prepared = prepareSchemaForPreview(parsed);
      return { ok: true, schema: prepared.schema, mockData: prepared.mockData };
    }

    return { ok: true, schema: parsed, mockData: mockData ?? {} };
  }, [schema, autoMock, serverUrl, transport, mockData]);

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
    if (!parsedSchema || serverUrl || transport) return undefined;
    if (!autoMock) return undefined;
    const adapter = new InMemoryPersistence();
    adapter.seed(effectiveMockData as Record<string, import('@almadar/core').EntityRow[]>);
    return adapter;
  }, [parsedSchema, serverUrl, transport, autoMock, effectiveMockData]);

  // Discover pages from schema for effect-driven navigation
  const pages = useMemo(() => {
    if (!parsedSchema) return [];
    try {
      return getAllPages(parsedSchema);
    } catch {
      return [];
    }
  }, [parsedSchema]);

  // Seed from `initialPagePath` (gap #13 / runtime-verify per-trait
  // navigation): resolve the path against the schema's pages to get the
  // page NAME (the keying useResolvedSchema expects). Falls back to
  // undefined → SchemaRunner picks the schema's first page.
  const initialPageName = useMemo(() => {
    if (!initialPagePath) return undefined;
    const match = pages.find(({ page }) => page.path === initialPagePath);
    return match?.page.name;
  }, [pages, initialPagePath]);
  const [currentPage, setCurrentPage] = useState<string | undefined>(initialPageName);

  // When the parent passes a different initialPagePath later (e.g.
  // runtime-verify drives the playground via URL), keep currentPage
  // in sync. Pure-mount initialization handled by useState above.
  useEffect(() => {
    if (initialPageName && initialPageName !== currentPage) {
      setCurrentPage(initialPageName);
    }
  }, [initialPageName, currentPage]);

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
            transport={transport}
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
