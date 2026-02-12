/**
 * ModelLoader Component
 *
 * React Three Fiber component for loading and displaying GLB/GLTF models from URLs.
 * Handles loading states and errors without requiring React Suspense.
 *
 * @packageDocumentation
 */

import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export interface ModelLoaderProps {
    /** URL to the GLB/GLTF model */
    url: string;
    /** Position [x, y, z] */
    position?: [number, number, number];
    /** Scale - either a single number or [x, y, z] */
    scale?: number | [number, number, number];
    /** Rotation in degrees [x, y, z] */
    rotation?: [number, number, number];
    /** Whether the model is selected */
    isSelected?: boolean;
    /** Whether the model is hovered */
    isHovered?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Hover handler */
    onHover?: (hovered: boolean) => void;
    /** Fallback geometry type */
    fallbackGeometry?: 'box' | 'sphere' | 'cylinder' | 'none';
    /** Enable shadows */
    castShadow?: boolean;
    /** Receive shadows */
    receiveShadow?: boolean;
}

interface ModelLoadState {
    model: THREE.Group | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to load GLTF model without Suspense
 * Handles external texture references by resolving paths relative to the GLB file
 */
function useGLTFModel(url: string): ModelLoadState {
    const [state, setState] = useState<ModelLoadState>({
        model: null,
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!url) {
            setState({ model: null, isLoading: false, error: null });
            return;
        }

        console.log('[ModelLoader] Loading:', url);
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Create a loading manager to resolve relative texture paths
        const manager = new THREE.LoadingManager();

        // Extract base paths from the GLB URL
        // e.g. "https://host/3d/graveyard/altar-stone.glb"
        //   basePath  = "https://host/3d/graveyard/"
        //   parentPath = "https://host/3d/"
        const urlObj = new URL(url, window.location.href);
        const basePath = urlObj.href.substring(0, urlObj.href.lastIndexOf('/') + 1);
        const parentPath = basePath.slice(0, basePath.slice(0, -1).lastIndexOf('/') + 1);

        // Intercept texture loading to resolve paths correctly
        // Many asset packs (e.g. Kenney) share a Textures/ folder at the parent level,
        // not inside each model's subdirectory.
        manager.setURLModifier((textureUrl) => {
            if (!textureUrl.startsWith('http') && !textureUrl.startsWith('data:') && !textureUrl.startsWith('/')) {
                // Resolve relative to parent dir (where shared Textures/ folder lives)
                const resolvedUrl = parentPath + textureUrl;
                console.log('[ModelLoader] Resolving texture:', textureUrl, '->', resolvedUrl);
                return resolvedUrl;
            }
            return textureUrl;
        });

        // Create loader with the manager
        const loader = new GLTFLoader(manager);
        
        loader.load(
            url,
            (gltf) => {
                console.log('[ModelLoader] Loaded successfully:', url);
                setState({
                    model: gltf.scene,
                    isLoading: false,
                    error: null,
                });
            },
            // onProgress
            (progress) => {
                if (progress.total > 0) {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`[ModelLoader] ${url} - ${percent.toFixed(1)}%`);
                }
            },
            // onError
            (err) => {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error('[ModelLoader] Error loading', url, ':', errorMsg);
                setState({
                    model: null,
                    isLoading: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                });
            }
        );
    }, [url]);

    return state;
}

/**
 * ModelLoader component for rendering GLB models in React Three Fiber
 */
export function ModelLoader({
    url,
    position = [0, 0, 0],
    scale = 1,
    rotation = [0, 0, 0],
    isSelected = false,
    isHovered = false,
    onClick,
    onHover,
    fallbackGeometry = 'box',
    castShadow = true,
    receiveShadow = true,
}: ModelLoaderProps): JSX.Element {
    const { model: loadedModel, isLoading, error } = useGLTFModel(url);

    // Clone and prepare the model
    const model = useMemo(() => {
        if (!loadedModel) return null;
        const cloned = loadedModel.clone();

        // Apply shadow settings
        cloned.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = castShadow;
                child.receiveShadow = receiveShadow;
            }
        });

        return cloned;
    }, [loadedModel, castShadow, receiveShadow]);

    // Calculate scale array
    const scaleArray: [number, number, number] = useMemo(() => {
        if (typeof scale === 'number') {
            return [scale, scale, scale];
        }
        return scale;
    }, [scale]);

    // Calculate rotation in radians
    const rotationRad: [number, number, number] = useMemo(() => {
        return [
            (rotation[0] * Math.PI) / 180,
            (rotation[1] * Math.PI) / 180,
            (rotation[2] * Math.PI) / 180,
        ];
    }, [rotation]);

    // Show loading spinner
    if (isLoading) {
        return (
            <group position={position}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.3, 0.35, 16]} />
                    <meshBasicMaterial color="#4a90d9" transparent opacity={0.8} />
                </mesh>
            </group>
        );
    }

    // Show error fallback
    if (error || !model) {
        if (fallbackGeometry === 'none') {
            return <group position={position} />;
        }

        const fallbackProps = {
            onClick,
            onPointerOver: () => onHover?.(true),
            onPointerOut: () => onHover?.(false),
        };

        return (
            <group position={position}>
                {(isSelected || isHovered) && (
                    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.6, 0.7, 32]} />
                        <meshBasicMaterial
                            color={isSelected ? 0xffaa00 : 0xffffff}
                            transparent
                            opacity={0.5}
                        />
                    </mesh>
                )}
                {fallbackGeometry === 'box' && (
                    <mesh {...fallbackProps} position={[0, 0.5, 0]}>
                        <boxGeometry args={[0.8, 0.8, 0.8]} />
                        <meshStandardMaterial color={error ? 0xff4444 : 0x888888} />
                    </mesh>
                )}
                {fallbackGeometry === 'sphere' && (
                    <mesh {...fallbackProps} position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.4, 16, 16]} />
                        <meshStandardMaterial color={error ? 0xff4444 : 0x888888} />
                    </mesh>
                )}
                {fallbackGeometry === 'cylinder' && (
                    <mesh {...fallbackProps} position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
                        <meshStandardMaterial color={error ? 0xff4444 : 0x888888} />
                    </mesh>
                )}
            </group>
        );
    }

    return (
        <group
            position={position}
            rotation={rotationRad}
            onClick={onClick}
            onPointerOver={() => onHover?.(true)}
            onPointerOut={() => onHover?.(false)}
        >
            {/* Selection/hover ring */}
            {(isSelected || isHovered) && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.6, 0.7, 32]} />
                    <meshBasicMaterial
                        color={isSelected ? 0xffaa00 : 0xffffff}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            )}

            {/* The loaded model */}
            <primitive object={model} scale={scaleArray} />
        </group>
    );
}

export default ModelLoader;
