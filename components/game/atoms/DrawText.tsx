'use client';
/**
 * `draw-text` — the neutral text drawable atom (dimension-agnostic).
 *
 * ONE descriptor (`DrawTextProps`, grounded in core `ScenePos`) with TWO backends:
 * `paintText` (2D) and `Text3D` (a billboarded drei `<Text>`). Paints a string at
 * a scene position with font/color/alignment. The React component renders `null`
 * (a drawable is painted by the host, not the DOM).
 */
import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import type { ScenePos } from '@almadar/core';
import type { DrawableAnchor, DrawableBase, PaintFn } from '../../../lib/drawable/contract';
import type { Projector3D } from '../../../lib/drawable/projector3d';

export interface DrawTextProps extends DrawableBase {
    type: 'draw-text';
    text: string;
    /** Logical scene position; the projector maps it to pixels / world. */
    position: ScenePos;
    anchor?: DrawableAnchor;
    offsetX?: number;
    offsetY?: number;
    color: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    opacity?: number;
}

/** Paint a {@link DrawTextProps}. */
export const paintText: PaintFn<DrawTextProps> = (painter, node, dctx) => {
    const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'center');
    const x = p.x + (node.offsetX ?? 0);
    const y = p.y + (node.offsetY ?? 0);

    painter.save();
    if (node.opacity !== undefined && node.opacity !== 1) painter.setAlpha(node.opacity);
    painter.text(node.text, x, y, { color: node.color, font: node.font, align: node.align, baseline: node.baseline });
    painter.restore();
};

/** R3F backend: a billboarded drei `<Text>` above the scene position. */
export function Text3D({ node, projector }: { node: DrawTextProps; projector: Projector3D }): React.JSX.Element | null {
    const world = projector.toWorld(node.position);
    return (
        <Billboard position={[world[0], world[1] + 1.2, world[2]]}>
            <Text
                fontSize={0.32}
                color={node.color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {node.text}
            </Text>
        </Billboard>
    );
}

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function DrawText(_props: DrawTextProps): React.JSX.Element | null {
    return null;
}

export default DrawText;
