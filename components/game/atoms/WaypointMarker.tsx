import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Icon, type IconInput } from '../../core/atoms/Icon';

export interface WaypointMarkerProps {
  /** Label text below the marker */
  label?: string;
  /** Custom icon to render inside the marker */
  icon?: IconInput;
  /** Whether this waypoint is currently active */
  active?: boolean;
  /** Whether this waypoint has been completed */
  completed?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { dot: 'w-4 h-4', ring: 'w-6 h-6', label: 'text-xs mt-1' },
  md: { dot: 'w-6 h-6', ring: 'w-8 h-8', label: 'text-sm mt-1.5' },
  lg: { dot: 'w-8 h-8', ring: 'w-10 h-10', label: 'text-base mt-2' },
};

const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3/5 h-3/5">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function WaypointMarker({
  label,
  icon,
  active = false,
  completed = false,
  size = 'md',
  className,
}: WaypointMarkerProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative flex items-center justify-center">
        {active && (
          <div
            className={cn(
              'absolute rounded-full border-2 border-info animate-ping opacity-50',
              sizes.ring
            )}
          />
        )}
        {active && (
          <div
            className={cn(
              'absolute rounded-full border-2 border-info',
              sizes.ring
            )}
          />
        )}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full transition-all duration-200',
            sizes.dot,
            completed && 'bg-success text-foreground',
            active && !completed && 'bg-info text-foreground',
            !active && !completed && 'bg-muted'
          )}
        >
          {completed ? checkIcon : icon && (typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />)}
        </div>
      </div>
      {label && (
        <span
          className={cn(
            'text-center whitespace-nowrap',
            sizes.label,
            completed ? 'text-success' : active ? 'text-info' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

WaypointMarker.displayName = 'WaypointMarker';
