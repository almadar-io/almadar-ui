/**
 * ContentRenderer Organism
 *
 * Renders rich content as a sequence of typed segments: markdown, code,
 * orbital diagrams (via JazariStateMachine), and quiz blocks. Accepts
 * either raw content string (auto-parsed) or pre-parsed segments.
 *
 * Event Contract:
 * - Delegates to child components (CodeBlock -> UI:COPY_CODE)
 * - entityAware: false
 */

import React, { useMemo } from 'react';
import { VStack } from '../atoms/VStack';
import { MarkdownContent } from '../molecules/markdown/MarkdownContent';
import { CodeBlock } from '../molecules/markdown/CodeBlock';
import { QuizBlock } from '../molecules/QuizBlock';
import { JazariStateMachine } from './JazariStateMachine';
import {
  parseContentSegments,
  type ContentSegment,
} from '../../lib/parseContentSegments';
import { useTranslate } from '../../hooks/useTranslate';
import { cn } from '../../lib/cn';
import type { EntityDisplayProps } from './types';

export interface ContentRendererProps extends EntityDisplayProps {
  /** Raw content string — auto-parsed into segments */
  content?: string;
  /** Pre-parsed segments (overrides content) */
  segments?: ContentSegment[];
  /** Text direction for markdown */
  direction?: 'rtl' | 'ltr';
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  segments: segmentsProp,
  direction,
  className,
}) => {
  const { t: _t } = useTranslate();

  const segments = useMemo(
    () => segmentsProp ?? parseContentSegments(content),
    [segmentsProp, content],
  );

  if (segments.length === 0) return null;

  return (
    <VStack gap="md" className={cn('w-full', className)}>
      {segments.map((segment, i) => {
        const key = `seg-${i}`;

        switch (segment.type) {
          case 'markdown':
            return (
              <MarkdownContent
                key={key}
                content={segment.content}
                direction={direction}
              />
            );

          case 'code':
            return (
              <CodeBlock
                key={key}
                code={segment.content}
                language={segment.language}
              />
            );

          case 'orbital':
            return (
              <VStack key={key} gap="sm">
                <CodeBlock
                  code={segment.content}
                  language={segment.language}
                />
                <JazariStateMachine
                  schema={segment.schema as Record<string, unknown>}
                  direction={direction}
                />
              </VStack>
            );

          case 'quiz':
            return (
              <QuizBlock
                key={key}
                question={segment.question}
                answer={segment.answer}
              />
            );

          default:
            return null;
        }
      })}
    </VStack>
  );
};

ContentRenderer.displayName = 'ContentRenderer';
