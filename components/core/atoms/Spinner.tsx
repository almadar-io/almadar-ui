import React from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "./Icon";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  size?: SpinnerSize;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-icon-default w-icon-default",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
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
