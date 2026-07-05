'use client';
/**
 * `shape-layer` — batch of shapes in one descriptor for O(layers) perf.
 *
 * Paints a set of shapes in array order; composes the `shape` atom.
 * The React component renders `null` (a drawable is painted by the host, not
 * the DOM); it exists so the pattern pipeline can register the pattern.
 */
import type React from 'react';
import type { DrawableBase, PaintFn } from './types';
import type { ShapeDrawable } from './shape';
import { paintShape } from './shape';

export interface ShapeLayerDrawable extends DrawableBase {
    type: 'shape-layer';
    items: ShapeDrawable[];
}

/** Paint a {@link ShapeLayerDrawable}. */
export const paintShapeLayer: PaintFn<ShapeLayerDrawable> = (painter, node, dctx) => {
    for (const item of node.items) {
        paintShape(painter, item, dctx);
    }
};

/** Registry/standalone stub — the host paints this molecule; the DOM renders nothing. */
export function ShapeLayer2D(_props: ShapeLayerDrawable): React.JSX.Element | null {
    return null;
}

export default ShapeLayer2D;
