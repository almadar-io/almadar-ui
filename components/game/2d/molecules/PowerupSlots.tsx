'use client';
import * as React from 'react';
import { cn } from '../../../../lib/cn';
import { ItemSlot } from '../atoms/ItemSlot';
import { Box } from '../../../core/atoms/Box';
import { HStack } from '../../../core/atoms/Stack';
import { Typography } from '../../../core/atoms/Typography';
import type { IconInput } from '../../../core/atoms/index';
import type { Asset } from '@almadar/core';

export interface ActivePowerup {
  /** Unique powerup ID */
  id: string;
  /** Sprite asset — takes precedence over icon when provided */
  assetUrl?: Asset;
  /** Icon component or emoji */
  icon?: IconInput;
  /** Powerup label */
  label: string;
  /** Remaining time in seconds */
  remainingTime?: number;
}

export interface PowerupSlotsProps {
  /** Array of active powerups */
  active: ActivePowerup[];
  /** Maximum number of powerup slots */
  maxSlots?: number;
  /** Additional CSS classes */
  className?: string;
}

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
  return `${seconds}s`;
}

const DEFAULT_ACTIVE_POWERUPS: ActivePowerup[] = [
  { id: 'pw1', icon: 'zap', label: 'Speed Boost', remainingTime: 12 },
  { id: 'pw2', icon: 'shield', label: 'Iron Shield', remainingTime: 30 },
];

export function PowerupSlots({
  active = DEFAULT_ACTIVE_POWERUPS,
  maxSlots = 4,
  className,
}: PowerupSlotsProps) {
  const emptySlotCount = Math.max(0, maxSlots - active.length);

  return (
    <HStack gap="xs" className={className}>
      {active.map((powerup) => (
        <Box key={powerup.id} className="relative">
          <ItemSlot
            assetUrl={powerup.assetUrl}
            icon={powerup.icon}
            label={powerup.label}
            rarity="uncommon"
            size="md"
          />
          {powerup.remainingTime != null && (
            <Box
              className={cn(
                'absolute -bottom-1 left-1/2 -translate-x-1/2',
                'rounded-interactive px-1 py-px',
                'bg-background/80 border border-border',
              )}
            >
              <Typography
                variant="caption"
                className="text-[9px] font-mono font-bold text-warning whitespace-nowrap"
              >
                {formatTime(powerup.remainingTime)}
              </Typography>
            </Box>
          )}
        </Box>
      ))}
      {Array.from({ length: emptySlotCount }).map((_, index) => (
        <ItemSlot
          key={`empty-${index}`}
          empty
          size="md"
        />
      ))}
    </HStack>
  );
}

PowerupSlots.displayName = 'PowerupSlots';
