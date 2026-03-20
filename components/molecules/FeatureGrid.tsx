'use client';
/**
 * FeatureGrid Molecule Component
 *
 * A responsive grid layout for displaying multiple FeatureCards.
 * Composes SimpleGrid and FeatureCard molecules.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { SimpleGrid } from './SimpleGrid';
import { FeatureCard, type FeatureCardProps } from './FeatureCard';

export interface FeatureGridProps {
  /** Array of feature card configurations */
  items: FeatureCardProps[];
  /** Number of grid columns */
  columns?: 2 | 3 | 4 | 6;
  /** Gap between grid items */
  gap?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  items,
  columns = 3,
  gap = 'md',
  className,
}) => {
  return (
    <SimpleGrid
      cols={columns}
      gap={gap}
      className={cn(className)}
    >
      {items.map((item, index) => (
        <FeatureCard key={`${item.title}-${index}`} {...item} />
      ))}
    </SimpleGrid>
  );
};

FeatureGrid.displayName = 'FeatureGrid';
