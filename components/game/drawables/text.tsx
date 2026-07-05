'use client';
/**
 * `text` — the neutral text drawable atom.
 *
 * Paints a text string at a scene position with customizable font, color, and alignment.
 * The React component renders `null` (a drawable is painted by the host, not the DOM).
 */
import type React from 'react';
import type { ScenePos } from '@almadar/core';
import type { DrawableAnchor, DrawableBase, PaintFn } from './types';

export interface TextDrawable extends DrawableBase {
    type: 'text';
    text: string;
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

export const paintText: PaintFn<TextDrawable> = (painter, node, dctx) => {
    const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'center');
    const x = p.x + (node.offsetX ?? 0);
    const y = p.y + (node.offsetY ?? 0);

    painter.save();
    if (node.opacity !== undefined && node.opacity !== 1) painter.setAlpha(node.opacity);
    painter.text(node.text, x, y, { color: node.color, font: node.font, align: node.align, baseline: node.baseline });
    painter.restore();
};

export function Text2D(_props: TextDrawable): React.JSX.Element | null {
    return null;
}

export default Text2D;
