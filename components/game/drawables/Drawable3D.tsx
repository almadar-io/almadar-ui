'use client';
/**
 * Drawable3D — the R3F dispatcher for neutral drawable descriptors.
 *
 * The 3D twin of `paintDrawable`: given ONE descriptor, it renders the matching
 * R3F element (mesh/billboard). ⚠ R3F throws if a plain descriptor object reaches
 * `<group>{children}` — the host must ALWAYS map descriptors through THIS
 * component first, never pass raw `DrawableNode`s as children. Consumes the same
 * `SpriteDrawable`/`ShapeDrawable`/`TextDrawable` descriptors as the 2D painter —
 * that is what makes canvas-2d and canvas-3d the same `children` interface.
 */
import React from 'react';
import type { Projector3D } from './projector3d';
import type { DrawableNode } from './paintRegistry';
import { Sprite3D } from './sprite3d';
import { Shape3D } from './shape3d';
import { Text3D } from './text3d';

export interface Drawable3DProps {
    node: DrawableNode;
    projector: Projector3D;
}

export function Drawable3D({ node, projector }: Drawable3DProps): React.JSX.Element | null {
    switch (node.type) {
        case 'sprite':
            return <Sprite3D node={node} projector={projector} />;
        case 'shape':
            return <Shape3D node={node} projector={projector} />;
        case 'text':
            return <Text3D node={node} projector={projector} />;
        case 'sprite-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Sprite3D key={i} node={item} projector={projector} />
                    ))}
                </>
            );
        case 'shape-layer':
            return (
                <>
                    {node.items.map((item, i) => (
                        <Shape3D key={i} node={item} projector={projector} />
                    ))}
                </>
            );
    }
}

export default Drawable3D;
