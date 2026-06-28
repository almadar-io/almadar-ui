/**
 * Providers barrel export
 *
 * Unified providers for Orbital applications.
 * Use OrbitalProvider for most cases - it combines all required providers.
 */

// Main unified provider
export { OrbitalProvider, type OrbitalProviderProps } from './OrbitalProvider';

// Theme provider (value + type exports consumed by context/index.ts shim)
export {
  ThemeProvider,
  useTheme,
  BUILT_IN_THEMES,
  type UIThemeDefinition,
  type ThemeProviderProps,
  type ColorMode,
  type ResolvedMode,
  type DesignTheme,
} from './ThemeContext';
export { default as ThemeContext } from './ThemeContext';

// UI slot provider (value + type exports consumed by context/index.ts shim)
export {
  UISlotProvider,
  useUISlots,
  useSlotContent,
  useSlotHasContent,
  UISlotContext,
  type UISlotManager,
  type UISlot,
  type SlotContent,
  type SlotRenderConfig,
  type SlotAnimation,
  type SlotChangeCallback,
} from './UISlotContext';

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
