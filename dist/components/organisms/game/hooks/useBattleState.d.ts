import type { BattleUnit, BattlePhase } from '../BattleBoard';
export interface BattleStateEventConfig {
    tileClickEvent?: string;
    unitClickEvent?: string;
    endTurnEvent?: string;
    cancelEvent?: string;
    gameEndEvent?: string;
    playAgainEvent?: string;
    attackEvent?: string;
}
export interface BattleStateCallbacks {
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
}
export interface BattleStateResult {
    units: BattleUnit[];
    selectedUnitId: string | null;
    phase: BattlePhase;
    turn: number;
    gameResult: 'victory' | 'defeat' | null;
    handleTileClick: (x: number, y: number) => void;
    handleUnitClick: (unitId: string) => void;
    handleEndTurn: () => void;
    handleRestart: () => void;
}
export declare function useBattleState(initialUnits: BattleUnit[], eventConfig?: BattleStateEventConfig, callbacks?: BattleStateCallbacks): BattleStateResult;
