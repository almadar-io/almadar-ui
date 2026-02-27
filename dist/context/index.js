import { ThemeProvider, useTheme } from '../chunk-QU4JHKVC.js';
export { BUILT_IN_THEMES, ThemeContext_default as ThemeContext, ThemeProvider, UISlotContext, UISlotProvider, useSlotContent, useSlotHasContent, useTheme, useUISlots } from '../chunk-QU4JHKVC.js';
import '../chunk-7NEWMNNU.js';
import '../chunk-PKBMQBKP.js';
import { createContext, useCallback, useMemo, useContext } from 'react';
import { jsx } from 'react/jsx-runtime';

// context/DesignThemeContext.tsx
var DesignThemeProvider = ThemeProvider;
function useDesignTheme() {
  const { theme, setTheme, availableThemes } = useTheme();
  return {
    designTheme: theme,
    setDesignTheme: setTheme,
    availableThemes: availableThemes.map((t) => t.name)
  };
}
var ANONYMOUS_USER = {
  id: "anonymous",
  role: "anonymous",
  permissions: []
};
var UserContext = createContext(null);
function UserProvider({
  user = null,
  children
}) {
  const hasRole = useCallback(
    (role) => {
      if (!user) return role === "anonymous";
      return user.role === role;
    },
    [user]
  );
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      return user.permissions?.includes(permission) ?? false;
    },
    [user]
  );
  const hasAnyRole = useCallback(
    (roles) => {
      if (!user) return roles.includes("anonymous");
      return user.role ? roles.includes(user.role) : false;
    },
    [user]
  );
  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!user || !user.permissions) return false;
      return permissions.every((p) => user.permissions?.includes(p));
    },
    [user]
  );
  const getUserField = useCallback(
    (path) => {
      const userData = user ?? ANONYMOUS_USER;
      const parts = path.split(".");
      let value = userData;
      for (const segment of parts) {
        if (value === null || value === void 0) {
          return void 0;
        }
        if (typeof value === "object") {
          value = value[segment];
        } else {
          return void 0;
        }
      }
      return value;
    },
    [user]
  );
  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn: user !== null,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAllPermissions,
      getUserField
    }),
    [user, hasRole, hasPermission, hasAnyRole, hasAllPermissions, getUserField]
  );
  return /* @__PURE__ */ jsx(UserContext.Provider, { value: contextValue, children });
}
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: null,
      isLoggedIn: false,
      hasRole: (role) => role === "anonymous",
      hasPermission: () => false,
      hasAnyRole: (roles) => roles.includes("anonymous"),
      hasAllPermissions: () => false,
      getUserField: () => void 0
    };
  }
  return context;
}
function useHasRole(role) {
  const { hasRole } = useUser();
  return hasRole(role);
}
function useHasPermission(permission) {
  const { hasPermission } = useUser();
  return hasPermission(permission);
}
function useUserForEvaluation() {
  const { user, isLoggedIn } = useUser();
  return isLoggedIn && user ? user : void 0;
}

export { ANONYMOUS_USER, DesignThemeProvider, UserContext, UserProvider, useDesignTheme, useHasPermission, useHasRole, useUser, useUserForEvaluation };
