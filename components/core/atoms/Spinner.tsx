import React from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "./Icon";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  size?: SpinnerSize;
  /** Renders a centered overlay backdrop instead of inline. */
  overlay?: boolean;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-icon-default w-icon-default",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", overlay, ...props }, ref) => {
    if (overlay) {
      return (
        <div
          ref={ref}
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "bg-background/60 backdrop-blur-sm",
            className,
          )}
          {...props}
        >
          <Icon name="loader" className={cn("animate-spin text-foreground", sizeStyles[size])} />
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cn("text-foreground", className)}
        {...props}
      >
        <Icon name="loader" className={cn("animate-spin", sizeStyles[size])} />
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
