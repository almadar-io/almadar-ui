import * as React from 'react';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import { GameIcon } from './GameIcon';
import type { Asset } from '@almadar/core';

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/effects/flash/flash00.png',
  role: 'effect',
  category: 'effect',
};

export interface ComboCounterProps {
  /** Sprite asset displayed alongside the combo number */
  assetUrl?: Asset;
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
  sm: { combo: 'text-lg', label: 'text-xs', multiplier: 'text-xs' },
  md: { combo: 'text-2xl', label: 'text-xs', multiplier: 'text-sm' },
  lg: { combo: 'text-4xl', label: 'text-sm', multiplier: 'text-base' },
};

function getComboIntensity(combo: number): string {
  if (combo >= 10) return 'text-error animate-pulse';
  if (combo >= 7) return 'text-warning';
  if (combo >= 4) return 'text-warning';
  return 'text-foreground';
}

function getComboScale(combo: number): string {
  if (combo >= 10) return 'scale-110';
  if (combo >= 5) return 'scale-105';
  return '';
}

export function ComboCounter({
  assetUrl = DEFAULT_ASSET_URL,
  combo = 5,
  multiplier,
  streak,
  size = 'md',
  className,
}: ComboCounterProps) {
  const sizes = sizeMap[size];

  if (combo <= 0) return null;

  return (
    <Box
      className={cn(
        'inline-flex flex-col items-center justify-center',
        'rounded-container bg-card/80 border border-muted px-3 py-1.5',
        'transition-transform duration-200',
        getComboScale(combo),
        className
      )}
    >
      {assetUrl && (
        <GameIcon assetUrl={assetUrl} icon="image" size={24} className="flex-shrink-0 mb-0.5" />
      )}
      <Typography as="span" className={cn('font-black tabular-nums leading-none', sizes.combo, getComboIntensity(combo))}>
        {combo}
      </Typography>
      <Typography as="span" className={cn('font-bold uppercase tracking-wider text-muted-foreground', sizes.label)}>
        combo
      </Typography>

      {multiplier != null && multiplier > 1 && (
        <Typography as="span" className={cn('font-bold text-warning tabular-nums', sizes.multiplier)}>
          x{multiplier.toFixed(1)}
        </Typography>
      )}

      {streak != null && streak > 0 && (
        <Typography as="span" className={cn('text-muted-foreground tabular-nums', sizes.label)}>
          {streak} streak
        </Typography>
      )}
    </Box>
  );
}

ComboCounter.displayName = 'ComboCounter';
