'use client';
/**
 * DateRangeSelector Molecule Component
 *
 * Button group for selecting time range periods.
 * Pure UI molecule with no entity binding.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Button, HStack } from '../atoms';

export interface DateRangeSelectorOption {
  label: string;
  value: string;
}

const DEFAULT_OPTIONS: DateRangeSelectorOption[] = [
  { label: '1W', value: 'week' },
  { label: '1M', value: 'month' },
  { label: '3M', value: '3months' },
  { label: '1Y', value: 'year' },
];

export interface DateRangeSelectorProps {
  /** Available range options */
  options?: DateRangeSelectorOption[];
  /** Currently selected value */
  selected?: string;
  /** Callback when a range is selected */
  onSelect?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  options = DEFAULT_OPTIONS,
  selected = 'month',
  onSelect,
  className,
}) => {
  return (
    <HStack gap="xs" className={cn(className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={selected === option.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onSelect?.(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </HStack>
  );
};

DateRangeSelector.displayName = 'DateRangeSelector';
