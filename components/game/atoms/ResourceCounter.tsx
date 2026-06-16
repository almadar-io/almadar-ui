import * as React from 'react';
import { cn } from '../../../lib/cn';
import type { ColorToken } from '../../core/atoms/types';
import { Icon, type IconInput } from '../../core/atoms/Icon';

const colorTokenClasses: Record<ColorToken, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  muted: 'text-muted-foreground',
};

export interface ResourceCounterProps {
  /** Icon component or emoji */
  icon?: IconInput;
  /** Resource label */
  label: string;
  /** Current value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Semantic palette token or an arbitrary Tailwind color class. */
  color?: ColorToken | string;
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
        'inline-flex items-center rounded-container',
        'bg-card/80 border border-muted font-medium text-foreground',
        sizes.wrapper,
        className
      )}
    >
      {icon && (
        <span className={cn('flex-shrink-0', sizes.icon)}>
          {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
        </span>
      )}
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-bold tabular-nums', color && (color in colorTokenClasses ? colorTokenClasses[color as ColorToken] : color))}>
        {value}
        {max != null && <span className="text-muted-foreground">/{max}</span>}
      </span>
    </div>
  );
}

ResourceCounter.displayName = 'ResourceCounter';
