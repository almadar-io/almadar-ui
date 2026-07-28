'use client';
/**
 * `svg-draw-shape` — ONE SVG element (real SVG DOM, not a canvas painter).
 *
 * Usable only inside an `svg-stage`: `x`/`y` (and all geometry props) are
 * grid-cell units, scaled by the stage's `tileSize` via `SvgStageContext`
 * (default 1 outside a stage, so it degrades to raw viewBox units). Renders a
 * `<g transform="translate(x y)">` wrapping the element so shapes compose
 * inside `svg-draw-group`s intuitively; `points`/`d` are authored in viewBox
 * units relative to that translated origin and passed through unscaled.
 */
import * as React from 'react';
import { useContext } from 'react';
import { SvgStageContext } from '../molecules/SvgStage';

export interface SvgDrawShapeProps {
    shape: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'polyline' | 'path' | 'line';
    /** Grid-cell x of the element's translated origin. */
    x: number;
    /** Grid-cell y of the element's translated origin. */
    y: number;
    /** Rect width in cell units. */
    width?: number;
    /** Rect height in cell units. */
    height?: number;
    /** Circle radius / ellipse horizontal radius in cell units. */
    radius?: number;
    /** Ellipse vertical radius in cell units; omitted → `radius` (a circle). */
    radiusY?: number;
    /** Polygon/polyline points, viewBox units relative to the translated origin. */
    points?: string;
    /** Path data, viewBox units relative to the translated origin. */
    d?: string;
    /** Line end x in cell units. */
    x2?: number;
    /** Line end y in cell units. */
    y2?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    /** 0..1 opacity. */
    opacity?: number;
    /** Additional CSS classes */
    className?: string;
}

export function SvgDrawShape({
    shape,
    x,
    y,
    width,
    height,
    radius,
    radiusY,
    points,
    d,
    x2,
    y2,
    fill,
    stroke,
    strokeWidth,
    opacity,
    className,
}: SvgDrawShapeProps): React.JSX.Element {
    const { tileSize } = useContext(SvgStageContext);
    const cell = (v: number | undefined): number | undefined => (v === undefined ? undefined : v * tileSize);
    const paint = {
        fill: fill ?? (stroke === undefined ? 'var(--color-primary)' : 'none'),
        stroke,
        strokeWidth,
        opacity,
        className,
    };
    return (
        <g transform={`translate(${x * tileSize} ${y * tileSize})`}>
            {shape === 'rect' && <rect width={cell(width)} height={cell(height)} {...paint} />}
            {shape === 'circle' && <circle r={cell(radius)} {...paint} />}
            {shape === 'ellipse' && <ellipse rx={cell(radius)} ry={cell(radiusY ?? radius)} {...paint} />}
            {shape === 'polygon' && <polygon points={points} {...paint} />}
            {shape === 'polyline' && <polyline points={points} {...paint} />}
            {shape === 'path' && <path d={d} {...paint} />}
            {shape === 'line' && <line x2={cell(x2)} y2={cell(y2)} {...paint} />}
        </g>
    );
}

SvgDrawShape.displayName = 'SvgDrawShape';

export default SvgDrawShape;
