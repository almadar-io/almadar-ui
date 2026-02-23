/**
 * Unified ThemeContext - Single provider for theme and color mode
 *
 * Combines design theme selection (ocean, wireframe, etc.) with
 * color mode (light/dark) into a single, simple system.
 *
 * Uses a single data attribute: data-theme="ocean-light" or data-theme="ocean-dark"
 *
 * @packageDocumentation
 */
import React from "react";
/** Color mode preference */
export type ColorMode = "light" | "dark" | "system";
/** Resolved color mode (what's actually applied) */
export type ResolvedMode = "light" | "dark";
/** Theme definition */
export interface ThemeDefinition {
    /** Theme identifier (e.g., "ocean", "wireframe") */
    name: string;
    /** Display name for UI (e.g., "Ocean Blue") */
    displayName?: string;
    /** Whether this theme has light mode styles */
    hasLightMode?: boolean;
    /** Whether this theme has dark mode styles */
    hasDarkMode?: boolean;
}
/** Built-in themes available in the design system */
export declare const BUILT_IN_THEMES: ThemeDefinition[];
/** Theme context value */
interface ThemeContextValue {
    /** Current theme name */
    theme: string;
    /** Current color mode setting (may be 'system') */
    mode: ColorMode;
    /** Resolved color mode (always 'light' or 'dark') */
    resolvedMode: ResolvedMode;
    /** Set the theme */
    setTheme: (theme: string) => void;
    /** Set the color mode */
    setMode: (mode: ColorMode) => void;
    /** Toggle between light and dark modes */
    toggleMode: () => void;
    /** Available themes */
    availableThemes: ThemeDefinition[];
    /** The full theme string applied to data-theme (e.g., "ocean-light") */
    appliedTheme: string;
}
declare const ThemeContext: React.Context<ThemeContextValue | undefined>;
export interface ThemeProviderProps {
    children: React.ReactNode;
    /** Available themes (will be merged with built-in themes) */
    themes?: readonly ThemeDefinition[] | ThemeDefinition[];
    /** Default theme name */
    defaultTheme?: string;
    /** Default color mode */
    defaultMode?: ColorMode;
    /** Optional target element ref — when provided, theme attributes are applied to this element instead of document.documentElement */
    targetRef?: React.RefObject<HTMLElement>;
}
/**
 * Unified ThemeProvider component
 *
 * @example
 * ```tsx
 * // Basic usage with built-in themes
 * <ThemeProvider defaultTheme="wireframe" defaultMode="light">
 *   <App />
 * </ThemeProvider>
 *
 * // With custom themes from orbital schema
 * import { THEMES } from './generated/theme-manifest';
 * <ThemeProvider themes={THEMES} defaultTheme="ocean" defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
/**
 * Hook for accessing theme context
 *
 * @returns Theme context value
 *
 * @example
 * ```tsx
 * const { theme, resolvedMode, toggleMode, setTheme } = useTheme();
 *
 * // Toggle dark mode
 * <button onClick={toggleMode}>
 *   {resolvedMode === 'dark' ? 'Light' : 'Dark'}
 * </button>
 *
 * // Change theme
 * <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *   {availableThemes.map(t => (
 *     <option key={t.name} value={t.name}>{t.displayName || t.name}</option>
 *   ))}
 * </select>
 * ```
 */
export declare function useTheme(): ThemeContextValue;
export type Theme = ColorMode;
export type ResolvedTheme = ResolvedMode;
export type DesignTheme = ThemeDefinition;
export default ThemeContext;
