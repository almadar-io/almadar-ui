/**
 * GameCanvas3DBattleTemplate
 *
 * Pure declarative template wrapper for 3D battle scenes.
 * Optimized for tactical combat view with turn indicators.
 *
 * Page: Battle3DPage
 * Entity: Battle3D
 * ViewType: detail
 *
 * Events Emitted:
 * - TILE_SELECTED - When a tile is clicked
 * - UNIT_SELECTED - When a unit is clicked
 * - UNIT_ATTACK - When attacking a unit
 * - UNIT_MOVE - When moving a unit
 * - END_TURN - When ending turn
 * - EXIT_BATTLE - When exiting battle
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameCanvas3D } from '../organisms/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/types/isometric';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { cn } from '../../../lib/cn';
import type { TemplateProps } from '../../core/templates/types';

export interface GameCanvas3DBattleTemplateProps extends TemplateProps {
    /** 3D camera mode - defaults to perspective for dramatic effect */
    cameraMode?: 'isometric' | 'perspective' | 'top-down';
    /** Show grid helper */
    showGrid?: boolean;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color - darker for battle atmosphere */
    backgroundColor?: string;
    /** Event name for tile clicks */
    tileClickEvent?: string;
    /** Event name for unit clicks */
    unitClickEvent?: string;
    /** Event name for unit attack */
    unitAttackEvent?: string;
    /** Event name for unit move */
    unitMoveEvent?: string;
    /** Event name for ending turn */
    endTurnEvent?: string;
    /** Event name for exiting battle */
    exitEvent?: string;
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions */
    validMoves?: Array<{ x: number; z: number }>;
    /** Valid attack targets */
    attackTargets?: Array<{ x: number; z: number }>;
    /** Show turn indicator overlay */
    showTurnIndicator?: boolean;
}

/**
 * GameCanvas3DBattleTemplate Component
 *
 * Template for 3D battle/tactical combat view.
 *
 * @example
 * ```tsx
 * <GameCanvas3DBattleTemplate
 *     entity={battleEntity}
 *     cameraMode="perspective"
 *     selectedUnitId="unit-1"
 *     validMoves={[{ x: 2, z: 3 }]}
 *     attackTargets={[{ x: 5, z: 5 }]}
 *     tileClickEvent="SELECT_TILE"
 *     unitClickEvent="SELECT_UNIT"
 * />
 * ```
 */
export function GameCanvas3DBattleTemplate({
    entity,
    cameraMode = 'perspective',
    showGrid = true,
    shadows = true,
    backgroundColor = '#2a1a1a',
    tileClickEvent,
    unitClickEvent,
    unitAttackEvent,
    unitMoveEvent,
    endTurnEvent,
    exitEvent,
    selectedUnitId,
    validMoves,
    attackTargets,
    className,
}: GameCanvas3DBattleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved) return null;
    const tiles = (Array.isArray(resolved.tiles) ? resolved.tiles : []) as unknown as IsometricTile[];
    const units = (Array.isArray(resolved.units) ? resolved.units : []) as unknown as IsometricUnit[];
    const features = (Array.isArray(resolved.features) ? resolved.features : []) as unknown as IsometricFeature[];
    const currentTurn = resolved.currentTurn as 'player' | 'enemy' | undefined;
    const round = resolved.round == null ? undefined : Number(resolved.round);
    return (
        <Box className={cn('game-canvas-3d-battle-template', className)}>
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
                tileClickEvent={tileClickEvent}
                unitClickEvent={unitClickEvent}
                selectedUnitId={selectedUnitId}
                validMoves={validMoves}
                attackTargets={attackTargets}
                className="game-canvas-3d-battle-template__canvas"
            />

            {/* Turn indicator overlay */}
            {currentTurn && (
                <HStack
                    gap="sm"
                    align="center"
                    className={cn('battle-template__turn-indicator', `battle-template__turn-indicator--${currentTurn}`)}
                >
                    <Typography variant="body" className="turn-indicator__label">
                        {currentTurn === 'player' ? 'Your Turn' : "Enemy's Turn"}
                    </Typography>
                    {round != null && (
                        <Typography variant="small" className="turn-indicator__round">
                            Round {round}
                        </Typography>
                    )}
                </HStack>
            )}
        </Box>
    );
}

GameCanvas3DBattleTemplate.displayName = 'GameCanvas3DBattleTemplate';

export default GameCanvas3DBattleTemplate;
