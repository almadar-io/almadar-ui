/**
 * BattleBoard
 *
 * Core rendering organism for turn-based battles.
 *
 * This is a **controlled-only** component: all game state (units, phase,
 * turn, gameResult, selectedUnitId) must be provided via the `entity` prop.
 * User interactions are communicated via event bus emissions so the parent
 * (typically an Orbital trait or the `useBattleState` hook) can manage
 * state transitions.
 *
 * For a self-managing version, use `UncontrolledBattleBoard` which
 * composes this component with the `useBattleState` hook.
 *
 * Animation-only state (movement interpolation, screen shake, hover) is
 * always managed locally.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { IsometricTile, IsometricFeature } from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
/** Battle phases an encounter walks through */
export type BattlePhase = 'observation' | 'selection' | 'movement' | 'action' | 'enemy_turn' | 'game_over';
/** A unit participating in battle */
export interface BattleUnit {
    id: string;
    name: string;
    unitType?: string;
    heroId?: string;
    sprite?: string;
    team: 'player' | 'enemy';
    position: {
        x: number;
        y: number;
    };
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits?: {
        name: string;
        currentState: string;
        states: string[];
        cooldown?: number;
    }[];
}
/** Minimal tile for map generation */
export interface BattleTile {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
}
/** Entity prop containing all board data.
 *
 * BattleBoard is **controlled-only**: all game-state fields (`units`, `phase`,
 * `turn`, `gameResult`, `selectedUnitId`) must be provided.  Mutations are
 * communicated via event bus emissions — the component never calls `setState`
 * for game-logic values.
 *
 * For a self-managing variant, use `UncontrolledBattleBoard`.
 *
 * Animation-only state (`movingPositions`, `isShaking`, `hoveredTile`) is
 * always managed locally.
 */
export interface BattleEntity {
    id: string;
    tiles: IsometricTile[];
    features?: IsometricFeature[];
    boardWidth?: number;
    boardHeight?: number;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
    backgroundImage?: string;
    /** Current unit state. */
    units: BattleUnit[];
    /** Current battle phase. */
    phase: BattlePhase;
    /** Current turn number. */
    turn: number;
    /** Game result. `null` = still in progress. */
    gameResult: 'victory' | 'defeat' | null;
    /** Currently selected unit ID. */
    selectedUnitId: string | null;
}
/** Context exposed to render-prop slots */
export interface BattleSlotContext {
    phase: BattlePhase;
    turn: number;
    selectedUnit: BattleUnit | null;
    hoveredUnit: BattleUnit | null;
    playerUnits: BattleUnit[];
    enemyUnits: BattleUnit[];
    gameResult: 'victory' | 'defeat' | null;
    onEndTurn: () => void;
    onCancel: () => void;
    onReset: () => void;
    attackTargets: Array<{
        x: number;
        y: number;
    }>;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
}
export interface BattleBoardProps {
    /** Entity containing all board data */
    entity: BattleEntity;
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Header area -- receives battle context */
    header?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Sidebar content (combat log, unit roster, etc.) */
    sidebar?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating action buttons */
    actions?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Floating overlays above the canvas (damage popups, tooltips) */
    overlay?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Game-over screen overlay */
    gameOverOverlay?: (ctx: BattleSlotContext) => React.ReactNode;
    /** Called when a unit attacks another */
    onAttack?: (attacker: BattleUnit, target: BattleUnit, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: BattleUnit, to: {
        x: number;
        y: number;
    }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: BattleUnit, target: BattleUnit) => number;
    onDrawEffects?: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
    hasActiveEffects?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Emits UI:{endTurnEvent} with {} on end turn */
    endTurnEvent?: string;
    /** Emits UI:{cancelEvent} with {} on cancel */
    cancelEvent?: string;
    /** Emits UI:{gameEndEvent} with { result } on game end */
    gameEndEvent?: string;
    /** Emits UI:{playAgainEvent} with {} on play again / reset */
    playAgainEvent?: string;
    /** Emits UI:{attackEvent} with { attackerId, targetId, damage } on attack */
    attackEvent?: string;
    className?: string;
}
export declare function BattleBoard({ entity, scale, unitScale, header, sidebar, actions, overlay, gameOverOverlay, onAttack, onGameEnd, onUnitMove, calculateDamage, onDrawEffects, hasActiveEffects, effectSpriteUrls, resolveUnitFrame, tileClickEvent, unitClickEvent, endTurnEvent, cancelEvent, gameEndEvent, playAgainEvent, attackEvent, className, }: BattleBoardProps): React.JSX.Element;
export declare namespace BattleBoard {
    var displayName: string;
}
export default BattleBoard;
