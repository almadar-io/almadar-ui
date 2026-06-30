'use client';
import * as React from 'react';
import { cn } from '../../../../lib/cn';
import { Icon, type IconInput } from '../../../core/atoms/Icon';
import { useEventBus } from '../../../../hooks/useEventBus';
import type { Asset, EventKey } from '@almadar/core';

export interface ItemSlotProps {
  /** Sprite asset — takes precedence over icon when provided */
  assetUrl?: Asset;
  /** Icon component or emoji — shown only when assetUrl is absent */
  icon?: IconInput;
  /** Item label */
  label?: string;
  /** Stack quantity */
  quantity?: number;
  /** Rarity tier affecting border color */
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Whether the slot is empty */
  empty?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the slot is selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Declarative event name — emits UI:{action} via eventBus on select */
  action?: EventKey;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-18 h-18 text-3xl',
};

const rarityBorderMap = {
  common: 'border-muted',
  uncommon: 'border-success',
  rare: 'border-info',
  epic: 'border-accent',
  legendary: 'border-warning',
};

const rarityGlowMap = {
  common: '',
  uncommon: '',
  rare: 'shadow-sm',
  epic: 'shadow-lg',
  legendary: 'shadow-lg',
};

const DEFAULT_ASSET_URL: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/isometric-dungeon/Isometric/chestClosed_E.png',
  role: 'item',
  category: 'item',
};

const assetSizeMap = {
  sm: 28,
  md: 40,
  lg: 56,
};

export function ItemSlot({
  assetUrl = DEFAULT_ASSET_URL,
  icon = 'sword',
  label = 'Iron Sword',
  quantity,
  rarity = 'uncommon',
  empty,
  size = 'md',
  selected,
  onClick,
  action,
  className,
}: ItemSlotProps) {
  const eventBus = useEventBus();
  const isClickable = onClick != null || action != null;
  const px = assetSizeMap[size];

  return (
    <button
      type="button"
      onClick={() => { if (action) eventBus.emit(`UI:${action}`, {}); onClick?.(); }}
      disabled={!isClickable}
      title={label}
      className={cn(
        'relative flex items-center justify-center rounded-interactive border-2',
        'bg-card/80 transition-all duration-150',
        sizeMap[size],
        empty
          ? 'border-border bg-card/50'
          : rarityBorderMap[rarity],
        !empty && rarityGlowMap[rarity],
        selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
        isClickable && !empty && 'hover:brightness-125 cursor-pointer',
        isClickable && empty && 'hover:border-muted cursor-pointer',
        !isClickable && 'cursor-default',
        className
      )}
    >
      {empty ? (
        <span className="text-muted-foreground text-base">+</span>
      ) : (
        <>
          {assetUrl ? (
            <img
              src={assetUrl?.url}
              alt={label}
              width={px}
              height={px}
              style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
              className="flex-shrink-0"
            />
          ) : icon ? (
            <span className="flex-shrink-0">
              {typeof icon === 'string' ? <Icon name={icon} /> : <Icon icon={icon} />}
            </span>
          ) : null}
          {quantity != null && quantity > 1 && (
            <span
              className={cn(
                'absolute -bottom-1 -right-1 flex items-center justify-center',
                'min-w-[18px] h-[18px] rounded-full px-1',
                'bg-surface border border-muted text-xs font-bold text-foreground'
              )}
            >
              {quantity}
            </span>
          )}
        </>
      )}
    </button>
  );
}

ItemSlot.displayName = 'ItemSlot';
