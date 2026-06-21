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

const CDN = 'https://almadar-kflow-assets.web.app/shared';

const DEFAULT_WORLDMAP_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 1, y: 0, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 2, y: 0, terrain: 'water',    passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png` },
    { x: 3, y: 0, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 4, y: 0, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 0, y: 1, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 1, y: 1, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 1, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 3, y: 1, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 4, y: 1, terrain: 'water',    passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png` },
    { x: 0, y: 2, terrain: 'water',    passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png` },
    { x: 1, y: 2, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 2, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_03.png` },
    { x: 3, y: 2, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 4, y: 2, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 0, y: 3, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 1, y: 3, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 2, y: 3, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 3, y: 3, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_03.png` },
    { x: 4, y: 3, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 0, y: 4, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 1, y: 4, terrain: 'water',    passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png` },
    { x: 2, y: 4, terrain: 'grass',    passable: true,  terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png` },
    { x: 3, y: 4, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
    { x: 4, y: 4, terrain: 'mountain', passable: false, terrainSprite: `${CDN}/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png` },
];

const DEFAULT_WORLDMAP_UNITS: IsometricUnit[] = [
    { id: 'h1', position: { x: 1, y: 1 }, unitType: 'hero',  name: 'Amir',      team: 'player', health: 10, maxHealth: 10, sprite: `${CDN}/sprite-sheets/amir-sprite-sheet-se.png` },
    { id: 'h2', position: { x: 3, y: 3 }, unitType: 'scout', name: 'Archivist', team: 'player', health: 10, maxHealth: 10, sprite: `${CDN}/sprite-sheets/archivist-sprite-sheet-se.png` },
];

const DEFAULT_WORLDMAP_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, type: 'capital',    sprite: `${CDN}/scenes/world/capital.png` },
    { id: 'f2', x: 4, y: 2, type: 'power_node', sprite: `${CDN}/world-map/power_node.png` },
];

const DEFAULT_WORLDMAP_MANIFEST: WorldMapBoardProps['assetManifest'] = {
    baseUrl: CDN,
    terrains: {
        grass:    '/isometric-blocks/PNG/Platformer tiles/platformerTile_01.png',
        water:    '/isometric-blocks/PNG/Platformer tiles/platformerTile_11.png',
        mountain: '/isometric-blocks/PNG/Platformer tiles/platformerTile_13.png',
        road:     '/isometric-blocks/PNG/Platformer tiles/platformerTile_03.png',
    },
    units: {
        hero:  '/sprite-sheets/amir-sprite-sheet-se.png',
        scout: '/sprite-sheets/archivist-sprite-sheet-se.png',
    },
    features: {
        capital:    '/scenes/world/capital.png',
        power_node: '/world-map/power_node.png',
    },
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
