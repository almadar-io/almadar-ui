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
  Entity,
  EntityCall,
  EntityField,
  OrbitalPage,
  Trait,
  StateMachine,
  State,
  Transition,
  Event,
  TraitEventContract,
  TraitEventListener,
  JsonValue,
  JsonObject,
} from '@almadar/core';

// Internal serialized effect record — all fields are JsonValue-compatible.
interface SerializedEffect extends JsonObject {
  type: string;
  args: JsonValue[];
}

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

export interface FieldInfo extends JsonObject {
  name: string;
  type: string;
  required: boolean;
  hasDefault: boolean;
}

export interface OrbitalTraitInfo extends JsonObject {
  name: string;
  stateCount: number;
  eventCount: number;
  transitionCount: number;
  emits: string[];
  listens: string[];
}

export interface OrbitalPageInfo extends JsonObject {
  name: string;
  route: string;
}

export interface ExternalLink extends JsonObject {
  targetOrbital: string;
  eventName: string;
  direction: string;
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

export interface TraitStateInfo extends JsonObject {
  name: string;
  isInitial: boolean | null;
  isTerminal: boolean | null;
}

export interface TraitTransitionInfo extends JsonObject {
  from: string;
  to: string;
  event: string;
  guard: JsonValue | null;
  effects: SerializedEffect[];
  index: number;
}

export interface TraitLevelData extends JsonObject {
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

function getEntity(orbital: OrbitalDefinition): { name: string; fields: EntityField[]; persistence: string } {
  const entity = orbital.entity;
  if (typeof entity === 'string') {
    return { name: entity, fields: [], persistence: 'runtime' };
  }
  if ('extends' in entity) {
    const ec = entity as EntityCall;
    return {
      name: ec.name ?? orbital.name,
      fields: ec.fields ?? [],
      persistence: ec.persistence ?? 'runtime',
    };
  }
  const e = entity as Entity;
  return {
    name: e.name,
    fields: e.fields ?? [],
    persistence: e.persistence ?? 'runtime',
  };
}

function getTraits(orbital: OrbitalDefinition): Trait[] {
  if (!orbital.traits) return [];
  return orbital.traits.map(t => {
    if (typeof t === 'string') return { name: t } as Trait;
    if ('ref' in t && !('stateMachine' in t)) return { name: t.name ?? t.ref } as Trait;
    return t as Trait;
  });
}

function getPages(orbital: OrbitalDefinition): OrbitalPage[] {
  if (!orbital.pages) return [];
  return orbital.pages.map(p => {
    if (typeof p === 'string') return { name: p, path: `/${p.toLowerCase()}` } as OrbitalPage;
    if ('ref' in p && !('path' in p)) return { name: p.ref, path: `/${p.ref.toLowerCase()}` } as OrbitalPage;
    return p as OrbitalPage;
  });
}

function getStateMachine(trait: Trait): StateMachine | null {
  return trait.stateMachine ?? null;
}

function getStates(sm: StateMachine): State[] {
  return sm.states ?? [];
}

function getTransitions(sm: StateMachine): Transition[] {
  return sm.transitions ?? [];
}

function getEvents(sm: StateMachine): Event[] {
  return sm.events ?? [];
}

function getEmits(trait: Trait): string[] {
  const emits: TraitEventContract[] | undefined = trait.emits;
  if (!emits) return [];
  return emits.map(e => e.event ?? '');
}

function getListens(trait: Trait): string[] {
  const listens: TraitEventListener[] | undefined = trait.listens;
  if (!listens) return [];
  return listens.map(l => l.event ?? '');
}

function parseEffectType(effect: JsonValue): SerializedEffect {
  if (Array.isArray(effect)) {
    const [type, ...args] = effect;
    return { type: String(type), args };
  }
  return { type: 'unknown', args: [] };
}

function exprToTree(expr: JsonValue): ExprTreeNode {
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
  if (expr !== null && typeof expr === 'object') {
    return { label: JSON.stringify(expr), type: 'literal' };
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

  // GAP-99: guard against undefined/empty orbitals — prevents "reading 'fields' of undefined"
  if (!schema.orbitals || schema.orbitals.length === 0) {
    return { orbitals: [], crossLinks: [] };
  }

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
      traitNames: traits.map(t => t.name ?? ''),
      pageNames: pages.map(p => p.name ?? ''),
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
      const traitName = traitRef.name ?? '';
      for (const event of getEmits(traitRef)) {
        emitMap.push({ orbital: orbital.name, trait: traitName, event });
      }
      for (const event of getListens(traitRef)) {
        listenMap.push({ orbital: orbital.name, trait: traitName, event });
      }
    }
  }

  // Dedupe by (emitter, listener, event). Cosmic-zoom renders one wire per
  // CrossLink and downstream xyflow edges key on the same triple, so multiple
  // trait pairs sharing it would stack overlapping wires / collide as duplicate
  // React keys.
  const seenLinks = new Set<string>();
  for (const emit of emitMap) {
    for (const listen of listenMap) {
      if (emit.event !== listen.event || emit.orbital === listen.orbital) continue;
      const key = `${emit.orbital}␟${listen.orbital}␟${emit.event}`;
      if (seenLinks.has(key)) continue;
      seenLinks.add(key);
      crossLinks.push({
        emitterOrbital: emit.orbital,
        listenerOrbital: listen.orbital,
        eventName: emit.event,
        emitterTrait: emit.trait,
        listenerTrait: listen.trait,
      });
    }
  }

  return { orbitals, crossLinks };
}

/**
 * Parse a single orbital's detail view.
 */
export function parseOrbitalLevel(schema: OrbitalSchema, orbitalName: string): OrbitalLevelData | null {
  if (!schema.orbitals) return null;
  const orbital = schema.orbitals.find(o => o.name === orbitalName);
  if (!orbital) return null;

  const entity = getEntity(orbital);
  const traits = getTraits(orbital);
  const pages = getPages(orbital);

  const fields: FieldInfo[] = entity.fields.map(f => ({
    name: f.name ?? '',
    type: f.type ?? 'string',
    required: f.required ?? false,
    hasDefault: f.default !== undefined,
  }));

  const traitInfos: OrbitalTraitInfo[] = traits.map(t => {
    const sm = getStateMachine(t);
    return {
      name: t.name ?? '',
      stateCount: sm ? getStates(sm).length : 0,
      eventCount: sm ? getEvents(sm).length : 0,
      transitionCount: sm ? getTransitions(sm).length : 0,
      emits: getEmits(t),
      listens: getListens(t),
    };
  });

  const pageInfos: OrbitalPageInfo[] = pages.map(p => ({
    name: p.name ?? '',
    route: p.path ?? `/${(p.name ?? '').toLowerCase()}`,
  }));

  // Compute external links
  const externalLinks: ExternalLink[] = [];
  const thisTraitEmits = traits.flatMap(t => getEmits(t).map(e => ({ trait: t.name ?? '', event: e })));
  const thisTraitListens = traits.flatMap(t => getListens(t).map(e => ({ trait: t.name ?? '', event: e })));

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
  if (!schema.orbitals) return null;
  const orbital = schema.orbitals.find(o => o.name === orbitalName);
  if (!orbital) return null;

  const traits = getTraits(orbital);
  const trait = traits.find(t => t.name === traitName);
  if (!trait) return null;

  const sm = getStateMachine(trait);
  if (!sm) return null;

  const states: TraitStateInfo[] = getStates(sm).map(s => ({
    name: s.name ?? '',
    isInitial: s.isInitial ?? null,
    isTerminal: s.isTerminal ?? null,
  }));

  const transitions: TraitTransitionInfo[] = getTransitions(sm).map((t, i) => ({
    from: t.from ?? '',
    to: t.to ?? '',
    event: t.event ?? '',
    guard: (t.guard as JsonValue | null | undefined) ?? null,
    effects: ((t.effects ?? []) as JsonValue[]).map(parseEffectType),
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

  const guardVal = transition.guard;
  const guard = guardVal != null ? exprToTree(guardVal) : null;

  const effects: ExprTreeNode[] = transition.effects.map(e =>
    exprToTree([e.type, ...e.args]),
  );

  const slotTargets: SlotTarget[] = transition.effects
    .filter(e => e.type === 'render-ui')
    .map(e => ({
      name: String(e.args[0] ?? 'main'),
      pattern: typeof e.args[1] === 'object' && e.args[1] !== null && !Array.isArray(e.args[1])
        ? ((e.args[1] as JsonObject).type as string) ?? 'unknown'
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
