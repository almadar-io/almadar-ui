/**
 * HexTraitWarsGame Template
 *
 * A complete, fully-featured hex-based game template using high-fidelity assets:
 * - HexGameBoard: Isometric hex grid with Hexagon Pack terrain tiles
 * - PixelCharacterSprite: 24x24 Pixel Platformer character sprites
 * - Trait visibility, combat system, and phase-based turns
 * 
 * This template demonstrates the integration of all Trait Wars components
 * in a cohesive, interactive game experience.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';
import { Button } from '../../../components/atoms/Button';
import { Badge } from '../../../components/atoms/Badge';
import { Card } from '../../../components/atoms/Card';
import { HexGameBoard, HexBoardTile } from '../organisms/HexGameBoard';
import { HexUnit } from '../organisms/HexGameTile';
import { HexTileType } from '../atoms/HexTileSprite';
import { DamagePopup } from '../atoms/DamagePopup';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { cn } from '../../../lib/cn';

// ============================================================================
// TYPES
// ============================================================================

export type GamePhase = 'observation' | 'selection' | 'movement' | 'action' | 'enemy_turn' | 'game_over';

export interface HexGameUnit extends HexUnit {
    position: { x: number; y: number };
    movement: number;
    attack: number;
    defense: number;
    traits: {
        name: string;
        currentState: string;
        states: string[];
        cooldown: number;
    }[];
}

export interface DamagePopupData {
    id: string;
    amount: number;
    x: number;
    y: number;
    type: 'physical' | 'magic' | 'heal' | 'critical';
}

export interface LogEntry {
    id: string;
    turn: number;
    type: 'attack' | 'move' | 'phase' | 'defeat' | 'heal';
    message: string;
}

export interface HexTraitWarsGameProps {
    /** Initial units for the game */
    initialUnits: HexGameUnit[];
    /** Map terrain configuration */
    mapTerrain?: HexBoardTile[];
    /** Board width in hex cells */
    boardWidth?: number;
    /** Board height in hex cells */
    boardHeight?: number;
    /** Hex scale (default 0.5) */
    hexScale?: number;
    /** Game end callback */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// TRAIT UTILITIES
// ============================================================================

const TRAIT_TRANSITIONS: Record<string, { from: string; to: string; event: string }[]> = {
    'Berserker': [
        { from: 'idle', to: 'defending', event: 'DEFEND' },
        { from: 'idle', to: 'attacking', event: 'ATTACK' },
        { from: 'attacking', to: 'enraged', event: 'KILL' },
        { from: 'enraged', to: 'exhausted', event: 'END_TURN' },
        { from: 'exhausted', to: 'idle', event: 'RECOVER' },
        { from: 'defending', to: 'idle', event: 'END_TURN' },
    ],
    'Spellweaver': [
        { from: 'preparing', to: 'casting', event: 'CAST' },
        { from: 'casting', to: 'recovering', event: 'END_TURN' },
        { from: 'recovering', to: 'preparing', event: 'RECOVER' },
    ],
    'Guardian': [
        { from: 'ready', to: 'shielding', event: 'SHIELD' },
        { from: 'shielding', to: 'ready', event: 'END_TURN' },
    ],
};

function triggerTraitEvent(unit: HexGameUnit, event: string): HexGameUnit {
    const trait = unit.traits[0];
    if (!trait) return unit;

    const transitions = TRAIT_TRANSITIONS[trait.name] || [];
    const transition = transitions.find(t => t.from === trait.currentState && t.event === event);

    if (transition) {
        return {
            ...unit,
            traits: [{
                ...trait,
                currentState: transition.to,
            }],
        };
    }
    return unit;
}

// ============================================================================
// MAP GENERATION
// ============================================================================

function generateHexMap(width: number, height: number): HexBoardTile[] {
    const tiles: HexBoardTile[] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Create varied terrain with some patterns
            let terrain: HexTileType = 'grassPlain';

            // Mountains along edges
            if ((x === 0 || x === width - 1) && Math.random() > 0.5) {
                terrain = 'stonePlain';
            }
            // Forests in random spots
            else if (Math.random() > 0.8) {
                terrain = 'grassTrees';
            }
            // Rocks occasionally
            else if (Math.random() > 0.9) {
                terrain = 'grassRocks';
            }
            // Dirt paths
            else if (y === Math.floor(height / 2) && x > 1 && x < width - 2) {
                terrain = 'dirtPlain';
            }

            tiles.push({ x, y, terrain });
        }
    }
    return tiles;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HexTraitWarsGame({
    initialUnits,
    mapTerrain,
    boardWidth = 8,
    boardHeight = 6,
    hexScale = 0.55,
    onGameEnd,
    className,
}: HexTraitWarsGameProps): JSX.Element {
    // Game state
    const [units, setUnits] = useState<HexGameUnit[]>(initialUnits);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [currentPhase, setCurrentPhase] = useState<GamePhase>('observation');
    const [currentTurn, setCurrentTurn] = useState(1);
    const [combatLog, setCombatLog] = useState<LogEntry[]>([]);
    const [damagePopups, setDamagePopups] = useState<DamagePopupData[]>([]);
    const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

    // Generate map if not provided
    const tiles = useMemo(
        () => mapTerrain || generateHexMap(boardWidth, boardHeight),
        [mapTerrain, boardWidth, boardHeight]
    );

    // Derived state
    const selectedUnit = useMemo(
        () => units.find(u => u.id === selectedUnitId) || null,
        [units, selectedUnitId]
    );

    const playerUnits = useMemo(() => units.filter(u => u.team === 'player' && u.health > 0), [units]);
    const enemyUnits = useMemo(() => units.filter(u => u.team === 'enemy' && u.health > 0), [units]);

    // Calculate valid moves for selected unit
    const validMoves = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'movement') return [];

        const moves: Array<{ x: number; y: number }> = [];
        const range = selectedUnit.movement;

        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = selectedUnit.position.x + dx;
                const ny = selectedUnit.position.y + dy;
                const distance = Math.abs(dx) + Math.abs(dy);

                if (distance > 0 && distance <= range &&
                    nx >= 0 && nx < boardWidth && ny >= 0 && ny < boardHeight) {
                    // Check if tile is empty
                    if (!units.some(u => u.position.x === nx && u.position.y === ny && u.health > 0)) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        }
        return moves;
    }, [selectedUnit, currentPhase, units, boardWidth, boardHeight]);

    // Calculate attack targets
    const attackTargets = useMemo(() => {
        if (!selectedUnit || currentPhase !== 'action') return [];

        return units
            .filter(u => u.team !== selectedUnit.team && u.health > 0)
            .filter(u => {
                const dx = Math.abs(u.position.x - selectedUnit.position.x);
                const dy = Math.abs(u.position.y - selectedUnit.position.y);
                return dx <= 1 && dy <= 1 && (dx + dy) > 0;
            })
            .map(u => u.position);
    }, [selectedUnit, currentPhase, units]);

    // Add combat log entry
    const addLog = useCallback((type: LogEntry['type'], message: string) => {
        setCombatLog(prev => [{
            id: `log-${Date.now()}`,
            turn: currentTurn,
            type,
            message,
        }, ...prev].slice(0, 50));
    }, [currentTurn]);

    // Show damage popup
    const showDamage = useCallback((x: number, y: number, amount: number, type: DamagePopupData['type']) => {
        const id = `dmg-${Date.now()}-${Math.random()}`;
        setDamagePopups(prev => [...prev, { id, x, y, amount, type }]);
        setTimeout(() => {
            setDamagePopups(prev => prev.filter(p => p.id !== id));
        }, 1500);
    }, []);

    // Check game end
    const checkGameEnd = useCallback(() => {
        const playerAlive = units.filter(u => u.team === 'player' && u.health > 0);
        const enemyAlive = units.filter(u => u.team === 'enemy' && u.health > 0);

        if (playerAlive.length === 0) {
            setGameResult('defeat');
            setCurrentPhase('game_over');
            onGameEnd?.('defeat');
            addLog('defeat', '💀 All units defeated. Game Over!');
        } else if (enemyAlive.length === 0) {
            setGameResult('victory');
            setCurrentPhase('game_over');
            onGameEnd?.('victory');
            addLog('phase', '🏆 Victory! All enemies defeated!');
        }
    }, [units, onGameEnd, addLog]);

    // Handle unit click
    const handleUnitClick = useCallback((unitId: string) => {
        const unit = units.find(u => u.id === unitId);
        if (!unit) return;

        if (currentPhase === 'observation' || currentPhase === 'selection') {
            if (unit.team === 'player') {
                setSelectedUnitId(unitId);
                setCurrentPhase('movement');
                addLog('phase', `Selected ${unit.name}`);
            }
        } else if (currentPhase === 'action' && selectedUnit) {
            // Attack enemy
            if (unit.team === 'enemy' && attackTargets.some(t => t.x === unit.position.x && t.y === unit.position.y)) {
                const damage = Math.max(1, selectedUnit.attack - unit.defense);
                const newHealth = Math.max(0, unit.health - damage);

                setUnits(prev => prev.map(u =>
                    u.id === unit.id ? { ...u, health: newHealth, state: newHealth > 0 ? 'wounded' : 'idle' } : u
                ));

                showDamage(unit.position.x, unit.position.y, damage, 'physical');
                addLog('attack', `${selectedUnit.name} attacks ${unit.name} for ${damage} damage!`);

                // Trigger trait events
                if (newHealth === 0) {
                    addLog('defeat', `${unit.name} has been defeated!`);
                    const updatedAttacker = triggerTraitEvent(selectedUnit, 'KILL');
                    setUnits(prev => prev.map(u => u.id === updatedAttacker.id ? updatedAttacker : u));
                }

                // End action phase
                const endTurnUnit = triggerTraitEvent(selectedUnit, 'END_TURN');
                setUnits(prev => prev.map(u => u.id === endTurnUnit.id ? endTurnUnit : u));
                setSelectedUnitId(null);
                setCurrentPhase('observation');
                setCurrentTurn(t => t + 1);

                setTimeout(checkGameEnd, 100);
            }
        }
    }, [currentPhase, selectedUnit, attackTargets, units, addLog, showDamage, checkGameEnd]);

    // Handle tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        if (currentPhase === 'movement' && selectedUnit) {
            if (validMoves.some(m => m.x === x && m.y === y)) {
                // Move unit
                setUnits(prev => prev.map(u =>
                    u.id === selectedUnitId ? { ...u, position: { x, y } } : u
                ));
                addLog('move', `${selectedUnit.name} moves to (${x}, ${y})`);
                setCurrentPhase('action');
            }
        }
    }, [currentPhase, selectedUnit, selectedUnitId, validMoves, addLog]);

    // End turn without action
    const handleEndTurn = useCallback(() => {
        if (selectedUnit) {
            const updatedUnit = triggerTraitEvent(selectedUnit, 'END_TURN');
            setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
        }
        setSelectedUnitId(null);
        setCurrentPhase('observation');
        setCurrentTurn(t => t + 1);
        addLog('phase', 'Turn ended');
    }, [selectedUnit, addLog]);

    // Cancel selection
    const handleCancel = useCallback(() => {
        setSelectedUnitId(null);
        setCurrentPhase('observation');
    }, []);

    // Phase display text
    const phaseText = {
        observation: '👁️ Observation Phase - Select a unit',
        selection: '🎯 Selection Phase - Choose your unit',
        movement: '🚶 Movement Phase - Click a green tile to move',
        action: '⚔️ Action Phase - Attack an adjacent enemy or end turn',
        enemy_turn: '👹 Enemy Turn',
        game_over: gameResult === 'victory' ? '🏆 Victory!' : '💀 Defeat',
    };

    // Log type icons
    const logIcons: Record<LogEntry['type'], string> = {
        attack: '⚔️',
        move: '🚶',
        phase: '📍',
        defeat: '💀',
        heal: '💚',
    };

    return (
        <Box className={cn('flex flex-col gap-4 p-4 bg-gray-900 rounded-xl', className)}>
            {/* Header */}
            <Box display="flex" className="justify-between items-center">
                <Box>
                    <Typography variant="h5" className="text-white font-bold">
                        ⚔️ Trait Wars: Hex Battle
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        Turn {currentTurn} • {phaseText[currentPhase]}
                    </Typography>
                </Box>
                <Box display="flex" className="gap-4">
                    <Box className="text-center">
                        <Typography variant="caption" className="text-blue-400">Player</Typography>
                        <Typography variant="h6" className="text-white">{playerUnits.length}</Typography>
                    </Box>
                    <Box className="text-center">
                        <Typography variant="caption" className="text-red-400">Enemy</Typography>
                        <Typography variant="h6" className="text-white">{enemyUnits.length}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main game area */}
            <Box display="flex" className="gap-4">
                {/* Game board */}
                <Box className="flex-1 relative">
                    {/* Attack hint banner */}
                    {currentPhase === 'action' && attackTargets.length > 0 && (
                        <Box className="absolute -top-2 left-0 right-0 z-30 flex justify-center pointer-events-none">
                            <Box className="bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse flex items-center gap-2">
                                <span className="text-lg">⚔️</span>
                                <Typography variant="body2" className="font-bold text-white">
                                    Click an enemy with ⚔️ to attack!
                                </Typography>
                                <span className="text-lg">⚔️</span>
                            </Box>
                        </Box>
                    )}

                    {/* No targets warning */}
                    {currentPhase === 'action' && attackTargets.length === 0 && (
                        <Box className="absolute -top-2 left-0 right-0 z-30 flex justify-center pointer-events-none">
                            <Box className="bg-gray-600/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                <span className="text-lg">ℹ️</span>
                                <Typography variant="body2" className="text-white">
                                    No enemies in range. Click "End Turn" to skip.
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <HexGameBoard
                        tiles={tiles}
                        units={units}
                        selectedUnitId={selectedUnitId}
                        validMoves={validMoves}
                        attackTargets={attackTargets}
                        onUnitClick={handleUnitClick}
                        onTileClick={handleTileClick}
                        scale={hexScale}
                        showCoordinates={false}
                    />

                    {/* Damage popups */}
                    {damagePopups.map(popup => (
                        <DamagePopup
                            key={popup.id}
                            amount={popup.amount}
                            type={popup.type}
                            x={popup.x * 90 + 45}
                            y={popup.y * 78 + 35}
                        />
                    ))}
                </Box>

                {/* Side panel */}
                <Box className="w-72 flex flex-col gap-4">
                    {/* Selected unit info */}
                    {selectedUnit && (
                        <Card variant="default" className="p-3">
                            <Box display="flex" className="items-center justify-between mb-2">
                                <Typography variant="body2" className="font-bold">
                                    {selectedUnit.name}
                                </Typography>
                                <Badge variant={selectedUnit.team === 'player' ? 'primary' : 'danger'} size="sm">
                                    {selectedUnit.team}
                                </Badge>
                            </Box>

                            {/* Stats */}
                            <Box display="flex" className="gap-3 mb-3 text-sm">
                                <Box>
                                    <Typography variant="caption" className="text-gray-400">❤️ HP</Typography>
                                    <Typography variant="body2">{selectedUnit.health}/{selectedUnit.maxHealth}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-gray-400">⚔️ ATK</Typography>
                                    <Typography variant="body2">{selectedUnit.attack}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-gray-400">🛡️ DEF</Typography>
                                    <Typography variant="body2">{selectedUnit.defense}</Typography>
                                </Box>
                            </Box>

                            {/* Trait */}
                            {selectedUnit.traits[0] && (
                                <Box className="bg-gray-700/50 rounded p-2">
                                    <Typography variant="caption" className="text-gray-400 block mb-1">
                                        Trait: {selectedUnit.traits[0].name}
                                    </Typography>
                                    <Box display="flex" className="items-center gap-2">
                                        <StateIndicator
                                            state={selectedUnit.traits[0].currentState as TraitState}
                                            size="sm"
                                        />
                                        <Typography variant="caption" className="text-gray-300">
                                            {selectedUnit.traits[0].currentState}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Card>
                    )}

                    {/* Action buttons */}
                    {(currentPhase === 'movement' || currentPhase === 'action') && (
                        <Box display="flex" className="gap-2">
                            {currentPhase === 'action' && (
                                <Button
                                    variant="primary"
                                    onClick={handleEndTurn}
                                    className="flex-1"
                                >
                                    End Turn
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}

                    {/* Combat log */}
                    <Card variant="default" className="flex-1 flex flex-col">
                        <Box padding="sm" className="border-b border-gray-700">
                            <Typography variant="body2" className="font-bold">
                                📜 Combat Log
                            </Typography>
                        </Box>
                        <Box className="flex-1 overflow-auto max-h-64 p-2">
                            {combatLog.length === 0 ? (
                                <Typography variant="caption" className="text-gray-500 italic">
                                    No events yet...
                                </Typography>
                            ) : (
                                <Box className="space-y-1">
                                    {combatLog.map(entry => (
                                        <Box key={entry.id} className="text-sm">
                                            <Typography variant="caption" className="text-gray-400">
                                                {logIcons[entry.type]} {entry.message}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Card>
                </Box>
            </Box>

            {/* Legend */}
            <Box display="flex" className="gap-6 justify-center">
                <Box display="flex" className="items-center gap-2">
                    <Box className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300" />
                    <Typography variant="caption" className="text-gray-400">Player Unit</Typography>
                </Box>
                <Box display="flex" className="items-center gap-2">
                    <Box className="w-3 h-3 rounded-full bg-red-500 border border-red-300" />
                    <Typography variant="caption" className="text-gray-400">Enemy Unit</Typography>
                </Box>
                <Box display="flex" className="items-center gap-2">
                    <Box className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200" />
                    <Typography variant="caption" className="text-gray-400">Selected</Typography>
                </Box>
                <Box display="flex" className="items-center gap-2">
                    <Box className="w-3 h-3 rounded-full bg-green-400 border border-green-200" />
                    <Typography variant="caption" className="text-gray-400">Valid Move</Typography>
                </Box>
                <Box display="flex" className="items-center gap-2">
                    <Box className="w-3 h-3 rounded-full bg-red-400 border border-red-200" />
                    <Typography variant="caption" className="text-gray-400">Attack Target</Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default HexTraitWarsGame;
