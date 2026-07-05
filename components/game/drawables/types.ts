/**
 * Drawable contract — the shared vocabulary every neutral drawable primitive
 * (`sprite`/`shape`/`text` atoms, `sprite-layer`/`shape-layer` molecules) is
 * authored against. A drawable is a pure descriptor the canvas HOST walks and
 * paints via the portable {@link Painter2D} seam — no `CanvasRenderingContext2D`,
 * no DOM. Genre (a "unit"/"tile"/"highlight") is a `.lolo` COMPOSITION of these,
 * never its own primitive.
 *
 * A position is a core `ScenePos` (logical scene space). The host's {@link Projector}
 * maps it to pixels; primitives never do projection math themselves.
 */
import type { ScenePos } from '@almadar/core';
import type { Painter2D, PainterPoint } from '../../../lib/painter2d';

/**
 * How a drawable aligns to its projected position.
 * - `top-left` — the cell's top-left corner (tiles).
 * - `ground`   — the cell's ground point, bottom-center of the drawable (units/features).
 * - `center`   — the cell's visual center (effects).
 */
export type DrawableAnchor = 'top-left' | 'ground' | 'center';

/**
 * Maps logical scene coordinates to pixel space for one projection (iso/hex/flat/free).
 * Owns ALL projection geometry so the primitives stay projection-agnostic. The host
 * applies the camera transform on the painter around the walk; the projector is
 * pre-camera (logical→cell-pixel).
 */
export interface Projector {
    /** Cell top-left in pixels. */
    project(pos: ScenePos): PainterPoint;
    /** The pixel reference point for an anchor (see {@link DrawableAnchor}). */
    anchorPoint(pos: ScenePos, anchor: DrawableAnchor): PainterPoint;
    /** The cell footprint polygon — a rect (square grids) or a diamond (iso/hex). */
    cellPath(pos: ScenePos): PainterPoint[];
    /** Scaled cell width in px (`TILE_WIDTH * scale`). */
    readonly tileWidth: number;
    /** Scaled floor/diamond height in px (`FLOOR_HEIGHT * scale`). */
    readonly floorHeight: number;
    /** Scaled diamond-top offset in px (`DIAMOND_TOP_Y * scale`). */
    readonly diamondTopY: number;
    /** Render scale factor. */
    readonly scale: number;
    /** True for square-pitch grids (`flat`/`free`); false for diamond (iso/hex). */
    readonly squareGrid: boolean;
}

/** Per-frame context handed to every paint fn. */
export interface DrawContext {
    projector: Projector;
    /** Animation clock in ms (0 when static). Reserved for a LOLO-driven pulse/breathe input. */
    time: number;
    /** Force a host re-draw once an async resource (image / atlas JSON) has loaded. */
    invalidate: () => void;
}

/** Common shape of every drawable descriptor. `type` keys the host's paint dispatch. */
export interface DrawableBase {
    type: string;
}

/** A paint function: draws one descriptor of type `T` to the painter. */
export type PaintFn<T extends DrawableBase> = (
    painter: Painter2D,
    node: T,
    dctx: DrawContext,
) => void;
