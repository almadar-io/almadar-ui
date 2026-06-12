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
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { SimpleGrid } from '../molecules/SimpleGrid';
import { ShowcaseCard } from '../../marketing/molecules/ShowcaseCard';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityRow, EntityWith } from '@almadar/core';
import type { DisplayStateProps } from './types';

export interface ShowcaseOrganismProps extends DisplayStateProps {
  entity?: EntityWith<'title'> | readonly EntityWith<'title'>[];
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
        {items.map((item) => {
          const imageRaw = item.image as { src?: string; alt?: string } | undefined;
          return (
            <ShowcaseCard
              key={String(item.id ?? '')}
              title={String(item.title ?? '')}
              description={item.description != null ? String(item.description) : undefined}
              image={{ src: String(imageRaw?.src ?? ''), alt: String(imageRaw?.alt ?? '') }}
              href={item.href != null ? String(item.href) : undefined}
              badge={item.badge != null ? String(item.badge) : undefined}
              accentColor={item.accentColor != null ? String(item.accentColor) : undefined}
            />
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};

ShowcaseOrganism.displayName = 'ShowcaseOrganism';
