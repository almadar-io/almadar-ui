/**
 * Trait Wars Castle Types
 *
 * Castle faction definitions and strategic layer types for HoMM3-style gameplay.
 */

import { Building, BuildingType, ResourceCost, ResourceIncome } from './resources';

// ============================================================================
// CASTLE FACTIONS
// ============================================================================

/** Castle faction identifiers */
export type CastleFaction = 'resonator' | 'dominion' | 'neutral';

/** Castle faction display info */
export interface CastleFactionInfo {
    id: CastleFaction;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    style: string;
}

/** Castle building slot positions (for visual placement) */
export interface BuildingSlot {
    id: string;
    buildingType?: BuildingType;
    position: { x: number; y: number };
    size: 'small' | 'medium' | 'large';
}

/** Extended castle data with faction and visual info */
export interface StrategicCastle {
    id: string;
    name: string;
    faction: CastleFaction;
    owner: 'player' | 'enemy' | 'neutral';
    buildings: CastleBuilding[];
    garrison: GarrisonUnit[];
    defense: number;
    income: ResourceIncome;
    /** Visual slot positions for buildings */
    buildingSlots: BuildingSlot[];
}

/** Building with faction-specific info */
export interface CastleBuilding extends Building {
    /** Visual slot ID where building is placed */
    slotId?: string;
    /** Faction-specific variant */
    factionVariant?: CastleFaction;
}

/** Unit in garrison */
export interface GarrisonUnit {
    id: string;
    unitType: string;
    name: string;
    tier: 1 | 2 | 3 | 4;
    count: number;
    spriteId: string;
}

// ============================================================================
// FACTION DEFINITIONS
// ============================================================================

export const CASTLE_FACTIONS: Record<CastleFaction, CastleFactionInfo> = {
    resonator: {
        id: 'resonator',
        name: 'Resonator Citadel',
        description: 'Crystalline structures that amplify resonance energy. Home to the awakened machines.',
        colors: {
            primary: '#7c3aed',    // Purple
            secondary: '#06b6d4',  // Cyan
            accent: '#f0abfc',     // Light purple glow
        },
        style: 'crystalline',
    },
    dominion: {
        id: 'dominion',
        name: 'Dominion Fortress',
        description: 'Industrial strongholds of the machine empire. Enforces order through sheer might.',
        colors: {
            primary: '#dc2626',    // Red
            secondary: '#1c1917',  // Black
            accent: '#fbbf24',     // Gold trim
        },
        style: 'industrial',
    },
    neutral: {
        id: 'neutral',
        name: 'Neutral Outpost',
        description: 'Repurposed structures built from salvage. Refuge for the unaligned.',
        colors: {
            primary: '#78716c',    // Stone gray
            secondary: '#a16207',  // Brown
            accent: '#84cc16',     // Green (scrap)
        },
        style: 'makeshift',
    },
};

// ============================================================================
// FACTION-SPECIFIC BUILDINGS
// ============================================================================

/** Buildings available per faction */
export const FACTION_BUILDINGS: Record<CastleFaction, BuildingType[]> = {
    resonator: [
        'townHall',
        'resonanceWell',
        'traitForge',
        'arcaneTower',
        'library',
        'portal',
    ],
    dominion: [
        'townHall',
        'barracks',
        'stables',
        'fortress',
        'marketplace',
        'treasury',
    ],
    neutral: [
        'townHall',
        'marketplace',
        'barracks',
        'treasury',
    ],
};

/** Faction-themed building names */
export const FACTION_BUILDING_NAMES: Record<CastleFaction, Partial<Record<BuildingType, string>>> = {
    resonator: {
        townHall: 'Crystal Nexus',
        resonanceWell: 'Harmonic Well',
        traitForge: 'Trait Synthesizer',
        arcaneTower: 'Prismatic Spire',
        library: 'Memory Archive',
        portal: 'Dimensional Rift',
    },
    dominion: {
        townHall: 'Command Center',
        barracks: 'Military Complex',
        stables: 'Mech Bay',
        fortress: 'Siege Bastion',
        marketplace: 'Supply Depot',
        treasury: 'Resource Vault',
    },
    neutral: {
        townHall: 'Trading Hub',
        marketplace: 'Scrap Exchange',
        barracks: 'Mercenary Camp',
        treasury: 'Salvage Vault',
    },
};

// ============================================================================
// WORLD MAP HEX TYPES
// ============================================================================

/** Hex tile feature overlays (on top of terrain) */
export type HexFeatureType =
    | 'none'
    | 'goldMine'
    | 'resonanceCrystal'
    | 'traitCache'
    | 'salvageYard'
    | 'portal'
    | 'treasure'
    | 'castle'
    | 'battleMarker'
    | 'hero';

/** Hex tile on world map */
export interface WorldMapHex {
    x: number;
    y: number;
    terrain: 'grass' | 'dirt' | 'stone' | 'water' | 'lava' | 'ice';
    feature?: HexFeatureType;
    /** Feature-specific data */
    featureData?: {
        /** For resources */
        resourceType?: string;
        resourceAmount?: number;
        /** For castles */
        castleId?: string;
        /** For heroes */
        heroId?: string;
        owner?: 'player' | 'enemy' | 'neutral';
        /** For fog of war */
        explored?: boolean;
    };
    /** Movement cost modifier */
    movementCost: number;
    /** Can units pass through */
    passable: boolean;
}

/** Hero on world map */
export interface WorldMapHero {
    id: string;
    name: string;
    archetype: string;
    owner: 'player' | 'enemy';
    position: { x: number; y: number };
    movement: number;
    maxMovement: number;
    army: GarrisonUnit[];
    level: number;
    /** Sprite for map display */
    spriteId: string;
}

/** Complete world map state */
export interface StrategicWorldMap {
    id: string;
    name: string;
    width: number;
    height: number;
    hexes: WorldMapHex[];
    heroes: WorldMapHero[];
    castles: StrategicCastle[];
    playerFaction: CastleFaction;
    enemyFaction: CastleFaction;
    turnNumber: number;
    currentPlayer: 'player' | 'enemy';
}

// ============================================================================
// UNIT RECRUITMENT
// ============================================================================

/** Unit available for recruitment */
export interface RecruitableUnit {
    id: string;
    name: string;
    tier: 1 | 2 | 3 | 4;
    cost: ResourceCost;
    available: number;
    maxPerTurn: number;
    spriteId: string;
    stats: {
        health: number;
        attack: number;
        defense: number;
        speed: number;
    };
    trait: string;
    description: string;
}

/** Units recruitale per faction */
export const FACTION_UNITS: Record<CastleFaction, string[]> = {
    resonator: [
        'worker',      // Tier 1
        'mender',      // Tier 1
        'resonator',   // Tier 3
        'archivist',   // Tier 4
    ],
    dominion: [
        'scrapper',    // Tier 1
        'guardian',    // Tier 2
        'breaker',     // Tier 2
        'conductor',   // Tier 4
    ],
    neutral: [
        'worker',
        'scrapper',
        'strider',
    ],
};

// ============================================================================
// MOVEMENT & PATHFINDING
// ============================================================================

/** Movement path on hex grid */
export interface MovementPath {
    hexes: Array<{ x: number; y: number }>;
    totalCost: number;
}

/** Calculate hex distance (axial coordinates) */
export function hexDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.max(
        Math.abs(a.x - b.x),
        Math.abs(a.y - b.y),
        Math.abs((a.x + a.y) - (b.x + b.y))
    );
}

/** Get adjacent hex positions */
export function getAdjacentHexes(x: number, y: number): Array<{ x: number; y: number }> {
    // Offset coordinates for hex grid
    return [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
    ];
}

/** Check if hex is within movement range */
export function isInMovementRange(
    from: { x: number; y: number },
    to: { x: number; y: number },
    movement: number
): boolean {
    return hexDistance(from, to) <= movement;
}
