/**
 * BattleTemplate
 *
 * Thin declarative wrapper around BattleBoard organism.
 * All game logic (turn phases, movement animation, combat, etc.) lives in BattleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { TemplateProps } from './types';
import type { BattleEntity } from '../organisms/game/BattleBoard';
export type { BattleEntity, BattlePhase, BattleUnit, BattleTile, BattleSlotContext, } from '../organisms/game/BattleBoard';
export interface BattleTemplateProps extends TemplateProps<BattleEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
}
export declare function BattleTemplate({ entity, scale, unitScale, className, }: BattleTemplateProps): React.JSX.Element;
export declare namespace BattleTemplate {
    var displayName: string;
}
export default BattleTemplate;
