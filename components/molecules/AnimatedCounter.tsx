'use client';
/**
 * AnimatedCounter Molecule Component
 *
 * Counts from 0 to a target value on scroll-into-view using IntersectionObserver.
 * Replaces static stat numbers with animated versions for visual impact.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

export interface AnimatedCounterProps {
  /** Target value to count to. Strings allow display formats (e.g. "500+", "99.9%", "3x"); numbers are coerced. */
  value: string | number;
  /** Label displayed below the number */
  label: string;
  /** Animation duration in ms */
  duration?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Extracts the numeric portion and suffix from a value string.
 * e.g. "500+" -> { num: 500, prefix: "", suffix: "+" }
 * e.g. "99.9%" -> { num: 99.9, prefix: "", suffix: "%" }
 * e.g. "3x" -> { num: 3, prefix: "", suffix: "x" }
 * e.g. "$1.2M" -> { num: 1.2, prefix: "$", suffix: "M" }
 */
function parseValue(value: string | number): { num: number; prefix: string; suffix: string; decimals: number } {
  if (value === '' || value == null) return { num: 0, prefix: '', suffix: '', decimals: 0 };
  const match = String(value).match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) {
    return { num: 0, prefix: '', suffix: String(value), decimals: 0 };
  }
  const numStr = match[2];
  const decimalIdx = numStr.indexOf('.');
  const decimals = decimalIdx >= 0 ? numStr.length - decimalIdx - 1 : 0;
  return {
    prefix: match[1],
    num: parseFloat(numStr),
    suffix: match[3],
    decimals,
  };
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  label,
  duration = 1500,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  const animate = useCallback(() => {
    const { num, prefix, suffix, decimals } = parseValue(value);
    if (num === 0) {
      setDisplayValue(String(value));
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;
      setDisplayValue(`${prefix}${current.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplayValue(String(value));
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  useEffect(() => {
    if (hasAnimated) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, animate]);

  return (
    <Box ref={ref} className={cn('flex flex-col items-center gap-1 p-4', className)}>
      <Typography
        variant="h2"
        className="text-primary font-bold tabular-nums"
      >
        {hasAnimated ? displayValue : '0'}
      </Typography>
      <Typography variant="body2" color="muted" className="text-center">
        {label}
      </Typography>
    </Box>
  );
};

AnimatedCounter.displayName = 'AnimatedCounter';
