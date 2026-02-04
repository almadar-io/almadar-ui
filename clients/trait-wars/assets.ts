/**
 * Trait Wars Asset Constants
 *
 * Maps game entities to sprite asset paths.
 * Assets are located in ./assets/ folder within the trait-wars design system.
 * Using direct imports for bundler (webpack/vite) compatibility with Storybook.
 */

// Import terrain sprites
import plainsSprite from './assets/terrain/plains.png';
import forestSprite from './assets/terrain/forest.png';
import mountainSprite from './assets/terrain/mountain.png';
import waterSprite from './assets/terrain/water.png';
import fortressSprite from './assets/terrain/fortress.png';

// Import unit sprites - Blue (player)
import knightBlue from './assets/units/knight_blue.png';
import archerBlue from './assets/units/archer_blue.png';
import mageBlue from './assets/units/mage_blue.png';
import healerBlue from './assets/units/healer_blue.png';
import scoutBlue from './assets/units/scout_blue.png';
import summonerBlue from './assets/units/summoner_blue.png';

// Import unit sprites - Red (enemy)
import knightRed from './assets/units/knight_red.png';
import archerRed from './assets/units/archer_red.png';
import mageRed from './assets/units/mage_red.png';
import healerRed from './assets/units/healer_red.png';
import scoutRed from './assets/units/scout_red.png';
import summonerRed from './assets/units/summoner_red.png';

/**
 * Terrain sprite paths
 */
export const TERRAIN_SPRITES = {
    plains: plainsSprite,
    forest: forestSprite,
    mountain: mountainSprite,
    water: waterSprite,
    fortress: fortressSprite,
} as const;

export type TerrainSpriteKey = keyof typeof TERRAIN_SPRITES;

/**
 * Unit sprite paths by type and owner
 */
export const UNIT_SPRITES = {
    knight: {
        player: knightBlue,
        enemy: knightRed,
    },
    archer: {
        player: archerBlue,
        enemy: archerRed,
    },
    mage: {
        player: mageBlue,
        enemy: mageRed,
    },
    healer: {
        player: healerBlue,
        enemy: healerRed,
    },
    scout: {
        player: scoutBlue,
        enemy: scoutRed,
    },
    summoner: {
        player: summonerBlue,
        enemy: summonerRed,
    },
} as const;

export type UnitSpriteKey = keyof typeof UNIT_SPRITES;
export type OwnerType = 'player' | 'enemy';

/**
 * Get unit sprite path
 */
export function getUnitSprite(unitType: UnitSpriteKey, owner: OwnerType): string {
    return UNIT_SPRITES[unitType][owner];
}

/**
 * Get terrain sprite path
 */
export function getTerrainSprite(terrain: TerrainSpriteKey): string {
    return TERRAIN_SPRITES[terrain];
}

/**
 * Hex tile dimensions (from Kenny Hexagon Pack)
 * The hexagon tiles are 120x140 pixels
 */
export const HEX_DIMENSIONS = {
    width: 120,
    height: 140,
    // For offset grid calculations
    horizontalOffset: 90,  // 75% of width for interlocking
    verticalOffset: 105,   // 75% of height for rows
};

/**
 * Unit dimensions (from Kenny RTS Medieval)
 * The unit sprites are 16x16 pixels
 */
export const UNIT_DIMENSIONS = {
    width: 16,
    height: 16,
};
