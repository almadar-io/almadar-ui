/**
 * Context barrel export
 */

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
} from "../providers/UISlotContext";

export {
  ThemeProvider,
  useTheme,
  BUILT_IN_THEMES,
  type UIThemeDefinition,
  type ThemeProviderProps,
  type ColorMode,
  type ResolvedMode,
  type DesignTheme,
} from "../providers/ThemeContext";
export { default as ThemeContext } from "../providers/ThemeContext";

export {
  themeTokensToCssVars,
  resolveThemeForRuntime,
  type ThemeMode,
} from "../lib/themeTokens";

export {
  OrbitalThemeProvider,
  type OrbitalThemeProviderProps,
} from "../providers/OrbitalThemeProvider";

export { DesignThemeProvider, useDesignTheme } from "../providers/DesignThemeContext";

export {
  CurrentPagePathProvider,
  CurrentPagePathContext,
  useCurrentPagePath,
  type CurrentPagePathProviderProps,
} from "../providers/CurrentPagePathContext";

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
} from "../providers/UserContext";
