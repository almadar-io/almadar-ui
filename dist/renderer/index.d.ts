/**
 * Shared Renderer Module
 *
 * Provides unified rendering logic for both Builder preview and compiled shells.
 * This is the core of the runtime unification - both systems use this same code.
 *
 * Key components:
 * - Types: Shared type definitions for effects, patterns, responses
 * - Pattern Resolver: Pattern → Component resolution
 * - Client Effect Executor: Execute clientEffects from server
 * - useClientEffects: React hook for effect execution
 * - Data Resolver: Entity data resolution with filtering
 * - Slot Definitions: Inline vs portal slot configuration
 *
 * @packageDocumentation
 */
export type { ClientEffect, NotifyOptions, ClientEffectExecutorConfig, PatternConfig, ResolvedPattern, EventResponse, UISlot, SlotType, SlotDefinition, DataContext, DataResolution, } from './types';
export { resolvePattern, isKnownPattern, getKnownPatterns, getPatternsByCategory, getPatternMapping, getPatternDefinition, initializePatternResolver, setComponentMapping, setPatternRegistry, } from './pattern-resolver';
export { executeClientEffects, parseClientEffect, parseClientEffects, filterEffectsByType, getRenderUIEffects, getNavigateEffects, getNotifyEffects, getEmitEffects, } from './client-effect-executor';
export { useClientEffects, useClientEffectConfig, useClientEffectConfigOptional, ClientEffectConfigProvider, ClientEffectConfigContext, } from './useClientEffects';
export type { UseClientEffectsOptions, UseClientEffectsResult, } from './useClientEffects';
export { resolveEntityData, resolveEntityDataWithQuery, resolveEntityById, resolveEntityCount, hasEntities, createFetchedDataContext, mergeDataContexts, } from './data-resolver';
export { SLOT_DEFINITIONS, getSlotDefinition, isPortalSlot, isInlineSlot, getSlotsByType, getInlineSlots, getPortalSlots, ALL_SLOTS, } from './slot-definitions';
export { OfflineExecutor, createOfflineExecutor, useOfflineExecutor, } from './offline-executor';
export type { PendingSyncEffect, OfflineExecutorConfig, OfflineExecutorState, UseOfflineExecutorOptions, UseOfflineExecutorResult, } from './offline-executor';
export { NavigationProvider, useNavigation, useNavigateTo, useNavigationState, useInitPayload, useActivePage, useNavigationId, matchPath, extractRouteParams, pathMatches, findPageByPath, findPageByName, getDefaultPage, getAllPages, } from './navigation';
export type { NavigationState, NavigationContextValue, NavigationProviderProps, } from './navigation';
export { initializePatterns } from './init';
