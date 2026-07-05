import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Typography } from '../../core/atoms/Typography';
import { GameIcon } from './GameIcon';
import type { Asset } from '@almadar/core';

export interface DamageNumberProps {
  /** Sprite asset — displayed as a hit-effect icon alongside the number */
  assetUrl?: Asset;
  /** The damage/heal value to display */
  value: number;
  /** Type of number display */
  type?: 'damage' | 'heal' | 'crit' | 'miss';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const typeStyles = {
  damage: 'text-error font-bold',
  heal: 'text-success font-bold',
  crit: 'text-warning font-extrabold',
  miss: 'text-muted-foreground italic',
};

const floatKeyframes = `
@keyframes damageFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  20% { transform: translateY(-8px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-32px) scale(0.8); }
}
`;

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/effects/particles/spark_01.png',
  role: 'effect',
  category: 'effect',
};

export function DamageNumber({
  assetUrl = DEFAULT_ASSET_URL,
  value = 42,
  type = 'damage',
  size = 'md',
  className,
}: DamageNumberProps) {
  const displayText = type === 'miss' ? 'MISS' : type === 'heal' ? `+${value}` : `${value}`;

  return (
    <>
      <style>{floatKeyframes}</style>
      <Typography
        as="span"
        className={cn(
          'inline-flex items-center gap-0.5 font-mono select-none pointer-events-none',
          sizeMap[size],
          typeStyles[type],
          className
        )}
        style={{ animation: 'damageFloat 1s ease-out forwards' }}
      >
        {assetUrl && (
          <GameIcon assetUrl={assetUrl} icon="image" size={14} className="flex-shrink-0" />
        )}
        {displayText}
      </Typography>
    </>
  );
}

DamageNumber.displayName = 'DamageNumber';
