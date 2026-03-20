'use client';
/**
 * StatsOrganism
 *
 * Resolves an array of StatEntity and renders them as a StatsGrid molecule.
 * Display-only organism with no event emissions.
 *
 * Closed Circuit Compliance:
 * - Receives ALL data via entity prop
 * - No events (display-only)
 */

import React, { useMemo } from 'react';
import { cn } from '../../lib/cn';
import { useTranslate } from '../../hooks/useTranslate';
import { StatsGrid } from '../molecules/StatsGrid';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { StatEntity } from './marketing-types';

export interface StatsOrganismProps extends EntityDisplayProps<StatEntity> {
  columns?: 2 | 3 | 4 | 6;
}

export const StatsOrganism: React.FC<StatsOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
  columns = 3,
}) => {
  const { t } = useTranslate();

  const items = useMemo(
    () =>
      Array.isArray(entity)
        ? entity
        : entity && typeof entity === 'object'
          ? [entity as StatEntity]
          : [],
    [entity],
  );

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  const stats = items.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  return (
    <StatsGrid
      stats={stats}
      columns={columns}
      className={cn(className)}
    />
  );
};

StatsOrganism.displayName = 'StatsOrganism';
