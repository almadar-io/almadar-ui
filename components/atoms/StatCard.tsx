import React from "react";
import { cn } from "../../lib/cn";
import { VStack } from "./Stack";
import { Typography } from "./Typography";

export type StatCardSize = "sm" | "md" | "lg";

export interface StatCardProps {
  /** The stat value to display prominently */
  value: string;
  /** Label describing the value */
  label: string;
  /** Size of the value text */
  size?: StatCardSize;
  /** Additional class names */
  className?: string;
}

const sizeClasses: Record<StatCardSize, string> = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ value, label, size = "md", className }, ref) => {
    return (
      <VStack ref={ref} gap="xs" align="center" className={cn(className)}>
        <Typography
          weight="bold"
          color="primary"
          className={cn(sizeClasses[size])}
        >
          {value}
        </Typography>
        <Typography variant="caption" color="muted">
          {label}
        </Typography>
      </VStack>
    );
  },
);

StatCard.displayName = "StatCard";
