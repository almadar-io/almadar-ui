/** @deprecated Use ThemeDefinition from ThemeContext */
export type DesignTheme = string;
/**
 * @deprecated Use ThemeProvider from ThemeContext instead
 */
export declare const DesignThemeProvider: import("react").FC<import("./ThemeContext").ThemeProviderProps>;
/**
 * @deprecated Use useTheme from ThemeContext instead
 *
 * This wrapper provides backward compatibility with the old API.
 */
export declare function useDesignTheme(): {
    designTheme: string;
    setDesignTheme: (theme: string) => void;
    availableThemes: string[];
};
declare const _default: {
    DesignThemeProvider: import("react").FC<import("./ThemeContext").ThemeProviderProps>;
    useDesignTheme: typeof useDesignTheme;
};
export default _default;
