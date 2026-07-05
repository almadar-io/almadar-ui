'use client';
/**
 * R3F mesh backends for the neutral drawable atoms — the 3D twin of the atoms'
 * 2D `paint*` fns. Kept HERE (not in the atom files) so the `three`/`drei`/`fiber`
 * dependency stays out of the 2D paint path; only the 3D dispatcher `Drawable3D`
 * (→ used by `GameCanvas3D`, itself in the code-split 3D surface) imports this.
 * Each mesh consumes the SAME descriptor as its 2D painter, so canvas-2d and
 * canvas-3d render the same `children`.
 */
import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { DrawSpriteProps } from '../../components/game/atoms/DrawSprite';
import type { DrawShapeProps } from '../../components/game/atoms/DrawShape';
import type { DrawTextProps } from '../../components/game/atoms/DrawText';
import type { Projector3D } from './projector3d';
import { ModelLoader } from '../../components/game/3d/molecules/ModelLoader';

/**
 * 2D-sprite-as-billboard 3D path. Crops UVs to `node.frame` when present.
 * Atlas-name resolution (`asset.atlas`/`asset.sprite` → sub-rect) is deferred
 * to P6 for the 3D path — a tracked follow-up, not a silent drop; until then
 * an atlas-only asset without an explicit `frame` renders the whole sheet.
 */
function SpriteBillboard({ node, world }: { node: DrawSpriteProps; world: [number, number, number] }): React.JSX.Element {
    const texture = useLoader(THREE.TextureLoader, node.asset.url);
    const img = texture.image as { width?: number; height?: number } | undefined;
    const imgW = img?.width || 1;
    const imgH = img?.height || 1;

    if (node.frame) {
        texture.repeat.set(node.frame.w / imgW, node.frame.h / imgH);
        texture.offset.set(node.frame.x / imgW, 1 - (node.frame.y + node.frame.h) / imgH);
        texture.magFilter = texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
    }

    const aspect = node.frame ? node.frame.w / node.frame.h : imgW / imgH;
    const height = node.height ?? 1;
    const width = node.width ?? height * aspect;

    return (
        <Billboard position={[world[0], world[1] + height / 2, world[2]]}>
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    opacity={node.opacity ?? 1}
                />
            </mesh>
        </Billboard>
    );
}

/** R3F mesh backend for `draw-sprite`: a GLB via `ModelLoader` when `asset.dimension === '3d'`; else a billboard. */
export function Sprite3D({ node, projector }: { node: DrawSpriteProps; projector: Projector3D }): React.JSX.Element | null {
    if (node.asset.dimension === '3d' && node.asset.url) {
        return (
            <group position={projector.toWorld(node.position)}>
                <ModelLoader
                    url={node.asset.url}
                    scale={node.width ?? projector.cellSize}
                    rotation={[0, node.rotation ?? 0, 0]}
                    fallbackGeometry="box"
                    castShadow
                    receiveShadow
                />
            </group>
        );
    }
    if (!node.asset.url) return null;
    return <SpriteBillboard node={node} world={projector.toWorld(node.position)} />;
}

/** R3F mesh backend for `draw-shape`: a flat mesh on the ground plane. */
export function Shape3D({ node, projector }: { node: DrawShapeProps; projector: Projector3D }): React.JSX.Element | null {
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

/** R3F mesh backend for `draw-text`: a billboarded drei `<Text>` above the scene position. */
export function Text3D({ node, projector }: { node: DrawTextProps; projector: Projector3D }): React.JSX.Element | null {
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
