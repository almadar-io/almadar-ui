'use client';
/**
 * PullQuote Molecule Component
 *
 * Large italic text with a thick left border in primary color.
 * Breaks up prose walls on long-form pages like Vision and case studies.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

export interface PullQuoteProps {
  /** The quote text */
  children: string;
  /** Additional class names */
  className?: string;
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  children,
  className,
}) => {
  return (
    <Box
      className={cn(
        'border-l-4 border-l-[var(--color-primary)]',
        'pl-6 py-2 my-6',
        className,
      )}
    >
      <Typography
        variant="large"
        className="italic text-[var(--color-foreground)] opacity-90"
      >
        {children}
      </Typography>
    </Box>
  );
};

PullQuote.displayName = 'PullQuote';
