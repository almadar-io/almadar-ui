/**
 * AVL Behavior Compose Types
 *
 * Types for behavior-level composition canvas.
 * At this level, each node represents a BEHAVIOR (not an orbital).
 * A behavior is a higher-level unit: atom (1 orbital), molecule (1 orbital
 * with composed traits), or organism (multiple orbitals).
 *
 * Three navigation levels:
 *   Behavior (compose): One node per behavior showing AvlBehaviorGlyph
 *   Overview: One node per orbital showing live UI (OrbPreviewNode)
 *   Expanded: One node per UI state within an orbital (OrbPreviewNode)
 */

import type { EntityPersistence, EventPayloadField } from '@almadar/core';
import type { BehaviorLevel, BehaviorGlyphChild, BehaviorGlyphConnection } from './AvlBehaviorGlyph';
import type { AvlEffectType } from '../../atoms/avl/types';

// ---------------------------------------------------------------------------
// View levels
// ---------------------------------------------------------------------------

/** Extended view level adding 'behavior' to the existing overview/expanded. */
export type ComposeViewLevel = 'behavior' | 'overview' | 'expanded';

// ---------------------------------------------------------------------------
// Connectable events
// ---------------------------------------------------------------------------

/** An event that can be wired between behaviors. */
export interface ConnectableEvent {
  /** Event name (e.g., "ADD_TO_CART"). */
  event: string;
  /** Typed payload fields if declared. */
  payloadFields?: EventPayloadField[];
  /** Vertical position hint (0..1) for handle placement on the node. */
  positionHint: number;
}

// ---------------------------------------------------------------------------
// React Flow node data
// ---------------------------------------------------------------------------

/** Data for a BehaviorComposeNode in React Flow. */
export interface BehaviorComposeNodeData extends Record<string, unknown> {
  /** Behavior name from registry (e.g., "std-cart"). */
  behaviorName: string;
  /** Composition level: atom, molecule, organism. */
  level: BehaviorLevel;
  /** Domain for color coding (e.g., "commerce"). */
  domain?: string;
  /** Layer classification (e.g., "Domain", "UI Patterns"). */
  layer?: string;
  /** Primary entity name (e.g., "CartItem"). */
  entityName: string;
  /** Number of states in the behavior. */
  stateCount: number;
  /** Number of entity fields. */
  fieldCount?: number;
  /** Persistence kind. */
  persistence?: EntityPersistence;
  /** Effect types used by this behavior. */
  effectTypes?: AvlEffectType[];
  /** Child behaviors for molecule/organism glyphs. */
  children?: BehaviorGlyphChild[];
  /** Connections between children (for organism glyphs). */
  connections?: BehaviorGlyphConnection[];
  /** Events this behavior can emit (source handles). */
  connectableEvents: ConnectableEvent[];
  /** Behaviors this is composable with (for palette hints). */
  composableWith?: string[];
  /** Names of orbitals produced by this behavior (for drill-down). */
  orbitalNames: string[];
}

// ---------------------------------------------------------------------------
// React Flow edge data
// ---------------------------------------------------------------------------

/** Edge data for behavior-level wiring. */
export interface BehaviorWireEdgeData extends Record<string, unknown> {
  /** The event name displayed on the edge. */
  event: string;
  /** Source behavior name. */
  sourceBehavior: string;
  /** Target behavior name. */
  targetBehavior: string;
  /** Typed payload fields if declared. */
  payloadFields?: EventPayloadField[];
}

// ---------------------------------------------------------------------------
// Canvas entry (behavior metadata for the composer)
// ---------------------------------------------------------------------------

/** Mapping from behavior name to its metadata + produced orbitals. */
export interface BehaviorCanvasEntry {
  /** Behavior name (e.g., "std-cart"). */
  behaviorName: string;
  /** Composition level. */
  level: BehaviorLevel;
  /** Domain for color coding. */
  domain?: string;
  /** Layer classification. */
  layer?: string;
  /** Primary entity name. */
  entityName: string;
  /** Number of states. */
  stateCount: number;
  /** Number of entity fields. */
  fieldCount?: number;
  /** Persistence kind. */
  persistence?: EntityPersistence;
  /** Effect types used. */
  effectTypes?: AvlEffectType[];
  /** Child behaviors (molecule/organism). */
  children?: BehaviorGlyphChild[];
  /** Connections between children (organism). */
  connections?: BehaviorGlyphConnection[];
  /** Events available for wiring. */
  connectableEvents: ConnectableEvent[];
  /** Compatible behavior names. */
  composableWith?: string[];
  /** Orbital names produced by this behavior (for drill-down mapping). */
  orbitalNames: string[];
}
