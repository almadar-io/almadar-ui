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

// Verification
export * from './verificationRegistry';

// Data utilities
export * from './getNestedValue';

// Visualizer
export * from './visualizer/index';

// Content parsing
export * from './parseContentSegments';

// Al-Jazari state-machine diagram layout (framework-free — server-side SVG renderers use this)
export * from './jazari/index';
