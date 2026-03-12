'use client';
/**
 * StatDisplay Molecule
 *
 * A compact stat display: label + value + optional icon.
 * Molecule-level replacement for the stats (StatCard) organism in behavior schemas.
 * No entity prop, no data fetching, no hooks beyond icon resolution.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Box } from '../atoms/Box';
import { HStack, VStack } from '../atoms/Stack';
import { resolveIcon } from '../atoms/Icon';

export interface StatDisplayProps {
  /** Display label (e.g., "Total", "Remaining") */
  label: string;
  /** Primary value (number or formatted string) */
  value: number | string;
  /** Maximum value (renders as "value / max") */
  max?: number;
  /** Lucide icon name or React node */
  icon?: React.ReactNode;
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
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

function formatValue(value: unknown, format?: string, max?: number): string {
  if (value == null) return '0';
  const v = typeof value === 'number' ? value : value;
  let formatted: string;
  switch (format) {
    case 'currency':
      formatted = typeof v === 'number' ? `$${v.toFixed(2)}` : String(v);
      break;
    case 'percent':
      formatted = typeof v === 'number' ? `${Math.round(v)}%` : String(v);
      break;
    case 'number':
      formatted = typeof v === 'number' ? v.toLocaleString() : String(v);
      break;
    default:
      formatted = String(v);
  }
  if (max != null) return `${formatted} / ${max}`;
  return formatted;
}

const variantColor: Record<string, string> = {
  default: 'text-[var(--color-foreground)]',
  primary: 'text-[var(--color-primary)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-error)]',
  info: 'text-[var(--color-info)]',
};

export const StatDisplay: React.FC<StatDisplayProps> = ({
  label,
  value,
  max,
  icon: iconProp,
  iconBg = 'bg-[var(--color-muted)]',
  iconColor = 'text-[var(--color-foreground)]',
  format,
  size = 'md',
  variant = 'default',
  compact = false,
  className,
  isLoading = false,
  error = null,
}) => {
  const ResolvedIcon = typeof iconProp === 'string'
    ? resolveIcon(iconProp)
    : null;

  const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const valueSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const padSizes = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

  const displayValue = formatValue(value, format, max);

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
          <Box className="h-3 bg-[var(--color-muted)] rounded w-16" />
          <Box className="h-6 bg-[var(--color-muted)] rounded w-12" />
        </VStack>
      </Card>
    );
  }

  // Compact mode: inline badge style
  if (compact) {
    return (
      <HStack gap="sm" className={cn('items-center', className)}>
        {ResolvedIcon && <ResolvedIcon className={cn(iconSizes[size], iconColor)} />}
        {typeof iconProp !== 'string' && iconProp}
        <Typography variant="caption" color="secondary">{label}</Typography>
        <Typography variant="h4" className={cn('font-bold', valueSizes[size], variantColor[variant])}>
          {displayValue}
        </Typography>
      </HStack>
    );
  }

  // Card mode (default)
  return (
    <Card className={cn(padSizes[size], className)}>
      <HStack align="start" justify="between">
        <VStack gap="none" className="space-y-1">
          <Typography variant="overline" color="secondary">{label}</Typography>
          <Typography variant="h4" className={cn('font-bold', valueSizes[size], variantColor[variant])}>
            {displayValue}
          </Typography>
        </VStack>
        {(ResolvedIcon || (typeof iconProp !== 'string' && iconProp)) && (
          <Box className={cn('p-3 rounded-[var(--radius-md)]', iconBg)}>
            {ResolvedIcon
              ? <ResolvedIcon className={cn(iconSizes[size], iconColor)} />
              : iconProp}
          </Box>
        )}
      </HStack>
    </Card>
  );
};

StatDisplay.displayName = 'StatDisplay';
