'use client';
/**
 * `draw-group` — the drawable CONTAINER atom (dimension-agnostic).
 *
 * Multi-shape art (a hero token = cloak + head + sword shapes) travels as ONE
 * node: the host paints the group by translating to its projected position,
 * applying `scale`/`rotate`/`opacity`, then painting each `items` descriptor
 * through the normal dispatch. `items` is a plain data prop (NOT `children`,
 * which UISlotRenderer special-cases) — same convention as the `draw-*-layer`
 * molecules. The React component renders `null`; it exists so the pattern
 * pipeline registers a `draw-group` pattern and standalone pages stay
 * inspectable. 2D-canvas only — the 3D backend skips it with a warn.
 */
import type React from 'react';
import { useContext } from 'react';
import type { ScenePos } from '@almadar/core';
import type { DrawableBase } from '../../../lib/drawable/contract';
import type { DrawableNode } from '../../../lib/drawable/paintDispatch';
import { DrawableRegistryContext } from '../../../lib/drawable/registry';

export interface DrawGroupProps extends DrawableBase {
    type: 'draw-group';
    /** Logical scene position; the projector maps it to pixels / world. */
    position: ScenePos;
    /** Uniform scale applied to the whole group. */
    scale?: number;
    /** Rotation in radians (painter units). */
    rotate?: number;
    /** 0..1 opacity. */
    opacity?: number;
    /** Clip the group's items to an SVG path (`d` syntax) in world units relative to the group origin — masked reveals, meters, portraits. */
    clip?: string;
    /** The grouped drawables, painted through the normal dispatch. */
    items: DrawableNode[];
}

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing.
 *  When composed as a React child of a draw-host (Canvas2D), registers its
 *  descriptor via context so the host paints it — same path as DrawShape. */
export function DrawGroup(props: DrawGroupProps): React.JSX.Element | null {
    const register = useContext(DrawableRegistryContext);
    if (register) register({ ...props, type: 'draw-group' });
    return null;
}

export default DrawGroup;
