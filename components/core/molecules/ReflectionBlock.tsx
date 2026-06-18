'use client';
/**
 * ReflectionBlock Molecule Component
 *
 * Inline reflection prompt for deep processing. Emits `UI:SAVE_REFLECTION { index, note }`.
 *
 * Event Contract:
 * - Emits: UI:SAVE_REFLECTION { index, note }
 * - entityAware: false
 */

import React, { useState } from 'react';
import { PauseCircle } from 'lucide-react';
import { useEventBus } from '../../../hooks/useEventBus';
import { cn } from '../../../lib/cn';

export interface ReflectionBlockProps {
  /** The reflection prompt */
  prompt: string;
  /** Zero-based index of this block (used in the emitted event payload) */
  index: number;
  /** Pre-filled note from saved state */
  savedNote?: string;
  /** Event name emitted on save (as `UI:<saveEvent>`). Defaults to 'SAVE_REFLECTION'. */
  saveEvent?: string;
  /** Additional CSS classes */
  className?: string;
}

export const ReflectionBlock: React.FC<ReflectionBlockProps> = ({
  prompt,
  index,
  savedNote,
  saveEvent = 'SAVE_REFLECTION',
  className,
}) => {
  const [note, setNote] = useState(savedNote ?? '');
  const [isExpanded, setIsExpanded] = useState(false);
  const { emit } = useEventBus();

  const handleSave = () => {
    emit(`UI:${saveEvent}`, { index, note });
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        'my-6 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <PauseCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <div className="font-medium text-amber-900 dark:text-amber-100 mb-2">Pause & Reflect</div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{prompt}</p>

          {isExpanded ? (
            <>
              <textarea
                className="w-full p-2 border border-amber-300 dark:border-amber-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Your thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <button
                onClick={handleSave}
                className="mt-2 text-sm px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Save & Continue
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              {savedNote ? '✓ Answered · Edit' : 'Answer this question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ReflectionBlock.displayName = 'ReflectionBlock';
