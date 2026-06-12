/**
 * WorldMapTemplate
 *
 * Thin declarative wrapper around WorldMapBoard organism.
 * All game logic (hero movement, encounters, hex conversion, etc.) lives in WorldMapBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import { WorldMapBoard } from '../organisms/WorldMapBoard';
import type { TemplateProps } from '../../core/templates/types';

// Re-export the surviving UI value type (entity types were collapsed to EntityRow).
export type { WorldMapSlotContext } from '../organisms/WorldMapBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface WorldMapTemplateProps extends TemplateProps {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
}

// =============================================================================
// Template
// =============================================================================

export function WorldMapTemplate({
    entity,
    scale = 0.4,
    unitScale = 2.5,
    diamondTopY,
    allowMoveAllHeroes = false,
    className,
}: WorldMapTemplateProps): React.JSX.Element {
    return (
        <WorldMapBoard
            entity={entity}
            scale={scale}
            unitScale={unitScale}
            diamondTopY={diamondTopY}
            allowMoveAllHeroes={allowMoveAllHeroes}
            heroSelectEvent="HERO_SELECT"
            heroMoveEvent="HERO_MOVE"
            battleEncounterEvent="BATTLE_ENCOUNTER"
            featureEnterEvent="FEATURE_ENTER"
            className={className}
        />
    );
}

WorldMapTemplate.displayName = 'WorldMapTemplate';

export default WorldMapTemplate;
