/**
 * NavigationContext - Schema-Driven Navigation for Orbital Runtime
 *
 * Provides navigation within the orbital schema without react-router dependency.
 * Navigation works by:
 * 1. Matching path to a page in the schema
 * 2. Extracting route params (e.g., /inspection/:id → { id: "123" })
 * 3. Switching active page
 * 4. Triggering INIT with merged payload
 *
 * This approach works whether OrbitalRuntime is standalone or embedded in another app.
 *
 * Used by both:
 * - Builder runtime (interpreted execution)
 * - Compiled shells (generated applications)
 *
 * @packageDocumentation
 */
import React from 'react';
import type { OrbitalSchema, OrbitalPage } from '@almadar/core';
/**
 * Match a concrete path against a pattern with :param placeholders.
 * Returns null if no match, or the extracted params if match.
 *
 * @example
 * matchPath('/inspection/:id', '/inspection/123') // { id: '123' }
 * matchPath('/users/:userId/posts/:postId', '/users/42/posts/7') // { userId: '42', postId: '7' }
 * matchPath('/about', '/about') // {}
 * matchPath('/about', '/contact') // null
 */
export declare function matchPath(pattern: string, path: string): Record<string, string> | null;
/**
 * Extract route params from a path given its pattern.
 * Wrapper around matchPath for explicit use.
 */
export declare function extractRouteParams(pattern: string, path: string): Record<string, string>;
/**
 * Check if a path matches a pattern.
 */
export declare function pathMatches(pattern: string, path: string): boolean;
/**
 * Find a page in the schema by matching its path pattern against a concrete path.
 * Returns the page and extracted route params.
 */
export declare function findPageByPath(schema: OrbitalSchema, path: string): {
    page: OrbitalPage;
    params: Record<string, string>;
    orbitalName: string;
} | null;
/**
 * Find a page by name.
 */
export declare function findPageByName(schema: OrbitalSchema, pageName: string): {
    page: OrbitalPage;
    orbitalName: string;
} | null;
/**
 * Get the first page in the schema (default page).
 */
export declare function getDefaultPage(schema: OrbitalSchema): {
    page: OrbitalPage;
    orbitalName: string;
} | null;
/**
 * Get all pages from the schema.
 */
export declare function getAllPages(schema: OrbitalSchema): Array<{
    page: OrbitalPage;
    orbitalName: string;
}>;
export interface NavigationState {
    /** Current active page name */
    activePage: string;
    /** Current path (for URL sync) */
    currentPath: string;
    /** Payload to pass to INIT when page loads */
    initPayload: Record<string, unknown>;
    /** Navigation counter (increments on each navigation) */
    navigationId: number;
}
export interface NavigationContextValue {
    /** Current navigation state */
    state: NavigationState;
    /** Navigate to a path with optional payload */
    navigateTo: (path: string, payload?: Record<string, unknown>) => void;
    /** Navigate to a page by name with optional payload */
    navigateToPage: (pageName: string, payload?: Record<string, unknown>) => void;
    /** The schema being navigated */
    schema: OrbitalSchema;
    /** Whether navigation is ready (schema loaded) */
    isReady: boolean;
}
export interface NavigationProviderProps {
    /** The schema to navigate within */
    schema: OrbitalSchema;
    /** Initial page name (optional, defaults to first page) */
    initialPage?: string;
    /** Whether to update browser URL on navigation (default: true) */
    updateUrl?: boolean;
    /** Callback when navigation occurs */
    onNavigate?: (pageName: string, path: string, payload: Record<string, unknown>) => void;
    /** Children */
    children: React.ReactNode;
}
/**
 * NavigationProvider - Provides schema-driven navigation context
 *
 * @example
 * ```tsx
 * <NavigationProvider schema={mySchema}>
 *   <OrbitalRuntimeContent />
 * </NavigationProvider>
 * ```
 */
export declare function NavigationProvider({ schema, initialPage, updateUrl, onNavigate, children, }: NavigationProviderProps): React.ReactElement;
/**
 * Hook to access navigation context.
 * Returns null if not within NavigationProvider.
 */
export declare function useNavigation(): NavigationContextValue | null;
/**
 * Hook to get the navigateTo function.
 * Returns a no-op function if not within NavigationProvider.
 */
export declare function useNavigateTo(): (path: string, payload?: Record<string, unknown>) => void;
/**
 * Hook to get current navigation state.
 */
export declare function useNavigationState(): NavigationState | null;
/**
 * Hook to get the current INIT payload (for passing to trait INIT events).
 */
export declare function useInitPayload(): Record<string, unknown>;
/**
 * Hook to get current active page name.
 */
export declare function useActivePage(): string | null;
/**
 * Hook to get navigation ID (changes on each navigation, useful for triggering effects).
 */
export declare function useNavigationId(): number;
export default NavigationProvider;
