import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface WaypointMarkerProps {
  /** Label text below the marker */
  label?: string;
  /** Custom icon to render inside the marker */
  icon?: React.ReactNode;
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
              'absolute rounded-full border-2 border-blue-400 animate-ping opacity-50',
              sizes.ring
            )}
          />
        )}
        {active && (
          <div
            className={cn(
              'absolute rounded-full border-2 border-blue-400',
              sizes.ring
            )}
          />
        )}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full transition-all duration-200',
            sizes.dot,
            completed && 'bg-green-500 text-white',
            active && !completed && 'bg-blue-500 text-white',
            !active && !completed && 'bg-gray-500'
          )}
        >
          {completed ? checkIcon : icon}
        </div>
      </div>
      {label && (
        <span
          className={cn(
            'text-center whitespace-nowrap',
            sizes.label,
            completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-gray-400'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

WaypointMarker.displayName = 'WaypointMarker';
