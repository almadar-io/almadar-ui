import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Icon, type IconInput } from '../../core/atoms/Icon';
import type { AssetUrl } from '@almadar/core';

export interface ScoreDisplayProps {
  /** Sprite image URL — takes precedence over icon when provided */
  assetUrl?: AssetUrl;
  /** Current score value */
  value: number;
  /** Alias for value — common schema binding name */
  score?: number;
  /** Label to display before score */
  label?: string;
  /** Icon component or emoji */
  icon?: IconInput;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Number formatting locale */
  locale?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

const DEFAULT_ASSET_URL: AssetUrl =
  'https://almadar-kflow-assets.web.app/shared/effects/particles/star_01.png';

export function ScoreDisplay({
  assetUrl = DEFAULT_ASSET_URL,
  value,
  score,
  label,
  icon,
  size = 'md',
  className,
  locale = 'en-US',
}: ScoreDisplayProps) {
  // Accept "score" as alias for "value" (common schema binding)
  const resolvedValue = typeof value === 'number' && !Number.isNaN(value)
    ? value
    : typeof score === 'number' && !Number.isNaN(score)
      ? score
      : 0;

  const formattedValue = new Intl.NumberFormat(locale).format(resolvedValue);

  return (
    <div
      className={cn(
        'flex items-center gap-2 font-bold',
        sizeMap[size],
        className
      )}
    >
      {assetUrl ? (
        <img
          src={assetUrl}
          alt=""
          width={20}
          height={20}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          className="flex-shrink-0"
        />
      ) : icon ? (
        <span className="flex-shrink-0">
          {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
        </span>
      ) : null}
      {label && <span className="text-muted-foreground">{label}</span>}
      <span className="tabular-nums">{formattedValue}</span>
    </div>
  );
}

ScoreDisplay.displayName = 'ScoreDisplay';
