'use client';
/**
 * DocTOC Molecule Component
 *
 * A table of contents component with active section highlighting.
 * Composes from Box, VStack, and Typography atoms.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import type { A11yProps } from '@almadar/core';
import { domPassthrough } from '../../../lib/domPassthrough';
import { Box } from '../atoms/Box';
import { Button } from '../atoms/Button';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { useTranslate } from '../../../hooks/useTranslate';

export interface DocTOCItem {
  /** Heading element id to link to */
  id: string;
  /** Display label */
  label: string;
  /** Heading level: 2 for h2, 3 for h3, etc. */
  level: number;
}

export interface DocTOCProps extends Omit<React.AriaAttributes, keyof A11yProps>, A11yProps {
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
  ...rest
}) => {
  const { t } = useTranslate();
  return (
    <Box
      className={cn('w-full', className)}
      role="navigation"
      aria-label={t('aria.tableOfContents')}
      {...domPassthrough(rest)}
    >
      <VStack gap="none">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const indent = item.level >= 3 ? 'pl-4' : 'pl-0';

          return (
            <Button
              key={item.id}
              variant="ghost"
              href={`#${item.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                'h-auto w-full justify-start rounded-none py-1.5 pr-0 font-normal border-l-heavy',
                'pl-3',
                indent,
                isActive
                  ? 'border-l-primary'
                  : 'border-l-transparent hover:border-l-[var(--color-muted)]',
              )}
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
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
};

DocTOC.displayName = 'DocTOC';