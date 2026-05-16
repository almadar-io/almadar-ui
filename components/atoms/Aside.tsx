/**
 * Aside Atom Component
 *
 * Semantic wrapper for the native `<aside>` landmark. Owns raw HTML so
 * molecules (SidePanel, navigation rails, callouts) can compose the
 * semantic-aside primitive without falling back to a raw element.
 */

import React from "react";
import { cn } from "../../lib/cn";

export interface AsideProps extends React.HTMLAttributes<HTMLElement> {
  /** Additional CSS classes */
  className?: string;
  /** Aside contents */
  children?: React.ReactNode;
}

export const Aside = React.forwardRef<HTMLElement, AsideProps>(
  ({ className, children, ...rest }, ref) => (
    <aside ref={ref} className={cn(className)} {...rest}>
      {children}
    </aside>
  ),
);

Aside.displayName = "Aside";
