'use client';
import * as React from 'react';
import type { Asset } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { resolveIcon, type IconInput } from '../../core/atoms/Icon';
import { AtlasImage } from '../../core/atoms/AtlasImage';

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export interface GameIconProps {
  /** Asset — when url is present, renders an img (Asset-primary). */
  assetUrl?: Asset;
  /** Lucide component or kebab-case icon name (fallback when no assetUrl). */
  icon: IconInput;
  /** Pixel size or named variant. */
  size?: number | 'sm' | 'md' | 'lg';
  /** Alt text for the img (defaults to assetUrl.category). */
  alt?: string;
  /** Additional CSS classes. */
  className?: string;
}

export function GameIcon({ assetUrl, icon, size = 'md', alt, className }: GameIconProps) {
  const px = typeof size === 'number' ? size : sizeMap[size];

  if (assetUrl?.url) {
    return (
      <AtlasImage
        asset={assetUrl}
        size={px}
        alt={alt ?? assetUrl.category ?? ''}
        className={cn('flex-shrink-0', className)}
      />
    );
  }

  const I = typeof icon === 'string' ? resolveIcon(icon) : icon;

  return <I width={px} height={px} className={cn('flex-shrink-0', className)} />;
}

GameIcon.displayName = 'GameIcon';
