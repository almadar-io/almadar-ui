'use client';
/**
 * ActivationBlock Molecule Component
 *
 * Pre-lesson activation prompt. Invites learners to surface prior knowledge
 * before content begins. Emits `UI:SAVE_ACTIVATION { response }`.
 *
 * Event Contract:
 * - Emits: UI:SAVE_ACTIVATION { response }
 * - entityAware: false
 */

import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useEventBus } from '../../../hooks/useEventBus';
import { cn } from '../../../lib/cn';

export interface ActivationBlockProps {
  /** The prior-knowledge question */
  question: string;
  /** Pre-filled response from saved state */
  savedResponse?: string;
  /** Event name emitted on save/skip (as `UI:<saveEvent>`). Defaults to 'SAVE_ACTIVATION'. */
  saveEvent?: string;
  /** Additional CSS classes */
  className?: string;
}

export const ActivationBlock: React.FC<ActivationBlockProps> = ({
  question,
  savedResponse,
  saveEvent = 'SAVE_ACTIVATION',
  className,
}) => {
  const [response, setResponse] = useState(savedResponse ?? '');
  const [isExpanded, setIsExpanded] = useState(!savedResponse);
  const { emit } = useEventBus();

  const handleSubmit = () => {
    emit(`UI:${saveEvent}`, { response });
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        'bg-primary/10 border-2 border-primary rounded-lg p-5 mb-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="text-primary flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h4 className="font-semibold text-primary mb-2">Before You Begin...</h4>
          <p className="text-foreground mb-3 text-sm md:text-base">{question}</p>

          {isExpanded ? (
            <>
              <textarea
                className="w-full p-3 border border-input rounded-md bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                placeholder="Jot down your thoughts..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover text-sm font-medium transition-colors"
                >
                  Continue to Lesson →
                </button>
                <button
                  onClick={() => {
                    emit(`UI:${saveEvent}`, { response: '' });
                    setIsExpanded(false);
                  }}
                  className="px-4 py-2 text-primary hover:underline text-sm"
                >
                  Skip for now
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              ✓ Answered · Edit response
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ActivationBlock.displayName = 'ActivationBlock';
