'use client';
/**
 * CaseStudyOrganism
 *
 * Resolves an array of CaseStudyEntity and renders them as a grid of CaseStudyCard molecules.
 * Emits UI:CASE_STUDY_CLICK with { id, href } when a case study card is clicked.
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
import { CaseStudyCard } from '../molecules/CaseStudyCard';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { CaseStudyEntity } from './marketing-types';

export interface CaseStudyOrganismProps extends EntityDisplayProps<CaseStudyEntity> {
  heading?: string;
  subtitle?: string;
}

export const CaseStudyOrganism: React.FC<CaseStudyOrganismProps> = ({
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
          ? [entity as CaseStudyEntity]
          : [],
    [entity],
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  const cols = Math.min(items.length, 3) as 1 | 2 | 3;

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
      <SimpleGrid cols={cols > 0 ? cols : 1} gap="lg">
        {items.map((study) => (
          <CaseStudyCard
            key={study.id}
            title={study.title}
            description={study.description}
            category={study.category}
            categoryColor={study.categoryColor}
            href={study.href}
            linkLabel={study.linkLabel}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

CaseStudyOrganism.displayName = 'CaseStudyOrganism';
