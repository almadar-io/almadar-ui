'use client';

/**
 * AvlTraitScene - Zoom Level 3
 *
 * Shows a trait's state machine using ELK (elkjs) for automatic
 * node and edge label placement. No label overlap.
 */

import React, { useState, useEffect, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlGuard } from '../../atoms/avl/AvlGuard';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { AvlClickTarget } from './AvlClickTarget';
import type { TraitLevelData } from './avl-schema-parser';

export interface AvlTraitSceneProps {
  data: TraitLevelData;
  color?: string;
  onTransitionClick?: (transitionIndex: number, position: { x: number; y: number }) => void;
}

// ---------------------------------------------------------------------------
// ELK layout computation
// ---------------------------------------------------------------------------

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isInitial?: boolean;
  isTerminal?: boolean;
}

interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  event: string;
  effects: Array<{ type: string }>;
  guard: boolean;
  index: number;
  // ELK-computed positions
  labelX: number;
  labelY: number;
  points: Array<{ x: number; y: number }>;
  isSelf: boolean;
}

interface ElkLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

const STATE_W = 110;
const STATE_H = 38;
const LABEL_W = 90;
const LABEL_H = 20;

const elk = new ELK();

async function computeLayout(data: TraitLevelData): Promise<ElkLayout> {
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.spacing.edgeNode': '30',
      'elk.spacing.edgeEdge': '20',
      'elk.spacing.edgeLabel': '8',
      'elk.spacing.labelLabel': '6',
      'elk.layered.spacing.nodeNodeBetweenLayers': '60',
      'elk.edgeLabels.placement': 'CENTER',
      'elk.layered.mergeEdges': 'false',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: data.states.map(s => ({
      id: s.name,
      width: STATE_W,
      height: STATE_H,
      labels: [{ text: s.name, width: STATE_W - 10, height: 14 }],
    })),
    edges: data.transitions.map((t, i) => {
      const hasEffects = t.effects.length > 0;
      const labelH = hasEffects ? 38 : LABEL_H;
      const textW = Math.max(t.event.length * 7, 40);
      const iconsW = Math.min(t.effects.length, 4) * 14;
      const labelW = Math.max(textW, iconsW, LABEL_W) + 20;
      return {
        id: `e${i}`,
        sources: [t.from],
        targets: [t.to],
        labels: [{
          text: t.event,
          width: labelW,
          height: labelH,
        }],
      };
    }),
  };

  const layout = await elk.layout(elkGraph);

  const nodes: LayoutNode[] = (layout.children ?? []).map(n => ({
    id: n.id,
    x: n.x ?? 0,
    y: n.y ?? 0,
    width: n.width ?? STATE_W,
    height: n.height ?? STATE_H,
    isInitial: data.states.find(s => s.name === n.id)?.isInitial,
    isTerminal: data.states.find(s => s.name === n.id)?.isTerminal,
  }));

  const edges: LayoutEdge[] = (layout.edges ?? []).map((e, i) => {
    const t = data.transitions[i];
    const label = e.labels?.[0];
    const sections = e.sections ?? [];
    const points: Array<{ x: number; y: number }> = [];

    for (const section of sections) {
      points.push({ x: section.startPoint.x, y: section.startPoint.y });
      if (section.bendPoints) {
        for (const bp of section.bendPoints) {
          points.push({ x: bp.x, y: bp.y });
        }
      }
      points.push({ x: section.endPoint.x, y: section.endPoint.y });
    }

    return {
      id: e.id,
      from: t.from,
      to: t.to,
      event: t.event,
      effects: t.effects,
      guard: !!t.guard,
      index: t.index,
      labelX: (label?.x ?? 0) + (label?.width ?? 0) / 2,
      labelY: (label?.y ?? 0) + (label?.height ?? 0) / 2,
      points,
      isSelf: t.from === t.to,
    };
  });

  return {
    nodes,
    edges,
    width: layout.width ?? 600,
    height: layout.height ?? 400,
  };
}

// ---------------------------------------------------------------------------
// Edge path rendering
// ---------------------------------------------------------------------------

function edgePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x},${points[i].y}`;
  }
  return d;
}

function mapEffectType(label: string): 'render-ui' | 'set' | 'persist' | 'fetch' | 'emit' | 'navigate' | 'notify' | 'call-service' | 'log' {
  const map: Record<string, 'render-ui' | 'set' | 'persist' | 'fetch' | 'emit' | 'navigate' | 'notify' | 'call-service' | 'log'> = {
    'render-ui': 'render-ui', set: 'set', persist: 'persist', fetch: 'fetch',
    emit: 'emit', navigate: 'navigate', notify: 'notify', 'call-service': 'call-service', log: 'log',
  };
  return map[label] ?? 'log';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AvlTraitScene: React.FC<AvlTraitSceneProps> = ({
  data,
  color = 'var(--color-primary)',
  onTransitionClick,
}) => {
  const [layout, setLayout] = useState<ElkLayout | null>(null);

  // Compute layout when data changes
  const dataKey = useMemo(() => JSON.stringify(data), [data]);
  useEffect(() => {
    computeLayout(data).then(setLayout).catch(console.error);
  }, [dataKey]);

  if (!layout) {
    return (
      <g>
        <text x={300} y={200} textAnchor="middle" fill={color} fontSize={12} opacity={0.5}>
          Computing layout...
        </text>
      </g>
    );
  }

  // Center the layout in the viewBox, scaling if needed
  const padding = 30;
  const availW = 600 - padding * 2;
  const availH = 340;
  const scale = Math.min(1, availW / layout.width, availH / layout.height);
  const scaledW = layout.width * scale;
  const scaledH = layout.height * scale;
  const offsetX = padding + (availW - scaledW) / 2;
  const offsetY = 60 + (availH - scaledH) / 2;

  return (
    <g>
      {/* Trait label */}
      <text x={300} y={24} textAnchor="middle" fill={color} fontSize={16} fontWeight="bold">
        {data.name}
      </text>
      <text x={300} y={42} textAnchor="middle" fill={color} fontSize={11} opacity={0.5}>
        linked to {data.linkedEntity}
      </text>

      {/* Arrow marker */}
      <defs>
        <marker id="traitArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} opacity={0.6} />
        </marker>
      </defs>

      <g transform={`translate(${offsetX},${offsetY}) scale(${scale})`}>
        {/* Edges (behind nodes) */}
        {layout.edges.map((edge) => {
          const hasEmit = edge.effects.some(e => e.type === 'emit');

          return (
            <g key={edge.id}>
              {/* Edge path */}
              <path
                d={edgePath(edge.points)}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={0.4}
                markerEnd="url(#traitArrow)"
              />

              {/* Compound label card: event name + effect icons in one card */}
              {(() => {
                const visibleEffects = edge.effects.slice(0, 4);
                const textW = Math.max(edge.event.length * 7, 40);
                const iconsW = visibleEffects.length * 14;
                const cardW = Math.max(textW, iconsW) + 20;
                const hasEffects = visibleEffects.length > 0;
                const cardH = hasEffects ? 34 : 20;
                const cardX = edge.labelX - cardW / 2;
                const cardY = edge.labelY - 10;

                return (
                  <g>
                    {/* Card background */}
                    <rect
                      x={cardX}
                      y={cardY}
                      width={cardW}
                      height={cardH}
                      rx={5}
                      fill="var(--color-surface, white)"
                      stroke={color}
                      strokeWidth={0.8}
                      opacity={0.95}
                    />

                    {/* Event name */}
                    <text
                      x={edge.labelX}
                      y={cardY + 13}
                      textAnchor="middle"
                      fill={color}
                      fontSize={11}
                      fontWeight="600"
                    >
                      {edge.event}
                    </text>

                    {/* Effect icons row (inside the card) */}
                    {hasEffects && (
                      <g>
                        {visibleEffects.map((eff, ei) => {
                          const iconX = edge.labelX - (visibleEffects.length - 1) * 7 + ei * 14;
                          return (
                            <AvlEffect
                              key={`${edge.id}-eff-${ei}`}
                              x={iconX}
                              y={cardY + 25}
                              effectType={mapEffectType(eff.type)}
                              size={9}
                              color={color}
                            />
                          );
                        })}
                      </g>
                    )}

                    {/* Guard indicator (small diamond inside card) */}
                    {edge.guard && (
                      <AvlGuard
                        x={cardX + cardW - 10}
                        y={cardY + 10}
                        label=""
                        color={color}
                        size={6}
                      />
                    )}

                    {/* Emit pulse (outside card, to the left) */}
                    {hasEmit && (
                      <circle cx={cardX - 8} cy={cardY + cardH / 2} r={3} fill={color} opacity={0.5}>
                        <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })()}

              {/* Click target */}
              {onTransitionClick && (
                <AvlClickTarget
                  x={edge.labelX - 50}
                  y={edge.labelY - 15}
                  width={100}
                  height={30}
                  onClick={() => onTransitionClick(edge.index, { x: edge.labelX + offsetX, y: edge.labelY + offsetY })}
                  label={`${edge.event}: ${edge.from} -> ${edge.to}`}
                  glowColor={color}
                >
                  <rect x={0} y={0} width={0} height={0} fill="transparent" />
                </AvlClickTarget>
              )}
            </g>
          );
        })}

        {/* State nodes (on top of edges) */}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <AvlState
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              name={node.id}
              isInitial={node.isInitial}
              isTerminal={node.isTerminal}
              color={color}
            />
          </g>
        ))}
      </g>

      {/* External emit indicators */}
      {data.emittedEvents.map((evt, i) => (
        <g key={`emit-${i}`}>
          <line x1={450} y1={55 + i * 22} x2={585} y2={55 + i * 22} stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.3} />
          <text x={588} y={59 + i * 22} fill={color} fontSize={10} opacity={0.5}>emit: {evt}</text>
        </g>
      ))}

      {/* External listen indicators */}
      {data.listenedEvents.map((evt, i) => (
        <g key={`listen-${i}`}>
          <line x1={15} y1={55 + i * 22} x2={150} y2={55 + i * 22} stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.3} />
          <text x={5} y={59 + i * 22} fill={color} fontSize={10} opacity={0.5}>listen: {evt}</text>
        </g>
      ))}
    </g>
  );
};

AvlTraitScene.displayName = 'AvlTraitScene';
