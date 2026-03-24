'use client';

/**
 * AvlTraitScene V2 - Zoom Level 3
 *
 * Left-to-right horizontal flow with color-coded states,
 * transition lanes, and swim lanes for emit/listen events.
 */

import React, { useState, useEffect, useMemo } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlTransitionLane } from '../../molecules/avl/AvlTransitionLane';
import { AvlSwimLane } from '../../molecules/avl/AvlSwimLane';
import { AvlClickTarget } from './AvlClickTarget';
import { getStateRole, CONNECTION_COLORS, type StateRole, type AvlEffectType } from '../../atoms/avl/types';
import type { TraitLevelData } from './avl-schema-parser';

export interface AvlTraitSceneProps {
  data: TraitLevelData;
  color?: string;
  onTransitionClick?: (transitionIndex: number, position: { x: number; y: number }) => void;
}

// ---------------------------------------------------------------------------
// ELK layout types
// ---------------------------------------------------------------------------

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isInitial?: boolean;
  isTerminal?: boolean;
  role: StateRole;
  transitionCount: number;
}

interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  event: string;
  effects: Array<{ type: string }>;
  guard: boolean;
  guardExpr?: string;
  index: number;
  labelX: number;
  labelY: number;
  labelW: number;
  labelH: number;
  points: Array<{ x: number; y: number }>;
  isSelf: boolean;
  isBackward: boolean;
}

interface ElkLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Proportional state width
// ---------------------------------------------------------------------------

function stateWidth(transitionCount: number): number {
  if (transitionCount >= 5) return 160;
  if (transitionCount >= 3) return 130;
  return 110;
}

const STATE_H = 40;

// ---------------------------------------------------------------------------
// ELK layout computation — V2: LEFT-TO-RIGHT
// ---------------------------------------------------------------------------

const elk = new ELK();

async function computeLayout(data: TraitLevelData): Promise<ElkLayout> {
  // Count transitions per state
  const transitionCounts: Record<string, number> = {};
  for (const s of data.states) transitionCounts[s.name] = 0;
  for (const t of data.transitions) {
    transitionCounts[t.from] = (transitionCounts[t.from] ?? 0) + 1;
    transitionCounts[t.to] = (transitionCounts[t.to] ?? 0) + 1;
  }
  const maxTC = Math.max(...Object.values(transitionCounts), 0);

  const LABEL_BASE_W = 100;
  const LABEL_H = 44;

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '80',
      'elk.spacing.edgeNode': '30',
      'elk.spacing.edgeEdge': '24',
      'elk.spacing.edgeLabel': '10',
      'elk.spacing.labelLabel': '8',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.edgeLabels.placement': 'CENTER',
      'elk.layered.mergeEdges': 'false',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: data.states.map(s => {
      const tc = transitionCounts[s.name] ?? 0;
      const w = stateWidth(tc);
      return {
        id: s.name,
        width: w,
        height: STATE_H,
        labels: [{ text: s.name, width: w - 10, height: 14 }],
      };
    }),
    edges: data.transitions.map((t, i) => {
      const textW = Math.max(t.event.length * 8, 60);
      const iconsW = Math.min(t.effects.length, 6) * 28 + 20;
      const labelW = Math.max(textW, iconsW, LABEL_BASE_W);
      return {
        id: `e${i}`,
        sources: [t.from],
        targets: [t.to],
        labels: [{
          text: t.event,
          width: labelW,
          height: LABEL_H,
        }],
      };
    }),
  };

  const layout = await elk.layout(elkGraph) as Record<string, unknown>;
  const layoutChildren = (layout.children ?? []) as Array<Record<string, unknown>>;
  const layoutEdges = (layout.edges ?? []) as Array<Record<string, unknown>>;

  // Build node position map for backward detection
  const nodeXMap: Record<string, number> = {};
  for (const n of layoutChildren) {
    nodeXMap[n.id as string] = (n.x as number) ?? 0;
  }

  const nodes: LayoutNode[] = layoutChildren.map(n => {
    const name = n.id as string;
    const stateInfo = data.states.find(s => s.name === name);
    const tc = transitionCounts[name] ?? 0;
    return {
      id: name,
      x: (n.x as number) ?? 0,
      y: (n.y as number) ?? 0,
      width: (n.width as number) ?? 110,
      height: (n.height as number) ?? STATE_H,
      isInitial: stateInfo?.isInitial,
      isTerminal: stateInfo?.isTerminal,
      role: getStateRole(name, stateInfo?.isInitial, stateInfo?.isTerminal, tc, maxTC),
      transitionCount: tc,
    };
  });

  const edges: LayoutEdge[] = layoutEdges.map((e, i) => {
    const t = data.transitions[i];
    const labels = (e.labels ?? []) as Array<Record<string, unknown>>;
    const label = labels[0];
    const sections = (e.sections ?? []) as Array<Record<string, unknown>>;
    const points: Array<{ x: number; y: number }> = [];

    for (const section of sections) {
      const startPoint = section.startPoint as { x: number; y: number };
      const endPoint = section.endPoint as { x: number; y: number };
      const bendPoints = (section.bendPoints ?? []) as Array<{ x: number; y: number }>;
      points.push({ x: startPoint.x, y: startPoint.y });
      for (const bp of bendPoints) points.push({ x: bp.x, y: bp.y });
      points.push({ x: endPoint.x, y: endPoint.y });
    }

    const isSelf = t.from === t.to;
    const isBackward = !isSelf && (nodeXMap[t.to] ?? 0) <= (nodeXMap[t.from] ?? 0);
    const lw = (label?.width as number) ?? LABEL_BASE_W;
    const lh = (label?.height as number) ?? LABEL_H;

    return {
      id: e.id as string,
      from: t.from,
      to: t.to,
      event: t.event,
      effects: t.effects,
      guard: !!t.guard,
      guardExpr: typeof t.guard === 'string' ? t.guard : undefined,
      index: t.index,
      labelX: (label?.x as number) ?? 0,
      labelY: (label?.y as number) ?? 0,
      labelW: lw,
      labelH: lh,
      points,
      isSelf,
      isBackward,
    };
  });

  return {
    nodes,
    edges,
    width: (layout.width as number) ?? 600,
    height: (layout.height as number) ?? 400,
  };
}

// ---------------------------------------------------------------------------
// Edge path
// ---------------------------------------------------------------------------

function edgePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x},${points[i].y}`;
  return d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SWIM_GUTTER = 120;
const CENTER_W = 360;

export const AvlTraitScene: React.FC<AvlTraitSceneProps> = ({
  data,
  color = 'var(--color-primary)',
  onTransitionClick,
}) => {
  const [layout, setLayout] = useState<ElkLayout | null>(null);
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

  const hasExternal = data.listenedEvents.length > 0 || data.emittedEvents.length > 0;
  const viewW = hasExternal ? SWIM_GUTTER + CENTER_W + SWIM_GUTTER : CENTER_W + 60;
  const machineOffsetX = hasExternal ? 0 : 30;

  // Scale the ELK layout to fit the center area
  const padding = 20;
  const availW = CENTER_W - padding * 2;
  const availH = 300;
  const scale = Math.min(1, availW / layout.width, availH / layout.height);
  const scaledW = layout.width * scale;
  const scaledH = layout.height * scale;
  const offsetX = padding + (availW - scaledW) / 2;
  const offsetY = 50 + (availH - scaledH) / 2;

  const machineHeight = scaledH + 100;

  const renderMachine = (
    <g>
      {/* Trait label */}
      <text x={CENTER_W / 2} y={20} textAnchor="middle" fill={color} fontSize={20} fontWeight="700" fontFamily="inherit">
        {data.name}
      </text>
      <text x={CENTER_W / 2} y={38} textAnchor="middle" fill={color} fontSize={11} opacity={0.5} fontFamily="inherit">
        linked to {data.linkedEntity}
      </text>

      {/* Arrow markers */}
      <defs>
        <marker id="traitArrowV2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CONNECTION_COLORS.forward.color} opacity={0.7} />
        </marker>
        <marker id="traitArrowBack" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={CONNECTION_COLORS.backward.color} opacity={0.5} />
        </marker>
      </defs>

      <g transform={`translate(${offsetX},${offsetY}) scale(${scale})`}>
        {/* Edge paths */}
        {layout.edges.map((edge) => {
          const conn = edge.isSelf
            ? CONNECTION_COLORS.selfLoop
            : edge.isBackward
              ? CONNECTION_COLORS.backward
              : CONNECTION_COLORS.forward;
          const marker = edge.isBackward || edge.isSelf ? 'url(#traitArrowBack)' : 'url(#traitArrowV2)';

          return (
            <g key={edge.id}>
              <path
                d={edgePath(edge.points)}
                fill="none"
                stroke={conn.color}
                strokeWidth={conn.width}
                strokeDasharray={conn.dash === 'none' ? undefined : conn.dash}
                opacity={0.5}
                markerEnd={marker}
              />

              {/* Transition lane at label position */}
              <AvlTransitionLane
                x={edge.labelX}
                y={edge.labelY}
                event={edge.event}
                guard={edge.guardExpr}
                effects={edge.effects.map(e => ({ type: e.type as AvlEffectType }))}
                width={edge.labelW}
                isBackward={edge.isBackward}
                isSelfLoop={edge.isSelf}
                color={color}
                onTransitionClick={onTransitionClick
                  ? () => onTransitionClick(edge.index, {
                    x: edge.labelX + offsetX + (hasExternal ? SWIM_GUTTER : machineOffsetX),
                    y: edge.labelY + offsetY,
                  })
                  : undefined
                }
              />
            </g>
          );
        })}

        {/* State nodes */}
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
              role={node.role}
              transitionCount={node.transitionCount}
              color={color}
            />
          </g>
        ))}
      </g>
    </g>
  );

  if (!hasExternal) {
    return <g transform={`translate(${machineOffsetX}, 0)`}>{renderMachine}</g>;
  }

  return (
    <AvlSwimLane
      listenedEvents={data.listenedEvents}
      emittedEvents={data.emittedEvents}
      centerWidth={CENTER_W}
      height={machineHeight}
      color={color}
    >
      {renderMachine}
    </AvlSwimLane>
  );
};

AvlTraitScene.displayName = 'AvlTraitScene';
