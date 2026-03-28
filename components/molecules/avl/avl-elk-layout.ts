/**
 * AVL ELK Layout
 *
 * Shared ELK-based layout engine for state machines. Extracted from
 * AvlTraitScene so both the V2 scene renderer and the V3 BehaviorView
 * can share the same layout computation.
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import { getStateRole, type StateRole } from '../../atoms/avl/types';
import type { TraitLevelData } from '../../organisms/avl/avl-schema-parser';

// ---------------------------------------------------------------------------
// Layout types
// ---------------------------------------------------------------------------

export interface LayoutNode {
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

export interface LayoutEdge {
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

export interface ElkLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Proportional state width
// ---------------------------------------------------------------------------

export function stateWidth(transitionCount: number): number {
  if (transitionCount >= 5) return 160;
  if (transitionCount >= 3) return 130;
  return 110;
}

export const STATE_H = 40;

// ---------------------------------------------------------------------------
// ELK layout computation — LEFT-TO-RIGHT
// ---------------------------------------------------------------------------

const elk = new ELK();

export async function computeTraitLayout(data: TraitLevelData): Promise<ElkLayout> {
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
// Edge path helper
// ---------------------------------------------------------------------------

export function edgePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x},${points[i].y}`;
  return d;
}
