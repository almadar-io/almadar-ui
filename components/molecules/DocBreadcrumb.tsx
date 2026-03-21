'use client';
/**
 * DocBreadcrumb Molecule Component
 *
 * A breadcrumb navigation component for documentation pages.
 * Composes from HStack, Typography, and Icon atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

export interface DocBreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (omit for the current/last item) */
  href?: string;
}

export interface DocBreadcrumbProps {
  /** Breadcrumb path items, last item is treated as current page */
  items: DocBreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
}

export const DocBreadcrumb: React.FC<DocBreadcrumbProps> = ({
  items,
  className,
}) => {
  return (
    <Box
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Breadcrumb"
    >
      <HStack gap="xs" align="center" wrap>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <Icon
                  name="chevron-right"
                  size="xs"
                  className="text-[var(--color-muted-foreground)] shrink-0"
                />
              )}

              {isLast || !item.href ? (
                <Typography
                  variant="caption"
                  className={cn(
                    isLast
                      ? 'text-[var(--color-foreground)] font-medium'
                      : 'text-[var(--color-muted-foreground)]',
                  )}
                  as="span"
                >
                  {item.label}
                </Typography>
              ) : (
                <Box
                  className="no-underline cursor-pointer"
                  onClick={() => { if (item.href) window.location.href = item.href; }}
                  role="link"
                  tabIndex={0}
                >
                  <Typography
                    variant="caption"
                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                    as="span"
                  >
                    {item.label}
                  </Typography>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </HStack>
    </Box>
  );
};

DocBreadcrumb.displayName = 'DocBreadcrumb';
