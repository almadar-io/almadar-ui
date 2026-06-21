import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface TimerDisplayProps {
  /** Time in seconds */
  seconds: number;
  /** Whether the timer is running */
  running?: boolean;
  /** Display format */
  format?: 'mm:ss' | 'ss' | 'countdown';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Seconds below which to pulse red */
  lowThreshold?: number;
}

const sizeMap = {
  sm: 'text-sm px-2 py-0.5',
  md: 'text-lg px-3 py-1',
  lg: 'text-2xl px-4 py-1.5',
};

function formatTime(seconds: number, format: 'mm:ss' | 'ss' | 'countdown'): string {
  const clamped = Math.max(0, Math.floor(seconds));

  if (format === 'ss') {
    return `${clamped}s`;
  }

  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  const padded = secs.toString().padStart(2, '0');

  if (format === 'countdown') {
    return mins > 0 ? `${mins}:${padded}` : `${secs}`;
  }

  // mm:ss
  return `${mins.toString().padStart(2, '0')}:${padded}`;
}

export function TimerDisplay({
  seconds = 90,
  running = true,
  format = 'mm:ss',
  size = 'md',
  className,
  lowThreshold,
}: TimerDisplayProps) {
  const isLow = lowThreshold != null && seconds <= lowThreshold && seconds > 0;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-container',
        'bg-card/80 border border-muted font-mono font-bold tabular-nums',
        sizeMap[size],
        running && 'border-success/50',
        isLow && 'text-error border-error/50 animate-pulse',
        !isLow && 'text-foreground',
        className
      )}
    >
      {formatTime(seconds, format)}
    </div>
  );
}

TimerDisplay.displayName = 'TimerDisplay';
