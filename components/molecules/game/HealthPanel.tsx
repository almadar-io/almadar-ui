'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { HealthBar } from '../../atoms/game/HealthBar';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';

export interface HealthPanelProps {
  /** Current health value */
  current: number;
  /** Maximum health value */
  max: number;
  /** Shield/armor points */
  shield?: number;
  /** Label shown above the bar */
  label?: string;
  /** Active status effects displayed as small badges */
  effects?: { icon: React.ReactNode; label?: string; variant?: 'buff' | 'debuff' | 'neutral' }[];
  /** Whether to display numeric HP values */
  showNumbers?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: { gap: 'gap-1', padding: 'px-2 py-1.5', text: 'text-xs' as const, barSize: 'sm' as const },
  md: { gap: 'gap-1.5', padding: 'px-3 py-2', text: 'text-sm' as const, barSize: 'md' as const },
  lg: { gap: 'gap-2', padding: 'px-4 py-3', text: 'text-base' as const, barSize: 'lg' as const },
};

const effectVariantMap = {
  buff: 'success' as const,
  debuff: 'danger' as const,
  neutral: 'neutral' as const,
};

export function HealthPanel({
  current,
  max,
  shield,
  label,
  effects,
  showNumbers = true,
  size = 'md',
  className,
}: HealthPanelProps) {
  const sizes = sizeMap[size];

  return (
    <Box
      className={cn(
        'rounded-lg bg-[var(--color-card)]/90 border border-gray-700 backdrop-blur-sm',
        sizes.padding,
        className
      )}
    >
      <Box className={cn('flex flex-col', sizes.gap)}>
        {/* Header row: label + numbers */}
        {(label || showNumbers) && (
          <Box className="flex items-center justify-between">
            {label && (
              <Typography
                variant="caption"
                weight="bold"
                className="text-gray-300 uppercase tracking-wider"
              >
                {label}
              </Typography>
            )}
            {showNumbers && (
              <Typography
                variant="caption"
                weight="bold"
                className={cn('font-mono tabular-nums', sizes.text)}
                color="primary"
              >
                {current}/{max}
                {shield != null && shield > 0 && (
                  <Typography
                    as="span"
                    variant="caption"
                    weight="bold"
                    className="text-blue-400 ml-1"
                  >
                    +{shield}
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
        )}

        {/* Health bar */}
        <HealthBar
          current={current}
          max={max}
          format="bar"
          size={sizes.barSize}
          animated
        />

        {/* Shield bar (if present) */}
        {shield != null && shield > 0 && (
          <Box
            className={cn(
              'relative overflow-hidden rounded-full bg-gray-700',
              size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2',
              'w-full'
            )}
          >
            <Box
              className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (shield / max) * 100)}%` }}
            />
          </Box>
        )}

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
    </Box>
  );
}

HealthPanel.displayName = 'HealthPanel';
