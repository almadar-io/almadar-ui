'use client';
/**
 * Modal Molecule Component
 *
 * A modal dialog component with overlay, header, content, and footer.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useEffect, useRef, useState } from "react";
import type { EventEmit } from "@almadar/core";
import { X } from "lucide-react";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Dialog } from "../atoms/Dialog";
import { Typography } from "../atoms/Typography";
import { Overlay } from "../atoms/Overlay";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

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
}) => {
  const eventBus = useEventBus();
  const modalRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

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

  if (!isOpen) return null;

  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <Overlay
        isVisible={isOpen}
        onClick={handleOverlayClick}
        className="z-40"
      />

      {/* Desktop: dialog positioned in upper third. Mobile (<640px):
          classic full-screen modal — fills the viewport, no rounding, no
          top inset. */}
      <Box
        className={cn(
          "fixed inset-0 z-50 pointer-events-none",
          "flex items-start justify-center px-4 pb-4 pt-[10vh]",
          "max-sm:items-stretch max-sm:p-0 max-sm:pt-0",
        )}
      >
        <Dialog
          ref={modalRef}
          open
          className={cn(
            // Reset browser-default dialog chrome — we own styling.
            "m-0 p-0 border-0 bg-transparent",
            // Pre-existing dialog frame
            "pointer-events-auto w-full flex flex-col bg-surface border shadow-elevation-dialog rounded-container",
            // Desktop sizing + viewport-aware floor.
            sizeClasses[size],
            minWidthClasses[size],
            "max-h-[80vh]",
            // Mobile: take the entire screen. Override desktop max-w cap,
            // full height, no rounded corners, no min-width.
            "max-sm:max-w-none max-sm:max-h-none max-sm:w-full max-sm:h-full max-sm:rounded-none",
            className,
          )}
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
                  icon={X}
                  onClick={handleClose}
                  data-event="CLOSE"
                  aria-label="Close modal"
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
      </Box>
    </>
  );
};

Modal.displayName = "Modal";
