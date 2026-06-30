import * as React from 'react';
import type { Asset } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import { GameIcon } from './GameIcon';

const DEFAULT_PORTRAIT: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/characters/archetypes/04_hero.png',
  role: 'effect',
  category: 'character',
};

export interface DialogueBubbleProps {
  /** Speaker name displayed at the top */
  speaker?: string;
  /** Dialogue text content */
  text: string;
  /** Speaker portrait asset */
  portrait?: Asset;
  /** Position of the bubble on screen */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

export function DialogueBubble({
  speaker = 'Hero',
  text = 'The dungeon awaits. Choose your path wisely.',
  portrait = DEFAULT_PORTRAIT,
  position = 'bottom',
  className,
}: DialogueBubbleProps) {
  return (
    <Box
      className={cn(
        'flex items-start gap-3 rounded-container bg-background/80 backdrop-blur-sm px-4 py-3 border border-border/10',
        position === 'top' ? 'rounded-bl-none' : 'rounded-tl-none',
        className
      )}
    >
      {portrait && (
        <Box className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-warning/60">
          <GameIcon assetUrl={portrait} icon="image" size={48} alt={speaker ?? 'speaker'} className="w-full h-full object-cover" />
        </Box>
      )}
      <Box className="flex flex-col gap-1 min-w-0">
        {speaker && (
          <Typography as="span" className="text-sm font-bold text-warning">
            {speaker}
          </Typography>
        )}
        <Typography as="span" className="text-sm text-foreground leading-relaxed">
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

DialogueBubble.displayName = 'DialogueBubble';
