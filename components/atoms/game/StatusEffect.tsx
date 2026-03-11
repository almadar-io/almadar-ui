import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface StatusEffectProps {
  /** Icon to display for the effect */
  icon: React.ReactNode;
  /** Label describing the effect */
  label?: string;
  /** Remaining duration in seconds */
  duration?: number;
  /** Number of stacks */
  stacks?: number;
  /** Effect type */
  variant?: 'buff' | 'debuff' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'text-sm', badge: 'text-[10px] -top-1 -right-1 w-4 h-4', timer: 'text-[9px]' },
  md: { container: 'w-10 h-10', icon: 'text-base', badge: 'text-xs -top-1 -right-1 w-5 h-5', timer: 'text-[10px]' },
  lg: { container: 'w-12 h-12', icon: 'text-lg', badge: 'text-sm -top-1.5 -right-1.5 w-6 h-6', timer: 'text-xs' },
};

const variantStyles = {
  buff: 'border-green-500 bg-green-500/20',
  debuff: 'border-red-500 bg-red-500/20',
  neutral: 'border-gray-500 bg-gray-500/20',
};

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m`;
  }
  return `${Math.round(seconds)}s`;
}

export function StatusEffect({
  icon,
  label,
  duration,
  stacks,
  variant = 'neutral',
  size = 'md',
  className,
}: StatusEffectProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded border-2',
          sizes.container,
          variantStyles[variant]
        )}
        title={label}
      >
        <span className={cn('flex items-center justify-center', sizes.icon)}>
          {icon}
        </span>
        {duration !== undefined && (
          <span
            className={cn(
              'absolute bottom-0 left-0 right-0 text-center font-mono font-bold text-white bg-black/60 leading-tight',
              sizes.timer
            )}
          >
            {formatDuration(duration)}
          </span>
        )}
      </div>
      {stacks !== undefined && stacks > 1 && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-white text-black font-bold leading-none',
            sizes.badge
          )}
        >
          {stacks}
        </span>
      )}
      {label && (
        <span className="text-[10px] text-gray-400 mt-0.5 text-center whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

StatusEffect.displayName = 'StatusEffect';
