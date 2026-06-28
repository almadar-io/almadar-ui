/**
 * CardBattlerTemplate
 *
 * Thin template wrapper: titled header + CardBattlerBoard.
 * All game state is driven by the entity prop (passed through from the orbital trait).
 */

import React from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { HStack } from '../../../core/atoms/Stack';
import { Typography } from '../../../core/atoms/Typography';
import type { TemplateProps } from '../../../core/templates/types';
import { CardBattlerBoard } from '../organisms/CardBattlerBoard';
import type { CardBattlerBoardProps, CardBattlerCard } from '../organisms/CardBattlerBoard';

/** Narrow a template entity union to a single EntityRow without a cast. */
function isEntityRow(value: CardBattlerTemplateProps['entity']): value is EntityRow {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export interface CardBattlerTemplateProps extends TemplateProps {
    title?: string;
    deck?: CardBattlerCard[];
    hand?: CardBattlerCard[];
    board?: CardBattlerCard[];
    mana?: number;
    maxMana?: number;
    turn?: number;
    result?: 'none' | 'won' | 'lost';
    assetManifest?: CardBattlerBoardProps['assetManifest'];
    playCardEvent?: EventEmit<{ cardId: string }>;
    endTurnEvent?: EventEmit<Record<string, never>>;
    playAgainEvent?: EventEmit<Record<string, never>>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

export function CardBattlerTemplate({
    entity,
    title = 'Card Battler',
    deck,
    hand,
    board,
    mana,
    maxMana,
    turn,
    result,
    assetManifest,
    playCardEvent,
    endTurnEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: CardBattlerTemplateProps): React.JSX.Element {
    const resolved = isEntityRow(entity) ? entity : undefined;

    return (
        <Box
            display="flex"
            fullHeight
            className={cn('card-battler-template flex-col', className)}
        >
            {/* Header */}
            <HStack
                gap="sm"
                align="center"
                className="px-4 py-3 border-b-2 border-border bg-surface shrink-0"
            >
                <Typography variant="h4">{title}</Typography>
            </HStack>

            {/* Board fills remaining space */}
            <Box className="flex-1 relative overflow-hidden">
                <CardBattlerBoard
                    entity={resolved}
                    deck={deck}
                    hand={hand}
                    board={board}
                    mana={mana}
                    maxMana={maxMana}
                    turn={turn}
                    result={result}
                    assetManifest={assetManifest}
                    playCardEvent={playCardEvent}
                    endTurnEvent={endTurnEvent}
                    playAgainEvent={playAgainEvent}
                    gameEndEvent={gameEndEvent}
                    className="h-full"
                />
            </Box>
        </Box>
    );
}

CardBattlerTemplate.displayName = 'CardBattlerTemplate';

export default CardBattlerTemplate;
