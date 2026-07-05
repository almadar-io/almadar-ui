'use client';
/**
 * Drawable3D — the R3F dispatcher for neutral drawable descriptors.
 *
 * The 3D twin of `paintDrawable`: given ONE descriptor, it renders the matching
 * R3F element (mesh/billboard). ⚠ R3F throws if a plain descriptor object reaches
 * `<group>{children}` — the host must ALWAYS map descriptors through THIS
 * component first, never pass raw `DrawableNode`s as children. Consumes the same
 * `DrawSpriteProps`/`DrawShapeProps`/`DrawTextProps` descriptors as the 2D paint
 * dispatch — that is what makes canvas-2d and canvas-3d the same `children`
 * interface.
 */
import React from 'react';
import type { Projector3D } from './projector3d';
import type { DrawableNode } from './paintDispatch';
import { Sprite3D, Shape3D, Text3D } from './mesh3d';

export interface Drawable3DProps {
    node: DrawableNode;
    projector: Projector3D;
}

export function Drawable3D({ node, projector }: Drawable3DProps): React.JSX.Element | null {
    switch (node.type) {
        case 'draw-sprite':
            return <Sprite3D node={node} projector={projector} />;
        case 'draw-shape':
            return <Shape3D node={node} projector={projector} />;
        case 'draw-text':
            return <Text3D node={node} projector={projector} />;
        case 'draw-sprite-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Sprite3D key={i} node={item} projector={projector} />
                    ))}
                </>
            );
        case 'draw-shape-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Shape3D key={i} node={item} projector={projector} />
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
    }
}

export default Drawable3D;
