/**
 * TileSprite Component
 *
 * Renders a tile from the Roguelike Dungeon Pack spritesheet.
 * Assets are loaded dynamically via the TraitWarsAssetProvider.
 */

import React from 'react';
import { Box, cn } from '@almadar/ui';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getSpriteSheetUrl } from '../assets';

// Spritesheet configuration
const SPRITE_SIZE = 16;
const SPRITE_MARGIN = 1; // 1px margin between tiles
const SHEET_COLS = 31; // ~31 columns in the dungeon sheet
const DISPLAY_SCALE = 3;

// Tile types with their spritesheet positions (row, col)
export const TILE_SPRITES = {
    // Floor tiles
    floorStone: { row: 0, col: 0 },
    floorDirt: { row: 0, col: 1 },
    floorWood: { row: 0, col: 2 },
    floorGrass: { row: 0, col: 3 },
    floorWater: { row: 0, col: 4 },

    // Wall tiles
    wallStone: { row: 1, col: 0 },
    wallBrick: { row: 1, col: 1 },
    wallWood: { row: 1, col: 2 },

    // Special tiles
    door: { row: 2, col: 0 },
    chest: { row: 2, col: 1 },
    stairs: { row: 2, col: 2 },
    pit: { row: 2, col: 3 },

    // Decorations
    torch: { row: 3, col: 0 },
    pillar: { row: 3, col: 1 },
    fountain: { row: 3, col: 2 },
} as const;

export type TileType = keyof typeof TILE_SPRITES;

export interface TileSpriteProps {
    /** Type of tile to display */
    type: TileType;
    /** Size multiplier (default 3 = 48x48) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Highlight state */
    highlight?: 'none' | 'valid' | 'attack' | 'selected';
}

export function TileSprite({
    type,
    scale = DISPLAY_SCALE,
    className,
    highlight = 'none',
}: TileSpriteProps): JSX.Element {
    // Get asset manifest from context or use default
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const spriteSheetUrl = getSpriteSheetUrl(assets, 'dungeonTilemap');

    const sprite = TILE_SPRITES[type];
    const displaySize = SPRITE_SIZE * scale;

    // Calculate background position (accounts for 1px margin between tiles)
    const TILE_STEP = SPRITE_SIZE + SPRITE_MARGIN;
    const bgX = sprite.col * TILE_STEP;
    const bgY = sprite.row * TILE_STEP;

    const highlightClasses = {
        none: '',
        valid: 'ring-2 ring-green-400 ring-offset-1',
        attack: 'ring-2 ring-red-400 ring-offset-1',
        selected: 'ring-2 ring-yellow-400 ring-offset-2',
    };

    if (!spriteSheetUrl) {
        return (
            <Box
                display="inline-block"
                className={cn('bg-gray-300', className)}
                style={{ width: displaySize, height: displaySize }}
            />
        );
    }

    return (
        <Box
            display="inline-block"
            className={cn(
                'relative',
                highlightClasses[highlight],
                className
            )}
            style={{
                width: displaySize,
                height: displaySize,
                backgroundImage: `url(${spriteSheetUrl})`,
                backgroundPosition: `-${bgX * scale}px -${bgY * scale}px`,
                backgroundSize: `${SHEET_COLS * TILE_STEP * scale}px auto`,
                imageRendering: 'pixelated',
            }}
        />
    );
}

export default TileSprite;
