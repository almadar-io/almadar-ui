'use client';
/**
 * Text3D — billboarded text drawable for the neutral `text` atom in R3F.
 * Consumes the same TextDrawable descriptor as the 2D painter.
 */

import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import type { TextDrawable } from './text';
import type { Projector3D } from './projector3d';

export interface Text3DProps {
    node: TextDrawable;
    projector: Projector3D;
}

export function Text3D({ node, projector }: Text3DProps): React.JSX.Element | null {
    const world = projector.toWorld(node.position);

    return (
        <Billboard position={[world[0], world[1] + 1.2, world[2]]}>
            <Text
                fontSize={0.32}
                color={node.color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {node.text}
            </Text>
        </Billboard>
    );
}

export default Text3D;
