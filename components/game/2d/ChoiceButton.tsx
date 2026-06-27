import * as React from 'react';
import { cn } from '../../../lib/cn';
import { resolveIcon, type IconInput } from '../../core/atoms/Icon';
import type { Asset } from '@almadar/core';

export interface ChoiceButtonProps {
  /** Choice text content */
  text: string;
  /** Choice index number (displayed as prefix) */
  index?: number;
  /** Sprite asset — takes precedence over icon when provided */
  assetUrl?: Asset;
  /** Icon displayed before the text */
  icon?: IconInput;
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
  text = 'Charge forward into the fray',
  index,
  assetUrl,
  icon,
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
        'w-full text-left px-4 py-2.5 rounded-interactive border transition-all duration-150',
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
      {assetUrl ? (
        <img
          src={assetUrl.url}
          alt=""
          width={16}
          height={16}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          className="flex-shrink-0"
        />
      ) : icon ? (
        <span className="flex-shrink-0 text-sm">
          {typeof icon === 'string'
            ? (() => { const I = resolveIcon(icon); return I ? <I className="w-4 h-4" /> : null; })()
            : (() => { const I = icon; return <I className="w-4 h-4" />; })()}
        </span>
      ) : null}
      <span className="text-sm leading-snug">{text}</span>
    </button>
  );
}

ChoiceButton.displayName = 'ChoiceButton';
