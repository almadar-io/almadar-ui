/**
 * BookTableOfContents Molecule
 *
 * Renders a clickable table of contents grouped by parts.
 * Highlights the current chapter.
 *
 * Event Contract:
 * - Emits: UI:BOOK_NAVIGATE { chapterId }
 */

import React from 'react';
import { VStack, HStack } from '../../../core/atoms/Stack';
import { Typography } from '../../../core/atoms/Typography';
import { Button } from '../../../core/atoms/Button';
import { Box } from '../../../core/atoms/Box';
import { Badge } from '../../../core/atoms/Badge';
import { useTranslate } from '../../../../hooks/useTranslate';
import { cn } from '../../../../lib/cn';
import type { EntityRow } from '@almadar/core';

export interface BookTableOfContentsProps {
  /** Additional CSS classes */
  className?: string;
  /** Part rows (`EntityRow` carrying `title` + a `chapters: EntityRow[]`). */
  parts: readonly EntityRow[];
  currentChapterId?: string;
  direction?: 'rtl' | 'ltr';
}

export const BookTableOfContents: React.FC<BookTableOfContentsProps> = ({
  parts,
  currentChapterId,
  direction,
  className,
}) => {
  const { t } = useTranslate();

  return (
    <VStack
      gap="lg"
      className={cn('p-8 max-w-2xl mx-auto', className)}
      style={{ direction }}
    >
      <Typography variant="h1" className="text-3xl font-bold text-center mb-4">
        {t('book.tableOfContents')}
      </Typography>

      {(Array.isArray(parts) ? parts : []).map((part, partIdx) => {
        const chapters = (Array.isArray(part.chapters) ? part.chapters : []) as readonly EntityRow[];
        return (
        <VStack key={partIdx} gap="sm">
          <HStack gap="sm" align="center">
            <Badge variant="default" size="sm">
              {t('book.partNumber', { number: String(partIdx + 1) })}
            </Badge>
            <Typography variant="h3" className="font-semibold">
              {String(part.title ?? '')}
            </Typography>
          </HStack>

          <VStack gap="xs" className={direction === 'rtl' ? 'pr-6' : 'pl-6'}>
            {chapters.map((chapter) => {
              const id = chapter.id == null ? '' : String(chapter.id);
              const isCurrent = id === currentChapterId;
              return (
                <Button
                  key={id}
                  variant="ghost"
                  size="sm"
                  action="BOOK_NAVIGATE"
                  actionPayload={{ chapterId: id }}
                  className={cn(
                    'justify-start text-left w-full',
                    direction === 'rtl' && 'text-right',
                    isCurrent && 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
                  )}
                >
                  <Box className="truncate">
                    <Typography variant="body">
                      {String(chapter.title ?? '')}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </VStack>
        </VStack>
        );
      })}
    </VStack>
  );
};

BookTableOfContents.displayName = 'BookTableOfContents';
