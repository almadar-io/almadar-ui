'use client';
/**
 * `svg-draw-text` — a `<text>` label (real SVG DOM) on the stage grid.
 *
 * `x`/`y` are grid-cell units scaled by the stage's `tileSize` via
 * `SvgStageContext` (default 1 outside an `svg-stage`); `size` is a font-size
 * in viewBox units.
 */
import * as React from 'react';
import { useContext } from 'react';
import { SvgStageContext } from '../molecules/SvgStage';

export interface SvgDrawTextProps {
    /** Grid-cell x of the text anchor. */
    x: number;
    /** Grid-cell y of the text anchor. */
    y: number;
    /** The text content. */
    text: string;
    /** Font size in viewBox units (default 12). */
    size?: number;
    fill?: string;
    /** Text anchor (default 'middle'). */
    anchor?: 'start' | 'middle' | 'end';
    /** Additional CSS classes */
    className?: string;
}

export function SvgDrawText({
    x,
    y,
    text,
    size = 12,
    fill = 'var(--color-foreground)',
    anchor = 'middle',
    className,
}: SvgDrawTextProps): React.JSX.Element {
    const { tileSize } = useContext(SvgStageContext);
    return (
        <text
            x={x * tileSize}
            y={y * tileSize}
            fontSize={size}
            fill={fill}
            textAnchor={anchor}
            className={className}
        >
            {text}
        </text>
    );
}

SvgDrawText.displayName = 'SvgDrawText';

export default SvgDrawText;
