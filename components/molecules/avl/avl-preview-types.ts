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

/**
 * Screen size preset for OrbPreview rendering inside nodes.
 *
 * Aligned with the four-breakpoint responsiveness audit:
 *   mobile  — phone portrait  (≤640px)
 *   tablet  — iPad / small landscape (641–1024px)
 *   laptop  — 13–15" notebook (1025–1440px)
 *   wide    — desktop / monitor (≥1441px)
 *
 * Preset widths are representative viewport widths within each range; the
 * preview renders at exactly this width so the embedded UI experiences
 * the same media-query / container-query behavior it would at the real
 * viewport. `minHeight` only floors the preview frame; vertical sizing is
 * content-driven (BrowserPlayground height="auto").
 */
export type ScreenSize = 'mobile' | 'tablet' | 'laptop' | 'wide';

export const SCREEN_SIZE_PRESETS: Record<ScreenSize, { width: number; minHeight: number; label: string; icon: string }> = {
  mobile: { width: 375,  minHeight: 320, label: 'Mobile', icon: 'smartphone' },
  tablet: { width: 768,  minHeight: 320, label: 'Tablet', icon: 'tablet' },
  laptop: { width: 1280, minHeight: 360, label: 'Laptop', icon: 'monitor' },
  wide:   { width: 1600, minHeight: 360, label: 'Wide',   icon: 'monitor-up' },
};

/**
 * Map a raw viewport width (px) to the nearest preset. Used by FlowCanvas
 * to auto-pick the default ScreenSize based on the user's actual canvas
 * pane width on mount + on window resize. The breakpoint edges match the
 * responsiveness-audit tiers exactly (640 / 1024 / 1440) so what the
 * preview renders matches the tier the audit graded against.
 */
export function detectScreenSize(viewportWidth: number): ScreenSize {
  if (viewportWidth <= 640) return 'mobile';
  if (viewportWidth <= 1024) return 'tablet';
  if (viewportWidth <= 1440) return 'laptop';
  return 'wide';
}

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

  /** Typed payload fields if this event carries data. */
  payloadFields?: Array<{ name: string; type: string; required?: boolean }>;
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

  /** Behavior layer for visual indicator (color band). */
  layer?: string;

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

  /**
   * Generation status for this orbital. When `'running'`, the overview node
   * renders a spinner overlay + accent border so the user can see which
   * orbital the coordinator is currently dispatching to. Other states are
   * available so consumers can also paint success/error treatments
   * (e.g. green border on completion, red on failure). Default is `'idle'`.
   *
   * Set by FlowCanvasProps.orbitalStatus and threaded through the converter.
   * Future expansion: hover over a `'running'` node to surface the subagent
   * trace inline.
   */
  status?: 'idle' | 'running' | 'success' | 'error';

  /**
   * The `OrbitalSchema.name` this node was derived from. The reserved value
   * `'__design_system__'` identifies nodes belonging to the Design System
   * tab's synthesized catalog schema, so downstream event handlers can route
   * mutation events to the project theme manifest instead of the project's
   * orbital schema. Unset for project orbitals — handlers treat absence as
   * "project schema".
   */
  sourceSchemaName?: string;
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
