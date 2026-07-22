'use client';
/**
 * SegmentRenderer Organism Component
 *
 * Renders a parsed array of LessonSegments — markdown, code, quizzes,
 * activation prompts, connections, reflections, Bloom questions.
 * The `visualization` segment type is passed through as a no-op unless the
 * caller provides `onRenderVisualization` (future extensibility hook).
 *
 * Event Contract:
 * - Delegates to child molecules: UI:SAVE_ACTIVATION, UI:SAVE_REFLECTION, UI:ANSWER_BLOOM
 * - entityAware: false
 */

import React from 'react';
import { MarkdownContent } from '../molecules/markdown/MarkdownContent';
import { CodeBlock } from '../molecules/markdown/CodeBlock';
import { QuizBlock } from '../molecules/QuizBlock';
import { ActivationBlock } from '../molecules/ActivationBlock';
import { ConnectionBlock } from '../molecules/ConnectionBlock';
import { ReflectionBlock } from '../molecules/ReflectionBlock';
import { BloomQuizBlock } from '../molecules/BloomQuizBlock';
import { CodeRunnerPanel, type CodeSimulationOutput } from './CodeRunnerPanel';
import { cn } from '../../../lib/cn';
import type { LessonSegment, LessonUserProgress, InteractiveOrbitalType } from '../../../lib/parseLessonSegments';

export type { LessonSegment, LessonUserProgress, CodeSimulationOutput };

export interface SegmentRendererProps {
  /** Parsed lesson segments (see `parseLessonSegments`) */
  segments: LessonSegment[];
  /** Additional CSS classes for the root container */
  className?: string;
  /** CSS classes for the outer wrapping div */
  containerClassName?: string;
  /** User progress for restoring activation/reflection state */
  userProgress?: LessonUserProgress;
  /**
   * Simulate executing runnable code blocks. Omit to render runnable blocks
   * as read-only. Real execution is a future track.
   */
  onRunCodeSimulation?: (code: string, language: string) => Promise<CodeSimulationOutput>;
  /**
   * Optional render slot for `visualization` segment types. When not provided,
   * visualization segments are silently skipped. Callers can wire this to any
   * custom component or orbital generator.
   */
  onRenderVisualization?: (type: InteractiveOrbitalType, description: string, index: number) => React.ReactNode;
}

export const SegmentRenderer: React.FC<SegmentRendererProps> = ({
  segments,
  className,
  containerClassName,
  userProgress,
  onRunCodeSimulation,
  onRenderVisualization,
}) => {
  if (segments.length === 0) return null;

  let reflectIndex = 0;
  let bloomIndex = 0;

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg p-2 md:p-4 overflow-x-auto space-y-6',
        containerClassName,
        className,
      )}
    >
      {segments.map((segment, index) => {
        if (segment.type === 'markdown') {
          return <MarkdownContent key={`md-${index}`} content={segment.content} />;
        }

        if (segment.type === 'code') {
          if (segment.runnable && onRunCodeSimulation) {
            return (
              <CodeRunnerPanel
                key={`code-${index}`}
                language={segment.language}
                code={segment.content}
                runnable
                onRun={(code) => onRunCodeSimulation(code, segment.language)}
              />
            );
          }
          return (
            <CodeBlock
              key={`code-${index}`}
              language={segment.language ?? 'text'}
              code={segment.content}
            />
          );
        }

        if (segment.type === 'quiz') {
          return (
            <QuizBlock key={`quiz-${index}`} question={segment.question} answer={segment.answer} />
          );
        }

        if (segment.type === 'activate') {
          return (
            <ActivationBlock
              key={`activate-${index}`}
              question={segment.question}
              savedResponse={userProgress?.activationResponse}
            />
          );
        }

        if (segment.type === 'connect') {
          return <ConnectionBlock key={`connect-${index}`} content={segment.content} />;
        }

        if (segment.type === 'reflect') {
          const ri = reflectIndex++;
          return (
            <ReflectionBlock
              key={`reflect-${index}`}
              prompt={segment.prompt}
              index={ri}
              savedNote={userProgress?.reflectionNotes?.[ri]}
            />
          );
        }

        if (segment.type === 'bloom') {
          const bi = bloomIndex++;
          return (
            <BloomQuizBlock
              key={`bloom-${index}`}
              level={segment.level}
              question={segment.question}
              answer={segment.answer}
              index={bi}
              isAnswered={userProgress?.bloomAnswered?.[bi]}
            />
          );
        }

        if (segment.type === 'visualization') {
          return onRenderVisualization
            ? (onRenderVisualization(segment.visualizationType, segment.description, index) ?? null)
            : null;
        }

        return null;
      })}
    </div>
  );
};

SegmentRenderer.displayName = 'SegmentRenderer';
