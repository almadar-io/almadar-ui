/**
 * prepareSchemaForPreview
 *
 * Single source of truth for the "give an Orbital schema a runnable preview"
 * pipeline. Used by both:
 *   * `<OrbPreview autoMock />` (the docs / MDX path)
 *   * `PlaygroundContent` (the interactive playground)
 *
 * Type signature in `@almadar/core` terms:
 *
 *   buildMockData          : OrbitalSchema → EntityData
 *   adjustSchemaForMockData: (OrbitalSchema, EntityData) → OrbitalSchema
 *   prepareSchemaForPreview: OrbitalSchema → { schema: OrbitalSchema, mockData: EntityData }
 *
 * Steps:
 *   1. `buildMockData` — for each orbital, generate (or pick up from
 *     `entity.instances`) `EntityRow[]` for that entity.
 *   2. `adjustSchemaForMockData` — flip two-state INIT machines so the data
 *      state is initial (e.g. `empty -> hasItems` becomes `hasItems` initial).
 *
 * @packageDocumentation
 */

import { isEntityCall } from '@almadar/core';
import type {
  OrbitalSchema,
  Orbital,
  OrbitalEntity,
  EntityField,
  EntityRow,
  EntityData,
  FieldValue,
  Trait,
  TraitRef,
  StateMachine,
  State,
  Transition,
} from '@almadar/core';

// ---------------------------------------------------------------------------
// buildMockData
// ---------------------------------------------------------------------------

/**
 * Generate a synthetic `EntityRow` for one entity at the given index.
 *
 * @internal
 */
function generateEntityRow(entity: OrbitalEntity, idx: number): EntityRow {
  const row: EntityRow = { id: String(idx) };
  for (const f of entity.fields) {
    if (f.name === 'id') continue;
    row[f.name] = generateFieldValue(entity.name, f, idx);
  }
  return row;
}

/**
 * Generate a `FieldValue` for one entity field at the given index.
 * The rules:
 *   * `string` field with `values` enum → cycles through allowed values
 *   * `string` field → `"<Entity> <Field> <idx>"`
 *   * `number` field → `idx * 10`
 *   * `boolean` field → alternates
 *   * everything else → `field.default ?? null` (coerced to FieldValue)
 *
 * @internal
 */
function generateFieldValue(
  entityName: string,
  field: EntityField,
  idx: number,
): FieldValue {
  if (field.values && field.values.length > 0) {
    return field.values[(idx - 1) % field.values.length];
  }
  switch (field.type) {
    case 'string':
      return `${entityName} ${field.name.charAt(0).toUpperCase() + field.name.slice(1)} ${idx}`;
    case 'number':
      return idx * 10;
    case 'boolean':
      return idx % 2 === 0;
    default:
      return (field.default as FieldValue | undefined) ?? null;
  }
}

/**
 * Build mock entity rows (`EntityData`) for every orbital in the schema.
 *
 * For each orbital's entity:
 *   * If the entity has an `instances` array (from the schema author),
 *     use it as-is.
 *   * Otherwise generate 10 synthetic `EntityRow`s from the field
 *     definitions via `generateEntityRow`.
 *
 * @public
 */
export function buildMockData(schema: OrbitalSchema): EntityData {
  const result: EntityData = {};
  for (const orbital of schema.orbitals) {
    const entity = orbital.entity;
    if (!entity || typeof entity === 'string') continue;
    if (isEntityCall(entity)) continue; // EntityCall extends a reference; skip preview data generation
    const entityName = entity.name;
    if (!entityName) continue;

    if (entity.instances && entity.instances.length > 0) {
      result[entityName] = entity.instances;
      continue;
    }

    const rows: EntityRow[] = Array.from({ length: 10 }, (_, i) =>
      generateEntityRow(entity, i + 1),
    );
    result[entityName] = rows;
  }
  return result;
}

// ---------------------------------------------------------------------------
// adjustSchemaForMockData
// ---------------------------------------------------------------------------

/**
 * Type guard: a TraitRef is an inline `Trait` (not a string ref or
 * `{ ref, config }` object) when it has a `stateMachine` field.
 *
 * @internal
 */
function isInlineTrait(traitRef: TraitRef): traitRef is Trait {
  return (
    typeof traitRef === 'object' &&
    traitRef !== null &&
    'stateMachine' in traitRef
  );
}

/**
 * Find a non-initial state in `sm` that handles INIT.
 * Returns `undefined` if there is no such state (single-state INIT machine).
 *
 * @internal
 */
function findDataState(sm: StateMachine, initialStateName: string): State | undefined {
  return sm.states.find((s) => {
    if (s.name === initialStateName) return false;
    return sm.transitions.some(
      (t: Transition) =>
        t.event === 'INIT' &&
        (t.from === s.name ||
          (Array.isArray(t.from) && (t.from as string[]).includes(s.name))),
    );
  });
}

/**
 * Rewrite a single trait so the "data state" becomes initial.
 * Returns the original trait unchanged when:
 *   * the trait has no state machine
 *   * `linkedEntity` has no mock data
 *   * the machine has only one INIT-handling state (no two-state pattern)
 *
 * @internal
 */
function rewriteTraitInitialState(trait: Trait, mockData: EntityData): Trait {
  const sm = trait.stateMachine;
  if (!sm) return trait;

  const linkedEntity = trait.linkedEntity;
  if (!linkedEntity || !mockData[linkedEntity]?.length) return trait;

  const initialStateName =
    sm.states.find((s) => s.isInitial)?.name ?? sm.states[0]?.name;
  if (!initialStateName) return trait;

  const dataState = findDataState(sm, initialStateName);
  if (!dataState) return trait;

  const updatedStates: State[] = sm.states.map((s) => {
    if (s.name === initialStateName) return { ...s, isInitial: false };
    if (s.name === dataState.name) return { ...s, isInitial: true };
    return s;
  });

  return { ...trait, stateMachine: { ...sm, states: updatedStates } };
}

/**
 * When mock data exists for a trait's linked entity, swap the state
 * machine's initial state to the state that also handles INIT (the "data
 * state"). This makes previews land directly in the populated UI.
 *
 * Behavior is per-trait:
 *   * Inline traits with two-state INIT patterns are rewritten.
 *   * String / object trait refs are left untouched (the resolver handles them).
 *   * Single-state INIT machines are left untouched.
 *
 * @public
 */
export function adjustSchemaForMockData(
  schema: OrbitalSchema,
  mockData: EntityData,
): OrbitalSchema {
  let changed = false;
  const updatedOrbitals: Orbital[] = schema.orbitals.map((orbital) => {
    const traits = orbital.traits ?? [];
    const updatedTraits: TraitRef[] = traits.map((traitRef) => {
      if (!isInlineTrait(traitRef)) return traitRef;
      const updated = rewriteTraitInitialState(traitRef, mockData);
      if (updated !== traitRef) changed = true;
      return updated;
    });
    return changed ? { ...orbital, traits: updatedTraits } : orbital;
  });

  return changed ? { ...schema, orbitals: updatedOrbitals } : schema;
}

// ---------------------------------------------------------------------------
// prepareSchemaForPreview
// ---------------------------------------------------------------------------

/**
 * Result of `prepareSchemaForPreview`.
 *
 * @public
 */
export interface PreparedPreviewSchema {
  /** Schema with state machines flipped so data states are initial. */
  schema: OrbitalSchema;
  /** Mock entity rows keyed by entity name — pass to `OrbPreview.mockData`. */
  mockData: EntityData;
}

/**
 * Run the full preview prep pipeline on a schema.
 *
 * Accepts either an already-parsed `OrbitalSchema` or a JSON string.
 * Returns `{ schema, mockData }` ready to feed `<OrbPreview>`.
 *
 * Functional signature:
 *   `OrbitalSchema | string → { schema: OrbitalSchema, mockData: EntityData }`
 *
 * @public
 */
export function prepareSchemaForPreview(
  input: OrbitalSchema | string,
): PreparedPreviewSchema {
  const parsed: OrbitalSchema =
    typeof input === 'string' ? (JSON.parse(input) as OrbitalSchema) : input;
  const mockData = buildMockData(parsed);
  const schema = adjustSchemaForMockData(parsed, mockData);
  return { schema, mockData };
}
