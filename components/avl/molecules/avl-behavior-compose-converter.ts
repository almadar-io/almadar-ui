/**
 * AVL Behavior Compose Converter
 *
 * Converts BehaviorCanvasEntry[] to React Flow nodes and edges
 * for the behavior-level composition canvas.
 *
 * Parallel to avl-preview-converter.ts which works at the orbital level.
 * This works one level higher: each node is a behavior (not an orbital).
 */

import type { Node, Edge } from '@xyflow/react';
import type {
  BehaviorCanvasEntry,
  BehaviorComposeNodeData,
  BehaviorWireEdgeData,
} from './avl-behavior-compose-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Spacing for behavior compose nodes (compact, ~220px wide). */
const COMPOSE_SPACING = 320;

// ---------------------------------------------------------------------------
// Graph builder
// ---------------------------------------------------------------------------

/**
 * Build a React Flow graph for behavior-level composition.
 * Each behavior entry becomes one BehaviorComposeNode.
 */
export function behaviorsToComposeGraph(
  entries: BehaviorCanvasEntry[],
  wires: BehaviorWireEdgeData[],
  layoutHint?: 'pipeline' | 'grid',
): {
  nodes: Node<BehaviorComposeNodeData>[];
  edges: Edge<BehaviorWireEdgeData>[];
} {
  const nodes: Node<BehaviorComposeNodeData>[] = [];
  const edges: Edge<BehaviorWireEdgeData>[] = [];

  const count = entries.length;
  const cols = layoutHint === 'pipeline' ? count : Math.ceil(Math.sqrt(count));

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    nodes.push({
      id: entry.behaviorName,
      type: 'behaviorCompose',
      position: { x: col * COMPOSE_SPACING, y: row * COMPOSE_SPACING },
      data: {
        behaviorName: entry.behaviorName,
        level: entry.level,
        domain: entry.domain,
        layer: entry.layer,
        entityName: entry.entityName,
        stateCount: entry.stateCount,
        fieldCount: entry.fieldCount,
        persistence: entry.persistence,
        effectTypes: entry.effectTypes,
        children: entry.children,
        connections: entry.connections,
        connectableEvents: entry.connectableEvents,
        composableWith: entry.composableWith,
        orbitalNames: entry.orbitalNames,
      },
    });
  }

  for (const wire of wires) {
    edges.push({
      id: `bw-${wire.sourceBehavior}-${wire.targetBehavior}-${wire.event}`,
      source: wire.sourceBehavior,
      target: wire.targetBehavior,
      sourceHandle: `event-${wire.event}`,
      type: 'eventFlow',
      data: wire,
    });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Registry → Canvas Entry conversion
// ---------------------------------------------------------------------------

/** Registry record shape (matches behaviors-registry.json entries). */
export interface BehaviorRegistryRecord {
  name: string;
  level: 'atom' | 'molecule' | 'organism';
  family: string;
  layer: string;
  description: string;
  complexity: { states: number; events: number; transitions: number };
  defaultEntity: {
    name: string;
    persistence?: string;
    fields: Array<{ name: string; type: string; required?: boolean }>;
  };
  connectableEvents: string[];
  eventPayloads: Record<string, Array<{ name: string; type: string; required?: boolean }>>;
  composableWith: string[];
}

/**
 * Convert a registry entry to a BehaviorCanvasEntry.
 * Maps connectableEvents + eventPayloads into typed ConnectableEvent[].
 */
export function registryEntryToCanvasEntry(
  entry: BehaviorRegistryRecord,
  orbitalNames: string[],
): BehaviorCanvasEntry {
  const events = entry.connectableEvents;
  const connectableEvents: BehaviorCanvasEntry['connectableEvents'] = events.map((eventName, i) => ({
    event: eventName,
    payloadFields: entry.eventPayloads[eventName] as BehaviorCanvasEntry['connectableEvents'][0]['payloadFields'],
    positionHint: events.length > 1
      ? 0.1 + (i * 0.8) / (events.length - 1)
      : 0.5,
  }));

  return {
    behaviorName: entry.name,
    level: entry.level,
    domain: entry.family,
    layer: entry.layer,
    entityName: entry.defaultEntity.name,
    stateCount: entry.complexity.states,
    fieldCount: entry.defaultEntity.fields.length,
    persistence: entry.defaultEntity.persistence as BehaviorCanvasEntry['persistence'],
    connectableEvents,
    composableWith: entry.composableWith,
    orbitalNames,
  };
}
