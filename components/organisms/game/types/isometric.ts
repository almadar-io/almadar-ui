/**
 * Isometric Game Types
 *
 * Type definitions for isometric grid rendering: tiles, units, features.
 * Used by IsometricCanvas and game hooks.
 *
 * @packageDocumentation
 */

// =============================================================================
// Tile Types
// =============================================================================

/** A single isometric tile on the grid */
export interface IsometricTile {
    /** Grid x coordinate */
    x: number;
    /** Grid y coordinate */
    y: number;
    /** Terrain type key (e.g., 'grass', 'stone', 'water') */
    terrain: string;
    /** Direct sprite URL override (bypasses getTerrainSprite resolver) */
    terrainSprite?: string;
    /** Whether units can traverse this tile (default true) */
    passable?: boolean;
    /** Movement cost for pathfinding (default 1) */
    movementCost?: number;
    /** Optional tile type for visual variants */
    tileType?: string;
}

// =============================================================================
// Unit Types
// =============================================================================

/** A unit positioned on the isometric grid */
export interface IsometricUnit {
    /** Unique unit identifier */
    id: string;
    /** Current grid position */
    position: { x: number; y: number };
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
    previousPosition?: { x: number; y: number };
}

// =============================================================================
// Feature Types
// =============================================================================

/** A map feature (resource, building, portal, etc.) */
export interface IsometricFeature {
    /** Grid x coordinate */
    x: number;
    /** Grid y coordinate */
    y: number;
    /** Feature type key (e.g., 'goldMine', 'castle', 'portal') */
    type: string;
    /** Direct sprite URL override (bypasses getFeatureSprite resolver) */
    sprite?: string;
}

// =============================================================================
// Camera Types
// =============================================================================

/** Camera state for pan/zoom */
export interface CameraState {
    /** Camera X offset in pixels */
    x: number;
    /** Camera Y offset in pixels */
    y: number;
    /** Zoom level (1.0 = 100%) */
    zoom: number;
}
