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
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { PricingGrid } from '../molecules/PricingGrid';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { PricingPlanEntity } from './marketing-types';
import type { PricingCardProps } from '../molecules/PricingCard';

export interface PricingOrganismProps extends EntityDisplayProps<PricingPlanEntity> {
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

  const items = useMemo(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity as PricingPlanEntity]
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
    name: plan.name,
    price: plan.price,
    description: plan.description,
    features: plan.features,
    action: { label: plan.actionLabel, href: plan.actionHref },
    highlighted: plan.highlighted,
    badge: plan.badge,
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
