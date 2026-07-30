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
    /** Cell width in source-px tile-space — the board's native tile width for grid layouts (`flat`/`iso`/`hex`), 1 for `free`/`side` (world-pixel-direct). The host camera applies the on-screen zoom once. */
    readonly tileWidth: number;
    /** Cell floor height in source-px tile-space (`tileWidth / 2` for grid layouts, 1 for `free`/`side`). */
    readonly floorHeight: number;
    /** Diamond-top offset in source-px tile-space (where the iso diamond starts in the sprite). */
    readonly diamondTopY: number;
    /** Render scale factor. */
    /** True for square-pitch grids (`flat`/`free`); false for diamond (iso/hex). */
    readonly squareGrid: boolean;
    /** True for world-pixel-direct layouts (`free`/`side`); false for tile grids (`flat`/`iso`/`hex`). */
    readonly worldPixelDirect: boolean;
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

/** The minimal geometry a sprite-like descriptor declares for placement. */
export interface SpritePlacement {
    position: ScenePos;
    anchor?: DrawableAnchor;
    /** Draw width in world units (fractions of `projector.tileWidth`). */
    width?: number;
    /** Draw height in world units (fractions of `projector.tileWidth`). */
    height?: number;
}

export interface SpriteRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * The painted rectangle of a sprite-like descriptor — the ONE anchor/size math,
 * shared by the sprite painter (destination rect) and the hit-test (pointer
 * containment) so a click always resolves against exactly what was painted.
 * Default size is one cell on tile grids; `free`/`side` callers pass explicit
 * sizes (their painter falls back to native texture px only when omitted, which
 * no descriptor-driven board does).
 */
export function spriteRect(projector: Projector, node: SpritePlacement, natural?: { w: number; h: number }): SpriteRect {
    const tw = projector.tileWidth;
    const fallbackW = projector.worldPixelDirect ? (natural?.w ?? 0) : tw;
    const fallbackH = projector.worldPixelDirect ? (natural?.h ?? 0) : tw;
    const w = node.width !== undefined ? node.width * tw : fallbackW;
    const h = node.height !== undefined ? node.height * tw : fallbackH;
    const anchor: DrawableAnchor = node.anchor ?? 'top-left';
    const p = projector.anchorPoint(node.position, anchor);
    return {
        x: anchor === 'top-left' ? p.x : p.x - w / 2,
        y: anchor === 'ground' ? p.y - h : anchor === 'center' ? p.y - h / 2 : p.y,
        w,
        h,
    };
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
