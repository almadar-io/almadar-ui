/**
 * OrbitalRuntime Types
 *
 * Re-exports IR types from @almadar/core.
 * This ensures runtime uses the same types as the compiler.
 *
 * @packageDocumentation
 */

// Re-export all IR types from @almadar/core
export type {
    TransitionFrom,
    ResolvedField,
    ResolvedEntity,
    ResolvedEntityBinding,
    ResolvedTraitState,
    ResolvedTraitEvent,
    ResolvedTraitTransition,
    ResolvedTraitGuard,
    ResolvedTraitTick,
    ResolvedTraitListener,
    ResolvedTraitDataEntity,
    ResolvedTraitUIBinding,
    ResolvedTrait,
    ResolvedTraitBinding,
    ResolvedPattern,
    ResolvedSectionEvent,
    ResolvedSection,
    ResolvedNavigation,
    ResolvedPage,
    ResolvedIR,
} from '@almadar/core';

// Re-export factory functions
export {
    createEmptyResolvedTrait,
    createEmptyResolvedPage,
    createResolvedField,
    inferTsType,
    isResolvedIR,
} from '@almadar/core';
