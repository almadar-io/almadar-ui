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
import { Box, VStack, HStack } from '@almadar/ui';
import { Typography } from '@almadar/ui';
import { Button } from '@almadar/ui';
import { Badge } from '@almadar/ui';
import { Card } from '@almadar/ui';
import { HexGameBoard, HexBoardTile } from '../organisms/HexGameBoard';
import { HexUnit } from '../organisms/HexGameTile';
import { HexTileType } from '../atoms/HexTileSprite';
import { DamagePopup } from '../atoms/DamagePopup';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { CombatLog, CombatEvent, CombatEventType } from '../organisms/CombatLog';
import { TraitStateViewer, TraitStateMachineDefinition } from '../molecules/TraitStateViewer';
import { cn } from '@almadar/ui';

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

// Map our internal log types to CombatEventType
const logTypeToCombatType: Record<string, CombatEventType> = {
    attack: 'attack',
    move: 'move',
    phase: 'special',
    defeat: 'death',
    heal: 'heal',
};

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
            let terrain: HexTileType = 'plains';

            // Mountains along edges
            if ((x === 0 || x === width - 1) && Math.random() > 0.5) {
                terrain = 'mountain';
            }
            // Forests in random spots
            else if (Math.random() > 0.8) {
                terrain = 'forest';
            }
            // Fortresses occasionally
            else if (Math.random() > 0.9) {
                terrain = 'fortress';
            }
            // Water features
            else if (y === Math.floor(height / 2) && x > 1 && x < width - 2) {
                terrain = 'water';
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
    const [combatLog, setCombatLog] = useState<CombatEvent[]>([]);
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
    const addLog = useCallback((type: 'attack' | 'move' | 'phase' | 'defeat' | 'heal', message: string, value?: number) => {
        const combatType = logTypeToCombatType[type] || 'special';
        setCombatLog(prev => [...prev, {
            id: `log-${Date.now()}`,
            turn: currentTurn,
            type: combatType,
            message,
            timestamp: Date.now(),
            value,
        }].slice(-50));
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

    return (
        <VStack gap="md" className={cn('p-4 bg-gray-900 rounded-xl min-h-[600px]', className)}>
            {/* ==================== HEADER ==================== */}
            <HStack justify="between" align="center" className="w-full px-2">
                {/* Title & Phase */}
                <VStack gap="xs">
                    <Typography variant="h5" className="text-white font-bold">
                        ⚔️ Trait Wars: Hex Battle
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        Turn {currentTurn} • {phaseText[currentPhase]}
                    </Typography>
                </VStack>

                {/* Unit Counters */}
                <HStack gap="lg">
                    <VStack gap="none" align="center">
                        <Typography variant="caption" className="text-blue-400">Player</Typography>
                        <Typography variant="h6" className="text-white">{playerUnits.length}</Typography>
                    </VStack>
                    <VStack gap="none" align="center">
                        <Typography variant="caption" className="text-red-400">Enemy</Typography>
                        <Typography variant="h6" className="text-white">{enemyUnits.length}</Typography>
                    </VStack>
                </HStack>
            </HStack>

            {/* ==================== MAIN CONTENT ==================== */}
            <HStack gap="lg" align="start" flex className="w-full">
                {/* LEFT: Game Board */}
                <VStack gap="sm" flex className="relative">
                    {/* Action Hint Banners */}
                    {currentPhase === 'action' && attackTargets.length > 0 && (
                        <HStack justify="center" className="absolute -top-1 left-0 right-0 z-30 pointer-events-none">
                            <HStack gap="sm" align="center" className="bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                                <span className="text-lg">⚔️</span>
                                <Typography variant="body2" className="font-bold text-white">
                                    Click an enemy to attack!
                                </Typography>
                                <span className="text-lg">⚔️</span>
                            </HStack>
                        </HStack>
                    )}

                    {currentPhase === 'action' && attackTargets.length === 0 && (
                        <HStack justify="center" className="absolute -top-1 left-0 right-0 z-30">
                            <HStack gap="sm" align="center" className="bg-gray-700/95 text-white px-4 py-2 rounded-lg shadow-lg">
                                <span>ℹ️</span>
                                <Typography variant="body2" className="text-white">
                                    No enemies in range.
                                </Typography>
                                <Button variant="primary" size="sm" onClick={handleEndTurn}>
                                    End Turn
                                </Button>
                            </HStack>
                        </HStack>
                    )}

                    {/* Game Board */}
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

                    {/* Damage Popups */}
                    {damagePopups.map(popup => (
                        <DamagePopup
                            key={popup.id}
                            amount={popup.amount}
                            type={popup.type}
                            x={popup.x * 90 + 45}
                            y={popup.y * 78 + 35}
                        />
                    ))}
                </VStack>

                {/* RIGHT: Side Panel */}
                <VStack gap="md" className="w-80 shrink-0">
                    {/* Selected Unit Card */}
                    {selectedUnit ? (
                        <Card variant="default" className="p-4">
                            <HStack justify="between" align="center" className="mb-3">
                                <Typography variant="body1" className="font-bold text-white">
                                    {selectedUnit.name}
                                </Typography>
                                <Badge variant={selectedUnit.team === 'player' ? 'primary' : 'danger'} size="sm">
                                    {selectedUnit.team}
                                </Badge>
                            </HStack>

                            {/* Stats Row */}
                            <HStack gap="md" className="text-sm">
                                <VStack gap="none">
                                    <Typography variant="caption" className="text-gray-400">❤️ HP</Typography>
                                    <Typography variant="body2" className="text-white font-medium">
                                        {selectedUnit.health}/{selectedUnit.maxHealth}
                                    </Typography>
                                </VStack>
                                <VStack gap="none">
                                    <Typography variant="caption" className="text-gray-400">⚔️ ATK</Typography>
                                    <Typography variant="body2" className="text-white font-medium">
                                        {selectedUnit.attack}
                                    </Typography>
                                </VStack>
                                <VStack gap="none">
                                    <Typography variant="caption" className="text-gray-400">🛡️ DEF</Typography>
                                    <Typography variant="body2" className="text-white font-medium">
                                        {selectedUnit.defense}
                                    </Typography>
                                </VStack>
                            </HStack>
                        </Card>
                    ) : (
                        <Card variant="default" className="p-4">
                            <Typography variant="body2" className="text-gray-500 text-center">
                                Select a unit to view details
                            </Typography>
                        </Card>
                    )}

                    {/* Trait State Viewer */}
                    {selectedUnit && selectedUnit.traits[0] && (
                        <TraitStateViewer
                            trait={{
                                name: selectedUnit.traits[0].name,
                                states: selectedUnit.traits[0].states,
                                currentState: selectedUnit.traits[0].currentState,
                                transitions: TRAIT_TRANSITIONS[selectedUnit.traits[0].name] || [],
                                description: `State machine for ${selectedUnit.name}`,
                            }}
                            size="sm"
                            showTransitions={true}
                        />
                    )}

                    {/* Action Buttons */}
                    {(currentPhase === 'movement' || currentPhase === 'action') && (
                        <HStack gap="sm">
                            {currentPhase === 'action' && (
                                <Button variant="primary" onClick={handleEndTurn} className="flex-1">
                                    End Turn
                                </Button>
                            )}
                            <Button variant="secondary" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                        </HStack>
                    )}

                    {/* Combat Log */}
                    <CombatLog
                        events={combatLog}
                        maxVisible={15}
                        autoScroll={true}
                        title="📜 Combat Log"
                        className="flex-1 min-h-[200px]"
                    />
                </VStack>
            </HStack>

            {/* ==================== LEGEND ==================== */}
            <HStack gap="lg" justify="center" className="w-full py-2 border-t border-gray-700">
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300" />
                    <Typography variant="caption" className="text-gray-400">Player</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-red-500 border border-red-300" />
                    <Typography variant="caption" className="text-gray-400">Enemy</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200" />
                    <Typography variant="caption" className="text-gray-400">Selected</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-green-400 border border-green-200" />
                    <Typography variant="caption" className="text-gray-400">Move</Typography>
                </HStack>
                <HStack gap="xs" align="center">
                    <Box className="w-3 h-3 rounded-full bg-red-400 border border-red-200" />
                    <Typography variant="caption" className="text-gray-400">Attack</Typography>
                </HStack>
            </HStack>
        </VStack>
    );
}

export default HexTraitWarsGame;
