import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface ResourceCounterProps {
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Resource label */
  label: string;
  /** Current value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Accent color class (e.g. 'text-yellow-400') */
  color?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { wrapper: 'text-xs gap-1 px-1.5 py-0.5', icon: 'text-sm' },
  md: { wrapper: 'text-sm gap-1.5 px-2 py-1', icon: 'text-base' },
  lg: { wrapper: 'text-base gap-2 px-3 py-1.5', icon: 'text-lg' },
};

export function ResourceCounter({
  icon,
  label,
  value,
  max,
  color,
  size = 'md',
  className,
}: ResourceCounterProps) {
  const sizes = sizeMap[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md',
        'bg-[var(--color-card)]/80 border border-gray-600 font-medium text-[var(--color-foreground)]',
        sizes.wrapper,
        className
      )}
    >
      {icon && <span className={cn('flex-shrink-0', sizes.icon)}>{icon}</span>}
      <span className="text-gray-400">{label}</span>
      <span className={cn('font-bold tabular-nums', color)}>
        {value}
        {max != null && <span className="text-gray-500">/{max}</span>}
      </span>
    </div>
  );
}

ResourceCounter.displayName = 'ResourceCounter';
