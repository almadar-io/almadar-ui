/**
 * GameCanvas3DCastleTemplate
 *
 * Pure declarative template wrapper for 3D castle/settlement view.
 * Shows castle layout with buildings and garrisoned units.
 *
 * Page: Castle3DPage, Settlement3DPage
 * Entity: Castle3D, Settlement3D
 * ViewType: detail
 *
 * Events Emitted:
 * - BUILDING_SELECTED - When a building is clicked
 * - UNIT_SELECTED - When a garrison unit is clicked
 * - BUILD - When building/upgrading
 * - RECRUIT - When recruiting units
 * - EXIT - When exiting castle view
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameCanvas3D } from '../molecules/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/types/isometric';
import { VStack, HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { cn } from '../../../lib/cn';
import type { TemplateProps } from '../../core/templates/types';

export interface GameCanvas3DCastleTemplateProps extends TemplateProps {
    /** 3D camera mode */
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    /** Show grid helper */
    showGrid?: boolean;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Event name for building clicks */
    buildingClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
    /** Event name for build action */
    buildEvent?: string;
    /** Event name for recruit action */
    recruitEvent?: string;
    /** Event name for exit */
    exitEvent?: string;
    /** Currently selected building ID */
    selectedBuildingId?: string | null;
    /** Available build positions */
    availableBuildSites?: Array<{ x: number; z: number }>;
    /** Show castle name header */
    showHeader?: boolean;
    /** Pre-computed selected tile IDs array */
    selectedTileIds?: string[];
}

/**
 * GameCanvas3DCastleTemplate Component
 *
 * Template for 3D castle/settlement management view.
 *
 * @example
 * ```tsx
 * <GameCanvas3DCastleTemplate
 *     entity={castleEntity}
 *     cameraMode="isometric"
 *     showHeader={true}
 *     buildingClickEvent="SELECT_BUILDING"
 *     buildEvent="BUILD_STRUCTURE"
 * />
 * ```
 */
export function GameCanvas3DCastleTemplate({
    entity,
    cameraMode = 'isometric',
    showGrid = true,
    shadows = true,
    backgroundColor = '#1e1e2e',
    buildingClickEvent,
    unitClickEvent,
    buildEvent,
    recruitEvent,
    exitEvent,
    selectedBuildingId,
    selectedTileIds = [],
    availableBuildSites,
    showHeader = true,
    className,
}: GameCanvas3DCastleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved) return null;
    const tiles = (Array.isArray(resolved.tiles) ? resolved.tiles : []) as unknown as IsometricTile[];
    const units = (Array.isArray(resolved.units) ? resolved.units : []) as unknown as IsometricUnit[];
    const features = (Array.isArray(resolved.features) ? resolved.features : []) as unknown as IsometricFeature[];
    const name = resolved.name == null ? undefined : String(resolved.name);
    const level = resolved.level == null ? undefined : Number(resolved.level);
    const owner = resolved.owner == null ? undefined : String(resolved.owner);
    return (
        <VStack className={cn('game-canvas-3d-castle-template', className)}>
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

            <GameCanvas3D
                tiles={tiles}
                units={units}
                features={features}
                cameraMode={cameraMode}
                showGrid={showGrid}
                showCoordinates={false}
                showTileInfo={false}
                shadows={shadows}
                backgroundColor={backgroundColor}
                featureClickEvent={buildingClickEvent}
                unitClickEvent={unitClickEvent}
                selectedTileIds={selectedTileIds}
                validMoves={availableBuildSites}
                className="game-canvas-3d-castle-template__canvas"
            />

            {/* Garrison info overlay */}
            {units.length > 0 && (
                <HStack gap="sm" align="center" className="castle-template__garrison-info">
                    <Typography variant="small" className="garrison-info__label">Garrison:</Typography>
                    <Typography variant="small" weight="bold" className="garrison-info__count">{units.length} units</Typography>
                </HStack>
            )}
        </VStack>
    );
}

GameCanvas3DCastleTemplate.displayName = 'GameCanvas3DCastleTemplate';

export default GameCanvas3DCastleTemplate;
