/**
 * GameCanvas3DWorldMapTemplate
 *
 * Pure declarative template wrapper for 3D world map.
 * No hooks, no callbacks, no local state -- just entity data and config props.
 *
 * Page: WorldMap3DPage
 * Entity: WorldMap3D
 * ViewType: detail
 *
 * Events Emitted:
 * - TILE_SELECTED - When a tile is clicked ({ tileId, x, z, type })
 * - UNIT_SELECTED - When a unit is clicked ({ unitId, x, z, name })
 * - FEATURE_SELECTED - When a feature is clicked ({ featureId, x, z, type })
 * - TILE_HOVERED - When hovering over a tile ({ tileId, x, z })
 * - TILE_LEAVE - When leaving a tile ({})
 * - CAMERA_CHANGED - When camera position changes ({ position })
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameCanvas3D } from '../molecules/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/types/isometric';
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

const DEFAULT_3D_WORLDMAP_UNITS: IsometricUnit[] = [
    { id: 'h1', x: 1, y: 1, z: 1, unitType: 'hero',  name: 'Amir',      faction: 'player', health: 10, maxHealth: 10 },
    { id: 'h2', x: 3, y: 3, z: 3, unitType: 'scout', name: 'Archivist', faction: 'player', health: 10, maxHealth: 10 },
];

const DEFAULT_3D_WORLDMAP_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'capital',    color: '#f4c542' },
    { id: 'f2', x: 4, y: 2, z: 2, type: 'power_node', color: '#8b5cf6' },
];

export interface GameCanvas3DWorldMapTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present */
    tiles?: IsometricTile[];
    /** Fallback unit data when no entity is present */
    units?: IsometricUnit[];
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
    /** Event name for tile clicks */
    tileClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
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
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions for selected unit */
    validMoves?: Array<{ x: number; z: number }>;
    /** Attack target positions */
    attackTargets?: Array<{ x: number; z: number }>;
}

/**
 * GameCanvas3DWorldMapTemplate Component
 *
 * Template for 3D world map view.
 *
 * @example
 * ```tsx
 * <GameCanvas3DWorldMapTemplate
 *     entity={worldMapEntity}
 *     cameraMode="isometric"
 *     tileClickEvent="SELECT_TILE"
 *     unitClickEvent="SELECT_UNIT"
 *     showCoordinates={true}
 * />
 * ```
 */
export function GameCanvas3DWorldMapTemplate({
    entity,
    tiles: propTiles = DEFAULT_3D_WORLDMAP_TILES,
    units: propUnits = DEFAULT_3D_WORLDMAP_UNITS,
    features: propFeatures = DEFAULT_3D_WORLDMAP_FEATURES,
    cameraMode = 'isometric',
    showGrid = true,
    showCoordinates = true,
    showTileInfo = true,
    shadows = true,
    backgroundColor = '#1a1a2e',
    tileClickEvent,
    unitClickEvent,
    featureClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    cameraChangeEvent,
    selectedUnitId,
    validMoves,
    attackTargets,
    className,
}: GameCanvas3DWorldMapTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    const tiles = resolved ? (Array.isArray(resolved.tiles) ? resolved.tiles : []) as unknown as IsometricTile[] : propTiles;
    const units = resolved ? (Array.isArray(resolved.units) ? resolved.units : []) as unknown as IsometricUnit[] : propUnits;
    const features = resolved ? (Array.isArray(resolved.features) ? resolved.features : []) as unknown as IsometricFeature[] : propFeatures;
    return (
        <GameCanvas3D
            tiles={tiles}
            units={units}
            features={features}
            cameraMode={cameraMode}
            showGrid={showGrid}
            showCoordinates={showCoordinates}
            showTileInfo={showTileInfo}
            shadows={shadows}
            backgroundColor={backgroundColor}
            tileClickEvent={tileClickEvent}
            unitClickEvent={unitClickEvent}
            featureClickEvent={featureClickEvent}
            tileHoverEvent={tileHoverEvent}
            tileLeaveEvent={tileLeaveEvent}
            cameraChangeEvent={cameraChangeEvent}
            selectedUnitId={selectedUnitId}
            validMoves={validMoves}
            attackTargets={attackTargets}
            className={className}
        />
    );
}

GameCanvas3DWorldMapTemplate.displayName = 'GameCanvas3DWorldMapTemplate';

export default GameCanvas3DWorldMapTemplate;
