/**
 * AVL Schema Parser
 *
 * Pure functions that transform an OrbitalSchema into structured data
 * for each zoom level of the Cosmic Zoom visualization.
 *
 * Imports all types from @almadar/core.
 *
 * @packageDocumentation
 */

import type {
  OrbitalSchema,
  OrbitalDefinition,
} from '@almadar/core';

// ---------------------------------------------------------------------------
// Output types (view-model for each zoom level)
// ---------------------------------------------------------------------------

export interface ApplicationOrbitalData {
  name: string;
  entityName: string;
  fieldCount: number;
  persistence: string;
  traitNames: string[];
  pageNames: string[];
  position: { x: number; y: number };
}

export interface CrossLink {
  emitterOrbital: string;
  listenerOrbital: string;
  eventName: string;
  emitterTrait: string;
  listenerTrait: string;
}

export interface ApplicationLevelData {
  orbitals: ApplicationOrbitalData[];
  crossLinks: CrossLink[];
}

export interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  hasDefault: boolean;
}

export interface OrbitalTraitInfo {
  name: string;
  stateCount: number;
  eventCount: number;
  transitionCount: number;
  emits: string[];
  listens: string[];
}

export interface OrbitalPageInfo {
  name: string;
  route: string;
}

export interface ExternalLink {
  targetOrbital: string;
  eventName: string;
  direction: 'out' | 'in';
  traitName: string;
}

export interface OrbitalLevelData {
  name: string;
  entity: {
    name: string;
    fields: FieldInfo[];
    persistence: string;
  };
  traits: OrbitalTraitInfo[];
  pages: OrbitalPageInfo[];
  externalLinks: ExternalLink[];
}

export interface TraitStateInfo {
  name: string;
  isInitial?: boolean;
  isTerminal?: boolean;
}

export interface TraitTransitionInfo {
  from: string;
  to: string;
  event: string;
  guard?: unknown;
  effects: Array<{ type: string; args: unknown[] }>;
  index: number;
}

export interface TraitLevelData {
  name: string;
  linkedEntity: string;
  states: TraitStateInfo[];
  transitions: TraitTransitionInfo[];
  emittedEvents: string[];
  listenedEvents: string[];
}

export interface ExprTreeNode {
  label: string;
  type: 'operator' | 'literal' | 'binding';
  children?: ExprTreeNode[];
}

export interface SlotTarget {
  name: string;
  pattern: string;
}

export interface TransitionLevelData {
  from: string;
  to: string;
  event: string;
  guard: ExprTreeNode | null;
  effects: ExprTreeNode[];
  slotTargets: SlotTarget[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEntity(orbital: OrbitalDefinition): { name: string; fields: Array<Record<string, unknown>>; persistence: string } {
  const entity = orbital.entity;
  if (typeof entity === 'string') {
    return { name: entity, fields: [], persistence: 'runtime' };
  }
  const e = entity as Record<string, unknown>;
  return {
    name: (e.name as string) ?? orbital.name,
    fields: (e.fields as Array<Record<string, unknown>>) ?? [],
    persistence: (e.persistence as string) ?? 'runtime',
  };
}

function getTraits(orbital: OrbitalDefinition): Array<Record<string, unknown>> {
  if (!orbital.traits) return [];
  return orbital.traits.map(t => {
    if (typeof t === 'string') return { name: t };
    return t as Record<string, unknown>;
  });
}

function getPages(orbital: OrbitalDefinition): Array<Record<string, unknown>> {
  if (!orbital.pages) return [];
  return orbital.pages.map(p => {
    if (typeof p === 'string') return { name: p, path: `/${p.toLowerCase()}` };
    return p as Record<string, unknown>;
  });
}

function getStateMachine(trait: Record<string, unknown>): Record<string, unknown> | null {
  return (trait.stateMachine as Record<string, unknown>) ?? null;
}

function getStates(sm: Record<string, unknown>): Array<Record<string, unknown>> {
  return (sm.states as Array<Record<string, unknown>>) ?? [];
}

function getTransitions(sm: Record<string, unknown>): Array<Record<string, unknown>> {
  return (sm.transitions as Array<Record<string, unknown>>) ?? [];
}

function getEvents(sm: Record<string, unknown>): Array<Record<string, unknown>> {
  return (sm.events as Array<Record<string, unknown>>) ?? [];
}

function getEmits(trait: Record<string, unknown>): string[] {
  const emits = trait.emits as Array<Record<string, unknown> | string> | undefined;
  if (!emits) return [];
  return emits.map(e => typeof e === 'string' ? e : (e.event as string) ?? (e.name as string) ?? '');
}

function getListens(trait: Record<string, unknown>): string[] {
  const listens = trait.listens as Array<Record<string, unknown> | string> | undefined;
  if (!listens) return [];
  return listens.map(l => typeof l === 'string' ? l : (l.event as string) ?? '');
}

function parseEffectType(effect: unknown): { type: string; args: unknown[] } {
  if (Array.isArray(effect)) {
    const [type, ...args] = effect;
    return { type: String(type), args };
  }
  return { type: 'unknown', args: [] };
}

function exprToTree(expr: unknown): ExprTreeNode {
  if (Array.isArray(expr)) {
    const [op, ...args] = expr;
    return {
      label: String(op),
      type: 'operator',
      children: args.map(a => exprToTree(a)),
    };
  }
  if (typeof expr === 'string') {
    if (expr.startsWith('@')) {
      return { label: expr, type: 'binding' };
    }
    return { label: expr, type: 'literal' };
  }
  return { label: String(expr), type: 'literal' };
}

// ---------------------------------------------------------------------------
// Level parsers
// ---------------------------------------------------------------------------

/**
 * Parse the application-level view: all orbitals with cross-orbital links.
 */
export function parseApplicationLevel(schema: OrbitalSchema): ApplicationLevelData {
  const orbitals: ApplicationOrbitalData[] = [];
  const crossLinks: CrossLink[] = [];

  // Position orbitals in a centered grid within 600x400 viewBox
  const count = schema.orbitals.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const spacing = 200;
  const gridW = cols * spacing;
  const gridH = rows * spacing;
  const originX = (600 - gridW) / 2 + spacing / 2;
  const originY = (400 - gridH) / 2 + spacing / 2;

  schema.orbitals.forEach((orbital, i) => {
    const entity = getEntity(orbital);
    const traits = getTraits(orbital);
    const pages = getPages(orbital);

    orbitals.push({
      name: orbital.name,
      entityName: entity.name,
      fieldCount: entity.fields.length,
      persistence: entity.persistence,
      traitNames: traits.map(t => (t.name as string) ?? ''),
      pageNames: pages.map(p => (p.name as string) ?? ''),
      position: {
        x: originX + (i % cols) * spacing,
        y: originY + Math.floor(i / cols) * spacing,
      },
    });
  });

  // Compute cross-orbital links by matching emits to listens
  const emitMap: Array<{ orbital: string; trait: string; event: string }> = [];
  const listenMap: Array<{ orbital: string; trait: string; event: string }> = [];

  for (const orbital of schema.orbitals) {
    for (const traitRef of getTraits(orbital)) {
      const traitName = (traitRef.name as string) ?? '';
      for (const event of getEmits(traitRef)) {
        emitMap.push({ orbital: orbital.name, trait: traitName, event });
      }
      for (const event of getListens(traitRef)) {
        listenMap.push({ orbital: orbital.name, trait: traitName, event });
      }
    }
  }

  for (const emit of emitMap) {
    for (const listen of listenMap) {
      if (emit.event === listen.event && emit.orbital !== listen.orbital) {
        crossLinks.push({
          emitterOrbital: emit.orbital,
          listenerOrbital: listen.orbital,
          eventName: emit.event,
          emitterTrait: emit.trait,
          listenerTrait: listen.trait,
        });
      }
    }
  }

  return { orbitals, crossLinks };
}

/**
 * Parse a single orbital's detail view.
 */
export function parseOrbitalLevel(schema: OrbitalSchema, orbitalName: string): OrbitalLevelData | null {
  const orbital = schema.orbitals.find(o => o.name === orbitalName);
  if (!orbital) return null;

  const entity = getEntity(orbital);
  const traits = getTraits(orbital);
  const pages = getPages(orbital);

  const fields: FieldInfo[] = entity.fields.map(f => ({
    name: (f.name as string) ?? '',
    type: (f.type as string) ?? 'string',
    required: (f.required as boolean) ?? false,
    hasDefault: f.default !== undefined,
  }));

  const traitInfos: OrbitalTraitInfo[] = traits.map(t => {
    const sm = getStateMachine(t);
    return {
      name: (t.name as string) ?? '',
      stateCount: sm ? getStates(sm).length : 0,
      eventCount: sm ? getEvents(sm).length : 0,
      transitionCount: sm ? getTransitions(sm).length : 0,
      emits: getEmits(t),
      listens: getListens(t),
    };
  });

  const pageInfos: OrbitalPageInfo[] = pages.map(p => ({
    name: (p.name as string) ?? '',
    route: (p.path as string) ?? `/${(p.name as string ?? '').toLowerCase()}`,
  }));

  // Compute external links
  const externalLinks: ExternalLink[] = [];
  const thisTraitEmits = traits.flatMap(t => getEmits(t).map(e => ({ trait: (t.name as string) ?? '', event: e })));
  const thisTraitListens = traits.flatMap(t => getListens(t).map(e => ({ trait: (t.name as string) ?? '', event: e })));

  for (const other of schema.orbitals) {
    if (other.name === orbitalName) continue;
    const otherTraits = getTraits(other);
    const otherListens = otherTraits.flatMap(t => getListens(t));
    const otherEmits = otherTraits.flatMap(t => getEmits(t));

    for (const emit of thisTraitEmits) {
      if (otherListens.includes(emit.event)) {
        externalLinks.push({
          targetOrbital: other.name,
          eventName: emit.event,
          direction: 'out',
          traitName: emit.trait,
        });
      }
    }

    for (const listen of thisTraitListens) {
      if (otherEmits.includes(listen.event)) {
        externalLinks.push({
          targetOrbital: other.name,
          eventName: listen.event,
          direction: 'in',
          traitName: listen.trait,
        });
      }
    }
  }

  return {
    name: orbital.name,
    entity: {
      name: entity.name,
      fields,
      persistence: entity.persistence,
    },
    traits: traitInfos,
    pages: pageInfos,
    externalLinks,
  };
}

/**
 * Parse a trait's state machine for the detail view.
 */
export function parseTraitLevel(schema: OrbitalSchema, orbitalName: string, traitName: string): TraitLevelData | null {
  const orbital = schema.orbitals.find(o => o.name === orbitalName);
  if (!orbital) return null;

  const traits = getTraits(orbital);
  const trait = traits.find(t => (t.name as string) === traitName);
  if (!trait) return null;

  const sm = getStateMachine(trait);
  if (!sm) return null;

  const states: TraitStateInfo[] = getStates(sm).map(s => ({
    name: (s.name as string) ?? '',
    isInitial: (s.isInitial as boolean) ?? false,
    isTerminal: (s.isTerminal as boolean) ?? false,
  }));

  const transitions: TraitTransitionInfo[] = getTransitions(sm).map((t, i) => ({
    from: (t.from as string) ?? '',
    to: (t.to as string) ?? '',
    event: (t.event as string) ?? '',
    guard: t.guard,
    effects: ((t.effects as unknown[]) ?? []).map(parseEffectType),
    index: i,
  }));

  const entity = getEntity(orbital);

  return {
    name: traitName,
    linkedEntity: entity.name,
    states,
    transitions,
    emittedEvents: getEmits(trait),
    listenedEvents: getListens(trait),
  };
}

/**
 * Parse a single transition for the detail view.
 */
export function parseTransitionLevel(
  schema: OrbitalSchema,
  orbitalName: string,
  traitName: string,
  transitionIndex: number,
): TransitionLevelData | null {
  const traitData = parseTraitLevel(schema, orbitalName, traitName);
  if (!traitData) return null;

  const transition = traitData.transitions[transitionIndex];
  if (!transition) return null;

  const guard = transition.guard ? exprToTree(transition.guard) : null;

  const effects: ExprTreeNode[] = transition.effects.map(e =>
    exprToTree([e.type, ...e.args]),
  );

  const slotTargets: SlotTarget[] = transition.effects
    .filter(e => e.type === 'render-ui')
    .map(e => ({
      name: String(e.args[0] ?? 'main'),
      pattern: typeof e.args[1] === 'object' && e.args[1] !== null
        ? ((e.args[1] as Record<string, unknown>).type as string) ?? 'unknown'
        : String(e.args[1] ?? 'unknown'),
    }));

  return {
    from: transition.from,
    to: transition.to,
    event: transition.event,
    guard,
    effects,
    slotTargets,
  };
}
