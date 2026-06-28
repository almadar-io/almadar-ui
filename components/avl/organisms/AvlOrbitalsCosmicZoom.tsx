'use client';

/**
 * AvlOrbitalsCosmicZoom — Orbital Interaction Visualization
 *
 * Composed organism: renders AvlOrbitalUnit molecules positioned on a canvas,
 * connected by cross-orbital event wire arrows. No React Flow dependency.
 * Designed for documentation use.
 *
 * Composition:
 *   - AvlOrbitalUnit (molecule) for each orbital
 *   - SVG overlay for event wires between orbitals
 *   - Click to select an orbital and show info panel
 *
 * @packageDocumentation
 */

import React, { useMemo, useState, useCallback, useRef, useEffect, useLayoutEffect, useReducer } from 'react';
import type { OrbitalSchema } from '@almadar/core';
import { isInlineTrait } from '@almadar/core';
import {
  parseApplicationLevel,
  parseTransitionLevel,
  type CrossLink,
} from '../lib/avl-schema-parser';
import {
  zoomReducer,
  initialZoomState,
  getBreadcrumbs,
  type ZoomLevel,
} from '../lib/avl-zoom-state';
import { AvlTransitionDetail } from './AvlTransitionDetail';
import { AvlOrbitalUnit } from '../molecules/AvlOrbitalUnit';
import type { AvlPersistenceKind } from '../types/avl-atom-types';
import { curveControlPoint } from '../lib/avl-layout';
import { createLogger } from '@almadar/logger';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { Button } from '../../core/atoms/Button';
import { Icon } from '../../core/atoms/Icon';
import { FlowCanvas } from './FlowCanvas';
import { useTranslate } from '../../../hooks/useTranslate';
import type { ViewLevel } from '../types/avl-preview-types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AvlOrbitalsCosmicZoomProps {
  /** The orbital schema (parsed object or JSON string) */
  schema: OrbitalSchema | string;
  /** CSS class for the outer container */
  className?: string;
  /** Primary color for the visualization */
  color?: string;
  /** Enable animations (default: true) */
  animated?: boolean;
  /** Container width */
  width?: number | string;
  /** Container height */
  height?: number | string;
  /**
   * GAP-52: name of the orbital to highlight with a persistent ring/glow.
   * Independent from user-driven selection (click). Used by the builder workspace
   * when entering cosmic mode from a focused orbital — the focused orbital is
   * highlighted while the user can still click any other orbital to select it.
   */
  highlightedOrbital?: string;
  /**
   * GAP-55: fired when the user clicks an orbital tile. Consumers (e.g. the
   * builder workspace) use this as the trigger to drill INTO the clicked
   * orbital — typically by switching back to the canvas tab and opening the
   * clicked orbital at L2 expanded. Local `selected` toggle (visual highlight +
   * info panel) still fires regardless of whether the callback is provided.
   */
  onOrbitalSelect?: (orbital: string) => void;
  /**
   * GAP-54: minimum zoom factor when scroll-wheel zooming. Default 0.4.
   */
  minZoom?: number;
  /**
   * GAP-54: maximum zoom factor when scroll-wheel zooming. Default 3.
   */
  maxZoom?: number;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface OrbitalView {
  name: string;
  entityName: string;
  fieldCount: number;
  persistence: AvlPersistenceKind;
  traits: Array<{ name: string }>;
  pages: Array<{ name: string }>;
  /** Center X in px within the container */
  cx: number;
  /** Center Y in px within the container */
  cy: number;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** Size of each AvlOrbitalUnit cell (it has viewBox 0 0 600 400, we scale it down) */
const UNIT_DISPLAY_W = 240;
const UNIT_DISPLAY_H = 160;

function layoutOrbitals(
  count: number,
  containerW: number,
  containerH: number,
): Array<{ cx: number; cy: number }> {
  if (count === 0) return [];
  if (count === 1) return [{ cx: containerW / 2, cy: containerH / 2 }];

  const cols = Math.min(count, Math.ceil(Math.sqrt(count)));
  const rows = Math.ceil(count / cols);

  // Distribute orbital centers across the container with a per-axis edge
  // pad so the orbital sprite never clips, AND cap the step between
  // neighbors so very wide containers don't spread the grid too thin.
  // The cap (3.5× orbital size) keeps the grid visually cohesive while
  // still scaling down for narrow containers.
  const edgePad = 24;
  const fitMinCx = UNIT_DISPLAY_W / 2 + edgePad;
  const fitMinCy = UNIT_DISPLAY_H / 2 + edgePad;
  const fitMaxCx = Math.max(fitMinCx, containerW - UNIT_DISPLAY_W / 2 - edgePad);
  const fitMaxCy = Math.max(fitMinCy, containerH - UNIT_DISPLAY_H / 2 - edgePad);
  const fitStepX = cols > 1 ? (fitMaxCx - fitMinCx) / (cols - 1) : 0;
  const fitStepY = rows > 1 ? (fitMaxCy - fitMinCy) / (rows - 1) : 0;
  const stepX = Math.min(fitStepX, UNIT_DISPLAY_W * 3.5);
  const stepY = Math.min(fitStepY, UNIT_DISPLAY_H * 3.5);

  // Center the (possibly-narrower) grid within the container.
  const gridW = (cols - 1) * stepX;
  const gridH = (rows - 1) * stepY;
  const originX = (containerW - gridW) / 2;
  const originY = (containerH - gridH) / 2;

  return Array.from({ length: count }, (_, i) => ({
    cx: originX + (i % cols) * stepX,
    cy: originY + Math.floor(i / cols) * stepY,
  }));
}

// ---------------------------------------------------------------------------
// Event wire SVG overlay
// ---------------------------------------------------------------------------

interface EventWireOverlayProps {
  orbitalViews: OrbitalView[];
  crossLinks: CrossLink[];
  color: string;
  animated: boolean;
  containerW: number;
  containerH: number;
}

let avlOczWireId = 0;

const cosmicWireLog = createLogger('almadar:ui:nan-coord');

const EventWireOverlay: React.FC<EventWireOverlayProps> = ({
  orbitalViews,
  crossLinks,
  color,
  animated,
  containerW,
  containerH,
}) => {
  const ids = React.useMemo(() => {
    avlOczWireId += 1;
    return { arrow: `avl-ocz-wire-${avlOczWireId}-arrow` };
  }, []);

  const posMap = useMemo(() => {
    const m = new Map<string, { cx: number; cy: number }>();
    for (const ov of orbitalViews) m.set(ov.name, { cx: ov.cx, cy: ov.cy });
    return m;
  }, [orbitalViews]);

  // Group by pair for offset stacking
  const wiresByPair = useMemo(() => {
    const map = new Map<string, CrossLink[]>();
    for (const link of crossLinks) {
      const key = `${link.emitterOrbital}__${link.listenerOrbital}`;
      const arr = map.get(key) ?? [];
      arr.push(link);
      map.set(key, arr);
    }
    return map;
  }, [crossLinks]);

  // Approximate orbital visual radius for edge start/end offset
  const orbitalR = UNIT_DISPLAY_W * 0.38;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      viewBox={`0 0 ${containerW} ${containerH}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker
          id={ids.arrow}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill={color} opacity={0.6} />
        </marker>
      </defs>

      {animated && (
        <style>{`
          @keyframes avl-ocz-flow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      )}

      {Array.from(wiresByPair.entries()).map(([pairKey, links]) =>
        links.map((link, wireIdx) => {
          const fromPos = posMap.get(link.emitterOrbital);
          const toPos = posMap.get(link.listenerOrbital);
          if (!fromPos || !toPos) return null;

          const dx = toPos.cx - fromPos.cx;
          const dy = toPos.cy - fromPos.cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;

          const x1 = fromPos.cx + nx * orbitalR;
          const y1 = fromPos.cy + ny * orbitalR;
          const x2 = toPos.cx - nx * (orbitalR + 6);
          const y2 = toPos.cy - ny * (orbitalR + 6);

          // Fan wires symmetrically around the line midpoint, capped to a
          // 90px total perpendicular span so high-fan-out pairs (e.g. 7
          // events between OrderRecord ↔ Product in std-ecommerce) don't
          // bulge labels off-canvas. Single wires keep a 25px curve.
          const total = links.length;
          const span = Math.min(90, Math.max(0, total - 1) * 14);
          const step = total > 1 ? span / (total - 1) : 0;
          const offset = 25 + (wireIdx - (total - 1) / 2) * step;
          const { cpx, cpy } = curveControlPoint(x1, y1, x2, y2, offset);
          const pathD = `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`;

          if (
            !Number.isFinite(x1) || !Number.isFinite(y1) ||
            !Number.isFinite(x2) || !Number.isFinite(y2) ||
            !Number.isFinite(cpx) || !Number.isFinite(cpy)
          ) {
            cosmicWireLog.warn('cosmic-zoom-wire: non-finite wire coordinates', {
              eventName: link.eventName,
              emitterOrbital: link.emitterOrbital,
              listenerOrbital: link.listenerOrbital,
              fromPos,
              toPos,
              orbitalR,
              wireIdx,
              x1, y1, x2, y2, cpx, cpy,
            });
          }

          // Label at curve midpoint
          const t = 0.5;
          const lx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
          const ly = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
          const labelW = link.eventName.length * 5.5 + 12;

          return (
            <g key={`${pairKey}-${wireIdx}`}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={1.2}
                strokeDasharray={animated ? '6 4' : '4 3'}
                markerEnd={`url(#${ids.arrow})`}
                opacity={0.5}
                style={animated ? { animation: 'avl-ocz-flow 1.5s linear infinite' } : undefined}
              />
              <rect
                x={lx - labelW / 2}
                y={ly - 8}
                width={labelW}
                height={14}
                rx={3}
                fill="var(--color-background, #fff)"
                stroke={color}
                strokeWidth={0.5}
                opacity={0.9}
              />
              <text
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fill={color}
                fontSize={7}
                fontWeight={600}
                fontFamily="monospace"
                opacity={0.8}
              >
                {link.eventName}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const AvlOrbitalsCosmicZoom: React.FC<AvlOrbitalsCosmicZoomProps> = ({
  schema: schemaProp,
  className,
  color = 'var(--color-primary, #4A90D9)',
  animated = true,
  width = '100%',
  height = 450,
  highlightedOrbital,
  onOrbitalSelect,
  minZoom = 0.4,
  maxZoom = 3,
}) => {
  const { t } = useTranslate();
  // Parse schema
  const parsedSchema = useMemo<OrbitalSchema>(() => {
    if (typeof schemaProp === 'string') return JSON.parse(schemaProp) as OrbitalSchema;
    return schemaProp;
  }, [schemaProp]);

  const { orbitals, crossLinks } = useMemo(
    () => parseApplicationLevel(parsedSchema),
    [parsedSchema],
  );

  // Container dimensions: orbital DIVs are positioned in raw CSS pixels, but
  // the SVG wire overlay uses viewBox + inset:0 (stretches to container). If
  // the two coord systems don't match, wire endpoints drift away from the
  // DIVs they should attach to. The width/height props are typically '100%'
  // strings from the workspace, so we must measure the actual rendered
  // container and use those pixel values for BOTH the layout math and the
  // SVG viewBox so both spaces map 1:1.
  const outerRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setMeasured({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fallbackW = typeof width === 'number' ? width : 800;
  const fallbackH = typeof height === 'number' ? height : 450;
  const containerW = measured?.w ?? fallbackW;
  const containerH = measured?.h ?? fallbackH;

  const positions = useMemo(
    () => layoutOrbitals(orbitals.length, containerW, containerH),
    [orbitals.length, containerW, containerH],
  );

  const orbitalViews: OrbitalView[] = useMemo(
    () =>
      orbitals.map((o, i) => ({
        name: o.name,
        entityName: o.entityName,
        fieldCount: o.fieldCount,
        persistence: (o.persistence || 'persistent') as AvlPersistenceKind,
        traits: o.traitNames.map(n => ({ name: n })),
        pages: o.pageNames.map(n => ({ name: n })),
        cx: positions[i]?.cx ?? 0,
        cy: positions[i]?.cy ?? 0,
      })),
    [orbitals, positions],
  );

  // ── GAP-75: Multi-level cosmic drill state machine ──
  // Reuses the same `zoomReducer` that powers Avl3DViewer. Levels:
  //   application → orbital → trait → transition (sexpr)
  // Each level uses 2D AVL primitives (no 3D, no new components).
  const [state, dispatch] = useReducer(zoomReducer, initialZoomState);

  // Initial drill: when a consumer passes `highlightedOrbital`, jump to
  // the trait-circuit on mount so the user lands inside the focused
  // orbital's traits instead of starting at L1 with a highlight ring.
  // COSMIC-1: was a two-step drill through the retired 'orbital' level;
  // now a single `JUMP_TO_TRAIT_CIRCUIT` action lands at 'trait'.
  const drilledForHighlightRef = useRef(false);
  useEffect(() => {
    if (!highlightedOrbital) return;
    if (drilledForHighlightRef.current) return;
    drilledForHighlightRef.current = true;
    dispatch({ type: 'JUMP_TO_TRAIT_CIRCUIT', orbital: highlightedOrbital });
  }, [highlightedOrbital]);

  const breadcrumbs = useMemo(() => getBreadcrumbs(state), [state]);

  const handleSelect = useCallback(
    (name: string) => {
      // COSMIC-1: skip the retired Orbital-View; land directly on the
      // trait circuit (embedded FlowCanvas at `trait-expanded`).
      dispatch({ type: 'JUMP_TO_TRAIT_CIRCUIT', orbital: name });
      onOrbitalSelect?.(name);
    },
    [onOrbitalSelect],
  );

  const handleTransitionSelect = useCallback((transitionIndex: number) => {
    dispatch({ type: 'ZOOM_INTO_TRANSITION', transitionIndex, targetPosition: { x: 0, y: 0 } });
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, []);

  // COSMIC-1: FlowCanvas's `onNodeClick` fires with `level: 'transition'`
  // when the user clicks a transition row inside a trait card. Translate
  // that into the cosmic dispatch sequence: record the trait name so the
  // breadcrumb has a label at L4, then drill to the transition scene.
  const handleCanvasNodeClick = useCallback(
    (ctx: { level: ViewLevel | 'code' | 'transition'; orbital: string; trait?: string; transition?: string }) => {
      if (ctx.level !== 'transition' || !ctx.trait || !ctx.transition) return;
      // Resolve the transition's index in the cosmic schema. The index
      // keys `parseTransitionLevel` for the L4 detail scene — without
      // it the L4 useMemo returns null and L4 renders blank.
      const orbital = parsedSchema.orbitals?.find(o => o.name === ctx.orbital);
      const traitRef = orbital?.traits?.find(t => isInlineTrait(t) && t.name === ctx.trait);
      if (!traitRef || !isInlineTrait(traitRef)) return;
      const idx = traitRef.stateMachine?.transitions?.findIndex(t => t.event === ctx.transition) ?? -1;
      if (idx < 0) return;
      dispatch({ type: 'SELECT_TRAIT', trait: ctx.trait });
      dispatch({ type: 'ZOOM_INTO_TRANSITION', transitionIndex: idx, targetPosition: { x: 0, y: 0 } });
      Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
    },
    [parsedSchema],
  );

  const handleZoomOut = useCallback(() => {
    dispatch({ type: 'ZOOM_OUT' });
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, []);

  const handleBreadcrumbClick = useCallback((targetLevel: ZoomLevel) => {
    const order: ZoomLevel[] = ['application', 'orbital', 'trait', 'transition'];
    const currentIdx = order.indexOf(state.level);
    const targetIdx = order.indexOf(targetLevel);
    const steps = currentIdx - targetIdx;
    for (let i = 0; i < steps; i++) {
      dispatch({ type: 'ZOOM_OUT' });
    }
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, [state.level]);

  // Esc to zoom out (only when drilled in past application level)
  useEffect(() => {
    if (state.level === 'application') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleZoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleZoomOut, state.level]);


  // COSMIC-1: only L4 (transition) is rendered from parsed cosmic data
  // now — L3 (trait) renders an embedded FlowCanvas instead, which
  // builds its own graph internally. Drops the orbitalLevelData /
  // traitLevelData memos that drove the retired L2 + AvlTraitScene.
  const transitionLevelData = useMemo(() => {
    if (!state.selectedOrbital || !state.selectedTrait || state.selectedTransition === null) return null;
    return parseTransitionLevel(
      parsedSchema,
      state.selectedOrbital,
      state.selectedTrait,
      state.selectedTransition,
    );
  }, [parsedSchema, state.selectedOrbital, state.selectedTrait, state.selectedTransition]);

  // Schema scoped to the selected orbital, fed to the embedded FlowCanvas
  // at the trait-expanded level. Stripping siblings keeps xyflow's node
  // count minimal and prevents cross-orbital edges from leaking in.
  const scopedSchema = useMemo<OrbitalSchema | null>(() => {
    if (!state.selectedOrbital) return null;
    const orbital = parsedSchema.orbitals?.find(o => o.name === state.selectedOrbital);
    if (!orbital) return null;
    return { ...parsedSchema, orbitals: [orbital] };
  }, [parsedSchema, state.selectedOrbital]);

  // GAP-54: pan + zoom + drag state. Custom implementation (no library) since
  // there's no existing zoom/pan dep in the monorepo. Wheel = zoom around
  // cursor. Mouse drag (or touch) = pan. Buttons = zoom in/out/reset.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStateRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const transformWrapperRef = useRef<HTMLDivElement>(null);

  // Reset pan/zoom when the drill level changes so each level starts at 1×
  // and (0,0). Without this, drilling from application (zoomed/panned) into
  // trait would inherit the previous transform and show a partial view.
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [state.level]);

  const clampZoom = useCallback(
    (z: number) => Math.max(minZoom, Math.min(maxZoom, z)),
    [minZoom, maxZoom],
  );

  // Pointer-based drag (works for mouse + touch via Pointer Events).
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only start a drag from the background, not from an orbital tile.
    if ((e.target as HTMLElement).closest('[data-orbital-tile]')) return;
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    setPan({
      x: drag.panX + (e.clientX - drag.startX),
      y: drag.panY + (e.clientY - drag.startY),
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStateRef.current) return;
    dragStateRef.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }, []);

  // Wheel handler — must be attached as non-passive listener to call
  // preventDefault. React's onWheel is passive by default, so attach manually.
  // Reads pan/zoom via refs to avoid stale closures from state.
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    // COSMIC-1: pan/zoom only at L1. At L3 the embedded FlowCanvas
    // owns wheel + drag via xyflow; attaching a cosmic wheel listener
    // there would fight xyflow for the gesture and prevent zooming
    // inside the trait circuit.
    if (state.level !== 'application') return;
    const wrapper = transformWrapperRef.current;
    if (!wrapper) return;
    const wheelListener = (e: WheelEvent) => {
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      // Convert cursor to "world" coordinates given current pan + zoom.
      const worldX = (cursorX - currentPan.x) / currentZoom;
      const worldY = (cursorY - currentPan.y) / currentZoom;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const nextZoom = clampZoom(currentZoom * (1 + delta));

      // Re-pan so worldX/Y stay under the cursor at the new zoom.
      const nextPanX = cursorX - worldX * nextZoom;
      const nextPanY = cursorY - worldY * nextZoom;

      setZoom(nextZoom);
      setPan({ x: nextPanX, y: nextPanY });
    };
    wrapper.addEventListener('wheel', wheelListener, { passive: false });
    return () => wrapper.removeEventListener('wheel', wheelListener);
  }, [clampZoom, state.level]);

  const zoomIn = useCallback(() => setZoom(z => clampZoom(z * 1.2)), [clampZoom]);
  const zoomOut = useCallback(() => setZoom(z => clampZoom(z / 1.2)), [clampZoom]);
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <Box
      ref={outerRef}
      className={className}
      position="relative"
      overflow="visible"
      style={{ width, height }}
    >
      {/* GAP-75: Breadcrumb header — always visible. Lets the user navigate
          back up the drill chain. */}
      <Box
        position="absolute"
        style={{
          top: 12,
          left: 12,
          zIndex: 30,
          background: 'var(--color-card, rgba(255,255,255,0.92))',
          padding: '4px 12px',
          borderRadius: 6,
          border: `1px solid ${color}`,
        }}
      >
        <HStack gap="xs" align="center">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.level}>
              {i > 0 && (
                <Typography variant="small" style={{ opacity: 0.5, color }}>
                  /
                </Typography>
              )}
              {i < breadcrumbs.length - 1 ? (
                <Box
                  as="span"
                  onClick={() => handleBreadcrumbClick(crumb.level)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography
                    variant="small"
                    style={{ color, textDecoration: 'underline' }}
                  >
                    {crumb.label}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="small" weight="bold" style={{ color }}>
                  {crumb.label}
                </Typography>
              )}
            </React.Fragment>
          ))}
        </HStack>
      </Box>

      {/* Esc hint — only when drilled past L3 */}
      {state.level !== 'application' && (
        <Box
          position="absolute"
          style={{
            bottom: 12,
            right: 12,
            zIndex: 30,
            background: 'var(--color-card, rgba(255,255,255,0.85))',
            padding: '2px 8px',
            borderRadius: 4,
            opacity: 0.8,
          }}
        >
          <Typography variant="small" style={{ color }}>
            {t('avl.pressEscToZoomOut')}
          </Typography>
        </Box>
      )}

      {/* ── L3 (application): existing pan/zoom grid of orbital tiles ── */}
      {state.level === 'application' && (
        <>
          <Box
            ref={transformWrapperRef}
            position="absolute"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              inset: 0,
              overflow: 'hidden',
              cursor: dragStateRef.current ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          >
            <Box
              position="absolute"
              style={{
                inset: 0,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
            >
              {/* Event wires SVG overlay (behind orbitals) */}
              <EventWireOverlay
                orbitalViews={orbitalViews}
                crossLinks={crossLinks}
                color={color}
                animated={animated}
                containerW={containerW}
                containerH={containerH}
              />

              {/* AvlOrbitalUnit molecules — one per orbital. Click drills into L4. */}
              {orbitalViews.map(view => {
                const isHighlighted = view.name === highlightedOrbital;
                return (
                <Box
                  key={view.name}
                  role="button"
                  tabIndex={0}
                  data-orbital-tile="true"
                  onClick={() => handleSelect(view.name)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(view.name); }}
                  aria-label={isHighlighted
                    ? t('avl.orbitalLabelHighlighted', { name: view.name })
                    : t('avl.orbitalLabel', { name: view.name })}
                  position="absolute"
                  style={{
                    left: view.cx - UNIT_DISPLAY_W / 2,
                    top: view.cy - UNIT_DISPLAY_H / 2,
                    width: UNIT_DISPLAY_W,
                    height: UNIT_DISPLAY_H,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.3s ease',
                    // GAP-52: persistent highlight ring (independent from user selection)
                    boxShadow: isHighlighted
                      ? `0 0 0 3px ${color}, 0 0 24px 4px ${color}`
                      : 'none',
                    borderRadius: isHighlighted ? '12px' : undefined,
                    zIndex: isHighlighted ? 11 : 1,
                  }}
                >
                  <AvlOrbitalUnit
                    entityName={view.entityName}
                    fields={view.fieldCount}
                    persistence={view.persistence}
                    traits={view.traits}
                    pages={view.pages}
                    color={color}
                    animated={animated && isHighlighted}
                  />
                </Box>
                );
              })}
            </Box>
          </Box>

          {/* GAP-54: pan/zoom controls — only relevant at L3 */}
          <Box
            position="absolute"
            style={{
              top: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 30,
            }}
          >
            <Button variant="secondary" size="sm" onClick={zoomIn} title={t('avl.zoomIn')} action="COSMIC_ZOOM_IN">
              <Icon name="plus" size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={zoomOut} title={t('avl.zoomOut')} action="COSMIC_ZOOM_OUT">
              <Icon name="minus" size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={resetZoom} title={t('common.reset')} action="COSMIC_ZOOM_RESET">
              <Icon name="maximize" size="sm" />
            </Button>
          </Box>
        </>
      )}

      {/* COSMIC-1: L2 (orbital info screen) retired. Clicking an orbital
          at L1 now dispatches `JUMP_TO_TRAIT_CIRCUIT`, landing directly
          at the trait-circuit (L3 below) and skipping the static
          AvlOrbitalUnit + trait-sidebar view that used to live here. */}

      {/* ── L3 (trait circuit): embedded FlowCanvas at `trait-expanded`.
            One card per trait of the selected orbital, connected by
            intra-orbital emit→listen edges. Click a transition row
            inside a card to drill into L4 transition detail. */}
      {state.level === 'trait' && scopedSchema && state.selectedOrbital && (
        <Box
          position="absolute"
          style={{
            inset: 0,
            paddingTop: 56,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <FlowCanvas
            schema={scopedSchema}
            initialLevel="trait-expanded"
            initialOrbital={state.selectedOrbital}
            onNodeClick={handleCanvasNodeClick}
            width="100%"
            height="100%"
          />
        </Box>
      )}

      {/* ── L4 (transition): HTML detail card with accordion-collapsed
            effects. Long render-ui args wrap inside each accordion's
            CodeBlock instead of being truncated. SVG variant
            (`AvlTransitionScene`) is preserved for `Avl3DTransitionScene`
            but no longer used by 2D cosmic. */}
      {state.level === 'transition' && transitionLevelData && (
        <Box
          position="absolute"
          style={{
            inset: 0,
            paddingTop: 56,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            overflowY: 'auto',
          }}
        >
          <AvlTransitionDetail data={transitionLevelData} />
        </Box>
      )}

      {/* L4 (transition) renders HTML via `AvlTransitionDetail`, which
          scrolls natively via overflow: auto — no pan/zoom controls
          needed. L3 (trait circuit) is owned by the embedded FlowCanvas
          with its own xyflow controls; L1 has its own controls block. */}
    </Box>
  );
};

AvlOrbitalsCosmicZoom.displayName = 'AvlOrbitalsCosmicZoom';
