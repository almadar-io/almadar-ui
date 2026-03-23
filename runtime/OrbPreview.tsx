'use client';

/**
 * OrbPreview Component
 *
 * Renders a live preview of an Orbital schema (.orb program).
 * Lazily loads the full runtime stack (providers, context, state machines)
 * and renders the schema's UI via UISlotRenderer.
 *
 * Usage:
 *   <OrbPreview schema={orbJsonStringOrObject} />
 *
 * @packageDocumentation
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../components/atoms/Box';
import { Typography } from '../components/atoms/Typography';
import { ServerBridgeProvider, useServerBridge } from './ServerBridge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlotPatternEntry { pattern: Record<string, unknown>; props: Record<string, unknown> }
interface SlotState { patterns: SlotPatternEntry[]; source?: { trait?: string } }

interface RuntimeComponents {
  OrbitalProvider: React.ComponentType<{ children: ReactNode; initialData?: Record<string, unknown[]>; skipTheme?: boolean; verification?: boolean }>;
  UISlotProvider: React.ComponentType<{ children: ReactNode }>;
  SlotsProvider: React.ComponentType<{ children: ReactNode }>;
  EntitySchemaProvider: React.ComponentType<{ entities: unknown[]; children: ReactNode }>;
  VerificationProvider: React.ComponentType<{ children: ReactNode; enabled?: boolean }>;
  UISlotRenderer: React.ComponentType<{ includeHud?: boolean; hudMode?: 'fixed' | 'inline'; includeFloating?: boolean }>;
  useResolvedSchema: (schema: unknown) => { page: unknown; traits: unknown[]; allEntities: Map<string, unknown>; ir: { pages?: Map<string, { traits: unknown[] }> } | null };
  useTraitStateMachine: (traits: unknown[], actions: unknown, opts?: unknown) => { sendEvent: (event: string, payload?: Record<string, unknown>) => void };
  useSlotsActions: () => unknown;
  useSlots: () => Record<string, SlotState>;
  useUISlots: () => { render: (cfg: { target: string; pattern: string; props?: Record<string, unknown>; sourceTrait?: string }) => void; clear: (slot: string) => void };
}

// ---------------------------------------------------------------------------
// Runtime loader (cached)
// ---------------------------------------------------------------------------

let runtimeCache: RuntimeComponents | null = null;

async function loadRuntime(): Promise<RuntimeComponents> {
  if (runtimeCache) return runtimeCache;
  const [providers, context, runtime, components] = await Promise.all([
    import('@almadar/ui/providers'),
    import('@almadar/ui/context'),
    import('@almadar/ui/runtime'),
    import('@almadar/ui/components'),
  ]);
  runtimeCache = {
    OrbitalProvider: providers.OrbitalProvider,
    UISlotProvider: context.UISlotProvider,
    SlotsProvider: runtime.SlotsProvider,
    EntitySchemaProvider: runtime.EntitySchemaProvider as unknown as RuntimeComponents['EntitySchemaProvider'],
    VerificationProvider: providers.VerificationProvider,
    UISlotRenderer: components.UISlotRenderer,
    useResolvedSchema: runtime.useResolvedSchema as unknown as RuntimeComponents['useResolvedSchema'],
    useTraitStateMachine: runtime.useTraitStateMachine as unknown as RuntimeComponents['useTraitStateMachine'],
    useSlotsActions: runtime.useSlotsActions,
    useSlots: runtime.useSlots,
    useUISlots: context.useUISlots as unknown as RuntimeComponents['useUISlots'],
  } satisfies Record<string, unknown> as RuntimeComponents;
  return runtimeCache;
}

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
function SlotBridge({ rt }: { rt: RuntimeComponents }) {
  const slots = rt.useSlots();
  const { render, clear } = rt.useUISlots();

  useEffect(() => {
    for (const [slotName, slotState] of Object.entries(slots)) {
      if (slotState.patterns.length === 0) {
        clear(slotName);
        continue;
      }
      const entry = slotState.patterns[slotState.patterns.length - 1];
      const { type: patternType, children, ...inlineProps } = entry.pattern;
      const normalizedChildren = Array.isArray(children)
        ? children.map((c) => normalizeChild(c as Record<string, unknown>))
        : children;
      render({
        target: slotName,
        pattern: patternType as string,
        props: {
          ...inlineProps,
          ...entry.props,
          ...(normalizedChildren !== undefined ? { children: normalizedChildren } : {}),
        },
        sourceTrait: slotState.source?.trait,
      });
    }
  }, [slots]);

  return null;
}

/**
 * Fires INIT event after mount so render-ui effects on the INIT
 * transition execute. Must be inside SlotsProvider + EntitySchemaProvider.
 *
 * When `orbitalNames` is provided (server bridge mode), events are forwarded
 * to the server after local processing via onEventProcessed.
 */
function TraitInitializer({ rt, traits, orbitalNames }: {
  rt: RuntimeComponents;
  traits: unknown[];
  orbitalNames?: string[];
}) {
  const slotsActions = rt.useSlotsActions();
  const bridge = useServerBridge();

  const onEventProcessed = useCallback((event: string, payload?: Record<string, unknown>) => {
    if (!bridge.connected || !orbitalNames?.length) return;
    for (const name of orbitalNames) {
      bridge.sendEvent(name, event, payload);
    }
  }, [bridge.connected, bridge.sendEvent, orbitalNames]);

  const opts = orbitalNames ? { onEventProcessed } : {};
  const { sendEvent } = rt.useTraitStateMachine(traits, slotsActions, opts);

  // Send INIT after mount
  useEffect(() => {
    const t = setTimeout(() => sendEvent('INIT'), 50);
    return () => clearTimeout(t);
  }, [traits]);

  // Re-send INIT to server when bridge connects (fixes timing: local INIT fires before server is ready)
  const initSentRef = useRef(false);
  useEffect(() => {
    if (!bridge.connected || !orbitalNames?.length || initSentRef.current) return;
    initSentRef.current = true;
    for (const name of orbitalNames) {
      bridge.sendEvent(name, 'INIT', {});
    }
  }, [bridge.connected, orbitalNames, bridge.sendEvent]);

  return null;
}

/**
 * Resolves schema, mounts trait state machines, and renders the UI.
 * When `serverUrl` is provided, wraps with ServerBridgeProvider and
 * forwards events to the server after local processing.
 */
function SchemaRunner({ rt, schema, mockData, serverUrl }: {
  rt: RuntimeComponents;
  schema: unknown;
  mockData: Record<string, unknown[]>;
  serverUrl?: string;
}) {
  const { traits, allEntities, ir } = rt.useResolvedSchema(schema);

  // For multi-page schemas, collect traits from ALL pages
  const allPageTraits = useMemo(() => {
    if (!ir?.pages || ir.pages.size <= 1) return traits;
    const combined: unknown[] = [];
    const seen = new Set<string>();
    for (const page of ir.pages.values()) {
      for (const t of page.traits) {
        const binding = t as Record<string, unknown>;
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
    <rt.VerificationProvider enabled>
      <rt.SlotsProvider>
        <rt.EntitySchemaProvider entities={Array.from(allEntities.values())}>
          <TraitInitializer rt={rt} traits={allPageTraits} orbitalNames={serverUrl ? orbitalNames : undefined} />
          <SlotBridge rt={rt} />
          <Box className="min-h-full p-4">
            <rt.UISlotRenderer includeHud hudMode="inline" includeFloating />
          </Box>
        </rt.EntitySchemaProvider>
      </rt.SlotsProvider>
    </rt.VerificationProvider>
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
 * Lazily loads the full Almadar runtime (providers, state machines, slot system)
 * and renders the schema's UI. Suitable for documentation sites, playgrounds,
 * and any context where you want to show a running .orb program.
 *
 * @example
 * ```tsx
 * <OrbPreview schema={orbJsonString} height="300px" />
 * ```
 */
export function OrbPreview({
  schema,
  mockData = {},
  height = '400px',
  className,
  serverUrl,
}: OrbPreviewProps): React.ReactElement {
  const [rt, setRt] = useState<RuntimeComponents | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadRuntime().then(setRt).catch((e) => setError(String(e)));
  }, []);

  if (parsedSchema.error) {
    return (
      <Box className={className} style={{ height }}>
        <Typography as="pre" color="error" variant="small" className="font-mono whitespace-pre-wrap break-all m-0 p-4">
          Parse error: {parsedSchema.error}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className} style={{ height }}>
        <Typography as="pre" color="error" variant="small" className="font-mono whitespace-pre-wrap break-all m-0 p-4">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!rt) {
    return (
      <Box className={`flex items-center justify-center ${className ?? ''}`} style={{ height }}>
        <Typography color="muted" variant="small">Loading runtime...</Typography>
      </Box>
    );
  }

  return (
    <Box
      className={`overflow-auto border border-[var(--color-border)] rounded-[var(--radius-md)] ${className ?? ''}`}
      style={{ height }}
    >
      <rt.OrbitalProvider initialData={mockData} skipTheme verification>
        <rt.UISlotProvider>
          <SchemaRunner rt={rt} schema={parsedSchema} mockData={mockData} serverUrl={serverUrl} />
        </rt.UISlotProvider>
      </rt.OrbitalProvider>
    </Box>
  );
}

OrbPreview.displayName = 'OrbPreview';
