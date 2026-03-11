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
  sm: { bar: 'h-2', text: 'text-[10px]', badge: 'text-[10px] px-1.5 py-0.5' },
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {level != null && (
        <span
          className={cn(
            'flex-shrink-0 rounded-md font-bold',
            'bg-indigo-600 text-white border border-indigo-400',
            sizes.badge
          )}
        >
          Lv.{level}
        </span>
      )}

      <div className="flex-1 flex flex-col gap-0.5">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-gray-700 border border-gray-600',
            sizes.bar
          )}
        >
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              'bg-gradient-to-r from-indigo-600 to-purple-500',
              animated && 'transition-all duration-500 ease-out'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {showLabel && (
          <span className={cn('text-gray-400 tabular-nums', sizes.text)}>
            {current} / {max} XP
          </span>
        )}
      </div>
    </div>
  );
}

XPBar.displayName = 'XPBar';
