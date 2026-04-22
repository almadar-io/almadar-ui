'use client';

import React, { useState, useCallback } from "react";
import type { EventKey, EventPayload } from "@almadar/core";
import { Star } from "lucide-react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export type StarRatingSize = "sm" | "md" | "lg";
export type StarRatingPrecision = "full" | "half";

export interface StarRatingProps {
  /** Current rating value */
  value?: number;
  /** Maximum number of stars */
  max?: number;
  /** Read-only display mode */
  readOnly?: boolean;
  /** Full or half-star precision */
  precision?: StarRatingPrecision;
  /** Star size */
  size?: StarRatingSize;
  /** Declarative event name for rating changes */
  action?: EventKey;
  /** Payload to include with the action event */
  actionPayload?: EventPayload;
  /** Direct onChange callback */
  onChange?: (value: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

const sizeStyles: Record<StarRatingSize, { star: string; gap: string }> = {
  sm: { star: "w-4 h-4", gap: "gap-0.5" },
  md: { star: "w-6 h-6", gap: "gap-1" },
  lg: { star: "w-8 h-8", gap: "gap-1.5" },
};

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  max = 5,
  readOnly = false,
  precision = "full",
  size = "md",
  action,
  actionPayload,
  onChange,
  className,
  label,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const eventBus = useSafeEventBus();

  const styles = sizeStyles[size];
  const displayValue = hoverValue ?? value;

  const emitChange = useCallback(
    (newValue: number) => {
      onChange?.(newValue);
      if (action) {
        eventBus.emit(`UI:${action}`, { ...actionPayload, value: newValue });
      }
    },
    [onChange, action, actionPayload, eventBus],
  );

  const handleStarClick = (starIndex: number, isHalf: boolean) => {
    if (readOnly) return;
    const newValue = isHalf && precision === "half" ? starIndex + 0.5 : starIndex + 1;
    emitChange(newValue);
  };

  const handleStarHover = (starIndex: number, isHalf: boolean) => {
    if (readOnly) return;
    const newValue = isHalf && precision === "half" ? starIndex + 0.5 : starIndex + 1;
    setHoverValue(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const stepSize = precision === "half" ? 0.5 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      emitChange(Math.min(max, value + stepSize));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      emitChange(Math.max(0, value - stepSize));
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center",
        styles.gap,
        !readOnly && "cursor-pointer",
        className,
      )}
      role={readOnly ? "img" : "slider"}
      aria-label={label ?? `Rating: ${value} out of ${max}`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const fillLevel = Math.max(0, Math.min(1, displayValue - i));
        const isFull = fillLevel >= 1;
        const isHalf = fillLevel >= 0.5 && fillLevel < 1;

        return (
          <span
            key={i}
            className="relative inline-block"
            onClick={() => handleStarClick(i, false)}
            onMouseMove={(e) => {
              if (readOnly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeftHalf = e.clientX - rect.left < rect.width / 2;
              handleStarHover(i, isLeftHalf);
            }}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                styles.star,
                "text-muted",
                "transition-colors duration-100",
              )}
              strokeWidth={1.5}
            />

            {/* Filled star overlay */}
            {(isFull || isHalf) && (
              <Star
                className={cn(
                  styles.star,
                  "absolute inset-0",
                  "text-warning fill-warning",
                  "transition-colors duration-100",
                )}
                strokeWidth={1.5}
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              />
            )}

            {/* Half-star click target (left half) */}
            {!readOnly && precision === "half" && (
              <span
                className="absolute inset-0 w-1/2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarClick(i, true);
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

StarRating.displayName = "StarRating";
