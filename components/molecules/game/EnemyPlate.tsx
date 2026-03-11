'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { HealthBar } from '../../atoms/game/HealthBar';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';

export interface EnemyPlateEffect {
  /** Effect icon */
  icon: React.ReactNode;
  /** Effect label */
  label?: string;
  /** Effect type */
  variant?: 'buff' | 'debuff' | 'neutral';
}

export interface EnemyPlateProps {
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
  buff: 'success' as const,
  debuff: 'danger' as const,
  neutral: 'neutral' as const,
};

export function EnemyPlate({
  name,
  health,
  maxHealth,
  level,
  effects,
  className,
}: EnemyPlateProps) {
  return (
    <Box
      className={cn(
        'inline-flex flex-col gap-1 rounded-lg bg-gray-900/90 border border-gray-700 backdrop-blur-sm px-3 py-1.5',
        'min-w-[120px]',
        className
      )}
    >
      {/* Name + level row */}
      <Box className="flex items-center justify-between gap-2">
        <Typography
          variant="caption"
          weight="bold"
          className="text-white truncate"
        >
          {name}
        </Typography>
        {level != null && (
          <Badge variant="neutral" size="sm">
            Lv.{level}
          </Badge>
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
          className="font-mono tabular-nums text-gray-400 text-[10px] shrink-0"
        >
          {health}/{maxHealth}
        </Typography>
      </Box>

      {/* Effects row */}
      {effects && effects.length > 0 && (
        <Box className="flex items-center gap-1 flex-wrap">
          {effects.map((effect, i) => (
            <Badge
              key={i}
              variant={effectVariantMap[effect.variant ?? 'neutral']}
              size="sm"
              icon={effect.icon}
            >
              {effect.label}
            </Badge>
          ))}
        </Box>
      )}
    </Box>
  );
}

EnemyPlate.displayName = 'EnemyPlate';
