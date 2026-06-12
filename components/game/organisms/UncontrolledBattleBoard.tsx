/**
 * UncontrolledBattleBoard
 *
 * Thin wrapper that composes `useBattleState` + `BattleBoard` for
 * self-managing game state.  Accepts `initialUnits` instead of the
 * controlled-mode fields and manages units, phase, turn, gameResult,
 * and selectedUnitId internally via the hook.
 *
 * Use this component when you want the BattleBoard to manage its own
 * game logic (e.g. in Storybook, prototypes, or simple integrations).
 * For Orbital trait integration, use `BattleBoard` directly in
 * controlled mode.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import type { EntityRow } from '@almadar/core';
import { BattleBoard, type BattleBoardProps } from './BattleBoard';
import { boardEntity, rows } from './boardEntity';
import { useBattleState } from './hooks/useBattleState';

export interface UncontrolledBattleBoardProps extends Omit<BattleBoardProps, 'entity'> {
    // Single board-state entity row (or array). The internal `useBattleState`
    // hook owns the controlled game-state fields; this row supplies the static
    // board config plus an `initialUnits` array (`EntityRow[]`) seed.
    entity?: EntityRow | readonly EntityRow[];
}

export function UncontrolledBattleBoard({ entity, ...rest }: UncontrolledBattleBoardProps): React.JSX.Element | null {
    const resolved = boardEntity(entity);

    const battleState = useBattleState(
        rows(resolved?.initialUnits) as EntityRow[],
        {
            tileClickEvent: rest.tileClickEvent,
            unitClickEvent: rest.unitClickEvent,
            endTurnEvent: rest.endTurnEvent,
            cancelEvent: rest.cancelEvent,
            attackEvent: rest.attackEvent,
            gameEndEvent: rest.gameEndEvent,
            playAgainEvent: rest.playAgainEvent,
        },
        {
            onAttack: rest.onAttack,
            onGameEnd: rest.onGameEnd,
            onUnitMove: rest.onUnitMove,
            calculateDamage: rest.calculateDamage,
        },
    );

    if (!resolved) return null;

    return (
        <BattleBoard
            {...rest}
            entity={{
                ...resolved,
                units: battleState.units,
                phase: battleState.phase,
                turn: battleState.turn,
                gameResult: battleState.gameResult,
                selectedUnitId: battleState.selectedUnitId,
            } as EntityRow}
        />
    );
}

UncontrolledBattleBoard.displayName = 'UncontrolledBattleBoard';

export default UncontrolledBattleBoard;
