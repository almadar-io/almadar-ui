'use client';
/**
 * Modal Molecule Component
 *
 * A modal dialog component with overlay, header, content, and footer.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EventEmit } from "@almadar/core";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Dialog } from "../atoms/Dialog";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Layer 2 visual treatment for the modal pattern — orthogonal to the semantic
 * `size` (which conveys content scale).
 */
export type ModalLook =
  | "centered-card"
  | "top-sheet"
  | "side-drawer"
  | "full-screen";

export interface ModalProps {
  /** Whether the modal is open (defaults to true when rendered by slot wrapper) */
  isOpen?: boolean;
  /** Callback when modal should close (injected by slot wrapper) */
  onClose?: () => void;
  title?: string;
  /** Modal content (can be empty if using slot content) */
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  /** Declarative close event — emits UI:{closeEvent} via eventBus when modal should close */
  closeEvent?: EventEmit<Record<string, never>>;
  /** Enable swipe-down-to-close on mobile bottom sheet (default: true) */
  swipeDownToClose?: boolean;
  /** Layer 2 visual treatment — orthogonal to the semantic variant. */
  look?: ModalLook;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-full mx-4",
};

// `minWidthClasses` floors the dialog above mobile. On phones (`max-sm:`)
// the floor drops to 0 so the full-screen variant shrinks to viewport
// width without the hardcoded 400/520/600/700 fighting it. Kept as
// Tailwind classes (not inline style) so media-query overrides can win.
const minWidthClasses: Record<ModalSize, string> = {
  sm: "min-w-[400px] max-sm:min-w-0",
  md: "min-w-[520px] max-sm:min-w-0",
  lg: "min-w-[600px] max-sm:min-w-0",
  xl: "min-w-[700px] max-sm:min-w-0",
  full: "min-w-0",
};

// Layer 2 look styles — applied AFTER sizeClasses/minWidthClasses so they
// override positioning, radius, and width caps. Empty string for
// `centered-card` since the default already produces that treatment. Each
// non-default look is a delta on the baseline.
const lookStyles: Record<ModalLook, string> = {
  "centered-card": "",
  "top-sheet": "top-0 rounded-t-none rounded-b-container max-w-full w-full",
  "side-drawer":
    "right-0 top-0 bottom-0 h-full rounded-l-container rounded-r-none w-[400px] max-w-full",
  "full-screen": "inset-0 rounded-none w-full h-full max-w-full",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  onClose = () => {},
  title,
  children = null,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  closeEvent,
  swipeDownToClose = true,
  look = "centered-card",
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const modalRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);
  // Close transition: keep the dialog mounted while the exit animation runs.
  const [closing, setClosing] = useState(false);
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) setClosing(true);
    wasOpenRef.current = isOpen;
  }, [isOpen]);
  const handleAnimEnd = (e: React.AnimationEvent) => {
    if (closing && e.target === e.currentTarget) setClosing(false);
  };

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, closeEvent, eventBus]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;
  const renderOpen = isOpen || closing;
  if (!renderOpen) return null;
  const dialogAnim = closing ? "animate-modal-out" : "animate-modal-in";
  const overlayAnim = closing ? "animate-overlay-out" : "animate-overlay-in";

  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Portal to <body> so the dialog escapes any ancestor stacking/overflow
  // context (sticky sidebars, transformed panes) and overlays the whole app.
  // Single div is both the dark backdrop AND the flex-centering container —
  // two sibling `fixed inset-0` layers cause a ghost compositor artifact.
  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[1000]",
        "flex items-start justify-center px-4 pb-4 pt-[10vh]",
        "max-sm:items-stretch max-sm:p-0 max-sm:pt-0",
        overlayAnim,
      )}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
        <Dialog
          ref={modalRef}
          open
          className={cn(
            // Reset browser-default dialog chrome — we own styling. `static`
            // overrides the user-agent `position: absolute` so the parent
            // flex container's `justify-center` actually centers the dialog
            // (without this, the dialog drops out of flex flow and `m-0`
            // kills the user-agent's `margin: auto` centering, pinning the
            // dialog to top-left).
            "static m-0 p-0 border-0 bg-transparent",
            // Pre-existing dialog frame
            "pointer-events-auto w-full flex flex-col bg-surface border shadow-elevation-dialog rounded-container",
            // Desktop sizing + viewport-aware floor.
            sizeClasses[size],
            minWidthClasses[size],
            "max-h-[80vh]",
            // Mobile: take the entire screen. Override desktop max-w cap,
            // full height, no rounded corners, no min-width.
            "max-sm:max-w-none max-sm:max-h-none max-sm:w-full max-sm:h-full max-sm:rounded-none",
            lookStyles[look],
            className,
            dialogAnim,
          )}
          onAnimationEnd={handleAnimEnd}
          style={dragY > 0 ? {
            transform: `translateY(${dragY}px)`,
            transition: isDragging.current ? 'none' : 'transform 200ms ease-out',
          } : undefined}
          {...(title && { "aria-labelledby": "modal-title" })}
        >
          {/* Drag handle (mobile bottom sheet) */}
          <Box
            className="hidden max-sm:flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => {
              if (!swipeDownToClose) return;
              dragStartY.current = e.clientY;
              isDragging.current = true;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!isDragging.current) return;
              const dy = Math.max(0, e.clientY - dragStartY.current);
              setDragY(dy);
            }}
            onPointerUp={() => {
              if (!isDragging.current) return;
              isDragging.current = false;
              if (dragY > 100) {
                handleClose();
              }
              setDragY(0);
            }}
            onPointerCancel={() => {
              isDragging.current = false;
              setDragY(0);
            }}
          >
            <Box className="w-10 h-1 rounded-full bg-border" />
          </Box>

          {/* Header */}
          {(title || showCloseButton) && (
            <Box
              className={cn(
                "px-6 py-4 flex items-center justify-between",
                "border-b-[length:var(--border-width)] border-border",
              )}
            >
              {title && (
                <Typography variant="h4" as="h2" id="modal-title">
                  {title}
                </Typography>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="x"
                  onClick={handleClose}
                  data-event="CLOSE"
                  aria-label={t('aria.closeModal')}
                />
              )}
            </Box>
          )}

          {/* Content */}
          <Box className="flex-1 overflow-y-auto p-6">{children}</Box>

          {/* Footer */}
          {footer && (
            <Box
              className={cn(
                "px-6 py-4 bg-muted",
                "border-t-[length:var(--border-width)] border-border",
              )}
            >
              {footer}
            </Box>
          )}
        </Dialog>
    </div>,
    document.body,
  );
};

Modal.displayName = "Modal";
