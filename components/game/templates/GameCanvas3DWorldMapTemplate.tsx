/**
 * GameCanvas3DWorldMapTemplate
 *
 * Declarative template for 3D world map.
 * Delegates interaction state (selectedUnitId, validMoves, attackTargets)
 * to <GameBoard3D> so the model owns all gameplay state.
 *
 * Page: WorldMap3DPage
 * Entity: WorldMap3D / GameBoard3DItem
 * ViewType: detail
 *
 * Events Emitted:
 * - TILE_CLICK    - When a tile is clicked ({ tileId, x, z, type })
 * - UNIT_CLICK    - When a unit is clicked ({ unitId, x, z, name })
 * - FEATURE_CLICK - When a feature is clicked ({ featureId, x, z, type })
 * - TILE_HOVER    - When hovering over a tile ({ tileId, x, z })
 * - TILE_LEAVE    - When leaving a tile ({})
 * - CAMERA_CHANGE - When camera position changes ({ position })
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameBoard3D } from '../organisms/GameBoard3D';
import type { IsometricTile, IsometricFeature } from '../organisms/types/isometric';
import type { TemplateProps } from '../../core/templates/types';

const DEFAULT_3D_WORLDMAP_TILES: IsometricTile[] = [
    { id: 't00', x: 0, y: 0, z: 0, type: 'mountain', passable: false },
    { id: 't10', x: 1, y: 0, z: 0, type: 'mountain', passable: false },
    { id: 't20', x: 2, y: 0, z: 0, type: 'water',    passable: false },
    { id: 't30', x: 3, y: 0, z: 0, type: 'mountain', passable: false },
    { id: 't40', x: 4, y: 0, z: 0, type: 'mountain', passable: false },
    { id: 't01', x: 0, y: 1, z: 1, type: 'mountain', passable: false },
    { id: 't11', x: 1, y: 1, z: 1, type: 'grass',    passable: true  },
    { id: 't21', x: 2, y: 1, z: 1, type: 'grass',    passable: true  },
    { id: 't31', x: 3, y: 1, z: 1, type: 'grass',    passable: true  },
    { id: 't41', x: 4, y: 1, z: 1, type: 'water',    passable: false },
    { id: 't02', x: 0, y: 2, z: 2, type: 'water',    passable: false },
    { id: 't12', x: 1, y: 2, z: 2, type: 'grass',    passable: true  },
    { id: 't22', x: 2, y: 2, z: 2, type: 'road',     passable: true  },
    { id: 't32', x: 3, y: 2, z: 2, type: 'grass',    passable: true  },
    { id: 't42', x: 4, y: 2, z: 2, type: 'mountain', passable: false },
    { id: 't03', x: 0, y: 3, z: 3, type: 'mountain', passable: false },
    { id: 't13', x: 1, y: 3, z: 3, type: 'grass',    passable: true  },
    { id: 't23', x: 2, y: 3, z: 3, type: 'grass',    passable: true  },
    { id: 't33', x: 3, y: 3, z: 3, type: 'road',     passable: true  },
    { id: 't43', x: 4, y: 3, z: 3, type: 'mountain', passable: false },
    { id: 't04', x: 0, y: 4, z: 4, type: 'mountain', passable: false },
    { id: 't14', x: 1, y: 4, z: 4, type: 'water',    passable: false },
    { id: 't24', x: 2, y: 4, z: 4, type: 'grass',    passable: true  },
    { id: 't34', x: 3, y: 4, z: 4, type: 'mountain', passable: false },
    { id: 't44', x: 4, y: 4, z: 4, type: 'mountain', passable: false },
];

const DEFAULT_3D_WORLDMAP_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'capital',    color: '#f4c542' },
    { id: 'f2', x: 4, y: 2, z: 2, type: 'power_node', color: '#8b5cf6' },
];

export interface GameCanvas3DWorldMapTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present */
    tiles?: IsometricTile[];
    /** Fallback feature data when no entity is present */
    features?: IsometricFeature[];
    /** 3D camera mode */
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    /** Show grid helper */
    showGrid?: boolean;
    /** Show coordinate overlay */
    showCoordinates?: boolean;
    /** Show tile info on hover */
    showTileInfo?: boolean;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Event name for tile clicks — forwarded to the model */
    tileClickEvent?: string;
    /** Event name for unit clicks — forwarded to the model */
    unitClickEvent?: string;
    /** Event name for ending turn */
    endTurnEvent?: string;
    /** Event name for cancel/deselect */
    cancelEvent?: string;
    /** Event name for attack emission */
    attackEvent?: string;
    /** Event name for play again / reset */
    playAgainEvent?: string;
    /** Event name for game end detection */
    gameEndEvent?: string;
    /** Event name for feature clicks */
    featureClickEvent?: string;
    /** Event name for tile hover */
    tileHoverEvent?: string;
    /** Event name for tile leave */
    tileLeaveEvent?: string;
    /** Event name for camera changes */
    cameraChangeEvent?: string;
    /** Exit/back event name */
    exitEvent?: string;
}

/**
 * GameCanvas3DWorldMapTemplate Component
 *
 * Template for 3D world map view.
 * Interaction state lives in the entity (model), not in this component.
 *
 * @example
 * ```tsx
 * <GameCanvas3DWorldMapTemplate
 *     entity={worldMapEntity}
 *     cameraMode="isometric"
 *     tileClickEvent="TILE_CLICK"
 *     unitClickEvent="UNIT_CLICK"
 *     showCoordinates={true}
 * />
 * ```
 */
export function GameCanvas3DWorldMapTemplate({
    entity,
    tiles: propTiles = DEFAULT_3D_WORLDMAP_TILES,
    features: propFeatures = DEFAULT_3D_WORLDMAP_FEATURES,
    cameraMode = 'isometric',
    backgroundColor = '#1a1a2e',
    tileClickEvent,
    unitClickEvent,
    endTurnEvent,
    cancelEvent,
    attackEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: GameCanvas3DWorldMapTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    const tiles = resolved ? (Array.isArray(resolved.tiles) ? resolved.tiles as unknown as IsometricTile[] : []) : propTiles;
    const features = resolved ? (Array.isArray(resolved.features) ? resolved.features as unknown as IsometricFeature[] : []) : propFeatures;

    return (
        /* GameBoard3D reads selectedUnitId/validMoves/attackTargets from entity */
        <GameBoard3D
            entity={entity}
            tiles={tiles}
            features={features}
            cameraMode={cameraMode}
            backgroundColor={backgroundColor}
            tileClickEvent={tileClickEvent}
            unitClickEvent={unitClickEvent}
            endTurnEvent={endTurnEvent}
            cancelEvent={cancelEvent}
            attackEvent={attackEvent}
            playAgainEvent={playAgainEvent}
            gameEndEvent={gameEndEvent}
            className={className}
        />
    );
}

GameCanvas3DWorldMapTemplate.displayName = 'GameCanvas3DWorldMapTemplate';

export default GameCanvas3DWorldMapTemplate;
