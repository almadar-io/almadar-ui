'use client';
/**
 * `svg-draw-shape-layer` — a batched `<g>` of `svg-draw-shape` atoms.
 *
 * Mirrors how `draw-shape-layer` batches `draw-shape` for the canvas host, but
 * renders real SVG DOM inside an `svg-stage`. Layer-level `fill`/`stroke`/
 * `strokeWidth`/`opacity` are defaults; an item's own value wins.
 */
import * as React from 'react';
import { SvgDrawShape, type SvgDrawShapeProps } from '../atoms/SvgDrawShape';

export interface SvgDrawShapeItem extends Omit<SvgDrawShapeProps, 'className'> {
    /** Stable React key. */
    id: string;
}

export interface SvgDrawShapeLayerProps {
    items: SvgDrawShapeItem[];
    /** Default fill for items that don't set one. */
    fill?: string;
    /** Default stroke for items that don't set one. */
    stroke?: string;
    /** Default strokeWidth for items that don't set one. */
    strokeWidth?: number;
    /** Default 0..1 opacity for items that don't set one. */
    opacity?: number;
}

export function SvgDrawShapeLayer({
    items,
    fill,
    stroke,
    strokeWidth,
    opacity,
}: SvgDrawShapeLayerProps): React.JSX.Element {
    return (
        <g>
            {items.map(({ id, ...shape }) => (
                <SvgDrawShape
                    key={id}
                    {...shape}
                    fill={shape.fill ?? fill}
                    stroke={shape.stroke ?? stroke}
                    strokeWidth={shape.strokeWidth ?? strokeWidth}
                    opacity={shape.opacity ?? opacity}
                />
            ))}
        </g>
    );
}

SvgDrawShapeLayer.displayName = 'SvgDrawShapeLayer';

export default SvgDrawShapeLayer;
