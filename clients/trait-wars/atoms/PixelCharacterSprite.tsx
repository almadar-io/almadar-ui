/**
 * PixelCharacterSprite Component
 *
 * High-fidelity character sprites from the Pixel Platformer Pack.
 * 24x24 sprites with 1px margin - larger and more visible than Roguelike 16x16.
 * Assets are loaded dynamically via the TraitWarsAssetProvider.
 */

import React from 'react';
import { Box, cn } from '@almadar/ui';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getSpriteSheetUrl } from '../assets';

// Spritesheet configuration
const SPRITE_SIZE = 24; // Each sprite is 24x24 pixels
const SPRITE_MARGIN = 1; // 1px margin between sprites
const TILE_STEP = SPRITE_SIZE + SPRITE_MARGIN; // 25px per tile
const SHEET_COLS = 9; // 9 columns in the character sheet
const DISPLAY_SCALE = 2; // Scale up for visibility (48x48 default)

// Character types with their spritesheet positions (row, col)
// Based on tilemap-characters.png layout
export const PIXEL_CHARACTER_SPRITES = {
    // Row 0: Main characters
    robotTeal: { row: 0, col: 0 },      // Teal robot - great for knight
    alienYellow: { row: 0, col: 1 },    // Yellow alien - great for mage
    robotPink: { row: 0, col: 2 },      // Pink robot - great for support
    alienGreen: { row: 0, col: 3 },     // Green alien
    robotOrange: { row: 0, col: 4 },    // Orange robot
    alienBlue: { row: 0, col: 5 },      // Blue alien
    robotGray: { row: 0, col: 6 },      // Gray robot
    alienPurple: { row: 0, col: 7 },    // Purple alien
    robotRed: { row: 0, col: 8 },       // Red robot

    // Row 1: Alternative characters / expressions
    robotTealAlt: { row: 1, col: 0 },
    alienYellowAlt: { row: 1, col: 1 },
    robotPinkAlt: { row: 1, col: 2 },
    alienGreenAlt: { row: 1, col: 3 },
    robotOrangeAlt: { row: 1, col: 4 },
    alienBlueAlt: { row: 1, col: 5 },
    robotGrayAlt: { row: 1, col: 6 },
    alienPurpleAlt: { row: 1, col: 7 },
    robotRedAlt: { row: 1, col: 8 },

    // Row 2: Items/heads
    coinGold: { row: 2, col: 0 },
    coinSilver: { row: 2, col: 1 },
    heart: { row: 2, col: 2 },
    star: { row: 2, col: 3 },
    gem: { row: 2, col: 4 },
    key: { row: 2, col: 5 },
    skull: { row: 2, col: 6 },
    bomb: { row: 2, col: 7 },
    flag: { row: 2, col: 8 },
} as const;

export type PixelCharacterType = keyof typeof PIXEL_CHARACTER_SPRITES;

// Map game character types to pixel sprites
export const CHARACTER_TYPE_MAP: Record<string, PixelCharacterType> = {
    // Player units
    knight: 'robotTeal',
    warrior: 'robotOrange',
    mage: 'alienYellow',
    healer: 'robotPink',
    archer: 'alienGreen',
    rogue: 'alienBlue',

    // Enemy units
    skeleton: 'robotGray',
    zombie: 'robotRed',
    ghost: 'alienPurple',
    demon: 'robotRedAlt',
    dragon: 'alienPurpleAlt',
    slime: 'alienGreenAlt',

    // Fallback mappings
    bodyHuman: 'robotTeal',
    bodyElf: 'alienYellow',
    bodyDwarf: 'robotOrange',
    bodyOrc: 'robotRed',
};

export interface PixelCharacterSpriteProps {
    /** Type of character to display */
    type: PixelCharacterType | keyof typeof CHARACTER_TYPE_MAP;
    /** Size multiplier (default 2 = 48x48) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to apply team color tint */
    team?: 'player' | 'enemy' | 'neutral';
    /** Current state for visual indication */
    state?: 'idle' | 'attacking' | 'defending' | 'casting' | 'wounded';
}

/**
 * PixelCharacterSprite renders a high-fidelity character from the Pixel Platformer spritesheet.
 */
export function PixelCharacterSprite({
    type,
    scale = DISPLAY_SCALE,
    className,
    team = 'neutral',
    state = 'idle',
}: PixelCharacterSpriteProps): JSX.Element {
    // Get asset manifest from context or use default
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const spriteSheetUrl = getSpriteSheetUrl(assets, 'pixelCharacters');

    // Map legacy character types to pixel sprites
    const mappedType = (type in PIXEL_CHARACTER_SPRITES
        ? type
        : CHARACTER_TYPE_MAP[type] || 'robotTeal') as PixelCharacterType;

    const sprite = PIXEL_CHARACTER_SPRITES[mappedType];
    const displaySize = SPRITE_SIZE * scale;

    // Calculate background position (accounts for 1px margin between sprites)
    const bgX = sprite.col * TILE_STEP;
    const bgY = sprite.row * TILE_STEP;

    // Team color filters
    const teamFilters = {
        player: 'hue-rotate(0deg) saturate(1.2) brightness(1.1)',
        enemy: 'hue-rotate(-20deg) saturate(1.4) brightness(0.9)',
        neutral: 'none',
    };

    // State-based effects
    const stateClasses = {
        idle: '',
        attacking: 'animate-pulse brightness-125 drop-shadow-[0_0_4px_rgba(255,100,100,0.8)]',
        defending: 'brightness-90 drop-shadow-[0_0_4px_rgba(100,100,255,0.8)]',
        casting: 'brightness-125 drop-shadow-[0_0_6px_rgba(255,255,100,0.9)]',
        wounded: 'grayscale-[40%] brightness-75 opacity-80',
    };

    if (!spriteSheetUrl) {
        return (
            <Box
                display="inline-block"
                className={cn('bg-blue-300 rounded-full', className)}
                style={{ width: displaySize, height: displaySize }}
            />
        );
    }

    return (
        <Box
            display="inline-block"
            className={cn(
                'relative transition-all duration-200',
                stateClasses[state],
                className
            )}
            style={{
                width: displaySize,
                height: displaySize,
                backgroundImage: `url(${spriteSheetUrl})`,
                backgroundPosition: `-${bgX * scale}px -${bgY * scale}px`,
                backgroundSize: `${SHEET_COLS * TILE_STEP * scale}px auto`,
                imageRendering: 'pixelated',
                filter: teamFilters[team],
            }}
        />
    );
}

export default PixelCharacterSprite;
