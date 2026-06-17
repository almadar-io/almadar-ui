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
import type { BattleBoardProps } from '../organisms/BattleBoard';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../organisms/types/isometric';

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
    /** Direct tile data — forwarded to BattleBoard; takes priority over entity. */
    tiles?: IsometricTile[];
    /** Direct unit data — forwarded to BattleBoard; takes priority over entity. */
    units?: IsometricUnit[];
    /** Direct feature data — forwarded to BattleBoard; takes priority over entity. */
    features?: IsometricFeature[];
    /** Direct asset manifest — forwarded to BattleBoard; takes priority over entity. */
    assetManifest?: BattleBoardProps['assetManifest'];
}

// =============================================================================
// Template
// =============================================================================

export function BattleTemplate({
    entity,
    scale = 0.45,
    unitScale = 1,
    tiles,
    units,
    features,
    assetManifest,
    className,
}: BattleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved && !tiles && !units && !features && !assetManifest) return null;
    return (
        <BattleBoard
            entity={resolved}
            tiles={tiles}
            units={units}
            features={features}
            assetManifest={assetManifest}
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
