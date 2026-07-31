'use client';
/**
 * Mesh3D — the R3F backend for `draw-mesh`, the volumetric twin of `Shape3D`.
 *
 * Geometry: one parametric primitive per `shape`, sized in cells × `cellSize`.
 * `pivot: 'bottom'` (default) lifts the mesh by its half-height so it rests on
 * the ground plane of `position` (whose `z` is height in cells).
 * Material: data-driven kind → three material (standard/physical/toon/basic);
 * effective opacity = material × node × enclosing-group multiplier.
 * Outline: inverted hull — same geometry scaled out, unlit back-face shell.
 * Animation: per-mesh `useFrame` resolves `applyMeshAnimation` and mutates the
 * group/mesh/material refs directly — no React re-render, no host clock.
 */
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    applyMeshAnimation,
    clampSegments,
    isAnimatedMesh,
    type DrawMeshProps,
    type MeshMaterial,
    type MeshMaterialSide,
} from '../../../components/game/atoms/DrawMesh';
import type { Projector3D } from '../projector3d';
import { isValidScenePos } from '../contract';

interface MeshGeometry {
    /** The geometry element (centered at the origin, three convention). */
    element: React.JSX.Element;
    /** World-Y half-height used for `pivot: 'bottom'` grounding. */
    lift: number;
    /** Representative world size, used to scale the outline shell. */
    size: number;
}

/** Build the primitive geometry for a mesh descriptor. Sizes are cells × `cellSize`. */
function meshGeometry(node: DrawMeshProps, cellSize: number): MeshGeometry | null {
    const seg = clampSegments(node.segments);
    const r = (node.radius ?? 0.4) * cellSize;
    const w = (node.width ?? 1) * cellSize;
    const h = (node.height ?? 1) * cellSize;
    const d = (node.depth ?? node.width ?? 1) * cellSize;
    switch (node.shape) {
        case 'box':
            return { element: <boxGeometry args={[w, h, d]} />, lift: h / 2, size: Math.max(w, h, d) };
        case 'sphere':
            return { element: <sphereGeometry args={[r, seg, seg]} />, lift: r, size: r * 2 };
        case 'capsule':
            return { element: <capsuleGeometry args={[r, h, Math.max(2, Math.round(seg / 2)), seg]} />, lift: h / 2 + r, size: h + r * 2 };
        case 'cylinder':
            return {
                element: <cylinderGeometry args={[(node.radiusTop ?? node.radius ?? 0.4) * cellSize, (node.radiusBottom ?? node.radius ?? 0.4) * cellSize, h, seg]} />,
                lift: h / 2,
                size: Math.max(h, r * 2),
            };
        case 'cone':
            return { element: <coneGeometry args={[r, h, seg]} />, lift: h / 2, size: Math.max(h, r * 2) };
        case 'torus': {
            const tube = (node.tube ?? (node.radius ?? 0.4) / 3) * cellSize;
            return { element: <torusGeometry args={[r, tube, Math.max(3, Math.round(seg / 2)), seg]} />, lift: r + tube, size: (r + tube) * 2 };
        }
        case 'plane':
            return { element: <planeGeometry args={[w, d]} />, lift: 0, size: Math.max(w, d) };
        case 'circle':
            return { element: <circleGeometry args={[r, seg]} />, lift: 0, size: r * 2 };
        default:
            return null;
    }
}

const SIDE_MAP: Record<MeshMaterialSide, THREE.Side> = {
    front: THREE.FrontSide,
    back: THREE.BackSide,
    double: THREE.DoubleSide,
};

type MeshMaterialRef = React.Ref<THREE.Material & { color?: THREE.Color; emissive?: THREE.Color; emissiveIntensity?: number }>;

/** Material element for a mesh descriptor; `opacity` is the pre-multiplied effective value. */
function meshMaterial(mat: MeshMaterial | undefined, opacity: number, ref?: MeshMaterialRef): React.JSX.Element {
    const m = mat ?? {};
    const common = {
        ref,
        color: m.color ?? '#ffffff',
        transparent: opacity < 1,
        opacity,
        side: SIDE_MAP[m.side ?? 'front'],
    };
    const emissive = m.emissive
        ? { emissive: m.emissive, emissiveIntensity: m.emissiveIntensity ?? 1 }
        : {};
    switch (m.kind ?? 'standard') {
        case 'basic':
            return <meshBasicMaterial {...common} />;
        case 'toon':
            return <meshToonMaterial {...common} {...emissive} />;
        case 'physical':
            return (
                <meshPhysicalMaterial
                    {...common}
                    {...emissive}
                    metalness={m.metalness ?? 0}
                    roughness={m.roughness ?? 0.5}
                    transmission={m.transmission ?? 0}
                    ior={m.ior ?? 1.5}
                    flatShading={m.flatShading ?? false}
                />
            );
        case 'standard':
        default:
            return (
                <meshStandardMaterial
                    {...common}
                    {...emissive}
                    metalness={m.metalness ?? 0}
                    roughness={m.roughness ?? 0.5}
                    flatShading={m.flatShading ?? false}
                />
            );
    }
}

/** R3F mesh backend for `draw-mesh`: a lit parametric primitive at a scene position. */
export function Mesh3D({
    node,
    projector,
    groupOpacity = 1,
}: {
    node: DrawMeshProps;
    projector: Projector3D;
    groupOpacity?: number;
}): React.JSX.Element | null {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.Material & { color?: THREE.Color; emissive?: THREE.Color; emissiveIntensity?: number }>(null);
    const animated = isAnimatedMesh(node);
    const validPos = isValidScenePos(node.position);
    const baseWorld: [number, number, number] = validPos ? projector.toWorld(node.position) : [0, 0, 0];

    const geo = useMemo(() => meshGeometry(node, projector.cellSize), [node, projector.cellSize]);

    useFrame(({ clock }) => {
        if (!animated || !groupRef.current) return;
        const state = applyMeshAnimation(node, clock.elapsedTime * 1000);
        if (!state) return;
        const [wx, wy, wz] = baseWorld;
        // Scene-axis offsets project like ScenePos: x → world X, y → world Z, z → world Y.
        groupRef.current.position.set(
            wx + state.offset[0] * projector.cellSize,
            wy + state.offset[2] * projector.cellSize,
            wz + state.offset[1] * projector.cellSize,
        );
        groupRef.current.scale.setScalar(state.scale);
        if (meshRef.current) {
            const base = node.rotation ?? [0, 0, 0];
            meshRef.current.rotation.set(base[0] + state.rotate[0], base[1] + state.rotate[1], base[2] + state.rotate[2]);
        }
        const mat = materialRef.current;
        if (mat) {
            const effective =
                (state.opacity ?? node.opacity ?? 1) * (node.material?.opacity ?? 1) * groupOpacity;
            mat.opacity = effective;
            mat.transparent = effective < 1;
            if (state.color && mat.color) mat.color.set(state.color);
            if (state.emissive && mat.emissive) mat.emissive.set(state.emissive);
            if (state.emissiveIntensity !== undefined && mat.emissiveIntensity !== undefined) {
                mat.emissiveIntensity = state.emissiveIntensity;
            }
        }
    });

    if (!validPos || !geo) return null;
    const lift = (node.pivot ?? 'bottom') === 'bottom' ? geo.lift : 0;
    const opacity = (node.opacity ?? 1) * (node.material?.opacity ?? 1) * groupOpacity;
    const rotation = node.rotation ?? [0, 0, 0];
    const outlineScale = geo.size > 0 ? 1 + ((node.outline?.width ?? 0.05) * projector.cellSize) / geo.size : 1;

    return (
        <group ref={groupRef} position={baseWorld}>
            <mesh
                ref={meshRef}
                position={[0, lift, 0]}
                rotation={rotation}
                castShadow={node.castShadow ?? true}
                receiveShadow={node.receiveShadow ?? true}
            >
                {geo.element}
                {meshMaterial(node.material, opacity, materialRef)}
            </mesh>
            {node.outline && (
                <mesh position={[0, lift, 0]} rotation={rotation} scale={outlineScale}>
                    {geo.element}
                    <meshBasicMaterial
                        color={node.outline.color ?? '#101014'}
                        side={THREE.BackSide}
                        transparent={opacity < 1}
                        opacity={opacity}
                    />
                </mesh>
            )}
        </group>
    );
}

export default Mesh3D;
