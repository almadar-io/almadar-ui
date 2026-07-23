/**
 * Typography Atom Component
 *
 * Text elements following the KFlow design system with theme-aware styling.
 */

import React from "react";
import { cn } from "../../../lib/cn";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "heading"
  | "subheading"
  | "body1"
  | "body2"
  | "body"
  | "caption"
  | "overline"
  | "small"
  | "large"
  | "label";

/** `none` = no size override — the variant's baked size applies. */
export type TypographySize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface TypographyProps {
  /** Typography variant */
  variant?: TypographyVariant;
  /** Heading level (1-6) - alternative to variant for headings */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Text color */
  color?:
  | "primary"
  | "secondary"
  | "muted"
  | "error"
  | "success"
  | "warning"
  | "inherit";
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Font weight override — `none` = no override, the variant's baked weight applies */
  weight?: "none" | "light" | "normal" | "medium" | "semibold" | "bold";
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

// Using CSS variables for theme-aware styling
const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold tracking-tight text-foreground",
  h2: "text-3xl font-bold tracking-tight text-foreground",
  h3: "text-2xl font-bold text-foreground",
  h4: "text-xl font-bold text-foreground",
  h5: "text-lg font-bold text-foreground",
  h6: "text-base font-bold text-foreground",
  heading: "text-2xl font-bold text-foreground",
  subheading: "text-lg font-semibold text-foreground",
  body1: "text-base font-normal text-foreground",
  body2: "text-sm font-normal text-foreground",
  body: "text-base font-normal text-foreground",
  caption: "text-xs font-normal text-muted-foreground",
  overline:
    "text-xs uppercase tracking-wide font-bold text-muted-foreground",
  small: "text-sm font-normal text-foreground",
  large: "text-lg font-medium text-foreground",
  label: "text-sm font-medium text-foreground",
};

const colorStyles = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  muted: "text-muted-foreground",
  error: "text-error",
  success: "text-success",
  warning: "text-warning",
  inherit: "text-inherit",
};

const weightStyles = {
  // Neutral: an atom default of "none" must not override the variant's baked
  // weight (C-PATTERN-ENUM-BLOCKS-NEUTRAL-OVERRIDE — `variant={h2}` rendered
  // tiny because the ui-typography atom's `weight: light`/`size: xs` defaults
  // clobbered every variant).
  none: "",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const defaultElements: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> =
{
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  heading: "h2",
  subheading: "h3",
  body1: "p",
  body2: "p",
  body: "p",
  caption: "span",
  overline: "span",
  small: "span",
  large: "p",
  label: "span",
};

const typographySizeStyles: Record<TypographySize, string> = {
  none: "",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const overflowStyles: Record<string, string> = {
  visible: "overflow-visible",
  hidden: "overflow-hidden",
  wrap: "break-words overflow-hidden",
  "clamp-2": "overflow-hidden line-clamp-2",
  "clamp-3": "overflow-hidden line-clamp-3",
};

export const Typography: React.FC<TypographyProps> = ({
  variant: variantProp,
  level,
  color = "primary",
  align,
  weight,
  size,
  truncate = false,
  overflow,
  as,
  id,
  className,
  style,
  content,
  children,
}) => {
  // Determine variant: explicit variant takes precedence, then level, then default
  const variant: TypographyVariant =
    variantProp ?? (level ? (`h${level}` as TypographyVariant) : "body1");
  const Component = as || defaultElements[variant];

  return React.createElement(
    Component,
    {
      id,
      className: cn(
        variantStyles[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        size && typographySizeStyles[size],
        align && `text-${align}`,
        truncate && "truncate overflow-hidden text-ellipsis",
        overflow && overflowStyles[overflow],
        className,
      ),
      style,
    },
    children ?? content,
  );
};

Typography.displayName = "Typography";
