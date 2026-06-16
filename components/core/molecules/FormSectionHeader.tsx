/**
 * FormSectionHeader
 *
 * Header component for collapsible form sections.
 * Provides consistent styling and interaction for section headers.
 */

import React from "react";
import { cn } from "../../../lib/cn";
import { Box } from "../atoms/Box";
import { HStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { Icon } from "../atoms/Icon";

export interface FormSectionHeaderProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Whether section is collapsed */
  isCollapsed?: boolean;
  /** Toggle collapse handler (makes header clickable) */
  onToggle?: () => void;
  /** Badge text (e.g., "3 fields", "Required", "Complete") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
  /** Icon name to show before title */
  icon?: string;
  /** Whether section has validation errors */
  hasErrors?: boolean;
  /** Whether section is complete */
  isComplete?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  title,
  subtitle,
  isCollapsed = false,
  onToggle,
  badge,
  badgeVariant = "default",
  icon,
  hasErrors = false,
  isComplete = false,
  className,
}) => {
  const isClickable = !!onToggle;

  // Determine effective badge variant based on state
  const effectiveBadgeVariant = hasErrors
    ? "danger"
    : isComplete
      ? "success"
      : badgeVariant;

  // Determine status icon
  const statusIcon = hasErrors
    ? "alert-circle"
    : isComplete
      ? "check-circle"
      : null;

  return (
    <Box
      className={cn(
        "px-5 py-4 bg-muted/60 rounded-lg",
        "border border-border border-l-4 border-l-primary",
        isClickable &&
          "cursor-pointer hover:bg-muted transition-colors",
        className,
      )}
      onClick={isClickable ? onToggle : undefined}
    >
      <HStack justify="between" align="center">
        <HStack gap="sm" align="center">
          {icon && (
            <Icon
              name={icon}
              size="md"
              className="text-primary shrink-0"
            />
          )}

          {statusIcon && (
            <Icon
              name={statusIcon}
              size="md"
              className={cn(
                "shrink-0",
                hasErrors ? "text-error" : "text-success",
              )}
            />
          )}

          <Box className="space-y-0.5">
            <Typography variant="subheading" weight="semibold" className="text-foreground">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="muted" className="leading-snug">
                {subtitle}
              </Typography>
            )}
          </Box>
        </HStack>

        <HStack gap="sm" align="center">
          {badge && (
            <Badge variant={effectiveBadgeVariant} size="sm">
              {badge}
            </Badge>
          )}

          {isClickable && (
            <Icon
              name="chevron-down"
              size="sm"
              className={cn(
                "text-muted-foreground transition-transform duration-200 shrink-0",
                isCollapsed && "-rotate-90",
              )}
            />
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

FormSectionHeader.displayName = "FormSectionHeader";
