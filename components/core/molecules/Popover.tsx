'use client';
/**
 * Popover Molecule Component
 *
 * A popover component with position variants and click/hover triggers.
 * Uses Button, Typography, and Icon atoms.
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";

export type PopoverPosition = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "click" | "hover";

export interface PopoverProps {
  /**
   * Popover content
   */
  content: React.ReactNode;

  /**
   * Popover trigger element (ReactElement or ReactNode that will be wrapped in span)
   */
  children: React.ReactNode;

  /**
   * Popover position
   * @default 'bottom'
   */
  position?: PopoverPosition;

  /**
   * Trigger type
   * @default 'click'
   */
  trigger?: PopoverTrigger;

  /**
   * Show arrow
   * @default true
   */
  showArrow?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const arrowClasses: Record<PopoverPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent",
};

const VIEWPORT_EDGE_PADDING = 8;
const TRIGGER_GAP = 8;

// Resolve the portaled `fixed` panel to absolute viewport pixel coordinates.
// All offsets (gap, centering) are baked into `left`/`top` here so the panel
// needs no positioning utility classes — those resolve against the viewport on
// a `fixed` element and yank the panel off its trigger.
function computePopoverStyle(
  position: PopoverPosition,
  triggerRect: DOMRect,
  popoverWidth: number,
): React.CSSProperties {
  if (position === "left" || position === "right") {
    return {
      left:
        position === "left"
          ? triggerRect.left - popoverWidth - TRIGGER_GAP
          : triggerRect.right + TRIGGER_GAP,
      top: triggerRect.top + triggerRect.height / 2,
      transform: "translateY(-50%)",
    };
  }
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1024;
  const centered =
    triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
  const maxLeft = viewportWidth - popoverWidth - VIEWPORT_EDGE_PADDING;
  const clamped = Math.max(
    VIEWPORT_EDGE_PADDING,
    Math.min(centered, Math.max(VIEWPORT_EDGE_PADDING, maxLeft)),
  );
  return {
    left: clamped,
    top:
      position === "top"
        ? triggerRect.top - TRIGGER_GAP
        : triggerRect.bottom + TRIGGER_GAP,
    transform: position === "top" ? "translateY(-100%)" : undefined,
  };
}

export const Popover: React.FC<PopoverProps> = ({
  content,
  children,
  position = "bottom",
  trigger = "click",
  showArrow = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [popoverWidth, setPopoverWidth] = useState(0);
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    if (popoverRef.current) {
      setPopoverWidth(popoverRef.current.offsetWidth);
    }
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      setPopoverWidth(0);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && popoverRef.current) {
      const measured = popoverRef.current.offsetWidth;
      if (measured !== popoverWidth) {
        setPopoverWidth(measured);
      }
    }
  });

  useEffect(() => {
    if (trigger !== "click") {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, trigger]);

  const triggerProps =
    trigger === "click"
      ? {
          onClick: handleToggle,
        }
      : {
          onMouseEnter: handleOpen,
          onMouseLeave: handleClose,
        };

  // Wrap non-element children in a span
  const childElement = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  const triggerElement = React.cloneElement(
    childElement as React.ReactElement<any>,
    {
      ref: triggerRef,
      ...triggerProps,
    },
  );

  // Portal the panel to document.body so `position: fixed` resolves
  // against the viewport. Without this, any ancestor with a non-`none`
  // `transform` (ReactFlow's `.react-flow__viewport`, PreviewFrame's
  // `translate3d(0,0,0)` chrome-scoping trick, etc.) becomes the
  // containing block for the fixed panel and shifts it off the trigger.
  const panel = isOpen && triggerRect ? (
    <div
      ref={popoverRef}
      className={cn(
        "fixed z-50 p-4",
        "bg-card border-2 border-border shadow-elevation-popover",
        className,
      )}
      style={{
        ...computePopoverStyle(position, triggerRect, popoverWidth),
        ...(popoverWidth === 0 ? { visibility: 'hidden' as const } : undefined),
      }}
      role="dialog"
      onMouseEnter={trigger === "hover" ? handleOpen : undefined}
      onMouseLeave={trigger === "hover" ? handleClose : undefined}
    >
      {typeof content === "string" ? (
        <Typography variant="body">{content}</Typography>
      ) : (
        content
      )}
      {showArrow && (
        <div
          className={cn(
            "absolute w-0 h-0 border-4",
            arrowClasses[position],
          )}
        />
      )}
    </div>
  ) : null;

  return (
    <>
      {triggerElement}
      {panel && typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : panel}
    </>
  );
};

Popover.displayName = "Popover";
