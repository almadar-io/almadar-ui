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
import { BattleBoard, type BattleBoardProps, type BattleUnit } from './BattleBoard';
import { useBattleState } from './hooks/useBattleState';

/** Uncontrolled entity read-shape: controlled game-state fields are dropped in
 *  favor of `initialUnits`, which the internal `useBattleState` hook manages. */
export type UncontrolledBattleEntity = Omit<
    BattleBoardProps['entity'],
    'units' | 'phase' | 'turn' | 'gameResult' | 'selectedUnitId'
> & {
    initialUnits: BattleUnit[];
};

export interface UncontrolledBattleBoardProps extends Omit<BattleBoardProps, 'entity'> {
    // The compiler binds the generic `EntityRow`, so the inlet accepts it (and
    // arrays) as union members; the component narrows to its curated
    // `UncontrolledBattleEntity` read-shape below (a valid union-narrow) and
    // renders nothing until an entity is present.
    entity?: UncontrolledBattleEntity | EntityRow | readonly (UncontrolledBattleEntity | EntityRow)[];
}

export function UncontrolledBattleBoard({ entity, ...rest }: UncontrolledBattleBoardProps): React.JSX.Element | null {
    const resolved = (Array.isArray(entity) ? entity[0] : entity) as UncontrolledBattleEntity | undefined;

    const battleState = useBattleState(
        resolved?.initialUnits ?? [],
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
            }}
        />
    );
}

UncontrolledBattleBoard.displayName = 'UncontrolledBattleBoard';

export default UncontrolledBattleBoard;
