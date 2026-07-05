/**
 * 2D projector — builds a {@link Projector} for a projection (iso/hex/flat/free),
 * grounded in the canonical pure math in `isometric.ts` (the one source of the
 * iso/hex/flat transforms). Owns every projection formula so the drawable
 * primitives stay projection-agnostic.
 */
import type { ScenePos } from '@almadar/core';
import type { PainterPoint } from '../painter2d';
import type { DrawableAnchor, Projector } from './contract';
import { TILE_WIDTH, FLOOR_HEIGHT, DIAMOND_TOP_Y, isoToScreen, type TileLayout } from '../../components/game/shared/isometric';

/** Projection modes the 2D host supports. `side` is handled by the side host, not here. */
export type Projection2D = TileLayout | 'free';

export interface Projector2DOptions {
    scale: number;
    /** Horizontal offset that centers the grid (0 for `flat`/`free`). */
    baseOffsetX: number;
    layout: Projection2D;
    /** Override the measured diamond-top offset (default `DIAMOND_TOP_Y`). */
    diamondTopY?: number;
}

/** Build a {@link Projector} for a 2D projection. */
export function create2DProjector(opts: Projector2DOptions): Projector {
    const { scale, baseOffsetX, layout } = opts;
    const tileWidth = TILE_WIDTH * scale;
    const floorHeight = FLOOR_HEIGHT * scale;
    const diamondTopY = (opts.diamondTopY ?? DIAMOND_TOP_Y) * scale;
    const squareGrid = layout === 'flat' || layout === 'free';

    const project = (pos: ScenePos): PainterPoint =>
        layout === 'free' ? { x: pos.x, y: pos.y } : isoToScreen(pos.x, pos.y, scale, baseOffsetX, layout);

    const anchorPoint = (pos: ScenePos, anchor: DrawableAnchor): PainterPoint => {
        const base = project(pos);
        if (anchor === 'top-left') return base;
        const cx = base.x + tileWidth / 2;
        if (anchor === 'ground') {
            const gy = squareGrid ? base.y + tileWidth * 0.92 : base.y + diamondTopY + floorHeight * 0.5;
            return { x: cx, y: gy };
        }
        const cy = squareGrid ? base.y + tileWidth / 2 : base.y + diamondTopY + floorHeight * 0.5;
        return { x: cx, y: cy };
    };

    const cellPath = (pos: ScenePos): PainterPoint[] => {
        const base = project(pos);
        if (squareGrid) {
            return [
                { x: base.x, y: base.y },
                { x: base.x + tileWidth, y: base.y },
                { x: base.x + tileWidth, y: base.y + tileWidth },
                { x: base.x, y: base.y + tileWidth },
            ];
        }
        const cx = base.x + tileWidth / 2;
        const topY = base.y + diamondTopY;
        return [
            { x: cx, y: topY },
            { x: base.x + tileWidth, y: topY + floorHeight / 2 },
            { x: cx, y: topY + floorHeight },
            { x: base.x, y: topY + floorHeight / 2 },
        ];
    };

    return { project, anchorPoint, cellPath, tileWidth, floorHeight, diamondTopY, scale, squareGrid };
}
