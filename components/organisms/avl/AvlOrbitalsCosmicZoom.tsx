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

import React, { useMemo, useState, useCallback, useRef, useEffect, useReducer } from 'react';
import type { OrbitalSchema } from '@almadar/core';
import {
  parseApplicationLevel,
  parseOrbitalLevel,
  parseTraitLevel,
  parseTransitionLevel,
  type CrossLink,
} from './avl-schema-parser';
import {
  zoomReducer,
  initialZoomState,
  getBreadcrumbs,
  type ZoomLevel,
} from './avl-zoom-state';
import { AvlTraitScene } from './AvlTraitScene';
import { AvlTransitionScene } from './AvlTransitionScene';
import { AvlOrbitalUnit } from '../../molecules/avl/AvlOrbitalUnit';
import type { AvlPersistenceKind } from '../../atoms/avl/types';
import { curveControlPoint } from '../../molecules/avl/avl-layout';
import { Box } from '../../atoms/Box';
import { HStack } from '../../atoms/Stack';
import { Typography, Text } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

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
  const cellW = containerW / (cols + 0.3);
  const cellH = containerH / (rows + 0.3);
  const originX = (containerW - cols * cellW) / 2 + cellW / 2;
  const originY = (containerH - rows * cellH) / 2 + cellH / 2;

  return Array.from({ length: count }, (_, i) => ({
    cx: originX + (i % cols) * cellW,
    cy: originY + Math.floor(i / cols) * cellH,
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

          const offset = 25 + wireIdx * 18;
          const { cpx, cpy } = curveControlPoint(x1, y1, x2, y2, offset);
          const pathD = `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`;

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
  // Parse schema
  const parsedSchema = useMemo<OrbitalSchema>(() => {
    if (typeof schemaProp === 'string') return JSON.parse(schemaProp) as OrbitalSchema;
    return schemaProp;
  }, [schemaProp]);

  const { orbitals, crossLinks } = useMemo(
    () => parseApplicationLevel(parsedSchema),
    [parsedSchema],
  );

  // Container dimensions (numeric for layout math)
  const containerW = typeof width === 'number' ? width : 800;
  const containerH = typeof height === 'number' ? height : 450;

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

  // Initial drill: when a consumer passes `highlightedOrbital`, jump to that
  // orbital's L4 view on mount so the user lands inside the focused orbital
  // (instead of starting at L3 with a faint highlight ring).
  const drilledForHighlightRef = useRef(false);
  useEffect(() => {
    if (!highlightedOrbital) return;
    if (drilledForHighlightRef.current) return;
    drilledForHighlightRef.current = true;
    dispatch({ type: 'ZOOM_INTO_ORBITAL', orbital: highlightedOrbital, targetPosition: { x: 0, y: 0 } });
    // Immediately complete the animation — 2D scenes don't camera-lerp.
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, [highlightedOrbital]);

  const breadcrumbs = useMemo(() => getBreadcrumbs(state), [state]);

  const handleSelect = useCallback(
    (name: string) => {
      dispatch({ type: 'ZOOM_INTO_ORBITAL', orbital: name, targetPosition: { x: 0, y: 0 } });
      Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
      onOrbitalSelect?.(name);
    },
    [onOrbitalSelect],
  );

  const handleTraitSelect = useCallback((traitName: string) => {
    dispatch({ type: 'ZOOM_INTO_TRAIT', trait: traitName, targetPosition: { x: 0, y: 0 } });
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, []);

  const handleTransitionSelect = useCallback((transitionIndex: number) => {
    dispatch({ type: 'ZOOM_INTO_TRANSITION', transitionIndex, targetPosition: { x: 0, y: 0 } });
    Promise.resolve().then(() => dispatch({ type: 'ANIMATION_COMPLETE' }));
  }, []);

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

  // Parsed data for the deeper levels (computed lazily — null at L3)
  const orbitalLevelData = useMemo(() => {
    if (!state.selectedOrbital) return null;
    return parseOrbitalLevel(parsedSchema, state.selectedOrbital);
  }, [parsedSchema, state.selectedOrbital]);

  const traitLevelData = useMemo(() => {
    if (!state.selectedOrbital || !state.selectedTrait) return null;
    return parseTraitLevel(parsedSchema, state.selectedOrbital, state.selectedTrait);
  }, [parsedSchema, state.selectedOrbital, state.selectedTrait]);

  const transitionLevelData = useMemo(() => {
    if (!state.selectedOrbital || !state.selectedTrait || state.selectedTransition === null) return null;
    return parseTransitionLevel(
      parsedSchema,
      state.selectedOrbital,
      state.selectedTrait,
      state.selectedTransition,
    );
  }, [parsedSchema, state.selectedOrbital, state.selectedTrait, state.selectedTransition]);

  // GAP-54: pan + zoom + drag state. Custom implementation (no library) since
  // there's no existing zoom/pan dep in the monorepo. Wheel = zoom around
  // cursor. Mouse drag (or touch) = pan. Buttons = zoom in/out/reset.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStateRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const transformWrapperRef = useRef<HTMLDivElement>(null);

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
  }, [clampZoom]);

  const zoomIn = useCallback(() => setZoom(z => clampZoom(z * 1.2)), [clampZoom]);
  const zoomOut = useCallback(() => setZoom(z => clampZoom(z / 1.2)), [clampZoom]);
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <Box
      className={className}
      position="relative"
      overflow="visible"
      style={{ width, height: containerH }}
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
            Press Esc to zoom out
          </Typography>
        </Box>
      )}

      {/* ── L3 (application): existing pan/zoom grid of orbital tiles ── */}
      {state.level === 'application' && (
        <>
          <div
            ref={transformWrapperRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              cursor: dragStateRef.current ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
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
                  aria-label={`Orbital: ${view.name}${isHighlighted ? ' (highlighted)' : ''}`}
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
            </div>
          </div>

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
            <Button variant="secondary" size="sm" onClick={zoomIn} title="Zoom in" action="COSMIC_ZOOM_IN">
              <Icon name="plus" size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={zoomOut} title="Zoom out" action="COSMIC_ZOOM_OUT">
              <Icon name="minus" size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={resetZoom} title="Reset" action="COSMIC_ZOOM_RESET">
              <Icon name="maximize" size="sm" />
            </Button>
          </Box>
        </>
      )}

      {/* ── L4 (orbital): full-size AvlOrbitalUnit + clickable trait sidebar ── */}
      {state.level === 'orbital' && orbitalLevelData && (
        <Box
          position="absolute"
          style={{
            inset: 0,
            paddingTop: 56,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {/* Big AVL orbital diagram */}
          <Box style={{ flex: 1, maxWidth: 720, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AvlOrbitalUnit
              entityName={orbitalLevelData.entity.name}
              fields={orbitalLevelData.entity.fields.length}
              persistence={(orbitalLevelData.entity.persistence || 'persistent') as AvlPersistenceKind}
              traits={orbitalLevelData.traits.map(t => ({ name: t.name }))}
              pages={orbitalLevelData.pages.map(p => ({ name: p.name }))}
              color={color}
              animated={animated}
            />
          </Box>

          {/* Trait drill list — click to enter L5 */}
          <Box
            style={{
              width: 220,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderLeft: `1px solid ${color}`,
              opacity: 0.95,
            }}
          >
            <Typography variant="small" weight="semibold" style={{ color, marginBottom: 4 }}>
              Traits ({orbitalLevelData.traits.length})
            </Typography>
            {orbitalLevelData.traits.length === 0 && (
              <Text variant="small" style={{ opacity: 0.6, color }}>No traits</Text>
            )}
            {orbitalLevelData.traits.map(trait => (
              <Button
                key={trait.name}
                variant="ghost"
                size="sm"
                onClick={() => handleTraitSelect(trait.name)}
                action="COSMIC_DRILL_TRAIT"
              >
                {trait.name}
              </Button>
            ))}
            {orbitalLevelData.pages.length > 0 && (
              <>
                <Typography variant="small" weight="semibold" style={{ color, marginTop: 12 }}>
                  Pages ({orbitalLevelData.pages.length})
                </Typography>
                {orbitalLevelData.pages.map(page => (
                  <Text key={page.name} variant="small" style={{ opacity: 0.7, color }}>
                    {page.name}
                  </Text>
                ))}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── L5 (trait): AVL state machine — click a transition to enter L6 ── */}
      {state.level === 'trait' && traitLevelData && (
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
          <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
            <AvlTraitScene
              data={traitLevelData}
              color={color}
              onTransitionClick={(idx) => handleTransitionSelect(idx)}
            />
          </svg>
        </Box>
      )}

      {/* ── L6 (transition): one transition with sexpr expression tree ── */}
      {state.level === 'transition' && transitionLevelData && (
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
          <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
            <AvlTransitionScene
              data={transitionLevelData}
              color={color}
            />
          </svg>
        </Box>
      )}
    </Box>
  );
};

AvlOrbitalsCosmicZoom.displayName = 'AvlOrbitalsCosmicZoom';
