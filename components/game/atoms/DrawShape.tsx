'use client';
/**
 * `draw-shape` — the neutral vector-fill/stroke drawable atom (dimension-agnostic).
 *
 * ONE descriptor (`DrawShapeProps`, grounded in core `ScenePos`) with TWO
 * backends: `paintShape` (2D) and `Shape3D` (a flat ground-plane R3F mesh).
 * Paints a cell footprint, an axis-aligned rect, an ellipse, or a poly at a
 * scene position, fill and/or stroke. Genre uses (tile fallback, iso/hex diamond
 * fallback, cell highlight, feature disc, unit selection ring, unit fallback
 * circle, ground/ghost discs, solid backgrounds, side-view platform rects) are
 * all this atom with different `shape`/`anchor`/geometry — composed in `.lolo`,
 * not here. The React component renders `null`; it exists so the pattern pipeline
 * registers a `draw-shape` pattern and standalone pages stay inspectable.
 */
import React from 'react';
import * as THREE from 'three';
import type { ScenePos } from '@almadar/core';
import type { PainterPoint } from '../../../lib/painter2d';
import type { DrawableAnchor, DrawableBase, PaintFn } from '../../../lib/drawable/contract';
import type { Projector3D } from '../../../lib/drawable/projector3d';

export type ShapeKind = 'cell' | 'rect' | 'ellipse' | 'poly';

export interface DrawShapeProps extends DrawableBase {
    type: 'draw-shape';
    shape: ShapeKind;
    /** Logical scene position; the projector maps it to pixels / world. */
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

/** Paint a {@link DrawShapeProps}. Skips a draw when its required geometry is missing — never throws. */
export const paintShape: PaintFn<DrawShapeProps> = (painter, node, dctx) => {
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

/** R3F mesh backend: a flat mesh on the ground plane. */
export function Shape3D({ node, projector }: { node: DrawShapeProps; projector: Projector3D }): React.JSX.Element | null {
    const world = projector.toWorld(node.position);
    const color = node.fill ?? node.stroke ?? '#ffffff';

    let geometry: React.JSX.Element;
    switch (node.shape) {
        case 'cell':
        case 'rect': {
            const w = node.shape === 'cell' ? projector.cellSize * 0.95 : node.width ?? projector.cellSize;
            const h = node.shape === 'cell' ? projector.cellSize * 0.95 : node.height ?? projector.cellSize;
            geometry = <planeGeometry args={[w, h]} />;
            break;
        }
        case 'ellipse': {
            const radiusX = node.radiusX ?? 0.4;
            geometry =
                node.stroke && !node.fill ? (
                    <ringGeometry args={[Math.max(0, radiusX - 0.08), radiusX, 32]} />
                ) : (
                    <circleGeometry args={[radiusX, 32]} />
                );
            break;
        }
        case 'poly': {
            if (!node.points || node.points.length === 0) return null;
            const s = new THREE.Shape();
            node.points.forEach((p, i) => {
                if (i === 0) s.moveTo(p.x, p.y);
                else s.lineTo(p.x, p.y);
            });
            s.closePath();
            geometry = <shapeGeometry args={[s]} />;
            break;
        }
        default:
            return null;
    }

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world[0], world[1] + 0.02, world[2]]}>
            {geometry}
            <meshBasicMaterial color={color} transparent opacity={node.opacity ?? 1} side={THREE.DoubleSide} />
        </mesh>
    );
}

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function DrawShape(_props: DrawShapeProps): React.JSX.Element | null {
    return null;
}

export default DrawShape;
