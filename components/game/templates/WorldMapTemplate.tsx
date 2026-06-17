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
import type { WorldMapBoardProps } from '../organisms/WorldMapBoard';
import type { TemplateProps } from '../../core/templates/types';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../organisms/types/isometric';

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
    /** Direct tile data — forwarded to WorldMapBoard; takes priority over entity. */
    tiles?: IsometricTile[];
    /** Direct unit data — forwarded to WorldMapBoard; takes priority over entity. */
    units?: IsometricUnit[];
    /** Direct feature data — forwarded to WorldMapBoard; takes priority over entity. */
    features?: IsometricFeature[];
    /** Direct asset manifest — forwarded to WorldMapBoard; takes priority over entity. */
    assetManifest?: WorldMapBoardProps['assetManifest'];
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
    tiles,
    units,
    features,
    assetManifest,
    className,
}: WorldMapTemplateProps): React.JSX.Element {
    return (
        <WorldMapBoard
            entity={entity}
            tiles={tiles}
            units={units}
            features={features}
            assetManifest={assetManifest}
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
