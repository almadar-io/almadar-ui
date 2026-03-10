import React from "react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";

export type TrendDirection = "up" | "down" | "flat";
export type TrendIndicatorSize = "sm" | "md" | "lg";

export interface TrendIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric value to display (e.g., 12.5 for +12.5%) */
  value?: number;
  /** Override automatic direction detection (positive=up, negative=down, zero=flat) */
  direction?: TrendDirection;
  /** Show the formatted value text next to the arrow */
  showValue?: boolean;
  /** Invert color logic (for metrics where down is good, e.g., error rate, bounce rate) */
  invert?: boolean;
  /** Accessible label override */
  label?: string;
  /** Size of the indicator */
  size?: TrendIndicatorSize;
}

const sizeStyles: Record<TrendIndicatorSize, { icon: string; text: string }> = {
  sm: { icon: "w-3 h-3", text: "text-xs" },
  md: { icon: "w-4 h-4", text: "text-sm" },
  lg: { icon: "w-5 h-5", text: "text-base" },
};

function resolveDirection(value: number | undefined, direction: TrendDirection | undefined): TrendDirection {
  if (direction) return direction;
  if (value === undefined || value === 0) return "flat";
  return value > 0 ? "up" : "down";
}

function resolveColor(dir: TrendDirection, invert: boolean): string {
  if (dir === "flat") return "text-[var(--color-muted-foreground)]";
  const isPositive = dir === "up";
  const isGood = invert ? !isPositive : isPositive;
  return isGood ? "text-[var(--color-success)]" : "text-[var(--color-error)]";
}

const iconMap = {
  up: TrendingUp,
  down: TrendingDown,
  flat: ArrowRight,
};

export const TrendIndicator = React.forwardRef<HTMLSpanElement, TrendIndicatorProps>(
  (
    {
      className,
      value,
      direction,
      showValue = true,
      invert = false,
      label,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const dir = resolveDirection(value, direction);
    const colorClass = resolveColor(dir, invert);
    const IconComponent = iconMap[dir];
    const styles = sizeStyles[size];

    const formattedValue = value !== undefined
      ? `${value > 0 ? "+" : ""}${value}%`
      : undefined;

    const ariaLabel = label ?? (formattedValue ? `${dir} ${formattedValue}` : dir);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          colorClass,
          styles.text,
          className,
        )}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        <IconComponent className={styles.icon} />
        {showValue && formattedValue && (
          <span>{formattedValue}</span>
        )}
      </span>
    );
  },
);

TrendIndicator.displayName = "TrendIndicator";
