/**
 * ThemeToggle Atom Component
 *
 * A button that toggles between light and dark themes.
 * Uses Sun and Moon icons to indicate current/target theme.
 *
 * @packageDocumentation
 */
import React from "react";
export interface ThemeToggleProps {
    /** Additional CSS classes */
    className?: string;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Show label text */
    showLabel?: boolean;
}
/**
 * ThemeToggle component for switching between light and dark modes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ThemeToggle />
 *
 * // With label
 * <ThemeToggle showLabel />
 *
 * // Custom size
 * <ThemeToggle size="lg" />
 * ```
 */
export declare const ThemeToggle: React.FC<ThemeToggleProps>;
