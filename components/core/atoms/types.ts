/**
 * Cross-cutting atom-level prop shapes shared across the design system.
 */

import type { AssetUrl } from "@almadar/core";

/**
 * Canonical semantic color palette.  Values are the Tailwind / CSS-var token
 * names that every component in the design system understands.  Prefer this
 * over a bare `string` for any `color` or `variant` prop.
 */
export type ColorToken =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'muted';

/**
 * Concrete error-state shape read by display components (`error.message`,
 * occasionally `error.stack`). Structurally assignable from the global `Error`,
 * so existing call sites passing an `Error` keep working — this just gives the
 * pattern extractor a readable field schema instead of the opaque `Error` global.
 */
export type UiError = {
  message: string;
  name?: string;
  code?: string;
  stack?: string;
};

/**
 * A labelled link/CTA used by marketing molecules (HeroSection, CTABanner,
 * PricingCard) for their primary/secondary call-to-action props.
 */
export type LinkAction = {
  label: string;
  href: string;
};

/** An image with its required alt text. */
export type ImageSource = {
  src: AssetUrl;
  alt: string;
};

/** A 2D point in canvas/layout coordinates. */
export type Point = {
  x: number;
  y: number;
};

/** A 2D rectangle in canvas coordinates (`w`/`h` = width/height). */
export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};
