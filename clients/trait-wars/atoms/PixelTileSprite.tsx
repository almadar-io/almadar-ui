/**
 * PixelTileSprite Component
 *
 * High-fidelity terrain tiles from the Pixel Platformer Pack.
 * 18x18 tiles with 1px margin - larger and more visible than Roguelike 16x16.
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { cn } from '@almadar/ui';

// Import the Pixel Platformer tileset
import tileSheet from '../assets/pixel-platformer/tilemap.png';

// Spritesheet configuration
const SPRITE_SIZE = 18; // Each tile is 18x18 pixels
const SPRITE_MARGIN = 1; // 1px margin between tiles
const TILE_STEP = SPRITE_SIZE + SPRITE_MARGIN; // 19px per tile
const SHEET_COLS = 20; // 20 columns in the tilemap
const DISPLAY_SCALE = 3; // Scale up for visibility (54x54 default)

// Tile types with their spritesheet positions (row, col)
// Based on tilemap.png layout - vibrant grass, dirt, water, ice tiles
export const PIXEL_TILE_SPRITES = {
    // Grass tiles (Row 0-1)
    grassFull: { row: 0, col: 0 },
    grassTopLeft: { row: 0, col: 1 },
    grassTop: { row: 0, col: 2 },
    grassTopRight: { row: 0, col: 3 },
    grassLeft: { row: 1, col: 0 },
    grassCenter: { row: 1, col: 1 },
    grassRight: { row: 1, col: 2 },

    // Dirt tiles (Row 2-3)
    dirtFull: { row: 2, col: 0 },
    dirtTopLeft: { row: 2, col: 1 },
    dirtTop: { row: 2, col: 2 },
    dirtTopRight: { row: 2, col: 3 },
    dirtLeft: { row: 3, col: 1 },
    dirtCenter: { row: 3, col: 2 },
    dirtRight: { row: 3, col: 3 },

    // Stone/Platform tiles (Row 4+)
    stoneBlock: { row: 4, col: 0 },
    stonePlatform: { row: 4, col: 1 },
    woodBlock: { row: 4, col: 4 },
    woodPlatform: { row: 4, col: 5 },

    // Water tiles (Row 5)
    waterTop: { row: 5, col: 0 },
    waterFull: { row: 5, col: 1 },

    // Ice tiles (Row 6)
    iceTop: { row: 6, col: 0 },
    iceFull: { row: 6, col: 1 },
    iceBlock: { row: 6, col: 2 },

    // Special tiles
    lava: { row: 5, col: 4 },
    spikes: { row: 7, col: 0 },
    chest: { row: 7, col: 8 },
    door: { row: 7, col: 6 },

    // Decorations
    bush: { row: 2, col: 8 },
    tree: { row: 1, col: 8 },
    flower: { row: 2, col: 10 },
    mushroom: { row: 2, col: 11 },
    rock: { row: 3, col: 8 },

    // UI elements from the sheet
    heart: { row: 0, col: 8 },
    heartHalf: { row: 0, col: 9 },
    heartEmpty: { row: 0, col: 10 },
    coin: { row: 0, col: 11 },
    gem: { row: 0, col: 12 },
} as const;

export type PixelTileType = keyof typeof PIXEL_TILE_SPRITES;

// Map legacy tile types to pixel tiles
export const TILE_TYPE_MAP: Record<string, PixelTileType> = {
    floorStone: 'stoneBlock',
    floorDirt: 'dirtCenter',
    floorWood: 'woodBlock',
    floorGrass: 'grassCenter',
    floorWater: 'waterFull',
    wallStone: 'stoneBlock',
    wallBrick: 'stoneBlock',
    wallWood: 'woodBlock',
    door: 'door',
    chest: 'chest',
    stairs: 'door',
    pit: 'lava',
    torch: 'flower',
    pillar: 'rock',
    fountain: 'waterTop',
};

export interface PixelTileSpriteProps {
    /** Type of tile to display */
    type: PixelTileType | keyof typeof TILE_TYPE_MAP;
    /** Size multiplier (default 3 = 54x54) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Highlight state */
    highlight?: 'none' | 'valid' | 'attack' | 'selected' | 'hover';
}

export function PixelTileSprite({
    type,
    scale = DISPLAY_SCALE,
    className,
    highlight = 'none',
}: PixelTileSpriteProps): JSX.Element {
    // Map legacy tile types to pixel tiles
    const mappedType = (type in PIXEL_TILE_SPRITES
        ? type
        : TILE_TYPE_MAP[type] || 'grassCenter') as PixelTileType;

    const sprite = PIXEL_TILE_SPRITES[mappedType];
    const displaySize = SPRITE_SIZE * scale;

    // Calculate background position (accounts for 1px margin between tiles)
    const bgX = sprite.col * TILE_STEP;
    const bgY = sprite.row * TILE_STEP;

    const highlightClasses = {
        none: '',
        valid: 'ring-2 ring-green-400 ring-offset-1 ring-offset-transparent',
        attack: 'ring-2 ring-red-500 ring-offset-1 ring-offset-transparent',
        selected: 'ring-3 ring-yellow-400 ring-offset-2 ring-offset-transparent',
        hover: 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent brightness-110',
    };

    return (
        <Box
            display="inline-block"
            className={cn(
                'relative transition-all duration-150',
                highlightClasses[highlight],
                className
            )}
            style={{
                width: displaySize,
                height: displaySize,
                backgroundImage: `url(${tileSheet})`,
                backgroundPosition: `-${bgX * scale}px -${bgY * scale}px`,
                backgroundSize: `${SHEET_COLS * TILE_STEP * scale}px auto`,
                imageRendering: 'pixelated',
            }}
        />
    );
}

export default PixelTileSprite;
