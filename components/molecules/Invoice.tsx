'use client';
/**
 * Invoice Molecule Component
 *
 * A formatted printable invoice with line items, totals, due date, and an optional
 * payment CTA. Composes atoms: Card, VStack, HStack, Badge, Typography, Button.
 */

import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface InvoiceParty {
  name: string;
  addressLines?: string[];
  email?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceProps {
  invoiceNumber: string;
  status?: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceLineItem[];
  currency?: string;
  taxRateDefault?: number;
  notes?: string;
  paymentUrl?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusVariant: Record<InvoiceStatus, BadgeVariant> = {
  draft: 'neutral',
  sent: 'info',
  paid: 'success',
  overdue: 'danger',
  void: 'neutral',
};

const statusLabel: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export const Invoice: React.FC<InvoiceProps> = ({
  invoiceNumber,
  status = 'sent',
  issuedAt,
  dueAt,
  from,
  to,
  items,
  currency = 'USD',
  taxRateDefault,
  notes,
  paymentUrl,
  size = 'md',
  className,
}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  const fmt = (n: number) => formatter.format(n);

  const computed = items.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    const rate = item.taxRate ?? taxRateDefault ?? 0;
    const tax = lineTotal * rate;
    return { ...item, lineTotal, tax };
  });

  const subtotal = computed.reduce((sum, i) => sum + i.lineTotal, 0);
  const taxTotal = computed.reduce((sum, i) => sum + i.tax, 0);
  const total = subtotal + taxTotal;

  const padding = size === 'sm' ? 'md' : 'lg';

  return (
    <Card
      variant="bordered"
      padding={padding}
      className={cn('flex flex-col w-full', className)}
    >
      <VStack gap="lg">
        <HStack justify="between" align="start" gap="md">
          <VStack gap="xs">
            <HStack gap="sm" align="center">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <Typography variant="overline" color="muted">
                Invoice
              </Typography>
            </HStack>
            <Typography variant="h2" className="font-bold">
              {invoiceNumber}
            </Typography>
            <Badge variant={statusVariant[status]} size="md">
              {statusLabel[status]}
            </Badge>
          </VStack>

          <VStack gap="xs" align="end">
            <HStack gap="sm" justify="end">
              <Typography variant="caption" color="muted">
                Issued
              </Typography>
              <Typography variant="body2" weight="medium">
                {issuedAt}
              </Typography>
            </HStack>
            <HStack gap="sm" justify="end">
              <Typography variant="caption" color="muted">
                Due
              </Typography>
              <Typography variant="body2" weight="medium">
                {dueAt}
              </Typography>
            </HStack>
          </VStack>
        </HStack>

        <HStack gap="lg" align="start" className="w-full">
          <VStack gap="xs" className="flex-1">
            <Typography variant="overline" color="muted">
              From
            </Typography>
            <Typography variant="body1" weight="semibold">
              {from.name}
            </Typography>
            {from.addressLines?.map((line, idx) => (
              <Typography key={idx} variant="body2" color="muted">
                {line}
              </Typography>
            ))}
            {from.email && (
              <Typography variant="body2" color="muted">
                {from.email}
              </Typography>
            )}
          </VStack>

          <VStack gap="xs" className="flex-1">
            <Typography variant="overline" color="muted">
              To
            </Typography>
            <Typography variant="body1" weight="semibold">
              {to.name}
            </Typography>
            {to.addressLines?.map((line, idx) => (
              <Typography key={idx} variant="body2" color="muted">
                {line}
              </Typography>
            ))}
            {to.email && (
              <Typography variant="body2" color="muted">
                {to.email}
              </Typography>
            )}
          </VStack>
        </HStack>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="py-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">
                  Qty
                </th>
                <th className="py-2 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">
                  Unit
                </th>
                <th className="py-2 pl-4 text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody>
              {computed.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-right">
                    {fmt(item.unitPrice)}
                  </td>
                  <td className="py-3 pl-4 text-sm text-foreground text-right font-medium">
                    {fmt(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <VStack gap="xs" align="end" className="w-full">
          <HStack gap="lg" justify="end" className="w-full md:w-1/2">
            <Typography variant="body2" color="muted">
              Subtotal
            </Typography>
            <Typography variant="body2" weight="medium">
              {fmt(subtotal)}
            </Typography>
          </HStack>
          <HStack gap="lg" justify="end" className="w-full md:w-1/2">
            <Typography variant="body2" color="muted">
              Tax
            </Typography>
            <Typography variant="body2" weight="medium">
              {fmt(taxTotal)}
            </Typography>
          </HStack>
          <HStack
            gap="lg"
            justify="end"
            align="baseline"
            className="w-full md:w-1/2 pt-2 border-t border-border"
          >
            <Typography variant="body1" weight="bold">
              Total
            </Typography>
            <Typography variant="h4" weight="bold" className="text-primary">
              {fmt(total)}
            </Typography>
          </HStack>
        </VStack>

        {notes && (
          <VStack gap="xs" className="w-full">
            <Typography variant="overline" color="muted">
              Notes
            </Typography>
            <Typography variant="body2" color="muted">
              {notes}
            </Typography>
          </VStack>
        )}

        {paymentUrl && (
          <HStack gap="sm" justify="end" className="w-full">
            <Button
              variant="secondary"
              size={size === 'sm' ? 'sm' : 'md'}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
            <Button
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              rightIcon={<ExternalLink className="w-4 h-4" />}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(paymentUrl, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              Pay Now
            </Button>
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

Invoice.displayName = 'Invoice';
