/**
 * Game Types
 * 
 * Core type definitions for the Trait Wars game state.
 */

import { CharacterType } from '../atoms/CharacterSprite';
import { TraitState } from '../atoms/StateIndicator';
import { TileType } from '../atoms/TileSprite';

// Position on the game board
export interface Position {
    x: number;
    y: number;
}

// A unit in the game
export interface GameUnit {
    id: string;
    name: string;
    characterType: CharacterType;
    team: 'player' | 'enemy';
    position: Position;
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits: UnitTrait[];
}

// A trait equipped on a unit
export interface UnitTrait {
    name: string;
    currentState: string;
    states: string[];
    cooldown: number;
}

// A tile on the game board
export interface BoardTile {
    terrain: TileType;
    unitId?: string;
    isBlocked?: boolean;
}

// Game phases
export type GamePhase = 'observation' | 'planning' | 'execution' | 'tick';

// The complete game state
export interface GameState {
    board: BoardTile[][];
    units: Record<string, GameUnit>;
    currentPhase: GamePhase;
    currentTurn: number;
    activeTeam: 'player' | 'enemy';
    selectedUnitId?: string;
    validMoves: Position[];
    attackTargets: Position[];
}

// Game actions
export type GameAction =
    | { type: 'SELECT_UNIT'; unitId: string }
    | { type: 'MOVE_UNIT'; from: Position; to: Position }
    | { type: 'ATTACK'; attackerId: string; targetId: string }
    | { type: 'END_TURN' }
    | { type: 'EXECUTE_TRAITS' };

// Helper to create initial game state
export function createInitialGameState(
    width: number,
    height: number,
    units: GameUnit[]
): GameState {
    // Create empty board
    const board: BoardTile[][] = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => ({
            terrain: getRandomTerrain(),
        }))
    );

    // Place units on board
    const unitsMap: Record<string, GameUnit> = {};
    for (const unit of units) {
        unitsMap[unit.id] = unit;
        board[unit.position.y][unit.position.x].unitId = unit.id;
    }

    return {
        board,
        units: unitsMap,
        currentPhase: 'observation',
        currentTurn: 1,
        activeTeam: 'player',
        validMoves: [],
        attackTargets: [],
    };
}

function getRandomTerrain(): TileType {
    const terrains: TileType[] = ['floorStone', 'floorDirt', 'floorWood', 'floorGrass'];
    return terrains[Math.floor(Math.random() * terrains.length)];
}

// Calculate valid moves for a unit
export function calculateValidMoves(
    state: GameState,
    unitId: string
): Position[] {
    const unit = state.units[unitId];
    if (!unit) return [];

    const moves: Position[] = [];
    const { x, y } = unit.position;
    const range = unit.movement;

    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.abs(dx) + Math.abs(dy);

            if (
                distance > 0 &&
                distance <= range &&
                ny >= 0 && ny < state.board.length &&
                nx >= 0 && nx < state.board[0].length &&
                !state.board[ny][nx].unitId &&
                !state.board[ny][nx].isBlocked
            ) {
                moves.push({ x: nx, y: ny });
            }
        }
    }

    return moves;
}

// Calculate attack targets for a unit
export function calculateAttackTargets(
    state: GameState,
    unitId: string
): Position[] {
    const unit = state.units[unitId];
    if (!unit) return [];

    const targets: Position[] = [];
    const { x, y } = unit.position;

    // Adjacent tiles (range 1)
    const directions = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    ];

    for (const { dx, dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (
            ny >= 0 && ny < state.board.length &&
            nx >= 0 && nx < state.board[0].length
        ) {
            const targetTile = state.board[ny][nx];
            if (targetTile.unitId) {
                const targetUnit = state.units[targetTile.unitId];
                if (targetUnit && targetUnit.team !== unit.team) {
                    targets.push({ x: nx, y: ny });
                }
            }
        }
    }

    return targets;
}
