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
          "block w-full border-[length:var(--border-width)] shadow-sm",
          "px-3 py-2 text-sm text-foreground",
          "bg-card",
          "placeholder:text-[var(--color-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-ring",
          "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
          "resize-y min-h-[80px]",
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
