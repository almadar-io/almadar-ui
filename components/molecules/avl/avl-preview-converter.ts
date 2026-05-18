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
// Emit/listen matching — shared by overview (cross-orbital) and trait-graph
// (intra-orbital). `scope` decides whether emitter and listener must be in
// the SAME orbital or in DIFFERENT orbitals.
// ---------------------------------------------------------------------------

interface TraitWire {
  emitterOrbital: string;
  listenerOrbital: string;
  event: string;
  emitterTrait: string;
  listenerTrait: string;
}

function extractTraitWires(
  orbitals: OrbitalDefinition[],
  scope: 'intra-orbital' | 'cross-orbital',
): TraitWire[] {
  const wires: TraitWire[] = [];
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

  // Dedupe by (emitter-key, listener-key, event). Cross-orbital wires key
  // on orbital pairs (one edge per orbital-orbital-event triple). Intra-
  // orbital wires key on trait pairs (one edge per trait-trait-event
  // triple) since multiple traits inside the same orbital may emit/listen
  // the same event independently.
  const seen = new Set<string>();
  for (const em of emitters) {
    for (const li of listeners) {
      if (em.event !== li.event) continue;
      if (scope === 'cross-orbital' && em.orbital === li.orbital) continue;
      if (scope === 'intra-orbital' && em.orbital !== li.orbital) continue;
      if (scope === 'intra-orbital' && em.trait === li.trait) continue;
      const key = scope === 'cross-orbital'
        ? `${em.orbital}␟${li.orbital}␟${em.event}`
        : `${em.orbital}␟${em.trait}␟${li.trait}␟${em.event}`;
      if (seen.has(key)) continue;
      seen.add(key);
      wires.push({
        emitterOrbital: em.orbital,
        listenerOrbital: li.orbital,
        event: em.event,
        emitterTrait: em.trait,
        listenerTrait: li.trait,
      });
    }
  }

  return wires;
}

// Back-compat alias: the overview path always wanted cross-orbital wires.
function findCrossLinks(orbitals: OrbitalDefinition[]): TraitWire[] {
  return extractTraitWires(orbitals, 'cross-orbital');
}

// ---------------------------------------------------------------------------
// Level 1: Overview graph (one node per orbital)
// ---------------------------------------------------------------------------

/**
 * Build a React Flow graph for the overview level.
 * Each orbital gets one node showing its INIT transition's UI.
 */
export function schemaToOverviewGraph(
  schema: OrbitalSchema,
  mockData?: Record<string, unknown[]>,
  behaviorMeta?: Record<string, { layer: string }>,
  layoutHint?: 'pipeline' | 'grid',
  orbitalStatus?: Record<string, PreviewNodeData['status']>,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbitals = getOrbitals(schema);
  const nodes: Node<PreviewNodeData>[] = [];
  const edges: Edge<EventEdgeData>[] = [];

  const count = orbitals.length;
  const cols = layoutHint === 'pipeline' ? count : Math.ceil(Math.sqrt(count));

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

    // Enrich event sources with typed payload fields from state machine events
    for (const source of eventSources) {
      for (const trait of traits) {
        const sm = getStateMachine(trait);
        if (!sm) continue;
        const smEvents = (trait.stateMachine?.events ?? []) as unknown as Array<Record<string, unknown>>;
        const matchingEvent = smEvents.find(ev => ev.key === source.event);
        if (matchingEvent?.payload && Array.isArray(matchingEvent.payload)) {
          source.payloadFields = (matchingEvent.payload as Array<Record<string, unknown>>).map(p => ({
            name: String(p.name ?? ''),
            type: String(p.type ?? 'string'),
            ...(p.required ? { required: true as const } : {}),
          }));
          break;
        }
      }
    }

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
        layer: behaviorMeta?.[orb.name]?.layer,
        stateRole: 'initial',
        entityName: entityInfo.name,
        persistence: entityInfo.persistence,
        fieldCount: entityInfo.fieldCount,
        traitCount: traits.length,
        pageRoutes,
        status: orbitalStatus?.[orb.name] ?? 'idle',
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

/** Internal: a transition + its trait context, ready for node assembly. */
interface UITransitionEntry {
  trait: Trait;
  traitName: string;
  transition: Transition;
  patterns: RenderUIEntry[];
  eventSources: PatternEventSource[];
  states: State[];
  allTransitions: Transition[];
}

/**
 * Walk an orbital's traits and collect every transition that has at least
 * one `render-ui` effect. Used by `orbitalToExpandedGraph` (L2 view, all
 * traits) and `orbitalAliasToExpandedGraph` (L3 view, single alias bucket
 * filtered by `sourceBehavior.alias`).
 */
function collectUITransitions(
  orbital: OrbitalDefinition,
  filter: (trait: Trait) => boolean,
): UITransitionEntry[] {
  const out: UITransitionEntry[] = [];
  for (const trait of getTraits(orbital)) {
    if (!filter(trait)) continue;
    const sm = getStateMachine(trait);
    if (!sm) continue;
    for (const t of sm.transitions) {
      if (!t.effects) continue;
      const patterns = extractRenderUI(t.effects);
      if (patterns.length === 0) continue;
      out.push({
        trait,
        traitName: trait.name,
        transition: t,
        patterns,
        eventSources: collectEventSources(patterns),
        states: sm.states,
        allTransitions: sm.transitions,
      });
    }
  }
  return out;
}

/**
 * Shared assembler: given pre-collected UI transitions + a list of grouped
 * imported-behavior cards, build the React Flow nodes + edges. Factored
 * out so L2 (`orbitalToExpandedGraph`) and L3
 * (`orbitalAliasToExpandedGraph`) don't copy-paste the dedup + positioning
 * + edge-building logic.
 *
 * `transitions` populate the per-transition cards.
 * `groupedBehaviors` populate the one-per-alias collapsed cards (L2 only;
 * L3 passes an empty array since it's already scoped to a single alias).
 */
function buildScreenGraph(
  schema: OrbitalSchema,
  orbitalName: string,
  entityName: string,
  transitions: UITransitionEntry[],
  groupedBehaviors: Array<{
    alias: string;
    behaviorName: string;
    representative: UITransitionEntry;
    transitionCount: number;
  }>,
  mockData?: Record<string, unknown[]>,
): { nodes: Node<PreviewNodeData>[]; edges: Edge<EventEdgeData>[] } {
  const nodes: Node<PreviewNodeData>[] = [];
  const edges: Edge<EventEdgeData>[] = [];

  // Edge-resolution helper: pick the most-informative transition per
  // (trait, to-state) so edges have a single canonical anchor per state.
  // We DON'T dedup the cards themselves — every render-ui-bearing
  // transition becomes a card so users see the loading/loaded/failed
  // frames of a single state (e.g. OrderRecordBrowse:browsing has
  // INIT/LOADED/LOAD_FAILED, all → browsing — three distinct screens).
  // Pre-fix, dedup-by-to-state collapsed those into a single card
  // (usually the spinner), silently hiding the dashboard view. Cosmic
  // L3 shows every transition arc inside the trait state-machine SVG;
  // canvas L2 now matches by showing every transition as its own card.
  const stateRepresentativeMap = new Map<string, UITransitionEntry>();
  for (const entry of transitions) {
    const key = `${entry.traitName}:${entry.transition.to}`;
    const existing = stateRepresentativeMap.get(key);
    if (!existing || entry.patterns.length > existing.patterns.length) {
      stateRepresentativeMap.set(key, entry);
    }
  }

  const transitionEntries = transitions;
  const totalCards = transitionEntries.length + groupedBehaviors.length;
  if (totalCards === 0) return { nodes, edges };

  const cols = Math.min(totalCards, 3);
  const nodeIdMap = new Map<string, string>();

  // Per-transition cards
  transitionEntries.forEach((entry, i) => {
    const t = entry.transition;
    const nodeId = `${orbitalName}-${entry.traitName}-${t.event}-${t.from}-${t.to}`;
    const stateKey = `${entry.traitName}:${t.to}`;
    // Only the representative card for each (trait, to-state) anchors
    // incoming edges. The other cards for the same state still render —
    // they just don't sit on the trait's transition graph as edge
    // targets, since edges are state-keyed.
    if (stateRepresentativeMap.get(stateKey) === entry) {
      nodeIdMap.set(stateKey, nodeId);
    }
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
        entityName,
        _fullSchema: schema,
        _mockData: mockData,
      },
    });
  });

  // Grouped imported-behavior cards (one per alias)
  groupedBehaviors.forEach((group, i) => {
    const t = group.representative.transition;
    const nodeId = `${orbitalName}-behavior-${group.alias}`;
    const idx = transitionEntries.length + i;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    nodes.push({
      id: nodeId,
      type: 'preview',
      position: { x: col * EXPANDED_SPACING_X, y: row * EXPANDED_SPACING_Y },
      data: {
        orbitalName,
        traitName: group.representative.traitName,
        stateName: t.to,
        transitionEvent: t.event,
        fromState: t.from,
        toState: t.to,
        patterns: group.representative.patterns,
        eventSources: group.representative.eventSources,
        stateRole: detectStateRole(
          t.to,
          group.representative.states,
          group.representative.allTransitions,
        ),
        effectTypes: t.effects ? extractEffectTypes(t.effects) : [],
        guard: t.guard,
        entityName,
        _fullSchema: schema,
        _mockData: mockData,
        behaviorAlias: group.alias,
        behaviorName: group.behaviorName,
        transitionCount: group.transitionCount,
      },
    });
  });

  // Edges between organism-owned transition cards (imported aliases get
  // their own intra-bucket edges at L3, not at L2)
  for (const entry of transitions) {
    const t = entry.transition;
    const sourceKey = `${entry.traitName}:${t.from}`;
    const targetKey = `${entry.traitName}:${t.to}`;
    const sourceNodeId = nodeIdMap.get(sourceKey);
    const targetNodeId = nodeIdMap.get(targetKey);
    if (!sourceNodeId || !targetNodeId) continue;
    if (sourceNodeId === targetNodeId) continue;
    const backward = isBackwardTransition(t.from, t.to, entry.states);
    const sourceEntry = stateRepresentativeMap.get(sourceKey);
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

/**
 * Build a React Flow graph for the L2 (expanded) level.
 *
 * Organism-authored traits (no `sourceBehavior` metadata) emit one
 * transition card per render-ui-bearing transition (the historical
 * behavior). Imported traits (cloned by the inline phase from `uses[]`)
 * collapse into one grouped card per `sourceBehavior.alias`, so the user
 * sees `Stats`, `Graphs`, `Layout`, etc. as single cards rather than 9
 * anonymous `INIT` peers (STUDIO-1). Drill into a grouped card to reach
 * L3 (`orbitalAliasToExpandedGraph`).
 */
export function orbitalToExpandedGraph(
  schema: OrbitalSchema,
  orbitalName: string,
  mockData?: Record<string, unknown[]>,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbital = getOrbitals(schema).find(o => o.name === orbitalName);
  if (!orbital) return { nodes: [], edges: [] };

  const entityInfo = getEntityInfo(orbital);

  // Organism-authored = no sourceBehavior metadata
  const organismTransitions = collectUITransitions(
    orbital,
    (trait) => trait.sourceBehavior === undefined,
  );

  // Bucket imported transitions by alias; pick the first render-ui-bearing
  // transition per alias as the visual representative.
  const aliasBuckets = new Map<
    string,
    { behaviorName: string; transitions: UITransitionEntry[] }
  >();
  const importedTransitions = collectUITransitions(
    orbital,
    (trait) => trait.sourceBehavior !== undefined,
  );
  for (const entry of importedTransitions) {
    const sb = entry.trait.sourceBehavior;
    if (!sb) continue;
    const bucket = aliasBuckets.get(sb.alias);
    if (bucket) {
      bucket.transitions.push(entry);
    } else {
      aliasBuckets.set(sb.alias, {
        behaviorName: sb.behavior,
        transitions: [entry],
      });
    }
  }

  const groupedBehaviors = Array.from(aliasBuckets.entries()).map(
    ([alias, bucket]) => ({
      alias,
      behaviorName: bucket.behaviorName,
      representative: bucket.transitions[0],
      transitionCount: bucket.transitions.length,
    }),
  );

  return buildScreenGraph(
    schema,
    orbitalName,
    entityInfo.name,
    organismTransitions,
    groupedBehaviors,
    mockData,
  );
}

/**
 * Build a React Flow graph for the L3 (`behavior-expanded`) level: drill
 * into one imported-behavior alias on an orbital and show ITS render-ui
 * transitions as individual cards. Same converter logic as
 * `orbitalToExpandedGraph` but scoped to traits where
 * `sourceBehavior.alias === alias`. STUDIO-1.
 */
export function orbitalAliasToExpandedGraph(
  schema: OrbitalSchema,
  orbitalName: string,
  alias: string,
  mockData?: Record<string, unknown[]>,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbital = getOrbitals(schema).find(o => o.name === orbitalName);
  if (!orbital) return { nodes: [], edges: [] };

  const entityInfo = getEntityInfo(orbital);
  const transitions = collectUITransitions(
    orbital,
    (trait) => trait.sourceBehavior?.alias === alias,
  );

  return buildScreenGraph(
    schema,
    orbitalName,
    entityInfo.name,
    transitions,
    [],
    mockData,
  );
}

// ---------------------------------------------------------------------------
// Trait-expanded graph: one card per trait of one orbital
// ---------------------------------------------------------------------------

const TRAIT_CARD_SPACING_X = 480;
const TRAIT_CARD_SPACING_Y = 380;

/**
 * Build a React Flow graph for the `trait-expanded` level: one node per
 * trait of `orbitalName`, with intra-orbital `emits → listens` edges
 * between trait cards (an emit on trait A connects to a listen for the
 * same event on trait B in the same orbital).
 *
 * Used by the cosmic tab at L3 (after the user drills into an orbital
 * from the L1 grid). The canvas tab does not call this today; the new
 * level is opt-in via `initialLevel="trait-expanded"`.
 *
 * Layout: grid (`ceil(sqrt(N))` cols). Nodes are `type: 'traitCard'`
 * with `data.kind === 'trait-card'` so `FlowCanvas`'s NODE_TYPES routes
 * them to `TraitCardNode`.
 */
export function orbitalToTraitGraph(
  schema: OrbitalSchema,
  orbitalName: string,
  // mockData is reserved for parity with the other converters — the trait
  // card currently doesn't render mock rows but accepting the same prop
  // keeps consumer call sites uniform.
  _mockData?: Record<string, unknown[]>,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbital = getOrbitals(schema).find(o => o.name === orbitalName);
  if (!orbital) return { nodes: [], edges: [] };

  const traits = getTraits(orbital);
  const nodes: Node<PreviewNodeData>[] = [];

  const count = traits.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));

  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i];
    const sm = getStateMachine(trait);
    const transitions = (sm?.transitions ?? []).map(t => ({
      event: t.event,
      fromState: Array.isArray(t.from) ? t.from.join('|') : t.from,
      toState: t.to,
    }));
    const emits = getEmits(trait);
    const listens = getListens(trait);
    const linkedEntity = trait.linkedEntity ?? '';

    const row = Math.floor(i / cols);
    const col = i % cols;

    nodes.push({
      id: `trait-${orbitalName}-${trait.name}`,
      type: 'traitCard',
      position: {
        x: col * TRAIT_CARD_SPACING_X,
        y: row * TRAIT_CARD_SPACING_Y,
      },
      data: {
        kind: 'trait-card',
        orbitalName,
        traitName: trait.name,
        linkedEntity,
        transitions,
        emits,
        listens,
        // `_fullSchema` carries the parsed schema to `TraitCardNode` so it
        // can run `parseTraitLevel(...)` and render the ELK-laid-out
        // state-machine flow chart inside the card. Mirrors the same
        // convention `OrbPreviewNode` uses for its embedded UI preview.
        _fullSchema: schema,
        // Required fields on PreviewNodeData — keep empty for trait cards.
        patterns: [],
        eventSources: [],
      },
    });
  }

  // Intra-orbital edges: emitter trait → listener trait, one edge per
  // (emitTrait, listenTrait, event) triple. Scoped to `orbitalName` only.
  const wires = extractTraitWires([orbital], 'intra-orbital');
  const edges: Edge<EventEdgeData>[] = wires.map(w => ({
    id: `wire-${orbitalName}-${w.emitterTrait}-${w.listenerTrait}-${w.event}`,
    source: `trait-${orbitalName}-${w.emitterTrait}`,
    target: `trait-${orbitalName}-${w.listenerTrait}`,
    sourceHandle: `emit-${w.event}`,
    targetHandle: `listen-${w.event}`,
    type: 'eventFlow',
    data: {
      event: w.event,
      isCrossOrbital: false,
      fromTrait: w.emitterTrait,
      toTrait: w.listenerTrait,
    },
  }));

  return { nodes, edges };
}
