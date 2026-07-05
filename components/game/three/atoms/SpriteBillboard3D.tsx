'use client';
/**
 * SpriteBillboard3D
 *
 * Billboarded sprite-sheet plane for a unit. Loads the atlas's PNG sheet as a
 * texture and crops a SINGLE frame via UV `repeat`/`offset`, advancing per
 * animation state. Mirrors the 2D canvas: one frame, never the whole sheet.
 *
 * @packageDocumentation
 */

import React, { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { ResolvedFrame } from '../../shared/spriteAnimationTypes';

export interface SpriteBillboard3DProps {
    sheetUrl: string;
    resolveFrame: () => ResolvedFrame | null;
    height?: number;
}

export function SpriteBillboard3D({
    sheetUrl,
    resolveFrame,
    height = 1.2,
}: SpriteBillboard3DProps): React.JSX.Element | null {
    const texture = useLoader(THREE.TextureLoader, sheetUrl);
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshBasicMaterial>(null);
    const [aspect, setAspect] = useState(1);

    useFrame(() => {
        const frame = resolveFrame();
        if (!frame || !texture.image) return;
        const imgW = texture.image.width as number;
        const imgH = texture.image.height as number;
        if (!imgW || !imgH) return;

        // Crop one frame: repeat = frame size / sheet size, offset from top-left.
        texture.repeat.set((frame.flipX ? -1 : 1) * (frame.sw / imgW), frame.sh / imgH);
        texture.offset.set(
            frame.flipX ? (frame.sx + frame.sw) / imgW : frame.sx / imgW,
            1 - (frame.sy + frame.sh) / imgH,
        );
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        const nextAspect = frame.sw / frame.sh;
        if (Math.abs(nextAspect - aspect) > 0.001) setAspect(nextAspect);

        if (matRef.current) matRef.current.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef} position={[0, height / 2, 0]}>
            <planeGeometry args={[height * aspect, height]} />
            <meshBasicMaterial
                ref={matRef}
                map={texture}
                transparent
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default SpriteBillboard3D;
