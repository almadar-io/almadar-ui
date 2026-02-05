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
        <AssetContext.Provider value= { manifest } >
        { children }
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

// ============================================================================
// DEFAULT/PLACEHOLDER MANIFEST
// ============================================================================

/**
 * Default manifest with placeholder paths.
 * Projects should override this with their own asset paths.
 */
export const DEFAULT_ASSET_MANIFEST: TraitWarsAssetManifest = {
    baseUrl: '/assets/game-sprites',
    units: {
        hero: 'robots/04_hero_isometric.png',
        caregiver: 'robots/03_caregiver_isometric.png',
        explorer: 'robots/05_explorer_isometric.png',
        sage: 'robots/10_sage_isometric.png',
        shadowLegion: 'robots/iram_shadow_isometric.png',
        emperor: 'robots/12_emperor_isometric.png',
    },
    terrain: {
        plains: 'terrain/manuscript_plains.png',
        forest: 'terrain/illuminated_forest.png',
        mountain: 'terrain/scripture_mountains.png',
        water: 'terrain/ink_water.png',
        fortress: 'terrain/bone_castle.png',
        castle: 'terrain/bone_castle.png',
    },
    ui: {
        healthBar: 'ui/health_bar.png',
        traitFrame: 'ui/trait_frame.png',
        button: 'ui/button.png',
        panelBg: 'ui/panel_bg.png',
    },
};
