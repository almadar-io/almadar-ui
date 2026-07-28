'use client';
/**
 * `svg-draw-group` — a `<g>` wrapper composing `svg-draw-*` children.
 *
 * `x`/`y` are grid-cell units scaled by the stage's `tileSize` via
 * `SvgStageContext` (default 1 outside an `svg-stage`); `scale`/`rotate`
 * (degrees) append to the transform so children position relative to the group.
 */
import * as React from 'react';
import { useContext } from 'react';
import { SvgStageContext } from '../molecules/SvgStage';

export interface SvgDrawGroupProps {
    /** Grid-cell x of the group's origin. */
    x?: number;
    /** Grid-cell y of the group's origin. */
    y?: number;
    /** Uniform scale applied after the translate. */
    scale?: number;
    /** Rotation in degrees applied after the translate. */
    rotate?: number;
    /** 0..1 opacity. */
    opacity?: number;
    /** Additional CSS classes */
    className?: string;
    children?: React.ReactNode;
}

export function SvgDrawGroup({
    x = 0,
    y = 0,
    scale,
    rotate,
    opacity,
    className,
    children,
}: SvgDrawGroupProps): React.JSX.Element {
    const { tileSize } = useContext(SvgStageContext);
    const transforms = [`translate(${x * tileSize} ${y * tileSize})`];
    if (rotate !== undefined) transforms.push(`rotate(${rotate})`);
    if (scale !== undefined) transforms.push(`scale(${scale})`);
    return (
        <g transform={transforms.join(' ')} opacity={opacity} className={className}>
            {children}
        </g>
    );
}

SvgDrawGroup.displayName = 'SvgDrawGroup';

export default SvgDrawGroup;
