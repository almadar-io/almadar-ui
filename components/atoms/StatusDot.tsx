import React from "react";
import { cn } from "../../lib/cn";

export type StatusDotStatus = "online" | "offline" | "away" | "busy" | "warning" | "critical";
export type StatusDotSize = "sm" | "md" | "lg";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status determines the dot color */
  status?: StatusDotStatus;
  /** Enable pulse animation for active/critical states */
  pulse?: boolean;
  /** Dot size */
  size?: StatusDotSize;
  /** Accessible label (rendered as sr-only text) */
  label?: string;
}

const statusColors: Record<StatusDotStatus, string> = {
  online: "bg-[var(--color-success)]",
  offline: "bg-[var(--color-muted-foreground)]",
  away: "bg-[var(--color-warning)]",
  busy: "bg-[var(--color-error)]",
  warning: "bg-[var(--color-warning)]",
  critical: "bg-[var(--color-error)]",
};

const pulseRingColors: Record<StatusDotStatus, string> = {
  online: "ring-[var(--color-success)]",
  offline: "ring-[var(--color-muted-foreground)]",
  away: "ring-[var(--color-warning)]",
  busy: "ring-[var(--color-error)]",
  warning: "ring-[var(--color-warning)]",
  critical: "ring-[var(--color-error)]",
};

const sizeStyles: Record<StatusDotSize, string> = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status = "offline", pulse = false, size = "md", label, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-block rounded-full flex-shrink-0",
          statusColors[status],
          sizeStyles[size],
          pulse && [
            "animate-pulse",
            "ring-2 ring-offset-1",
            pulseRingColors[status],
            "ring-opacity-40",
          ],
          className,
        )}
        role="status"
        aria-label={label ?? status}
        {...props}
      />
    );
  },
);

StatusDot.displayName = "StatusDot";
