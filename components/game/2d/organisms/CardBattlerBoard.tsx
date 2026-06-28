'use client';

import React, { useMemo, useRef, useCallback } from 'react';
import type { Asset, EventEmit, EntityRow } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { Box } from '../../../core/atoms/Box';
import { Button } from '../../../core/atoms/Button';
import { Typography } from '../../../core/atoms/Typography';
import { VStack, HStack } from '../../../core/atoms/Stack';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { GameCard } from '../atoms/GameCard';
import { boardEntity, num, str, rows } from '../../shared/boardEntity';

// =============================================================================
// Types
// =============================================================================

/** Manifest of per-card sprite map (UI value DTO). */
type CardBattlerAssetManifest = {
    cards?: Record<string, Asset>;
};

/** One card as carried on the entity / passed as a prop. */
export interface CardBattlerCard {
    id: string;
    iconKey?: string;
    title?: string;
    cost?: number;
    attack?: number;
    defense?: number;
}

export interface CardBattlerBoardProps extends DisplayStateProps {
    entity?: EntityRow | readonly EntityRow[];
    /** Cards remaining in the draw deck (count-only view). */
    deck?: CardBattlerCard[];
    /** Cards currently in the player's hand. */
    hand?: CardBattlerCard[];
    /** Cards played onto the board this match. */
    board?: CardBattlerCard[];
    mana?: number;
    maxMana?: number;
    turn?: number;
    result?: 'none' | 'won' | 'lost';
    /** Base-url + per-iconKey card sprite map (organism owns asset choice). */
    assetManifest?: CardBattlerAssetManifest;
    playCardEvent?: EventEmit<{ cardId: string }>;
    endTurnEvent?: EventEmit<Record<string, never>>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/** Coerce a weakly-typed entity row into a CardBattlerCard. */
function rowToCard(r: EntityRow): CardBattlerCard {
    return {
        id: str(r.id),
        iconKey: r.iconKey == null ? undefined : str(r.iconKey),
        title: r.title == null ? undefined : str(r.title),
        cost: r.cost == null ? undefined : num(r.cost),
        attack: r.attack == null ? undefined : num(r.attack),
        defense: r.defense == null ? undefined : num(r.defense),
    };
}

const DEFAULT_HAND: CardBattlerCard[] = [
    { id: 'c1', iconKey: 'bear',    title: 'Bear',    cost: 3, attack: 5, defense: 4 },
    { id: 'c2', iconKey: 'owl',     title: 'Owl',     cost: 1, attack: 2, defense: 1 },
    { id: 'c3', iconKey: 'gorilla', title: 'Gorilla', cost: 4, attack: 6, defense: 5 },
    { id: 'c4', iconKey: 'frog',    title: 'Frog',    cost: 1, attack: 1, defense: 2 },
    { id: 'c5', iconKey: 'snake',   title: 'Snake',   cost: 2, attack: 4, defense: 1 },
];

/** Resolve the icon asset for a card from the manifest. */
function resolveCardArt(card: CardBattlerCard, manifest: CardBattlerAssetManifest | undefined) {
    const key = card.iconKey ?? card.id;
    return manifest?.cards?.[key];
}

// =============================================================================
// Component
// =============================================================================

export function CardBattlerBoard({
    entity,
    deck: propDeck,
    hand: propHand,
    board: propBoard,
    mana: propMana,
    maxMana: propMaxMana,
    turn: propTurn,
    result: propResult,
    assetManifest: propAssetManifest,
    playCardEvent,
    endTurnEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: CardBattlerBoardProps): React.JSX.Element {
    const board = boardEntity(entity) ?? {};
    const eventBus = useEventBus();
    const { t } = useTranslate();

    const assetManifest = propAssetManifest ?? (board.assetManifest as CardBattlerAssetManifest | undefined);

    const entityHand = useMemo(() => rows(board.hand).map(rowToCard), [board.hand]);
    const rawHand = propHand ?? entityHand;
    const hand = rawHand.length > 0 ? rawHand : DEFAULT_HAND;

    const entityBoard = useMemo(() => rows(board.board).map(rowToCard), [board.board]);
    const playedCards = propBoard ?? entityBoard;

    const entityDeck = useMemo(() => rows(board.deck).map(rowToCard), [board.deck]);
    const deck = propDeck ?? entityDeck;

    const mana    = propMana    ?? num(board.mana, 3);
    const maxMana = propMaxMana ?? num(board.maxMana, 3);
    const turn    = propTurn    ?? num(board.turn, 1);
    const result  = (propResult ?? (str(board.result) || 'none')) as 'none' | 'won' | 'lost';

    const handCards   = hand;
    const boardCards  = playedCards;

    // Emit GAME_END once when result leaves 'none' so the orbital GAME_END -> gameover fires.
    const emittedGameEnd = useRef(false);
    if (result !== 'none' && !emittedGameEnd.current) {
        emittedGameEnd.current = true;
        if (gameEndEvent) {
            eventBus.emit(`UI:${gameEndEvent}`, { result });
        }
    }
    if (result === 'none') {
        emittedGameEnd.current = false;
    }

    const handlePlayCard = useCallback((cardId: string) => {
        if (result !== 'none') return;
        if (playCardEvent) {
            eventBus.emit(`UI:${playCardEvent}`, { cardId });
        }
    }, [result, playCardEvent, eventBus]);

    const handleEndTurn = useCallback(() => {
        if (result !== 'none') return;
        if (endTurnEvent) {
            eventBus.emit(`UI:${endTurnEvent}`, {});
        }
    }, [result, endTurnEvent, eventBus]);

    const handlePlayAgain = useCallback(() => {
        if (playAgainEvent) {
            eventBus.emit(`UI:${playAgainEvent}`, {});
        }
    }, [playAgainEvent, eventBus]);

    return (
        <VStack className={cn('card-battler-board relative min-h-[600px] bg-background', className)} gap="none">
            {/* HUD bar */}
            <HStack
                className="px-4 py-2 border-b border-border bg-surface"
                gap="lg"
                align="center"
            >
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.mana') ?? 'Mana'}</Typography>
                    <Typography variant="body2" weight="bold" className="text-info">{mana} / {maxMana}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.turn') ?? 'Turn'}</Typography>
                    <Typography variant="body2" weight="bold">{turn}</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Typography variant="small" color="muted">{t('cb.deck') ?? 'Deck'}</Typography>
                    <Typography variant="body2" weight="bold">{deck.length}</Typography>
                </HStack>
                <Box className="ml-auto">
                    {result === 'none' && (
                        <Button variant="primary" size="sm" onClick={handleEndTurn}>
                            {t('cb.endTurn') ?? 'End Turn'}
                        </Button>
                    )}
                </Box>
            </HStack>

            {/* Board — cards played this match */}
            <Box className="flex-1 relative p-4 overflow-auto">
                <Typography variant="small" color="muted" className="mb-2 uppercase tracking-wide">
                    {t('cb.battlefield') ?? 'Battlefield'}
                </Typography>
                {boardCards.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-end justify-start">
                        {boardCards.map((card) => (
                            <GameCard
                                key={card.id}
                                id={card.id}
                                cost={card.cost}
                                art={resolveCardArt(card, assetManifest)}
                                attack={card.attack}
                                defense={card.defense}
                                name={card.title}
                                disabled={card.cost != null && card.cost > mana}
                                size="md"
                            />
                        ))}
                    </div>
                ) : (
                    <Box className="flex items-center justify-center h-32 rounded-interactive border-2 border-dashed border-border">
                        <Typography variant="small" color="muted">
                            {t('cb.emptyBoard') ?? 'Play a card to begin'}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Hand — bottom dock */}
            <Box className="border-t border-border bg-surface px-4 py-3">
                <Typography variant="small" color="muted" className="mb-2 uppercase tracking-wide">
                    {t('cb.hand') ?? 'Your Hand'}
                </Typography>
                {handCards.length === 0 ? (
                    <div className="flex items-center justify-center p-4">
                        <Typography variant="small" color="muted">{t('cb.emptyHand') ?? 'No cards in hand'}</Typography>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 items-end justify-center">
                        {handCards.map((card) => (
                            <GameCard
                                key={card.id}
                                id={card.id}
                                cost={card.cost}
                                art={resolveCardArt(card, assetManifest)}
                                attack={card.attack}
                                defense={card.defense}
                                name={card.title}
                                disabled={card.cost != null && card.cost > mana}
                                size="lg"
                                onClick={handlePlayCard}
                            />
                        ))}
                    </div>
                )}
            </Box>

            {/* Game-over overlay */}
            {result !== 'none' && (
                <Box className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <VStack className="text-center p-8" gap="lg">
                        <Typography
                            variant="h2"
                            className={cn(
                                'text-4xl font-black tracking-widest uppercase',
                                result === 'won' ? 'text-warning' : 'text-error',
                            )}
                        >
                            {result === 'won'
                                ? (t('cb.victory') ?? 'Victory!')
                                : (t('cb.defeat')  ?? 'Defeat!')}
                        </Typography>
                        <Button
                            variant="primary"
                            className="px-8 py-3 font-semibold"
                            onClick={handlePlayAgain}
                        >
                            {t('cb.playAgain') ?? 'Play Again'}
                        </Button>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}

CardBattlerBoard.displayName = 'CardBattlerBoard';

export default CardBattlerBoard;
