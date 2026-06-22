/**
 * GameCanvas3DCastleTemplate
 *
 * Declarative template for 3D castle/settlement view.
 * Delegates interaction state (selectedUnitId, validMoves, attackTargets)
 * to <GameBoard3D> so the model owns all gameplay state.
 *
 * Page: Castle3DPage, Settlement3DPage
 * Entity: Castle3D / GameBoard3DItem
 * ViewType: detail
 *
 * Events Emitted:
 * - BUILDING_SELECTED - When a building is clicked
 * - UNIT_SELECTED     - When a garrison unit is clicked
 * - BUILD             - When building/upgrading
 * - RECRUIT           - When recruiting units
 * - EXIT              - When exiting castle view
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameBoard3D } from '../organisms/GameBoard3D';
import type { IsometricTile, IsometricFeature } from '../organisms/types/isometric';
import { VStack, HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { cn } from '../../../lib/cn';
import type { TemplateProps } from '../../core/templates/types';

const CDN = 'https://almadar-kflow-assets.web.app/shared/3d/dungeon/floor';
const FLOOR_WALL = `${CDN}/template-floor-detail-a.glb`;
const FLOOR_DIRT = `${CDN}/template-floor-detail.glb`;
const FLOOR_OPEN = `${CDN}/template-floor.glb`;

const DEFAULT_3D_CASTLE_TILES: IsometricTile[] = [
    { id: 't00', x: 0, y: 0, z: 0, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't10', x: 1, y: 0, z: 0, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't20', x: 2, y: 0, z: 0, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't30', x: 3, y: 0, z: 0, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't40', x: 4, y: 0, z: 0, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't01', x: 0, y: 1, z: 1, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't11', x: 1, y: 1, z: 1, type: 'floor', passable: true,  modelUrl: FLOOR_DIRT },
    { id: 't21', x: 2, y: 1, z: 1, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't31', x: 3, y: 1, z: 1, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't41', x: 4, y: 1, z: 1, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't02', x: 0, y: 2, z: 2, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't12', x: 1, y: 2, z: 2, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't22', x: 2, y: 2, z: 2, type: 'floor', passable: true,  modelUrl: FLOOR_DIRT },
    { id: 't32', x: 3, y: 2, z: 2, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't42', x: 4, y: 2, z: 2, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't03', x: 0, y: 3, z: 3, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't13', x: 1, y: 3, z: 3, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't23', x: 2, y: 3, z: 3, type: 'floor', passable: true,  modelUrl: FLOOR_OPEN },
    { id: 't33', x: 3, y: 3, z: 3, type: 'floor', passable: true,  modelUrl: FLOOR_DIRT },
    { id: 't43', x: 4, y: 3, z: 3, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't04', x: 0, y: 4, z: 4, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't14', x: 1, y: 4, z: 4, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't24', x: 2, y: 4, z: 4, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't34', x: 3, y: 4, z: 4, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
    { id: 't44', x: 4, y: 4, z: 4, type: 'wall',  passable: false, modelUrl: FLOOR_WALL },
];

const DEFAULT_3D_CASTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'chest',   color: '#f4c542' },
    { id: 'f2', x: 3, y: 1, z: 1, type: 'crystal', color: '#8b5cf6' },
];

export interface GameCanvas3DCastleTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present */
    tiles?: IsometricTile[];
    /** Fallback feature data when no entity is present */
    features?: IsometricFeature[];
    /** 3D camera mode */
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    /** Show grid helper */
    showGrid?: boolean;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Event name for building (feature) clicks */
    buildingClickEvent?: string;
    /** Event name for unit clicks */
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
    /** Event name for build action */
    buildEvent?: string;
    /** Event name for recruit action */
    recruitEvent?: string;
    /** Event name for exit */
    exitEvent?: string;
    /** Show castle name header */
    showHeader?: boolean;
    /** Unit draw-size multiplier forwarded to GameBoard3D. Default 1. */
    unitScale?: number;
    /** Board zoom/group scale forwarded to GameBoard3D. Default 0.45. */
    scale?: number;
}

/**
 * GameCanvas3DCastleTemplate Component
 *
 * Template for 3D castle/settlement management view.
 * Interaction state lives in the entity (model), not in this component.
 *
 * @example
 * ```tsx
 * <GameCanvas3DCastleTemplate
 *     entity={castleEntity}
 *     cameraMode="isometric"
 *     showHeader={true}
 *     buildingClickEvent="UNIT_CLICK"
 * />
 * ```
 */
export function GameCanvas3DCastleTemplate({
    entity,
    tiles: propTiles = DEFAULT_3D_CASTLE_TILES,
    features: propFeatures = DEFAULT_3D_CASTLE_FEATURES,
    cameraMode = 'isometric',
    backgroundColor = '#1e1e2e',
    buildingClickEvent,
    unitClickEvent,
    endTurnEvent,
    cancelEvent,
    attackEvent,
    playAgainEvent,
    gameEndEvent,
    showHeader = true,
    unitScale,
    scale,
    className,
}: GameCanvas3DCastleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    const tiles = resolved ? (Array.isArray(resolved.tiles) ? resolved.tiles as unknown as IsometricTile[] : []) : propTiles;
    const features = resolved ? (Array.isArray(resolved.features) ? resolved.features as unknown as IsometricFeature[] : []) : propFeatures;
    const name = resolved?.name == null ? undefined : String(resolved.name);
    const level = resolved?.level == null ? undefined : Number(resolved.level);
    const owner = resolved?.owner == null ? undefined : String(resolved.owner);
    const unitCount = resolved && Array.isArray(resolved.units) ? resolved.units.length : 0;

    return (
        <VStack
            className={cn('game-canvas-3d-castle-template block w-full min-h-[85vh]', className)}
        >
            {/* Castle header */}
            {showHeader && name && (
                <HStack gap="md" align="center" className="castle-template__header">
                    <Typography variant="h2" className="header__name">{name}</Typography>
                    {level != null && (
                        <Typography variant="small" className="header__level">Level {level}</Typography>
                    )}
                    {owner && (
                        <Typography variant="small" color="muted" className="header__owner">{owner}</Typography>
                    )}
                </HStack>
            )}

            {/* GameBoard3D reads selectedUnitId/validMoves/attackTargets from entity */}
            <GameBoard3D
                entity={entity}
                tiles={tiles}
                features={features}
                cameraMode={cameraMode}
                backgroundColor={backgroundColor}
                unitScale={unitScale}
                scale={scale}
                tileClickEvent={buildingClickEvent}
                unitClickEvent={unitClickEvent}
                endTurnEvent={endTurnEvent}
                cancelEvent={cancelEvent}
                attackEvent={attackEvent}
                playAgainEvent={playAgainEvent}
                gameEndEvent={gameEndEvent}
                className="game-canvas-3d-castle-template__board"
            />

            {/* Garrison info */}
            {unitCount > 0 && (
                <HStack gap="sm" align="center" className="castle-template__garrison-info">
                    <Typography variant="small" className="garrison-info__label">Garrison:</Typography>
                    <Typography variant="small" weight="bold" className="garrison-info__count">{unitCount} units</Typography>
                </HStack>
            )}
        </VStack>
    );
}

GameCanvas3DCastleTemplate.displayName = 'GameCanvas3DCastleTemplate';

export default GameCanvas3DCastleTemplate;
