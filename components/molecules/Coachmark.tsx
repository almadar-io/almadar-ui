'use client';
/**
 * Coachmark Molecule
 *
 * A controlled, externally-anchored popover for onboarding hints. Unlike
 * Popover (uncontrolled, wraps its own trigger), a Coachmark is driven by
 * `open` and points at an element it does not own — a tab button, the persona
 * menu, a canvas node — resolved from a ref, a CSS selector, or a DOMRect.
 * Portals to document.body so it escapes the canvas/preview transform contexts.
 */
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Box } from "../atoms/Box";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { cn } from "../../lib/cn";

export type CoachmarkPlacement = "top" | "bottom" | "left" | "right";
export type CoachmarkAnchor =
  | React.RefObject<HTMLElement | null>
  | string
  | DOMRect;

export interface CoachmarkProps {
  /** Controlled visibility. */
  open: boolean;
  /** The element to point at: a ref, a CSS selector, or a DOMRect. */
  anchor: CoachmarkAnchor;
  /** Side of the anchor to render on. @default 'bottom' */
  placement?: CoachmarkPlacement;
  title?: string;
  children: React.ReactNode;
  /** Close (X) handler — always rendered. */
  onDismiss: () => void;
  /** Optional filled primary action (e.g. Next / Got it). */
  onPrimary?: () => void;
  primaryLabel?: string;
  /** Optional ghost secondary action (e.g. Skip). */
  onSecondary?: () => void;
  secondaryLabel?: string;
  /** Render a pulsing beacon dot over the anchor (keystone hints). */
  showBeacon?: boolean;
  className?: string;
}

const GAP = 10;
const EDGE = 8;

function resolveAnchorRect(anchor: CoachmarkAnchor): DOMRect | null {
  if (typeof anchor === "string") {
    return document.querySelector(anchor)?.getBoundingClientRect() ?? null;
  }
  if (anchor instanceof DOMRect) return anchor;
  return anchor?.current?.getBoundingClientRect() ?? null;
}

/**
 * Tracks the live bounding rect of an anchor while `active`. Re-reads on
 * scroll/resize, and polls a few frames so a selector that mounts just after
 * activation (a freshly-revealed tab) still resolves.
 */
export function useAnchorRect(
  anchor: CoachmarkAnchor,
  active: boolean,
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const read = useCallback(() => resolveAnchorRect(anchor), [anchor]);

  useEffect(() => {
    if (!active || typeof document === "undefined") {
      setRect(null);
      return;
    }
    const update = (): void => setRect(read());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    let raf = 0;
    let tries = 0;
    const poll = (): void => {
      const found = read();
      if (found) {
        setRect(found);
      } else if (tries++ < 40) {
        raf = requestAnimationFrame(poll);
      }
    };
    if (!read()) raf = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, read]);

  return rect;
}

function placeCard(
  placement: CoachmarkPlacement,
  rect: DOMRect,
  size: { w: number; h: number },
): { top: number; left: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  let top = 0;
  let left = 0;
  switch (placement) {
    case "top":
      top = rect.top - size.h - GAP;
      left = rect.left + rect.width / 2 - size.w / 2;
      break;
    case "left":
      left = rect.left - size.w - GAP;
      top = rect.top + rect.height / 2 - size.h / 2;
      break;
    case "right":
      left = rect.right + GAP;
      top = rect.top + rect.height / 2 - size.h / 2;
      break;
    case "bottom":
    default:
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - size.w / 2;
      break;
  }
  left = Math.max(EDGE, Math.min(left, vw - size.w - EDGE));
  top = Math.max(EDGE, Math.min(top, vh - size.h - EDGE));
  return { top, left };
}

export const Coachmark: React.FC<CoachmarkProps> = ({
  open,
  anchor,
  placement = "bottom",
  title,
  children,
  onDismiss,
  onPrimary,
  primaryLabel,
  onSecondary,
  secondaryLabel,
  showBeacon = false,
  className,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rect = useAnchorRect(anchor, open);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !rect || !cardRef.current) {
      setPos(null);
      return;
    }
    const size = {
      w: cardRef.current.offsetWidth,
      h: cardRef.current.offsetHeight,
    };
    setPos(placeCard(placement, rect, size));
  }, [open, rect, placement, children, title]);

  if (!open || !rect || typeof document === "undefined") return null;

  const hasFooter = Boolean(onPrimary || onSecondary);

  const card = (
    <Box
      ref={cardRef}
      bg="surface"
      border
      rounded="lg"
      shadow="xl"
      padding="md"
      role="dialog"
      aria-label={title}
      className={cn(
        "fixed z-50 max-w-xs w-72 transition-opacity duration-150",
        pos ? "opacity-100" : "opacity-0",
        className,
      )}
      style={pos ? { top: pos.top, left: pos.left } : { top: -9999, left: -9999 }}
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        <Icon name="close" size="xs" />
      </button>

      {title && (
        <Typography variant="body1" weight="semibold" className="pr-6 mb-1">
          {title}
        </Typography>
      )}

      <Typography variant="body2" color="muted" as="div">
        {children}
      </Typography>

      {hasFooter && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {onSecondary && (
            <Button variant="ghost" size="sm" onClick={onSecondary}>
              {secondaryLabel ?? "Skip"}
            </Button>
          )}
          {onPrimary && (
            <Button variant="primary" size="sm" onClick={onPrimary}>
              {primaryLabel ?? "Got it"}
            </Button>
          )}
        </div>
      )}
    </Box>
  );

  const beacon = showBeacon ? (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: rect.top + rect.height / 2 - 6,
        left: rect.left + rect.width / 2 - 6,
      }}
      aria-hidden="true"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--color-primary)]" />
      </span>
    </div>
  ) : null;

  return createPortal(
    <>
      {beacon}
      {card}
    </>,
    document.body,
  );
};

Coachmark.displayName = "Coachmark";
