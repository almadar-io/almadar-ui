/**
 * AVL Preview Converter
 *
 * Extracts render-ui pattern configs from OrbitalSchema transitions
 * and builds the FlowCanvas graph: one card per orbital (all of them, or
 * only the focused one), each showing the live orbital or a state picked
 * from its dropdown (`stateOptionsOf`).
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
  Entity,
  EntityCall,
  EntityData,
  JsonObject,
} from '@almadar/core';
import { renderUiEntriesOf, type AnyPatternConfig } from '@almadar/core/patterns';
import type {
  PreviewNodeData,
  EventEdgeData,
  RenderUIEntry,
  PatternEventSource,
  ScreenSize,
} from '../types/avl-preview-types';
import { SCREEN_SIZE_PRESETS } from '../types/avl-preview-types';
import { collectEmbeddedTraits } from '../../../lib/embedded-traits';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Card-to-card gap between preview nodes, on top of the preset width/height.
// Wide enough that cards read as separate units; not so wide that the L1
// grid sprawls past one viewport.
const OVERVIEW_GAP_X = 160;
const OVERVIEW_GAP_Y = 240;

// Card chrome (header bar + name strip + footer) on top of the device preset's
// `minHeight`. Keeps Y spacing honest even when the preset reports a short
// preview height.
const CARD_CHROME_Y = 120;

/**
 * Compute non-overlapping grid spacing for a given screen-size preset.
 * Each cell = preset.width × (preset.minHeight + chrome) + gap on both axes,
 * so cards at any preset (mobile → wide) get the same visual breathing room.
 *
 * `screenSize` is optional and defaults to `'wide'` — the widest preset —
 * so legacy callers that don't pass it are guaranteed not to overlap.
 */
function computeSpacing(screenSize: ScreenSize = 'wide'): { x: number; y: number } {
  const preset = SCREEN_SIZE_PRESETS[screenSize];
  return {
    x: preset.width + OVERVIEW_GAP_X,
    y: preset.minHeight + CARD_CHROME_Y + OVERVIEW_GAP_Y,
  };
}

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
    if (typeof t === 'object' && t !== null && 'ref' in t) return { name: (t as { ref: string }).ref } as Trait;
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
  const e = entity as Entity | EntityCall;
  const fields = e.fields ?? [];
  return {
    name: e.name ?? orbital.name,
    persistence: e.persistence ?? 'runtime',
    fieldCount: fields.length,
  };
}

function getPages(orbital: OrbitalDefinition): string[] {
  if (!orbital.pages) return [];
  return orbital.pages.map(p => {
    if (typeof p === 'string') return `/${p.toLowerCase()}`;
    if ('ref' in p) return p.path ?? `/${p.ref}`.toLowerCase();
    return p.path ?? `/${p.name}`.toLowerCase();
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

/** Every render-ui a transition performs (nested ones included), as preview entries. */
function extractRenderUI(effects: Effect[]): RenderUIEntry[] {
  return renderUiEntriesOf(effects).map(({ slot, pattern }) => ({ slot, pattern: pattern as AnyPatternConfig }));
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
  config: JsonObject,
  path = 'root',
  depth = 0,
  totalSiblings = 1,
  siblingIndex = 0,
): PatternEventSource[] {
  const sources: PatternEventSource[] = [];
  if (depth > 10) return sources; // Prevent infinite recursion

  const patternType = typeof config.type === 'string' ? config.type : undefined;
  const event = typeof config.event === 'string' ? config.event : undefined;

  // Check if this element fires an event
  if (patternType && event) {
    // Compute a vertical position hint based on the element's depth and index
    // This helps position the source handle near the trigger element
    const positionHint = totalSiblings > 1
      ? (siblingIndex + 0.5) / totalSiblings
      : 0.5 + (depth * 0.1);

    sources.push({
      event,
      patternType,
      label: typeof config.label === 'string' ? config.label : typeof config.content === 'string' ? config.content : typeof config.text === 'string' ? config.text : undefined,
      path,
      positionHint: Math.min(Math.max(positionHint, 0.1), 0.9),
    });
  }

  // Recurse into children
  const children = config.children;
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
        sources.push(
          ...findEventSources(child as JsonObject, `${path}.children.${i}`, depth + 1, children.length, i),
        );
      }
    }
  }

  // Recurse into named props that might be pattern configs (e.g., flip-card front/back)
  for (const [key, value] of Object.entries(config)) {
    if (key === 'children' || key === 'type' || key === 'event') continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && 'type' in value) {
      sources.push(
        ...findEventSources(value as JsonObject, `${path}.${key}`, depth + 1, totalSiblings, siblingIndex),
      );
    }
  }

  return sources;
}

/** Collect all event sources across all patterns in a node. */
function collectEventSources(patterns: RenderUIEntry[]): PatternEventSource[] {
  const allSources: PatternEventSource[] = [];
  for (const entry of patterns) {
    allSources.push(...findEventSources(entry.pattern as JsonObject));
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
): 'initial' | 'terminal' | 'hub' | 'default' {
  const stateInfo = states.find(s => s.name === stateName);
  if (stateInfo?.isInitial) return 'initial';
  if (stateInfo?.isTerminal || stateInfo?.isFinal) return 'terminal';

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
  mockData?: EntityData,
  behaviorMeta?: Record<string, { layer: string }>,
  layoutHint?: 'pipeline' | 'grid',
  orbitalStatus?: Record<string, PreviewNodeData['status']>,
  screenSize?: ScreenSize,
): {
  nodes: Node<PreviewNodeData>[];
  edges: Edge<EventEdgeData>[];
} {
  const orbitals = getOrbitals(schema);
  const nodes: Node<PreviewNodeData>[] = [];
  const edges: Edge<EventEdgeData>[] = [];

  const count = orbitals.length;
  const cols = layoutHint === 'pipeline' ? count : Math.ceil(Math.sqrt(count));
  const spacing = computeSpacing(screenSize);

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
        const smEvents = trait.stateMachine?.events ?? [];
        const matchingEvent = smEvents.find(ev => ev.key === source.event);
        if (matchingEvent?.payloadSchema && Array.isArray(matchingEvent.payloadSchema)) {
          source.payloadFields = matchingEvent.payloadSchema.map(p => ({
            name: p.name ?? '',
            type: p.type ?? 'string',
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
      position: { x: col * spacing.x, y: row * spacing.y },
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
// Card states: the options of a card's state dropdown
// ---------------------------------------------------------------------------

/** Internal: a transition + its trait context, ready for card data. */
interface UITransitionEntry {
  trait: Trait;
  traitName: string;
  transition: Transition;
  patterns: RenderUIEntry[];
  eventSources: PatternEventSource[];
  states: State[];
  allTransitions: Transition[];
}

/** Every transition of the orbital's matching traits that has at least one `render-ui` effect. */
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

/** How a card's states are listed: one per render-ui transition, or one per distinct render (designer). */
export type CanvasStateView = 'transitions' | 'screens';

/** The state-dropdown entry that shows the whole orbital running from its initial state. */
export const LIVE_STATE = 'live';

export interface CanvasStateOption {
  id: string;
  label: string;
  hint: string;
  data: PreviewNodeData;
}

export interface CanvasStateGroup {
  alias: string;
  behaviorName: string;
  options: CanvasStateOption[];
}

export interface CanvasStateOptions {
  own: CanvasStateOption[];
  groups: CanvasStateGroup[];
}

interface ScreenEntry {
  entry: UITransitionEntry;
  enteredBy: string[];
}

/**
 * Collapse a trait's transitions whose rendered output is identical into one
 * screen, keeping declaration order and recording every event that shows it.
 * Different renders of the same state (spinner / list / error) stay apart.
 */
function collapseToScreens(transitions: UITransitionEntry[]): ScreenEntry[] {
  const screens: ScreenEntry[] = [];
  const byRender = new Map<string, ScreenEntry>();
  for (const entry of transitions) {
    const key = `${entry.traitName}|${JSON.stringify(entry.patterns)}`;
    const screen = byRender.get(key);
    if (screen) {
      screen.enteredBy.push(entry.transition.event);
      continue;
    }
    const fresh = { entry, enteredBy: [entry.transition.event] };
    byRender.set(key, fresh);
    screens.push(fresh);
  }
  return screens;
}

function stateOptionsFor(
  schema: OrbitalSchema,
  orbitalName: string,
  entityName: string,
  transitions: UITransitionEntry[],
  view: CanvasStateView,
  mockData?: EntityData,
): CanvasStateOption[] {
  const screens: ScreenEntry[] = view === 'screens'
    ? collapseToScreens(transitions)
    : transitions.map((entry) => ({ entry, enteredBy: [entry.transition.event] }));
  // A list spanning several traits names each entry's trait; within one trait a
  // state shown by several distinct renders is told apart by its event.
  const manyTraits = new Set(screens.map((s) => s.entry.traitName)).size > 1;
  const stateUses = new Map<string, number>();
  for (const s of screens) {
    const key = `${s.entry.traitName}|${s.entry.transition.to}`;
    stateUses.set(key, (stateUses.get(key) ?? 0) + 1);
  }
  return screens.map(({ entry, enteredBy }) => {
    const t = entry.transition;
    const from = String(t.from);
    const state = view === 'screens'
      ? ((stateUses.get(`${entry.traitName}|${t.to}`) ?? 0) > 1 ? `${t.to} · ${t.event}` : t.to)
      : `${t.event}: ${from} → ${t.to}`;
    const label = manyTraits ? `${entry.traitName} · ${state}` : state;
    return {
      id: `${entry.traitName}:${t.event}:${from}:${t.to}`,
      label,
      hint: view === 'screens' ? enteredBy.join(' · ') : entry.traitName,
      data: {
        orbitalName,
        traitName: entry.traitName,
        stateName: t.to,
        transitionEvent: t.event,
        fromState: from,
        toState: t.to,
        patterns: entry.patterns,
        eventSources: entry.eventSources,
        stateRole: detectStateRole(t.to, entry.states, entry.allTransitions),
        effectTypes: t.effects ? extractEffectTypes(t.effects) : [],
        guard: t.guard,
        entityName,
        _fullSchema: schema,
        _mockData: mockData,
        ...(view === 'screens' ? { cardLabel: 'screen' as const, enteredBy } : {}),
      },
    };
  });
}

/**
 * The states a card can show: the orbital's own render-ui transitions, plus
 * one group per imported behavior (`sourceBehavior.alias`). A trait embedded
 * in another trait's render (`@trait.X`) draws inside that screen, so it is
 * not a state of its own.
 */
export function stateOptionsOf(
  schema: OrbitalSchema,
  orbitalName: string,
  view: CanvasStateView,
  mockData?: EntityData,
): CanvasStateOptions {
  const orbital = getOrbitals(schema).find(o => o.name === orbitalName);
  if (!orbital) return { own: [], groups: [] };
  const entityName = getEntityInfo(orbital).name;
  const embedded = collectEmbeddedTraits({ ...schema, orbitals: [orbital] });
  const own = stateOptionsFor(
    schema, orbitalName, entityName,
    collectUITransitions(orbital, (trait) => trait.sourceBehavior === undefined && !embedded.has(trait.name)),
    view, mockData,
  );
  const aliases = new Map<string, string>();
  for (const trait of getTraits(orbital)) {
    if (embedded.has(trait.name)) continue;
    if (trait.sourceBehavior && !aliases.has(trait.sourceBehavior.alias)) {
      aliases.set(trait.sourceBehavior.alias, trait.sourceBehavior.behavior);
    }
  }
  const groups = [...aliases].flatMap(([alias, behaviorName]) => {
    const options = stateOptionsFor(
      schema, orbitalName, entityName,
      collectUITransitions(orbital, (trait) => trait.sourceBehavior?.alias === alias && !embedded.has(trait.name)),
      view, mockData,
    );
    return options.length > 0 ? [{ alias, behaviorName, options }] : [];
  });
  return { own, groups };
}

/** The state a card opens on: its INIT render, else its first state, else the live orbital. */
export function initialStateOf(options: CanvasStateOptions): string {
  const isInit = (o: CanvasStateOption) => o.data.transitionEvent === 'INIT' || (o.data.enteredBy ?? []).includes('INIT');
  const groupOptions = options.groups.flatMap((g) => g.options);
  const pick = options.own.find(isInit) ?? options.own[0] ?? groupOptions.find(isInit) ?? groupOptions[0];
  return pick?.id ?? LIVE_STATE;
}

export interface CanvasViewOptions {
  /** `local`: the focused orbital's card only; `world`: every orbital's card. */
  scope: 'local' | 'world';
  focusedOrbital?: string;
  /** Each card's dropdown choice (a `CanvasStateOption.id`); its `initialStateOf` when absent or gone. */
  stateByOrbital?: Record<string, string>;
  view: CanvasStateView;
  mockData?: EntityData;
  behaviorMeta?: Record<string, { layer: string }>;
  layoutHint?: 'pipeline' | 'grid';
  orbitalStatus?: Record<string, PreviewNodeData['status']>;
  screenSize?: ScreenSize;
}

/** The canvas's cards and edges for a scope, each card showing its chosen state. */
export function canvasViewGraph(
  schema: OrbitalSchema,
  opts: CanvasViewOptions,
): { nodes: Node<PreviewNodeData>[]; edges: Edge<EventEdgeData>[]; focusedOrbital: string | undefined } {
  const overview = schemaToOverviewGraph(schema, opts.mockData, opts.behaviorMeta, opts.layoutHint, opts.orbitalStatus, opts.screenSize);
  const ids = overview.nodes.map((n) => n.id);
  const focusedOrbital = opts.focusedOrbital !== undefined && ids.includes(opts.focusedOrbital)
    ? opts.focusedOrbital
    : ids[0];
  const withState = overview.nodes.map((node): Node<PreviewNodeData> => {
    const options = stateOptionsOf(schema, node.id, opts.view, opts.mockData);
    const all = [...options.own, ...options.groups.flatMap((g) => g.options)];
    const asked = opts.stateByOrbital?.[node.id];
    const chosen = asked === LIVE_STATE || all.some((o) => o.id === asked) ? asked : initialStateOf(options);
    const picked = all.find((o) => o.id === chosen);
    const data = picked ? { ...node.data, ...picked.data } : node.data;
    return { ...node, data: { ...data, focused: opts.scope === 'world' && node.id === focusedOrbital } };
  });
  if (opts.scope === 'local') {
    return { nodes: withState.filter((n) => n.id === focusedOrbital), edges: [], focusedOrbital };
  }
  const byId = new Map(withState.map((n) => [n.id, n]));
  const edges = overview.edges.map((edge) => {
    const event = edge.data?.event;
    const renders = event !== undefined && byId.get(edge.source)?.data.eventSources.some((s) => s.event === event);
    return renders ? edge : { ...edge, sourceHandle: undefined };
  });
  return { nodes: withState, edges, focusedOrbital };
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
  _mockData?: EntityData,
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
