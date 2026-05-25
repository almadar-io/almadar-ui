import React, { useCallback } from "react";
import type { EventEmit } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { Icon } from "./Icon";

export type FilterPillVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";
export type FilterPillSize = "sm" | "md" | "lg";

export interface FilterPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick"> {
  variant?: FilterPillVariant;
  size?: FilterPillSize;
  /** Pill label text (alternative to children for schema-driven rendering). */
  label?: string | number;
  /** Optional icon name (Lucide icon string) or React node */
  icon?: React.ReactNode;
  /** Called when the user clicks the remove (×) button */
  onRemove?: () => void;
  /** Disable the remove button (renders without × control) */
  removable?: boolean;
  /** Click handler for the body of the pill (filter toggle) */
  onClick?: () => void;
  /** Event name dispatched via event bus when the pill body is clicked. Payload: { label } */
  clickEvent?: EventEmit<{ label: string | number | undefined }>;
  /** Event name dispatched via event bus when the remove (×) button is clicked. Payload: { label } */
  removeEvent?: EventEmit<{ label: string | number | undefined }>;
}

const variantStyles: Record<FilterPillVariant, string> = {
  default: [
    "bg-muted text-foreground",
    "border-[length:var(--border-width-thin)] border-border",
  ].join(" "),
  primary: "bg-primary/10 text-primary border-[length:var(--border-width)] border-primary",
  secondary: "bg-secondary/10 text-secondary-foreground border-[length:var(--border-width)] border-secondary",
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
  info: [
    "bg-surface text-info",
    "border-[length:var(--border-width)] border-info",
  ].join(" "),
  neutral: [
    "bg-muted text-muted-foreground",
    "border-[length:var(--border-width-thin)] border-border",
  ].join(" "),
};

const sizeStyles: Record<FilterPillSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const iconSizes: Record<FilterPillSize, string> = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export const FilterPill = React.forwardRef<HTMLSpanElement, FilterPillProps>(
  (
    {
      className,
      variant = "default",
      size = "sm",
      label,
      icon,
      onRemove,
      removable = true,
      onClick,
      clickEvent,
      removeEvent,
      children,
      ...props
    },
    ref,
  ) => {
    const eventBus = useEventBus();
    const payloadLabel =
      typeof children === "string" || typeof children === "number" ? children : label;

    const handleClick = useCallback(() => {
      onClick?.();
      if (clickEvent) eventBus.emit(`UI:${clickEvent}`, { label: payloadLabel });
    }, [onClick, clickEvent, eventBus, payloadLabel]);

    const handleRemove = useCallback(() => {
      onRemove?.();
      if (removeEvent) eventBus.emit(`UI:${removeEvent}`, { label: payloadLabel });
    }, [onRemove, removeEvent, eventBus, payloadLabel]);

    const resolvedIcon =
      typeof icon === "string"
        ? <Icon name={icon} className={iconSizes[size]} />
        : icon;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-bold rounded-pill",
          variantStyles[variant],
          sizeStyles[size],
          (onClick || clickEvent) && "cursor-pointer",
          className,
        )}
        onClick={onClick || clickEvent ? handleClick : undefined}
        {...props}
      >
        {resolvedIcon}
        <span>{children ?? label}</span>
        {removable && (onRemove || removeEvent) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Remove filter"
            className={cn(
              "ml-0.5 rounded-full hover:bg-foreground/10 transition-colors flex items-center justify-center",
            )}
          >
            <Icon name="x" className={iconSizes[size]} />
          </button>
        )}
      </span>
    );
  },
);

FilterPill.displayName = "FilterPill";
