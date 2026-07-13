/**
 * Drawable contract — the shared vocabulary every neutral drawable primitive
 * (the `draw-sprite`/`draw-shape`/`draw-text` atoms, `draw-sprite-layer`/
 * `draw-shape-layer` molecules) is authored against. A drawable is a pure
 * descriptor the canvas HOST walks and paints via the portable {@link Painter2D}
 * seam — no `CanvasRenderingContext2D`, no DOM. Genre (a "unit"/"tile"/
 * "highlight") is a `.lolo` COMPOSITION of these, never its own primitive.
 *
 * A position is a core `ScenePos` (logical scene space). The host's {@link Projector}
 * maps it to pixels; primitives never do projection math themselves. Because the
 * `ScenePos` type identity is what pattern-sync stamps as the `drawable`
 * capability, every drawable descriptor's `position` MUST be a core `ScenePos`.
 */
import type { ScenePos } from '@almadar/core';
import type { Painter2D, PainterPoint } from '../painter2d';

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
    /** Cell width in px — `TILE_WIDTH * scale` for grid layouts, 1 for `free`/`side` (world-pixel-direct). */
    readonly tileWidth: number;
    /** Cell floor height in px — `FLOOR_HEIGHT * scale` for grid layouts, 1 for `free`/`side`. */
    readonly floorHeight: number;
    /** Diamond-top offset in px — `DIAMOND_TOP_Y * scale` for grid layouts, 0 for `free`/`side`. */
    readonly diamondTopY: number;
    /** Render scale factor. */
    readonly scale: number;
    /** True for square-pitch grids (`flat`/`free`); false for diamond (iso/hex). */
    readonly squareGrid: boolean;
}

/**
 * True when `pos` is a usable scene position (finite numeric x/y). A drawable
 * whose position expression resolved to nothing renders nothing — one malformed
 * item must never blank a board, mirroring the unresolvable-asset contract.
 */
export function isValidScenePos(pos: ScenePos | undefined): pos is ScenePos {
    return Number.isFinite(pos?.x) && Number.isFinite(pos?.y);
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
    /**
     * Optional hit-test handle. When a board authors a per-entity id here (e.g.
     * `id: (object/get @u id)` on a unit sprite), the canvas host indexes the
     * descriptor's `ScenePos → id` and resolves a pointer/raycast at that cell to
     * this id — the source of `unitClickEvent {unitId}`. A source-tagged handle,
     * NOT a heuristic: no id → the host emits only the coordinate (tile click).
     */
    id?: string;
}

/** A paint function: draws one descriptor of type `T` to the painter. */
export type PaintFn<T extends DrawableBase> = (
    painter: Painter2D,
    node: T,
    dctx: DrawContext,
) => void;
