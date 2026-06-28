/**
 * Providers barrel export
 *
 * Unified providers for Orbital applications.
 * Use OrbitalProvider for most cases - it combines all required providers.
 */

// Main unified provider
export { OrbitalProvider, type OrbitalProviderProps } from './OrbitalProvider';

// Re-export UIThemeDefinition for generated theme configs.
// (The ThemeContext/UISlotContext VALUE API is owned by @almadar/ui/context —
// the tsup dedupe plugins make that subpath the single concrete runtime home,
// so re-exporting those values here would round-trip through context and create
// a self-referential re-export. Only the pure type is safe to surface.)
export type { UIThemeDefinition } from './ThemeContext';

// Orbital theme provider
export { OrbitalThemeProvider, type OrbitalThemeProviderProps } from './OrbitalThemeProvider';

// Design theme provider
export { DesignThemeProvider, useDesignTheme } from './DesignThemeContext';

// Current page path provider
export {
  CurrentPagePathProvider,
  CurrentPagePathContext,
  useCurrentPagePath,
  type CurrentPagePathProviderProps,
} from './CurrentPagePathContext';

// User provider
export {
  UserProvider,
  UserContext,
  useUser,
  useHasRole,
  useHasPermission,
  useUserForEvaluation,
  ANONYMOUS_USER,
  type UserData,
  type UserContextValue,
  type UserProviderProps,
} from './UserContext';

// Entity schema provider (its hooks are pulled into the providers chunk via
// OrbitalProvider → UISlotRenderer, and the dedupe redirect routes every other
// chunk's import of them through this barrel, so they must be re-exported here).
export {
  EntitySchemaProvider,
  useEntitySchema,
  useEntitySchemaOptional,
  type EntitySchemaContextValue,
  type EntitySchemaProviderProps,
} from './EntitySchemaContext';

// Navigation, server bridge and trait providers are top-level providers/*
// modules: dedupeProvidersPlugin redirects every other chunk's import of them
// to @almadar/ui/providers, so the barrel must surface their full public API or
// those redirected imports dangle (renderer/runtime/avl chunks consume these).
export {
  NavigationProvider,
  useNavigation,
  useNavigateTo,
  useNavigationState,
  useInitPayload,
  useActivePage,
  useNavigationId,
  matchPath,
  extractRouteParams,
  pathMatches,
  findPageByPath,
  findPageByName,
  getDefaultPage,
  getAllPages,
  type NavigationState,
  type NavigationContextValue,
  type NavigationProviderProps,
} from './navigation';

export {
  ServerBridgeProvider,
  useServerBridge,
  type ServerClientEffect,
  type ServerResponseMeta,
  type SendEventResult,
  type ServerBridgeContextValue,
  type ServerBridgeTransport,
  type ServerBridgeProviderProps,
} from './ServerBridge';

export {
  TraitProvider,
  TraitContext,
  useTraitContext,
  useTrait,
  type TraitInstance,
  type TraitContextValue,
  type TraitProviderProps,
} from './TraitProvider';

// Individual providers (for advanced use cases)
export { EventBusProvider, EventBusContext } from './EventBusProvider';
export { TraitScopeProvider, useTraitScope } from './TraitScopeProvider';
export type { TraitScope, TraitScopeProviderProps } from './TraitScopeProvider';
export { SelectionProvider, SelectionContext, useSelection, useSelectionOptional } from './SelectionProvider';
export type { SelectionContextType } from './SelectionProvider';

// G13 Phase 3 (2026-04-24): the FetchedDataProvider family has been
// removed. It was never mounted in any real provider tree, so consumers
// that called `useFetchedDataContext()` always got `null`. Pattern
// components now receive pre-resolved entity data via the `entity` prop
// (bound from the state machine's `@payload.data` emission); ticks take
// their entity map as a hook argument directly.

// Verification provider
export { VerificationProvider } from './VerificationProvider';
export type { VerificationProviderProps } from './VerificationProvider';

// Offline mode provider
export {
  OfflineModeProvider,
  useOfflineMode,
  useOptionalOfflineMode,
} from './OfflineModeProvider';
export type {
  OfflineModeContextValue,
  OfflineModeProviderProps,
} from './OfflineModeProvider';

// Note: EventBusContextType is exported from hooks/event-bus-types to avoid duplicate exports
