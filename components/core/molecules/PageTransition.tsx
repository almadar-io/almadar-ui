'use client';
/**
 * PageTransition Molecule — animates routed content on navigation.
 *
 * Keyed by `locationKey` (the consumer passes `useLocation().pathname`), so a
 * route change remounts the subtree and re-runs the enter animation. The motion
 * shape is the `--motion-page-*` token (default translateY(8px) + fade); a theme
 * can make it a pure cross-fade, a larger slide, or instant via `--motion-enable`.
 *
 * Router-agnostic on purpose: `@almadar/ui` does not depend on any router. The
 * consumer supplies the key:
 *
 *     <PageTransition locationKey={location.pathname}><Routes location={location} /></PageTransition>
 *
 * @packageDocumentation
 */

import React from "react";
import { cn } from "../../../lib/cn";

export interface PageTransitionProps {
  /** Value that changes on navigation (e.g. `location.pathname`). */
  locationKey: string;
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ locationKey, children, className }) => (
  <div key={locationKey} className={cn("animate-page-in", className)}>
    {children}
  </div>
);

PageTransition.displayName = "PageTransition";
