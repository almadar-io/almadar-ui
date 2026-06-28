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
import type { TemplateProps } from '../../../core/templates/types';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../../shared/isometricTypes';
import { makeAsset, makeAssetMap } from '../../shared/makeAsset';

const CDN = 'https://almadar-kflow-assets.web.app/shared';
const mountain = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png`, 'tile');
const water    = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png`, 'tile');
const grass    = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png`, 'tile');
const road     = makeAsset(`${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_03.png`, 'tile');

const DEFAULT_WORLDMAP_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 1, y: 0, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 2, y: 0, terrain: 'water',    passable: false, terrainSprite: water },
    { x: 3, y: 0, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 4, y: 0, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 0, y: 1, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 1, y: 1, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 2, y: 1, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 3, y: 1, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 4, y: 1, terrain: 'water',    passable: false, terrainSprite: water },
    { x: 0, y: 2, terrain: 'water',    passable: false, terrainSprite: water },
    { x: 1, y: 2, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 2, y: 2, terrain: 'grass',    passable: true,  terrainSprite: road },
    { x: 3, y: 2, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 4, y: 2, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 0, y: 3, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 1, y: 3, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 2, y: 3, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 3, y: 3, terrain: 'grass',    passable: true,  terrainSprite: road },
    { x: 4, y: 3, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 0, y: 4, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 1, y: 4, terrain: 'water',    passable: false, terrainSprite: water },
    { x: 2, y: 4, terrain: 'grass',    passable: true,  terrainSprite: grass },
    { x: 3, y: 4, terrain: 'mountain', passable: false, terrainSprite: mountain },
    { x: 4, y: 4, terrain: 'mountain', passable: false, terrainSprite: mountain },
];

const DEFAULT_WORLDMAP_UNITS: IsometricUnit[] = [
    { id: 'h1', position: { x: 1, y: 1 }, unitType: 'hero',  name: 'Amir',      team: 'player', health: 10, maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/amir-sprite-sheet-se.png`, 'player') },
    { id: 'h2', position: { x: 3, y: 3 }, unitType: 'scout', name: 'Archivist', team: 'player', health: 10, maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/archivist-sprite-sheet-se.png`, 'npc') },
];

const DEFAULT_WORLDMAP_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, type: 'capital',    sprite: makeAsset(`${CDN}/scenes/world/capital.png`, 'decoration') },
    { id: 'f2', x: 4, y: 2, type: 'power_node', sprite: makeAsset(`${CDN}/world-map/power_node.png`, 'decoration') },
];

const DEFAULT_WORLDMAP_MANIFEST: WorldMapBoardProps['assetManifest'] = {
    terrains: makeAssetMap({
        grass:    `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png`,
        water:    `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png`,
        mountain: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png`,
        road:     `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_03.png`,
    }, 'tile'),
    units: {
        hero:  makeAsset(`${CDN}/sprite-sheets/amir-sprite-sheet-se.png`, 'player'),
        scout: makeAsset(`${CDN}/sprite-sheets/archivist-sprite-sheet-se.png`, 'npc'),
    },
    features: makeAssetMap({
        capital:    `${CDN}/scenes/world/capital.png`,
        power_node: `${CDN}/world-map/power_node.png`,
    }, 'decoration'),
};

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
    diamondTopY = 374,
    allowMoveAllHeroes = false,
    tiles = DEFAULT_WORLDMAP_TILES,
    units = DEFAULT_WORLDMAP_UNITS,
    features = DEFAULT_WORLDMAP_FEATURES,
    assetManifest = DEFAULT_WORLDMAP_MANIFEST,
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
