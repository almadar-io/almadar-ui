'use client';
import React from "react";
import type { EventKey, EventPayload } from "@almadar/core";
import { cn } from "../../lib/cn";
import { Loader2, type LucideIcon } from "lucide-react";
import { useEventBus } from "../../hooks/useEventBus";
import { resolveIcon } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "warning"
  | "default";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Left icon as ReactNode, Lucide component, or string name (e.g. "plus", "trash") */
  leftIcon?: React.ReactNode | LucideIcon | string;
  /** Right icon as ReactNode, Lucide component, or string name */
  rightIcon?: React.ReactNode | LucideIcon | string;
  /** Alias for leftIcon */
  icon?: React.ReactNode | LucideIcon | string;
  /** Alias for rightIcon */
  iconRight?: React.ReactNode | LucideIcon | string;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: EventKey;
  /** Payload to include with the action event */
  actionPayload?: EventPayload;
  /** Button label text (alternative to children for schema-driven rendering) */
  label?: string;
}

// Using CSS variables for theme-aware styling with hover/active effects
const variantStyles = {
  primary: [
    "bg-primary text-primary-foreground",
    "border-none",
    "shadow-sm",
    "hover:bg-primary-hover hover:shadow-lg",
    "active:scale-[var(--active-scale)] active:shadow-sm",
  ].join(" "),
  secondary: [
    "bg-transparent text-accent",
    "border border-accent",
    "hover:bg-accent hover:text-white hover:border-accent",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
  ghost: [
    "bg-transparent text-muted-foreground",
    "border border-transparent",
    "hover:text-primary-foreground hover:bg-primary hover:border-primary",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
  danger: [
    "bg-surface text-error",
    "border-[length:var(--border-width)] border-error",
    "shadow-sm",
    "hover:bg-error hover:text-error-foreground hover:shadow-lg",
    "active:scale-[var(--active-scale)] active:shadow-sm",
  ].join(" "),
  success: [
    "bg-surface text-success",
    "border-[length:var(--border-width)] border-success",
    "shadow-sm",
    "hover:bg-success hover:text-success-foreground hover:shadow-lg",
    "active:scale-[var(--active-scale)] active:shadow-sm",
  ].join(" "),
  warning: [
    "bg-surface text-warning",
    "border-[length:var(--border-width)] border-warning",
    "shadow-sm",
    "hover:bg-warning hover:text-warning-foreground hover:shadow-lg",
    "active:scale-[var(--active-scale)] active:shadow-sm",
  ].join(" "),
  // "default" is an alias for secondary
  default: [
    "bg-secondary text-secondary-foreground",
    "border-[length:var(--border-width-thin)] border-border",
    "hover:bg-secondary-hover",
    "active:scale-[var(--active-scale)]",
  ].join(" "),
} as Record<string, string>;

// Alias "destructive" to "danger" for schema/compiler compatibility
variantStyles.destructive = variantStyles.danger;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const iconSizeStyles = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/** Resolve an icon prop that can be a string name, LucideIcon component, or ReactNode */
function resolveIconProp(
  value: React.ReactNode | LucideIcon | string | undefined,
  sizeClass: string,
): React.ReactNode | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const Resolved = resolveIcon(value);
    return Resolved ? <Resolved className={sizeClass} /> : null;
  }
  if (typeof value === 'function') {
    const IconComp = value as LucideIcon;
    return <IconComp className={sizeClass} />;
  }
  // Already a rendered React element (e.g., <Plus className="w-4 h-4" />)
  if (React.isValidElement(value)) {
    return value;
  }
  // Handle React.forwardRef components (e.g., Lucide icons passed as component references)
  if (typeof value === 'object' && value !== null && 'render' in (value as unknown as Record<string, unknown>)) {
    const IconComp = value as unknown as LucideIcon;
    return <IconComp className={sizeClass} />;
  }
  // Fallback: treat as ReactNode
  return value;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      icon: iconProp,
      iconRight: iconRightProp,
      action,
      actionPayload,
      label,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const eventBus = useEventBus();

    // Merge icon/leftIcon and iconRight/rightIcon (icon and iconRight are aliases)
    const leftIconValue = leftIcon || iconProp;
    const rightIconValue = rightIcon || iconRightProp;

    const resolvedLeftIcon = resolveIconProp(leftIconValue, iconSizeStyles[size]);
    const resolvedRightIcon = resolveIconProp(rightIconValue, iconSizeStyles[size]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (action) {
        eventBus.emit(`UI:${action}`, actionPayload ?? {});
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-[var(--font-weight-medium)]",
          "rounded-sm",
          "cursor-pointer",
          "transition-all duration-[var(--transition-normal)]",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-ring focus:ring-offset-[length:var(--focus-ring-offset)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        onClick={handleClick}
        {...props}
        data-testid={(props as Record<string, unknown>)['data-testid'] as string ?? (action ? `action-${action}` : undefined)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          resolvedLeftIcon && (
            <span className="flex-shrink-0">{resolvedLeftIcon}</span>
          )
        )}
        {children || label}
        {resolvedRightIcon && !isLoading && (
          <span className="flex-shrink-0">{resolvedRightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
