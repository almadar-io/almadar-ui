'use client';
/**
 * Sprite3D
 *
 * R3F renderer for the neutral `sprite` drawable. Consumes the SAME
 * `SpriteDrawable` descriptor as the 2D painter (`./sprite`) but renders a
 * three.js mesh instead of painting: a GLB via `ModelLoader` when the asset is
 * `dimension: '3d'`, otherwise a billboarded plane cropped to `node.frame` (or
 * the whole texture) — mirroring `SpriteBillboard3D`'s UV crop math. `useLoader`
 * is a hook, so the texture path is split into its own sub-component
 * (`SpriteBillboard`) — `Sprite3D` only decides which path to mount.
 *
 * @packageDocumentation
 */

import React from 'react';
import { Billboard } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ModelLoader } from '../3d/molecules/ModelLoader';
import type { SpriteDrawable } from './sprite';
import type { Projector3D } from './projector3d';

export interface Sprite3DProps {
    node: SpriteDrawable;
    projector: Projector3D;
}

interface SpriteBillboardProps {
    node: SpriteDrawable;
    world: [number, number, number];
}

/**
 * 2D-sprite-as-billboard path. Crops UVs to `node.frame` when present.
 * Atlas-name resolution (`asset.atlas`/`asset.sprite` → sub-rect) is deferred
 * to P6 for the 3D path — a tracked follow-up, not a silent drop; until then
 * an atlas-only asset without an explicit `frame` renders the whole sheet.
 */
function SpriteBillboard({ node, world }: SpriteBillboardProps): React.JSX.Element {
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

/** Model path (GLB) when `node.asset.dimension === '3d'`; otherwise the billboard path. */
export function Sprite3D({ node, projector }: Sprite3DProps): React.JSX.Element | null {
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

export default Sprite3D;
