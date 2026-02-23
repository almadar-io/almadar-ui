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
import { type BattleBoardProps, type BattleUnit } from './BattleBoard';
export interface UncontrolledBattleBoardProps extends Omit<BattleBoardProps, 'entity'> {
    entity: Omit<BattleBoardProps['entity'], 'units' | 'phase' | 'turn' | 'gameResult' | 'selectedUnitId'> & {
        initialUnits: BattleUnit[];
    };
}
export declare function UncontrolledBattleBoard({ entity, ...rest }: UncontrolledBattleBoardProps): import("react/jsx-runtime").JSX.Element;
export declare namespace UncontrolledBattleBoard {
    var displayName: string;
}
export default UncontrolledBattleBoard;
