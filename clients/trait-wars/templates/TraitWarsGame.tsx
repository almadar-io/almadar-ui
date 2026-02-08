/**
 * TraitWarsGame Template
 * 
 * A complete, fully-featured game template that demonstrates ALL components
 * from the Trait Wars design system working together:
 * 
 * - Trait Visibility: See opponent's state machines
 * - Turn Phases: Observation → Planning → Execution → Tick
 * - Counter-Play: Strategic positioning based on trait states
 * - Combat Effects: Damage popups, guard display, animations
 * - Full UI: Menu, game board, trait panel, combat log
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    cn,
} from '@almadar/ui';
import { GameTile, TileUnit } from '../organisms/GameTile';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { TraitStateViewer, TraitDefinition } from '../molecules/TraitStateViewer';
import { GameUnit as GameUnitComponent } from '../molecules/GameUnit';
import { GuardDisplay } from '../atoms/GuardDisplay';
import { DamagePopup } from '../atoms/DamagePopup';
import {
    GameState,
    Position,
    GameUnit,
    calculateValidMoves,
    calculateAttackTargets,
    createInitialGameState,
} from '../types/game';

// ============================================================================
// TYPES
// ============================================================================

export interface CombatLogEntry {
    id: string;
    turn: number;
    phase: GamePhase;
    message: string;
    type: 'attack' | 'move' | 'state_change' | 'defeat' | 'phase' | 'heal' | 'guard';
}

export type GamePhase = 'observation' | 'planning' | 'execution' | 'tick';

export interface DamagePopupData {
    id: string;
    amount: number;
    x: number;
    y: number;
    type: 'physical' | 'magic' | 'heal' | 'critical';
}

export interface TraitWarsGameProps {
    /** Initial units for the game */
    initialUnits: GameUnit[];
    /** Board dimensions */
    boardWidth?: number;
    boardHeight?: number;
    /** Tile size */
    tileSize?: number;
    /** Show tutorial hints */
    showTutorial?: boolean;
    /** Called when game ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// TRAIT UTILITIES
// ============================================================================

const TRAIT_TRANSITIONS: Record<string, { from: string; to: string; event: string; guardHint?: string }[]> = {
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

function unitTraitToDefinition(unit: GameUnit): TraitDefinition | null {
    if (!unit.traits.length) return null;
    const trait = unit.traits[0];
    return {
        name: trait.name,
        description: `${unit.name}'s behavior pattern`,
        states: trait.states,
        currentState: trait.currentState,
        transitions: TRAIT_TRANSITIONS[trait.name] || [],
    };
}

function triggerTraitEvent(unit: GameUnit, event: string): { unit: GameUnit; changed: boolean } {
    if (!unit.traits.length) return { unit, changed: false };
    const trait = unit.traits[0];
    const transitions = TRAIT_TRANSITIONS[trait.name] || [];
    const validTransition = transitions.find(t => t.from === trait.currentState && t.event === event);

    if (validTransition) {
        return {
            unit: {
                ...unit,
                traits: [{ ...trait, currentState: validTransition.to }],
            },
            changed: true,
        };
    }
    return { unit, changed: false };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TraitWarsGame({
    initialUnits,
    boardWidth = 8,
    boardHeight = 6,
    tileSize = 48,
    showTutorial = true,
    onGameEnd,
    className,
}: TraitWarsGameProps): JSX.Element {
    // Game state
    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialGameState(boardWidth, boardHeight, initialUnits)
    );
    const [currentPhase, setCurrentPhase] = useState<GamePhase>('observation');
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
    const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
    const [hoveredPos, setHoveredPos] = useState<Position | null>(null);
    const [preservedHoveredUnit, setPreservedHoveredUnit] = useState<GameUnit | null>(null);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Debounced hover handler to prevent flicker
    const handleHoverEnter = useCallback((pos: Position) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setHoveredPos(pos);
    }, []);

    const handleHoverLeave = useCallback(() => {
        // Delay clearing hover to prevent flicker
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredPos(null);
        }, 150);
    }, []);

    // Derived state
    const selectedUnit = gameState.selectedUnitId ? gameState.units[gameState.selectedUnitId] : null;
    const selectedTrait = selectedUnit ? unitTraitToDefinition(selectedUnit) : null;
    const hoveredUnit = useMemo(() => {
        if (!hoveredPos) return null;
        const tile = gameState.board[hoveredPos.y]?.[hoveredPos.x];
        return tile?.unitId ? gameState.units[tile.unitId] : null;
    }, [hoveredPos, gameState]);

    // Preserve hovered unit for smooth display
    useEffect(() => {
        if (hoveredUnit) {
            setPreservedHoveredUnit(hoveredUnit);
        }
    }, [hoveredUnit]);

    // Use preserved unit if current hover is null (prevents flicker)
    const displayedHoveredUnit = hoveredUnit || (hoveredPos === null ? null : preservedHoveredUnit);
    const hoveredTrait = displayedHoveredUnit ? unitTraitToDefinition(displayedHoveredUnit) : null;

    const playerUnits = Object.values(gameState.units).filter(u => u.team === 'player');
    const enemyUnits = Object.values(gameState.units).filter(u => u.team === 'enemy');
    const isVictory = enemyUnits.length === 0 && playerUnits.length > 0;
    const isDefeat = playerUnits.length === 0;

    // Logging
    const addLog = useCallback((message: string, type: CombatLogEntry['type']) => {
        setCombatLog(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            turn: gameState.currentTurn,
            phase: currentPhase,
            message,
            type,
        }]);
    }, [gameState.currentTurn, currentPhase]);

    // Damage popup
    const showDamage = useCallback((amount: number, x: number, y: number, type: DamagePopupData['type']) => {
        const id = `${Date.now()}-${Math.random()}`;
        setDamagePopups(prev => [...prev, { id, amount, x: x * tileSize + tileSize / 2, y: y * tileSize, type }]);
        setTimeout(() => {
            setDamagePopups(prev => prev.filter(p => p.id !== id));
        }, 1000);
    }, [tileSize]);

    // Phase transitions
    const advancePhase = useCallback(() => {
        const phases: GamePhase[] = ['observation', 'planning', 'execution', 'tick'];
        const currentIndex = phases.indexOf(currentPhase);
        const nextPhase = phases[(currentIndex + 1) % phases.length];

        setCurrentPhase(nextPhase);
        addLog(`Phase: ${nextPhase.toUpperCase()}`, 'phase');

        if (nextPhase === 'observation') {
            // New turn
            setGameState(prev => ({ ...prev, currentTurn: prev.currentTurn + 1 }));
        }

        if (nextPhase === 'tick') {
            // Process TICK events on all units
            setGameState(prev => {
                const newUnits = { ...prev.units };
                Object.keys(newUnits).forEach(id => {
                    const { unit, changed } = triggerTraitEvent(newUnits[id], 'TICK');
                    if (changed) {
                        newUnits[id] = unit;
                        addLog(`${unit.name}'s trait ticks → ${unit.traits[0]?.currentState}`, 'state_change');
                    }
                });
                return { ...prev, units: newUnits };
            });
        }
    }, [currentPhase, addLog]);

    // Tile click handler
    const handleTileClick = useCallback((x: number, y: number) => {
        if (currentPhase !== 'planning' && currentPhase !== 'execution') {
            addLog('Wait for your turn to act!', 'phase');
            return;
        }

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

                addLog(`${selectedUnit.name} moves to (${x}, ${y})`, 'move');
                setGameState(prev => ({
                    ...prev,
                    board: newBoard,
                    units: newUnits,
                    selectedUnitId: undefined,
                    validMoves: [],
                    attackTargets: [],
                }));
                return;
            }

            // Attack
            const isAttackTarget = gameState.attackTargets.some(t => t.x === x && t.y === y);
            if (isAttackTarget && tile.unitId) {
                const targetUnit = gameState.units[tile.unitId];
                if (targetUnit) {
                    const isCritical = Math.random() < 0.15;
                    const baseDamage = Math.max(1, selectedUnit.attack - targetUnit.defense);
                    const damage = isCritical ? baseDamage * 2 : baseDamage;
                    const newHealth = targetUnit.health - damage;

                    const newUnits = { ...gameState.units };

                    // Trigger ATTACK on attacker
                    const { unit: attackerAfter, changed: attackerChanged } = triggerTraitEvent(selectedUnit, 'ATTACK');
                    newUnits[selectedUnit.id] = attackerAfter;

                    if (attackerChanged) {
                        addLog(`${selectedUnit.name}'s ${selectedUnit.traits[0]?.name} → ${attackerAfter.traits[0]?.currentState}`, 'state_change');
                    }

                    showDamage(damage, x, y, isCritical ? 'critical' : 'physical');
                    addLog(`${selectedUnit.name} ${isCritical ? 'CRITS' : 'attacks'} ${targetUnit.name} for ${damage}!`, 'attack');

                    if (newHealth <= 0) {
                        delete newUnits[tile.unitId];
                        const newBoard = gameState.board.map(row => row.map(t => ({ ...t })));
                        newBoard[y][x].unitId = undefined;
                        addLog(`💀 ${targetUnit.name} defeated!`, 'defeat');
                        setGameState(prev => ({
                            ...prev,
                            board: newBoard,
                            units: newUnits,
                            selectedUnitId: undefined,
                            validMoves: [],
                            attackTargets: [],
                        }));
                    } else {
                        // Trigger TAKE_DAMAGE on target
                        const { unit: targetAfter, changed: targetChanged } = triggerTraitEvent(
                            { ...targetUnit, health: newHealth },
                            'TAKE_DAMAGE'
                        );
                        newUnits[tile.unitId] = targetAfter;

                        if (targetChanged) {
                            addLog(`${targetUnit.name}'s ${targetUnit.traits[0]?.name} → ${targetAfter.traits[0]?.currentState}`, 'state_change');
                        }

                        setGameState(prev => ({
                            ...prev,
                            units: newUnits,
                            selectedUnitId: undefined,
                            validMoves: [],
                            attackTargets: [],
                        }));
                    }
                }
                return;
            }
        }

        // Select unit
        if (tile.unitId) {
            const unit = gameState.units[tile.unitId];
            if (unit && unit.team === gameState.activeTeam) {
                setGameState(prev => ({
                    ...prev,
                    selectedUnitId: tile.unitId,
                    validMoves: calculateValidMoves(prev, tile.unitId!),
                    attackTargets: calculateAttackTargets(prev, tile.unitId!),
                }));
                return;
            }
        }

        // Deselect
        setGameState(prev => ({
            ...prev,
            selectedUnitId: undefined,
            validMoves: [],
            attackTargets: [],
        }));
    }, [gameState, currentPhase, addLog, showDamage]);

    // Check game end
    useEffect(() => {
        if (isVictory) onGameEnd?.('victory');
        if (isDefeat) onGameEnd?.('defeat');
    }, [isVictory, isDefeat, onGameEnd]);

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <Box className={cn('flex gap-4 p-4 bg-gray-950 min-h-screen', className)}>
            {/* LEFT SIDEBAR - Unit List & Trait Info */}
            <Box className="w-72 flex flex-col gap-4">
                {/* Phase indicator */}
                <Box className="bg-gray-800 rounded-lg p-4">
                    <Typography variant="caption" className="text-gray-400 block mb-2">Current Phase</Typography>
                    <Box display="flex" className="gap-1">
                        {(['observation', 'planning', 'execution', 'tick'] as GamePhase[]).map(phase => (
                            <Box
                                key={phase}
                                className={cn(
                                    'flex-1 text-center py-2 rounded text-xs font-medium transition-all',
                                    currentPhase === phase
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-gray-700 text-gray-400'
                                )}
                            >
                                {phase.charAt(0).toUpperCase()}
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="caption" className="text-center block mt-2 text-white">
                        {currentPhase === 'observation' && '👁️ Study enemy traits'}
                        {currentPhase === 'planning' && '🎯 Select your actions'}
                        {currentPhase === 'execution' && '⚔️ Actions resolve'}
                        {currentPhase === 'tick' && '⏰ Cooldowns process'}
                    </Typography>
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-3"
                        onClick={advancePhase}
                    >
                        Next Phase →
                    </Button>
                </Box>

                {/* Selected unit */}
                {selectedUnit && (
                    <Box className="bg-gray-800 rounded-lg p-4">
                        <Typography variant="caption" className="text-gray-400 block mb-2">Selected Unit</Typography>
                        <GameUnitComponent
                            name={selectedUnit.name}
                            characterType={selectedUnit.characterType}
                            team={selectedUnit.team}
                            state={selectedUnit.traits[0]?.currentState as TraitState || 'idle'}
                            health={selectedUnit.health}
                            maxHealth={selectedUnit.maxHealth}
                            variant="card"
                        />
                        <Box display="flex" className="items-center gap-2 mt-2">
                            <GuardDisplay
                                defense={selectedUnit.defense}
                                isGuarding={selectedUnit.traits[0]?.currentState === 'defending'}
                                size="sm"
                            />
                            <Typography variant="caption" className="text-gray-400">
                                ATK: {selectedUnit.attack}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Trait state machine */}
                {selectedTrait && (
                    <TraitStateViewer trait={selectedTrait} size="sm" />
                )}

                {/* Hover preview - shows full state machine for enemies */}
                {displayedHoveredUnit && displayedHoveredUnit.id !== selectedUnit?.id && (
                    <Box className={cn(
                        'rounded-lg p-3 border transition-opacity duration-150',
                        displayedHoveredUnit.team === 'enemy'
                            ? 'bg-red-900/30 border-red-500/50'
                            : 'bg-blue-900/30 border-blue-500/50'
                    )}>
                        <Typography variant="caption" className={cn(
                            'block mb-2 font-bold',
                            displayedHoveredUnit.team === 'enemy' ? 'text-red-400' : 'text-blue-400'
                        )}>
                            {displayedHoveredUnit.team === 'enemy' ? '👁️ STUDYING ENEMY' : '👥 Ally'}
                        </Typography>
                        <GameUnitComponent
                            name={displayedHoveredUnit.name}
                            characterType={displayedHoveredUnit.characterType}
                            team={displayedHoveredUnit.team}
                            state={displayedHoveredUnit.traits[0]?.currentState as TraitState || 'idle'}
                            health={displayedHoveredUnit.health}
                            maxHealth={displayedHoveredUnit.maxHealth}
                            variant="compact"
                        />
                        {/* Show full state machine for prediction */}
                        {hoveredTrait && (
                            <Box className="mt-3">
                                <Typography variant="caption" className="text-yellow-400 font-bold block mb-1">
                                    📊 State Machine Preview
                                </Typography>
                                <TraitStateViewer trait={hoveredTrait} size="sm" />
                                {/* Show prediction hints */}
                                <Box className="mt-2 p-2 bg-black/30 rounded text-xs">
                                    <Typography variant="caption" className="text-gray-300 block">
                                        🔮 <strong>Current:</strong> {hoveredTrait.currentState}
                                    </Typography>
                                    {hoveredTrait.transitions
                                        .filter(t => t.from === hoveredTrait.currentState)
                                        .map((t, i) => (
                                            <Typography key={i} variant="caption" className="text-gray-400 block">
                                                → <span className="text-cyan-400">{t.event}</span> leads to <span className="text-green-400">{t.to}</span>
                                                {t.guardHint && <span className="text-yellow-500"> (if {t.guardHint})</span>}
                                            </Typography>
                                        ))
                                    }
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Tutorial hints */}
                {showTutorial && (
                    <Box className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                        <Typography variant="caption" className="text-blue-300 font-bold block mb-1">
                            💡 Strategy Tips
                        </Typography>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• <span className="text-yellow-400">Watch traits</span> - States are predictable!</li>
                            <li>• <span className="text-red-400">Enraged</span> units deal more damage</li>
                            <li>• <span className="text-blue-400">Defending</span> doubles defense</li>
                            <li>• Attack when enemies are <span className="text-purple-400">exhausted</span></li>
                        </ul>
                    </Box>
                )}
            </Box>

            {/* CENTER - Game Board */}
            <Box className="flex-1 flex flex-col gap-4">
                {/* Turn header */}
                <Box display="flex" className="items-center justify-between bg-gray-800 p-3 rounded-lg">
                    <Typography variant="h6" className="text-white">
                        Turn {gameState.currentTurn}
                    </Typography>
                    <StateIndicator
                        state={currentPhase === 'execution' ? 'attacking' : 'active'}
                        label={currentPhase.toUpperCase()}
                    />
                    <Box display="flex" className="items-center gap-2">
                        <Box className={cn(
                            'w-4 h-4 rounded-full',
                            gameState.activeTeam === 'player' ? 'bg-blue-500' : 'bg-red-500'
                        )} />
                        <Typography variant="body2" className="text-white">
                            {gameState.activeTeam === 'player' ? 'Your' : 'Enemy'} Turn
                        </Typography>
                    </Box>
                </Box>

                {/* Game grid with damage popups */}
                <Box className="relative">
                    <Box
                        display="grid"
                        className="gap-0.5 bg-gray-900 p-2 rounded-lg"
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
                                        onMouseEnter={() => handleHoverEnter({ x, y })}
                                        onMouseLeave={handleHoverLeave}
                                    />
                                );
                            })
                        )}
                    </Box>

                    {/* Damage popups overlay */}
                    {damagePopups.map(popup => (
                        <DamagePopup
                            key={popup.id}
                            amount={popup.amount}
                            x={popup.x + 100} // Offset for sidebar
                            y={popup.y + 100}
                            damageType={popup.type}
                        />
                    ))}
                </Box>

                {/* Unit status bar */}
                <Box display="flex" className="gap-4">
                    <Box className="flex-1 bg-blue-900/30 p-3 rounded-lg">
                        <Typography variant="caption" className="text-blue-400 block mb-1">Your Army</Typography>
                        <Box display="flex" className="gap-2 flex-wrap">
                            {playerUnits.map(unit => (
                                <Box key={unit.id} className="flex items-center gap-1 bg-blue-900/50 px-2 py-1 rounded">
                                    <Typography variant="caption" className="text-white">{unit.name}</Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        {unit.health}/{unit.maxHealth}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box className="flex-1 bg-red-900/30 p-3 rounded-lg">
                        <Typography variant="caption" className="text-red-400 block mb-1">Enemy Forces</Typography>
                        <Box display="flex" className="gap-2 flex-wrap">
                            {enemyUnits.map(unit => (
                                <Box key={unit.id} className="flex items-center gap-1 bg-red-900/50 px-2 py-1 rounded">
                                    <Typography variant="caption" className="text-white">{unit.name}</Typography>
                                    <Typography variant="caption" className="text-gray-400">
                                        {unit.health}/{unit.maxHealth}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* RIGHT SIDEBAR - Combat Log */}
            <Box className="w-64 flex flex-col gap-4">
                <Box className="bg-gray-800 rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
                    <Typography variant="body2" className="text-white font-bold mb-2">⚔️ Combat Log</Typography>
                    <Box className="flex-1 overflow-y-auto space-y-1">
                        {combatLog.slice(-20).map(entry => (
                            <Box key={entry.id} className="text-xs">
                                <span className="text-gray-500">[T{entry.turn}]</span>{' '}
                                <span className={cn(
                                    entry.type === 'attack' && 'text-red-400',
                                    entry.type === 'move' && 'text-blue-400',
                                    entry.type === 'state_change' && 'text-yellow-400',
                                    entry.type === 'defeat' && 'text-purple-400',
                                    entry.type === 'phase' && 'text-gray-500',
                                    entry.type === 'heal' && 'text-green-400',
                                    entry.type === 'guard' && 'text-cyan-400',
                                )}>
                                    {entry.message}
                                </span>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* All enemy traits */}
                <Box className="bg-gray-800 rounded-lg p-4">
                    <Typography variant="caption" className="text-red-400 block mb-2">Enemy Trait States</Typography>
                    {enemyUnits.map(unit => {
                        const trait = unit.traits[0];
                        return (
                            <Box key={unit.id} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
                                <Typography variant="caption" className="text-white">{unit.name}</Typography>
                                <StateIndicator
                                    state={trait?.currentState as TraitState || 'idle'}
                                    label={trait?.currentState || 'idle'}
                                    size="sm"
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Victory/Defeat overlay */}
            {(isVictory || isDefeat) && (
                <Box className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Box className="text-center bg-gray-800 p-8 rounded-xl">
                        <Typography
                            variant="h2"
                            className={cn(
                                'font-bold mb-4',
                                isVictory ? 'text-green-400' : 'text-red-400'
                            )}
                        >
                            {isVictory ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
                        </Typography>
                        <Typography variant="body1" className="text-gray-400 mb-4">
                            {isVictory
                                ? 'You understood the enemy traits and emerged victorious!'
                                : 'The enemy outmaneuvered you. Study their traits and try again!'
                            }
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default TraitWarsGame;
