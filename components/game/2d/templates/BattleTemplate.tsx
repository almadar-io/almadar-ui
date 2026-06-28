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
import type { TemplateProps } from '../../../core/templates/types';
import { BattleBoard } from '../organisms/BattleBoard';
import type { BattleBoardProps } from '../organisms/BattleBoard';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
} from '../../shared/isometricTypes';
import { makeAsset, makeAssetMap } from '../../shared/makeAsset';

const CDN = 'https://almadar-kflow-assets.web.app/shared';

const STONE = makeAsset(`${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_07.png`, 'tile');
const DIRT  = makeAsset(`${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_01.png`, 'tile');
const GRASS = makeAsset(`${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_13.png`, 'tile');

const DEFAULT_BATTLE_TILES: IsometricTile[] = [
    { x: 0, y: 0, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 1, y: 0, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 2, y: 0, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 3, y: 0, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 4, y: 0, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 0, y: 1, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 1, y: 1, terrain: 'dirt',  passable: true,  terrainSprite: DIRT  },
    { x: 2, y: 1, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 3, y: 1, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 4, y: 1, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 0, y: 2, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 1, y: 2, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 2, y: 2, terrain: 'dirt',  passable: true,  terrainSprite: DIRT  },
    { x: 3, y: 2, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 4, y: 2, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 0, y: 3, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 1, y: 3, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 2, y: 3, terrain: 'grass', passable: true,  terrainSprite: GRASS },
    { x: 3, y: 3, terrain: 'dirt',  passable: true,  terrainSprite: DIRT  },
    { x: 4, y: 3, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 0, y: 4, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 1, y: 4, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 2, y: 4, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 3, y: 4, terrain: 'stone', passable: false, terrainSprite: STONE },
    { x: 4, y: 4, terrain: 'stone', passable: false, terrainSprite: STONE },
];

const DEFAULT_BATTLE_UNITS: IsometricUnit[] = [
    { id: 'u1', position: { x: 1, y: 1 }, unitType: 'worker',   name: 'Worker',   team: 'player', health: 10, maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/amir-sprite-sheet-se.png`, 'player') },
    { id: 'u2', position: { x: 3, y: 3 }, unitType: 'guardian', name: 'Guardian', team: 'enemy',  health: 8,  maxHealth: 10, sprite: makeAsset(`${CDN}/sprite-sheets/destroyer-sprite-sheet-sw.png`, 'enemy') },
];

const DEFAULT_BATTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, type: 'gold_mine', sprite: makeAsset(`${CDN}/world-map/gold_mine.png`, 'decoration') },
    { id: 'f2', x: 3, y: 1, type: 'portal',    sprite: makeAsset(`${CDN}/world-map/portal_open.png`, 'decoration') },
];

const DEFAULT_BATTLE_MANIFEST: BattleBoardProps['assetManifest'] = {
    terrains: makeAssetMap({
        stone: `${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_07.png`,
        dirt:  `${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_01.png`,
        grass: `${CDN}/isometric-blocks/PNG/Abstract tiles/abstractTile_13.png`,
    }, 'tile'),
    units: makeAssetMap({
        worker:   `${CDN}/sprite-sheets/amir-sprite-sheet-se.png`,
        guardian: `${CDN}/sprite-sheets/destroyer-sprite-sheet-sw.png`,
    }, 'npc'),
    features: makeAssetMap({
        gold_mine: `${CDN}/world-map/gold_mine.png`,
        portal:    `${CDN}/world-map/portal_open.png`,
    }, 'decoration'),
};

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
    tiles = DEFAULT_BATTLE_TILES,
    units = DEFAULT_BATTLE_UNITS,
    features = DEFAULT_BATTLE_FEATURES,
    assetManifest = DEFAULT_BATTLE_MANIFEST,
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
