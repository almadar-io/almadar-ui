'use client';
import * as React from 'react';
import { cn } from '../../../../lib/cn';
import { HealthBar } from '../atoms/HealthBar';
import { StatusEffect } from '../atoms/StatusEffect';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import type { IconInput } from '../../../core/atoms/index';
import type { Asset } from '@almadar/core';

export interface EnemyPlateEffect {
  /** Effect icon */
  icon: IconInput;
  /** Effect label */
  label?: string;
  /** Effect type */
  variant?: 'buff' | 'debuff' | 'neutral';
}

export interface EnemyPlateProps {
  /** Portrait sprite asset — takes precedence over the default avatar slot */
  assetUrl?: Asset;
  /** Enemy name */
  name: string;
  /** Current health */
  health: number;
  /** Maximum health */
  maxHealth: number;
  /** Enemy level */
  level?: number;
  /** Active status effects */
  effects?: EnemyPlateEffect[];
  /** Additional CSS classes */
  className?: string;
}

const effectVariantMap = {
  buff: 'buff' as const,
  debuff: 'debuff' as const,
  neutral: 'neutral' as const,
};

const DEFAULT_ENEMY_EFFECTS: EnemyPlateEffect[] = [
  { icon: 'flame', label: 'Burn', variant: 'debuff' },
];

export function EnemyPlate({
  assetUrl,
  name = 'Shadow Guard',
  health = 80,
  maxHealth = 100,
  level = 5,
  effects = DEFAULT_ENEMY_EFFECTS,
  className,
}: EnemyPlateProps) {
  return (
    <Box
      className={cn(
        'inline-flex flex-col gap-1 rounded-container bg-[var(--color-card)]/90 border border-border backdrop-blur-sm px-3 py-1.5',
        'min-w-[120px]',
        className
      )}
    >
      {/* Name + level row */}
      <Box className="flex items-center justify-between gap-2">
        <Box className="flex items-center gap-1.5 min-w-0">
          {assetUrl && (
            <img
              src={assetUrl.url}
              alt={name}
              width={24}
              height={24}
              style={{ objectFit: 'cover', borderRadius: '50%' }}
              className="flex-shrink-0"
            />
          )}
          <Typography
            variant="caption"
            weight="bold"
            className="text-[var(--color-foreground)] truncate"
          >
            {name}
          </Typography>
        </Box>
        {level != null && (
          <span className="text-xs font-bold text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 border border-border/50 shrink-0">
            Lv.{level}
          </span>
        )}
      </Box>

      {/* Health bar + numbers */}
      <Box className="flex items-center gap-2">
        <HealthBar
          current={health}
          max={maxHealth}
          format="bar"
          size="sm"
          animated
          className="flex-1"
        />
        <Typography
          variant="caption"
          className="font-mono tabular-nums text-muted-foreground text-xs shrink-0"
        >
          {health}/{maxHealth}
        </Typography>
      </Box>

      {/* Effects row */}
      {effects && effects.length > 0 && (
        <Box className="flex items-center gap-1 flex-wrap">
          {effects.map((effect, i) => (
            <StatusEffect
              key={i}
              icon={effect.icon}
              label={effect.label}
              variant={effectVariantMap[effect.variant ?? 'neutral']}
              size="sm"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

EnemyPlate.displayName = 'EnemyPlate';
