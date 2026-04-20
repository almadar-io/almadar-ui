/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */

import type { EntityRow } from '@almadar/core';

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

export interface EntityDisplayProps<T extends EntityRow = EntityRow> {
  /**
   * Pre-resolved entity data, typed against `@almadar/core`'s `EntityRow`
   * (`{ id?: string } & Record<string, FieldValue>`) so the single source of
   * truth for runtime entity shape lives in core. Consumers narrow via the
   * generic parameter; the constraint guarantees every organism receives
   * something with an optional `id` and a Record of `FieldValue` fields.
   *
   * Two shapes accepted:
   * - `readonly T[]`: array for list patterns (authoring: `entity: @payload.data`
   *   on the calling trait after a `fetch … { emit: { success } }` listener).
   * - `T`: single record for detail patterns.
   *
   * The legacy `string` (entity-name) branch was removed in V2 Phase 6. The
   * EntityStore resolver is gone; components now receive pre-resolved data via
   * the event bus.
   *
   * NOTE: Several legacy organisms (HeroOrganism, TeamOrganism, CaseStudyOrganism,
   * MediaGallery, PricingOrganism, ShowcaseOrganism, StatsOrganism, Sidebar,
   * Timeline, StepFlowOrganism, FeatureGridOrganism, book/*, WorldMapBoard,
   * StateMachineView, JazariStateMachine, MasterDetail, DataTable, Table) define
   * local entity types (HeroEntity, TeamMemberEntity, …) that don't formally
   * extend `EntityRow`. They surface `EntityDisplayProps<T>` constraint errors.
   * Tracked as a Phase 7 follow-up in `docs/Almadar_Entity_V2_Plan.md` §10.
   */
  entity?: T | readonly T[];
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
