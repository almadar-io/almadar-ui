/**
 * GameBoardWithTraits Component
 * 
 * Enhanced game board with trait visibility panel showing:
 * - Selected unit's trait state machine
 * - State changes during combat
 * - Transition preview on hover
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  cn,
} from '@almadar/ui';
import { GameTile, TileUnit } from './GameTile';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { TraitStateViewer, TraitDefinition } from '../molecules/TraitStateViewer';
import { GameUnit as GameUnitComponent } from '../molecules/GameUnit';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIPanelUrl } from '../assets';
import {
    GameState,
    Position,
    GameUnit,
    calculateValidMoves,
    calculateAttackTargets
} from '../types/game';

export interface CombatLogEntry {
    turn: number;
    message: string;
    type: 'attack' | 'move' | 'state_change' | 'defeat';
}

export interface GameBoardWithTraitsProps {
    /** Game state */
    gameState: GameState;
    /** Callback when game state changes */
    onStateChange?: (newState: GameState) => void;
    /** Combat log entries */
    combatLog?: CombatLogEntry[];
    /** Callback to add combat log entry */
    onCombatLog?: (entry: CombatLogEntry) => void;
    /** Tile size in pixels */
    tileSize?: number;
    /** Whether to show trait panel */
    showTraitPanel?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// Convert unit traits to TraitDefinition format
function unitTraitToDefinition(unit: GameUnit): TraitDefinition | null {
    if (!unit.traits.length) return null;
    const trait = unit.traits[0];

    // Create transitions based on trait type
    const transitions = getTraitTransitions(trait.name, trait.currentState);

    return {
        name: trait.name,
        description: `${unit.name}'s active behavior`,
        states: trait.states,
        currentState: trait.currentState,
        transitions,
    };
}

function getTraitTransitions(traitName: string, currentState: string) {
    const traitTransitions: Record<string, { from: string; to: string; event: string; guardHint?: string }[]> = {
        'Berserker': [
            { from: 'idle', to: 'defending', event: 'DEFEND' },
            { from: 'idle', to: 'enraged', event: 'TAKE_DAMAGE', guardHint: 'HP < 50%' },
            { from: 'defending', to: 'idle', event: 'END_TURN' },
            { from: 'enraged', to: 'exhausted', event: 'ATTACK' },
            { from: 'exhausted', to: 'idle', event: 'TICK' },
        ],
        'Spellweaver': [
            { from: 'preparing', to: 'casting', event: 'CAST_SPELL', guardHint: 'Mana >= 20' },
            { from: 'casting', to: 'recovering', event: 'SPELL_COMPLETE' },
            { from: 'recovering', to: 'preparing', event: 'TICK' },
        ],
        'Divine Grace': [
            { from: 'ready', to: 'channeling', event: 'START_HEAL' },
            { from: 'channeling', to: 'cooldown', event: 'HEAL_COMPLETE' },
            { from: 'cooldown', to: 'ready', event: 'TICK' },
        ],
        'Undead': [
            { from: 'idle', to: 'attacking', event: 'ATTACK' },
            { from: 'attacking', to: 'idle', event: 'END_TURN' },
        ],
        'Ethereal': [
            { from: 'hidden', to: 'attacking', event: 'ATTACK' },
            { from: 'attacking', to: 'hidden', event: 'VANISH', guardHint: '2 turn cooldown' },
        ],
    };

    return traitTransitions[traitName] || [];
}

// Trigger trait state change based on event
function triggerTraitEvent(unit: GameUnit, event: string): GameUnit {
    if (!unit.traits.length) return unit;

    const trait = unit.traits[0];
    const transitions = getTraitTransitions(trait.name, trait.currentState);
    const validTransition = transitions.find(t => t.from === trait.currentState && t.event === event);

    if (validTransition) {
        return {
            ...unit,
            traits: [{
                ...trait,
                currentState: validTransition.to,
            }],
        };
    }

    return unit;
}

export function GameBoardWithTraits({
    gameState,
    onStateChange,
    combatLog = [],
    onCombatLog,
    tileSize = 48,
    showTraitPanel = true,
    className,
}: GameBoardWithTraitsProps): JSX.Element {
    const [hoveredPos, setHoveredPos] = useState<Position | null>(null);
    const [hoveredTransition, setHoveredTransition] = useState<string | null>(null);
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const combatLogBgUrl = getGameUIPanelUrl(manifest, 'combatLogBg');

    // Get selected unit and its trait
    const selectedUnit = gameState.selectedUnitId ? gameState.units[gameState.selectedUnitId] : null;
    const selectedTrait = selectedUnit ? unitTraitToDefinition(selectedUnit) : null;

    // Get hovered unit for preview
    const hoveredUnit = useMemo(() => {
        if (!hoveredPos) return null;
        const tile = gameState.board[hoveredPos.y]?.[hoveredPos.x];
        return tile?.unitId ? gameState.units[tile.unitId] : null;
    }, [hoveredPos, gameState]);

    const hoveredTrait = hoveredUnit ? unitTraitToDefinition(hoveredUnit) : null;

    const handleTileClick = useCallback((x: number, y: number) => {
        const tile = gameState.board[y][x];

        if (gameState.selectedUnitId) {
            const selectedUnit = gameState.units[gameState.selectedUnitId];

            // Move
            const isValidMove = gameState.validMoves.some(m => m.x === x && m.y === y);
            if (isValidMove && !tile.unitId) {
                const newBoard = gameState.board.map(row => row.map(t => ({ ...t })));
                newBoard[selectedUnit.position.y][selectedUnit.position.x].unitId = undefined;
                newBoard[y][x].unitId = selectedUnit.id;

                const newUnits = { ...gameState.units };
                newUnits[selectedUnit.id] = {
                    ...selectedUnit,
                    position: { x, y },
                };

                onCombatLog?.({
                    turn: gameState.currentTurn,
                    message: `${selectedUnit.name} moved to (${x}, ${y})`,
                    type: 'move',
                });

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

            // Attack with trait state changes
            const isAttackTarget = gameState.attackTargets.some(t => t.x === x && t.y === y);
            if (isAttackTarget && tile.unitId) {
                const targetUnit = gameState.units[tile.unitId];
                if (targetUnit) {
                    const damage = Math.max(1, selectedUnit.attack - targetUnit.defense);
                    const newHealth = targetUnit.health - damage;

                    const newUnits = { ...gameState.units };

                    // Trigger ATTACK event on attacker
                    newUnits[selectedUnit.id] = triggerTraitEvent(selectedUnit, 'ATTACK');

                    onCombatLog?.({
                        turn: gameState.currentTurn,
                        message: `${selectedUnit.name} attacks ${targetUnit.name} for ${damage} damage!`,
                        type: 'attack',
                    });

                    // Log state change
                    if (newUnits[selectedUnit.id].traits[0]?.currentState !== selectedUnit.traits[0]?.currentState) {
                        onCombatLog?.({
                            turn: gameState.currentTurn,
                            message: `${selectedUnit.name}'s ${selectedUnit.traits[0]?.name} → ${newUnits[selectedUnit.id].traits[0]?.currentState}`,
                            type: 'state_change',
                        });
                    }

                    if (newHealth <= 0) {
                        delete newUnits[tile.unitId];
                        const newBoard = gameState.board.map(row => row.map(t => ({ ...t })));
                        newBoard[y][x].unitId = undefined;

                        onCombatLog?.({
                            turn: gameState.currentTurn,
                            message: `${targetUnit.name} was defeated!`,
                            type: 'defeat',
                        });

                        onStateChange?.({
                            ...gameState,
                            board: newBoard,
                            units: newUnits,
                            selectedUnitId: undefined,
                            validMoves: [],
                            attackTargets: [],
                        });
                    } else {
                        // Trigger TAKE_DAMAGE on target
                        const updatedTarget = triggerTraitEvent({ ...targetUnit, health: newHealth }, 'TAKE_DAMAGE');
                        newUnits[tile.unitId] = updatedTarget;

                        if (updatedTarget.traits[0]?.currentState !== targetUnit.traits[0]?.currentState) {
                            onCombatLog?.({
                                turn: gameState.currentTurn,
                                message: `${targetUnit.name}'s ${targetUnit.traits[0]?.name} → ${updatedTarget.traits[0]?.currentState}`,
                                type: 'state_change',
                            });
                        }

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

        // Select unit
        if (tile.unitId) {
            const unit = gameState.units[tile.unitId];
            if (unit && unit.team === gameState.activeTeam) {
                onStateChange?.({
                    ...gameState,
                    selectedUnitId: tile.unitId,
                    validMoves: calculateValidMoves(gameState, tile.unitId),
                    attackTargets: calculateAttackTargets(gameState, tile.unitId),
                });
                return;
            }
        }

        onStateChange?.({
            ...gameState,
            selectedUnitId: undefined,
            validMoves: [],
            attackTargets: [],
        });
    }, [gameState, onStateChange, onCombatLog]);

    return (
        <Box className={cn('flex gap-4', className)}>
            {/* Main game area */}
            <Box className="flex flex-col gap-4 flex-1">
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
                                    unit.traits[0]?.currentState === 'defending' ? 'defending' :
                                        unit.traits[0]?.currentState === 'enraged' ? 'attacking' :
                                            unit.traits[0]?.currentState === 'casting' ? 'casting' : 'idle',
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

                {/* Combat log */}
                {combatLog.length > 0 && (
                    <Box
                        className="bg-card p-3 rounded-lg max-h-32 overflow-y-auto"
                        style={combatLogBgUrl ? {
                            backgroundImage: `url(${combatLogBgUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        } : undefined}
                    >
                        <Typography variant="caption" className="text-muted-foreground mb-2 block">Combat Log</Typography>
                        {combatLog.slice(-5).map((entry, i) => (
                            <Typography
                                key={i}
                                variant="caption"
                                className={cn(
                                    'block',
                                    entry.type === 'attack' && 'text-error',
                                    entry.type === 'move' && 'text-info',
                                    entry.type === 'state_change' && 'text-primary',
                                    entry.type === 'defeat' && 'text-[var(--tw-faction-resonator)]',
                                )}
                            >
                                [{entry.turn}] {entry.message}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Trait panel sidebar */}
            {showTraitPanel && (
                <Box className="w-64 flex flex-col gap-4">
                    {/* Selected unit info */}
                    {selectedUnit && (
                        <Box className="bg-card p-3 rounded-lg">
                            <Typography variant="body2" className="text-foreground font-bold mb-2">
                                Selected Unit
                            </Typography>
                            <GameUnitComponent
                                name={selectedUnit.name}
                                characterType={selectedUnit.characterType}
                                team={selectedUnit.team}
                                state={selectedUnit.traits[0]?.currentState as TraitState || 'idle'}
                                health={selectedUnit.health}
                                maxHealth={selectedUnit.maxHealth}
                                variant="compact"
                            />
                        </Box>
                    )}

                    {/* Selected unit's trait */}
                    {selectedTrait && (
                        <TraitStateViewer
                            trait={selectedTrait}
                            size="sm"
                            onStateClick={(state) => setHoveredTransition(state)}
                        />
                    )}

                    {/* Hovered unit preview */}
                    {hoveredUnit && hoveredUnit.id !== selectedUnit?.id && (
                        <Box className="bg-card/80 p-3 rounded-lg border border-border">
                            <Typography variant="caption" className="text-muted-foreground mb-2 block">
                                Hover Preview
                            </Typography>
                            <GameUnitComponent
                                name={hoveredUnit.name}
                                characterType={hoveredUnit.characterType}
                                team={hoveredUnit.team}
                                state={hoveredUnit.traits[0]?.currentState as TraitState || 'idle'}
                                health={hoveredUnit.health}
                                maxHealth={hoveredUnit.maxHealth}
                                variant="compact"
                            />
                            {hoveredTrait && (
                                <Box className="mt-2">
                                    <TraitStateViewer
                                        trait={hoveredTrait}
                                        size="sm"
                                        showTransitions={false}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Help text when nothing selected */}
                    {!selectedUnit && !hoveredUnit && (
                        <Box className="bg-card p-3 rounded-lg text-center">
                            <Typography variant="caption" className="text-muted-foreground">
                                Click a unit to see its traits
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default GameBoardWithTraits;
