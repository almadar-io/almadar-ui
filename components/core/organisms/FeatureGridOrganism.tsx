'use client';
/**
 * FeatureGridOrganism
 *
 * Resolves an array of FeatureEntity and renders them as a FeatureGrid molecule.
 * Emits UI:FEATURE_CLICK with { id, href } when a feature card is clicked.
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
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { FeatureGrid } from '../molecules/FeatureGrid';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityRow } from '@almadar/core';
import type { DisplayStateProps } from './types';
import type { FeatureCardProps } from '../../marketing/molecules/FeatureCard';

export interface FeatureGridOrganismProps extends DisplayStateProps {
  entity?: EntityRow | readonly EntityRow[];
  columns?: 2 | 3 | 4 | 6;
  heading?: string;
  subtitle?: string;
}

export const FeatureGridOrganism: React.FC<FeatureGridOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
  columns = 3,
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

  const handleFeatureClick = useCallback(
    (feature: EntityRow) => {
      eventBus.emit('UI:FEATURE_CLICK', {
        id: String(feature.id ?? ''),
        href: String(feature.href ?? ''),
      });
    },
    [eventBus],
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  const featureCards: FeatureCardProps[] = items.map((feature) => {
    const href = feature.href != null ? String(feature.href) : undefined;
    return {
      icon: feature.icon != null ? String(feature.icon) : undefined,
      title: String(feature.title ?? ''),
      description: String(feature.description ?? ''),
      href,
      linkLabel: feature.linkLabel != null ? String(feature.linkLabel) : undefined,
      variant: href ? ('interactive' as const) : ('bordered' as const),
    };
  });

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
      <FeatureGrid
        items={featureCards}
        columns={columns}
      />
    </VStack>
  );
};

FeatureGridOrganism.displayName = 'FeatureGridOrganism';
