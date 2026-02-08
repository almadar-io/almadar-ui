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
 * Themed game UI asset types (Illuminated Manuscript Futurism)
 */
export type GameUIPanelType = 'panelFrame' | 'tooltipFrame' | 'combatLogBg' | 'divider';
export type GameUIButtonType = 'primary' | 'secondary' | 'danger';
export type GameUIBarType = 'health' | 'resonance' | 'gold' | 'xp';
export type GameUIBadgeType = 'tier1' | 'tier2' | 'tier3' | 'tier4';
export type GameUIEmblemType = 'resonator' | 'dominion' | 'neutral';
export type GameUIResourceIconType = 'gold' | 'resonance' | 'traitShards' | 'crystal' | 'wood' | 'stone';
export type GameUIOverlayType = 'victory' | 'defeat';

/**
 * Hero types (player + villain heroes on Iram vessels)
 */
export type HeroType =
    | 'valence' | 'zahra' | 'hareth' | 'kael' | 'samira'           // Player heroes
    | 'omar' | 'layla' | 'jara' | 'rumi' | 'zain'                  // Additional heroes
    | 'tariq' | 'fatima' | 'dr-aris' | 'amir'                      // Additional heroes
    | 'emperor' | 'tyrant' | 'destroyer' | 'deceiver';             // Villain heroes

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
            spark?: string[];
            muzzle?: string[];
            star?: string[];
            trace?: string[];
            twirl?: string[];
            light?: string[];
            dirt?: string[];
            scratch?: string[];
            symbol?: string[];
        };
        /** Frame-sequence animations (array of frame image paths) */
        animations?: {
            explosion?: string[];
            smokePuff?: string[];
            flash?: string[];
            blackSmoke?: string[];
            gasSmoke?: string[];
            smokeExplosion?: string[];
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

    /** Unified character portrait paths (derived from sprite sheet idle frames) */
    portraits?: Partial<Record<string, string>>;

    /** Background images for canvas templates */
    backgrounds?: {
        worldMap?: string;
        battle?: string;
        castle?: string;
    };

    /** Terrain variant arrays for visual variety (multiple sprites per terrain type) */
    terrainVariants?: Partial<Record<TerrainType, string[]>>;

    /**
     * Themed game UI assets (Illuminated Manuscript Futurism).
     * Panels, buttons, bars, badges, emblems, resource icons, overlays.
     */
    gameUI?: {
        panels?: Partial<Record<GameUIPanelType, string>>;
        buttons?: Partial<Record<GameUIButtonType, string>>;
        bars?: Partial<Record<GameUIBarType, string>>;
        badges?: Partial<Record<GameUIBadgeType, string>>;
        emblems?: Partial<Record<GameUIEmblemType, string>>;
        resourceIcons?: Partial<Record<GameUIResourceIconType, string>>;
        overlays?: Partial<Record<GameUIOverlayType, string>>;
    };

    /**
     * Animated sprite sheets for frame-based character animation.
     * Keys are character IDs (matching unitType or heroId on IsometricUnit).
     * Each entry has SE and SW sheet URLs + frame dimensions.
     */
    characterSheets?: Record<string, {
        se: string;
        sw: string;
        frameWidth: number;
        frameHeight: number;
    }>;
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
 * Get full URL for a Kenney dungeon tile by name (e.g., 'stoneInset_E').
 */
export function getKenneyTileUrl(manifest: TraitWarsAssetManifest, tileName: string): string {
    return `${manifest.baseUrl}/isometric-dungeon/Isometric/${tileName}.png`;
}

/**
 * Get full URL for a terrain sprite with position-based variety.
 * Falls back to the single terrain sprite if no variants are defined.
 */
export function getTerrainVariantUrl(
    manifest: TraitWarsAssetManifest,
    type: TerrainType,
    x: number,
    y: number,
): string | undefined {
    const variants = manifest.terrainVariants?.[type];
    if (variants && variants.length > 0) {
        const index = Math.abs(x * 7 + y * 13) % variants.length;
        return `${manifest.baseUrl}/${variants[index]}`;
    }
    return getTerrainSpriteUrl(manifest, type);
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
 * Get full URL for any character portrait (hero, robot, or villain).
 * Uses the unified portraits map derived from sprite sheet idle frames.
 */
export function getPortraitUrl(manifest: TraitWarsAssetManifest, characterId: string): string | undefined {
    const path = manifest.portraits?.[characterId];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/**
 * Get full URL for a hero portrait.
 */
export function getHeroPortraitUrl(manifest: TraitWarsAssetManifest, heroId: string): string | undefined {
    const path = manifest.heroPortraits?.[heroId as HeroType];
    if (path) return `${manifest.baseUrl}/${path}`;
    return getPortraitUrl(manifest, heroId);
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
    if (path) return `${manifest.baseUrl}/${path}`;
    return getPortraitUrl(manifest, type);
}

/**
 * Get sprite sheet URLs for a character by ID (unitType or heroId).
 * Returns { se, sw } full URLs or null if no sheets configured.
 */
export function getCharacterSheetUrls(
    manifest: TraitWarsAssetManifest,
    characterId: string,
): { se: string; sw: string } | null {
    const entry = manifest.characterSheets?.[characterId];
    if (!entry) return null;
    return {
        se: `${manifest.baseUrl}/${entry.se}`,
        sw: `${manifest.baseUrl}/${entry.sw}`,
    };
}

/**
 * Get frame dimensions for a character's sprite sheet.
 */
export function getCharacterFrameDims(
    manifest: TraitWarsAssetManifest,
    characterId: string,
): { width: number; height: number } | null {
    const entry = manifest.characterSheets?.[characterId];
    if (!entry) return null;
    return { width: entry.frameWidth, height: entry.frameHeight };
}

/**
 * Get all character sprite sheet URLs for bulk preloading.
 */
export function getAllCharacterSheetUrls(manifest: TraitWarsAssetManifest): string[] {
    const urls: string[] = [];
    const sheets = manifest.characterSheets;
    if (!sheets) return urls;

    for (const entry of Object.values(sheets)) {
        urls.push(`${manifest.baseUrl}/${entry.se}`);
        urls.push(`${manifest.baseUrl}/${entry.sw}`);
    }
    return urls;
}

/**
 * Get all effect sprite URLs from a manifest for bulk preloading.
 * Returns every particle, sequence frame, and overlay URL.
 */
export function getAllEffectSpriteUrls(manifest: TraitWarsAssetManifest): string[] {
    const urls: string[] = [];
    const base = manifest.baseUrl;
    const fx = manifest.effects;
    if (!fx) return urls;

    // Static overlays
    if (fx.attack) urls.push(`${base}/${fx.attack}`);
    if (fx.heal) urls.push(`${base}/${fx.heal}`);
    if (fx.defend) urls.push(`${base}/${fx.defend}`);
    if (fx.death) urls.push(`${base}/${fx.death}`);

    // Particles
    if (fx.particles) {
        for (const [key, value] of Object.entries(fx.particles)) {
            if (Array.isArray(value)) {
                value.forEach(v => urls.push(`${base}/${v}`));
            } else if (typeof value === 'string') {
                urls.push(`${base}/${value}`);
            }
        }
    }

    // Animations (frame sequences)
    if (fx.animations) {
        for (const frames of Object.values(fx.animations)) {
            if (Array.isArray(frames)) {
                frames.forEach(f => urls.push(`${base}/${f}`));
            }
        }
    }

    return urls;
}

// ============================================================================
// GAME UI ASSET HELPERS
// ============================================================================

/** Get full URL for a themed UI panel asset. */
export function getGameUIPanelUrl(manifest: TraitWarsAssetManifest, type: GameUIPanelType): string | undefined {
    const path = manifest.gameUI?.panels?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a themed UI button asset. */
export function getGameUIButtonUrl(manifest: TraitWarsAssetManifest, type: GameUIButtonType): string | undefined {
    const path = manifest.gameUI?.buttons?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a themed UI bar asset. */
export function getGameUIBarUrl(manifest: TraitWarsAssetManifest, type: GameUIBarType): string | undefined {
    const path = manifest.gameUI?.bars?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a tier badge asset. */
export function getGameUIBadgeUrl(manifest: TraitWarsAssetManifest, type: GameUIBadgeType): string | undefined {
    const path = manifest.gameUI?.badges?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a faction emblem asset. */
export function getGameUIEmblemUrl(manifest: TraitWarsAssetManifest, type: GameUIEmblemType): string | undefined {
    const path = manifest.gameUI?.emblems?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a resource icon asset. */
export function getGameUIResourceIconUrl(manifest: TraitWarsAssetManifest, type: GameUIResourceIconType): string | undefined {
    const path = manifest.gameUI?.resourceIcons?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get full URL for a game overlay (victory/defeat). */
export function getGameUIOverlayUrl(manifest: TraitWarsAssetManifest, type: GameUIOverlayType): string | undefined {
    const path = manifest.gameUI?.overlays?.[type];
    return path ? `${manifest.baseUrl}/${path}` : undefined;
}

/** Get all game UI asset URLs for bulk preloading. */
export function getAllGameUIUrls(manifest: TraitWarsAssetManifest): string[] {
    const urls: string[] = [];
    const base = manifest.baseUrl;
    const gui = manifest.gameUI;
    if (!gui) return urls;

    const sections = [gui.panels, gui.buttons, gui.bars, gui.badges, gui.emblems, gui.resourceIcons, gui.overlays];
    for (const section of sections) {
        if (section) {
            for (const path of Object.values(section)) {
                if (path) urls.push(`${base}/${path}`);
            }
        }
    }
    return urls;
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
            slash: Array.from({ length: 4 }, (_, i) => `effects/particles/slash_0${i + 1}.png`),
            magic: Array.from({ length: 5 }, (_, i) => `effects/particles/magic_0${i + 1}.png`),
            fire: Array.from({ length: 2 }, (_, i) => `effects/particles/fire_0${i + 1}.png`),
            flame: Array.from({ length: 6 }, (_, i) => `effects/particles/flame_0${i + 1}.png`),
            smoke: Array.from({ length: 10 }, (_, i) => `effects/particles/smoke_${String(i + 1).padStart(2, '0')}.png`),
            scorch: Array.from({ length: 3 }, (_, i) => `effects/particles/scorch_0${i + 1}.png`),
            circle: Array.from({ length: 5 }, (_, i) => `effects/particles/circle_0${i + 1}.png`),
            flare: 'effects/particles/flare_01.png',
            spark: Array.from({ length: 7 }, (_, i) => `effects/particles/spark_0${i + 1}.png`),
            muzzle: Array.from({ length: 5 }, (_, i) => `effects/particles/muzzle_0${i + 1}.png`),
            star: Array.from({ length: 9 }, (_, i) => `effects/particles/star_0${i + 1}.png`),
            trace: Array.from({ length: 7 }, (_, i) => `effects/particles/trace_0${i + 1}.png`),
            twirl: Array.from({ length: 3 }, (_, i) => `effects/particles/twirl_0${i + 1}.png`),
            light: Array.from({ length: 3 }, (_, i) => `effects/particles/light_0${i + 1}.png`),
            dirt: Array.from({ length: 3 }, (_, i) => `effects/particles/dirt_0${i + 1}.png`),
            scratch: ['effects/particles/scratch_01.png'],
            symbol: Array.from({ length: 2 }, (_, i) => `effects/particles/symbol_0${i + 1}.png`),
        },
        animations: {
            explosion: Array.from({ length: 9 }, (_, i) => `effects/explosions/regular/regularExplosion0${i}.png`),
            smokePuff: Array.from({ length: 25 }, (_, i) => `effects/smoke/white-puff/whitePuff${String(i).padStart(2, '0')}.png`),
            flash: Array.from({ length: 9 }, (_, i) => `effects/flash/flash0${i}.png`),
            blackSmoke: Array.from({ length: 25 }, (_, i) => `effects/black-smoke/blackSmoke${String(i).padStart(2, '0')}.png`),
            gasSmoke: Array.from({ length: 9 }, (_, i) => `effects/gas/gas0${i}.png`),
            smokeExplosion: Array.from({ length: 9 }, (_, i) => `effects/explosions/smoke-explosion/explosion0${i}.png`),
        },
    },
    // Themed game UI assets (Illuminated Manuscript Futurism)
    gameUI: {
        panels: {
            panelFrame: 'ui/trait-wars-panel-border-frame.png',
            tooltipFrame: 'ui/trait-wars-tooltip-border.png',
            combatLogBg: 'ui/trait-wars-combat-log.png',
            divider: 'ui/trait-wars-divider.png',
        },
        buttons: {
            primary: 'ui/button-primary.png',
            secondary: 'ui/button-secondary.png',
            danger: 'ui/button-danger.png',
        },
        bars: {
            health: 'ui/bar-health.png',
            resonance: 'ui/bar-resonance.png',
            gold: 'ui/bar-gold.png',
            xp: 'ui/bar-xp.png',
        },
        badges: {
            tier1: 'ui/badge-tier-1.png',
            tier2: 'ui/badge-tier-2.png',
            tier3: 'ui/badge-tier-3.png',
            tier4: 'ui/badge-tier-4.png',
        },
        emblems: {
            resonator: 'ui/emblem-resonator.png',
            dominion: 'ui/emblem-dominion.png',
            neutral: 'ui/emblem-neutral.png',
        },
        resourceIcons: {
            gold: 'ui/icon-gold.png',
            resonance: 'ui/icon-resonance.png',
            traitShards: 'ui/icon-trait-shards.png',
            crystal: 'ui/icon-crystal.png',
            wood: 'ui/icon-wood.png',
            stone: 'ui/icon-stone.png',
        },
        overlays: {
            victory: 'ui/trait-wars-victory.png',
            defeat: 'ui/trait-wars-defeat-sign.png',
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
    // Hero portraits (derived from sprite sheet idle frames)
    heroPortraits: {
        valence: 'portraits/valence.png',
        zahra: 'portraits/zahra.png',
        hareth: 'portraits/hareth.png',
        kael: 'portraits/kael.png',
        samira: 'portraits/samira.png',
        omar: 'portraits/omar.png',
        layla: 'portraits/layla.png',
        jara: 'portraits/jara.png',
        rumi: 'portraits/rumi.png',
        zain: 'portraits/zain.png',
        tariq: 'portraits/tariq.png',
        fatima: 'portraits/fatima.png',
        'dr-aris': 'portraits/dr-aris.png',
        amir: 'portraits/amir.png',
        emperor: 'portraits/emperor.png',
        tyrant: 'portraits/tyrant.png',
        destroyer: 'portraits/destroyer.png',
        deceiver: 'portraits/deceiver.png',
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
    // Unit portraits (derived from sprite sheet idle frames)
    unitPortraits: {
        worker: 'portraits/worker.png',
        scrapper: 'portraits/scrapper.png',
        mender: 'portraits/mender.png',
        guardian: 'portraits/guardian.png',
        strider: 'portraits/strider.png',
        breaker: 'portraits/breaker.png',
        resonator: 'portraits/resonator.png',
        forger: 'portraits/forger.png',
        glitch: 'portraits/glitch.png',
        archivist: 'portraits/archivist.png',
        conductor: 'portraits/conductor.png',
        prime: 'portraits/prime.png',
    },
    // Unified portraits for all characters (source of truth: sprite sheet idle frames)
    portraits: {
        // Robots
        worker: 'portraits/worker.png',
        scrapper: 'portraits/scrapper.png',
        mender: 'portraits/mender.png',
        guardian: 'portraits/guardian.png',
        strider: 'portraits/strider.png',
        breaker: 'portraits/breaker.png',
        resonator: 'portraits/resonator.png',
        forger: 'portraits/forger.png',
        glitch: 'portraits/glitch.png',
        archivist: 'portraits/archivist.png',
        conductor: 'portraits/conductor.png',
        coordinator: 'portraits/coordinator.png',
        // Heroes
        valence: 'portraits/valence.png',
        zahra: 'portraits/zahra.png',
        hareth: 'portraits/hareth.png',
        kael: 'portraits/kael.png',
        samira: 'portraits/samira.png',
        omar: 'portraits/omar.png',
        layla: 'portraits/layla.png',
        jara: 'portraits/jara.png',
        rumi: 'portraits/rumi.png',
        zain: 'portraits/zain.png',
        tariq: 'portraits/tariq.png',
        fatima: 'portraits/fatima.png',
        'dr-aris': 'portraits/dr-aris.png',
        amir: 'portraits/amir.png',
        // Villains
        emperor: 'portraits/emperor.png',
        tyrant: 'portraits/tyrant.png',
        destroyer: 'portraits/destroyer.png',
        deceiver: 'portraits/deceiver.png',
        // Shadow Legion
        'shadow-legion': 'portraits/shadow-legion.png',
    },
    // Background images for canvas templates
    backgrounds: {
        worldMap: 'world/dark_clouds_from_above.png',
        battle: 'world/starfield.png',
        castle: 'world/dark_stone.png',
    },
    // Animated sprite sheets for frame-based character animation
    characterSheets: {
        // Robots (128x128 frames)
        worker:       { se: 'sprite-sheets/worker-sprite-sheet-se.png',       sw: 'sprite-sheets/worker-sprite-sheet-sw.png',       frameWidth: 128, frameHeight: 128 },
        scrapper:     { se: 'sprite-sheets/scrapper-sprite-sheet-se.png',     sw: 'sprite-sheets/scrapper-sprite-sheet-sw.png',     frameWidth: 128, frameHeight: 128 },
        mender:       { se: 'sprite-sheets/mender-sprite-sheet-se.png',       sw: 'sprite-sheets/mender-sprite-sheet-sw.png',       frameWidth: 128, frameHeight: 128 },
        guardian:     { se: 'sprite-sheets/guardian-sprite-sheet-se.png',     sw: 'sprite-sheets/guardian-sprite-sheet-sw.png',     frameWidth: 128, frameHeight: 128 },
        strider:      { se: 'sprite-sheets/strider-sprite-sheet-se.png',      sw: 'sprite-sheets/strider-sprite-sheet-sw.png',      frameWidth: 128, frameHeight: 128 },
        breaker:      { se: 'sprite-sheets/breaker-sprite-sheet-se.png',      sw: 'sprite-sheets/breaker-sprite-sheet-sw.png',      frameWidth: 128, frameHeight: 128 },
        resonator:    { se: 'sprite-sheets/resonator-sprite-sheet-se.png',    sw: 'sprite-sheets/resonator-sprite-sheet-sw.png',    frameWidth: 128, frameHeight: 128 },
        forger:       { se: 'sprite-sheets/forger-sprite-sheet-se.png',       sw: 'sprite-sheets/forger-sprite-sheet-sw.png',       frameWidth: 128, frameHeight: 128 },
        glitch:       { se: 'sprite-sheets/glitch-sprite-sheet-se.png',       sw: 'sprite-sheets/glitch-sprite-sheet-sw.png',       frameWidth: 128, frameHeight: 128 },
        archivist:    { se: 'sprite-sheets/archivist-sprite-sheet-se.png',    sw: 'sprite-sheets/archivist-sprite-sheet-sw.png',    frameWidth: 128, frameHeight: 128 },
        conductor:    { se: 'sprite-sheets/conductor-sprite-sheet-se.png',    sw: 'sprite-sheets/conductor-sprite-sheet-sw.png',    frameWidth: 128, frameHeight: 128 },
        coordinator:  { se: 'sprite-sheets/coordinator-sprite-sheet-se.png',  sw: 'sprite-sheets/coordinator-sprite-sheet-sw.png',  frameWidth: 128, frameHeight: 128 },
        'shadow-legion': { se: 'sprite-sheets/shadow-legion-sprite-sheet-se.png', sw: 'sprite-sheets/shadow-legion-sprite-sheet-sw.png', frameWidth: 128, frameHeight: 128 },
        // Heroes (256x256 frames)
        valence:   { se: 'sprite-sheets/valence-sprite-sheet-se.png',   sw: 'sprite-sheets/valence-sprite-sheet-sw.png',   frameWidth: 256, frameHeight: 256 },
        zahra:     { se: 'sprite-sheets/zahra-sprite-sheet-se.png',     sw: 'sprite-sheets/zahra-sprite-sheet-sw.png',     frameWidth: 256, frameHeight: 256 },
        hareth:    { se: 'sprite-sheets/hareth-sprite-sheet-se.png',    sw: 'sprite-sheets/hareth-sprite-sheet-sw.png',    frameWidth: 256, frameHeight: 256 },
        kael:      { se: 'sprite-sheets/kael-sprite-sheet-se.png',      sw: 'sprite-sheets/kael-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        samira:    { se: 'sprite-sheets/samira-sprite-sheet-se.png',    sw: 'sprite-sheets/samira-sprite-sheet-sw.png',    frameWidth: 256, frameHeight: 256 },
        omar:      { se: 'sprite-sheets/omar-sprite-sheet-se.png',      sw: 'sprite-sheets/omar-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        layla:     { se: 'sprite-sheets/layla-sprite-sheet-se.png',     sw: 'sprite-sheets/layla-sprite-sheet-sw.png',     frameWidth: 256, frameHeight: 256 },
        jara:      { se: 'sprite-sheets/jara-sprite-sheet-se.png',      sw: 'sprite-sheets/jara-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        rumi:      { se: 'sprite-sheets/rumi-sprite-sheet-se.png',      sw: 'sprite-sheets/rumi-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        zain:      { se: 'sprite-sheets/zain-sprite-sheet-se.png',      sw: 'sprite-sheets/zain-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        tariq:     { se: 'sprite-sheets/tariq-sprite-sheet-se.png',     sw: 'sprite-sheets/tariq-sprite-sheet-sw.png',     frameWidth: 256, frameHeight: 256 },
        fatima:    { se: 'sprite-sheets/fatima-sprite-sheet-se.png',    sw: 'sprite-sheets/fatima-sprite-sheet-sw.png',    frameWidth: 256, frameHeight: 256 },
        'dr-aris': { se: 'sprite-sheets/dr-aris-sprite-sheet-se.png',  sw: 'sprite-sheets/dr-aris-sprite-sheet-sw.png',  frameWidth: 256, frameHeight: 256 },
        amir:      { se: 'sprite-sheets/amir-sprite-sheet-se.png',      sw: 'sprite-sheets/amir-sprite-sheet-sw.png',      frameWidth: 256, frameHeight: 256 },
        // Villains (256x256 frames)
        emperor:   { se: 'sprite-sheets/emperor-sprite-sheet-se.png',   sw: 'sprite-sheets/emperor-sprite-sheet-sw.png',   frameWidth: 256, frameHeight: 256 },
        tyrant:    { se: 'sprite-sheets/tyrant-sprite-sheet-se.png',    sw: 'sprite-sheets/tyrant-sprite-sheet-sw.png',    frameWidth: 256, frameHeight: 256 },
        destroyer: { se: 'sprite-sheets/destroyer-sprite-sheet-se.png', sw: 'sprite-sheets/destroyer-sprite-sheet-sw.png', frameWidth: 256, frameHeight: 256 },
        deceiver:  { se: 'sprite-sheets/deceiver-sprite-sheet-se.png',  sw: 'sprite-sheets/deceiver-sprite-sheet-sw.png',  frameWidth: 256, frameHeight: 256 },
    },
    // Terrain variants for visual variety (deterministic per-tile selection)
    terrainVariants: {
        plains: [
            'isometric-dungeon/Isometric/dirt_E.png',
            'isometric-dungeon/Isometric/dirtTiles_E.png',
        ],
        grass: [
            'isometric-dungeon/Isometric/dirt_E.png',
            'isometric-dungeon/Isometric/dirtTiles_E.png',
        ],
        dirt: [
            'isometric-dungeon/Isometric/dirtTiles_E.png',
            'isometric-dungeon/Isometric/dirt_E.png',
        ],
        stone: [
            'isometric-dungeon/Isometric/stoneInset_E.png',
            'isometric-dungeon/Isometric/stone_E.png',
            'isometric-dungeon/Isometric/stoneTile_E.png',
            'isometric-dungeon/Isometric/stoneMissingTiles_E.png',
        ],
        forest: [
            'isometric-dungeon/Isometric/planks_E.png',
            'isometric-dungeon/Isometric/planksBroken_E.png',
        ],
        castle: [
            'isometric-dungeon/Isometric/stoneTile_E.png',
            'isometric-dungeon/Isometric/stoneInset_E.png',
            'isometric-dungeon/Isometric/stone_E.png',
        ],
        ice: [
            'isometric-dungeon/Isometric/stoneUneven_E.png',
            'isometric-dungeon/Isometric/stoneMissingTiles_E.png',
        ],
    },
};
