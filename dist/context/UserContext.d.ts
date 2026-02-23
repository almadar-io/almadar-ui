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
import React from 'react';
/**
 * User data for @user bindings.
 * Matches UserContext type from evaluator/context.ts
 */
export interface UserData {
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
export interface UserContextValue {
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
declare const UserContext: React.Context<UserContextValue | null>;
export interface UserProviderProps {
    /** User data (null if not logged in) */
    user?: UserData | null;
    /** Children to render */
    children: React.ReactNode;
}
/**
 * Provider component that provides user context to the application.
 *
 * Provides RBAC helpers and field access for @user bindings.
 */
export declare function UserProvider({ user, children, }: UserProviderProps): React.ReactElement;
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
export declare function useUser(): UserContextValue;
/**
 * Hook to check if user has a specific role.
 * Convenience wrapper around useUser().hasRole().
 */
export declare function useHasRole(role: string): boolean;
/**
 * Hook to check if user has a specific permission.
 * Convenience wrapper around useUser().hasPermission().
 */
export declare function useHasPermission(permission: string): boolean;
/**
 * Hook to get user data for @user bindings in S-expressions.
 * Returns the user data object compatible with EvaluationContext.user
 */
export declare function useUserForEvaluation(): UserData | undefined;
export { UserContext, ANONYMOUS_USER };
