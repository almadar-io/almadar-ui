/**
 * Cross-cutting atom-level prop shapes shared across the design system.
 */

/**
 * Concrete error-state shape read by display components (`error.message`,
 * occasionally `error.stack`). Structurally assignable from the global `Error`,
 * so existing call sites passing an `Error` keep working — this just gives the
 * pattern extractor a readable field schema instead of the opaque `Error` global.
 */
export interface UiError {
  message: string;
  name?: string;
  code?: string;
  stack?: string;
}

/**
 * A labelled link/CTA used by marketing molecules (HeroSection, CTABanner,
 * PricingCard) for their primary/secondary call-to-action props.
 */
export interface LinkAction {
  label: string;
  href: string;
}

/** An image with its required alt text. */
export interface ImageSource {
  src: string;
  alt: string;
}

/** A 2D point in canvas/layout coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** A 2D rectangle in canvas coordinates (`w`/`h` = width/height). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
