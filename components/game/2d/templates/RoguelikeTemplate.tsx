import React from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import type { TemplateProps } from '../../../core/templates/types';
import { RoguelikeBoard } from '../organisms/RoguelikeBoard';
import type { RoguelikeBoardProps } from '../organisms/RoguelikeBoard';
import type { IsometricTile } from '../../shared/isometricTypes';
import { makeAsset, makeAssetMap } from '../../shared/makeAsset';

const CDN = 'https://almadar-kflow-assets.web.app/shared';
const wall   = makeAsset(`${CDN}/isometric-dungeon/Isometric/stoneInset_E.png`, 'tile');
const floor  = makeAsset(`${CDN}/isometric-dungeon/Isometric/dirt_E.png`, 'tile');
const tiles2 = makeAsset(`${CDN}/isometric-dungeon/Isometric/dirtTiles_E.png`, 'tile');
const stairs = makeAsset(`${CDN}/isometric-dungeon/Isometric/stairs_E.png`, 'tile');

const DEFAULT_ROGUELIKE_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 1, y: 0, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 2, y: 0, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 3, y: 0, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 4, y: 0, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 0, y: 1, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 1, y: 1, terrain: 'floor',  passable: true,  terrainSprite: floor },
    { x: 2, y: 1, terrain: 'floor',  passable: true,  terrainSprite: floor },
    { x: 3, y: 1, terrain: 'floor',  passable: true,  terrainSprite: floor },
    { x: 4, y: 1, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 0, y: 2, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 1, y: 2, terrain: 'floor',  passable: true,  terrainSprite: tiles2 },
    { x: 2, y: 2, terrain: 'floor',  passable: true,  terrainSprite: tiles2 },
    { x: 3, y: 2, terrain: 'floor',  passable: true,  terrainSprite: floor },
    { x: 4, y: 2, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 0, y: 3, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 1, y: 3, terrain: 'floor',  passable: true,  terrainSprite: floor },
    { x: 2, y: 3, terrain: 'floor',  passable: true,  terrainSprite: tiles2 },
    { x: 3, y: 3, terrain: 'stairs', passable: true,  terrainSprite: stairs },
    { x: 4, y: 3, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 0, y: 4, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 1, y: 4, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 2, y: 4, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 3, y: 4, terrain: 'wall',   passable: false, terrainSprite: wall },
    { x: 4, y: 4, terrain: 'wall',   passable: false, terrainSprite: wall },
];

const DEFAULT_ROGUELIKE_MANIFEST: RoguelikeBoardProps['assetManifest'] = {
    terrains: makeAssetMap({
        floor:  `${CDN}/isometric-dungeon/Isometric/dirt_E.png`,
        wall:   `${CDN}/isometric-dungeon/Isometric/stoneInset_E.png`,
        stairs: `${CDN}/isometric-dungeon/Isometric/stairs_E.png`,
        planks: `${CDN}/isometric-dungeon/Isometric/planks_E.png`,
    }, 'tile'),
    units: {
        player: makeAsset(`${CDN}/isometric-dungeon/Characters/Male/Male_0_Idle0.png`, 'player'),
        enemy:  makeAsset(`${CDN}/sprite-sheets/shadow-legion-sprite-sheet-sw.png`, 'enemy'),
    },
    features: makeAssetMap({
        health_potion: `${CDN}/isometric-dungeon/Isometric/chestClosed_E.png`,
        sword:         `${CDN}/isometric-dungeon/Isometric/barrel_E.png`,
        shield:        `${CDN}/isometric-dungeon/Isometric/barrel_E.png`,
    }, 'item'),
};

// =============================================================================
// Template Props
// =============================================================================

export interface RoguelikeTemplateProps extends TemplateProps {
    scale?: number;
    unitScale?: number;
    tiles?: IsometricTile[];
    enemies?: RoguelikeBoardProps['enemies'];
    items?: RoguelikeBoardProps['items'];
    stairsX?: number;
    stairsY?: number;
    assetManifest?: RoguelikeBoardProps['assetManifest'];
    gameEndEvent?: EventEmit<{ result: string }>;
}

// =============================================================================
// Template
// =============================================================================

export function RoguelikeTemplate({
    entity,
    scale = 0.45,
    unitScale = 1,
    tiles = DEFAULT_ROGUELIKE_TILES,
    enemies,
    items,
    stairsX,
    stairsY,
    assetManifest = DEFAULT_ROGUELIKE_MANIFEST,
    gameEndEvent,
    className,
}: RoguelikeTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity))
        ? entity as EntityRow
        : undefined;

    if (!resolved && !tiles && !assetManifest) return null;

    return (
        <RoguelikeBoard
            entity={resolved}
            tiles={tiles}
            enemies={enemies}
            items={items}
            stairsX={stairsX}
            stairsY={stairsY}
            assetManifest={assetManifest}
            scale={scale}
            unitScale={unitScale}
            moveEvent="MOVE"
            playAgainEvent="PLAY_AGAIN"
            gameEndEvent={gameEndEvent ?? 'GAME_END'}
            className={className}
        />
    );
}

RoguelikeTemplate.displayName = 'RoguelikeTemplate';

export default RoguelikeTemplate;
