/**
 * OrbitalProvider
 *
 * Unified provider that combines all required contexts for Orbital applications.
 * Provides a single import for both Builder preview and compiled shell.
 *
 * Combines:
 * - ThemeProvider - Theme and color mode management
 * - EventBusProvider - Page-scoped event pub/sub
 * - SelectionProvider - Selected entity tracking
 * - FetchedDataProvider - Server-fetched entity data
 *
 * @packageDocumentation
 */
import React, { type ReactNode } from 'react';
import { type ThemeDefinition } from '../context/ThemeContext';
export interface OrbitalProviderProps {
    children: ReactNode;
    /** Custom themes (merged with built-in themes) */
    themes?: ThemeDefinition[];
    /** Default theme name */
    defaultTheme?: string;
    /** Default color mode */
    defaultMode?: 'light' | 'dark' | 'system';
    /** Optional target element ref for scoped theme application */
    targetRef?: React.RefObject<HTMLElement>;
    /** Skip ThemeProvider (use when already inside a themed container like shadow DOM) */
    skipTheme?: boolean;
    /** Enable debug logging for all providers */
    debug?: boolean;
    /** Initial fetched data */
    initialData?: Record<string, unknown[]>;
    /**
     * Enable Suspense mode. When true, UISlotRenderer wraps each slot in
     * `<ErrorBoundary><Suspense>` with Skeleton fallbacks.
     * Opt-in — existing isLoading prop pattern still works when false/absent.
     */
    suspense?: boolean;
    /**
     * Enable verification wiring for visual testing.
     * When true, lifecycle events are recorded and exposed via
     * `window.__orbitalVerification` for Playwright/automation.
     * Default: true in development, false in production.
     */
    verification?: boolean;
}
/**
 * OrbitalProvider - Unified context provider for Orbital applications
 *
 * Wraps your application with all required providers in the correct order.
 *
 * @example
 * ```tsx
 * // Basic usage
 * function App() {
 *   return (
 *     <OrbitalProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With configuration
 * function App() {
 *   return (
 *     <OrbitalProvider
 *       defaultTheme="minimalist"
 *       defaultMode="dark"
 *       debug={process.env.NODE_ENV === 'development'}
 *     >
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 *
 * // With custom themes from schema
 * import { THEMES } from './generated/theme-manifest';
 *
 * function App() {
 *   return (
 *     <OrbitalProvider themes={THEMES} defaultTheme="ocean">
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </OrbitalProvider>
 *   );
 * }
 * ```
 */
export declare function OrbitalProvider({ children, themes, defaultTheme, defaultMode, targetRef, skipTheme, debug, initialData, suspense, verification, }: OrbitalProviderProps): React.ReactElement;
export declare namespace OrbitalProvider {
    var displayName: string;
}
export { ThemeProvider } from '../context/ThemeContext';
export { EventBusProvider } from './EventBusProvider';
export { SelectionProvider } from './SelectionProvider';
export { FetchedDataProvider } from './FetchedDataProvider';
