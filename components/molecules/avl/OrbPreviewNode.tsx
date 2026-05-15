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
  EntityData,
  EntityRow,
  EventPayloadField,
  TraitEventContract,
  EventPayload,
  EventPayloadValue,
} from '@almadar/core';
import { isInlineTrait } from '@almadar/core';
import type { EntityRef } from '@almadar/core';

function entityNameOf(ref: EntityRef | undefined): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === 'string') return ref;
  return 'name' in ref ? ref.name : undefined;
}
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { BrowserPlayground } from '../../../runtime/BrowserPlayground';
import type { PreviewNodeData, PatternEventSource, ScreenSize } from './avl-preview-types';
import { SCREEN_SIZE_PRESETS } from './avl-preview-types';
import { useEventBus } from '../../../hooks/useEventBus';
import { useCanvasDroppable, type CanvasDropTarget } from './useCanvasDnd';
import { formatPayloadTooltip } from './wire-validation';
import { createLogger } from '@almadar/logger';

const eventHandleLog = createLogger('almadar:ui:nan-coord');
const orbPreviewLog = createLogger('almadar:ui:orb-preview-node');

// AVL canvas wire check: log module-init so we can confirm OrbPreviewNode
// actually finished defining before FlowCanvas's NODE_TYPES picks it up.
// If this never fires but FlowCanvas's `node-type-registry` log does, the
// import order is wrong and `preview` lands `undefined` in the registry.
orbPreviewLog.debug('module-init', () => ({ browserPlayground: typeof BrowserPlayground }));

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
  const hint = Number.isFinite(source.positionHint) ? source.positionHint : 0.5;
  if (hint !== source.positionHint) {
    eventHandleLog.warn('orb-preview-handle: non-finite positionHint on PatternEventSource', {
      event: source.event,
      patternType: source.patternType,
      label: source.label,
      positionHint: source.positionHint,
    });
  }
  return {
    background: '#F97316',
    width: 10,
    height: 10,
    border: '2px solid var(--color-card)',
    top: `${hint * 100}%`,
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

/**
 * The L2 transition card synthesizes a one-state state machine that fires INIT
 * with the target transition's render-ui effects. But render-ui props bind
 * `@payload.<X>` — values normally carried by the triggering event. With an
 * auto-INIT and no payload, those bindings resolve to undefined and the
 * preview is empty. We rebuild a representative payload from the trait's
 * declared `emits[<event>].payloadSchema` (every std-14 emit has one), then
 * substitute every `@payload.<path>` reference in the cloned effects.
 */

function generateMockPayload(
  payloadSchema: EventPayloadField[] | undefined,
  schema: OrbitalSchema,
  linkedEntity: string | undefined,
  mockData: EntityData | undefined,
): EventPayload {
  const payload: EventPayload = {};
  if (!payloadSchema || payloadSchema.length === 0) return payload;

  const entityNames = new Set<string>();
  for (const orb of schema.orbitals ?? []) {
    const name = entityNameOf(orb.entity);
    if (name) entityNames.add(name);
  }
  const linkedRows: EntityRow[] = linkedEntity
    ? mockData?.[linkedEntity] ?? []
    : [];
  const linkedFirstRow: EntityRow | undefined = linkedRows[0];

  const valueForType = (rawType: string, entityType?: string): EventPayloadValue => {
    const type = rawType.replace(/!$/, '').trim();
    const arrayMatch = /^\[\s*(\w+)\s*\]$/.exec(type);
    if (arrayMatch) {
      // [X] → rows for X. Fall back to linkedEntity rows when the resolver
      // hasn't rewritten the atom's original entity name (e.g. `[BrowseItem]`
      // surviving on a Channel-bound trait).
      return mockData?.[arrayMatch[1]] ?? linkedRows;
    }
    if (type === 'array') return linkedRows;
    if (type === 'entity') {
      const target = entityType && mockData?.[entityType] ? entityType : linkedEntity;
      return (target && mockData?.[target]?.[0]) ?? linkedFirstRow ?? {};
    }
    if (entityNames.has(type)) {
      return mockData?.[type]?.[0] ?? linkedFirstRow ?? {};
    }
    switch (type) {
      case 'string': return 'Sample';
      case 'number': return 1;
      case 'boolean': return false;
      case 'object': return {};
      case 'date':
      case 'datetime':
      case 'timestamp': return new Date().toISOString();
      default: return undefined;
    }
  };

  const setByPath = (target: EventPayload, path: string, value: EventPayloadValue): void => {
    const parts = path.split('.');
    let cur: EventPayload = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      const next = cur[k];
      if (next === null || typeof next !== 'object' || Array.isArray(next)) {
        cur[k] = {};
      }
      // After the assignment above, cur[k] is an EventPayload object.
      cur = cur[k] as EventPayload;
    }
    cur[parts[parts.length - 1]] = value;
  };

  for (const field of payloadSchema) {
    let value = valueForType(field.type, field.entityType);
    // For path-style fields (e.g. `row.id`) whose declared type is a
    // primitive, prefer the matching value off the linked entity's first row
    // so the preview shows real, consistent data instead of "Sample".
    if (
      linkedFirstRow !== undefined &&
      field.name.includes('.') &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    ) {
      const tail = field.name.split('.').pop()!;
      const fromRow = linkedFirstRow[tail];
      if (fromRow !== undefined) value = fromRow;
    }
    setByPath(payload, field.name, value);
  }
  return payload;
}

function substitutePayloadBindings(
  effects: Effect[],
  payload: EventPayload,
): Effect[] {
  const isPayloadObject = (v: EventPayloadValue): v is EventPayload =>
    v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
  const getByPath = (path: string): EventPayloadValue => {
    let cur: EventPayloadValue = payload;
    for (const k of path.split('.')) {
      if (!isPayloadObject(cur)) return undefined;
      cur = cur[k];
    }
    return cur;
  };
  const replaceValue = (v: EventPayloadValue): EventPayloadValue => {
    if (typeof v === 'string' && v.startsWith('@payload.')) {
      const resolved = getByPath(v.slice('@payload.'.length));
      // Leave the literal in place when a field is missing from the schema —
      // the runtime's existing resolver will treat it as undefined like
      // before, so we never fabricate values for un-declared paths.
      return resolved === undefined ? v : resolved;
    }
    if (Array.isArray(v)) return v.map(replaceValue);
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      const out: EventPayload = {};
      for (const [k, inner] of Object.entries(v)) {
        out[k] = replaceValue(inner);
      }
      return out;
    }
    return v;
  };
  // Effects are JSON-serialisable trees of strings, numbers, booleans, arrays
  // and objects — structurally a subset of EventPayloadValue, the canonical
  // recursive JSON shape from @almadar/core. Round-trip via JSON to obtain a
  // typed view, substitute, then narrow back to Effect on the way out.
  const tree: EventPayloadValue = JSON.parse(JSON.stringify(effects)) as EventPayloadValue;
  const substituted = replaceValue(tree);
  return substituted as Effect[];
}

function findEmitContract(trait: Trait, event: string): TraitEventContract | undefined {
  return trait.emits?.find((e) => e.event === event);
}

function buildTransitionSchema(
  fullSchema: OrbitalSchema,
  orbitalName: string,
  traitName: string,
  transitionEvent: string,
  fromState: string | undefined,
  toState: string | undefined,
  mockData: EntityData | undefined,
): OrbitalSchema {
  const orbital = (fullSchema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return fullSchema;

  const clonedOrbital: OrbitalDefinition = JSON.parse(JSON.stringify(orbital));

  const traits = clonedOrbital.traits ?? [];
  for (let ti = 0; ti < traits.length; ti++) {
    const trait = traits[ti];
    if (!isInlineTrait(trait)) continue;
    const traitObj: Trait = trait;
    if (traitObj.name !== traitName) continue;

    const sm = traitObj.stateMachine;
    if (!sm) continue;

    const allTransitions: Transition[] = sm.transitions ?? [];
    const targetTransition = fromState && toState
      ? allTransitions.find(t => t.event === transitionEvent && t.from === fromState && t.to === toState)
        ?? allTransitions.find(t => t.event === transitionEvent)
      : allTransitions.find(t => t.event === transitionEvent);
    if (!targetTransition?.effects) continue;

    const renderUIEffects: Effect[] = [];
    for (const eff of targetTransition.effects) {
      if (Array.isArray(eff) && eff[0] === 'render-ui') {
        renderUIEffects.push(eff);
      }
    }

    if (renderUIEffects.length === 0) continue;

    const linkedEntity = traitObj.linkedEntity ?? entityNameOf(clonedOrbital.entity);
    const emitContract = findEmitContract(traitObj, transitionEvent);
    const mockPayload = generateMockPayload(
      emitContract?.payloadSchema,
      fullSchema,
      linkedEntity,
      mockData,
    );
    const seededEffects = substitutePayloadBindings(renderUIEffects, mockPayload);

    traitObj.stateMachine = {
      states: [{ name: 'preview', isInitial: true }],
      events: [{ key: 'INIT', name: 'INIT' }],
      transitions: [{ from: 'preview', to: 'preview', event: 'INIT', effects: seededEffects }],
    };
    traitObj.emits = [];
    traitObj.listens = [];
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
  const status = data.status ?? 'idle';
  const isRunning = status === 'running';
  const isSuccess = status === 'success';
  const isError = status === 'error';
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
        data._mockData as EntityData | undefined,
      );
    }

    return buildOrbitalSchema(fullSchema, data.orbitalName);
  }, [data._fullSchema, data._mockData, data.orbitalName, data.traitName, data.transitionEvent, data.fromState, data.toState, isExpanded]);

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
        // `data-pattern-path` is the SExpr tree path (`children.0.…`) emitted by
        // UISlotRenderer; `data-id` is the runtime content id. `OrbInspector`
        // resolves pattern config by walking the render-ui SExpr tree, so the
        // path is the correct key — reading `data-id` silently broke prop
        // resolution and rendered every value as '—'.
        patternId: patternEl.getAttribute('data-pattern-path') ?? undefined,
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

  // L2 cursor-to-path resolver. Walks from the cursor's DOM element up to the
  // nearest `[data-accepts-children="true"]` container, then computes the
  // insertion index from the cursor's relative position among the container's
  // direct `[data-pattern-path]` children. Runs at drop time via @dnd-kit's
  // resolvePath callback — same logic the legacy `onDrop` ran inline.
  const resolveL2Path = useCallback(
    (cursor: { x: number; y: number }): { parentPath: string; index: number } | null => {
      const hit = document.elementFromPoint(cursor.x, cursor.y) as HTMLElement | null;
      if (!hit) return null;
      let el: HTMLElement | null = hit;
      while (el && el.dataset.acceptsChildren !== 'true') {
        if (el === contentRef.current) break;
        el = el.parentElement;
      }
      if (!el) return null;
      const containerPath = el.dataset?.patternPath;
      if (!containerPath) return { parentPath: 'root', index: 0 };
      const pathChildren = el.querySelectorAll(':scope > [data-pattern-path]');
      let insertIndex = pathChildren.length;
      const style = el.firstElementChild ? getComputedStyle(el.firstElementChild) : null;
      const isVertical = style?.flexDirection !== 'row';
      for (let i = 0; i < pathChildren.length; i++) {
        const rect = pathChildren[i].getBoundingClientRect();
        const mid = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
        const pos = isVertical ? cursor.y : cursor.x;
        if (pos < mid) { insertIndex = i; break; }
      }
      return { parentPath: containerPath, index: insertIndex };
    },
    [],
  );

  // L2 inner zone — the render-ui slot inside the expanded orbital. Each
  // OrbPreviewNode owns one. @dnd-kit's useCanvasDroppable manages the
  // pointer-driven over/drop lifecycle; `resolvePath` extracts the precise
  // (parentPath, index) at drop time.
  const l2Target = useMemo<CanvasDropTarget>(
    () => ({
      level: 'l2',
      containerNode: {
        orbitalName: data.orbitalName,
        traitName: data.traitName,
        transitionEvent: data.transitionEvent,
      },
      resolvePath: resolveL2Path,
    }),
    [data.orbitalName, data.traitName, data.transitionEvent, resolveL2Path],
  );
  const { setNodeRef: l2SetNodeRef, isOver: l2IsOver } = useCanvasDroppable({
    id: `orb-l2-${data.orbitalName}-${data.traitName ?? ''}-${data.transitionEvent ?? ''}`,
    target: l2Target,
    accepts: ['pattern'],
    disabled: !isExpanded,
  });

  // Callback ref that fans the same DOM node to both useRef + dnd-kit.
  // contentRef stays read-only for the click-to-select walker; l2SetNodeRef
  // registers the node as a droppable.
  const setContentRef = useCallback((el: HTMLDivElement | null) => {
    contentRef.current = el;
    l2SetNodeRef(el);
  }, [l2SetNodeRef]);

  // Status-driven outline color. Running > error > success > hover > default.
  const statusBorder = isRunning
    ? 'var(--color-primary)'
    : isError
      ? 'var(--color-danger)'
      : isSuccess
        ? 'var(--color-success)'
        : null;
  const borderWidth = isRunning || isError || isSuccess ? '2px' : '1.5px';
  const borderColor = statusBorder ?? (hovered ? 'var(--color-primary)' : colors.border);

  // L1 outer drop zone — fires when a palette-pattern is dropped on the
  // orbital's frame outside the inner render-ui preview. Emits the default
  // UI:PATTERN_DROP with a partial containerNode (orbital only) so the
  // page-level handler can resolve to the orbital's first render-ui
  // transition and drill into L2.
  const l1Target = useMemo<CanvasDropTarget>(
    () => ({ level: 'l1', containerNode: { orbitalName: data.orbitalName } }),
    [data.orbitalName],
  );
  const { setNodeRef: l1SetNodeRef, isOver: l1IsOver } = useCanvasDroppable({
    id: `orb-l1-${data.orbitalName}`,
    target: l1Target,
    accepts: ['pattern'],
    disabled: isExpanded,
  });

  return (
    <Box
      ref={isExpanded ? undefined : l1SetNodeRef}
      className={`rounded-lg border shadow-sm bg-card transition-all duration-200 overflow-hidden relative${isRunning ? ' orb-preview-running' : ''}`}
      style={{
        borderColor: l1IsOver ? 'var(--color-primary)' : borderColor,
        borderWidth: l1IsOver ? '2px' : borderWidth,
        width: preset.width,
        boxShadow: l1IsOver ? '0 0 0 3px var(--color-primary), 0 0 12px var(--color-primary)' : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inject selection highlight CSS */}
      <style>{SELECTION_STYLES}</style>

      {/* L1 affordances — only render at overview level (no traitName).
          Preview badge is always visible so the user knows the embedded
          render is sample data. Click-to-open overlay surfaces on hover.
          Drop-to-place overlay surfaces when a palette pattern is being
          dragged anywhere on the canvas. */}
      {!isExpanded && (
        <>
          <Box
            className="absolute top-1.5 left-1.5 rounded px-1 py-[1px] text-[8px] font-mono uppercase tracking-wider pointer-events-none"
            style={{
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-muted-foreground)',
              zIndex: 3,
            }}
          >
            Preview
          </Box>
          {hovered && !dragActive && !l1IsOver && (
            <Box
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                zIndex: 2,
              }}
            >
              <Box
                className="rounded-md px-2 py-1 text-[11px] font-medium flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                  boxShadow: 'var(--shadow-main)',
                }}
              >
                <span style={{ fontSize: 12 }}>{'➞'}</span>
                Click to open
              </Box>
            </Box>
          )}
          {(dragActive || l1IsOver) && (
            <Box
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                backgroundColor: l1IsOver ? 'rgba(20,184,166,0.15)' : 'rgba(20,184,166,0.06)',
                zIndex: 2,
              }}
            >
              <Box
                className="rounded-md px-2 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                Drop to add and open
              </Box>
            </Box>
          )}
        </>
      )}
      {/* Running-state pulse — subtle inner glow + corner spinner. Inert to
          pointer events so the existing canvas interactions stay intact. */}
      {isRunning && (
        <>
          <style>{`
            @keyframes orb-preview-running-pulse {
              0%, 100% { box-shadow: 0 0 0 0 var(--color-primary); opacity: 0.6; }
              50%      { box-shadow: 0 0 0 4px var(--color-primary); opacity: 0.15; }
            }
            .orb-preview-running {
              animation: orb-preview-running-pulse 1.8s ease-in-out infinite;
            }
            @keyframes orb-preview-spinner {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            .orb-preview-spinner {
              animation: orb-preview-spinner 0.9s linear infinite;
            }
          `}</style>
          <Box
            className="orb-preview-spinner absolute top-2 right-2 rounded-full pointer-events-none"
            style={{
              width: 14,
              height: 14,
              border: '2px solid var(--color-primary)',
              borderTopColor: 'transparent',
              zIndex: 2,
            }}
            title="Coordinator is dispatching to this orbital"
          />
        </>
      )}

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

      {/* OrbPreview - always interactive, click to select patterns. The
          ref is set by `setContentRef`, which fans the node to both
          contentRef (read by handleContentClick) AND @dnd-kit's L2
          droppable. */}
      <Box
        ref={setContentRef}
        className={`orb-preview-live nodrag${dragActive || l2IsOver ? ' drag-active' : ''}`}
        onClick={handleContentClick}
      >
        {orbitalSchema ? (
          <Box style={{ minHeight: preset.minHeight }}>
            <BrowserPlayground
              schema={orbitalSchema}
              mode="mock"
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

orbPreviewLog.debug('export-resolved', () => ({
  type: typeof OrbPreviewNode,
  displayName: OrbPreviewNode.displayName ?? null,
  innerDefined: typeof OrbPreviewNodeInner === 'function',
}));
