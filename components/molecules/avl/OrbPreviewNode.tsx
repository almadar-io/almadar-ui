'use client';

/**
 * OrbPreviewNode
 *
 * React Flow node that renders a real OrbPreview inside it.
 * The canvas is always live and editable (like Figma). Clicking any
 * rendered UI element selects its pattern and shows props in the
 * TransitionPanel. No edit mode toggle needed.
 *
 * The header is the drag handle for React Flow. The content area
 * passes clicks through to the pattern elements.
 */

import React, { useMemo, useState, useCallback, useContext, createContext, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type {
  OrbitalSchema,
  OrbitalDefinition,
  Trait,
  Transition,
  Effect,
} from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { OrbPreview } from '../../../runtime/OrbPreview';
import type { PreviewNodeData, PatternEventSource, ScreenSize } from './avl-preview-types';
import { SCREEN_SIZE_PRESETS } from './avl-preview-types';
import { useEventBus } from '../../../hooks/useEventBus';
import { ALMADAR_DND_MIME, type DraggablePayload } from '../../../hooks/useDraggable';
import { formatPayloadTooltip } from './wire-validation';

// ---------------------------------------------------------------------------
// Contexts (provided by FlowCanvas)
// ---------------------------------------------------------------------------

export const ScreenSizeContext = createContext<ScreenSize>('tablet');

/** Selected pattern info, emitted when user clicks a UI element in the node. */
export interface SelectedPattern {
  /** The pattern type (e.g., "button", "input", "stack"). */
  patternType: string;
  /** The DOM element's data-pattern-id if available. */
  patternId?: string;
  /** The node this pattern belongs to. */
  nodeData: PreviewNodeData;
  /** The source trait for this slot content. */
  sourceTrait?: string;
  /** Bounding rect relative to the node for floating inspector positioning. */
  rect?: { top: number; left: number; width: number; height: number };
}

export const PatternSelectionContext = createContext<{
  selected: SelectedPattern | null;
  select: (pattern: SelectedPattern | null) => void;
}>({ selected: null, select: () => {} });

// ---------------------------------------------------------------------------
// State role colors
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<string, { border: string; dot: string }> = {
  initial: { border: '#16A34A', dot: '#22C55E' },
  terminal: { border: '#DC2626', dot: '#EF4444' },
  hub: { border: '#2563EB', dot: '#3B82F6' },
  error: { border: '#D97706', dot: '#F59E0B' },
  default: { border: 'var(--color-border)', dot: '#6B7280' },
};

const LAYER_COLORS: Record<string, string> = {
  Infrastructure: '#3B82F6',
  Services: '#F59E0B',
  'UI Patterns': '#8B5CF6',
  Game: '#22C55E',
  ML: '#EC4899',
  Domain: '#6366F1',
  Community: '#6B7280',
};

// ---------------------------------------------------------------------------
// Handle styles
// ---------------------------------------------------------------------------

const TARGET_HANDLE_STYLE: React.CSSProperties = {
  background: 'var(--color-primary)',
  width: 8,
  height: 8,
  border: '2px solid var(--color-card)',
};

function eventHandleStyle(source: PatternEventSource): React.CSSProperties {
  return {
    background: '#F97316',
    width: 10,
    height: 10,
    border: '2px solid var(--color-card)',
    top: `${source.positionHint * 100}%`,
    right: -5,
  };
}

// ---------------------------------------------------------------------------
// Schema builders for OrbPreview
// ---------------------------------------------------------------------------

function buildOrbitalSchema(
  fullSchema: OrbitalSchema,
  orbitalName: string,
): OrbitalSchema {
  const orbital = (fullSchema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return fullSchema;
  return { ...fullSchema, name: `${fullSchema.name}__${orbitalName}`, orbitals: [orbital] };
}

function buildTransitionSchema(
  fullSchema: OrbitalSchema,
  orbitalName: string,
  traitName: string,
  transitionEvent: string,
  fromState?: string,
  toState?: string,
): OrbitalSchema {
  const orbital = (fullSchema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return fullSchema;

  const clonedOrbital: OrbitalDefinition = JSON.parse(JSON.stringify(orbital));

  const traits = clonedOrbital.traits ?? [];
  for (let ti = 0; ti < traits.length; ti++) {
    const trait = traits[ti];
    if (typeof trait === 'string' || !('stateMachine' in (trait as Record<string, unknown>))) continue;
    const traitObj = trait as Trait;
    if (traitObj.name !== traitName) continue;

    const sm = traitObj.stateMachine;
    if (!sm) continue;

    const allTransitions = sm.transitions as Transition[];
    const targetTransition = fromState && toState
      ? allTransitions.find(t => t.event === transitionEvent && t.from === fromState && t.to === toState)
        ?? allTransitions.find(t => t.event === transitionEvent)
      : allTransitions.find(t => t.event === transitionEvent);
    if (!targetTransition?.effects) continue;

    const renderUIEffects: Effect[] = [];
    for (const eff of targetTransition.effects) {
      if (Array.isArray(eff) && eff[0] === 'render-ui') {
        renderUIEffects.push(eff as Effect);
      }
    }

    if (renderUIEffects.length === 0) continue;

    const rewrittenSm = {
      states: [{ name: 'preview', isInitial: true }],
      events: [{ key: 'INIT', name: 'INIT' }],
      transitions: [{ from: 'preview', to: 'preview', event: 'INIT', effects: renderUIEffects }],
    };

    (traits[ti] as Record<string, unknown>).stateMachine = rewrittenSm;
    (traits[ti] as Record<string, unknown>).emits = [];
    (traits[ti] as Record<string, unknown>).listens = [];
    break;
  }

  const targetTrait = traits.find((t) => {
    if (typeof t === 'string') return t === traitName;
    if ('name' in t) return t.name === traitName;
    if ('ref' in t) return t.ref === traitName;
    return false;
  });
  if (targetTrait) {
    clonedOrbital.traits = [targetTrait];
  }

  return { ...fullSchema, name: `${fullSchema.name}__${orbitalName}__${traitName}__${transitionEvent}`, orbitals: [clonedOrbital] };
}

// ---------------------------------------------------------------------------
// Selection highlight styles (injected once)
// ---------------------------------------------------------------------------

const SELECTION_STYLES = `
  .orb-preview-live [data-pattern]:hover {
    outline: 2px dashed var(--color-primary);
    outline-offset: 1px;
    cursor: pointer;
  }
  .orb-preview-live [data-pattern].pattern-selected {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
  .orb-preview-live.drag-active [data-accepts-children="true"] {
    outline: 2px dashed var(--color-primary);
    outline-offset: -2px;
    transition: outline-color 0.15s, background-color 0.15s;
  }
  .orb-preview-live.drag-active [data-accepts-children="true"].drag-hover {
    outline-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
  }
  .orb-preview-live .drop-indicator {
    height: 2px;
    background: var(--color-primary);
    border-radius: 1px;
    pointer-events: none;
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OrbPreviewNodeInner: React.FC<NodeProps> = (props) => {
  const data = props.data as PreviewNodeData;
  const screenSize = useContext(ScreenSizeContext);
  const preset = SCREEN_SIZE_PRESETS[screenSize];
  const { select } = useContext(PatternSelectionContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const role = data.stateRole ?? 'default';
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.default;
  const eventSources = data.eventSources ?? [];
  const layerColor = data.layer ? LAYER_COLORS[data.layer] : undefined;

  const isExpanded = Boolean(data.traitName);
  const label = isExpanded
    ? `${data.transitionEvent ?? ''}`
    : data.orbitalName;
  const sublabel = isExpanded
    ? `${data.fromState ?? ''} \u2192 ${data.toState ?? ''}`
    : data.entityName ?? '';

  const orbitalSchema = useMemo(() => {
    const fullSchema = data._fullSchema as OrbitalSchema | undefined;
    if (!fullSchema) return undefined;

    if (isExpanded && data.traitName && data.transitionEvent) {
      return buildTransitionSchema(
        fullSchema,
        data.orbitalName,
        data.traitName,
        data.transitionEvent,
        data.fromState as string | undefined,
        data.toState as string | undefined,
      );
    }

    return buildOrbitalSchema(fullSchema, data.orbitalName);
  }, [data._fullSchema, data.orbitalName, data.traitName, data.transitionEvent, data.fromState, data.toState, isExpanded]);

  const mockData = (data._mockData as Record<string, unknown[]>) ?? undefined;

  // Click delegation: find the closest [data-pattern] ancestor of the click target
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent React Flow from interpreting as node click

    const target = e.target as HTMLElement;
    const patternEl = target.closest('[data-pattern]') as HTMLElement | null;

    // Clear previous selection highlights
    contentRef.current?.querySelectorAll('.pattern-selected').forEach(el => {
      el.classList.remove('pattern-selected');
    });

    if (patternEl) {
      patternEl.classList.add('pattern-selected');

      const nodeRect = contentRef.current?.getBoundingClientRect();
      const elRect = patternEl.getBoundingClientRect();

      select({
        patternType: patternEl.getAttribute('data-pattern') ?? 'unknown',
        patternId: patternEl.getAttribute('data-id') ?? undefined,
        sourceTrait: patternEl.getAttribute('data-source-trait') ?? undefined,
        nodeData: data,
        rect: nodeRect ? {
          top: elRect.top - nodeRect.top,
          left: elRect.left - nodeRect.left,
          width: elRect.width,
          height: elRect.height,
        } : undefined,
      });
    } else {
      select(null);
    }
  }, [data, select]);

  const eventBus = useEventBus();
  const [dragActive, setDragActive] = useState(false);

  // Listen for drag start/end from PatternPalette to toggle container highlighting
  useEffect(() => {
    const unsub1 = eventBus.on('UI:DRAG_START', (e) => {
      const kind = (e.payload as Record<string, unknown>)?.kind;
      if (kind === 'pattern') setDragActive(true);
    });
    const unsub2 = eventBus.on('UI:DRAG_END', () => setDragActive(false));
    return () => { unsub1(); unsub2(); };
  }, [eventBus]);

  // Drop handler: find nearest container and calculate insertion index
  const handlePreviewDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Remove all hover indicators
    contentRef.current?.querySelectorAll('.drag-hover, .drop-indicator').forEach(el => {
      el.classList.remove('drag-hover');
      if (el.classList.contains('drop-indicator')) el.remove();
    });

    const raw = e.dataTransfer.getData(ALMADAR_DND_MIME);
    if (!raw) return;
    let payload: DraggablePayload;
    try { payload = JSON.parse(raw) as DraggablePayload; } catch { return; }
    if (payload.kind !== 'pattern') return;

    // Walk up DOM to find nearest container with data-accepts-children
    let el = e.target as HTMLElement;
    while (el && el.dataset.acceptsChildren !== 'true') {
      el = el.parentElement as HTMLElement;
      if (!el || el === contentRef.current) break;
    }
    const containerPath = el?.dataset?.patternPath;
    if (!containerPath) {
      // Drop at root level
      eventBus.emit('UI:PATTERN_INSERT', {
        parentPath: 'root',
        patternType: payload.data.type as string,
        index: 0,
      });
      return;
    }

    // Calculate insertion index from cursor position among siblings
    const pathChildren = el.querySelectorAll(':scope > [data-pattern-path]');
    let insertIndex = pathChildren.length;

    for (let i = 0; i < pathChildren.length; i++) {
      const rect = pathChildren[i].getBoundingClientRect();
      const style = el.firstElementChild ? getComputedStyle(el.firstElementChild) : null;
      const isVertical = style?.flexDirection !== 'row';
      const mid = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      const cursor = isVertical ? e.clientY : e.clientX;
      if (cursor < mid) { insertIndex = i; break; }
    }

    eventBus.emit('UI:PATTERN_INSERT', {
      parentPath: containerPath,
      patternType: payload.data.type as string,
      index: insertIndex,
    });
  }, [eventBus]);

  const handlePreviewDragOver = useCallback((e: React.DragEvent) => {
    // Always preventDefault to allow drops (browser requirement)
    // Check for our MIME type in the types list (getData is restricted during dragover)
    if (!e.dataTransfer.types.includes(ALMADAR_DND_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    // Activate container highlighting on first dragover if not already active
    if (!dragActive) setDragActive(true);

    // Highlight the nearest container under cursor
    let el = e.target as HTMLElement;
    while (el && el.dataset.acceptsChildren !== 'true') {
      el = el.parentElement as HTMLElement;
      if (!el || el === contentRef.current) break;
    }

    // Remove previous hover from all containers
    contentRef.current?.querySelectorAll('.drag-hover').forEach(c => c.classList.remove('drag-hover'));
    if (el?.dataset?.acceptsChildren === 'true') {
      el.classList.add('drag-hover');
    }
  }, [dragActive]);

  const handlePreviewDragLeave = useCallback((e: React.DragEvent) => {
    void e;
    contentRef.current?.querySelectorAll('.drag-hover').forEach(c => c.classList.remove('drag-hover'));
  }, []);

  return (
    <Box
      className="rounded-lg border shadow-sm bg-card transition-all duration-200 overflow-hidden"
      style={{
        borderColor: hovered ? 'var(--color-primary)' : colors.border,
        borderWidth: '1.5px',
        width: preset.width,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inject selection highlight CSS */}
      <style>{SELECTION_STYLES}</style>

      {/* Layer color band */}
      {layerColor && (
        <Box
          style={{ height: 3, backgroundColor: layerColor }}
          title={data.layer}
        />
      )}

      {/* Header - this is the drag handle */}
      <Box className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 drag-handle cursor-grab">
        <Box
          className="rounded-full shrink-0"
          style={{ width: 8, height: 8, backgroundColor: colors.dot }}
        />
        <Box className="flex flex-col min-w-0 flex-1">
          <Typography variant="small" className="font-semibold truncate leading-tight">
            {label}
          </Typography>
          {sublabel && (
            <Typography variant="small" className="text-muted-foreground truncate text-[11px] leading-tight">
              {sublabel}
            </Typography>
          )}
        </Box>
        {eventSources.length > 0 && (
          <Box className="flex gap-0.5 shrink-0">
            {eventSources.slice(0, 3).map((src) => (
              <Box
                key={src.event}
                className="rounded-full px-1 py-0 text-[8px] font-medium leading-tight"
                style={{
                  backgroundColor: '#F9731615',
                  color: '#F97316',
                  border: '1px solid #F9731630',
                }}
                title={`${src.label ?? src.patternType} \u2192 ${src.event}${src.payloadFields?.length ? ` ${formatPayloadTooltip(src.payloadFields)}` : ''}`}
              >
                {src.label ?? src.event}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* OrbPreview - always interactive, click to select patterns */}
      <Box
        ref={contentRef}
        className={`orb-preview-live nodrag${dragActive ? ' drag-active' : ''}`}
        onClick={handleContentClick}
        onDrop={handlePreviewDrop}
        onDragOver={handlePreviewDragOver}
        onDragLeave={handlePreviewDragLeave}
      >
        {orbitalSchema ? (
          <Box style={{ minHeight: preset.minHeight }}>
            <OrbPreview
              schema={orbitalSchema}
              mockData={mockData}
              height="auto"
            />
          </Box>
        ) : (
          <Box className="flex items-center justify-center" style={{ minHeight: preset.minHeight }}>
            <Typography variant="small" className="text-muted-foreground">
              No preview available
            </Typography>
          </Box>
        )}
      </Box>

      {/* Handles */}
      <Handle type="target" position={Position.Left} style={TARGET_HANDLE_STYLE} />
      {eventSources.length === 0 && (
        <Handle type="source" position={Position.Right} style={TARGET_HANDLE_STYLE} />
      )}
      {eventSources.map((src) => (
        <Handle
          key={`event-${src.event}`}
          id={`event-${src.event}`}
          type="source"
          position={Position.Right}
          style={eventHandleStyle(src)}
          title={`${src.label ?? src.patternType}: ${src.event}${src.payloadFields?.length ? ` ${formatPayloadTooltip(src.payloadFields)}` : ''}`}
        />
      ))}
    </Box>
  );
};

export const OrbPreviewNode = React.memo(OrbPreviewNodeInner);
OrbPreviewNode.displayName = 'OrbPreviewNode';
