/**
 * Shared field-name + value formatting — the single owner of the humanize and
 * format vocabulary previously duplicated across DataTable, DataGrid, CardGrid,
 * DataList, TableView, DetailPanel, List, and UISlotRenderer.
 */
import type { FieldValue } from '@almadar/core';

export type ValueFormat =
  | 'none'
  | 'date'
  | 'time'
  | 'datetime'
  | 'number'
  | 'currency'
  | 'percent'
  | 'boolean';

/**
 * Convert a camelCase, PascalCase, ALLCAPS, snake_case, or kebab-case field
 * name to a human-readable header: "estimatedDelivery" → "Estimated Delivery",
 * "PURCHASEPRICE" → "Purchase Price", "is_active" → "Is Active".
 */
export function humanizeFieldName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b([A-Z])([A-Z]+)\b/g, (_, first: string, rest: string) => first + rest.toLowerCase())
    .trim();
}

/**
 * Badge/label-position enum values: a lowercase token chain joined by `_` or
 * `-` renders as spaced Title Case ("checked_in" → "Checked In"). Any other
 * shape (ids, emails, mixed case, single words) passes through unchanged —
 * a stated formatting contract, applied only where call sites opt in.
 */
export function humanizeEnumValue(value: string): string {
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(value) ? humanizeFieldName(value) : value;
}

export function formatDate(value: FieldValue | undefined): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(value: FieldValue | undefined): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(value: FieldValue | undefined): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return `${formatDate(value)} ${formatTime(value)}`;
}

function asYesNo(value: FieldValue): string {
  return value === false || value === 0 || String(value) === 'false' ? 'No' : 'Yes';
}

/**
 * Format a field value for display. Booleans always render Yes/No regardless
 * of the declared format (a raw `true`/`false` cell is never intended output).
 */
export function formatValue(value: FieldValue | undefined, format?: string): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return asYesNo(value);
  switch (format) {
    case 'date': return formatDate(value);
    case 'time': return formatTime(value);
    case 'datetime': return formatDateTime(value);
    case 'currency': return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value);
    case 'number': return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'percent': return typeof value === 'number' ? `${Math.round(value)}%` : String(value);
    case 'boolean': return asYesNo(value);
    default: return String(value);
  }
}

/** Sort direction for {@link sortRows}. */
export type SortDirection = 'asc' | 'desc';

/**
 * Order two cell values by their own type, never by what the field is called.
 *
 * Numbers compare numerically, date-like strings chronologically, everything
 * else by locale string order. `null`/`undefined` sort last in both directions
 * so empty cells never displace real data at the top of a list.
 */
export function compareCellValues(a: FieldValue | undefined, b: FieldValue | undefined): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);

  // Numeric strings before dates: `Date.parse('2020')` succeeds as a year, so a
  // string column holding "9" and "2020" would otherwise sort as dates.
  const aNum = Number(a);
  const bNum = Number(b);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;

  const aTime = dateLikeTime(a);
  const bTime = dateLikeTime(b);
  if (aTime !== null && bTime !== null) return aTime - bTime;

  return String(a).localeCompare(String(b));
}

/**
 * Milliseconds for a value that is genuinely date-shaped, else `null`.
 * Requires a date separator, so bare tokens never reach `Date.parse` — this
 * reads the value's own form, never the field's name.
 */
function dateLikeTime(value: FieldValue): number | null {
  if (value instanceof Date) return value.getTime();
  const text = String(value);
  if (!/\d/.test(text) || !/[-/:T]/.test(text)) return null;
  const time = Date.parse(text);
  return Number.isNaN(time) ? null : time;
}

/**
 * Return a new array ordered by `field`. Non-mutating, and a no-op without a
 * field so callers can pass the prop through unconditionally.
 *
 * NOTE: this orders only the rows already fetched. A collection larger than its
 * `limit` still needs ordering at the data layer — see `L-NO-COLLECTION-ORDERING`.
 */
export function sortRows<T extends Record<string, FieldValue | undefined>>(
  rows: readonly T[],
  field?: string,
  direction: SortDirection = 'asc',
): readonly T[] {
  if (!field) return rows;
  const dir = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => dir * compareCellValues(a?.[field], b?.[field]));
}
