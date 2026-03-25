import React from "react";
import { cn } from "../../lib/cn";
import { resolveIcon } from "./Icon";

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
  /** Badge label text (alternative to children for schema-driven rendering) */
  label?: string;
  /** Icon name (Lucide icon string) or React node */
  icon?: React.ReactNode;
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
  ({ className, variant = "default", size = "sm", amount, label, icon, children, ...props }, ref) => {
    const iconSizes: Record<BadgeSize, string> = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };
    const resolvedIcon = typeof icon === "string"
      ? (() => { const I = resolveIcon(icon); return I ? <I className={iconSizes[size]} /> : null; })()
      : icon;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-bold rounded-sm",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {resolvedIcon}
        {children || (amount != null ? `${label ? `${label} ` : ''}${amount}` : label)}
      </span>
    );
  },
);

Badge.displayName = "Badge";
