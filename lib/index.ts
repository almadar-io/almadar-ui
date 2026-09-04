/**
 * Lib - Utility functions and registries
 *
 * Core utilities for the Almadar UI library.
 */

// Class name utility
export { cn } from './cn';

// API client
export * from './api-client';

// Debug utilities (debug.ts has main debug functions)
export * from './debug';

// Debug utils (exclude isDebugEnabled which is in debug.ts)
export {
  setDebugEnabled,
  toggleDebug,
  onDebugToggle,
  initDebugShortcut,
} from './debugUtils';

export * from './entityDebug';
export * from './debugRegistry';

// Trait registries
export * from './guardRegistry';
export * from './tickRegistry';
export * from './traitRegistry';

// Transport discipline (T7/T8) — consumed by the interpreted ServerBridge and
// the compiled TS shell's generated hooks alike (single owner, no dupe).
export * from './command-send-pump';
export * from './tick-send-relay';

// Perf instrumentation (runtime-path hot spots) — the React-facing layer over
// @almadar/runtime/ui's framework-free ring + aggregation
export * from './perf';

// Verification
export * from './verificationRegistry';

// Data utilities
export * from './format';

export * from './getNestedValue';

// Visualizer
export * from './visualizer/index';

// Content parsing
export * from './parseContentSegments';
export { parseLessonSegments } from './parseLessonSegments';
export type { LessonSegment } from './parseLessonSegments';

// Al-Jazari state-machine diagram layout (framework-free — server-side SVG renderers use this)
export * from './jazari/index';

// Pure vim-flavored editor motions (CodeBlock consumes these — no DOM here)
export * from './editorMotions';
