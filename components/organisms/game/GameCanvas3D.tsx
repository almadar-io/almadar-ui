/**
 * GameCanvas3D
 *
 * 3D game canvas component using Three.js.
 * Mirrors the IsometricCanvas API for easy migration.
 *
 * @packageDocumentation
 */

import React, {
    useEffect,
    useRef,
    useCallback,
    useState,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Grid } from '@react-three/drei';
import { AssetLoader, assetLoader } from './three/loaders/AssetLoader';
import type {
    IsometricTile,
    IsometricUnit,
    IsometricFeature,
    GameEvent,
    ClosedCircuitProps,
} from '../../../types';
import './GameCanvas3D.css';

// Re-export types for convenience
export type { IsometricTile, IsometricUnit, IsometricFeature, GameEvent };

/** Camera mode for 3D view */
export type CameraMode = 'isometric' | 'perspective' | 'top-down';

/** Map orientation */
export type MapOrientation = 'standard' | 'rotated';

/** Overlay control */
export type OverlayControl = 'default' | 'hidden' | 'minimap';

/** Unit animation state */
export type UnitAnimationState = 'idle' | 'walk' | 'attack' | 'hurt' | 'die';

/** Props for GameCanvas3D component */
export interface GameCanvas3DProps extends ClosedCircuitProps<'game-canvas-3d'> {
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units to render */
    units?: IsometricUnit[];
    /** Array of features to render */
    features?: IsometricFeature[];
    /** Array of events to display */
    events?: GameEvent[];
    /** Fog of war data */
    fogOfWar?: boolean[][];
    /** Map orientation */
    orientation?: MapOrientation;
    /** Camera mode */
    cameraMode?: CameraMode;
    /** Show grid */
    showGrid?: boolean;
    /** Show coordinates overlay */
    showCoordinates?: boolean;
    /** Show tile information */
    showTileInfo?: boolean;
    /** Overlay control mode */
    overlay?: OverlayControl;
    /** Enable shadows */
    shadows?: boolean;
    /** Background color */
    backgroundColor?: string;
    /** Callback when a tile is clicked */
    onTileClick?: (tile: IsometricTile, event: React.MouseEvent) => void;
    /** Callback when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit, event: React.MouseEvent) => void;
    /** Callback when a feature is clicked */
    onFeatureClick?: (feature: IsometricFeature, event: React.MouseEvent) => void;
    /** Callback when canvas is clicked (background) */
    onCanvasClick?: (event: React.MouseEvent) => void;
    /** Callback when mouse moves over a tile */
    onTileHover?: (tile: IsometricTile | null, event: React.MouseEvent) => void;
    /** Callback for unit animation state change */
    onUnitAnimation?: (unitId: string, state: UnitAnimationState) => void;
    /** Asset loader instance (uses global singleton if not provided) */
    assetLoader?: AssetLoader;
    /** Custom tile renderer component */
    tileRenderer?: React.FC<{ tile: IsometricTile; position: [number, number, number] }>;
    /** Custom unit renderer component */
    unitRenderer?: React.FC<{ unit: IsometricUnit; position: [number, number, number] }>;
    /** Custom feature renderer component */
    featureRenderer?: React.FC<{ feature: IsometricFeature; position: [number, number, number] }>;
}

/** Grid configuration */
interface GridConfig {
    cellSize: number;
    offsetX: number;
    offsetZ: number;
}

/** Default grid config */
const DEFAULT_GRID_CONFIG: GridConfig = {
    cellSize: 1,
    offsetX: 0,
    offsetZ: 0,
};

/** Imperative handle for GameCanvas3D */
export interface GameCanvas3DHandle {
    /** Get current camera position */
    getCameraPosition: () => THREE.Vector3 | null;
    /** Set camera position */
    setCameraPosition: (x: number, y: number, z: number) => void;
    /** Look at a specific point */
    lookAt: (x: number, y: number, z: number) => void;
    /** Reset camera to default position */
    resetCamera: () => void;
    /** Take a screenshot */
    screenshot: () => string | null;
    /** Export current view as data */
    export: () => { tiles: IsometricTile[]; units: IsometricUnit[]; features: IsometricFeature[] };
}

/**
 * GameCanvas3D Component
 *
 * 3D game canvas that mirrors the IsometricCanvas API.
 * Uses Three.js and React Three Fiber for rendering.
 *
 * @example
 * ```tsx
 * <GameCanvas3D
 *   tiles={tiles}
 *   units={units}
 *   features={features}
 *   cameraMode="isometric"
 *   onTileClick={(tile) => console.log('Clicked:', tile)}
 * />
 * ```
 */
export const GameCanvas3D = forwardRef<GameCanvas3DHandle, GameCanvas3DProps>(
    (
        {
            tiles = [],
            units = [],
            features = [],
            events = [],
            orientation = 'standard',
            cameraMode = 'isometric',
            showGrid = true,
            showCoordinates = false,
            showTileInfo = false,
            overlay = 'default',
            shadows = true,
            backgroundColor = '#1a1a2e',
            onTileClick,
            onUnitClick,
            onFeatureClick,
            onCanvasClick,
            onTileHover,
            onUnitAnimation,
            assetLoader: customAssetLoader,
            tileRenderer: CustomTileRenderer,
            unitRenderer: CustomUnitRenderer,
            featureRenderer: CustomFeatureRenderer,
            className,
            isLoading,
            error,
            entity,
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const controlsRef = useRef<any>(null);
        const [hoveredTile, setHoveredTile] = useState<IsometricTile | null>(null);
        const [selectedTile, setSelectedTile] = useState<IsometricTile | null>(null);

        // Use custom or global asset loader
        const loader = customAssetLoader || assetLoader;

        // Calculate grid bounds
        const gridBounds = useMemo(() => {
            if (tiles.length === 0) {
                return { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
            }
            const xs = tiles.map((t) => t.x);
            const zs = tiles.map((t) => t.z || t.y || 0);
            return {
                minX: Math.min(...xs),
                maxX: Math.max(...xs),
                minZ: Math.min(...zs),
                maxZ: Math.max(...zs),
            };
        }, [tiles]);

        // Calculate camera target (center of grid)
        const cameraTarget = useMemo(() => {
            return [
                (gridBounds.minX + gridBounds.maxX) / 2,
                0,
                (gridBounds.minZ + gridBounds.maxZ) / 2,
            ] as [number, number, number];
        }, [gridBounds]);

        // Grid config
        const gridConfig = useMemo(
            () => ({
                ...DEFAULT_GRID_CONFIG,
                offsetX: -(gridBounds.maxX - gridBounds.minX) / 2,
                offsetZ: -(gridBounds.maxZ - gridBounds.minZ) / 2,
            }),
            [gridBounds]
        );

        // Convert grid coordinates to world position
        const gridToWorld = useCallback(
            (x: number, z: number, y: number = 0): [number, number, number] => {
                const worldX = (x - gridBounds.minX) * gridConfig.cellSize;
                const worldZ = (z - gridBounds.minZ) * gridConfig.cellSize;
                return [worldX, y * gridConfig.cellSize, worldZ];
            },
            [gridBounds, gridConfig]
        );

        // Imperative handle
        useImperativeHandle(ref, () => ({
            getCameraPosition: () => {
                // This will be populated from the R3F camera
                return null;
            },
            setCameraPosition: (x: number, y: number, z: number) => {
                // TODO: Implement camera control
            },
            lookAt: (x: number, y: number, z: number) => {
                if (controlsRef.current) {
                    controlsRef.current.target.set(x, y, z);
                }
            },
            resetCamera: () => {
                if (controlsRef.current) {
                    controlsRef.current.reset();
                }
            },
            screenshot: () => {
                // TODO: Implement screenshot
                return null;
            },
            export: () => ({
                tiles,
                units,
                features,
            }),
        }));

        // Handle tile click
        const handleTileClick = useCallback(
            (tile: IsometricTile) => {
                setSelectedTile(tile);
                onTileClick?.(tile, {} as React.MouseEvent);
            },
            [onTileClick]
        );

        // Camera configuration based on mode
        const cameraConfig = useMemo(() => {
            const size = Math.max(
                gridBounds.maxX - gridBounds.minX,
                gridBounds.maxZ - gridBounds.minZ
            );
            const distance = size * 1.5;

            switch (cameraMode) {
                case 'isometric':
                    return {
                        position: [distance, distance * 0.8, distance] as [number, number, number],
                        fov: 45,
                        orthographic: true,
                    };
                case 'top-down':
                    return {
                        position: [0, distance * 2, 0] as [number, number, number],
                        fov: 45,
                        orthographic: true,
                    };
                case 'perspective':
                default:
                    return {
                        position: [distance, distance, distance] as [number, number, number],
                        fov: 45,
                        orthographic: false,
                    };
            }
        }, [cameraMode, gridBounds]);

        // Default tile renderer
        const DefaultTileRenderer = useCallback(
            ({ tile, position }: { tile: IsometricTile; position: [number, number, number] }) => {
                const isSelected = selectedTile?.id === tile.id;
                const isHovered = hoveredTile?.id === tile.id;

                // Determine color based on tile type
                let color = 0x808080;
                if (tile.type === 'water') color = 0x4488cc;
                else if (tile.type === 'grass') color = 0x44aa44;
                else if (tile.type === 'sand') color = 0xddcc88;
                else if (tile.type === 'rock') color = 0x888888;
                else if (tile.type === 'snow') color = 0xeeeeee;

                // Highlight selection
                const emissive = isSelected ? 0x444444 : isHovered ? 0x222222 : 0;

                return (
                    <mesh
                        position={position}
                        onClick={() => handleTileClick(tile)}
                        onPointerEnter={() => setHoveredTile(tile)}
                        onPointerLeave={() => setHoveredTile(null)}
                    >
                        <boxGeometry args={[0.95, 0.2, 0.95]} />
                        <meshStandardMaterial color={color} emissive={emissive} />
                    </mesh>
                );
            },
            [selectedTile, hoveredTile, handleTileClick]
        );

        // Default unit renderer
        const DefaultUnitRenderer = useCallback(
            ({ unit, position }: { unit: IsometricUnit; position: [number, number, number] }) => {
                const color = unit.faction === 'player' ? 0x4488ff : 0xff4444;

                return (
                    <group position={position}>
                        {/* Base */}
                        <mesh position={[0, 0.3, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        {/* Body */}
                        <mesh position={[0, 0.6, 0]}>
                            <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        {/* Health bar */}
                        {unit.health !== undefined && unit.maxHealth !== undefined && (
                            <group position={[0, 1.2, 0]}>
                                <mesh position={[-0.25, 0, 0]}>
                                    <planeGeometry args={[0.5, 0.05]} />
                                    <meshBasicMaterial color={0x333333} />
                                </mesh>
                                <mesh
                                    position={[
                                        -0.25 +
                                            (0.5 * (unit.health / unit.maxHealth)) / 2,
                                        0,
                                        0,
                                    ]}
                                >
                                    <planeGeometry
                                        args={[0.5 * (unit.health / unit.maxHealth), 0.05]}
                                    />
                                    <meshBasicMaterial
                                        color={
                                            unit.health / unit.maxHealth > 0.5
                                                ? 0x44aa44
                                                : unit.health / unit.maxHealth > 0.25
                                                  ? 0xaaaa44
                                                  : 0xff4444
                                        }
                                    />
                                </mesh>
                            </group>
                        )}
                    </group>
                );
            },
            []
        );

        // Default feature renderer
        const DefaultFeatureRenderer = useCallback(
            ({
                feature,
                position,
            }: {
                feature: IsometricFeature;
                position: [number, number, number];
            }) => {
                // Simple tree representation
                if (feature.type === 'tree') {
                    return (
                        <group position={position}>
                            {/* Trunk */}
                            <mesh position={[0, 0.4, 0]}>
                                <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
                                <meshStandardMaterial color={0x8b4513} />
                            </mesh>
                            {/* Leaves */}
                            <mesh position={[0, 0.9, 0]}>
                                <coneGeometry args={[0.5, 0.8, 8]} />
                                <meshStandardMaterial color={0x228b22} />
                            </mesh>
                        </group>
                    );
                }

                // Simple rock representation
                if (feature.type === 'rock') {
                    return (
                        <mesh position={[position[0], position[1] + 0.3, position[2]]}>
                            <dodecahedronGeometry args={[0.3, 0]} />
                            <meshStandardMaterial color={0x808080} />
                        </mesh>
                    );
                }

                return null;
            },
            []
        );

        // Loading state
        if (isLoading) {
            return (
                <div className="game-canvas-3d game-canvas-3d--loading">
                    <div className="game-canvas-3d__loading">Loading 3D assets...</div>
                </div>
            );
        }

        // Error state
        if (error) {
            return (
                <div className="game-canvas-3d game-canvas-3d--error">
                    <div className="game-canvas-3d__error">Error: {error}</div>
                </div>
            );
        }

        return (
            <div
                ref={containerRef}
                className={`game-canvas-3d ${className || ''}`}
                data-orientation={orientation}
                data-camera-mode={cameraMode}
                data-overlay={overlay}
            >
                <Canvas
                    shadows={shadows}
                    camera={{
                        position: cameraConfig.position,
                        fov: cameraConfig.fov,
                        near: 0.1,
                        far: 1000,
                    }}
                    style={{ background: backgroundColor }}
                >
                    {/* Lighting */}
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[10, 20, 10]}
                        intensity={0.8}
                        castShadow={shadows}
                        shadow-mapSize={[2048, 2048]}
                    />

                    {/* Grid */}
                    {showGrid && (
                        <Grid
                            args={[
                                Math.max(gridBounds.maxX - gridBounds.minX + 2, 10),
                                Math.max(gridBounds.maxZ - gridBounds.minZ + 2, 10),
                            ]}
                            position={[
                                (gridBounds.maxX - gridBounds.minX) / 2 - 0.5,
                                0,
                                (gridBounds.maxZ - gridBounds.minZ) / 2 - 0.5,
                            ]}
                            cellSize={1}
                            cellThickness={1}
                            cellColor="#444444"
                            sectionSize={5}
                            sectionThickness={1.5}
                            sectionColor="#666666"
                            fadeDistance={50}
                            fadeStrength={1}
                        />
                    )}

                    {/* Tiles */}
                    {tiles.map((tile) => {
                        const position = gridToWorld(
                            tile.x,
                            tile.z ?? tile.y ?? 0,
                            tile.elevation ?? 0
                        );
                        const Renderer = CustomTileRenderer || DefaultTileRenderer;
                        return <Renderer key={tile.id} tile={tile} position={position} />;
                    })}

                    {/* Features */}
                    {features.map((feature) => {
                        const position = gridToWorld(
                            feature.x,
                            feature.z ?? feature.y ?? 0,
                            (feature.elevation ?? 0) + 0.5
                        );
                        const Renderer = CustomFeatureRenderer || DefaultFeatureRenderer;
                        return <Renderer key={feature.id} feature={feature} position={position} />;
                    })}

                    {/* Units */}
                    {units.map((unit) => {
                        const position = gridToWorld(
                            unit.x,
                            unit.z ?? unit.y ?? 0,
                            (unit.elevation ?? 0) + 0.5
                        );
                        const Renderer = CustomUnitRenderer || DefaultUnitRenderer;
                        return <Renderer key={unit.id} unit={unit} position={position} />;
                    })}

                    {/* Camera controls */}
                    <OrbitControls
                        ref={controlsRef}
                        target={cameraTarget}
                        enableDamping
                        dampingFactor={0.05}
                        minDistance={2}
                        maxDistance={100}
                        maxPolarAngle={Math.PI / 2 - 0.1}
                    />
                </Canvas>

                {/* Coordinate overlay */}
                {showCoordinates && hoveredTile && (
                    <div className="game-canvas-3d__coordinates">
                        X: {hoveredTile.x}, Z: {hoveredTile.z ?? hoveredTile.y ?? 0}
                    </div>
                )}

                {/* Tile info overlay */}
                {showTileInfo && hoveredTile && (
                    <div className="game-canvas-3d__tile-info">
                        <div className="tile-info__type">{hoveredTile.type}</div>
                        {hoveredTile.terrain && (
                            <div className="tile-info__terrain">{hoveredTile.terrain}</div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

GameCanvas3D.displayName = 'GameCanvas3D';

export default GameCanvas3D;
