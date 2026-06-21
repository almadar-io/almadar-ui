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
import type { TemplateProps } from '../../core/templates/types';
import { CastleBoard } from '../organisms/CastleBoard';
import type { CastleBoardProps } from '../organisms/CastleBoard';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../organisms/types/isometric';

const CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_CASTLE_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 1, y: 0, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 2, y: 0, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 3, y: 0, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 4, y: 0, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 0, y: 1, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 1, y: 1, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 1, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 3, y: 1, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 4, y: 1, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 0, y: 2, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 1, y: 2, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 2, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_09.png` },
    { x: 3, y: 2, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 4, y: 2, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 0, y: 3, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 1, y: 3, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 3, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 3, y: 3, terrain: 'floor', passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 4, y: 3, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 0, y: 4, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 1, y: 4, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 2, y: 4, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 3, y: 4, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
    { x: 4, y: 4, terrain: 'wall',  passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png` },
];

const DEFAULT_CASTLE_UNITS: IsometricUnit[] = [
    { id: 'u1', position: { x: 1, y: 1 }, unitType: 'worker',   name: 'Worker',   team: 'player', health: 10, maxHealth: 10, sprite: `${CDN}/sprite-sheets/coordinator-sprite-sheet-se.png` },
    { id: 'u2', position: { x: 3, y: 3 }, unitType: 'guardian', name: 'Guardian', team: 'player', health: 10, maxHealth: 10, sprite: `${CDN}/sprite-sheets/forger-sprite-sheet-se.png` },
];

const DEFAULT_CASTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, type: 'chest',   sprite: `${CDN}/world-map/treasure_chest_closed.png` },
    { id: 'f2', x: 3, y: 1, type: 'crystal', sprite: `${CDN}/world-map/resonance_crystal.png` },
];

const DEFAULT_CASTLE_MANIFEST: CastleBoardProps['assetManifest'] = {
    baseUrl: CDN,
    terrains: {
        wall:  '/isometric-blocks/PNG/Platformer tiles/platformerTile_05.png',
        floor: '/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png',
    },
    units: {
        worker:   '/sprite-sheets/coordinator-sprite-sheet-se.png',
        guardian: '/sprite-sheets/forger-sprite-sheet-se.png',
    },
    features: {
        chest:   '/world-map/treasure_chest_closed.png',
        crystal: '/world-map/resonance_crystal.png',
    },
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
