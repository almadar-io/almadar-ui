'use client';
import * as React from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { Typography } from '../../../core/atoms/Typography';
import { GameCard } from '../atoms/GameCard';

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
  if (cards.length === 0) {
    return (
      <Box className={cn('flex items-center justify-center p-4', className)}>
        <Typography variant="small" color="muted">{emptyLabel}</Typography>
      </Box>
    );
  }

  return (
    <Box className={cn('flex flex-wrap gap-2 justify-center items-end', className)}>
      {cards.map((card) => (
        <GameCard
          key={card.id}
          id={card.id}
          cost={card.cost}
          art={card.iconUrl}
          attack={card.attack}
          defense={card.defense}
          name={card.title}
          selected={selectedId === card.id}
          disabled={card.disabled}
          size={size}
          onClick={onCardClick}
          clickEvent={cardClickEvent}
        />
      ))}
    </Box>
  );
}

CardHand.displayName = 'CardHand';

export default CardHand;
