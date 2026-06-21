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
import { GameCanvas3D } from '../molecules/GameCanvas3D';
import type { IsometricTile, IsometricUnit, IsometricFeature } from '../organisms/types/isometric';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { cn } from '../../../lib/cn';
import type { TemplateProps } from '../../core/templates/types';

const DEFAULT_3D_BATTLE_TILES: IsometricTile[] = [
    { id: 't00', x: 0, y: 0, z: 0, type: 'stone', passable: false },
    { id: 't10', x: 1, y: 0, z: 0, type: 'stone', passable: false },
    { id: 't20', x: 2, y: 0, z: 0, type: 'stone', passable: false },
    { id: 't30', x: 3, y: 0, z: 0, type: 'stone', passable: false },
    { id: 't40', x: 4, y: 0, z: 0, type: 'stone', passable: false },
    { id: 't01', x: 0, y: 1, z: 1, type: 'stone', passable: false },
    { id: 't11', x: 1, y: 1, z: 1, type: 'dirt',  passable: true  },
    { id: 't21', x: 2, y: 1, z: 1, type: 'grass', passable: true  },
    { id: 't31', x: 3, y: 1, z: 1, type: 'grass', passable: true  },
    { id: 't41', x: 4, y: 1, z: 1, type: 'stone', passable: false },
    { id: 't02', x: 0, y: 2, z: 2, type: 'stone', passable: false },
    { id: 't12', x: 1, y: 2, z: 2, type: 'grass', passable: true  },
    { id: 't22', x: 2, y: 2, z: 2, type: 'dirt',  passable: true  },
    { id: 't32', x: 3, y: 2, z: 2, type: 'grass', passable: true  },
    { id: 't42', x: 4, y: 2, z: 2, type: 'stone', passable: false },
    { id: 't03', x: 0, y: 3, z: 3, type: 'stone', passable: false },
    { id: 't13', x: 1, y: 3, z: 3, type: 'grass', passable: true  },
    { id: 't23', x: 2, y: 3, z: 3, type: 'grass', passable: true  },
    { id: 't33', x: 3, y: 3, z: 3, type: 'dirt',  passable: true  },
    { id: 't43', x: 4, y: 3, z: 3, type: 'stone', passable: false },
    { id: 't04', x: 0, y: 4, z: 4, type: 'stone', passable: false },
    { id: 't14', x: 1, y: 4, z: 4, type: 'stone', passable: false },
    { id: 't24', x: 2, y: 4, z: 4, type: 'stone', passable: false },
    { id: 't34', x: 3, y: 4, z: 4, type: 'stone', passable: false },
    { id: 't44', x: 4, y: 4, z: 4, type: 'stone', passable: false },
];

const DEFAULT_3D_BATTLE_UNITS: IsometricUnit[] = [
    { id: 'u1', x: 1, y: 1, z: 1, unitType: 'warrior', name: 'Worker',   faction: 'player', health: 10, maxHealth: 10 },
    { id: 'u2', x: 3, y: 3, z: 3, unitType: 'enemy',   name: 'Guardian', faction: 'enemy',  health: 8,  maxHealth: 10 },
];

const DEFAULT_3D_BATTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'gold_mine', color: '#f4c542' },
    { id: 'f2', x: 3, y: 1, z: 1, type: 'portal',    color: '#8b5cf6' },
];

export interface GameCanvas3DBattleTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present */
    tiles?: IsometricTile[];
    /** Fallback unit data when no entity is present */
    units?: IsometricUnit[];
    /** Fallback feature data when no entity is present */
    features?: IsometricFeature[];
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
    tiles: propTiles = DEFAULT_3D_BATTLE_TILES,
    units: propUnits = DEFAULT_3D_BATTLE_UNITS,
    features: propFeatures = DEFAULT_3D_BATTLE_FEATURES,
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
    const tiles = resolved ? (Array.isArray(resolved.tiles) ? resolved.tiles : []) as unknown as IsometricTile[] : propTiles;
    const units = resolved ? (Array.isArray(resolved.units) ? resolved.units : []) as unknown as IsometricUnit[] : propUnits;
    const features = resolved ? (Array.isArray(resolved.features) ? resolved.features : []) as unknown as IsometricFeature[] : propFeatures;
    const currentTurn = resolved?.currentTurn as 'player' | 'enemy' | undefined;
    const round = resolved?.round == null ? undefined : Number(resolved.round);
    return (
        <Box
            className={cn('game-canvas-3d-battle-template', className)}
            // Block container with a real height (dedicated CSS isn't bundled): a flex
            // wrapper collapses the GameCanvas3D flex-item's height → r3f canvas ~150px.
            style={{ display: 'block', position: 'relative', width: '100%', minHeight: '85vh' }}
        >
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
                    style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}
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
