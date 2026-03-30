import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface DialogueBubbleProps {
  /** Speaker name displayed at the top */
  speaker?: string;
  /** Dialogue text content */
  text: string;
  /** URL for the speaker portrait image */
  portrait?: string;
  /** Position of the bubble on screen */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

export function DialogueBubble({
  speaker,
  text,
  portrait,
  position = 'bottom',
  className,
}: DialogueBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg bg-black/80 backdrop-blur-sm px-4 py-3 border border-white/10',
        position === 'top' ? 'rounded-bl-none' : 'rounded-tl-none',
        className
      )}
    >
      {portrait && (
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400/60">
          <img
            src={portrait}
            alt={speaker ?? 'speaker'}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        {speaker && (
          <span className="text-sm font-bold text-yellow-400">
            {speaker}
          </span>
        )}
        <span className="text-sm text-[var(--color-foreground)] leading-relaxed">
          {text}
        </span>
      </div>
    </div>
  );
}

DialogueBubble.displayName = 'DialogueBubble';
