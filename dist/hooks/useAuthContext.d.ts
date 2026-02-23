/**
 * Auth Context Hook Stub
 *
 * Provides a placeholder auth context for the design system.
 * Applications should provide their own AuthContext provider
 * that implements this interface.
 */
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}
export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signIn?: () => Promise<void>;
    signOut?: () => Promise<void>;
}
/**
 * Stub hook that returns empty auth context.
 * Applications should wrap their app with an AuthProvider
 * that supplies real auth state.
 */
export declare function useAuthContext(): AuthContextValue;
