import * as React from 'react';
import type { Asset } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { GameIcon } from './GameIcon';

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
  /** Icon asset rendered to the left of the time value. Falls back to no icon. */
  iconAsset?: Asset;
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
  iconAsset,
}: TimerDisplayProps) {
  const isLow = lowThreshold != null && seconds <= lowThreshold && seconds > 0;

  return (
    <Box
      className={cn(
        'inline-flex items-center gap-1 justify-center rounded-container',
        'bg-card/80 border border-muted font-mono font-bold tabular-nums',
        sizeMap[size],
        running && 'border-success/50',
        isLow && 'text-error border-error/50 animate-pulse',
        !isLow && 'text-foreground',
        className
      )}
    >
      {iconAsset && (
        <GameIcon assetUrl={iconAsset} icon="image" size={16} className="w-4 h-4 object-contain flex-shrink-0" />
      )}
      {formatTime(seconds, format)}
    </Box>
  );
}

TimerDisplay.displayName = 'TimerDisplay';
