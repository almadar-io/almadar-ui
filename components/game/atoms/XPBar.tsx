'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface XPBarProps {
  /** Current XP value */
  current: number;
  /** XP needed for next level */
  max: number;
  /** Current level */
  level?: number;
  /** Whether to show the XP label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animate the fill bar */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { bar: 'h-2', text: 'text-xs', badge: 'text-xs px-1.5 py-0.5' },
  md: { bar: 'h-3', text: 'text-xs', badge: 'text-xs px-2 py-0.5' },
  lg: { bar: 'h-4', text: 'text-sm', badge: 'text-sm px-2.5 py-1' },
};

export function XPBar({
  current,
  max,
  level,
  showLabel = false,
  size = 'md',
  animated = true,
  className,
}: XPBarProps) {
  const sizes = sizeMap[size];
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  // Start the fill at 0 and grow to `percentage` so the CSS transition has a
  // value change to animate on mount; without this, `animated` never animates.
  const [fillWidth, setFillWidth] = React.useState(animated ? 0 : percentage);

  React.useEffect(() => {
    if (!animated) {
      setFillWidth(percentage);
      return;
    }
    const frame = requestAnimationFrame(() => setFillWidth(percentage));
    return () => cancelAnimationFrame(frame);
  }, [animated, percentage]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {level != null && (
        <span
          className={cn(
            'flex-shrink-0 rounded-interactive font-bold',
            'bg-accent text-accent-foreground border border-accent',
            sizes.badge
          )}
        >
          Lv.{level}
        </span>
      )}

      <div className="flex-1 flex flex-col gap-0.5">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-muted border border-muted',
            sizes.bar
          )}
        >
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              'bg-gradient-to-r from-accent to-info',
              animated && 'transition-all duration-500 ease-out'
            )}
            style={{ width: `${fillWidth}%` }}
          />
        </div>

        {showLabel && (
          <span className={cn('text-muted-foreground tabular-nums', sizes.text)}>
            {current} / {max} XP
          </span>
        )}
      </div>
    </div>
  );
}

XPBar.displayName = 'XPBar';
