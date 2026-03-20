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
import { cn } from '../../lib/cn';
import { useTranslate } from '../../hooks/useTranslate';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { SimpleGrid } from '../molecules/SimpleGrid';
import { TeamCard } from '../molecules/TeamCard';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { TeamMemberEntity } from './marketing-types';

export interface TeamOrganismProps extends EntityDisplayProps<TeamMemberEntity> {
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

  const items = useMemo(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity as TeamMemberEntity]
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
            key={member.id}
            name={member.name}
            nameAr={member.nameAr}
            role={member.role}
            bio={member.bio}
            avatar={member.avatar}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

TeamOrganism.displayName = 'TeamOrganism';
