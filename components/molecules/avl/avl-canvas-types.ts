/**
 * AVL Canvas Types
 *
 * Types for the unified AVL + Flow canvas. These define the data shapes
 * for React Flow nodes and edges that render AVL primitives.
 */

import type {
  FieldInfo,
  OrbitalTraitInfo,
  OrbitalPageInfo,
  ExternalLink,
  TraitLevelData,
} from '../../organisms/avl/avl-schema-parser';

// ---------------------------------------------------------------------------
// Zoom bands — continuous semantic zoom
// ---------------------------------------------------------------------------

/** The four zoom bands of the unified AVL canvas. */
export type ZoomBand = 'system' | 'module' | 'behavior' | 'detail';

/** Thresholds for zoom band transitions (React Flow viewport zoom). */
export const ZOOM_BAND_THRESHOLDS = {
  system:   [0.1, 0.4],
  module:   [0.4, 1.0],
  behavior: [1.0, 2.5],
  detail:   [2.5, 5.0],
} as const;

// ---------------------------------------------------------------------------
// React Flow node data
// ---------------------------------------------------------------------------

/** Data carried by every orbital node in the unified canvas. */
export interface AvlNodeData extends Record<string, unknown> {
  orbitalName: string;
  entityName: string;
  persistence: string;
  fields: FieldInfo[];
  traits: OrbitalTraitInfo[];
  pages: OrbitalPageInfo[];
  traitDetails: Record<string, TraitLevelData>;
  externalLinks: ExternalLink[];
}

// ---------------------------------------------------------------------------
// React Flow edge data
// ---------------------------------------------------------------------------

/** Edge kind determines visual style. */
export type AvlEdgeKind = 'eventWire' | 'page';

/** Data carried by edges in the unified canvas. */
export interface AvlEdgeData extends Record<string, unknown> {
  edgeKind: AvlEdgeKind;
  event?: string;
  fromTrait?: string;
  toTrait?: string;
}
