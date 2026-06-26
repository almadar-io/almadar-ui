/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */

import type { EntityRow, FieldValue } from '@almadar/core';
import type { UiError } from '../atoms/types';

export type { UiError };

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
  value: FieldValue;
}

export interface SelectPayload {
  ids: (string | number)[];
}

// ── Base Props ────────────────────────────────────────────────────────

/**
 * Common non-entity display state shared by every display organism — loading,
 * error, and the render-ui display hints (sort/search/pagination/selection).
 * Carries NO entity data and NO generic. Components that show entity data add
 * their own `entity?: EntityRow | readonly EntityRow[]` field directly (the one
 * unified entity type from `@almadar/core`); components that only need the
 * loading/hint surface just extend this.
 */
export interface DisplayStateProps {
  /** Additional CSS classes */
  className?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;

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
  activeFilters?: Record<string, FieldValue>;
  /** Currently selected item IDs */
  selectedIds?: readonly (string | number)[];
}

