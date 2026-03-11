import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface ComboCounterProps {
  /** Current combo count */
  combo: number;
  /** Score multiplier */
  multiplier?: number;
  /** Current streak */
  streak?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { combo: 'text-lg', label: 'text-[10px]', multiplier: 'text-xs' },
  md: { combo: 'text-2xl', label: 'text-xs', multiplier: 'text-sm' },
  lg: { combo: 'text-4xl', label: 'text-sm', multiplier: 'text-base' },
};

function getComboIntensity(combo: number): string {
  if (combo >= 10) return 'text-red-400 animate-pulse';
  if (combo >= 7) return 'text-orange-400';
  if (combo >= 4) return 'text-yellow-400';
  return 'text-white';
}

function getComboScale(combo: number): string {
  if (combo >= 10) return 'scale-110';
  if (combo >= 5) return 'scale-105';
  return '';
}

export function ComboCounter({
  combo,
  multiplier,
  streak,
  size = 'md',
  className,
}: ComboCounterProps) {
  const sizes = sizeMap[size];

  if (combo <= 0) return null;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center',
        'rounded-xl bg-gray-800/80 border border-gray-600 px-3 py-1.5',
        'transition-transform duration-200',
        getComboScale(combo),
        className
      )}
    >
      <span className={cn('font-black tabular-nums leading-none', sizes.combo, getComboIntensity(combo))}>
        {combo}
      </span>
      <span className={cn('font-bold uppercase tracking-wider text-gray-400', sizes.label)}>
        combo
      </span>

      {multiplier != null && multiplier > 1 && (
        <span className={cn('font-bold text-amber-400 tabular-nums', sizes.multiplier)}>
          x{multiplier.toFixed(1)}
        </span>
      )}

      {streak != null && streak > 0 && (
        <span className={cn('text-gray-500 tabular-nums', sizes.label)}>
          {streak} streak
        </span>
      )}
    </div>
  );
}

ComboCounter.displayName = 'ComboCounter';
