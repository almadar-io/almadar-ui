'use client';
/**
 * AnimatedCounter Atom Component
 *
 * Animates a number from its previous value to the current value
 * using requestAnimationFrame and ease-out easing.
 */
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Typography } from "./Typography";

export interface AnimatedCounterProps {
  /** The target value to animate to. Strings are parsed numerically (e.g. "500", "99.9"). */
  value: number | string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Text to display before the number */
  prefix?: string;
  /** Text to display after the number */
  suffix?: string;
  /** Additional class names */
  className?: string;
}

function easeOut(t: number): number {
  return t * (2 - t);
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value: rawValue,
  duration = 600,
  prefix,
  suffix,
  className,
}) => {
  const numericRaw = typeof rawValue === 'number' ? rawValue : Number.parseFloat(String(rawValue ?? ''));
  const value = !Number.isNaN(numericRaw) ? numericRaw : 0;
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = previousValueRef.current;
    const to = value;
    previousValueRef.current = value;

    if (from === to) {
      setDisplayValue(to);
      return;
    }

    const startTime = performance.now();
    const diff = to - from;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      setDisplayValue(from + diff * easedProgress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  // Determine decimal places from the target value
  const decimalPlaces = Number.isInteger(value) ? 0 : String(value).split(".")[1]?.length ?? 0;
  const formattedValue = displayValue.toFixed(decimalPlaces);

  return (
    <Typography variant="h3" className={cn("tabular-nums", className)}>
      {prefix}{formattedValue}{suffix}
    </Typography>
  );
};

AnimatedCounter.displayName = "AnimatedCounter";
