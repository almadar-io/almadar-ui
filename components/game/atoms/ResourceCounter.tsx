import * as React from 'react';
import { cn } from '../../../lib/cn';
import type { ColorToken } from '../../core/atoms/types';
import { Icon, type IconInput } from '../../core/atoms/Icon';
import type { Asset } from '@almadar/core';

const colorTokenClasses: Record<ColorToken, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  muted: 'text-muted-foreground',
};

export interface ResourceCounterProps {
  /** Sprite asset — takes precedence over icon when provided */
  assetUrl?: Asset;
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

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/world-map/gold_mine.png',
  role: 'effect',
  category: 'world',
};

const sizeMap = {
  sm: { wrapper: 'text-xs gap-1 px-1.5 py-0.5', icon: 'text-sm', img: 16 },
  md: { wrapper: 'text-sm gap-1.5 px-2 py-1', icon: 'text-base', img: 20 },
  lg: { wrapper: 'text-base gap-2 px-3 py-1.5', icon: 'text-lg', img: 28 },
};

export function ResourceCounter({
  assetUrl = DEFAULT_ASSET_URL,
  icon,
  label = 'Gold',
  value = 250,
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
      {assetUrl ? (
        <img
          src={assetUrl.url}
          alt={label}
          width={sizes.img}
          height={sizes.img}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          className="flex-shrink-0"
        />
      ) : icon ? (
        <span className={cn('flex-shrink-0', sizes.icon)}>
          {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
        </span>
      ) : null}
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-bold tabular-nums', color && (color in colorTokenClasses ? colorTokenClasses[color as ColorToken] : color))}>
        {value}
        {max != null && <span className="text-muted-foreground">/{max}</span>}
      </span>
    </div>
  );
}

ResourceCounter.displayName = 'ResourceCounter';
