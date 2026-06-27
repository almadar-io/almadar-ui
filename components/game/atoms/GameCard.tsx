'use client';
import * as React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';

export interface GameCardProps {
  id: string;
  cost?: number;
  /** Card art asset */
  art?: Asset;
  attack?: number;
  defense?: number;
  name?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Size variant — controls card dimensions and art pixel size */
  size?: 'sm' | 'md' | 'lg';
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

export function GameCard({
  id,
  cost,
  art,
  attack,
  defense,
  name,
  selected = false,
  disabled = false,
  size = 'md',
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
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={name}
      className={cn(
        'relative flex flex-col items-center rounded-interactive border-2',
        'bg-card/90 px-1.5 pt-1.5 pb-1 transition-all duration-150',
        cardSizeMap[size],
        disabled
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-accent hover:brightness-125 hover:-translate-y-1 cursor-pointer',
        selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background -translate-y-1',
        className,
      )}
    >
      {cost != null && (
        <span
          className={cn(
            'absolute -top-2 -left-2 flex items-center justify-center',
            'min-w-[22px] h-[22px] rounded-full px-1',
            'bg-info text-foreground text-xs font-bold border border-background',
          )}
        >
          {cost}
        </span>
      )}

      <Box className="flex-1 flex items-center justify-center w-full">
        {art ? (
          <img
            src={art.url}
            alt={name ?? id}
            width={artPx}
            height={artPx}
            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            className="flex-shrink-0"
          />
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
          <span className="text-error">{attack != null ? `⚔${attack}` : ''}</span>
          <span className="text-info">{defense != null ? `🛡${defense}` : ''}</span>
        </Box>
      )}
    </button>
  );
}

GameCard.displayName = 'GameCard';
