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
import { enrichFromResponse } from './enrichFromResponse';
import { getAllPages } from '../renderer/navigation';
import { recordTransition, type EffectTrace } from '../lib/verificationRegistry';

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
function SlotBridge({ mockData }: { mockData?: Record<string, unknown[]> }) {
  const slots = useSlots();
  const { render, clear } = useUISlots();

  useEffect(() => {
    for (const [slotName, slotState] of Object.entries(slots)) {
      if (slotState.patterns.length === 0) {
        clear(slotName as Parameters<typeof clear>[0]);
        continue;
      }
      const entry = slotState.patterns[slotState.patterns.length - 1];
      let patternRecord = entry.pattern as unknown as Record<string, unknown>;

      // Offline entity enrichment: resolve entity string refs to actual data
      // from mockData. In server mode, enrichFromResponse does this on the
      // server response. In offline mode, we do it here.
      if (mockData && Object.keys(mockData).length > 0) {
        patternRecord = enrichFromResponse(patternRecord, mockData);
      }

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
  }, [slots, render, clear, mockData]);

  return null;
}

/**
 * Fires INIT event after mount so render-ui effects on the INIT
 * transition execute. Must be inside SlotsProvider + EntitySchemaProvider.
 *
 * When `orbitalNames` is provided (server bridge mode), events are forwarded
 * to the server after local processing. Server response provides enriched
 * patterns with entity data injected via enrichFromResponse.
 */
function TraitInitializer({ traits, orbitalNames }: {
  traits: unknown[];
  orbitalNames?: string[];
}) {
  const slotsActions = useSlotsActions();
  const bridge = useServerBridge();

  // Forward events to server, apply enriched effects directly to slots
  const onEventProcessed = useCallback(async (event: string, payload?: Record<string, unknown>) => {
    if (!bridge.connected || !orbitalNames?.length) return;
    for (const name of orbitalNames) {
      const effects = await bridge.sendEvent(name, event, payload);
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
  }, [bridge.connected, bridge.sendEvent, orbitalNames, slotsActions]);

  const opts = orbitalNames ? { onEventProcessed } : {};
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
        const effects = await bridge.sendEvent(name, 'INIT', {});
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
function SchemaRunner({ schema, serverUrl, mockData, pageName }: {
  schema: unknown;
  serverUrl?: string;
  mockData?: Record<string, unknown[]>;
  pageName?: string;
}) {
  const { traits, allEntities, ir } = useResolvedSchema(schema as Parameters<typeof useResolvedSchema>[0], pageName);

  // For multi-page schemas, collect traits from ALL pages
  const allPageTraits = useMemo(() => {
    if (!ir?.pages || ir.pages.size <= 1) return traits;
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
  }, [ir, traits]);

  // Extract orbital names from schema for server event forwarding
  const orbitalNames = useMemo(() => {
    const parsed = schema as Record<string, unknown>;
    const orbitals = parsed?.orbitals as Array<Record<string, unknown>> | undefined;
    if (!orbitals) return [];
    return orbitals
      .filter((o) => typeof o.name === 'string')
      .map((o) => o.name as string);
  }, [schema]);

  const inner = (
    <VerificationProvider enabled>
      <SlotsProvider>
        <EntitySchemaProvider entities={Array.from(allEntities.values())}>
          <TraitInitializer traits={allPageTraits} orbitalNames={serverUrl ? orbitalNames : undefined} />
          <SlotBridge mockData={!serverUrl ? mockData : undefined} />
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
  /** The orbital schema. Accepts a JSON string or a parsed object. */
  schema: string | Record<string, unknown>;
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

  // Discover pages from schema for multi-page navigation
  const pages = useMemo(() => {
    if (!parsedSchema || parsedSchema.error) return [];
    try {
      return getAllPages(parsedSchema);
    } catch {
      return [];
    }
  }, [parsedSchema]);

  const [currentPage, setCurrentPage] = useState<string | undefined>(undefined);

  if (parsedSchema.error) {
    return (
      <Box className={className} style={{ height }}>
        <Typography as="pre" color="error" variant="small" className="font-mono whitespace-pre-wrap break-all m-0 p-4">
          Parse error: {parsedSchema.error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className={`border border-[var(--color-border)] rounded-[var(--radius-md)] flex flex-col ${className ?? ''}`}
      style={{ height }}
    >
      {pages.length > 1 && (
        <Box className="flex gap-1 px-2 py-1 bg-[var(--color-muted)] border-b border-[var(--color-border)] flex-shrink-0 z-10">
          {pages.map(({ page }) => (
            <button
              key={page.name}
              onClick={() => setCurrentPage(page.name)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                (currentPage ?? pages[0].page.name) === page.name
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-border)]'
              }`}
            >
              {page.name}
            </button>
          ))}
        </Box>
      )}
      <Box className="flex-1 overflow-auto">
        <OrbitalProvider initialData={mockData} skipTheme verification>
          <UISlotProvider>
            <SchemaRunner schema={parsedSchema} serverUrl={serverUrl} mockData={mockData} pageName={currentPage} />
          </UISlotProvider>
        </OrbitalProvider>
      </Box>
    </Box>
  );
}

OrbPreview.displayName = 'OrbPreview';
