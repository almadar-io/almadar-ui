'use client';
/**
 * TicketStub Molecule Component
 *
 * A horizontal event-ticket card divided by a perforated dotted line into a
 * main zone (event details + tier badge + price) and a stub zone (attendee
 * name + QR placeholder).
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';

export type TicketStubVariant =
  | 'general'
  | 'vip'
  | 'early-bird'
  | 'student'
  | 'custom';

export type TicketStubSize = 'sm' | 'md' | 'lg';

export interface TicketStubProps {
  eventName: string;
  date?: string;
  venue?: string;
  tier: string;
  price: string | number;
  currency?: string;
  attendeeName?: string;
  ticketCode: string;
  qrValue?: string;
  variant?: TicketStubVariant;
  size?: TicketStubSize;
  className?: string;
}

const variantAccent: Record<TicketStubVariant, string> = {
  general: 'border-primary',
  vip: 'border-warning',
  'early-bird': 'border-success',
  student: 'border-info',
  custom: 'border-border',
};

const variantBadge: Record<TicketStubVariant, BadgeVariant> = {
  general: 'primary',
  vip: 'warning',
  'early-bird': 'success',
  student: 'info',
  custom: 'neutral',
};

const sizeFrame: Record<TicketStubSize, string> = {
  sm: 'min-h-[140px] text-sm',
  md: 'min-h-[180px] text-base',
  lg: 'min-h-[220px] text-lg',
};

const sizePaddingClass: Record<TicketStubSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const qrSize: Record<TicketStubSize, string> = {
  sm: 'w-16 h-16 text-[8px]',
  md: 'w-20 h-20 text-[10px]',
  lg: 'w-28 h-28 text-xs',
};

const priceSize: Record<TicketStubSize, 'h3' | 'h2' | 'h1'> = {
  sm: 'h3',
  md: 'h2',
  lg: 'h1',
};

const formatPrice = (price: string | number, currency: string): string => {
  if (typeof price === 'number') {
    return `${currency} ${price.toFixed(2)}`;
  }
  return price;
};

export const TicketStub: React.FC<TicketStubProps> = ({
  eventName,
  date,
  venue,
  tier,
  price,
  currency = 'USD',
  attendeeName,
  ticketCode,
  qrValue,
  variant = 'general',
  size = 'md',
  className,
}) => {
  // TODO: wire actual QR encoding via jsQR/qrcode lib (deferred outside Phase 10 scope).
  const qrPayload = qrValue ?? ticketCode;

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn(
        'flex flex-row overflow-hidden',
        'border-l-[length:4px]',
        variantAccent[variant],
        sizeFrame[size],
        className,
      )}
    >
      <div className={cn('flex-[7] basis-0', sizePaddingClass[size])}>
        <VStack gap="sm" className="h-full">
          <Typography variant="h3" truncate>
            {eventName}
          </Typography>

          {(date || venue) && (
            <HStack gap="sm" align="center">
              {date && (
                <Typography variant="caption">
                  {date}
                </Typography>
              )}
              {date && venue && (
                <Typography variant="caption" color="muted">
                  ·
                </Typography>
              )}
              {venue && (
                <Typography variant="caption">
                  {venue}
                </Typography>
              )}
            </HStack>
          )}

          <HStack gap="sm" align="center">
            <Badge variant={variantBadge[variant]} size={size === 'lg' ? 'md' : 'sm'}>
              {tier}
            </Badge>
          </HStack>

          <Typography
            variant={priceSize[size]}
            className="font-bold mt-auto"
          >
            {formatPrice(price, currency)}
          </Typography>
        </VStack>
      </div>

      <div
        aria-hidden="true"
        className="border-l-[length:2px] border-dashed border-border self-stretch"
      />

      <div className={cn('flex-[3] basis-0 bg-muted/40', sizePaddingClass[size])}>
        <VStack gap="sm" align="center" className="h-full justify-between">
          {attendeeName && (
            <Typography variant="small" color="muted" align="center" truncate className="w-full">
              {attendeeName}
            </Typography>
          )}

          <div
            role="img"
            aria-label={`QR code for ticket ${ticketCode}`}
            className={cn(
              'flex items-center justify-center',
              'bg-background',
              'border-[length:var(--border-width)] border-border',
              'rounded-sm',
              'font-mono break-all p-1 text-center',
              qrSize[size],
            )}
          >
            {qrPayload}
          </div>

          <Typography variant="caption" align="center" className="font-mono">
            {ticketCode}
          </Typography>
        </VStack>
      </div>
    </Card>
  );
};

TicketStub.displayName = 'TicketStub';
