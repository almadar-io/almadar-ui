/**
 * GameCanvas3DBattleTemplate
 *
 * Declarative template for 3D battle/tactical combat.
 * Delegates all interaction state (selectedUnitId, validMoves, attackTargets)
 * to <GameBoard3D> so the model (not this template) owns gameplay state.
 *
 * Page: Battle3DPage
 * Entity: Battle3D / GameBoard3DItem
 * ViewType: detail
 *
 * Events Emitted:
 * - TILE_CLICK - When a tile is clicked
 * - UNIT_CLICK - When a unit is clicked
 * - END_TURN   - When ending turn
 * - EXIT_BATTLE - When exiting battle
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import { GameBoard3D } from '../organisms/GameBoard3D';
import type { IsometricTile, IsometricFeature } from '../organisms/types/isometric';
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

const DEFAULT_3D_BATTLE_FEATURES: IsometricFeature[] = [
    { id: 'f1', x: 2, y: 2, z: 2, type: 'gold_mine', color: '#f4c542' },
    { id: 'f2', x: 3, y: 1, z: 1, type: 'portal',    color: '#8b5cf6' },
];

export interface GameCanvas3DBattleTemplateProps extends TemplateProps {
    /** Fallback tile data when no entity is present */
    tiles?: IsometricTile[];
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
    /** Event name for exiting battle */
    exitEvent?: string;
    /** Show turn indicator overlay */
    showTurnIndicator?: boolean;
}

/**
 * GameCanvas3DBattleTemplate Component
 *
 * Template for 3D battle/tactical combat view.
 * Interaction state lives in the entity (model), not in this component.
 *
 * @example
 * ```tsx
 * <GameCanvas3DBattleTemplate
 *     entity={battleEntity}
 *     cameraMode="perspective"
 *     tileClickEvent="TILE_CLICK"
 *     unitClickEvent="UNIT_CLICK"
 * />
 * ```
 */
export function GameCanvas3DBattleTemplate({
    entity,
    tiles: propTiles = DEFAULT_3D_BATTLE_TILES,
    features: propFeatures = DEFAULT_3D_BATTLE_FEATURES,
    cameraMode = 'perspective',
    backgroundColor = '#2a1a1a',
    tileClickEvent,
    unitClickEvent,
    endTurnEvent,
    cancelEvent,
    attackEvent,
    playAgainEvent,
    gameEndEvent,
    className,
}: GameCanvas3DBattleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    const tiles = resolved ? (Array.isArray(resolved.tiles) ? resolved.tiles as unknown as IsometricTile[] : []) : propTiles;
    const features = resolved ? (Array.isArray(resolved.features) ? resolved.features as unknown as IsometricFeature[] : []) : propFeatures;
    const currentTurn = resolved?.currentTeam as 'player' | 'enemy' | undefined;
    const round = resolved?.turn == null ? undefined : Number(resolved.turn);

    return (
        <Box
            className={cn('game-canvas-3d-battle-template block relative w-full min-h-[85vh]', className)}
        >
            {/* GameBoard3D reads selectedUnitId/validMoves/attackTargets from entity */}
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
                className="game-canvas-3d-battle-template__board"
            />

            {/* Turn indicator overlay */}
            {currentTurn && (
                <HStack
                    gap="sm"
                    align="center"
                    className={cn('battle-template__turn-indicator absolute top-3 right-3 z-10', `battle-template__turn-indicator--${currentTurn}`)}
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
