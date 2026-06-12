/**
 * BattleTemplate
 *
 * Thin declarative wrapper around BattleBoard organism.
 * All game logic (turn phases, movement animation, combat, etc.) lives in BattleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import type { TemplateProps } from '../../core/templates/types';
import { BattleBoard } from '../organisms/BattleBoard';

// Re-export the surviving UI value types (entity types were collapsed to EntityRow).
export type {
    BattlePhase,
    BattleSlotContext,
} from '../organisms/BattleBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface BattleTemplateProps extends TemplateProps {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
}

// =============================================================================
// Template
// =============================================================================

export function BattleTemplate({
    entity,
    scale = 0.45,
    unitScale = 1,
    className,
}: BattleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved) return null;
    return (
        <BattleBoard
            entity={resolved}
            scale={scale}
            unitScale={unitScale}
            tileClickEvent="TILE_CLICK"
            unitClickEvent="UNIT_CLICK"
            endTurnEvent="END_TURN"
            cancelEvent="CANCEL"
            gameEndEvent="GAME_END"
            playAgainEvent="PLAY_AGAIN"
            attackEvent="ATTACK"
            className={className}
        />
    );
}

BattleTemplate.displayName = 'BattleTemplate';

export default BattleTemplate;
