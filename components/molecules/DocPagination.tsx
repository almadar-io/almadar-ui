'use client';
/**
 * DocPagination Molecule
 *
 * Previous/Next navigation links for documentation pages.
 * Composed from HStack, Box, VStack, Icon, and Typography atoms.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { VStack } from '../atoms/Stack';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';

export interface DocPaginationLink {
  label: string;
  href: string;
  category?: string;
}

export interface DocPaginationProps {
  /** Previous page link */
  prev?: DocPaginationLink;
  /** Next page link */
  next?: DocPaginationLink;
  /** Additional class names */
  className?: string;
}

const linkCardStyles = [
  'border border-border',
  'rounded-md',
  'p-4',
  'transition-all',
  'hover:border-primary',
  'hover:shadow-lg',
  'no-underline',
  'flex-1',
  'min-w-0',
  'cursor-pointer',
].join(' ');

export function DocPagination({ prev, next, className }: DocPaginationProps) {
  if (!prev && !next) return null;

  return (
    <HStack
      justify="between"
      align="stretch"
      gap="md"
      className={cn('w-full', className)}
    >
      {/* Previous link */}
      {prev ? (
        <Box
          className={cn(linkCardStyles, 'group')}
          onClick={() => { window.location.href = prev.href; }}
          role="link"
          tabIndex={0}
        >
          <HStack align="center" gap="sm">
            <Icon name="arrow-left" size="md" className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            <VStack gap="none" align="start">
              {prev.category ? (
                <Typography variant="caption" color="muted">
                  {prev.category}
                </Typography>
              ) : null}
              <Typography
                variant="body"
                className="group-hover:text-primary transition-colors"
              >
                {prev.label}
              </Typography>
            </VStack>
          </HStack>
        </Box>
      ) : (
        <Box className="flex-1" />
      )}

      {/* Next link */}
      {next ? (
        <Box
          className={cn(linkCardStyles, 'group text-right')}
          onClick={() => { window.location.href = next.href; }}
          role="link"
          tabIndex={0}
        >
          <HStack align="center" justify="end" gap="sm">
            <VStack gap="none" align="end">
              {next.category ? (
                <Typography variant="caption" color="muted">
                  {next.category}
                </Typography>
              ) : null}
              <Typography
                variant="body"
                className="group-hover:text-primary transition-colors"
              >
                {next.label}
              </Typography>
            </VStack>
            <Icon name="arrow-right" size="md" className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </HStack>
        </Box>
      ) : (
        <Box className="flex-1" />
      )}
    </HStack>
  );
}
