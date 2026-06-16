import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible rows */
  rows?: number;
  /** Declarative event name for trait dispatch */
  action?: EventKey;
  /** Error message */
  error?: string;
  /** onChange handler or declarative event key for trait dispatch */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | EventKey;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, onChange, ...props }, ref) => {
    const eventBus = useEventBus();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (typeof onChange === 'string') {
        eventBus.emit(`UI:${onChange}`, { value: e.target.value });
      } else {
        onChange?.(e);
      }
    };

    return (
      <textarea
        ref={ref}
        onChange={handleChange}
        className={cn(
          "block w-full border-[length:var(--border-width)] shadow-sm",
          "px-3 py-2 text-sm text-foreground",
          "bg-card",
          "placeholder:text-[var(--color-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-ring",
          "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
          "resize-y min-h-20",
          error
            ? "border-error focus:border-error"
            : "border-border focus:border-primary",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
