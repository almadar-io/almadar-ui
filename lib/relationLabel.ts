/**
 * Shared relation display resolution — the ONE owner of "how does a relation
 * value read on screen". Consumed by DocumentDetails (meta rail chips),
 * DetailPanel (field rows) and TableView (cells), so every surface resolves a
 * relation the same way instead of leaking "[object Object]" or raw ids.
 */
import type { FieldValue } from '@almadar/core';

/** A hydrated relation row shown by its human label, never "[object Object]". */
export function relationLabel(value: FieldValue): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Date)
    return null;
  for (const key of ['name', 'title', 'label'] as const) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate !== '') return candidate;
  }
  const id = value.id;
  return id !== undefined && id !== null ? String(id) : null;
}

/**
 * Resolve any relation-shaped value to display labels:
 * - a hydrated row (or array of rows) → its `name`/`title`/`label`;
 * - a bare foreign id (or array of ids) → the injected `{value, label}`
 *   relation options (the same contract Form's selects consume), falling back
 *   to the raw id when no option matches;
 * - empty/null/undefined → [].
 */
export function relationDisplayLabels(
  value: FieldValue | undefined,
  options?: ReadonlyArray<{ value: string; label: string }>,
): string[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => relationDisplayLabels(item as FieldValue, options));
  }
  const hydrated = relationLabel(value);
  if (hydrated !== null) return [hydrated];
  const raw = String(value);
  const match = options?.find((opt) => opt.value === raw);
  return [match ? match.label : raw];
}
