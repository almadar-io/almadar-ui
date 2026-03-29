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
import { useResolvedSchema } from './useResolvedSchema';
import { useTraitStateMachine } from './useTraitStateMachine';
import { useSlotsActions, useSlots, SlotsProvider } from './ui/SlotsContext';
import { EntitySchemaProvider } from './EntitySchemaContext';
import { ServerBridgeProvider, useServerBridge } from './ServerBridge';
import { getAllPages } from '../renderer/navigation';
import { useEntityStore } from '../providers/EntityStoreProvider';
import { recordTransition, recordServerResponse, type EffectTrace } from '../lib/verificationRegistry';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a PatternConfig child from flat { type, ...props } to
 * { type, props: {...} } format expected by SlotContentRenderer.
 */
function normalizeChild(child: Record<string, unknown>): Record<string, unknown> {
  const { type, children, ...rest } = child;
  const normalizedChildren = Array.isArray(children)
    ? children.map((c) => normalizeChild(c as Record<string, unknown>))
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
      if (slotState.patterns.length === 0) {
        clear(slotName as Parameters<typeof clear>[0]);
        continue;
      }
      const entry = slotState.patterns[slotState.patterns.length - 1];
      const patternRecord = entry.pattern as unknown as Record<string, unknown>;

      const { type: patternType, children, ...inlineProps } = patternRecord;
      const normalizedChildren = Array.isArray(children)
        ? children.map((c) => normalizeChild(c as Record<string, unknown>))
        : children;
      render({
        target: slotName as Parameters<typeof render>[0]['target'],
        pattern: patternType as string,
        props: {
          ...inlineProps,
          ...entry.props,
          ...(normalizedChildren !== undefined ? { children: normalizedChildren } : {}),
        },
        sourceTrait: slotState.source?.trait,
      });
    }
  }, [slots, render, clear]);

  return null;
}

/**
 * Fires INIT event after mount so render-ui effects on the INIT
 * transition execute. Must be inside SlotsProvider + EntitySchemaProvider.
 *
 * When `orbitalNames` is provided (server bridge mode), events are forwarded
 * to the server after local processing. Server response provides enriched
 * patterns with entity data resolved reactively via useEntityRef.
 */
function TraitInitializer({ traits, orbitalNames, onNavigate }: {
  traits: unknown[];
  orbitalNames?: string[];
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
}) {
  const slotsActions = useSlotsActions();
  const bridge = useServerBridge();

  const entityStore = useEntityStore();

  // Forward events to server, apply enriched effects directly to slots
  const onEventProcessed = useCallback(async (event: string, payload?: Record<string, unknown>) => {
    if (!bridge.connected || !orbitalNames?.length) return;
    for (const name of orbitalNames) {
      const { effects, meta } = await bridge.sendEvent(name, event, payload);

      // Record server response in verification timeline
      recordServerResponse(name, event, meta);

      // Advance EntityStore from server response data (ref operator support)
      // When persist/set/swap mutates a ref'd entity, the server includes fresh data
      // in meta.data. Advancing the store triggers useEntityRef subscribers.
      const responseData = (meta as unknown as Record<string, unknown> | undefined)?.data as Record<string, unknown[]> | undefined;
      if (responseData) {
        for (const [entityType, records] of Object.entries(responseData)) {
          if (Array.isArray(records)) {
            entityStore.setAll(entityType, records);
          }
        }
      }

      for (const eff of effects) {
        if (eff.type === 'render-ui' && eff.slot && eff.pattern) {
          // Set raw pattern config. Entity resolution happens reactively in
          // SlotContentRenderer via useEntityRef (EntityStore already advanced above).
          slotsActions.setSlotPatterns(
            eff.slot,
            [{ pattern: eff.pattern as Parameters<typeof slotsActions.setSlotPatterns>[1][0]['pattern'], props: {} }],
            { trait: 'server', state: 'server', transition: 'server-effect' },
          );
        } else if (eff.type === 'navigate' && eff.route && onNavigate) {
          onNavigate(eff.route, eff.params as Record<string, unknown> | undefined);
        }
      }
    }
  }, [bridge.connected, bridge.sendEvent, orbitalNames, slotsActions, onNavigate, entityStore]);

  const opts = orbitalNames
    ? { onEventProcessed, navigate: onNavigate }
    : { navigate: onNavigate };
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
    const fallback = setTimeout(() => {
      if (!initSentRef.current) {
        sendEvent('INIT');
      }
    }, 5000);
    return () => clearTimeout(fallback);
  }, [traits, orbitalNames, sendEvent]);

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

        // Advance EntityStore from INIT response so useEntityRef subscribers
        // get entity data before slot patterns render.
        const initResponseData = (meta as unknown as Record<string, unknown>)?.data as Record<string, unknown[]> | undefined;
        if (initResponseData) {
          for (const [entityType, records] of Object.entries(initResponseData)) {
            if (Array.isArray(records)) {
              entityStore.setAll(entityType, records);
            }
          }
        }

        for (const eff of effects) {
          if (eff.type === 'render-ui' && eff.slot && eff.pattern) {
            slotsActions.setSlotPatterns(
              eff.slot,
              [{ pattern: eff.pattern as Parameters<typeof slotsActions.setSlotPatterns>[1][0]['pattern'], props: {} }],
              { trait: 'server', state: 'server', transition: 'server-effect' },
            );
          }
        }
      }
    })();
  }, [bridge.connected, orbitalNames, bridge.sendEvent, slotsActions]);

  return null;
}

/**
 * Resolves schema, mounts trait state machines, and renders the UI.
 * When `serverUrl` is provided, wraps with ServerBridgeProvider and
 * forwards events to the server after local processing.
 */
function SchemaRunner({ schema, serverUrl, mockData, pageName, onNavigate }: {
  schema: unknown;
  serverUrl?: string;
  mockData?: Record<string, unknown[]>;
  pageName?: string;
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
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

  // Seed EntityStore with mock data for non-server preview.
  // useEntityRef subscribers will reactively pick up this data.
  const entityStore = useEntityStore();
  useEffect(() => {
    if (!serverUrl && mockData) {
      for (const [entityType, records] of Object.entries(mockData)) {
        if (Array.isArray(records)) {
          entityStore.setAll(entityType, records);
        }
      }
    }
  }, [mockData, serverUrl, entityStore]);

  const inner = (
    <VerificationProvider enabled>
      <SlotsProvider>
        <EntitySchemaProvider entities={Array.from(allEntities.values())}>
          <TraitInitializer traits={allPageTraits} orbitalNames={serverUrl ? orbitalNames : undefined} onNavigate={onNavigate} />
          <SlotBridge />
          <Box className="min-h-full p-4">
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
  /** The orbital schema. Accepts a JSON string or an OrbitalSchema object. */
  schema: string | import('@almadar/core').OrbitalSchema;
  /** Mock entity data keyed by entity name. */
  mockData?: Record<string, unknown[]>;
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
 * <OrbPreview schema={schema} serverUrl="/api/orbitals" />
 * ```
 */
export function OrbPreview({
  schema,
  mockData = {},
  height = '400px',
  className,
  serverUrl,
}: OrbPreviewProps): React.ReactElement {
  const parsedSchema = useMemo(() => {
    if (typeof schema === 'string') {
      try {
        return JSON.parse(schema);
      } catch (e) {
        return { error: String(e) };
      }
    }
    return schema;
  }, [schema]);

  // Discover pages from schema for effect-driven navigation
  const pages = useMemo(() => {
    if (!parsedSchema || parsedSchema.error) return [];
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

  if (parsedSchema.error) {
    return (
      <Box className={className} style={{ height }}>
        <Typography as="pre" color="error" variant="small" className="font-mono whitespace-pre-wrap break-all m-0 p-4">
          Parse error: {parsedSchema.error}
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
      <OrbitalProvider initialData={mockData} skipTheme verification>
        <UISlotProvider>
          <SchemaRunner schema={parsedSchema} serverUrl={serverUrl} mockData={mockData} pageName={currentPage} onNavigate={handleNavigate} />
        </UISlotProvider>
      </OrbitalProvider>
    </Box>
  );
}

OrbPreview.displayName = 'OrbPreview';
