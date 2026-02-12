/**
 * FeatureRenderer3D
 *
 * Renders 3D features with GLB model loading from CDN.
 * Supports assetUrl property on features for external model loading.
 *
 * @packageDocumentation
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { IsometricFeature } from '../../types/isometric';

export interface FeatureRenderer3DProps {
    /** Array of features to render */
    features: IsometricFeature[];
    /** Grid cell size */
    cellSize?: number;
    /** Grid offset X */
    offsetX?: number;
    /** Grid offset Z */
    offsetZ?: number;
    /** Called when feature is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when feature is hovered */
    onFeatureHover?: (feature: IsometricFeature | null) => void;
    /** Selected feature IDs */
    selectedFeatureIds?: string[];
}

interface FeatureModelProps {
    feature: IsometricFeature;
    position: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
    onHover: (hovered: boolean) => void;
}

/**
 * Individual feature with 3D model loading
 */
function FeatureModel({
    feature,
    position,
    isSelected,
    onClick,
    onHover,
}: FeatureModelProps): JSX.Element | null {
    const groupRef = useRef<THREE.Group>(null);
    
    // Load GLB model if assetUrl is provided
    const { scene } = useGLTF(feature.assetUrl || '', true);
    
    // Clone the scene for this instance
    const model = useMemo(() => {
        if (!scene) return null;
        const cloned = scene.clone();
        
        // Adjust model scale and rotation
        cloned.scale.setScalar(0.5); // Adjust based on model size
        cloned.rotation.y = -Math.PI / 4; // Isometric alignment
        
        // Enable shadows
        cloned.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return cloned;
    }, [scene]);

    // Idle animation
    useFrame((state) => {
        if (groupRef.current && isSelected) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 - Math.PI / 4;
        }
    });

    if (!model && !feature.assetUrl) {
        // Fallback to primitive geometry if no asset URL
        return (
            <group
                position={position}
                onClick={onClick}
                onPointerEnter={() => onHover(true)}
                onPointerLeave={() => onHover(false)}
                userData={{ type: 'feature', featureId: feature.id, featureType: feature.type }}
            >
                {isSelected && (
                    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.4, 0.5, 32]} />
                        <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                    </mesh>
                )}
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color={0x888888} />
                </mesh>
            </group>
        );
    }

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={onClick}
            onPointerEnter={() => onHover(true)}
            onPointerLeave={() => onHover(false)}
            userData={{ type: 'feature', featureId: feature.id, featureType: feature.type }}
        >
            {/* Selection ring */}
            {isSelected && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.5, 32]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
                </mesh>
            )}

            {/* Shadow plane */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.35, 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* 3D Model */}
            {model && <primitive object={model} />}
        </group>
    );
}

/**
 * FeatureRenderer3D Component
 *
 * Renders 3D features with GLB model loading support.
 *
 * @example
 * ```tsx
 * <FeatureRenderer3D
 *     features={[
 *         { id: 'gate', x: 0, y: 0, type: 'gate', assetUrl: 'https://.../gate.glb' }
 *     ]}
 *     cellSize={1}
 * />
 * ```
 */
export function FeatureRenderer3D({
    features,
    cellSize = 1,
    offsetX = 0,
    offsetZ = 0,
    onFeatureClick,
    onFeatureHover,
    selectedFeatureIds = [],
}: FeatureRenderer3DProps): JSX.Element {
    return (
        <group>
            {features.map((feature) => {
                const x = (feature.x - offsetX) * cellSize;
                const z = ((feature.z ?? feature.y ?? 0) - offsetZ) * cellSize;
                const y = (feature.elevation ?? 0) * 0.1;

                const isSelected = feature.id ? selectedFeatureIds.includes(feature.id) : false;

                return (
                    <FeatureModel
                        key={feature.id ?? `feature-${feature.x}-${feature.y}`}
                        feature={feature}
                        position={[x, y, z]}
                        isSelected={isSelected}
                        onClick={() => onFeatureClick?.(feature)}
                        onHover={(hovered) => onFeatureHover?.(hovered ? feature : null)}
                    />
                );
            })}
        </group>
    );
}

export default FeatureRenderer3D;

// Preload function for storybook
export function preloadFeatures(urls: string[]) {
    urls.forEach(url => {
        if (url) useGLTF.preload(url);
    });
}
