'use client';
/**
 * StatDisplay Molecule
 *
 * A compact stat display: label + value + optional icon.
 * Molecule-level replacement for the stats (StatCard) organism in behavior schemas.
 * No entity prop, no data fetching, no hooks beyond icon resolution.
 */
import React, { useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { HStack, VStack } from '../atoms/Stack';
import { Sparkline } from '../atoms/Sparkline';
import { resolveIcon } from '../atoms/Icon';
import type { IconInput } from '../atoms';
import { useEventBus } from '../../../hooks/useEventBus';
import type { UiError } from '../atoms/types';

export type StatDisplayLook =
  | 'elevated'
  | 'flat'
  | 'progress-backed'
  | 'gauge'
  | 'sparkline';

const lookStyles: Record<StatDisplayLook, string> = {
  elevated: '',
  flat: 'shadow-none border-[length:var(--border-width)] border-border',
  'progress-backed': '',
  gauge: '',
  sparkline: '',
};

export interface StatDisplayProps {
  /** Display label (e.g., "Total", "Remaining") */
  label: string;
  /** Primary value (number or formatted string) */
  value: number | string;
  /** Optional denominator. >0 renders "value / max"; 0 or omitted hides the divider. */
  max?: number;
  /** Optional progress target. >0 renders a progress bar at value/target. */
  target?: number;
  /** Signed delta vs previous period. >0 renders ↑ green, <0 renders ↓ red, 0 hides. Polarity reversal via `trendPolarity`. */
  trend?: number;
  /** Controls whether `trend > 0` is "good" (default) or "bad". `lower-is-better` inverts the color logic. */
  trendPolarity?: 'higher-is-better' | 'lower-is-better';
  /** When `'percent'`, renders trend with a `%` suffix (e.g. `↓ 3.3%`); default is `'absolute'`. */
  trendFormat?: 'absolute' | 'percent';
  /** Optional inline sparkline data appended to the trend row. Length < 2 renders nothing. */
  sparklineData?: readonly number[];
  /** Event name emitted as `UI:{clickEvent}` with `{ metricLabel }` when the card is clicked. */
  clickEvent?: string;
  /** Prefix prepended to the formatted value (e.g. "≈ "). */
  prefix?: string;
  /** Suffix appended to the formatted value (e.g. " /mo", " ms"). */
  suffix?: string;
  /** Lucide icon name or component */
  icon?: IconInput;
  /** Icon background color class */
  iconBg?: string;
  /** Icon color class */
  iconColor?: string;
  /** Display format: "number", "currency", "percent" */
  format?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Compact mode (inline, no card wrapper) */
  compact?: boolean;
  /** Layer 2 visual treatment. */
  look?: StatDisplayLook;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
}

function formatNumber(value: number | string | null | undefined, format?: string): string {
  if (value == null) return '0';
  const v = typeof value === 'number' ? value : value;
  switch (format) {
    case 'currency':
      return typeof v === 'number' ? `$${v.toFixed(2)}` : String(v);
    case 'percent':
      return typeof v === 'number' ? `${Math.round(v)}%` : String(v);
    case 'number':
      return typeof v === 'number' ? v.toLocaleString() : String(v);
    default:
      return String(v);
  }
}

// Compose `prefix + formattedValue + (" / " + max if max>0) + suffix`. max:0
// is the lolo default for std-stats's optional denominator and means "no max"
// — we hide the divider so plain count cards don't render "10 / 0".
function composeDisplayValue(
  value: number | string | null | undefined,
  format?: string,
  max?: number,
  prefix?: string,
  suffix?: string,
): string {
  const formatted = formatNumber(value, format);
  const withMax = max != null && max > 0 ? `${formatted} / ${max}` : formatted;
  return `${prefix ?? ''}${withMax}${suffix ?? ''}`;
}

const variantColor: Record<string, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export const StatDisplay: React.FC<StatDisplayProps> = ({
  label,
  value,
  max,
  target,
  trend,
  trendPolarity = 'higher-is-better',
  trendFormat = 'absolute',
  sparklineData,
  clickEvent,
  prefix,
  suffix,
  icon: iconProp,
  iconBg = 'bg-muted',
  iconColor = 'text-foreground',
  format,
  size = 'md',
  variant = 'default',
  compact = false,
  look = 'elevated',
  className,
  isLoading = false,
  error = null,
}) => {
  const eventBus = useEventBus();
  const handleClick = useCallback(() => {
    if (clickEvent) eventBus.emit(`UI:${clickEvent}`, { metricLabel: label });
  }, [clickEvent, eventBus, label]);
  const ResolvedIcon = typeof iconProp === 'string'
    ? resolveIcon(iconProp)
    : (typeof iconProp === 'function' ? iconProp : null);

  const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const valueSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const padSizes = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

  const displayValue = composeDisplayValue(value, format, max, prefix, suffix);
  const numericValue = typeof value === 'number' ? value : Number(value);
  const showTarget = typeof target === 'number' && target > 0 && Number.isFinite(numericValue);
  const targetPct = showTarget ? Math.max(0, Math.min(100, (numericValue / (target as number)) * 100)) : 0;
  const showTrend = typeof trend === 'number' && trend !== 0 && Number.isFinite(trend);
  const trendUp = showTrend && (trend as number) > 0;
  const trendIsGood = trendPolarity === 'lower-is-better' ? !trendUp : trendUp;
  const trendMagnitude = Math.abs(trend as number);
  const trendSuffix = trendFormat === 'percent' ? '%' : '';
  const trendLabel = showTrend ? `${trendUp ? '↑' : '↓'} ${trendMagnitude}${trendSuffix}` : '';

  if (error) {
    return (
      <Card className={cn(padSizes[size], className)}>
        <Typography variant="small" color="error">{error.message}</Typography>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn(padSizes[size], className)}>
        <VStack gap="sm" className="animate-pulse">
          <Box className="h-3 bg-muted rounded w-16" />
          <Box className="h-6 bg-muted rounded w-12" />
        </VStack>
      </Card>
    );
  }

  // Compact mode: inline badge style
  if (compact) {
    return (
      <HStack
        gap="sm"
        className={cn('items-center', clickEvent && 'cursor-pointer hover:opacity-80', className)}
        onClick={clickEvent ? handleClick : undefined}
      >
        {ResolvedIcon && <ResolvedIcon className={cn(iconSizes[size], iconColor)} />}
        <Typography variant="caption" color="secondary">{label}</Typography>
        <Typography variant="h4" className={cn('font-bold', valueSizes[size], variantColor[variant])}>
          {displayValue}
        </Typography>
        {showTrend && (
          <Typography variant="caption" className={cn('font-semibold', trendIsGood ? 'text-success' : 'text-error')}>
            {trendLabel}
          </Typography>
        )}
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline data={sparklineData} color="auto" width={60} height={20} />
        )}
      </HStack>
    );
  }

  // Card mode (default)
  return (
    <Card
      className={cn(padSizes[size], lookStyles[look], clickEvent && 'cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={clickEvent ? handleClick : undefined}
    >
      <HStack align="start" justify="between">
        <VStack gap="none" className="space-y-1 flex-1">
          <Typography variant="overline" color="secondary">{label}</Typography>
          <HStack gap="sm" align="end">
            <Typography variant="h4" className={cn('font-bold', valueSizes[size], variantColor[variant])}>
              {displayValue}
            </Typography>
            {showTrend && (
              <Typography
                variant="caption"
                className={cn('font-semibold pb-1', trendIsGood ? 'text-success' : 'text-error')}
              >
                {trendLabel}
              </Typography>
            )}
          </HStack>
          {showTarget && (
            <Box className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <Box
                className={cn('h-full rounded-full transition-all', `bg-${variant === 'default' ? 'primary' : variant}`)}
                style={{ width: `${targetPct}%` }}
              />
            </Box>
          )}
        </VStack>
        <VStack gap="xs" align="end">
          {ResolvedIcon && (
            <Box className={cn('p-3 rounded-md', iconBg)}>
              <ResolvedIcon className={cn(iconSizes[size], iconColor)} />
            </Box>
          )}
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline data={sparklineData} color="auto" />
          )}
        </VStack>
      </HStack>
    </Card>
  );
};

StatDisplay.displayName = 'StatDisplay';
