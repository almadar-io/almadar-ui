'use client';
/**
 * TeamOrganism
 *
 * Resolves an array of TeamMemberEntity and renders them as a grid of TeamCard molecules.
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
import { SimpleGrid } from '../../core/molecules/SimpleGrid';
import { TeamCard } from '../molecules/TeamCard';
import { LoadingState } from '../../core/molecules/LoadingState';
import { ErrorState } from '../../core/molecules/ErrorState';
import type { EntityRow } from '@almadar/core';
import type { DisplayStateProps } from '../../core/organisms/types';

export interface TeamOrganismProps extends DisplayStateProps {
  entity?: EntityRow | readonly EntityRow[];
  heading?: string;
  subtitle?: string;
}

export const TeamOrganism: React.FC<TeamOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
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

  const cols = Math.min(items.length, 4) as 1 | 2 | 3 | 4;

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
        {items.map((member) => (
          <TeamCard
            key={String(member.id ?? '')}
            name={String(member.name ?? '')}
            nameAr={member.nameAr != null ? String(member.nameAr) : undefined}
            role={String(member.role ?? '')}
            bio={String(member.bio ?? '')}
            avatar={member.avatar != null ? String(member.avatar) : undefined}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

TeamOrganism.displayName = 'TeamOrganism';
