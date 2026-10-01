import { LOADING_STATE_MARKER } from "@almadar/core";
import type { A11yProps } from '@almadar/core';
import React from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "./Icon";
import { useTranslate } from "../../../hooks/useTranslate";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof A11yProps>, A11yProps {
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
    const { t } = useTranslate();
    if (overlay) {
      return (
        <div
          ref={ref}
          role="status"
          aria-label={t("aria.loading")}
          {...{ [LOADING_STATE_MARKER]: "" }}
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
        role="status"
        aria-label={t("aria.loading")}
        {...{ [LOADING_STATE_MARKER]: "" }}
        className={cn("text-foreground", className)}
        {...props}
      >
        <Icon name="loader" className={cn("animate-spin", sizeStyles[size])} />
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
