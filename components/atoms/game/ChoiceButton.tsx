import * as React from 'react';
import { cn } from '../../../lib/cn';

export interface ChoiceButtonProps {
  /** Choice text content */
  text: string;
  /** Choice index number (displayed as prefix) */
  index?: number;
  /** Whether the choice is disabled */
  disabled?: boolean;
  /** Whether the choice is currently selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function ChoiceButton({
  text,
  index,
  disabled = false,
  selected = false,
  onClick,
  className,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2.5 rounded-md border transition-all duration-150',
        'flex items-center gap-2',
        selected
          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
          : 'bg-white/5 border-white/10 text-[var(--color-foreground)] hover:bg-white/10 hover:border-white/30',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-white/5 hover:border-white/10',
        className
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            'flex-shrink-0 font-mono font-bold text-sm',
            selected ? 'text-yellow-400' : 'text-gray-500'
          )}
        >
          {index}.
        </span>
      )}
      <span className="text-sm leading-snug">{text}</span>
    </button>
  );
}

ChoiceButton.displayName = 'ChoiceButton';
