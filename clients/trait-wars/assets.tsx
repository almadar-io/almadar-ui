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
export type TerrainType = 'plains' | 'forest' | 'mountain' | 'water' | 'fortress' | 'castle';

/**
 * UI element types
 */
export type UIElementType = 'healthBar' | 'traitFrame' | 'button' | 'panelBg';

/**
 * Effect types for combat animations
 */
export type EffectType = 'attack' | 'heal' | 'defend' | 'death';

/**
 * Sprite sheet types for tile/character rendering
 */
export type SpriteSheetType =
    | 'pixelTilemap'      // Pixel Platformer tilemap
    | 'pixelCharacters'   // Pixel Platformer characters
    | 'dungeonTilemap';   // Roguelike Dungeon tilemap

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
    };
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

// ============================================================================
// DEFAULT/PLACEHOLDER MANIFEST
// ============================================================================

/**
 * Default manifest using Kenney Isometric Miniature Dungeon assets.
 * Tiles are 256x512 isometric sprites.
 */
export const DEFAULT_ASSET_MANIFEST: TraitWarsAssetManifest = {
    baseUrl: '',
    units: {
        hero: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
        caregiver: 'isometric-dungeon/Characters/Male/Male_1_Idle0.png',
        explorer: 'isometric-dungeon/Characters/Male/Male_0_Idle0.png',
        sage: 'isometric-dungeon/Characters/Male/Male_2_Idle0.png',
        shadowLegion: 'isometric-dungeon/Characters/Male/Male_4_Idle0.png',
        emperor: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
    },
    terrain: {
        plains: 'isometric-dungeon/Isometric/stoneTile_E.png',
        forest: 'isometric-dungeon/Isometric/planks_E.png',
        mountain: 'isometric-dungeon/Isometric/stoneColumn_E.png',
        water: 'isometric-dungeon/Isometric/dirt_E.png',
        fortress: 'isometric-dungeon/Isometric/stoneWallColumn_E.png',
        castle: 'isometric-dungeon/Isometric/stoneWallColumn_E.png',
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
    },
};
