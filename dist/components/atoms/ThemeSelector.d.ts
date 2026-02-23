/**
 * ThemeSelector - Design theme selector component
 *
 * A dropdown/toggle component for switching between design themes.
 *
 * @packageDocumentation
 */
import React from "react";
interface ThemeSelectorProps {
    /** Optional className */
    className?: string;
    /** Show as dropdown or buttons */
    variant?: "dropdown" | "buttons";
    /** Show labels */
    showLabels?: boolean;
}
/**
 * ThemeSelector component for switching design themes
 */
export declare const ThemeSelector: React.FC<ThemeSelectorProps>;
export default ThemeSelector;
