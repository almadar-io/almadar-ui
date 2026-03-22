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

// Slot management
export {
    SlotsProvider,
    useSlots,
    useSlotContent,
    useSlotsActions,
    type SlotsState,
    type SlotState,
    type SlotPatternEntry,
    type SlotSource,
    type SlotsActions,
    type SlotsProviderProps,
} from './ui/SlotsContext';

// Effect handlers
export {
    createClientEffectHandlers,
    type ClientEventBus,
    type SlotSetter,
    type CreateClientEffectHandlersOptions,
} from './createClientEffectHandlers';

// OrbPreview — live orbital schema renderer
export { OrbPreview, type OrbPreviewProps } from './OrbPreview';

// Types
export type {
    ResolvedTraitBinding,
    ResolvedTrait,
    ResolvedEntity,
    ResolvedPage,
    ResolvedIR,
} from './types';
