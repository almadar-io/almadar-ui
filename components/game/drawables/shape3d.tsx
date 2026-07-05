'use client';
/**
 * `Shape3D` — the R3F twin of `paintShape` (`./shape`): consumes the SAME
 * `ShapeDrawable` descriptor and renders a flat mesh on the ground plane.
 */
import React from 'react';
import * as THREE from 'three';
import type { ShapeDrawable } from './shape';
import type { Projector3D } from './projector3d';

export interface Shape3DProps {
    node: ShapeDrawable;
    projector: Projector3D;
}

export function Shape3D({ node, projector }: Shape3DProps): React.JSX.Element | null {
    const world = projector.toWorld(node.position);
    const color = node.fill ?? node.stroke ?? '#ffffff';

    let geometry: React.JSX.Element;
    switch (node.shape) {
        case 'cell':
        case 'rect': {
            const w = node.shape === 'cell' ? projector.cellSize * 0.95 : node.width ?? projector.cellSize;
            const h = node.shape === 'cell' ? projector.cellSize * 0.95 : node.height ?? projector.cellSize;
            geometry = <planeGeometry args={[w, h]} />;
            break;
        }
        case 'ellipse': {
            const radiusX = node.radiusX ?? 0.4;
            geometry =
                node.stroke && !node.fill ? (
                    <ringGeometry args={[Math.max(0, radiusX - 0.08), radiusX, 32]} />
                ) : (
                    <circleGeometry args={[radiusX, 32]} />
                );
            break;
        }
        case 'poly': {
            if (!node.points || node.points.length === 0) return null;
            const s = new THREE.Shape();
            node.points.forEach((p, i) => {
                if (i === 0) s.moveTo(p.x, p.y);
                else s.lineTo(p.x, p.y);
            });
            s.closePath();
            geometry = <shapeGeometry args={[s]} />;
            break;
        }
        default:
            return null;
    }

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[world[0], world[1] + 0.02, world[2]]}>
            {geometry}
            <meshBasicMaterial color={color} transparent opacity={node.opacity ?? 1} side={THREE.DoubleSide} />
        </mesh>
    );
}

export default Shape3D;
