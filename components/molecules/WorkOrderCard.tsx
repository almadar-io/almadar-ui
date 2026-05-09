'use client';
/**
 * WorkOrderCard Molecule Component
 *
 * Field-service dispatch ticket card. Composes Card, Stack, Typography, Badge,
 * and Button atoms to display order metadata, customer location, schedule,
 * assigned technician, and status-driven actions.
 */

import React from 'react';
import { MapPin, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Button } from '../atoms/Button';

export type WorkOrderStatus =
  | 'created'
  | 'assigned'
  | 'en-route'
  | 'on-site'
  | 'completed'
  | 'cancelled';

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkOrderCardProps {
  /** Work order identifier (e.g. "WO-1042") */
  orderId: string;
  /** Customer name */
  customerName: string;
  /** Service type description (e.g. "Plumbing repair") */
  serviceType: string;
  /** Service address */
  address: string;
  /** Scheduled date/time, rendered as-is */
  scheduledAt?: string;
  /** ETA in minutes; surfaced only when status is 'en-route' */
  etaMinutes?: number;
  /** Assigned technician name; rendered as "Unassigned" when omitted */
  assignedTo?: string;
  /** Current dispatch status */
  status?: WorkOrderStatus;
  /** Priority level */
  priority?: WorkOrderPriority;
  /** Card size affecting padding and typography */
  size?: 'sm' | 'md' | 'lg';
  /** Handler for the Assign action */
  onAssign?: () => void;
  /** Handler for the View Route action */
  onViewRoute?: () => void;
  /** Handler for the Mark Completed action */
  onMarkCompleted?: () => void;
  /** Additional class names */
  className?: string;
}

const statusBadgeVariant: Record<WorkOrderStatus, BadgeVariant> = {
  created: 'neutral',
  assigned: 'info',
  'en-route': 'primary',
  'on-site': 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const statusLabel: Record<WorkOrderStatus, string> = {
  created: 'Created',
  assigned: 'Assigned',
  'en-route': 'En Route',
  'on-site': 'On Site',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const priorityBadgeVariant: Record<WorkOrderPriority, BadgeVariant> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabel: Record<WorkOrderPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

const cardPaddingMap: Record<NonNullable<WorkOrderCardProps['size']>, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

const titleVariantMap: Record<NonNullable<WorkOrderCardProps['size']>, 'h5' | 'h4' | 'h3'> = {
  sm: 'h5',
  md: 'h4',
  lg: 'h3',
};

const iconSizeMap: Record<NonNullable<WorkOrderCardProps['size']>, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const orderIdSizeMap: Record<NonNullable<WorkOrderCardProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  orderId,
  customerName,
  serviceType,
  address,
  scheduledAt,
  etaMinutes,
  assignedTo,
  status = 'created',
  priority = 'normal',
  size = 'md',
  onAssign,
  onViewRoute,
  onMarkCompleted,
  className,
}) => {
  const iconClass = cn(iconSizeMap[size], 'text-muted-foreground shrink-0');
  const showEta = status === 'en-route' && typeof etaMinutes === 'number';

  const renderActions = () => {
    if (status === 'created' && onAssign) {
      return (
        <Button variant="primary" size="sm" onClick={onAssign} rightIcon={ChevronRight}>
          Assign
        </Button>
      );
    }
    if ((status === 'assigned' || status === 'en-route') && onViewRoute) {
      return (
        <Button variant="secondary" size="sm" onClick={onViewRoute} rightIcon={ChevronRight}>
          View Route
        </Button>
      );
    }
    if (status === 'on-site' && onMarkCompleted) {
      return (
        <Button variant="success" size="sm" onClick={onMarkCompleted} rightIcon={ChevronRight}>
          Mark Completed
        </Button>
      );
    }
    return null;
  };

  const actions = renderActions();

  return (
    <Card variant="bordered" padding={cardPaddingMap[size]} className={cn('w-full', className)}>
      <VStack gap={size === 'sm' ? 'sm' : 'md'} align="stretch">
        <HStack align="center" justify="between" gap="sm" wrap>
          <Typography
            as="span"
            className={cn(
              'font-mono text-muted-foreground tracking-tight',
              orderIdSizeMap[size],
            )}
          >
            {orderId}
          </Typography>
          <HStack gap="xs" align="center">
            <Badge variant={priorityBadgeVariant[priority]} size="sm">
              {priorityLabel[priority]}
            </Badge>
            <Badge variant={statusBadgeVariant[status]} size="sm">
              {statusLabel[status]}
            </Badge>
          </HStack>
        </HStack>

        <VStack gap="xs" align="start">
          <Typography variant={titleVariantMap[size]}>{customerName}</Typography>
          <Typography variant="caption" color="muted">
            {serviceType}
          </Typography>
        </VStack>

        <VStack gap="xs" align="start">
          <HStack gap="sm" align="center">
            <MapPin className={iconClass} aria-hidden="true" />
            <Typography variant="body2" color="muted">
              {address}
            </Typography>
          </HStack>

          {scheduledAt && (
            <HStack gap="sm" align="center">
              <Calendar className={iconClass} aria-hidden="true" />
              <Typography variant="body2" color="muted">
                {scheduledAt}
              </Typography>
            </HStack>
          )}

          {showEta && (
            <HStack gap="sm" align="center">
              <Clock className={iconClass} aria-hidden="true" />
              <Typography variant="body2" color="muted">
                ETA: {etaMinutes} min
              </Typography>
            </HStack>
          )}

          <HStack gap="sm" align="center">
            <User className={iconClass} aria-hidden="true" />
            {assignedTo ? (
              <Typography variant="body2">{assignedTo}</Typography>
            ) : (
              <Typography variant="body2" color="muted">
                Unassigned
              </Typography>
            )}
          </HStack>
        </VStack>

        {actions && (
          <HStack justify="end" align="center" gap="sm">
            {actions}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

WorkOrderCard.displayName = 'WorkOrderCard';
