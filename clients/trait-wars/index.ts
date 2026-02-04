/**
 * Trait Wars Design System Components
 *
 * Turn-based hex strategy game components built on the core design system.
 * All components follow the Orbital Entity Binding pattern:
 * - Data flows through entity/props from Orbital state
 * - User interactions emit events via useEventBus()
 */

// Asset constants and utilities
export * from './assets';

// Atoms - Basic building blocks
export * from './atoms';

// Molecules - Composite components
export * from './molecules';

// Organisms - Complex feature components
export * from './organisms';

// Templates - Page-level layouts
export * from './templates';
