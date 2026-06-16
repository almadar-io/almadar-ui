'use client';
/**
 * StepFlowOrganism
 *
 * Resolves an array of StepEntity and renders them as a StepFlow molecule.
 * Display-only organism with no event emissions.
 *
 * Closed Circuit Compliance:
 * - Receives ALL data via entity prop
 * - No events (display-only)
 */

import React, { useMemo } from 'react';
import { cn } from '../../../lib/cn';
import { useTranslate } from '../../../hooks/useTranslate';
import { VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { StepFlow } from '../molecules/StepFlow';
import { LoadingState } from '../../core/molecules/LoadingState';
import { ErrorState } from '../../core/molecules/ErrorState';
import type { EntityRow, EntityWith } from '@almadar/core';
import type { DisplayStateProps } from '../../core/organisms/types';
import type { StepItemProps } from '../molecules/StepFlow';

export interface StepFlowOrganismProps extends DisplayStateProps {
  entity?: EntityWith<'title'> | readonly EntityWith<'title'>[];
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  heading?: string;
  subtitle?: string;
}

export const StepFlowOrganism: React.FC<StepFlowOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
  orientation = 'horizontal',
  showConnectors = true,
  heading,
  subtitle,
}) => {
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

  const steps: StepItemProps[] = items.map((item) => ({
    number: item.number != null ? Number(item.number) : undefined,
    title: String(item.title ?? ''),
    description: String(item.description ?? ''),
    icon: item.icon != null ? String(item.icon) : undefined,
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
      <StepFlow
        steps={steps}
        orientation={orientation}
        showConnectors={showConnectors}
      />
    </VStack>
  );
};

StepFlowOrganism.displayName = 'StepFlowOrganism';
