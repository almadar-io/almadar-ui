/**
 * AVL Preview Types
 *
 * Types for the V3 FlowCanvas: UI projection mode.
 * Nodes show rendered UI thumbnails, edges show events.
 * Two levels: overview (one node per orbital) and expanded (one node per UI state).
 *
 * Uses @almadar/core types for schema-level constructs.
 */

import type { Expression, UISlot } from '@almadar/core';

// ---------------------------------------------------------------------------
// View levels
// ---------------------------------------------------------------------------

/** The two navigation levels of the FlowCanvas. */
export type ViewLevel = 'overview' | 'expanded';

// ---------------------------------------------------------------------------
// Screen size presets for preview nodes
// ---------------------------------------------------------------------------

/** Screen size preset for OrbPreview rendering inside nodes. */
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

/** Width for each screen size preset. Height is auto (expands to fit content). */
export const SCREEN_SIZE_PRESETS: Record<ScreenSize, { width: number; minHeight: number; label: string; icon: string }> = {
  mobile:  { width: 375,  minHeight: 300, label: 'Mobile',  icon: 'smartphone' },
  tablet:  { width: 560,  minHeight: 280, label: 'Tablet',  icon: 'tablet' },
  desktop: { width: 780,  minHeight: 260, label: 'Desktop', icon: 'monitor' },
};

// ---------------------------------------------------------------------------
// Event sources — UI elements that trigger transitions
// ---------------------------------------------------------------------------

/**
 * An interactive element inside a render-ui pattern that fires an event.
 * For example, a button with `event: "CHECKOUT"` is an event source.
 * These are used to draw edges from the specific trigger element to the
 * target screen, making the prototype flow concrete.
 */
export interface PatternEventSource {
  /** The event name fired by this element (e.g., "CHECKOUT"). */
  event: string;

  /** The pattern type of the trigger element (e.g., "button", "link", "icon-button"). */
  patternType: string;

  /** Human label if available (e.g., "Checkout", "Submit"). */
  label?: string;

  /**
   * Path within the pattern tree (e.g., "children.2" means third child).
   * Used to position the handle near the trigger element.
   */
  path: string;

  /** Vertical position hint (0..1) for handle placement on the node. */
  positionHint: number;
}

// ---------------------------------------------------------------------------
// Render-UI pattern entry
// ---------------------------------------------------------------------------

/** A slot + pattern config pair extracted from a render-ui effect. */
export interface RenderUIEntry {
  slot: UISlot | string;
  pattern: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// React Flow node data
// ---------------------------------------------------------------------------

/** Data for a preview node (used at both overview and expanded levels). */
export interface PreviewNodeData extends Record<string, unknown> {
  /** Orbital this node belongs to. */
  orbitalName: string;

  /** Trait name (only at expanded level). */
  traitName?: string;

  /** State name after this transition fires (expanded level). */
  stateName?: string;

  /** Event that triggers this transition (expanded level). */
  transitionEvent?: string;

  /** From state (expanded level). */
  fromState?: string;

  /** To state (expanded level). */
  toState?: string;

  /**
   * Render-ui patterns extracted from the transition's effects.
   * Each entry is a slot + pattern config pair.
   */
  patterns: RenderUIEntry[];

  /**
   * Interactive elements within the patterns that fire events.
   * Each one becomes a source handle on the node, allowing edges
   * to connect from the specific button/link to the target screen.
   */
  eventSources: PatternEventSource[];

  /** State role for visual indicator. */
  stateRole?: 'initial' | 'terminal' | 'hub' | 'error' | 'default';

  /** All effect types on this transition (for overlay). */
  effectTypes?: string[];

  /** Guard expression (for overlay). */
  guard?: Expression | null;

  // --- Orbital metadata (for overlay at overview level) ---
  entityName?: string;
  persistence?: string;
  fieldCount?: number;
  traitCount?: number;
  pageRoutes?: string[];
}

// ---------------------------------------------------------------------------
// React Flow edge data
// ---------------------------------------------------------------------------

/** Data for event flow edges. */
export interface EventEdgeData extends Record<string, unknown> {
  /** The event name displayed on the edge. */
  event: string;

  /** Source state name (expanded level). */
  fromState?: string;

  /** Target state name (expanded level). */
  toState?: string;

  /** Whether this is a backward/retry transition. */
  isBackward?: boolean;

  /** Whether this is a cross-orbital event wire (overview level). */
  isCrossOrbital?: boolean;

  /** Source trait (for cross-orbital wires). */
  fromTrait?: string;

  /** Target trait (for cross-orbital wires). */
  toTrait?: string;

  /**
   * The pattern type that triggers this event (e.g., "button").
   * Displayed on the edge label for context.
   */
  triggerPatternType?: string;

  /** The trigger element's label (e.g., "Checkout"). */
  triggerLabel?: string;
}
