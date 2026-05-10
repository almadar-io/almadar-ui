'use client';
/**
 * KitchenDisplayStrip Molecule Component
 *
 * Restaurant POS Kitchen Display System (KDS) order ticket strip with
 * item list and aging color timer. Recomputes age every 30 seconds.
 */

import React, { useEffect, useState } from 'react';
import { Clock, Utensils } from 'lucide-react';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Box } from '../atoms/Box';
import { Divider } from '../atoms/Divider';
import { cn } from '../../lib/cn';

export type KdsStatus = 'pending' | 'preparing' | 'ready' | 'served';
export type KdsAging = 'fresh' | 'normal' | 'aging' | 'overdue';

export interface KdsItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

export interface KitchenDisplayStripProps {
  orderId: string;
  tableLabel?: string;
  serverName?: string;
  items: KdsItem[];
  status?: KdsStatus;
  receivedAt: number;
  size?: 'sm' | 'md';
  onMarkReady?: () => void;
  onMarkServed?: () => void;
  className?: string;
}

const computeAging = (ageMinutes: number): KdsAging => {
  if (ageMinutes < 5) return 'fresh';
  if (ageMinutes < 10) return 'normal';
  if (ageMinutes <= 20) return 'aging';
  return 'overdue';
};

const agingBorderClasses: Record<KdsAging, string> = {
  fresh: 'border-success',
  normal: 'border-border',
  aging: 'border-warning',
  overdue: 'border-error animate-pulse',
};

const agingTextClasses: Record<KdsAging, string> = {
  fresh: 'text-success',
  normal: 'text-foreground',
  aging: 'text-warning',
  overdue: 'text-error',
};

const statusVariant: Record<KdsStatus, 'default' | 'info' | 'warning' | 'success' | 'neutral'> = {
  pending: 'neutral',
  preparing: 'warning',
  ready: 'success',
  served: 'default',
};

const sizeClasses: Record<NonNullable<KitchenDisplayStripProps['size']>, string> = {
  sm: 'min-w-[240px] max-w-xs p-3 gap-2',
  md: 'min-w-[300px] max-w-sm p-4 gap-3',
};

const formatAge = (minutes: number): string => {
  if (minutes < 1) return '<1m';
  return `${Math.floor(minutes)}m`;
};

export const KitchenDisplayStrip: React.FC<KitchenDisplayStripProps> = ({
  orderId,
  tableLabel,
  serverName,
  items,
  status = 'pending',
  receivedAt,
  size = 'md',
  onMarkReady,
  onMarkServed,
  className,
}) => {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ageMinutes = Math.max(0, (now - receivedAt) / 60_000);
  const aging = computeAging(ageMinutes);

  return (
    <Box
      as="article"
      className={cn(
        'flex flex-col bg-card border-l-4 rounded-sm shadow',
        'border-[length:var(--border-width)]',
        agingBorderClasses[aging],
        sizeClasses[size],
        className,
      )}
      role="article"
      aria-label={`Order ${orderId}`}
    >
      <Box className="flex items-start justify-between gap-2">
        <Box className="flex flex-col min-w-0">
          <Box className="flex items-center gap-2">
            <Utensils className="w-4 h-4 flex-shrink-0 text-muted-foreground" aria-hidden />
            <Typography variant="h6" className="truncate">
              #{orderId}
            </Typography>
            <Badge variant={statusVariant[status]} size="sm">
              {status}
            </Badge>
          </Box>
          {(tableLabel || serverName) && (
            <Typography variant="small" color="muted" className="text-xs mt-0.5">
              {tableLabel}
              {tableLabel && serverName ? ' · ' : ''}
              {serverName}
            </Typography>
          )}
        </Box>

        <Box className={cn('flex items-center gap-1 flex-shrink-0', agingTextClasses[aging])}>
          <Clock className="w-4 h-4" aria-hidden />
          <Typography variant="small" className="text-sm font-mono">
            {formatAge(ageMinutes)}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box as="ul" className="flex flex-col gap-2">
        {items.map((item) => (
          <Box as="li" key={item.id} className="flex flex-col gap-1">
            <Box className="flex items-baseline gap-2">
              <Typography variant="body2" className="font-semibold tabular-nums">
                {item.quantity}×
              </Typography>
              <Typography variant="body2" className="flex-1">
                {item.name}
              </Typography>
            </Box>
            {item.modifiers && item.modifiers.length > 0 && (
              <Box className="flex flex-wrap gap-1 pl-6">
                {item.modifiers.map((mod) => (
                  <Badge key={mod} variant="neutral" size="sm">
                    {mod}
                  </Badge>
                ))}
              </Box>
            )}
            {item.notes && (
              <Typography
                variant="small"
                color="muted"
                className="italic pl-6 text-xs"
              >
                {item.notes}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {(status === 'pending' || status === 'preparing' || status === 'ready') && (
        <>
          <Divider />
          <Box className="flex items-center gap-2">
            {(status === 'pending' || status === 'preparing') && onMarkReady && (
              <Button variant="success" size="sm" onClick={onMarkReady} className="flex-1">
                Mark Ready
              </Button>
            )}
            {status === 'ready' && onMarkServed && (
              <Button variant="primary" size="sm" onClick={onMarkServed} className="flex-1">
                Mark Served
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

KitchenDisplayStrip.displayName = 'KitchenDisplayStrip';
