/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */

// ── Event Name Constants ──────────────────────────────────────────────

export const EntityDisplayEvents = {
  SORT: 'SORT',
  PAGINATE: 'PAGINATE',
  SEARCH: 'SEARCH',
  FILTER: 'FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT',
} as const;

// ── Event Payloads ────────────────────────────────────────────────────

export interface SortPayload {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatePayload {
  page: number;
  pageSize?: number;
}

export interface SearchPayload {
  query: string;
}

export interface FilterPayload {
  field: string;
  operator: string;
  value: unknown;
}

export interface SelectPayload {
  ids: (string | number)[];
}

// ── Base Props ────────────────────────────────────────────────────────

export interface EntityDisplayProps<T = unknown> {
  /**
   * Entity data or a legacy entity-name string.
   *
   * V2 Phase 2 accepts three shapes here (value-first is the canonical path):
   * - `readonly T[]`: pre-resolved array for list patterns.
   * - `T`: pre-resolved single record for detail patterns.
   * - `string`: legacy entity-type name resolved by the renderer via
   *   `useEntityRef`. Emits a dev-mode deprecation warning; removal
   *   scheduled for Phase 6 of docs/Almadar_Entity_V2_Plan.md.
   *
   * Prefer `items` for list shapes so organisms never depend on the
   * renderer's string resolution at all.
   */
  entity?: string | T | readonly T[];
  /**
   * Pre-resolved list of records. V2 Phase 2 addition. When set, organisms
   * should read data from here instead of `entity`. Resolving from the
   * calling trait's `@payload.data` is the authoring pattern.
   */
  items?: readonly T[];
  /** Additional CSS classes */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;

  // ── Display hints (set by trait via render-ui, never written by organism) ──

  /** Current sort field */
  sortBy?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Current search query value */
  searchValue?: string;
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items (for pagination display) */
  totalCount?: number;
  /** Active filters */
  activeFilters?: Record<string, unknown>;
  /** Currently selected item IDs */
  selectedIds?: readonly (string | number)[];
}
