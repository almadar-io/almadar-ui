'use client';
import * as React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Typography } from '../../core/atoms/Typography';
import { AtlasImage } from '../../core/atoms/AtlasImage';
import { GameIcon } from './GameIcon';

export interface GameCardProps {
  id: string;
  cost?: number;
  /** Card art asset */
  art?: Asset;
  /** Asset rendered as the card border/frame via backgroundImage; falls back to CSS border styling when absent. */
  frameAsset?: Asset;
  attack?: number;
  defense?: number;
  name?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Size variant — controls card dimensions and art pixel size */
  size?: 'sm' | 'md' | 'lg';
  /**
   * One-shot pose LOLO drives on a transition (`DRAW`/`PLAY`), auto-reverted
   * to `'idle'` by a short tick — same idiom as `HealthBar.animated`, plain
   * CSS transform driven off a prop, no internal timer here.
   */
  animState?: 'idle' | 'drawn' | 'played' | 'flipped';
  /** Direct click callback */
  onClick?: (id: string) => void;
  /** Event-bus event emitted with `{ cardId }` on click */
  clickEvent?: EventEmit<{ cardId: string }>;
  className?: string;
}

const cardSizeMap = {
  sm: 'w-16 h-24',
  md: 'w-20 h-28',
  lg: 'w-24 h-36',
};

const artPxMap = { sm: 40, md: 52, lg: 64 };

/** One-shot pose classes for `animState` — plain CSS transform, no new deps. */
const ANIM_STATE_CLASS: Record<string, string> = {
  idle: '',
  drawn: 'scale-105',
  played: '-translate-y-2 opacity-80',
  flipped: 'scale-x-0',
};

export function GameCard({
  id,
  cost,
  art,
  frameAsset,
  attack,
  defense,
  name,
  selected = false,
  disabled = false,
  size = 'md',
  animState = 'idle',
  onClick,
  clickEvent,
  className,
}: GameCardProps): React.JSX.Element {
  const eventBus = useEventBus();

  const handleClick = React.useCallback(() => {
    if (disabled) return;
    onClick?.(id);
    if (clickEvent) eventBus.emit(`UI:${clickEvent}`, { cardId: id });
  }, [disabled, id, onClick, clickEvent, eventBus]);

  const artPx = artPxMap[size];

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={disabled}
      title={name}
      className={cn(
        'relative isolate flex flex-col items-center rounded-interactive',
        'px-1.5 pt-1.5 pb-1 transition-all duration-150',
        frameAsset?.url ? 'border-0' : 'border-2 bg-card/90',
        cardSizeMap[size],
        disabled
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-accent hover:brightness-125 hover:-translate-y-1 cursor-pointer',
        selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background -translate-y-1',
        ANIM_STATE_CLASS[animState],
        className,
      )}
    >
      {frameAsset?.url && (
        <AtlasImage asset={frameAsset} fill fit="fill" aria-hidden style={{ zIndex: -1 }} />
      )}
      {cost != null && (
        <Typography
          as="span"
          className={cn(
            'absolute -top-2 -left-2 flex items-center justify-center',
            'min-w-[22px] h-[22px] rounded-full px-1',
            'bg-info text-foreground text-xs font-bold border border-background',
          )}
        >
          {cost}
        </Typography>
      )}

      <Box className="flex-1 flex items-center justify-center w-full">
        {art ? (
          <GameIcon assetUrl={art} icon="image" size={artPx} alt={name ?? id} className="flex-shrink-0" />
        ) : (
          <Box className="rounded bg-muted/40" style={{ width: artPx, height: artPx }} />
        )}
      </Box>

      {name != null && (
        <Typography
          variant="small"
          className="w-full truncate text-center text-[10px] leading-tight font-semibold"
        >
          {name}
        </Typography>
      )}

      {(attack != null || defense != null) && (
        <Box className="flex w-full items-center justify-between px-0.5 text-[10px] font-bold leading-none">
          <Typography as="span" className="text-error">{attack != null ? `⚔${attack}` : ''}</Typography>
          <Typography as="span" className="text-info">{defense != null ? `🛡${defense}` : ''}</Typography>
        </Box>
      )}
    </Button>
  );
}

GameCard.displayName = 'GameCard';
