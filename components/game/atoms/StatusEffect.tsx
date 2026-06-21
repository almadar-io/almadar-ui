import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Icon, type IconInput } from '../../core/atoms/Icon';

export interface StatusEffectProps {
  /** Lucide icon name or component */
  icon: IconInput;
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
  sm: { container: 'w-8 h-8', icon: 'text-sm', badge: 'text-xs -top-1 -right-1 w-4 h-4', timer: 'text-[9px]' },
  md: { container: 'w-10 h-10', icon: 'text-base', badge: 'text-xs -top-1 -right-1 w-5 h-5', timer: 'text-xs' },
  lg: { container: 'w-12 h-12', icon: 'text-lg', badge: 'text-sm -top-1.5 -right-1.5 w-6 h-6', timer: 'text-xs' },
};

const variantStyles = {
  buff: 'border-success bg-success/20',
  debuff: 'border-error bg-error/20',
  neutral: 'border-muted bg-muted/20',
};

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m`;
  }
  return `${Math.round(seconds)}s`;
}

export function StatusEffect({
  icon = 'shield',
  label = 'Shield',
  duration = 30,
  stacks,
  variant = 'buff',
  size = 'md',
  className,
}: StatusEffectProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-interactive border-2',
          sizes.container,
          variantStyles[variant]
        )}
        title={label}
      >
        <span className={cn('flex items-center justify-center', sizes.icon)}>
          {typeof icon === 'string' ? <Icon name={icon} size="sm" /> : <Icon icon={icon} size="sm" />}
        </span>
        {duration !== undefined && (
          <span
            className={cn(
              'absolute bottom-0 left-0 right-0 text-center font-mono font-bold text-foreground bg-background/60 leading-tight',
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
            'absolute flex items-center justify-center rounded-full bg-card text-foreground font-bold leading-none',
            sizes.badge
          )}
        >
          {stacks}
        </span>
      )}
      {label && (
        <span className="text-xs text-muted-foreground mt-0.5 text-center whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

StatusEffect.displayName = 'StatusEffect';
