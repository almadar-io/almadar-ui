'use client';
/**
 * ConnectionBlock Molecule Component
 *
 * Surfaces prior-knowledge connections before new content.
 * Renders arbitrary markdown via MarkdownContent.
 *
 * Event Contract:
 * - No events emitted (display-only)
 * - entityAware: false
 */

import React from 'react';
import { Link2 } from 'lucide-react';
import { MarkdownContent } from './markdown/MarkdownContent';
import { cn } from '../../../lib/cn';

export interface ConnectionBlockProps {
  /** Markdown content summarising what the learner already knows */
  content: string;
  /** Additional CSS classes */
  className?: string;
}

export const ConnectionBlock: React.FC<ConnectionBlockProps> = ({ content, className }) => (
  <div
    className={cn(
      'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg p-5 mb-6',
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <Link2 className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" size={20} />
      <div className="flex-1">
        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
          Building On What You Know
        </h4>
        <div className="prose dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300">
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>
  </div>
);

ConnectionBlock.displayName = 'ConnectionBlock';
