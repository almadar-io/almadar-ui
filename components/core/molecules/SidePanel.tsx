'use client';
/**
 * SidePanel — fixed side panel for contextual detail on top of the page layout.
 * Distinct from Drawer: Drawer is driven by the UI Slot system (render_ui drawer)
 * and is generic. SidePanel is a direct-render component with its own close event
 * API, used where the panel is always present in the component tree.
 */

import React from "react";
import type { EventEmit } from "@almadar/core";
import { Aside } from "../atoms/Aside";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Typography } from "../atoms/Typography";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";

export interface SidePanelProps {
  /**
   * Panel title
   */
  title: string;

  /**
   * Panel content
   */
  children: React.ReactNode;

  /**
   * Is panel open
   */
  isOpen: boolean;

  /**
   * On close handler
   */
  onClose: () => void;

  /**
   * Panel width as Tailwind class string. Default fills the viewport on
   * mobile and snaps to `w-96` (384 px) at `sm:` and above so phones
   * don't lose content to a fixed 384 px column. Consumers passing a
   * custom value should include a `w-full` mobile fallback in the same
   * string (e.g. `"w-full sm:w-[480px]"`) — Tailwind's JIT can't see
   * dynamically-concatenated class names.
   * @default 'w-full sm:w-96'
   */
  width?: string;

  /**
   * Panel position
   * @default 'right'
   */
  position?: "left" | "right";

  /**
   * Show overlay on mobile
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /** Declarative close event — emits UI:{closeEvent} via eventBus when panel should close */
  closeEvent?: EventEmit<Record<string, never>>;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  children,
  isOpen,
  onClose,
  width = "w-full sm:w-96",
  position = "right",
  showOverlay = true,
  className,
  closeEvent,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const handleClose = () => {
    if (closeEvent) eventBus.emit(`UI:${closeEvent}`, {});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <Box
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Side Panel — fills the viewport on mobile, uses the `width` prop
          (default `w-96`) at `sm:` and above so phones don't lose content
          to a fixed 384 px column. */}
      <Aside
        className={cn(
          "fixed top-16 lg:top-0 bottom-0 z-[60]",
          "bg-card",
          "border-l-2 border-border",
          position === "left" && "border-l-0 border-r-2",
          "flex flex-col",
          "transition-transform duration-normal ease-standard",
          width,
          position === "right" ? "right-0" : "left-0",
          className,
        )}
      >
        {/* Header */}
        <Box className="flex items-center justify-between p-4 border-b-2 border-border sticky top-0 bg-card z-10">
          <Typography variant="h6">{title}</Typography>
          <Button
            variant="ghost"
            size="sm"
            icon="x"
            onClick={handleClose}
            aria-label={t('aria.closePanel')}
          >
            <Typography variant="small" as="span" className="sr-only">{t('aria.closePanel')}</Typography>
          </Button>
        </Box>

        {/* Content */}
        <Box className="p-4 flex-1 overflow-y-auto">{children}</Box>
      </Aside>
    </>
  );
};

SidePanel.displayName = "SidePanel";