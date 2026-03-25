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

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
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
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        className,
      )}
      padding="md"
    >
      <VStack gap="lg" align="start">
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
