/**
 * CastleTemplate
 *
 * Thin declarative wrapper around CastleBoard organism.
 * All game logic (hover state, feature selection, etc.) lives in CastleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { TemplateProps } from './types';
import type { CastleEntity } from '../organisms/game/CastleBoard';
export type { CastleEntity, CastleSlotContext, } from '../organisms/game/CastleBoard';
export interface CastleTemplateProps extends TemplateProps<CastleEntity> {
    /** Canvas render scale */
    scale?: number;
}
export declare function CastleTemplate({ entity, scale, className, }: CastleTemplateProps): React.JSX.Element;
export declare namespace CastleTemplate {
    var displayName: string;
}
export default CastleTemplate;
