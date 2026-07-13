'use client';
import React from "react";
import type { Asset, EventKey, EventPayload } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { Loader2, type LucideIcon } from "lucide-react";
import { useEventBus } from "../../../hooks/useEventBus";
import { Icon, type IconInput } from "./Icon";
import { AtlasImage } from "./AtlasImage";

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
  /** Additional CSS classes applied to the root element. */
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Left icon: a Lucide component or a canonical icon name string (e.g. "plus", "trash"). */
  leftIcon?: IconInput;
  /** Right icon: a Lucide component or a canonical icon name string. */
  rightIcon?: IconInput;
  /** Alias for leftIcon */
  icon?: IconInput;
  /** Alias for rightIcon */
  iconRight?: IconInput;
  /** Asset image rendered as the leading icon; takes precedence over icon/leftIcon when provided. */
  iconAsset?: Asset;
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: EventKey;
  /** Payload to include with the action event */
  actionPayload?: EventPayload;
  /** Button label text (alternative to children for schema-driven rendering) */
  label?: string;
  /** Disable the button (greys out, blocks click events) */
  disabled?: boolean;
  /** Test identifier for automated tests */
  'data-testid'?: string;
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
  sm: "h-button-sm px-3 text-sm",
  md: "h-button-md px-4 text-sm",
  lg: "h-button-lg px-6 text-base",
};

const iconSizeStyles = {
  sm: "h-icon-default w-icon-default",
  md: "h-icon-default w-icon-default",
  lg: "h-icon-default w-icon-default",
};

type IconLike = React.ComponentType<{ className?: string }>;

function isIconLike(v: object): v is IconLike {
  return typeof (v as { render?: (...args: never[]) => React.ReactNode }).render === 'function';
}

/** Resolve an icon prop that can be a string name, LucideIcon component, or ReactNode */
function resolveIconProp(
  value: React.ReactNode | LucideIcon | string | undefined,
  sizeClass: string,
): React.ReactNode | null {
  if (!value) return null;
  if (typeof value === 'string') {
    // String name routes through <Icon> so it picks up the active icon family.
    return <Icon name={value} className={sizeClass} />;
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
  if (typeof value === 'object' && value !== null && isIconLike(value)) {
    const IconComp = value;
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
      iconAsset,
      action,
      actionPayload,
      label,
      children,
      onClick,
      'data-testid': dataTestId,
      ...props
    },
    ref,
  ) => {
    const eventBus = useEventBus();

    // Merge icon/leftIcon and iconRight/rightIcon (icon and iconRight are aliases)
    const leftIconValue = leftIcon || iconProp;
    const rightIconValue = rightIcon || iconRightProp;

    const px = size === 'sm' ? 16 : size === 'lg' ? 20 : 16;
    const resolvedLeftIcon = iconAsset?.url
      ? <AtlasImage asset={iconAsset} size={px} alt={iconAsset.name ?? iconAsset.category ?? ''} className="flex-shrink-0" />
      : resolveIconProp(leftIconValue, iconSizeStyles[size]);
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
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
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
        data-testid={dataTestId ?? (action ? `action-${action}` : undefined)}
      >
        {isLoading ? (
          <Loader2 className="h-icon-default w-icon-default animate-spin" />
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
