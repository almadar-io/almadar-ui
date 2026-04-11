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

import React, { useMemo, useState, useCallback } from 'react';
import type { OrbitalSchema } from '@almadar/core';
import { parseApplicationLevel, type CrossLink } from './avl-schema-parser';
import { AvlOrbitalUnit } from '../../molecules/avl/AvlOrbitalUnit';
import type { AvlPersistenceKind } from '../../atoms/avl/types';
import { curveControlPoint } from '../../molecules/avl/avl-layout';
import { Box } from '../../atoms/Box';
import { Typography, Text } from '../../atoms/Typography';

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
// Info panel (HTML, appears below selected orbital)
// ---------------------------------------------------------------------------

interface InfoPanelProps {
  view: OrbitalView;
  crossLinks: CrossLink[];
  color: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ view, crossLinks, color }) => {
  const emitsOut = crossLinks.filter(l => l.emitterOrbital === view.name);
  const listensIn = crossLinks.filter(l => l.listenerOrbital === view.name);

  return (
    <Box
      position="absolute"
      rounded="lg"
      paddingX="md"
      paddingY="sm"
      bg="overlay"
      style={{
        left: view.cx - 120,
        top: view.cy + UNIT_DISPLAY_H / 2 + 4,
        width: 240,
        border: `1px solid ${color}`,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <Typography weight="semibold" style={{ marginBottom: 4, color }}>{view.name}</Typography>
      <Text variant="small" style={{ opacity: 0.7, color }}>Entity: {view.entityName} ({view.fieldCount} fields, {view.persistence})</Text>
      <Text variant="small" style={{ opacity: 0.7, color }}>Traits: {view.traits.map(t => t.name).join(', ') || 'none'}</Text>
      {view.pages.length > 0 && (
        <Text variant="small" style={{ opacity: 0.7, color }}>Pages: {view.pages.map(p => p.name).join(', ')}</Text>
      )}
      {emitsOut.length > 0 && (
        <Text variant="small" style={{ opacity: 0.7, color }}>Emits → {emitsOut.map(l => `${l.eventName} → ${l.listenerOrbital}`).join(', ')}</Text>
      )}
      {listensIn.length > 0 && (
        <Text variant="small" style={{ opacity: 0.7, color }}>Listens ← {listensIn.map(l => `${l.eventName} ← ${l.emitterOrbital}`).join(', ')}</Text>
      )}
    </Box>
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

  // Selection
  const [selected, setSelected] = useState<string | null>(null);
  const handleSelect = useCallback(
    (name: string) => setSelected(prev => (prev === name ? null : name)),
    [],
  );

  const selectedView = orbitalViews.find(o => o.name === selected);

  return (
    <Box
      className={className}
      position="relative"
      overflow="visible"
      style={{ width, height: containerH }}
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

      {/* AvlOrbitalUnit molecules — one per orbital */}
      {orbitalViews.map(view => {
        const isHighlighted = view.name === highlightedOrbital;
        return (
        <Box
          key={view.name}
          role="button"
          tabIndex={0}
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
            transform: selected === view.name ? 'scale(1.05)' : 'scale(1)',
            filter: selected && selected !== view.name ? 'opacity(0.5)' : 'none',
            // GAP-52: persistent highlight ring (independent from user selection)
            boxShadow: isHighlighted
              ? `0 0 0 3px ${color}, 0 0 24px 4px ${color}`
              : 'none',
            borderRadius: isHighlighted ? '12px' : undefined,
            zIndex: isHighlighted ? 11 : selected === view.name ? 10 : 1,
          }}
        >
          <AvlOrbitalUnit
            entityName={view.entityName}
            fields={view.fieldCount}
            persistence={view.persistence}
            traits={view.traits}
            pages={view.pages}
            color={color}
            animated={animated && (selected === view.name || isHighlighted)}
          />
        </Box>
        );
      })}

      {/* Info panel for selected orbital */}
      {selectedView && (
        <InfoPanel
          view={selectedView}
          crossLinks={crossLinks}
          color={color}
        />
      )}
    </Box>
  );
};

AvlOrbitalsCosmicZoom.displayName = 'AvlOrbitalsCosmicZoom';
