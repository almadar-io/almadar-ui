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
} from "./UISlotContext";

export {
  ThemeProvider,
  useTheme,
  BUILT_IN_THEMES,
  type UIThemeDefinition,
  type ThemeProviderProps,
  type ColorMode,
  type ResolvedMode,
  type DesignTheme,
} from "./ThemeContext";
export { default as ThemeContext } from "./ThemeContext";

export {
  themeTokensToCssVars,
  resolveThemeForRuntime,
  type ThemeMode,
} from "./themeTokens";

export {
  OrbitalThemeProvider,
  type OrbitalThemeProviderProps,
} from "./OrbitalThemeProvider";

export { DesignThemeProvider, useDesignTheme } from "./DesignThemeContext";

export {
  CurrentPagePathProvider,
  CurrentPagePathContext,
  useCurrentPagePath,
  type CurrentPagePathProviderProps,
} from "./CurrentPagePathContext";

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
} from "./UserContext";
