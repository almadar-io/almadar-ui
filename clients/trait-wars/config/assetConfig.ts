/**
 * Asset Configuration for Trait Wars Strategic Layer
 * 
 * Maps sprite IDs to actual asset paths for world map, heroes, and units.
 * Assets are in the Kenney Isometric Dungeon style with Dune/Book of Kells aesthetic for heroes.
 */

// Base path for assets - relative to the trait-wars package
const ASSETS_BASE = '/assets/trait-wars';

// ============================================================================
// WORLD MAP FEATURE ASSETS
// ============================================================================

export const FEATURE_ASSETS: Record<string, string> = {
    // Resource nodes
    goldMine: `${ASSETS_BASE}/world-map/gold_mine.png`,
    resonanceCrystal: `${ASSETS_BASE}/world-map/resonance_crystal.png`,
    traitCache: `${ASSETS_BASE}/world-map/trait_shard_cache.png`,
    salvageYard: `${ASSETS_BASE}/world-map/salvage_yard.png`,
    powerNode: `${ASSETS_BASE}/world-map/power_node.png`,
    dataVault: `${ASSETS_BASE}/world-map/data_vault.png`,
    // Portals
    portal: `${ASSETS_BASE}/world-map/portal_open.png`,
    portalClosed: `${ASSETS_BASE}/world-map/portal_closed.png`,
    // Treasures
    treasure: `${ASSETS_BASE}/world-map/treasure_chest_closed.png`,
    treasureOpen: `${ASSETS_BASE}/world-map/treasure_chest_open.png`,
    // Markers
    battleMarker: `${ASSETS_BASE}/world-map/battle_marker.png`,
    fogOfWar: `${ASSETS_BASE}/world-map/fog_of_war.png`,
};

// Fallback emoji icons for when images don't load
export const FEATURE_ICONS_FALLBACK: Record<string, string> = {
    goldMine: '🪙',
    resonanceCrystal: '🔮',
    traitCache: '💎',
    salvageYard: '⚙️',
    powerNode: '⚡',
    dataVault: '📀',
    portal: '🌀',
    portalClosed: '🌀',
    treasure: '📦',
    treasureOpen: '📦',
    battleMarker: '⚔️',
    fogOfWar: '🌫️',
    castle: '🏰',
    none: '',
    hero: '👤',
};

// ============================================================================
// CASTLE ASSETS
// ============================================================================

export const CASTLE_ASSETS: Record<string, string> = {
    resonator: `${ASSETS_BASE}/castle/resonator_citadel.png`,
    dominion: `${ASSETS_BASE}/castle/dominion_fortress.png`,
};

// ============================================================================
// HERO ASSETS (Game-ready isometric sprites on Iram vessels)
// ============================================================================

export const HERO_ASSETS: Record<string, string> = {
    // Player heroes (Resonators)
    valence: `${ASSETS_BASE}/heroes-game/valence.png`,
    zahra: `${ASSETS_BASE}/heroes-game/zahra.png`,
    hareth: `${ASSETS_BASE}/heroes-game/hareth.png`,
    kael: `${ASSETS_BASE}/heroes-game/kael.png`,
    samira: `${ASSETS_BASE}/heroes-game/samira.png`,
    // Villain heroes (Dominion)
    emperor: `${ASSETS_BASE}/heroes-game/emperor.png`,
    tyrant: `${ASSETS_BASE}/heroes-game/tyrant.png`,
    destroyer: `${ASSETS_BASE}/heroes-game/destroyer.png`,
    deceiver: `${ASSETS_BASE}/heroes-game/deceiver.png`,
};

// Hero portrait assets (high-res for UI panels)
export const HERO_PORTRAITS: Record<string, string> = {
    valence: `${ASSETS_BASE}/heroes/vane.png`,
    zahra: `${ASSETS_BASE}/heroes/zahra.png`,
    hareth: `${ASSETS_BASE}/heroes/hareth.png`,
    kael: `${ASSETS_BASE}/heroes/kael.png`,
    samira: `${ASSETS_BASE}/heroes/samira.png`,
    emperor: `${ASSETS_BASE}/heroes/emperor.png`,
    tyrant: `${ASSETS_BASE}/heroes/tyrant.png`,
    destroyer: `${ASSETS_BASE}/heroes/destroyer.png`,
    deceiver: `${ASSETS_BASE}/heroes/deceiver.png`,
};

// ============================================================================
// UNIT ASSETS (Kenney Isometric Style)
// ============================================================================

export const UNIT_ASSETS: Record<string, string> = {
    // Tier 1
    worker: `${ASSETS_BASE}/units/worker.png`,
    scrapper: `${ASSETS_BASE}/units/scrapper.png`,
    mender: `${ASSETS_BASE}/units/mender.png`,
    // Tier 2
    guardian: `${ASSETS_BASE}/units/guardian.png`,
    strider: `${ASSETS_BASE}/units/strider.png`,
    breaker: `${ASSETS_BASE}/units/breaker.png`,
    // Tier 3
    resonator: `${ASSETS_BASE}/units/resonator.png`,
    forger: `${ASSETS_BASE}/units/forger.png`,
    glitch: `${ASSETS_BASE}/units/glitch.png`,
    // Tier 4
    archivist: `${ASSETS_BASE}/units/archivist.png`,
    conductor: `${ASSETS_BASE}/units/conductor.png`,
    prime: `${ASSETS_BASE}/units/prime.png`,
};

// ============================================================================
// ASSET HELPER FUNCTIONS
// ============================================================================

/**
 * Get feature asset URL with fallback to emoji
 */
export function getFeatureAsset(featureType: string): { url: string; fallback: string } {
    return {
        url: FEATURE_ASSETS[featureType] || '',
        fallback: FEATURE_ICONS_FALLBACK[featureType] || '❓',
    };
}

/**
 * Get hero asset URL
 */
export function getHeroAsset(heroId: string): string {
    const normalized = heroId.toLowerCase().replace(/[^a-z]/g, '');
    return HERO_ASSETS[normalized] || HERO_ASSETS.valence;
}

/**
 * Get hero portrait URL
 */
export function getHeroPortrait(heroId: string): string {
    const normalized = heroId.toLowerCase().replace(/[^a-z]/g, '');
    return HERO_PORTRAITS[normalized] || HERO_PORTRAITS.valence;
}

/**
 * Get unit asset URL
 */
export function getUnitAsset(unitType: string): string {
    const normalized = unitType.toLowerCase();
    return UNIT_ASSETS[normalized] || UNIT_ASSETS.worker;
}

/**
 * Get castle backdrop URL
 */
export function getCastleAsset(faction: 'resonator' | 'dominion'): string {
    return CASTLE_ASSETS[faction] || CASTLE_ASSETS.resonator;
}
