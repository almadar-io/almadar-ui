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

import React, { useMemo, useState, useCallback, useContext, createContext, useRef } from 'react';
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
  const orbital = fullSchema.orbitals?.find(o => o.name === orbitalName);
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
  const orbital = fullSchema.orbitals?.find(o => o.name === orbitalName);
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

  const targetTrait = traits.find(t => {
    if (typeof t === 'string') return t === traitName;
    return (t as Trait).name === traitName;
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
                title={`${src.label ?? src.patternType} \u2192 ${src.event}`}
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
        className="orb-preview-live nodrag"
        onClick={handleContentClick}
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
          title={`${src.label ?? src.patternType}: ${src.event}`}
        />
      ))}
    </Box>
  );
};

export const OrbPreviewNode = React.memo(OrbPreviewNodeInner);
OrbPreviewNode.displayName = 'OrbPreviewNode';
