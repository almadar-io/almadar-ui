'use client';
/**
 * `draw-shape` — the neutral vector-fill/stroke drawable atom (dimension-agnostic).
 *
 * ONE descriptor (`DrawShapeProps`, grounded in core `ScenePos`) with TWO
 * backends: `paintShape` (2D, here) and an R3F ground-plane mesh (`Shape3D` in
 * `lib/drawable/mesh3d`, kept OUT of this file so the 2D path never pulls R3F).
 * Paints a cell footprint, an axis-aligned rect, an ellipse, or a poly at a scene
 * position, fill and/or stroke. Genre uses (tile fallback, iso/hex diamond
 * fallback, cell highlight, feature disc, unit selection ring, unit fallback
 * circle, ground/ghost discs, solid backgrounds, side-view platform rects) are
 * all this atom with different `shape`/`anchor`/geometry — composed in `.lolo`,
 * not here. The React component renders `null`; it exists so the pattern pipeline
 * registers a `draw-shape` pattern and standalone pages stay inspectable.
 */
import type React from 'react';
import type { ScenePos } from '@almadar/core';
import type { PainterPoint } from '../../../lib/painter2d';
import type { DrawableAnchor, DrawableBase, PaintFn } from '../../../lib/drawable/contract';
import { isValidScenePos } from '../../../lib/drawable/contract';

export type ShapeKind = 'cell' | 'rect' | 'ellipse' | 'poly';

export interface DrawShapeProps extends DrawableBase {
    type: 'draw-shape';
    shape: ShapeKind;
    /** Logical scene position; the projector maps it to pixels / world. */
    position: ScenePos;
    /** How the shape aligns to its projected position. Default varies by `shape`. */
    anchor?: DrawableAnchor;
    /** Rect width in world units (fractions of `projector.tileWidth`). */
    width?: number;
    /** Rect height in world units (fractions of `projector.tileWidth`). */
    height?: number;
    /** Ellipse horizontal radius in world units (fractions of `projector.tileWidth`). */
    radiusX?: number;
    /** Ellipse vertical radius in world units; omitted → `radiusX` (a circle). */
    radiusY?: number;
    /** Fine nudge from the anchor point in world units. */
    offsetX?: number;
    offsetY?: number;
    /** Poly vertices as world-unit offsets relative to the cell's projected top-left. */
    points?: PainterPoint[];
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    /** 0..1 opacity. */
    opacity?: number;
}

/** Paint a {@link DrawShapeProps}. Skips a draw when its required geometry is missing — never throws. */
export const paintShape: PaintFn<DrawShapeProps> = (painter, node, dctx) => {
    if (!isValidScenePos(node.position)) return;
    painter.save();
    if (node.opacity !== undefined && node.opacity !== 1) painter.setAlpha(node.opacity);

    switch (node.shape) {
        case 'cell': {
            const pts = dctx.projector.cellPath(node.position);
            if (node.fill) painter.fillPoly(pts, node.fill);
            if (node.stroke) painter.strokePoly(pts, node.stroke, node.strokeWidth ?? 1, true);
            break;
        }
        case 'rect': {
            const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'top-left');
            const tw = dctx.projector.tileWidth;
            const x = p.x + (node.offsetX ?? 0) * tw;
            const y = p.y + (node.offsetY ?? 0) * tw;
            const w = (node.width ?? 0) * tw;
            const h = (node.height ?? 0) * tw;
            if (node.fill) painter.fillRect(x, y, w, h, node.fill);
            if (node.stroke) painter.strokeRect(x, y, w, h, node.stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'ellipse': {
            const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'ground');
            const tw = dctx.projector.tileWidth;
            const cx = p.x + (node.offsetX ?? 0) * tw;
            const cy = p.y + (node.offsetY ?? 0) * tw;
            const rx = (node.radiusX ?? 0) * tw;
            const ry = (node.radiusY ?? rx) * tw;
            if (node.fill) painter.fillEllipse(cx, cy, rx, ry, node.fill);
            if (node.stroke) painter.strokeEllipse(cx, cy, rx, ry, node.stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'poly': {
            const base = dctx.projector.project(node.position);
            const tw = dctx.projector.tileWidth;
            const pts = (node.points ?? []).map((pt) => ({ x: base.x + pt.x * tw, y: base.y + pt.y * tw }));
            if (node.fill) painter.fillPoly(pts, node.fill);
            if (node.stroke) painter.strokePoly(pts, node.stroke, node.strokeWidth ?? 1, true);
            break;
        }
    }

    painter.restore();
};

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function DrawShape(_props: DrawShapeProps): React.JSX.Element | null {
    return null;
}

export default DrawShape;
