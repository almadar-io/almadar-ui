import React from "react";
import { cn } from "../../lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible rows */
  rows?: number;
  /** Declarative event name for trait dispatch */
  action?: string;
  /** Error message */
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "block w-full border-[length:var(--border-width)] shadow-[var(--shadow-sm)]",
          "px-3 py-2 text-sm text-[var(--color-foreground)]",
          "bg-[var(--color-card)]",
          "placeholder:text-[var(--color-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-ring)]",
          "disabled:bg-[var(--color-muted)] disabled:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed",
          "resize-y min-h-[80px]",
          error
            ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
            : "border-[var(--color-border)] focus:border-[var(--color-primary)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
