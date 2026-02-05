/**
 * Trait Wars Resource Types
 *
 * Economic system for the strategic layer.
 */

/** Resource types in the game */
export type ResourceType = 'gold' | 'resonance' | 'traitShards' | 'wood' | 'stone' | 'crystal';

/** Resource amounts */
export interface Resources {
    gold: number;
    resonance: number;
    traitShards: number;
    wood?: number;
    stone?: number;
    crystal?: number;
}

/** Daily income from buildings/territories */
export interface ResourceIncome {
    gold: number;
    resonance: number;
    traitShards: number;
}

/** Cost for an action (building, unit, upgrade) */
export interface ResourceCost {
    gold?: number;
    resonance?: number;
    traitShards?: number;
    wood?: number;
    stone?: number;
    crystal?: number;
}

/** Building types in castles */
export type BuildingType =
    | 'townHall'       // Main building, unlocks others
    | 'barracks'       // Recruit basic units
    | 'stables'        // Recruit cavalry
    | 'arcaneTower'    // Recruit mages
    | 'traitForge'     // Create/upgrade traits
    | 'resonanceWell'  // Generate resonance
    | 'treasury'       // Increase gold storage
    | 'fortress'       // Defense bonus
    | 'marketplace'    // Trade resources
    | 'library'        // Research upgrades
    | 'portal'         // Fast travel;

/** Building definition */
export interface Building {
    id: string;
    type: BuildingType;
    name: string;
    level: number;
    maxLevel: number;
    description: string;
    cost: ResourceCost;
    income?: ResourceIncome;
    unlocks?: BuildingType[];
    requirements?: BuildingType[];
}

/** Castle data */
export interface CastleData {
    id: string;
    name: string;
    owner: 'player' | 'enemy' | 'neutral';
    buildings: Building[];
    garrisonSize: number;
    maxGarrison: number;
    defense: number;
}

/** Map location types */
export type MapLocationType = 'city' | 'castle' | 'dungeon' | 'resource' | 'battle' | 'treasure' | 'portal';

/** Map node data */
export interface MapNodeData {
    id: string;
    type: MapLocationType;
    name: string;
    x: number;
    y: number;
    visited: boolean;
    accessible: boolean;
    owner?: 'player' | 'enemy' | 'neutral';
    connectedTo: string[];
    /** For resource nodes */
    resourceType?: ResourceType;
    resourceAmount?: number;
    /** For battle nodes */
    enemyStrength?: number;
    /** For castle nodes */
    castle?: CastleData;
}

/** World map data */
export interface WorldMapData {
    id: string;
    name: string;
    nodes: MapNodeData[];
    playerPosition: string;
    enemyPositions: { heroId: string; nodeId: string }[];
    turnNumber: number;
}

/** Resource display info */
export const RESOURCE_INFO: Record<ResourceType, { icon: string; color: string; name: string }> = {
    gold: { icon: '🪙', color: '#eab308', name: 'Gold' },
    resonance: { icon: '🔮', color: '#a855f7', name: 'Resonance' },
    traitShards: { icon: '💎', color: '#3b82f6', name: 'Trait Shards' },
    wood: { icon: '🪵', color: '#84cc16', name: 'Wood' },
    stone: { icon: '🪨', color: '#6b7280', name: 'Stone' },
    crystal: { icon: '💠', color: '#06b6d4', name: 'Crystal' },
};

/** Building costs */
export const BUILDING_COSTS: Record<BuildingType, ResourceCost> = {
    townHall: { gold: 500 },
    barracks: { gold: 200, wood: 50 },
    stables: { gold: 400, wood: 100 },
    arcaneTower: { gold: 600, crystal: 50 },
    traitForge: { gold: 800, traitShards: 10 },
    resonanceWell: { gold: 500, crystal: 30 },
    treasury: { gold: 300 },
    fortress: { gold: 1000, stone: 200 },
    marketplace: { gold: 250 },
    library: { gold: 400, crystal: 20 },
    portal: { gold: 1500, crystal: 100, resonance: 50 },
};

/** Check if player can afford a cost */
export function canAfford(resources: Resources, cost: ResourceCost): boolean {
    return (
        (cost.gold ?? 0) <= resources.gold &&
        (cost.resonance ?? 0) <= resources.resonance &&
        (cost.traitShards ?? 0) <= resources.traitShards &&
        (cost.wood ?? 0) <= (resources.wood ?? 0) &&
        (cost.stone ?? 0) <= (resources.stone ?? 0) &&
        (cost.crystal ?? 0) <= (resources.crystal ?? 0)
    );
}

/** Subtract cost from resources */
export function spendResources(resources: Resources, cost: ResourceCost): Resources {
    return {
        gold: resources.gold - (cost.gold ?? 0),
        resonance: resources.resonance - (cost.resonance ?? 0),
        traitShards: resources.traitShards - (cost.traitShards ?? 0),
        wood: (resources.wood ?? 0) - (cost.wood ?? 0),
        stone: (resources.stone ?? 0) - (cost.stone ?? 0),
        crystal: (resources.crystal ?? 0) - (cost.crystal ?? 0),
    };
}

/** Add income to resources */
export function addIncome(resources: Resources, income: ResourceIncome): Resources {
    return {
        ...resources,
        gold: resources.gold + income.gold,
        resonance: resources.resonance + income.resonance,
        traitShards: resources.traitShards + income.traitShards,
    };
}
