import { useUISlotManager } from './chunk-7NEWMNNU.js';
import { createContext, useMemo, useState, useEffect, useCallback, useContext } from 'react';
import { jsx } from 'react/jsx-runtime';

var BUILT_IN_THEMES = [
  {
    name: "wireframe",
    displayName: "Wireframe",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "minimalist",
    displayName: "Minimalist",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "almadar",
    displayName: "Almadar",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "trait-wars",
    displayName: "Trait Wars",
    hasLightMode: false,
    hasDarkMode: true
  },
  // Extended themes
  {
    name: "ocean",
    displayName: "Ocean",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "forest",
    displayName: "Forest",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "sunset",
    displayName: "Sunset",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "lavender",
    displayName: "Lavender",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "rose",
    displayName: "Rose",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "slate",
    displayName: "Slate",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "ember",
    displayName: "Ember",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "midnight",
    displayName: "Midnight",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "sand",
    displayName: "Sand",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "neon",
    displayName: "Neon",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "arctic",
    displayName: "Arctic",
    hasLightMode: true,
    hasDarkMode: true
  },
  {
    name: "copper",
    displayName: "Copper",
    hasLightMode: true,
    hasDarkMode: true
  }
];
var ThemeContext = createContext(void 0);
var THEME_STORAGE_KEY = "theme";
var MODE_STORAGE_KEY = "theme-mode";
function getSystemMode() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function resolveMode(mode) {
  if (mode === "system") {
    return getSystemMode();
  }
  return mode;
}
var ThemeProvider = ({
  children,
  themes = [],
  defaultTheme = "wireframe",
  defaultMode = "system",
  targetRef
}) => {
  const availableThemes = useMemo(() => {
    const themeMap = /* @__PURE__ */ new Map();
    BUILT_IN_THEMES.forEach((t) => themeMap.set(t.name, t));
    themes.forEach((t) => themeMap.set(t.name, t));
    return Array.from(themeMap.values());
  }, [themes]);
  const isScoped = !!targetRef;
  const [theme, setThemeState] = useState(() => {
    if (isScoped || typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const validThemes = [
      ...BUILT_IN_THEMES.map((t) => t.name),
      ...themes.map((t) => t.name)
    ];
    if (stored && validThemes.includes(stored)) {
      return stored;
    }
    return defaultTheme;
  });
  const [mode, setModeState] = useState(() => {
    if (isScoped || typeof window === "undefined") return defaultMode;
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return defaultMode;
  });
  const [resolvedMode, setResolvedMode] = useState(
    () => resolveMode(mode)
  );
  const appliedTheme = useMemo(
    () => `${theme}-${resolvedMode}`,
    [theme, resolvedMode]
  );
  useEffect(() => {
    const updateResolved = () => {
      setResolvedMode(resolveMode(mode));
    };
    updateResolved();
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateResolved();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    return void 0;
  }, [mode]);
  useEffect(() => {
    if (isScoped) {
      if (targetRef?.current) {
        targetRef.current.setAttribute("data-theme", appliedTheme);
        targetRef.current.classList.remove("light", "dark");
        targetRef.current.classList.add(resolvedMode);
      }
      return;
    }
    const root = document.documentElement;
    root.setAttribute("data-theme", appliedTheme);
    root.classList.remove("light", "dark");
    root.classList.add(resolvedMode);
  }, [appliedTheme, resolvedMode, targetRef, isScoped]);
  const setTheme = useCallback(
    (newTheme) => {
      const validTheme = availableThemes.find((t) => t.name === newTheme);
      if (validTheme) {
        setThemeState(newTheme);
        if (!isScoped && typeof window !== "undefined") {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
      } else {
        console.warn(
          `Theme "${newTheme}" not found. Available: ${availableThemes.map((t) => t.name).join(", ")}`
        );
      }
    },
    [availableThemes]
  );
  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    if (!isScoped && typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    }
  }, []);
  const toggleMode = useCallback(() => {
    const newMode = resolvedMode === "dark" ? "light" : "dark";
    setMode(newMode);
  }, [resolvedMode, setMode]);
  const contextValue = useMemo(
    () => ({
      theme,
      mode,
      resolvedMode,
      setTheme,
      setMode,
      toggleMode,
      availableThemes,
      appliedTheme
    }),
    [
      theme,
      mode,
      resolvedMode,
      setTheme,
      setMode,
      toggleMode,
      availableThemes,
      appliedTheme
    ]
  );
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: contextValue, children });
};
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === void 0) {
    return {
      theme: "wireframe",
      mode: "light",
      resolvedMode: "light",
      setTheme: () => {
      },
      setMode: () => {
      },
      toggleMode: () => {
      },
      availableThemes: BUILT_IN_THEMES,
      appliedTheme: "wireframe-light"
    };
  }
  return context;
}
var ThemeContext_default = ThemeContext;
var UISlotContext = createContext(null);
function UISlotProvider({ children }) {
  const slotManager = useUISlotManager();
  const contextValue = useMemo(() => slotManager, [slotManager]);
  return /* @__PURE__ */ jsx(UISlotContext.Provider, { value: contextValue, children });
}
function useUISlots() {
  const context = useContext(UISlotContext);
  if (!context) {
    throw new Error(
      "useUISlots must be used within a UISlotProvider. Make sure your component tree is wrapped with <UISlotProvider>."
    );
  }
  return context;
}
function useSlotContent(slot) {
  const { getContent } = useUISlots();
  return getContent(slot);
}
function useSlotHasContent(slot) {
  const { hasContent } = useUISlots();
  return hasContent(slot);
}

export { BUILT_IN_THEMES, ThemeContext_default, ThemeProvider, UISlotContext, UISlotProvider, useSlotContent, useSlotHasContent, useTheme, useUISlots };
