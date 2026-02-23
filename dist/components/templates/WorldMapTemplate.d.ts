/**
 * WorldMapTemplate
 *
 * Thin declarative wrapper around WorldMapBoard organism.
 * All game logic (hero movement, encounters, hex conversion, etc.) lives in WorldMapBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */
import React from 'react';
import type { TemplateProps } from './types';
import type { WorldMapEntity } from '../organisms/game/WorldMapBoard';
export type { WorldMapEntity, MapHero, MapHex, WorldMapSlotContext, } from '../organisms/game/WorldMapBoard';
export interface WorldMapTemplateProps extends TemplateProps<WorldMapEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
}
export declare function WorldMapTemplate({ entity, scale, unitScale, diamondTopY, allowMoveAllHeroes, className, }: WorldMapTemplateProps): React.JSX.Element;
export declare namespace WorldMapTemplate {
    var displayName: string;
}
export default WorldMapTemplate;
