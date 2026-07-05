'use client';
/**
 * `shape` — the neutral vector-fill/stroke drawable atom.
 *
 * Paints a cell footprint, an axis-aligned rect, an ellipse, or a poly at a
 * scene position, fill and/or stroke. Genre uses (tile fallback, iso/hex
 * diamond fallback, cell highlight, feature disc, unit selection ring, unit
 * fallback circle, ground/ghost discs, solid backgrounds, side-view platform
 * rects) are all just this atom with different `shape`/`anchor`/geometry —
 * composed in `.lolo`, not here. The React component renders `null` (a
 * drawable is painted by the host, not the DOM); it exists so the pattern
 * pipeline can register a `shape` pattern and standalone pages stay
 * inspectable.
 */
import type React from 'react';
import type { ScenePos } from '@almadar/core';
import type { PainterPoint } from '../../../lib/painter2d';
import type { DrawableAnchor, DrawableBase, PaintFn } from './types';

export type ShapeKind = 'cell' | 'rect' | 'ellipse' | 'poly';

export interface ShapeDrawable extends DrawableBase {
    type: 'shape';
    shape: ShapeKind;
    /** Logical scene position; the projector maps it to pixels. */
    position: ScenePos;
    /** How the shape aligns to its projected position. Default varies by `shape`. */
    anchor?: DrawableAnchor;
    /** Rect width in px. */
    width?: number;
    /** Rect height in px. */
    height?: number;
    /** Ellipse horizontal radius in px. */
    radiusX?: number;
    /** Ellipse vertical radius in px; omitted → `radiusX` (a circle). */
    radiusY?: number;
    /** Fine px nudge from the anchor point (e.g. a disc drawn at `groundY - 8*scale`). */
    offsetX?: number;
    offsetY?: number;
    /** Poly vertices as px offsets relative to the cell's projected top-left. */
    points?: PainterPoint[];
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    /** 0..1 opacity. */
    opacity?: number;
}

/** Paint a {@link ShapeDrawable}. Skips a draw when its required geometry is missing — never throws. */
export const paintShape: PaintFn<ShapeDrawable> = (painter, node, dctx) => {
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
            const x = p.x + (node.offsetX ?? 0);
            const y = p.y + (node.offsetY ?? 0);
            const w = node.width ?? 0;
            const h = node.height ?? 0;
            if (node.fill) painter.fillRect(x, y, w, h, node.fill);
            if (node.stroke) painter.strokeRect(x, y, w, h, node.stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'ellipse': {
            const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'ground');
            const cx = p.x + (node.offsetX ?? 0);
            const cy = p.y + (node.offsetY ?? 0);
            const rx = node.radiusX ?? 0;
            const ry = node.radiusY ?? rx;
            if (node.fill) painter.fillEllipse(cx, cy, rx, ry, node.fill);
            if (node.stroke) painter.strokeEllipse(cx, cy, rx, ry, node.stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'poly': {
            const base = dctx.projector.project(node.position);
            const pts = (node.points ?? []).map((pt) => ({ x: base.x + pt.x, y: base.y + pt.y }));
            if (node.fill) painter.fillPoly(pts, node.fill);
            if (node.stroke) painter.strokePoly(pts, node.stroke, node.strokeWidth ?? 1, true);
            break;
        }
    }

    painter.restore();
};

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function Shape2D(_props: ShapeDrawable): React.JSX.Element | null {
    return null;
}

export default Shape2D;
