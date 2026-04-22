'use client';
/**
 * Overlay Atom Component
 *
 * A fixed backdrop for modals and drawers.
 */
import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export interface OverlayProps {
  isVisible?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  blur?: boolean;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: EventKey;
}

export const Overlay: React.FC<OverlayProps> = ({
  isVisible = true,
  onClick,
  className,
  blur = false,
  action,
}) => {
  const eventBus = useEventBus();

  if (!isVisible) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (action) {
      eventBus.emit(`UI:${action}`, {});
    }
    onClick?.(e);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-40",
        blur && "backdrop-blur-sm",
        className,
      )}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(action || onClick) ? handleClick : undefined}
      aria-hidden="true"
    />
  );
};

export default Overlay;
