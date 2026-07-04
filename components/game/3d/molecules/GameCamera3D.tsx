'use client';
/**
 * GameCamera3D
 *
 * Camera-tracking helpers extracted from GameCanvas3D: an imperative-handle
 * position reporter, a smooth-follow camera for `follow`/`chase` modes, and a
 * lerped group wrapper for interpolated positions between LOLO tick snapshots.
 *
 * @packageDocumentation
 */

import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Reports the live camera position on every change (imperative handle integration). */
export function CameraController3D({
    onCameraChange,
}: {
    onCameraChange?: (pos: { x: number; y: number; z: number }) => void;
}): null {
    const { camera } = useThree();

    useEffect(() => {
        if (onCameraChange) {
            onCameraChange({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            });
        }
    }, [camera.position, onCameraChange]);

    return null;
}

/**
 * Camera that smooth-tracks a world-space target (side-view player or selected unit).
 * OrbitControls is disabled while following — the camera is authoritative.
 */
export function FollowCamera3D({
    target,
    offset,
}: {
    target: [number, number, number];
    offset: [number, number, number];
}): null {
    const { camera } = useThree();
    const look = useRef(new THREE.Vector3(target[0], target[1], target[2]));
    const goal = useRef(new THREE.Vector3());
    useFrame((_, delta) => {
        const t = Math.min(1, delta * 5);
        goal.current.set(target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]);
        camera.position.lerp(goal.current, t);
        look.current.lerp(goal.current.set(target[0], target[1], target[2]), t);
        camera.lookAt(look.current);
    });
    return null;
}

/**
 * Group that smooth-lerps toward its target position between LOLO tick snapshots
 * (the 3D analogue of Canvas2D's `interpolateUnits`). Disabled → snaps.
 */
export function LerpedGroup3D({
    target,
    enabled,
    children,
}: {
    target: [number, number, number];
    enabled: boolean;
    children: React.ReactNode;
}): React.JSX.Element {
    const ref = useRef<THREE.Group>(null);
    const goal = useRef(new THREE.Vector3());
    useFrame((_, delta) => {
        const g = ref.current;
        if (!g) return;
        goal.current.set(target[0], target[1], target[2]);
        if (enabled) g.position.lerp(goal.current, Math.min(1, delta * 10));
        else g.position.copy(goal.current);
    });
    return (
        <group ref={ref} position={target}>
            {children}
        </group>
    );
}
