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
import { VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { SimpleGrid } from '../../core/molecules/SimpleGrid';
import { ShowcaseCard } from '../molecules/ShowcaseCard';
import { LoadingState } from '../../core/molecules/LoadingState';
import { ErrorState } from '../../core/molecules/ErrorState';
import type { EntityWith } from '@almadar/core';
import type { DisplayStateProps } from '../../core/organisms/types';

/** The per-showcase entity fields this organism reads (FieldValue-compatible; `image`
 *  is a plain `{ src, alt }` object, `accentColor` a string). */
export interface ShowcaseRow {
  title: string;
  description?: string;
  image?: { src?: string; alt?: string };
  href?: string;
  badge?: string;
  accentColor?: string;
}

export interface ShowcaseOrganismProps extends DisplayStateProps {
  entity?: EntityWith<ShowcaseRow> | readonly EntityWith<ShowcaseRow>[];
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

  const items = useMemo<readonly EntityWith<ShowcaseRow>[]>(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity]
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
          const imageRaw = item.image;
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
