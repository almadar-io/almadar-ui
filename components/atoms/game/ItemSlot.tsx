'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface ItemSlotProps {
  /** Icon component or emoji */
  icon?: React.ReactNode;
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
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-18 h-18 text-3xl',
};

const rarityBorderMap = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-amber-400',
};

const rarityGlowMap = {
  common: '',
  uncommon: '',
  rare: 'shadow-[0_0_6px_rgba(59,130,246,0.3)]',
  epic: 'shadow-[0_0_8px_rgba(168,85,247,0.4)]',
  legendary: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]',
};

export function ItemSlot({
  icon,
  label,
  quantity,
  rarity = 'common',
  empty,
  size = 'md',
  selected,
  onClick,
  className,
}: ItemSlotProps) {
  const isClickable = onClick != null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      title={label}
      className={cn(
        'relative flex items-center justify-center rounded-lg border-2',
        'bg-[var(--color-card)]/80 transition-all duration-150',
        sizeMap[size],
        empty
          ? 'border-gray-700 bg-[var(--color-card)]/50'
          : rarityBorderMap[rarity],
        !empty && rarityGlowMap[rarity],
        selected && 'ring-2 ring-white ring-offset-1 ring-offset-gray-900',
        isClickable && !empty && 'hover:brightness-125 cursor-pointer',
        isClickable && empty && 'hover:border-gray-500 cursor-pointer',
        !isClickable && 'cursor-default',
        className
      )}
    >
      {empty ? (
        <span className="text-gray-600 text-base">+</span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {quantity != null && quantity > 1 && (
            <span
              className={cn(
                'absolute -bottom-1 -right-1 flex items-center justify-center',
                'min-w-[18px] h-[18px] rounded-full px-1',
                'bg-[var(--color-surface,#374151)] border border-gray-500 text-[10px] font-bold text-[var(--color-foreground)]'
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
