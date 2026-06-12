'use client';
/**
 * PricingOrganism
 *
 * Resolves an array of PricingPlanEntity and renders them as a PricingGrid molecule.
 * Emits UI:PLAN_SELECT with { planId, planName } when a plan action is clicked.
 *
 * Closed Circuit Compliance:
 * - Receives ALL data via entity prop
 * - Emits events via useEventBus
 * - Never listens to events
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { PricingGrid } from '../molecules/PricingGrid';
import { LoadingState } from '../../core/molecules/LoadingState';
import { ErrorState } from '../../core/molecules/ErrorState';
import type { EntityRow } from '@almadar/core';
import type { DisplayStateProps } from '../../core/organisms/types';
import type { PricingCardProps } from '../molecules/PricingCard';

export interface PricingOrganismProps extends DisplayStateProps {
  entity?: EntityRow | readonly EntityRow[];
  heading?: string;
  subtitle?: string;
}

export const PricingOrganism: React.FC<PricingOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
  heading,
  subtitle,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const items = useMemo<readonly EntityRow[]>(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity as EntityRow]
          : [],
    [entity],
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  const plans: PricingCardProps[] = items.map((plan) => ({
    name: String(plan.name ?? ''),
    price: String(plan.price ?? ''),
    description: plan.description != null ? String(plan.description) : undefined,
    features: ((plan.features as readonly string[] | undefined) ?? []).map((f) => String(f)),
    action: { label: String(plan.actionLabel ?? ''), href: String(plan.actionHref ?? '') },
    highlighted: Boolean(plan.highlighted),
    badge: plan.badge != null ? String(plan.badge) : undefined,
  }));

  return (
    <VStack gap="lg" className={cn('w-full', className)}>
      {(heading || subtitle) && (
        <VStack gap="sm" align="center" className="w-full">
          {heading && (
            <Typography variant="h2" align="center">
              {heading}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" color="muted" align="center" className="max-w-2xl">
              {subtitle}
            </Typography>
          )}
        </VStack>
      )}
      <PricingGrid plans={plans} />
    </VStack>
  );
};

PricingOrganism.displayName = 'PricingOrganism';
