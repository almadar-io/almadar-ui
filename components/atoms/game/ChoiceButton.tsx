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
          ? 'bg-accent/15 border-accent text-foreground'
          : 'bg-muted/40 border-border text-foreground hover:bg-muted hover:border-border',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-muted/40 hover:border-border',
        className
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            'flex-shrink-0 font-mono font-bold text-sm',
            selected ? 'text-accent' : 'text-muted-foreground'
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
