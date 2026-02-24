import * as React from 'react';
import React__default from 'react';
import { U as UISlotManager, a as UISlot, S as SlotContent } from '../useUISlots-D0mttBSP.js';
export { R as RenderUIConfig, b as SlotAnimation, c as SlotChangeCallback } from '../useUISlots-D0mttBSP.js';
import { T as ThemeProviderProps } from '../ThemeContext-D9xUORq5.js';
export { B as BUILT_IN_THEMES, C as ColorMode, D as DesignTheme, R as ResolvedMode, a as ThemeContext, b as ThemeDefinition, c as ThemeProvider, u as useTheme } from '../ThemeContext-D9xUORq5.js';

/**
 * UISlotContext
 *
 * React context for providing the UI Slot Manager throughout the application.
 * Traits use this context to render content into slots via render_ui effects.
 *
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <UISlotProvider>
 *   <App />
 * </UISlotProvider>
 *
 * // In trait hooks or components
 * const { render, clear } = useUISlots();
 * render({ target: 'modal', pattern: 'form-section', props: {...} });
 * ```
 *
 * @packageDocumentation
 */

/**
 * Context for the UI Slot Manager
 */
declare const UISlotContext: React__default.Context<UISlotManager | null>;
interface UISlotProviderProps {
    children: React__default.ReactNode;
}
/**
 * Provider component that creates and provides the UI Slot Manager.
 *
 * Must wrap any components that use traits with render_ui effects.
 */
declare function UISlotProvider({ children }: UISlotProviderProps): React__default.ReactElement;
/**
 * Hook to access the UI Slot Manager.
 *
 * Must be used within a UISlotProvider.
 *
 * @throws Error if used outside of UISlotProvider
 *
 * @example
 * ```tsx
 * function MyTraitHook() {
 *   const { render, clear } = useUISlots();
 *
 *   const showModal = () => {
 *     render({
 *       target: 'modal',
 *       pattern: 'form-section',
 *       props: { title: 'Create Item' },
 *     });
 *   };
 *
 *   const closeModal = () => {
 *     clear('modal');
 *   };
 *
 *   return { showModal, closeModal };
 * }
 * ```
 */
declare function useUISlots(): UISlotManager;
/**
 * Hook to get content for a specific slot.
 *
 * Useful for components that only need to read slot state.
 */
declare function useSlotContent(slot: UISlot): SlotContent | null;
/**
 * Hook to check if a slot has content.
 */
declare function useSlotHasContent(slot: UISlot): boolean;

/**
 * @deprecated Use ThemeProvider from ThemeContext instead
 */
declare const DesignThemeProvider: React.FC<ThemeProviderProps>;
/**
 * @deprecated Use useTheme from ThemeContext instead
 *
 * This wrapper provides backward compatibility with the old API.
 */
declare function useDesignTheme(): {
    designTheme: string;
    setDesignTheme: (theme: string) => void;
    availableThemes: string[];
};

/**
 * UserContext
 *
 * React context for providing user data throughout the application.
 * Enables @user bindings in S-expressions for role-based UI and permissions.
 *
 * Usage:
 * ```tsx
 * // In App.tsx or layout
 * <UserProvider user={{ id: '123', role: 'admin', permissions: ['read', 'write'] }}>
 *   <App />
 * </UserProvider>
 *
 * // In components - access via hook
 * const { user, hasRole, hasPermission } = useUser();
 * if (hasRole('admin')) { ... }
 * if (hasPermission('delete')) { ... }
 * ```
 *
 * @packageDocumentation
 */

/**
 * User data for @user bindings.
 * Matches UserContext type from evaluator/context.ts
 */
interface UserData {
    /** User's unique ID */
    id: string;
    /** User's email */
    email?: string;
    /** User's display name */
    name?: string;
    /** User's role (for RBAC) */
    role?: string;
    /** User's permissions */
    permissions?: string[];
    /** Additional custom profile fields */
    [key: string]: unknown;
}
/**
 * User context value.
 */
interface UserContextValue {
    /** Current user data (null if not logged in) */
    user: UserData | null;
    /** Check if user is logged in */
    isLoggedIn: boolean;
    /** Check if user has a specific role */
    hasRole: (role: string) => boolean;
    /** Check if user has a specific permission */
    hasPermission: (permission: string) => boolean;
    /** Check if user has any of the specified roles */
    hasAnyRole: (roles: string[]) => boolean;
    /** Check if user has all of the specified permissions */
    hasAllPermissions: (permissions: string[]) => boolean;
    /** Get a user field by path (for @user.field bindings) */
    getUserField: (path: string) => unknown;
}
/**
 * Anonymous user for when no user is logged in.
 */
declare const ANONYMOUS_USER: UserData;
declare const UserContext: React__default.Context<UserContextValue | null>;
interface UserProviderProps {
    /** User data (null if not logged in) */
    user?: UserData | null;
    /** Children to render */
    children: React__default.ReactNode;
}
/**
 * Provider component that provides user context to the application.
 *
 * Provides RBAC helpers and field access for @user bindings.
 */
declare function UserProvider({ user, children, }: UserProviderProps): React__default.ReactElement;
/**
 * Hook to access the user context.
 *
 * Returns default values if used outside of UserProvider (for resilience).
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { user, hasRole, hasPermission } = useUser();
 *
 *   if (!hasRole('admin') && !hasPermission('admin:access')) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <div>Welcome, {user?.name}</div>;
 * }
 * ```
 */
declare function useUser(): UserContextValue;
/**
 * Hook to check if user has a specific role.
 * Convenience wrapper around useUser().hasRole().
 */
declare function useHasRole(role: string): boolean;
/**
 * Hook to check if user has a specific permission.
 * Convenience wrapper around useUser().hasPermission().
 */
declare function useHasPermission(permission: string): boolean;
/**
 * Hook to get user data for @user bindings in S-expressions.
 * Returns the user data object compatible with EvaluationContext.user
 */
declare function useUserForEvaluation(): UserData | undefined;

export { ANONYMOUS_USER, DesignThemeProvider, SlotContent, ThemeProviderProps, UISlot, UISlotContext, UISlotManager, UISlotProvider, UserContext, type UserContextValue, type UserData, UserProvider, type UserProviderProps, useDesignTheme, useHasPermission, useHasRole, useSlotContent, useSlotHasContent, useUISlots, useUser, useUserForEvaluation };
