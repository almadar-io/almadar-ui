'use client';
/**
 * ArticleSection Molecule Component
 *
 * A centered content section with a title and constrained max-width,
 * suitable for article or documentation layouts.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

export interface ArticleSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: React.ReactNode;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

// Responsive max-width ladders. Below `sm` (≤640) every size is
// `max-w-full` so a mobile viewport doesn't waste edge space; the
// constraint kicks in at tablet (`sm:`) and tightens at laptop (`md:`).
const maxWidthMap: Record<NonNullable<ArticleSectionProps['maxWidth']>, string> = {
  sm: 'max-w-full sm:max-w-xl md:max-w-2xl',
  md: 'max-w-full sm:max-w-2xl md:max-w-3xl',
  lg: 'max-w-full sm:max-w-3xl md:max-w-4xl',
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  title,
  children,
  maxWidth = 'md',
  className,
}) => {
  return (
    <Box
      className={cn(
        'w-full',
        className,
      )}
      padding="md"
    >
      <VStack gap="lg" align="start" className={cn('w-full mx-auto', maxWidthMap[maxWidth])}>
        <Typography variant="h2">
          {title}
        </Typography>
        <Box className="w-full">
          {children}
        </Box>
      </VStack>
    </Box>
  );
};

ArticleSection.displayName = 'ArticleSection';
