/**
 * Trait Wars Design System Components
 *
 * Turn-based hex strategy game components built on the core design system.
 * All components follow the Orbital Entity Binding pattern:
 * - Data flows through entity/props from Orbital state
 * - User interactions emit events via useEventBus()
 */

// Asset types, provider, and utilities (avoiding TerrainType conflict with atoms)
export {
    TraitWarsAssetProvider,
    useAssets,
    getUnitSpriteUrl,
    getTerrainSpriteUrl,
    getUIElementUrl,
    DEFAULT_ASSET_MANIFEST,
    type TraitWarsAssetManifest,
    type UnitType,
    type TerrainType as AssetTerrainType,
    type UIElementType,
} from './assets';

// Atoms - Basic building blocks
export * from './atoms';

// Molecules - Composite components
export * from './molecules';

// Organisms - Complex feature components
export * from './organisms';

// Templates - Page-level layouts
export * from './templates';
