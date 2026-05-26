import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Icon } from "./Icon";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "neutral";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Numeric count or amount to display in badge */
  amount?: number;
  /** Badge label text (alternative to children for schema-driven rendering).
   *  Numeric values are auto-coerced to string for rendering — common case
   *  is unread counts, error counts, status codes, etc. */
  label?: string | number;
  /** Icon name (Lucide icon string) or React node */
  icon?: React.ReactNode;
  /** When set, renders a small X button on the right of the badge that
   *  invokes this handler — turns the badge into a removable chip.
   *  Used by the TagInput molecule and other "list of removable values"
   *  surfaces. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to "Remove". */
  removeLabel?: string;
}

// Using CSS variables for theme-aware styling
const variantStyles: Record<BadgeVariant, string> = {
  default: [
    "bg-muted text-foreground",
    "border-[length:var(--border-width-thin)] border-border",
  ].join(" "),
  primary: "bg-primary text-primary-foreground",
  secondary:
    "bg-secondary text-secondary-foreground",
  success: [
    "bg-surface text-success",
    "border-[length:var(--border-width)] border-success",
  ].join(" "),
  warning: [
    "bg-surface text-warning",
    "border-[length:var(--border-width)] border-warning",
  ].join(" "),
  danger: [
    "bg-surface text-error",
    "border-[length:var(--border-width)] border-error",
  ].join(" "),
  error: [
    "bg-surface text-error",
    "border-[length:var(--border-width)] border-error",
  ].join(" "),
  info: [
    "bg-surface text-info",
    "border-[length:var(--border-width)] border-info",
  ].join(" "),
  neutral: [
    "bg-muted text-muted-foreground",
    "border-[length:var(--border-width-thin)] border-border",
  ].join(" "),
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", amount, label, icon, children, onRemove, removeLabel, ...props }, ref) => {
    const iconSizes: Record<BadgeSize, string> = {
      sm: "h-icon-default w-icon-default",
      md: "h-icon-default w-icon-default",
      lg: "h-icon-default w-icon-default",
    };
    const resolvedIcon = typeof icon === "string"
      ? <Icon name={icon} className={iconSizes[size]} />
      : icon;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-bold rounded-sm",
          variantStyles[variant],
          sizeStyles[size],
          onRemove && "pr-1",
          className,
        )}
        {...props}
      >
        {resolvedIcon}
        {children || (amount != null ? `${label ? `${label} ` : ''}${amount}` : label)}
        {onRemove ? (
          <button
            type="button"
            aria-label={removeLabel ?? "Remove"}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-sm",
              "hover:bg-foreground/10 focus:outline-none focus:ring-1 focus:ring-ring",
              "transition-colors",
              size === "sm" ? "w-4 h-4 ml-0.5" : size === "md" ? "w-5 h-5 ml-1" : "w-6 h-6 ml-1",
            )}
          >
            <X className={iconSizes[size]} />
          </button>
        ) : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";
