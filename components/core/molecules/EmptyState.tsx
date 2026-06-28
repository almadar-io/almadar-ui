'use client';
import React from "react";
import type { EventEmit } from "@almadar/core";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Button } from "../atoms/index";
import { Box } from "../atoms/Box";
import { Icon as IconAtom } from "../atoms/Icon";
import type { IconInput } from "../atoms/index";
import { VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";

/**
 * String aliases for canonical kebab-case icon names.
 * The Icon atom resolves canonical names directly; this map only handles
 * non-canonical aliases used in schema patterns.
 */
const ICON_NAME_ALIASES: Record<string, string> = {
  check: "check-circle",
  error: "x-circle",
  warning: "alert-circle",
};

export type EmptyStateLook = "illustrated" | "icon-only" | "text-only" | "mascot";

const lookStyles: Record<EmptyStateLook, string> = {
  "icon-only": "",
  illustrated: "[&_svg]:w-32 [&_svg]:h-32",
  "text-only": "[&_svg]:hidden",
  mascot: "[&_svg]:w-24 [&_svg]:h-24 [&_svg]:rounded-pill",
};

export interface EmptyStateProps {
  /**
   * Icon to display. Accepts either:
   * - A Lucide icon component (LucideIcon)
   * - A string icon name (e.g., "check-circle", "x-circle")
   */
  icon?: IconInput;
  /** Primary text to display - use title or message (message is alias for backwards compat) */
  title?: string;
  /** Alias for title - used by schema patterns */
  message?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  /** Destructive styling for confirmation dialogs */
  destructive?: boolean;
  /** Variant for color styling */
  variant?: "default" | "success" | "error" | "warning" | "info";
  /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
  actionEvent?: EventEmit<Record<string, never>>;
  /** Layer 2 visual treatment — orthogonal to the semantic variant (which carries status color). */
  look?: EmptyStateLook;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
  className,
  destructive,
  variant,
  actionEvent,
  look = "icon-only",
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const handleAction = () => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, {});
    onAction?.();
  };
  // Resolve icon - supports both LucideIcon component and string name.
  // Strings go through the Icon atom's family-aware resolver via `name`;
  // component refs bypass via `icon` (intentional — locks the icon to
  // the family the caller chose).
  const iconName: string | undefined =
    typeof icon === "string" ? (ICON_NAME_ALIASES[icon] ?? icon) : undefined;
  const iconComponent: LucideIcon | undefined =
    typeof icon === "function" ? icon : undefined;
  const hasIcon = Boolean(iconName || iconComponent);

  // Determine color scheme based on variant or destructive flag
  const isDestructive = destructive || variant === "error";
  const isSuccess = variant === "success";

  // Support both title and message (message is alias for title)
  const displayText = title || message || t('empty.noItems');
  return (
    <VStack
      align="center"
      className={cn(
        "justify-center py-12 text-center",
        lookStyles[look],
        className,
      )}
    >
      {hasIcon && (
        <Box
          className={cn(
            "mb-4 rounded-full p-3",
            isDestructive
              ? "bg-error/10"
              : isSuccess
                ? "bg-success/10"
                : "bg-muted",
          )}
        >
          <IconAtom
            {...(iconName ? { name: iconName } : { icon: iconComponent })}
            className={cn(
              "h-8 w-8",
              isDestructive
                ? "text-error"
                : isSuccess
                  ? "text-success"
                  : "text-muted-foreground",
            )}
          />
        </Box>
      )}
      <Typography
        variant="h3"
        className={cn(
          "text-lg font-medium",
          isDestructive
            ? "text-error"
            : isSuccess
              ? "text-success"
              : "text-foreground",
        )}
      >
        {displayText}
      </Typography>
      {description && (
        <Typography variant="small" className="mt-1 text-muted-foreground max-w-sm">
          {description}
        </Typography>
      )}
      {actionLabel && (onAction || actionEvent) && (
        <Button
          className="mt-4"
          variant={isDestructive ? "danger" : "primary"}
          onClick={handleAction}
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
};

EmptyState.displayName = "EmptyState";
