/**
 * BookChapterView Organism
 *
 * Renders a single chapter: title + optional orbital diagram +
 * rich content via ContentRenderer.
 *
 * Event Contract:
 * - Delegates to ContentRenderer children
 */

import React from 'react';
import { VStack } from '../../../core/atoms/Stack';
import { Typography } from '../../../core/atoms/Typography';
import { Divider } from '../../../core/atoms/Divider';
import { ScaledDiagram } from '../../../core/molecules/ScaledDiagram';
import { ContentRenderer } from '../../../core/molecules/ContentRenderer';
import { JazariStateMachine } from '../../../core/molecules/JazariStateMachine';
import { useTranslate } from '../../../../hooks/useTranslate';
import { cn } from '../../../../lib/cn';
import type { EntityRow, OrbitalSchema } from '@almadar/core';

export interface BookChapterViewProps {
  /** Additional CSS classes */
  className?: string;
  /** Chapter row (`EntityRow` carrying title/content). */
  chapter: EntityRow;
  /** Embedded orbital diagram — passed SEPARATELY (off the entity boundary). */
  orbitalSchema?: OrbitalSchema;
  direction?: 'rtl' | 'ltr';
}

export const BookChapterView: React.FC<BookChapterViewProps> = ({
  chapter,
  orbitalSchema,
  direction,
  className,
}) => {
  const { t: _t } = useTranslate();
  const title = String(chapter.title ?? '');
  const content = String(chapter.content ?? '');

  return (
    <VStack
      gap="lg"
      className={cn('px-6 py-8 max-w-4xl mx-auto w-full', className)}
      style={{ direction }}
    >
      <Typography variant="h1" className="text-3xl font-bold">
        {title}
      </Typography>

      <Divider />

      {!!orbitalSchema && (
        <ScaledDiagram>
          <JazariStateMachine
            schema={orbitalSchema}
            direction={direction}
          />
        </ScaledDiagram>
      )}

      <ContentRenderer content={content} direction={direction} />
    </VStack>
  );
};

BookChapterView.displayName = 'BookChapterView';
