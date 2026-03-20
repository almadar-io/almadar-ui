'use client';
/**
 * PricingGrid Molecule Component
 *
 * A responsive grid of PricingCard molecules.
 * Composes: SimpleGrid + PricingCard.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { SimpleGrid } from './SimpleGrid';
import { PricingCard, type PricingCardProps } from './PricingCard';

export interface PricingGridProps {
  plans: PricingCardProps[];
  className?: string;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
  plans,
  className,
}) => {
  const cols = Math.min(plans.length, 4) as 1 | 2 | 3 | 4;

  return (
    <SimpleGrid
      cols={cols > 0 ? cols : 1}
      gap="lg"
      className={cn('items-stretch', className)}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.name} {...plan} />
      ))}
    </SimpleGrid>
  );
};

PricingGrid.displayName = 'PricingGrid';
