/**
 * CastleTemplate
 *
 * Thin declarative wrapper around CastleBoard organism.
 * All game logic (hover state, feature selection, etc.) lives in CastleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import type { TemplateProps } from '../../../core/templates/types';
import { CastleBoard } from '../organisms/CastleBoard';
import type { CastleBoardProps } from '../organisms/CastleBoard';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../../shared/isometricTypes';
import { makeAsset, makeAssetMap } from '../../shared/makeAsset';

const CDN = 'https://almadar-kflow-assets.web.app/shared';

const WALL  = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png`, 'tile');
const FLOOR = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png`, 'tile');
const FLOOR_CENTER = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_09.png`, 'tile');

const DEFAULT_CASTLE_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 1, y: 0, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 2, y: 0, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 3, y: 0, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 4, y: 0, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 0, y: 1, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 1, y: 1, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 2, y: 1, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 3, y: 1, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 4, y: 1, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 0, y: 2, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 1, y: 2, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 2, y: 2, terrain: 'floor', passable: true,  terrainSprite: FLOOR_CENTER },
    { x: 3, y: 2, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 4, y: 2, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 0, y: 3, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 1, y: 3, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 2, y: 3, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 3, y: 3, terrain: 'floor', passable: true,  terrainSprite: FLOOR },
    { x: 4, y: 3, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 0, y: 4, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 1, y: 4, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 2, y: 4, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 3, y: 4, terrain: 'wall',  passable: false, terrainSprite: WALL  },
    { x: 4, y: 4, terrain: 'wall',  passable: false, terrainSprite: WALL  },
];

const DEFAULT_CASTLE_UNITS: IsometricUnit[] = [
    { id: 'u1', position: { x: 1, y: 1 }, unitType: 'worker',   name: 'Worker',   team: 'player', health: 10, maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/coordinator-sprite-sheet-se.png`, 'player') },
    { id: 'u2', position: { x: 3, y: 3 }, unitType: 'guardian', name: 'Guardian', team: 'player', health: 10, maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/forger-sprite-sheet-se.png`, 'player') },
];

const DEFAULT_CASTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, type: 'chest',   sprite: makeAsset(`${CDN}/world-map/treasure_chest_closed.png`, 'decoration') },
    { id: 'f2', x: 3, y: 1, type: 'crystal', sprite: makeAsset(`${CDN}/world-map/resonance_crystal.png`, 'decoration') },
];

const DEFAULT_CASTLE_MANIFEST: CastleBoardProps['assetManifest'] = {
    terrains: makeAssetMap({
        wall:  `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png`,
        floor: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png`,
    }, 'tile'),
    units: makeAssetMap({
        worker:   `${CDN}/sprite-sheets/coordinator-sprite-sheet-se.png`,
        guardian: `${CDN}/sprite-sheets/forger-sprite-sheet-se.png`,
    }, 'player'),
    features: makeAssetMap({
        chest:   `${CDN}/world-map/treasure_chest_closed.png`,
        crystal: `${CDN}/world-map/resonance_crystal.png`,
    }, 'decoration'),
};

// Re-export the surviving UI value type (entity type was collapsed to EntityRow).
export type { CastleSlotContext } from '../organisms/CastleBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface CastleTemplateProps extends TemplateProps {
    /** Canvas render scale */
    scale?: number;
    /** Direct tile data — forwarded to CastleBoard; takes priority over entity. */
    tiles?: IsometricTile[];
    /** Direct unit data — forwarded to CastleBoard; takes priority over entity. */
    units?: IsometricUnit[];
    /** Direct feature data — forwarded to CastleBoard; takes priority over entity. */
    features?: IsometricFeature[];
    /** Direct asset manifest — forwarded to CastleBoard; takes priority over entity. */
    assetManifest?: CastleBoardProps['assetManifest'];
}

// =============================================================================
// Template
// =============================================================================

export function CastleTemplate({
    entity,
    scale = 0.45,
    tiles = DEFAULT_CASTLE_TILES,
    units = DEFAULT_CASTLE_UNITS,
    features = DEFAULT_CASTLE_FEATURES,
    assetManifest = DEFAULT_CASTLE_MANIFEST,
    className,
}: CastleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved && !tiles && !units && !features && !assetManifest) return null;
    return (
        <CastleBoard
            entity={resolved}
            tiles={tiles}
            units={units}
            features={features}
            assetManifest={assetManifest}
            scale={scale}
            featureClickEvent="FEATURE_CLICK"
            unitClickEvent="UNIT_CLICK"
            tileClickEvent="TILE_CLICK"
            className={className}
        />
    );
}

CastleTemplate.displayName = 'CastleTemplate';

export default CastleTemplate;
