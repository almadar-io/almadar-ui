/**
 * AVL dependency graph — the app over what it is built from (the cosmic
 * Dependencies lens): orbitals, then the io realizations, std behaviors and
 * std UI primitives they import, left to right, one edge per `uses` import.
 * The host supplies the graph (orbitals' imports and each behavior's own).
 */

import type { Edge, Node } from '@xyflow/react';
import type { PreviewNodeData } from './avl-preview-converter';

export type DependencyLayer = 'io' | 'std' | 'primitive' | 'unknown';

export interface SystemDependencies {
  orbitals: Record<string, readonly string[]>;
  behaviors: Record<string, { layer: DependencyLayer; imports: readonly string[] }>;
}

export type DependencyColumn = 'app' | DependencyLayer;

const COLUMNS: readonly DependencyColumn[] = ['app', 'io', 'std', 'primitive', 'unknown'];
const WIDTH: Record<DependencyColumn, number> = { app: 240, io: 220, std: 250, primitive: 200, unknown: 220 };
export const DEPENDENCY_ROW = { height: 26, gap: 8, columnGap: 120, headerHeight: 30 };

export const orbitalNodeId = (name: string): string => `orbital:${name}`;
export const behaviorNodeId = (name: string): string => `behavior:${name}`;

/** Every edge the graph draws, as node ids: each orbital to each import, each behavior to each of its own (not itself). */
function importEdges(deps: SystemDependencies): Array<[string, string]> {
  const edges: Array<[string, string]> = [];
  for (const [orbital, imports] of Object.entries(deps.orbitals)) {
    for (const b of new Set(imports)) edges.push([orbitalNodeId(orbital), behaviorNodeId(b)]);
  }
  for (const [name, b] of Object.entries(deps.behaviors)) {
    for (const i of new Set(b.imports)) if (i !== name) edges.push([behaviorNodeId(name), behaviorNodeId(i)]);
  }
  return edges;
}

export function schemaToDependencyGraph(deps: SystemDependencies): { nodes: Node<PreviewNodeData>[]; edges: Edge[] } {
  const byColumn = new Map<DependencyColumn, Array<{ id: string; label: string }>>(COLUMNS.map((c) => [c, []]));
  for (const orbital of Object.keys(deps.orbitals)) byColumn.get('app')?.push({ id: orbitalNodeId(orbital), label: orbital });
  for (const [name, b] of Object.entries(deps.behaviors).sort(([a], [z]) => a.localeCompare(z))) {
    byColumn.get(b.layer)?.push({ id: behaviorNodeId(name), label: name });
  }
  const nodes: Node<PreviewNodeData>[] = [];
  let x = 0;
  for (const column of COLUMNS) {
    const items = byColumn.get(column) ?? [];
    if (items.length === 0) continue;
    nodes.push({
      id: `__column_${column}`,
      type: 'dependencyColumn',
      position: { x, y: 0 },
      draggable: false,
      selectable: false,
      data: { orbitalName: `__column_${column}`, kind: 'dependency-column', dependencyColumn: column, patterns: [], eventSources: [] },
    });
    items.forEach((item, row) => {
      nodes.push({
        id: item.id,
        type: 'dependency',
        position: { x, y: DEPENDENCY_ROW.headerHeight + row * (DEPENDENCY_ROW.height + DEPENDENCY_ROW.gap) },
        draggable: false,
        data: { orbitalName: item.label, kind: 'dependency', dependencyColumn: column, cardWidth: WIDTH[column], patterns: [], eventSources: [] },
      });
    });
    x += WIDTH[column] + DEPENDENCY_ROW.columnGap;
  }
  const edges: Edge[] = importEdges(deps).map(([source, target]) => ({ id: `dep-${source}-${target}`, source, target }));
  return { nodes, edges };
}

/** What `selected` is built from (upstream, through every import) and what reaches it (downstream). */
export function dependencyReach(deps: SystemDependencies, selected: string): { upstream: Set<string>; downstream: Set<string> } {
  const edges = importEdges(deps);
  const walk = (from: string, next: (e: [string, string]) => [string, string] | null): Set<string> => {
    const seen = new Set<string>();
    const stack = [from];
    while (stack.length > 0) {
      const at = stack.pop();
      for (const e of edges) {
        const hop = next(e);
        if (hop && hop[0] === at && hop[1] !== selected && !seen.has(hop[1])) {
          seen.add(hop[1]);
          stack.push(hop[1]);
        }
      }
    }
    return seen;
  };
  return { upstream: walk(selected, (e) => e), downstream: walk(selected, ([a, b]) => [b, a]) };
}
