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
import { VStack } from '../../atoms/Stack';
import { Typography } from '../../atoms/Typography';
import { Divider } from '../../atoms/Divider';
import { ScaledDiagram } from '../../molecules/ScaledDiagram';
import { ContentRenderer } from '../ContentRenderer';
import { JazariStateMachine } from '../JazariStateMachine';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';
// Internal rendering component — takes typed content-model props directly
// (BookData / BookPart / BookChapter), not schema entity data. Does not
// extend EntityDisplayProps; its parent (BookViewer) owns the entity-prop
// contract.
import type { BookChapter } from './types';

export interface BookChapterViewProps {
  /** Additional CSS classes */
  className?: string;
  chapter: BookChapter;
  direction?: 'rtl' | 'ltr';
}

export const BookChapterView: React.FC<BookChapterViewProps> = ({
  chapter,
  direction,
  className,
}) => {
  const { t: _t } = useTranslate();

  return (
    <VStack
      gap="lg"
      className={cn('px-6 py-8 max-w-4xl mx-auto w-full', className)}
      style={{ direction }}
    >
      <Typography variant="h1" className="text-3xl font-bold">
        {chapter.title}
      </Typography>

      <Divider />

      {!!chapter.orbitalSchema && (
        <ScaledDiagram>
          <JazariStateMachine
            schema={chapter.orbitalSchema}
            direction={direction}
          />
        </ScaledDiagram>
      )}

      <ContentRenderer content={chapter.content} direction={direction} />
    </VStack>
  );
};

BookChapterView.displayName = 'BookChapterView';
