/**
 * Trait Wars Asset Types & Provider
 *
 * This module defines asset types and a provider pattern for loading assets.
 * Assets are NOT bundled in @almadar/ui - they live in the project's assets folder
 * and are loaded dynamically at runtime.
 */

import React, { createContext, useContext, ReactNode } from 'react';

// ============================================================================
// ASSET TYPE DEFINITIONS
// ============================================================================

/**
 * Unit sprite types (12 archetypes + Shadow Legion + Boss)
 */
export type UnitType =
    | 'hero'
    | 'caregiver'
    | 'explorer'
    | 'sage'
    | 'ruler'
    | 'rebel'
    | 'creator'
    | 'innocent'
    | 'jester'
    | 'lover'
    | 'magician'
    | 'orphan'
    | 'shadowLegion'
    | 'emperor';

/**
 * Terrain types
 */
export type TerrainType =
    | 'plains' | 'forest' | 'mountain' | 'water' | 'fortress' | 'castle'
    | 'grass' | 'dirt' | 'stone' | 'lava' | 'ice';  // Extended strategic map terrains

/**
 * UI element types
 */
export type UIElementType = 'healthBar' | 'traitFrame' | 'button' | 'panelBg';

/**
 * Effect types for combat animations
 */
export type EffectType = 'attack' | 'heal' | 'defend' | 'death';

/**
 * Hero types (player + villain heroes on Iram vessels)
 */
export type HeroType =
    | 'valence' | 'zahra' | 'hareth' | 'kael' | 'samira'  // Player heroes
    | 'emperor' | 'tyrant' | 'destroyer' | 'deceiver';    // Villain heroes

/**
 * World map feature types
 */
export type WorldMapFeatureType =
    | 'goldMine' | 'resonanceCrystal' | 'traitCache' | 'salvageYard'
    | 'powerNode' | 'dataVault' | 'portal' | 'portalClosed'
    | 'treasure' | 'treasureOpen' | 'battleMarker' | 'fogOfWar';

/**
 * Castle faction types
 */
export type CastleFactionType = 'resonator' | 'dominion';

/**
 * Sprite sheet types for tile/character rendering
 */
export type SpriteSheetType =
    | 'pixelTilemap'      // Pixel Platformer tilemap
    | 'pixelCharacters'   // Pixel Platformer characters
    | 'dungeonTilemap';   // Roguelike Dungeon tilemap

/**
 * Building types for castle view
 */
export type BuildingType =
    | 'townHall'
    | 'barracks'
    | 'arcaneTower'
    | 'traitForge'
    | 'resonanceWell'
    | 'treasury'
    | 'marketplace'
    | 'library'
    | 'portal';

/**
 * Robot unit types (12 archetypes for Dune/Book of Kells aesthetic)
 */
export type RobotUnitType =
    // Tier 1 - Basic units
    | 'worker'
    | 'scrapper'
    | 'mender'
    // Tier 2 - Advanced units
    | 'guardian'
    | 'strider'
    | 'breaker'
    // Tier 3 - Elite units
    | 'resonator'
    | 'forger'
    | 'glitch'
    // Tier 4 - Champion units
    | 'archivist'
    | 'conductor'
    | 'prime';

// ============================================================================
// ASSET MANIFEST INTERFACE
// ============================================================================

/**
 * Asset manifest that projects must provide.
 * All paths are relative to the project's public assets folder.
 */
export interface TraitWarsAssetManifest {
    /** Base URL for all assets (e.g., '/assets' or 'https://cdn.example.com/assets') */
    baseUrl: string;

    /** Unit sprite paths keyed by unit type */
    units: Partial<Record<UnitType, string>>;

    /** Terrain sprite paths keyed by terrain type */
    terrain: Partial<Record<TerrainType, string>>;

    /** UI element paths keyed by element type */
    ui: Partial<Record<UIElementType, string>>;

    /** Sprite sheet paths for tile/character rendering */
    spriteSheets: Partial<Record<SpriteSheetType, string>>;

    /** Effect animation paths (optional) */
    effects?: {
        attack?: string;
        heal?: string;
        defend?: string;
        death?: string;
        /** Kenney particle sprites for canvas animations (white-on-transparent, tint with blend modes) */
        particles?: {
            slash?: string[];
            magic?: string[];
            fire?: string[];
            flame?: string[];
            smoke?: string[];
            scorch?: string[];
            circle?: string[];
            flare?: string;
        };
        /** Frame-sequence animations (array of frame image paths) */
        animations?: {
            explosion?: string[];
            smokePuff?: string[];
        };
    };

    /** Isometric castle sprites for world map rendering */
    isometricCastles?: Partial<Record<CastleFactionType, string>>;

    /** Hero sprite paths keyed by hero ID */
    heroes?: Partial<Record<HeroType, string>>;

    /** Hero portrait paths keyed by hero ID */
    heroPortraits?: Partial<Record<HeroType, string>>;

    /** World map feature sprite paths */
    worldMapFeatures?: Partial<Record<WorldMapFeatureType, string>>;

    /** Castle backdrop paths */
    castles?: Partial<Record<CastleFactionType, string>>;

    /** Building sprite paths for castle view */
    buildings?: Partial<Record<BuildingType, string>>;

    /** Robot unit sprite paths (isometric) */
    robotUnits?: Partial<Record<RobotUnitType, string>>;

    /** Robot unit portrait paths (for recruitment panel) */
    unitPortraits?: Partial<Record<RobotUnitType, string>>;
}

// ============================================================================
// ASSET CONTEXT
// ============================================================================

const AssetContext = createContext<TraitWarsAssetManifest | null>(null);

/**
 * Provides asset manifest to all Trait Wars components.
 */
export function TraitWarsAssetProvider({
    manifest,
    children,
}: {
    manifest: TraitWarsAssetManifest;
    children: ReactNode;
}) {
    return (
        <AssetContext.Provider value={manifest} >
            {children}
        </AssetContext.Provider>
    );
}

/**
 * Hook to access asset manifest.
 */
export function useAssets(): TraitWarsAssetManifest {
    const context = useContext(AssetContext);
    if (!context) {
        throw new Error('useAssets must be used within a TraitWarsAssetProvider');
    }
    return context;
}

/**
 * Hook to access asset manifest with optional fallback.
 * Returns null if no provider is found (useful for Storybook).
 */
export function useAssetsOptional(): TraitWarsAssetManifest | null {
    return useContext(AssetContext);
}

// ============================================================================
// ASSET URL HELPERS
// ============================================================================

/**
 * Get full URL for a unit sprite.
 */
export function getUnitSpriteUrl(manifest: TraitWarsAssetManifest, type: UnitType): string | undefined {
    const path = manifest.units[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a terrain sprite.
 */
export function getTerrainSpriteUrl(manifest: TraitWarsAssetManifest, type: TerrainType): string | undefined {
    const path = manifest.terrain[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a UI element.
 */
export function getUIElementUrl(manifest: TraitWarsAssetManifest, type: UIElementType): string | undefined {
    const path = manifest.ui[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a sprite sheet.
 */
export function getSpriteSheetUrl(manifest: TraitWarsAssetManifest, type: SpriteSheetType): string | undefined {
    const path = manifest.spriteSheets[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for an effect animation.
 */
export function getEffectUrl(manifest: TraitWarsAssetManifest, type: EffectType): string | undefined {
    const path = manifest.effects?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a hero sprite.
 */
export function getHeroSpriteUrl(manifest: TraitWarsAssetManifest, heroId: string): string | undefined {
    const path = manifest.heroes?.[heroId as HeroType];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a hero portrait.
 */
export function getHeroPortraitUrl(manifest: TraitWarsAssetManifest, heroId: string): string | undefined {
    const path = manifest.heroPortraits?.[heroId as HeroType];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a world map feature.
 */
export function getWorldMapFeatureUrl(manifest: TraitWarsAssetManifest, type: WorldMapFeatureType): string | undefined {
    const path = manifest.worldMapFeatures?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a castle backdrop.
 */
export function getCastleUrl(manifest: TraitWarsAssetManifest, faction: CastleFactionType): string | undefined {
    const path = manifest.castles?.[faction];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for an isometric castle sprite (world map).
 */
export function getIsometricCastleUrl(manifest: TraitWarsAssetManifest, faction: CastleFactionType): string | undefined {
    const path = manifest.isometricCastles?.[faction];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a building sprite.
 */
export function getBuildingSpriteUrl(manifest: TraitWarsAssetManifest, type: BuildingType): string | undefined {
    const path = manifest.buildings?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a robot unit sprite (isometric).
 */
export function getRobotUnitSpriteUrl(manifest: TraitWarsAssetManifest, type: RobotUnitType): string | undefined {
    const path = manifest.robotUnits?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a unit portrait.
 */
export function getUnitPortraitUrl(manifest: TraitWarsAssetManifest, type: RobotUnitType): string | undefined {
    const path = manifest.unitPortraits?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

// ============================================================================
// DEFAULT/PLACEHOLDER MANIFEST
// ============================================================================

/**
 * Default manifest using Kenney Isometric Miniature Dungeon assets.
 * Tiles are 256x512 isometric sprites.
 */
export const DEFAULT_ASSET_MANIFEST: TraitWarsAssetManifest = {
    baseUrl: '/assets',
    units: {
        hero: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
        caregiver: 'isometric-dungeon/Characters/Male/Male_1_Idle0.png',
        explorer: 'isometric-dungeon/Characters/Male/Male_0_Idle0.png',
        sage: 'isometric-dungeon/Characters/Male/Male_2_Idle0.png',
        shadowLegion: 'isometric-dungeon/Characters/Male/Male_4_Idle0.png',
        emperor: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
    },
    terrain: {
        // Walkable floor tiles
        plains: 'isometric-dungeon/Isometric/dirt_E.png',
        grass: 'isometric-dungeon/Isometric/dirt_E.png',
        dirt: 'isometric-dungeon/Isometric/dirtTiles_E.png',
        stone: 'isometric-dungeon/Isometric/stoneInset_E.png',
        forest: 'isometric-dungeon/Isometric/planks_E.png',
        castle: 'isometric-dungeon/Isometric/stoneTile_E.png',
        ice: 'isometric-dungeon/Isometric/stoneUneven_E.png',
        // Obstacle tiles (impassable)
        mountain: 'isometric-dungeon/Isometric/stoneColumn_E.png',
        fortress: 'isometric-dungeon/Isometric/stoneWallColumn_E.png',
        // No tile for water/lava — canvas fallback renders colored diamond
    },
    ui: {
        healthBar: 'game-sprites/ui/health_bar.png',
        traitFrame: 'game-sprites/ui/trait_frame.png',
        button: 'game-sprites/ui/button.png',
        panelBg: 'game-sprites/ui/panel_bg.png',
    },
    spriteSheets: {
        pixelTilemap: 'pixel-platformer/tilemap.png',
        pixelCharacters: 'pixel-platformer/tilemap-characters.png',
        dungeonTilemap: 'tiles/dungeon/roguelikeDungeon_transparent.png',
    },
    effects: {
        attack: 'game-sprites/effects/attack.png',
        heal: 'game-sprites/effects/heal.png',
        defend: 'game-sprites/effects/defend.png',
        death: 'game-sprites/effects/death.png',
        particles: {
            slash: ['effects/particles/slash_01.png', 'effects/particles/slash_02.png', 'effects/particles/slash_03.png', 'effects/particles/slash_04.png'],
            magic: ['effects/particles/magic_01.png', 'effects/particles/magic_02.png', 'effects/particles/magic_03.png', 'effects/particles/magic_04.png', 'effects/particles/magic_05.png'],
            fire: ['effects/particles/fire_01.png', 'effects/particles/fire_02.png'],
            flame: ['effects/particles/flame_01.png', 'effects/particles/flame_02.png', 'effects/particles/flame_03.png', 'effects/particles/flame_04.png', 'effects/particles/flame_05.png', 'effects/particles/flame_06.png'],
            smoke: ['effects/particles/smoke_01.png', 'effects/particles/smoke_02.png'],
            scorch: ['effects/particles/scorch_01.png', 'effects/particles/scorch_02.png', 'effects/particles/scorch_03.png'],
            circle: ['effects/particles/circle_01.png', 'effects/particles/circle_02.png', 'effects/particles/circle_03.png', 'effects/particles/circle_04.png', 'effects/particles/circle_05.png'],
            flare: 'effects/particles/flare_01.png',
        },
        animations: {
            explosion: Array.from({ length: 9 }, (_, i) => `effects/explosions/regular/regularExplosion0${i}.png`),
            smokePuff: Array.from({ length: 20 }, (_, i) => `effects/smoke/white-puff/whitePuff${String(i).padStart(2, '0')}.png`),
        },
    },
    // Hero game sprites (isometric on Iram vessels)
    heroes: {
        valence: 'heroes-game/valence.png',
        zahra: 'heroes-game/zahra.png',
        hareth: 'heroes-game/hareth.png',
        kael: 'heroes-game/kael.png',
        samira: 'heroes-game/samira.png',
        emperor: 'heroes-game/emperor.png',
        tyrant: 'heroes-game/tyrant.png',
        destroyer: 'heroes-game/destroyer.png',
        deceiver: 'heroes-game/deceiver.png',
    },
    // Hero portraits (for UI panels)
    heroPortraits: {
        valence: 'heroes/vane.png',
        zahra: 'heroes/zahra.png',
        hareth: 'heroes/hareth.png',
        kael: 'heroes/kael.png',
        samira: 'heroes/samira.png',
        emperor: 'heroes/emperor.png',
        tyrant: 'heroes/tyrant.png',
        destroyer: 'heroes/destroyer.png',
        deceiver: 'heroes/deceiver.png',
    },
    // World map features (Kenney isometric style)
    worldMapFeatures: {
        goldMine: 'world-map/gold_mine.png',
        resonanceCrystal: 'world-map/resonance_crystal.png',
        traitCache: 'world-map/trait_shard_cache.png',
        salvageYard: 'world-map/salvage_yard.png',
        powerNode: 'world-map/power_node.png',
        dataVault: 'world-map/data_vault.png',
        portal: 'world-map/portal_open.png',
        portalClosed: 'world-map/portal_closed.png',
        treasure: 'world-map/treasure_chest_closed.png',
        treasureOpen: 'world-map/treasure_chest_open.png',
        battleMarker: 'world-map/battle_marker.png',
        fogOfWar: 'world-map/fog_of_war.png',
    },
    // Castle backdrops (frontal view for CastleTemplate)
    castles: {
        resonator: 'castle-views/resonator_view.png',
        dominion: 'castle-views/dominion_view.png',
    },
    // Isometric castle sprites (for world map rendering)
    isometricCastles: {
        resonator: 'castle/resonator_citadel.png',
        dominion: 'castle/dominion_fortress.png',
    },
    // Building sprites for castle view
    buildings: {
        townHall: 'buildings/town_hall.png',
        barracks: 'buildings/barracks.png',
        arcaneTower: 'buildings/arcane_tower.png',
        traitForge: 'buildings/trait_forge.png',
        resonanceWell: 'buildings/resonance_well.png',
        treasury: 'buildings/treasury.png',
        marketplace: 'buildings/marketplace.png',
        library: 'buildings/library.png',
        portal: 'buildings/portal.png',
    },
    // Robot unit sprites (isometric)
    robotUnits: {
        // Tier 1
        worker: 'units/worker.png',
        scrapper: 'units/scrapper.png',
        mender: 'units/mender.png',
        // Tier 2
        guardian: 'units/guardian.png',
        strider: 'units/strider.png',
        breaker: 'units/breaker.png',
        // Tier 3
        resonator: 'units/resonator.png',
        forger: 'units/forger.png',
        glitch: 'units/glitch.png',
        // Tier 4
        archivist: 'units/archivist.png',
        conductor: 'units/conductor.png',
        prime: 'units/prime.png',
    },
    // Unit portraits for recruitment panel
    unitPortraits: {
        worker: 'unit-portraits/worker.png',
        scrapper: 'unit-portraits/scrapper.png',
        mender: 'unit-portraits/mender.png',
        guardian: 'unit-portraits/guardian.png',
        strider: 'unit-portraits/strider.png',
        breaker: 'unit-portraits/breaker.png',
        resonator: 'unit-portraits/resonator.png',
        forger: 'unit-portraits/forger.png',
        glitch: 'unit-portraits/glitch.png',
        archivist: 'unit-portraits/archivist.png',
        conductor: 'unit-portraits/conductor.png',
        prime: 'unit-portraits/prime.png',
    },
};
