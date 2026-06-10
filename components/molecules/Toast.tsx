'use client';
/**
 * Toast Molecule Component
 *
 * A toast notification component with auto-dismiss and action buttons.
 * Uses theme-aware CSS variables for styling.
 */

import React, { useEffect } from "react";
import type { EventEmit } from "@almadar/core";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  /** Toast variant */
  variant?: ToastVariant;
  /** Toast message */
  message: string;
  /** Toast title (optional) */
  title?: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Badge count (optional) */
  badge?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when toast is dismissed */
  dismissEvent?: EventEmit<Record<string, never>>;
  /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
  actionEvent?: EventEmit<Record<string, never>>;
}

// Theme-aware variant styles
const variantClasses: Record<ToastVariant, string> = {
  success:
    "bg-card border-[length:var(--border-width)] border-success",
  error:
    "bg-card border-[length:var(--border-width)] border-error",
  info: "bg-card border-[length:var(--border-width)] border-info",
  warning:
    "bg-card border-[length:var(--border-width)] border-warning",
};

const iconMap: Record<ToastVariant, string> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
  warning: "alert-triangle",
};

const iconColors: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-info",
  warning: "text-warning",
};

export const Toast: React.FC<ToastProps> = ({
  variant = "info",
  message,
  title,
  duration = 5000,
  dismissible = true,
  onDismiss,
  actionLabel,
  onAction,
  badge,
  className,
  dismissEvent,
  actionEvent,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const handleDismiss = () => {
    if (dismissEvent) eventBus.emit(`UI:${dismissEvent}`, {});
    onDismiss?.();
  };

  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  useEffect(() => {
    if (duration <= 0 || (!onDismiss && !dismissEvent)) {
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss, dismissEvent]); // handleDismiss is stable across renders

  return (
    <Box
      className={cn(
        // `min-w-[300px]` only kicks in at `sm:` and above so a phone
        // viewport doesn't get a toast wider than the screen near the
        // edge. `max-w-[calc(100vw-2rem)]` clamps to viewport too.
        "border-l-4 p-4 shadow-elevation-toast min-w-0 sm:min-w-[300px] max-w-md max-w-[calc(100vw-2rem)]",
        "rounded-sm",
        variantClasses[variant],
        className,
      )}
      role="alert"
    >
      <Box className="flex items-start gap-3">
        <Box className="flex-shrink-0 mt-0.5">
          <Icon
            name={iconMap[variant]}
            size="md"
            className={iconColors[variant]}
          />
        </Box>

        <Box className="flex-1 min-w-0">
          {title && (
            <Typography variant="h6" className="mb-1">
              {title}
            </Typography>
          )}
          <Typography variant="small" className="text-sm">
            {message}
          </Typography>

          {actionLabel && (onAction || actionEvent) && (
            <Box className="mt-3">
              <Button variant="ghost" size="sm" onClick={handleAction}>
                {actionLabel}
              </Button>
            </Box>
          )}
        </Box>

        <Box className="flex items-start gap-2 flex-shrink-0">
          {badge !== undefined && (
            <Badge variant="default" size="sm">
              {badge}
            </Badge>
          )}
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              icon="x"
              onClick={handleDismiss}
              aria-label={t('aria.closeToast')}
              className="flex-shrink-0"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

Toast.displayName = "Toast";