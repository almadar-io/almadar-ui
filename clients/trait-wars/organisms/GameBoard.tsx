/**
 * GameBoard Component
 * 
 * The main game board with grid of tiles, unit selection, and movement.
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, cn } from '@almadar/ui';
import { GameTile, TileUnit } from './GameTile';
import { StateIndicator } from '../atoms/StateIndicator';
import {
    GameState,
    Position,
    calculateValidMoves,
    calculateAttackTargets
} from '../types/game';
import { TileType } from '../atoms/TileSprite';

export interface GameBoardProps {
    /** Game state */
    gameState: GameState;
    /** Callback when game state changes */
    onStateChange?: (newState: GameState) => void;
    /** Tile size in pixels */
    tileSize?: number;
    /** Additional CSS classes */
    className?: string;
}

export function GameBoard({
    gameState,
    onStateChange,
    tileSize = 48,
    className,
}: GameBoardProps): JSX.Element {
    const [hoveredPos, setHoveredPos] = useState<Position | null>(null);

    const handleTileClick = useCallback((x: number, y: number) => {
        const tile = gameState.board[y][x];

        // If a unit is selected
        if (gameState.selectedUnitId) {
            const selectedUnit = gameState.units[gameState.selectedUnitId];

            // Check if clicking on a valid move position
            const isValidMove = gameState.validMoves.some(m => m.x === x && m.y === y);
            if (isValidMove && !tile.unitId) {
                // Move the unit
                const newBoard = gameState.board.map(row => row.map(t => ({ ...t })));
                newBoard[selectedUnit.position.y][selectedUnit.position.x].unitId = undefined;
                newBoard[y][x].unitId = selectedUnit.id;

                const newUnits = { ...gameState.units };
                newUnits[selectedUnit.id] = {
                    ...selectedUnit,
                    position: { x, y },
                };

                onStateChange?.({
                    ...gameState,
                    board: newBoard,
                    units: newUnits,
                    selectedUnitId: undefined,
                    validMoves: [],
                    attackTargets: [],
                });
                return;
            }

            // Check if clicking on an attack target
            const isAttackTarget = gameState.attackTargets.some(t => t.x === x && t.y === y);
            if (isAttackTarget && tile.unitId) {
                const targetUnit = gameState.units[tile.unitId];
                if (targetUnit) {
                    // Calculate damage
                    const damage = Math.max(1, selectedUnit.attack - targetUnit.defense);
                    const newHealth = targetUnit.health - damage;

                    const newUnits = { ...gameState.units };
                    if (newHealth <= 0) {
                        // Unit defeated
                        delete newUnits[tile.unitId];
                        const newBoard = gameState.board.map(row => row.map(t => ({ ...t })));
                        newBoard[y][x].unitId = undefined;

                        onStateChange?.({
                            ...gameState,
                            board: newBoard,
                            units: newUnits,
                            selectedUnitId: undefined,
                            validMoves: [],
                            attackTargets: [],
                        });
                    } else {
                        newUnits[tile.unitId] = { ...targetUnit, health: newHealth };
                        onStateChange?.({
                            ...gameState,
                            units: newUnits,
                            selectedUnitId: undefined,
                            validMoves: [],
                            attackTargets: [],
                        });
                    }
                }
                return;
            }
        }

        // Select a unit
        if (tile.unitId) {
            const unit = gameState.units[tile.unitId];
            if (unit && unit.team === gameState.activeTeam) {
                const newState: GameState = {
                    ...gameState,
                    selectedUnitId: tile.unitId,
                    validMoves: calculateValidMoves(gameState, tile.unitId),
                    attackTargets: calculateAttackTargets(gameState, tile.unitId),
                };
                onStateChange?.(newState);
                return;
            }
        }

        // Deselect
        onStateChange?.({
            ...gameState,
            selectedUnitId: undefined,
            validMoves: [],
            attackTargets: [],
        });
    }, [gameState, onStateChange]);

    return (
        <Box className={cn('flex flex-col gap-4', className)}>
            {/* Turn indicator */}
            <Box display="flex" className="items-center justify-between bg-card p-3 rounded-lg">
                <Typography variant="body1" className="text-foreground">
                    Turn {gameState.currentTurn}
                </Typography>
                <StateIndicator
                    state={gameState.currentPhase === 'execution' ? 'attacking' : 'active'}
                    label={gameState.currentPhase.toUpperCase()}
                />
                <Box display="flex" className="items-center gap-2">
                    <Box className={cn(
                        'w-4 h-4 rounded-full',
                        gameState.activeTeam === 'player' ? 'bg-[var(--tw-faction-resonator)]' : 'bg-[var(--tw-faction-dominion)]'
                    )} />
                    <Typography variant="body2" className="text-foreground">
                        {gameState.activeTeam === 'player' ? 'Player' : 'Enemy'} Turn
                    </Typography>
                </Box>
            </Box>

            {/* Game grid */}
            <Box
                display="grid"
                className="gap-0.5 bg-background p-2 rounded-lg"
                style={{
                    gridTemplateColumns: `repeat(${gameState.board[0]?.length || 0}, ${tileSize}px)`,
                }}
            >
                {gameState.board.map((row, y) =>
                    row.map((tile, x) => {
                        const unit = tile.unitId ? gameState.units[tile.unitId] : undefined;
                        const isSelected = gameState.selectedUnitId === tile.unitId;
                        const isValidMove = gameState.validMoves.some(m => m.x === x && m.y === y);
                        const isAttackTarget = gameState.attackTargets.some(t => t.x === x && t.y === y);
                        const isHovered = hoveredPos?.x === x && hoveredPos?.y === y;

                        const tileUnit: TileUnit | undefined = unit ? {
                            id: unit.id,
                            characterType: unit.characterType,
                            team: unit.team,
                            state: unit.traits[0]?.currentState === 'attacking' ? 'attacking' :
                                unit.traits[0]?.currentState === 'defending' ? 'defending' : 'idle',
                        } : undefined;

                        return (
                            <GameTile
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                terrain={tile.terrain}
                                unit={tileUnit}
                                isSelected={isSelected}
                                isValidMove={isValidMove}
                                isAttackTarget={isAttackTarget}
                                isHovered={isHovered}
                                size={tileSize}
                                onClick={() => handleTileClick(x, y)}
                                onMouseEnter={() => setHoveredPos({ x, y })}
                                onMouseLeave={() => setHoveredPos(null)}
                            />
                        );
                    })
                )}
            </Box>

            {/* Selected unit info */}
            {gameState.selectedUnitId && gameState.units[gameState.selectedUnitId] && (
                <Box className="bg-card p-3 rounded-lg">
                    <Typography variant="body2" className="text-foreground font-bold">
                        {gameState.units[gameState.selectedUnitId].name}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                        HP: {gameState.units[gameState.selectedUnitId].health}/{gameState.units[gameState.selectedUnitId].maxHealth} |
                        ATK: {gameState.units[gameState.selectedUnitId].attack} |
                        DEF: {gameState.units[gameState.selectedUnitId].defense}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default GameBoard;
