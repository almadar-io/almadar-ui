/**
 * Isometric Game Types
 *
 * Type definitions for isometric grid rendering: tiles, units, features.
 * Used by IsometricCanvas and game hooks.
 *
 * @packageDocumentation
 */
/** A single isometric tile on the grid */
interface IsometricTile {
    /** Optional unique identifier (required for 3D rendering) */
    id?: string;
    /** Grid x coordinate */
    x: number;
    /** Grid y coordinate (2D) */
    y: number;
    /** Grid z coordinate (3D alternative to y) */
    z?: number;
    /** Terrain type key (e.g., 'grass', 'stone', 'water') - 2D */
    terrain?: string;
    /** Tile type for visual rendering (3D) */
    type?: string;
    /** Direct sprite URL override (bypasses getTerrainSprite resolver) */
    terrainSprite?: string;
    /** Whether units can traverse this tile (default true) */
    passable?: boolean;
    /** Movement cost for pathfinding (default 1) */
    movementCost?: number;
    /** Optional tile type for visual variants */
    tileType?: string;
    /** Elevation offset for 3D rendering */
    elevation?: number;
}
/** A unit positioned on the isometric grid */
interface IsometricUnit {
    /** Unique unit identifier */
    id: string;
    /** Current grid position (2D format) */
    position?: {
        x: number;
        y: number;
    };
    /** Grid x coordinate (3D format) */
    x?: number;
    /** Grid y coordinate (3D format) */
    y?: number;
    /** Grid z coordinate (3D format) */
    z?: number;
    /** Static sprite URL (used when no sprite sheet animation) */
    sprite?: string;
    /** Unit archetype key for sprite resolution */
    unitType?: string;
    /** Hero identifier for sprite sheet lookup */
    heroId?: string;
    /** Display name rendered below the unit */
    name?: string;
    /** Team affiliation for coloring */
    team?: 'player' | 'enemy' | 'neutral';
    /** Faction for 3D rendering (player/enemy/neutral) */
    faction?: 'player' | 'enemy' | 'neutral';
    /** Current health */
    health?: number;
    /** Maximum health */
    maxHealth?: number;
    /** Trait attachments for state display */
    traits?: {
        name: string;
        currentState: string;
        states: string[];
        cooldown: number;
    }[];
    /** Previous position for movement trail ghost */
    previousPosition?: {
        x: number;
        y: number;
    };
    /** Elevation offset for 3D rendering */
    elevation?: number;
}
/** A map feature (resource, building, portal, etc.) */
interface IsometricFeature {
    /** Optional unique identifier (required for 3D rendering) */
    id?: string;
    /** Grid x coordinate */
    x: number;
    /** Grid y coordinate (2D) */
    y: number;
    /** Grid z coordinate (3D alternative to y) */
    z?: number;
    /** Feature type key (e.g., 'goldMine', 'castle', 'portal') */
    type: string;
    /** Direct sprite URL override (bypasses getFeatureSprite resolver) */
    sprite?: string;
    /** 3D model URL (GLB format) for GameCanvas3D */
    assetUrl?: string;
    /** Color override for 3D rendering */
    color?: string;
    /** Elevation offset for 3D rendering */
    elevation?: number;
}
/** Camera state for pan/zoom */
interface CameraState {
    /** Camera X offset in pixels */
    x: number;
    /** Camera Y offset in pixels */
    y: number;
    /** Zoom level (1.0 = 100%) */
    zoom: number;
}

export type { CameraState as C, IsometricTile as I, IsometricUnit as a, IsometricFeature as b };
