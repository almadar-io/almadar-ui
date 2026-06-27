'use client';
import * as React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';

/** One playable card (icon + title + a few stat numbers). UI value DTO. */
export interface CardHandCard {
  id: string;
  iconUrl?: Asset;
  title?: string;
  cost?: number;
  attack?: number;
  defense?: number;
  disabled?: boolean;
}

export interface CardHandProps {
  /** Cards to lay out as a horizontal hand (or grid when wrapped). */
  cards: CardHandCard[];
  /** Currently selected card id. */
  selectedId?: string;
  /** Card-art size variant. */
  size?: 'sm' | 'md' | 'lg';
  /** Direct callback when a (non-disabled) card is clicked. */
  onCardClick?: (id: string) => void;
  /** Event-bus event emitted with `{ cardId }` on click. */
  cardClickEvent?: EventEmit<{ cardId: string }>;
  /** Empty-state label when there are no cards. */
  emptyLabel?: string;
  className?: string;
}

const cardSizeMap = {
  sm: 'w-16 h-24',
  md: 'w-20 h-28',
  lg: 'w-24 h-36',
};

const artSizeMap = {
  sm: 40,
  md: 52,
  lg: 64,
};

const DEFAULT_CARDS: CardHandCard[] = [
  { id: 'card-1', title: 'Brawler', cost: 1, attack: 2, defense: 1 },
  { id: 'card-2', title: 'Guardian', cost: 2, attack: 1, defense: 4 },
  { id: 'card-3', title: 'Striker', cost: 3, attack: 5, defense: 2 },
];

/** Pure card-hand molecule: renders a row/grid of cards from props alone. */
export function CardHand({
  cards = DEFAULT_CARDS,
  selectedId = '',
  size = 'md',
  onCardClick,
  cardClickEvent,
  emptyLabel = 'No cards in hand',
  className,
}: CardHandProps): React.JSX.Element {
  const eventBus = useEventBus();

  const handleClick = React.useCallback(
    (card: CardHandCard) => {
      if (card.disabled) return;
      onCardClick?.(card.id);
      if (cardClickEvent) {
        eventBus.emit(`UI:${cardClickEvent}`, { cardId: card.id });
      }
    },
    [onCardClick, cardClickEvent, eventBus],
  );

  if (cards.length === 0) {
    return (
      <Box className={cn('flex items-center justify-center p-4', className)}>
        <Typography variant="small" color="muted">{emptyLabel}</Typography>
      </Box>
    );
  }

  const art = artSizeMap[size];

  return (
    <Box className={cn('flex flex-wrap gap-2 justify-center items-end', className)}>
      {cards.map((card) => {
        const selected = selectedId === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => handleClick(card)}
            disabled={card.disabled}
            title={card.title}
            className={cn(
              'card-hand-card relative flex flex-col items-center rounded-interactive border-2',
              'bg-card/90 px-1.5 pt-1.5 pb-1 transition-all duration-150',
              cardSizeMap[size],
              card.disabled
                ? 'border-border opacity-50 cursor-not-allowed'
                : 'border-accent hover:brightness-125 hover:-translate-y-1 cursor-pointer',
              selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background -translate-y-1',
            )}
          >
            {/* Cost pip (top-left) */}
            {card.cost != null && (
              <span
                className={cn(
                  'absolute -top-2 -left-2 flex items-center justify-center',
                  'min-w-[22px] h-[22px] rounded-full px-1',
                  'bg-info text-foreground text-xs font-bold border border-background',
                )}
              >
                {card.cost}
              </span>
            )}

            {/* Card art */}
            <Box className="flex-1 flex items-center justify-center w-full">
              {card.iconUrl ? (
                <img
                  src={card.iconUrl.url}
                  alt={card.title ?? card.id}
                  width={art}
                  height={art}
                  style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                  className="flex-shrink-0"
                />
              ) : (
                <Box
                  className="rounded bg-muted/40"
                  style={{ width: art, height: art }}
                />
              )}
            </Box>

            {/* Title */}
            {card.title != null && (
              <Typography
                variant="small"
                className="w-full truncate text-center text-[10px] leading-tight font-semibold"
              >
                {card.title}
              </Typography>
            )}

            {/* Stat row: attack / defense */}
            {(card.attack != null || card.defense != null) && (
              <Box className="flex w-full items-center justify-between px-0.5 text-[10px] font-bold leading-none">
                <span className="text-error">{card.attack != null ? `⚔${card.attack}` : ''}</span>
                <span className="text-info">{card.defense != null ? `🛡${card.defense}` : ''}</span>
              </Box>
            )}
          </button>
        );
      })}
    </Box>
  );
}

CardHand.displayName = 'CardHand';

export default CardHand;
