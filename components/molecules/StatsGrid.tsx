'use client';
/**
 * StatsGrid Molecule Component
 *
 * A responsive grid of stat items showing value + label pairs.
 * Composes: SimpleGrid + VStack + Typography.
 * Uses StatDisplay internally when available for consistent styling.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { SimpleGrid } from './SimpleGrid';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

export interface StatsGridProps {
  stats: { value: string; label: string }[];
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 3,
  className,
}) => {
  return (
    <SimpleGrid cols={columns} gap="lg" className={cn('w-full', className)}>
      {stats.map((stat) => (
        <VStack key={stat.label} gap="xs" align="center" className="py-4">
          <Typography
            variant="h2"
            className="font-bold text-[var(--color-primary)]"
          >
            {stat.value}
          </Typography>
          <Typography variant="caption" color="muted">
            {stat.label}
          </Typography>
        </VStack>
      ))}
    </SimpleGrid>
  );
};

StatsGrid.displayName = 'StatsGrid';
