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

import type { ResolvedTraitListener as CoreResolvedTraitListener } from '@almadar/core';

/**
 * Listen scope descriptor carried by the resolved orb at runtime.
 *
 * Emitted by the compiler in the `listens[i].source` field of each
 * `ResolvedTraitListener`. Core's type doesn't declare this field yet
 * (@almadar/core 5.7.0) even though the Rust compiler and .lolo parser
 * both populate it. We declare it here in @almadar/ui (the consumer)
 * rather than modify core.
 *
 * - `any`: accept emits from any trait
 * - `trait`: only accept emits whose `BusEvent.source.trait` matches
 * - `orbital`: only accept emits whose `source.orbital[.trait?]` matches
 */
export interface ListenSource {
    kind?: 'any' | 'trait' | 'orbital';
    trait?: string;
    orbital?: string;
}

/**
 * Extended `ResolvedTraitListener` carrying the runtime-only `source`
 * scope descriptor that `@almadar/core`'s type hasn't picked up yet.
 * Intended as a local shim until core publishes a version with `source`.
 */
export type ResolvedTraitListener = CoreResolvedTraitListener & {
    source?: ListenSource;
};

// Re-export factory functions
export {
    createEmptyResolvedTrait,
    createEmptyResolvedPage,
    createResolvedField,
    inferTsType,
    isResolvedIR,
} from '@almadar/core';
