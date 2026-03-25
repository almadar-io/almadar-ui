'use client';
/**
 * DocTOC Molecule Component
 *
 * A table of contents component with active section highlighting.
 * Composes from Box, VStack, and Typography atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

export interface DocTOCItem {
  /** Heading element id to link to */
  id: string;
  /** Display label */
  label: string;
  /** Heading level: 2 for h2, 3 for h3, etc. */
  level: number;
}

export interface DocTOCProps {
  /** Table of contents items */
  items: DocTOCItem[];
  /** Currently active section id */
  activeId?: string;
  /** Additional CSS classes */
  className?: string;
}

export const DocTOC: React.FC<DocTOCProps> = ({
  items,
  activeId,
  className,
}) => {
  return (
    <Box
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Table of contents"
    >
      <VStack gap="none">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const indent = item.level >= 3 ? 'pl-4' : 'pl-0';

          return (
            <Box
              key={item.id}
              className={cn(
                'block py-1.5 no-underline transition-colors border-l-2 cursor-pointer',
                'pl-3',
                indent,
                isActive
                  ? 'border-l-primary'
                  : 'border-l-transparent hover:border-l-[var(--color-muted)]',
              )}
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              role="link"
              tabIndex={0}
            >
              <Typography
                variant="caption"
                className={cn(
                  'transition-colors',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                as="span"
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

DocTOC.displayName = 'DocTOC';
