/**
 * @almadar/ui Runtime
 *
 * Client-side runtime components for rendering Orbital schemas.
 * Provides trait state machines, slot management, and pattern rendering.
 *
 * @packageDocumentation
 */

// Core runtime hooks
export { useTraitStateMachine, type UseTraitStateMachineOptions, type TraitStateMachineResult } from './useTraitStateMachine';
export { useResolvedSchema, type ResolvedSchemaResult, clearSchemaCache } from './useResolvedSchema';

// Context providers
export {
    EntitySchemaProvider,
    useEntitySchema,
    useEntityDefinition,
    useEntitySchemaOptional,
    type EntitySchemaContextValue,
    type EntitySchemaProviderProps,
} from './EntitySchemaContext';

export {
    TraitProvider,
    TraitContext,
    useTraitContext,
    useTrait,
    type TraitContextValue,
    type TraitInstance,
    type TraitProviderProps,
} from './TraitProvider';

// Slot pattern types — the runtime now writes directly to `useUISlots`
// (re-exported from `../context/UISlotContext`); the previous
// SlotsContext / SlotsProvider / SlotBridge mirror layer was removed.
export type { SlotPatternEntry, SlotSource } from './ui/slot-types';

// Effect handlers
export {
    createClientEffectHandlers,
    type ClientEventBus,
    type SlotSetter,
    type CreateClientEffectHandlersOptions,
} from './createClientEffectHandlers';

// OrbPreview — live orbital schema renderer
export { OrbPreview, type OrbPreviewProps } from './OrbPreview';

// BrowserPlayground — in-browser OrbitalServerRuntime mount (mock mode)
export { BrowserPlayground, type BrowserPlaygroundProps } from './BrowserPlayground';

// Preview prep — single source of truth for the doc/playground mock pipeline
export {
    prepareSchemaForPreview,
    buildMockData,
    adjustSchemaForMockData,
    type PreparedPreviewSchema,
} from './prepareSchemaForPreview';

// ServerBridge — client-server bridge for dual execution
export { ServerBridgeProvider, useServerBridge, type ServerBridgeContextValue, type ServerBridgeTransport, type ServerClientEffect } from './ServerBridge';

// Types
export type {
    ResolvedTraitBinding,
    ResolvedTrait,
    ResolvedEntity,
    ResolvedPage,
    ResolvedIR,
} from './types';
