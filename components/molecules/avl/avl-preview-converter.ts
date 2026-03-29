/**
 * AVL Preview Converter
 *
 * Extracts render-ui pattern configs from OrbitalSchema transitions
 * and builds React Flow graphs for the two FlowCanvas levels:
 *   - Overview: one node per orbital (INIT transition UI)
 *   - Expanded: one node per UI state within an orbital
 *
 * Key feature: detects interactive elements (buttons, links) inside
 * patterns that fire events. These become per-element source handles
 * so edges connect from the specific trigger element to the target screen.
 *
 * Uses @almadar/core types for schema-level constructs.
 */

import type { Node, Edge } from '@xyflow/react';
import type {
  OrbitalSchema,
  OrbitalDefinition,
  Trait,
  Transition,
  State,
  Effect,
} from '@almadar/core';
import type {
  PreviewNodeData,
  EventEdgeData,
  RenderUIEntry,
  PatternEventSource,
} from './avl-preview-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Spacing must exceed the largest screen preset (desktop 780px) plus margin
const OVERVIEW_SPACING = 900;
const EXPANDED_SPACING_X = 900;
const EXPANDED_SPACING_Y = 600;

/** Pattern types that can fire events via their `event` prop. */
const EVENT_FIRING_PATTERNS = new Set([
  'button', 'icon-button', 'link', 'menu-item', 'action-button',
  'float-button', 'input', 'select', 'checkbox', 'radio',
  'card', 'list-item', 'tab', 'breadcrumb-item',
]);

// ---------------------------------------------------------------------------
// Schema accessors (safe access to possibly-untyped schema data)
// ---------------------------------------------------------------------------

function getOrbitals(schema: OrbitalSchema): OrbitalDefinition[] {
  return schema.orbitals ?? [];
}

function getTraits(orbital: OrbitalDefinition): Trait[] {
  if (!orbital.traits) return [];
  return orbital.traits.map(t => {
    if (typeof t === 'string') return { name: t } as Trait;
    if ('ref' in (t as Record<string, unknown>)) return { name: (t as { ref: string }).ref } as Trait;
    return t as Trait;
  });
}

function getStateMachine(trait: Trait): { states: State[]; transitions: Transition[] } | null {
  const sm = trait.stateMachine;
  if (!sm) return null;
  return {
    states: (sm.states ?? []) as State[],
    transitions: (sm.transitions ?? []) as Transition[],
  };
}

function getEntityInfo(orbital: OrbitalDefinition): { name: string; persistence: string; fieldCount: number } {
  const entity = orbital.entity;
  if (typeof entity === 'string') {
    return { name: entity, persistence: 'runtime', fieldCount: 0 };
  }
  const e = entity as unknown as Record<string, unknown>;
  const fields = (e.fields as unknown[]) ?? [];
  return {
    name: (e.name as string) ?? orbital.name,
    persistence: (e.persistence as string) ?? 'runtime',
    fieldCount: fields.length,
  };
}

function getPages(orbital: OrbitalDefinition): string[] {
  if (!orbital.pages) return [];
  return orbital.pages.map(p => {
    if (typeof p === 'string') return `/${p.toLowerCase()}`;
    const po = p as unknown as Record<string, unknown>;
    return (po.path as string) ?? `/${(po.name as string) ?? ''}`.toLowerCase();
  });
}

function getEmits(trait: Trait): string[] {
  const emits = trait.emits as Array<{ event: string } | string> | undefined;
  if (!emits) return [];
  return emits.map(e => typeof e === 'string' ? e : e.event ?? '');
}

function getListens(trait: Trait): string[] {
  const listens = trait.listens as Array<{ event: string } | string> | undefined;
  if (!listens) return [];
  return listens.map(l => typeof l === 'string' ? l : l.event ?? '');
}

// ---------------------------------------------------------------------------
// Render-UI extraction
// ---------------------------------------------------------------------------

/** Extract render-ui patterns from a transition's effects array. */
function extractRenderUI(effects: Effect[]): RenderUIEntry[] {
  const patterns: RenderUIEntry[] = [];
  for (const eff of effects) {
    if (!Array.isArray(eff)) continue;
    const [type, ...args] = eff as [string, ...unknown[]];
    if (type === 'render-ui' && args.length >= 2) {
      const slot = args[0] as string;
      const pattern = args[1];
      if (pattern !== null && pattern !== undefined && typeof pattern === 'object') {
        patterns.push({ slot, pattern: pattern as Record<string, unknown> });
      }
    }
  }
  return patterns;
}

/** Extract effect type names from an effects array. */
function extractEffectTypes(effects: Effect[]): string[] {
  const types = new Set<string>();
  for (const eff of effects) {
    if (Array.isArray(eff) && typeof eff[0] === 'string') {
      types.add(eff[0]);
    }
  }
  return Array.from(types);
}

// ---------------------------------------------------------------------------
// Event source detection — find buttons/links that fire events
// ---------------------------------------------------------------------------

/**
 * Recursively scan a pattern config tree for elements with an `event` prop.
 * Returns all interactive elements that fire state machine events.
 *
 * Example: { type: "button", label: "Checkout", event: "CHECKOUT" }
 * → PatternEventSource { event: "CHECKOUT", patternType: "button", label: "Checkout" }
 */
function findEventSources(
  config: Record<string, unknown>,
  path = 'root',
  depth = 0,
  totalSiblings = 1,
  siblingIndex = 0,
): PatternEventSource[] {
  const sources: PatternEventSource[] = [];
  if (depth > 10) return sources; // Prevent infinite recursion

  const patternType = config.type as string | undefined;
  const event = config.event as string | undefined;

  // Check if this element fires an event
  if (patternType && event && typeof event === 'string') {
    // Compute a vertical position hint based on the element's depth and index
    // This helps position the source handle near the trigger element
    const positionHint = totalSiblings > 1
      ? (siblingIndex + 0.5) / totalSiblings
      : 0.5 + (depth * 0.1);

    sources.push({
      event,
      patternType,
      label: (config.label as string) ?? (config.content as string) ?? (config.text as string),
      path,
      positionHint: Math.min(Math.max(positionHint, 0.1), 0.9),
    });
  }

  // Recurse into children
  const children = config.children as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child && typeof child === 'object') {
        sources.push(
          ...findEventSources(child, `${path}.children.${i}`, depth + 1, children.length, i),
        );
      }
    }
  }

  // Recurse into named props that might be pattern configs (e.g., flip-card front/back)
  for (const [key, value] of Object.entries(config)) {
    if (key === 'children' || key === 'type' || key === 'event') continue;
    if (value && typeof value === 'object' && !Array.isArray(value) && 'type' in (value as Record<string, unknown>)) {
      sources.push(
        ...findEventSources(value as Record<string, unknown>, `${path}.${key}`, depth + 1, totalSiblings, siblingIndex),
      );
    }
  }

  return sources;
}

/** Collect all event sources across all patterns in a node. */
function collectEventSources(patterns: RenderUIEntry[]): PatternEventSource[] {
  const allSources: PatternEventSource[] = [];
  for (const entry of patterns) {
    allSources.push(...findEventSources(entry.pattern));
  }
  // Deduplicate by event name (keep first occurrence)
  const seen = new Set<string>();
  return allSources.filter(s => {
    if (seen.has(s.event)) return false;
    seen.add(s.event);
    return true;
  });
}

// ---------------------------------------------------------------------------
// State role detection
// ---------------------------------------------------------------------------

function detectStateRole(
  stateName: string,
  states: State[],
  transitions: Transition[],
): 'initial' | 'terminal' | 'hub' | 'error' | 'default' {
  const stateInfo = states.find(s => s.name === stateName);
  if (stateInfo?.isInitial) return 'initial';
  if (stateInfo?.isTerminal || stateInfo?.isFinal) return 'terminal';

  const lowerName = stateName.toLowerCase();
  if (lowerName.includes('error') || lowerName.includes('fail')) return 'error';

  // Hub: state with most transitions (in + out)
  const counts = new Map<string, number>();
  for (const t of transitions) {
    counts.set(t.from, (counts.get(t.from) ?? 0) + 1);
    counts.set(t.to, (counts.get(t.to) ?? 0) + 1);
  }
  let maxCount = 0;
  let maxState = '';
  for (const [s, c] of counts) {
    if (c > maxCount) { maxCount = c; maxState = s; }
  }
  if (stateName === maxState && maxCount > 2) return 'hub';

  return 'default';
}

function isBackwardTransition(from: string, to: string, states: State[]): boolean {
  const fromIdx = states.findIndex(s => s.name === from);
  const toIdx = states.findIndex(s => s.name === to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx < fromIdx;
}

// ---------------------------------------------------------------------------
// Cross-link detection (emit/listen matching between orbitals)
// ---------------------------------------------------------------------------

interface CrossLink {
  emitterOrbital: string;
  listenerOrbital: string;
  event: string;
  emitterTrait: string;
  listenerTrait: string;
}

function findCrossLinks(orbitals: OrbitalDefinition[]): CrossLink[] {
  const links: CrossLink[] = [];
  const emitters: Array<{ orbital: string; trait: string; event: string }> = [];
  const listeners: Array<{ orbital: string; trait: string; event: string }> = [];

  for (const orb of orbitals) {
    for (const trait of getTraits(orb)) {
      for (const e of getEmits(trait)) {
        emitters.push({ orbital: orb.name, trait: trait.name, event: e });
      }
      for (const l of getListens(trait)) {
        listeners.push({ orbital: orb.name, trait: trait.name, event: l });
      }
    }
  }

  // Match emitters to listeners across different orbitals
  for (const em of emitters) {
    for (const li of listeners) {
      if (em.event === li.event && em.orbital !== li.orbital) {
        links.push({
          emitterOrbital: em.orbital,
          listenerOrbital: li.orbital,
          event: em.event,
          emitterTrait: em.trait,
          listenerTrait: li.trait,
        });
      }
    }
  }

  return links;
}

// ---------------------------------------------------------------------------
// Level 1: Overview graph (one node per orbital)
// ---------------------------------------------------------------------------

/**
 * Build a React Flow graph for the overview level.
 * Each orbital gets one node showing its INIT transition's UI.
 */
export function schemaToOverviewGraph(schema: OrbitalSchema, mockData?: Record<string, unknown[]>): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbitals = getOrbitals(schema);
  const nodes: Node<PreviewNodeData>[] = [];
  const edges: Edge<EventEdgeData>[] = [];

  const count = orbitals.length;
  const cols = Math.ceil(Math.sqrt(count));

  for (let i = 0; i < orbitals.length; i++) {
    const orb = orbitals[i];
    const entityInfo = getEntityInfo(orb);
    const pageRoutes = getPages(orb);
    const traits = getTraits(orb);

    // Find INIT transition with render-ui across all traits
    let initPatterns: RenderUIEntry[] = [];
    let initEffectTypes: string[] = [];

    for (const trait of traits) {
      const sm = getStateMachine(trait);
      if (!sm) continue;

      const initT = sm.transitions.find(t => t.event === 'INIT');
      if (initT?.effects) {
        const patterns = extractRenderUI(initT.effects);
        if (patterns.length > 0) {
          initPatterns = patterns;
          initEffectTypes = extractEffectTypes(initT.effects);
          break;
        }
      }
    }

    // Fallback: first transition with render-ui
    if (initPatterns.length === 0) {
      for (const trait of traits) {
        const sm = getStateMachine(trait);
        if (!sm) continue;
        for (const t of sm.transitions) {
          if (t.effects) {
            const patterns = extractRenderUI(t.effects);
            if (patterns.length > 0) {
              initPatterns = patterns;
              initEffectTypes = extractEffectTypes(t.effects);
              break;
            }
          }
        }
        if (initPatterns.length > 0) break;
      }
    }

    const eventSources = collectEventSources(initPatterns);

    const col = i % cols;
    const row = Math.floor(i / cols);

    nodes.push({
      id: orb.name,
      type: 'preview',
      position: { x: col * OVERVIEW_SPACING, y: row * OVERVIEW_SPACING },
      data: {
        orbitalName: orb.name,
        patterns: initPatterns,
        eventSources,
        effectTypes: initEffectTypes,
        stateRole: 'initial',
        entityName: entityInfo.name,
        persistence: entityInfo.persistence,
        fieldCount: entityInfo.fieldCount,
        traitCount: traits.length,
        pageRoutes,
        _fullSchema: schema,
        _mockData: mockData,
      },
    });
  }

  // Cross-orbital event wire edges
  for (const link of findCrossLinks(orbitals)) {
    // Try to find the trigger element in the source orbital's patterns
    const sourceNode = nodes.find(n => n.id === link.emitterOrbital);
    const sourceData = sourceNode?.data as PreviewNodeData | undefined;
    const triggerSource = sourceData?.eventSources.find(s => s.event === link.event);

    edges.push({
      id: `ew-${link.emitterOrbital}-${link.listenerOrbital}-${link.event}`,
      source: link.emitterOrbital,
      target: link.listenerOrbital,
      sourceHandle: triggerSource ? `event-${link.event}` : undefined,
      type: 'eventFlow',
      data: {
        event: link.event,
        isCrossOrbital: true,
        fromTrait: link.emitterTrait,
        toTrait: link.listenerTrait,
        triggerPatternType: triggerSource?.patternType,
        triggerLabel: triggerSource?.label,
      },
    });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Level 2: Expanded graph (one node per UI state within an orbital)
// ---------------------------------------------------------------------------

/**
 * Build a React Flow graph for the expanded level.
 * Each transition with a render-ui effect gets a node.
 * Edges connect from the specific button/pattern that fires the event
 * to the target screen node.
 */
export function orbitalToExpandedGraph(
  schema: OrbitalSchema,
  orbitalName: string,
  mockData?: Record<string, unknown[]>,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const nodes: Node<PreviewNodeData>[] = [];
  const edges: Edge<EventEdgeData>[] = [];

  const orbital = getOrbitals(schema).find(o => o.name === orbitalName);
  if (!orbital) return { nodes, edges };

  const entityInfo = getEntityInfo(orbital);
  const traits = getTraits(orbital);

  // Collect all transitions with render-ui across traits
  const uiTransitions: Array<{
    traitName: string;
    transition: Transition;
    patterns: RenderUIEntry[];
    eventSources: PatternEventSource[];
    states: State[];
    allTransitions: Transition[];
  }> = [];

  for (const trait of traits) {
    const sm = getStateMachine(trait);
    if (!sm) continue;

    for (const t of sm.transitions) {
      if (!t.effects) continue;
      const patterns = extractRenderUI(t.effects);
      if (patterns.length > 0) {
        uiTransitions.push({
          traitName: trait.name,
          transition: t,
          patterns,
          eventSources: collectEventSources(patterns),
          states: sm.states,
          allTransitions: sm.transitions,
        });
      }
    }
  }

  if (uiTransitions.length === 0) return { nodes, edges };

  // Deduplicate by target state (keep the most informative per state)
  const stateNodeMap = new Map<string, typeof uiTransitions[0]>();
  for (const entry of uiTransitions) {
    const key = `${entry.traitName}:${entry.transition.to}`;
    const existing = stateNodeMap.get(key);
    if (!existing || entry.patterns.length > existing.patterns.length) {
      stateNodeMap.set(key, entry);
    }
  }

  // Position nodes
  const entries = Array.from(stateNodeMap.values());
  const cols = Math.min(entries.length, 3);

  // Create nodes
  const nodeIdMap = new Map<string, string>(); // stateKey → nodeId
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const t = entry.transition;
    const nodeId = `${orbitalName}-${entry.traitName}-${t.event}-${t.to}`;
    const stateKey = `${entry.traitName}:${t.to}`;
    nodeIdMap.set(stateKey, nodeId);

    const col = i % cols;
    const row = Math.floor(i / cols);

    nodes.push({
      id: nodeId,
      type: 'preview',
      position: { x: col * EXPANDED_SPACING_X, y: row * EXPANDED_SPACING_Y },
      data: {
        orbitalName,
        traitName: entry.traitName,
        stateName: t.to,
        transitionEvent: t.event,
        fromState: t.from,
        toState: t.to,
        patterns: entry.patterns,
        eventSources: entry.eventSources,
        stateRole: detectStateRole(t.to, entry.states, entry.allTransitions),
        effectTypes: t.effects ? extractEffectTypes(t.effects) : [],
        guard: t.guard,
        entityName: entityInfo.name,
        _fullSchema: schema,
        _mockData: mockData,
      },
    });
  }

  // Create edges: connect from event-source handles to target nodes
  for (const entry of uiTransitions) {
    const t = entry.transition;
    const sourceKey = `${entry.traitName}:${t.from}`;
    const targetKey = `${entry.traitName}:${t.to}`;
    const sourceNodeId = nodeIdMap.get(sourceKey);
    const targetNodeId = nodeIdMap.get(targetKey);

    if (!sourceNodeId || !targetNodeId) continue;
    if (sourceNodeId === targetNodeId) continue;

    const backward = isBackwardTransition(t.from, t.to, entry.states);

    // Find the trigger element in the SOURCE node's patterns
    const sourceEntry = stateNodeMap.get(sourceKey);
    const triggerSource = sourceEntry?.eventSources.find(s => s.event === t.event);

    edges.push({
      id: `ef-${entry.traitName}-${t.event}-${t.from}-${t.to}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle: triggerSource ? `event-${t.event}` : undefined,
      type: 'eventFlow',
      data: {
        event: t.event,
        fromState: t.from,
        toState: t.to,
        isBackward: backward,
        triggerPatternType: triggerSource?.patternType,
        triggerLabel: triggerSource?.label,
      },
    });
  }

  return { nodes, edges };
}
