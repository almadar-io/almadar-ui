/**
 * CharacterSprite Component
 *
 * Renders a character from the Roguelike Characters Pack spritesheet.
 * The spritesheet is 16x16 tiles.
 */

import React from 'react';
import { Box } from '../../../components/atoms/Box';
import { cn } from '../../../lib/cn';

// Import the character spritesheet
import characterSheet from '../assets/characters/roguelike_characters.png';

// Spritesheet configuration
const SPRITE_SIZE = 16; // Each sprite is 16x16 pixels
const SPRITE_MARGIN = 1; // 1px margin between sprites
const SHEET_COLS = 57; // ~57 columns in the sheet
const DISPLAY_SCALE = 3; // Scale up for visibility

// Character types with their spritesheet positions (row, col)
export const CHARACTER_SPRITES = {
    // Row 0: Body types
    bodyHuman: { row: 0, col: 0 },
    bodyElf: { row: 0, col: 1 },
    bodyDwarf: { row: 0, col: 2 },
    bodyOrc: { row: 0, col: 3 },

    // Row 4-7: Full characters
    knight: { row: 4, col: 0 },
    mage: { row: 4, col: 1 },
    rogue: { row: 4, col: 2 },
    archer: { row: 4, col: 3 },
    healer: { row: 4, col: 4 },
    warrior: { row: 4, col: 5 },

    // Enemies
    skeleton: { row: 5, col: 0 },
    zombie: { row: 5, col: 1 },
    ghost: { row: 5, col: 2 },
    demon: { row: 5, col: 3 },
    dragon: { row: 5, col: 4 },
    slime: { row: 5, col: 5 },
} as const;

export type CharacterType = keyof typeof CHARACTER_SPRITES;

export interface CharacterSpriteProps {
    /** Type of character to display */
    type: CharacterType;
    /** Size multiplier (default 3 = 48x48) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to apply team color tint */
    team?: 'player' | 'enemy' | 'neutral';
    /** Current state for visual indication */
    state?: 'idle' | 'attacking' | 'defending' | 'casting' | 'wounded';
}

/**
 * CharacterSprite renders a character from the Roguelike spritesheet.
 */
export function CharacterSprite({
    type,
    scale = DISPLAY_SCALE,
    className,
    team = 'neutral',
    state = 'idle',
}: CharacterSpriteProps): JSX.Element {
    const sprite = CHARACTER_SPRITES[type];
    const displaySize = SPRITE_SIZE * scale;

    // Calculate background position (accounts for 1px margin between sprites)
    const TILE_STEP = SPRITE_SIZE + SPRITE_MARGIN;
    const bgX = sprite.col * TILE_STEP;
    const bgY = sprite.row * TILE_STEP;

    // Team color filters
    const teamFilters = {
        player: 'hue-rotate(200deg) saturate(1.2)',
        enemy: 'hue-rotate(-30deg) saturate(1.3)',
        neutral: 'none',
    };

    // State-based effects
    const stateClasses = {
        idle: '',
        attacking: 'animate-pulse brightness-110',
        defending: 'brightness-75',
        casting: 'brightness-125 contrast-110',
        wounded: 'grayscale-[50%] brightness-75',
    };

    return (
        <Box
            display="inline-block"
            className={cn(
                'relative',
                stateClasses[state],
                className
            )}
            style={{
                width: displaySize,
                height: displaySize,
                backgroundImage: `url(${characterSheet})`,
                backgroundPosition: `-${bgX * scale}px -${bgY * scale}px`,
                backgroundSize: `${SHEET_COLS * TILE_STEP * scale}px auto`,
                imageRendering: 'pixelated',
                filter: teamFilters[team],
            }}
        />
    );
}

export default CharacterSprite;
