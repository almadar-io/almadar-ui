'use client';
/**
 * Drawable3D — the R3F dispatcher for neutral drawable descriptors.
 *
 * The 3D twin of `paintDrawable`: given ONE descriptor, it renders the matching
 * R3F element (mesh/billboard). ⚠ R3F throws if a plain descriptor object reaches
 * `<group>{children}` — the host must ALWAYS map descriptors through THIS
 * component first, never pass raw `DrawableNode`s as children. Consumes the same
 * `DrawSpriteProps`/`DrawShapeProps`/`DrawTextProps`/`DrawMeshProps` descriptors
 * as the 2D paint dispatch — that is what makes canvas-2d and canvas-3d the same
 * `children` interface.
 *
 * `draw-group` maps to a three `<group>`: items are group-LOCAL (their positions
 * project through an origin-anchored projector so the host's bounds anchor is not
 * applied twice), `rotate` is ground-plane yaw (negated — 2D screen rotation is
 * clockwise-positive under y-down, world-Y yaw is CCW-positive), and `opacity`
 * accumulates down into every leaf material. `clip` has no faithful three
 * mapping (SVG-path masks) — skipped with a one-time warn.
 */
import React from 'react';
import { create3DProjector, type Projector3D } from '../projector3d';
import type { DrawableNode } from '../paintDispatch';
import { isValidScenePos } from '../contract';
import { Sprite3D, Shape3D, Text3D, warnUnsupported3d } from './mesh3d';
import { Mesh3D } from './DrawMesh3D';

export interface Drawable3DProps {
    node: DrawableNode;
    projector: Projector3D;
    /** Accumulated enclosing `draw-group` opacity, multiplied into leaf materials. */
    groupOpacity?: number;
}

export function Drawable3D({ node, projector, groupOpacity = 1 }: Drawable3DProps): React.JSX.Element | null {
    switch (node.type) {
        case 'draw-sprite':
            return <Sprite3D node={node} projector={projector} groupOpacity={groupOpacity} />;
        case 'draw-shape':
            return <Shape3D node={node} projector={projector} groupOpacity={groupOpacity} />;
        case 'draw-text':
            return <Text3D node={node} projector={projector} />;
        case 'draw-mesh':
            return <Mesh3D node={node} projector={projector} groupOpacity={groupOpacity} />;
        case 'draw-sprite-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Sprite3D key={i} node={item} projector={projector} groupOpacity={groupOpacity} />
                    ))}
                </>
            );
        case 'draw-shape-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Shape3D key={i} node={item} projector={projector} groupOpacity={groupOpacity} />
                    ))}
                </>
            );
        case 'draw-text-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Text3D key={i} node={item} projector={projector} />
                    ))}
                </>
            );
        case 'draw-group': {
            if (!isValidScenePos(node.position) || !Array.isArray(node.items)) return null;
            if (node.clip) warnUnsupported3d('draw-group:clip');
            const world = projector.toWorld(node.position);
            const inner = create3DProjector({ cellSize: projector.cellSize });
            const opacity = (node.opacity ?? 1) * groupOpacity;
            const s = node.scale ?? 1;
            return (
                <group position={world} rotation={[0, -(node.rotate ?? 0), 0]} scale={[s, s, s]}>
                    {node.items.map((item, i) => (
                        <Drawable3D key={i} node={item} projector={inner} groupOpacity={opacity} />
                    ))}
                </group>
            );
        }
    }
}

export default Drawable3D;
