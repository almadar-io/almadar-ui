'use client';
/**
 * BloomQuizBlock Molecule Component
 *
 * Practice Q&A with Bloom's Taxonomy level badge. Emits `UI:ANSWER_BLOOM { index, level }`.
 *
 * Event Contract:
 * - Emits: UI:ANSWER_BLOOM { index, level }
 * - entityAware: false
 */

import React, { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { MarkdownContent } from './markdown/MarkdownContent';
import { CodeBlock } from './markdown/CodeBlock';
import { parseMarkdownWithCodeBlocks } from '../../../lib/lessonSegmentUtils';
import { useEventBus } from '../../../hooks/useEventBus';
import { cn } from '../../../lib/cn';
import type { CodeLanguage } from './markdown/CodeBlock';

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

const BLOOM_CONFIG: Record<BloomLevel, { color: string; bgColor: string; label: string }> = {
  remember:   { color: 'bg-gray-500',   bgColor: 'bg-gray-50 dark:bg-gray-900/30',   label: 'Remember'   },
  understand: { color: 'bg-blue-500',   bgColor: 'bg-blue-50 dark:bg-blue-900/30',   label: 'Understand' },
  apply:      { color: 'bg-green-500',  bgColor: 'bg-green-50 dark:bg-green-900/30', label: 'Apply'      },
  analyze:    { color: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', label: 'Analyze'  },
  evaluate:   { color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/30', label: 'Evaluate' },
  create:     { color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/30', label: 'Create'   },
};

export interface BloomQuizBlockProps {
  level: BloomLevel;
  question: string;
  answer: string;
  /** Zero-based index (used in the emitted event payload) */
  index?: number;
  /** Whether the learner has already answered */
  isAnswered?: boolean;
  /** Event name emitted on first reveal (as `UI:<answerEvent>`). Defaults to 'ANSWER_BLOOM'. */
  answerEvent?: string;
  /** Additional CSS classes */
  className?: string;
}

export const BloomQuizBlock: React.FC<BloomQuizBlockProps> = ({
  level,
  question,
  answer,
  index,
  isAnswered,
  answerEvent = 'ANSWER_BLOOM',
  className,
}) => {
  const [revealed, setRevealed] = useState(false);
  const config = BLOOM_CONFIG[level];
  const { emit } = useEventBus();

  const questionSegments = useMemo(() => parseMarkdownWithCodeBlocks(question), [question]);
  const answerSegments = useMemo(() => parseMarkdownWithCodeBlocks(answer), [answer]);

  const handleReveal = () => {
    if (!revealed) {
      emit(`UI:${answerEvent}`, { index: index ?? 0, level });
    }
    setRevealed(!revealed);
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-indigo-100 dark:border-indigo-800 p-4 my-4 transition-all',
        config.bgColor,
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {index !== undefined && (
            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              Question {index + 1}
            </span>
          )}
          <span className={cn(config.color, 'text-white text-xs px-2 py-1 rounded-full font-medium')}>
            {config.label}
          </span>
        </div>
        {isAnswered && (
          <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
        )}
      </div>

      <div className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3 space-y-2">
        {questionSegments.map((segment, idx) =>
          segment.type === 'markdown' ? (
            <MarkdownContent key={`q-md-${idx}`} content={segment.content} />
          ) : (
            <CodeBlock
              key={`q-code-${idx}`}
              language={(segment.language ?? 'text') as CodeLanguage}
              code={segment.content}
            />
          ),
        )}
      </div>

      <button
        type="button"
        className="inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        onClick={handleReveal}
      >
        {revealed ? 'Hide Answer' : 'Reveal Answer'}
      </button>

      {revealed && (
        <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 p-3 text-sm text-slate-800 dark:text-gray-200 shadow-sm border border-indigo-100 dark:border-indigo-800 mt-3 space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
            Answer:
          </div>
          {answerSegments.map((segment, idx) =>
            segment.type === 'markdown' ? (
              <MarkdownContent key={`a-md-${idx}`} content={segment.content} />
            ) : (
              <CodeBlock
                key={`a-code-${idx}`}
                language={(segment.language ?? 'text') as CodeLanguage}
                code={segment.content}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

BloomQuizBlock.displayName = 'BloomQuizBlock';
