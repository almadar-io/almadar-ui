'use client';
/**
 * ShowcaseOrganism
 *
 * Resolves an array of ShowcaseEntity and renders them as a grid of ShowcaseCard molecules.
 * Emits UI:SHOWCASE_CLICK with { id, href } when a showcase card is clicked.
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
import { SimpleGrid } from '../molecules/SimpleGrid';
import { ShowcaseCard } from '../molecules/ShowcaseCard';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { ShowcaseEntity } from './marketing-types';

export interface ShowcaseOrganismProps extends EntityDisplayProps<ShowcaseEntity> {
  columns?: 2 | 3 | 4;
  heading?: string;
  subtitle?: string;
}

export const ShowcaseOrganism: React.FC<ShowcaseOrganismProps> = ({
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

  const items = useMemo(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity as ShowcaseEntity]
          : [],
    [entity],
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

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
      <SimpleGrid cols={columns} gap="lg">
        {items.map((item) => (
          <ShowcaseCard
            key={item.id}
            title={item.title}
            description={item.description}
            image={item.image}
            href={item.href}
            badge={item.badge}
            accentColor={item.accentColor}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

ShowcaseOrganism.displayName = 'ShowcaseOrganism';
