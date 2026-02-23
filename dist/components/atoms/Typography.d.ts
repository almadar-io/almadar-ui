/**
 * Typography Atom Component
 *
 * Text elements following the KFlow design system with theme-aware styling.
 */
import React from "react";
export type TypographyVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2" | "body" | "caption" | "overline" | "small" | "large" | "label";
export type TypographySize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export interface TypographyProps {
    /** Typography variant */
    variant?: TypographyVariant;
    /** Heading level (1-6) - alternative to variant for headings */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Text color */
    color?: "primary" | "secondary" | "muted" | "error" | "success" | "warning" | "inherit";
    /** Text alignment */
    align?: "left" | "center" | "right";
    /** Font weight override */
    weight?: "light" | "normal" | "medium" | "semibold" | "bold";
    /** Font size override */
    size?: TypographySize;
    /** Truncate with ellipsis (single line) */
    truncate?: boolean;
    /** Overflow handling mode */
    overflow?: "visible" | "hidden" | "wrap" | "clamp-2" | "clamp-3";
    /** Custom HTML element */
    as?: keyof React.JSX.IntrinsicElements;
    /** HTML id attribute */
    id?: string;
    /** Additional class names */
    className?: string;
    /** Inline style */
    style?: React.CSSProperties;
    /** Text content (alternative to children) */
    content?: React.ReactNode;
    /** Children elements */
    children?: React.ReactNode;
}
export declare const Typography: React.FC<TypographyProps>;
/**
 * Heading component - convenience wrapper for Typography heading variants
 */
export interface HeadingProps extends Omit<TypographyProps, "variant"> {
    /** Heading level (1-6) */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Override font size */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}
export declare const Heading: React.FC<HeadingProps>;
/**
 * Text component - convenience wrapper for Typography body/caption variants
 */
export interface TextProps extends Omit<TypographyProps, "level"> {
    /** Text variant */
    variant?: "body" | "body1" | "body2" | "caption" | "small" | "large" | "label" | "overline";
}
export declare const Text: React.FC<TextProps>;
