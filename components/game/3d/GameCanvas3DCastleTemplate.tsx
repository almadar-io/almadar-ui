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
import { GameBoard3D } from './GameBoard3D';
import type { IsometricTile, IsometricFeature } from '../shared/isometricTypes';
import { VStack, HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { cn } from '../../../lib/cn';
import type { TemplateProps } from '../../core/templates/types';
import {
    type Game3DAssetManifest,
    type Tile3DLayout,
    resolveTilesWithModels,
    resolveFeaturesWithModels,
    resolveEntityTiles,
    resolveEntityFeatures,
    resolvePropTiles,
} from '../2d/game3dAssetManifest';
import { boardEntity, str, num } from '../shared/boardEntity';

/** Layout-only default (positions + terrain). Model URLs are resolved from the assetManifest — never baked here. */
const DEFAULT_3D_CASTLE_LAYOUT: Tile3DLayout[] = [
    { id: 't00', x: 0, y: 0, z: 0, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't10', x: 1, y: 0, z: 0, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't20', x: 2, y: 0, z: 0, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't30', x: 3, y: 0, z: 0, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't40', x: 4, y: 0, z: 0, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't01', x: 0, y: 1, z: 1, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't11', x: 1, y: 1, z: 1, type: 'floor', passable: true,  kind: 'dirt' },
    { id: 't21', x: 2, y: 1, z: 1, type: 'floor', passable: true,  kind: 'open' },
    { id: 't31', x: 3, y: 1, z: 1, type: 'floor', passable: true,  kind: 'open' },
    { id: 't41', x: 4, y: 1, z: 1, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't02', x: 0, y: 2, z: 2, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't12', x: 1, y: 2, z: 2, type: 'floor', passable: true,  kind: 'open' },
    { id: 't22', x: 2, y: 2, z: 2, type: 'floor', passable: true,  kind: 'dirt' },
    { id: 't32', x: 3, y: 2, z: 2, type: 'floor', passable: true,  kind: 'open' },
    { id: 't42', x: 4, y: 2, z: 2, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't03', x: 0, y: 3, z: 3, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't13', x: 1, y: 3, z: 3, type: 'floor', passable: true,  kind: 'open' },
    { id: 't23', x: 2, y: 3, z: 3, type: 'floor', passable: true,  kind: 'open' },
    { id: 't33', x: 3, y: 3, z: 3, type: 'floor', passable: true,  kind: 'dirt' },
    { id: 't43', x: 4, y: 3, z: 3, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't04', x: 0, y: 4, z: 4, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't14', x: 1, y: 4, z: 4, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't24', x: 2, y: 4, z: 4, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't34', x: 3, y: 4, z: 4, type: 'wall',  passable: false, kind: 'wall' },
    { id: 't44', x: 4, y: 4, z: 4, type: 'wall',  passable: false, kind: 'wall' },
];

/** Feature layout (positions + type). Model URLs resolve from assetManifest.features. */
const DEFAULT_3D_CASTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'chest',   color: '#f4c542' },
    { id: 'f2', x: 3, y: 1, z: 1, type: 'crystal', color: '#8b5cf6' },
];

export interface GameCanvas3DCastleTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present (layout only — model URLs resolve from assetManifest) */
    tiles?: IsometricTile[];
    /** Fallback feature data when no entity is present */
    features?: IsometricFeature[];
    /** GLB model URLs keyed by terrain — owns all asset choice (no hardcoded URLs in this template). */
    assetManifest?: Game3DAssetManifest;
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
    tiles: propTiles,
    features: propFeatures = DEFAULT_3D_CASTLE_FEATURES,
    assetManifest,
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
    const row = boardEntity(entity);
    const hasEntityTiles = !!row && Array.isArray(row.tiles) && row.tiles.length > 0;

    const tiles = hasEntityTiles
        ? resolveEntityTiles(entity, assetManifest)
        : propTiles
            ? resolvePropTiles(propTiles, assetManifest)
            : resolveTilesWithModels(DEFAULT_3D_CASTLE_LAYOUT, assetManifest);

    const features = (row && Array.isArray(row.features) && row.features.length > 0)
        ? resolveEntityFeatures(entity, assetManifest)
        : resolveFeaturesWithModels(propFeatures, assetManifest);

    const name = row?.name == null ? undefined : str(row.name);
    const level = row?.level == null ? undefined : num(row.level);
    const owner = row?.owner == null ? undefined : str(row.owner);
    const unitCount = row && Array.isArray(row.units) ? row.units.length : 0;

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
