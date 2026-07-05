import * as React from 'react';
import { cn } from '../../../lib/cn';
import { resolveIcon, type IconInput } from '../../core/atoms/Icon';
import { useEventBus } from '../../../hooks/useEventBus';
import { Button } from '../../core/atoms/Button';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';
import { GameIcon } from './GameIcon';
import type { Asset, EventKey } from '@almadar/core';

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
  /** Declarative event name — emits UI:{action} via eventBus on click */
  action?: EventKey;
  /** Semantic payload emitted with the action (e.g. `{ nextId, choiceIndex }` for a branching choice). */
  payload?: Record<string, string | number | boolean>;
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
  action,
  payload,
  className,
}: ChoiceButtonProps) {
  const eventBus = useEventBus();
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={() => { if (action) eventBus.emit(`UI:${action}`, payload ?? {}); onClick?.(); }}
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
        <Typography
          as="span"
          className={cn(
            'flex-shrink-0 font-mono font-bold text-sm',
            selected ? 'text-accent' : 'text-muted-foreground'
          )}
        >
          {index}.
        </Typography>
      )}
      {assetUrl ? (
        <GameIcon assetUrl={assetUrl} icon="image" size={16} className="flex-shrink-0" />
      ) : icon ? (
        <Box as="span" className="flex-shrink-0 text-sm">
          {typeof icon === 'string'
            ? (() => { const I = resolveIcon(icon); return I ? <I className="w-4 h-4" /> : null; })()
            : (() => { const I = icon; return <I className="w-4 h-4" />; })()}
        </Box>
      ) : null}
      <Typography as="span" className="text-sm leading-snug">{text}</Typography>
    </Button>
  );
}

ChoiceButton.displayName = 'ChoiceButton';
