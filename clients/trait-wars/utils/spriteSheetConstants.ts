/**
 * Sprite Sheet Constants
 *
 * Shared layout constants for the sprite sheet animation system.
 * All 31 characters use identical 8-col x 5-row grid layout.
 */

import type { AnimationName, AnimationDef } from '../types/spriteAnimation';

/** Animation definitions for each row in the sprite sheet.
 *  Frame rates are intentionally low — we have very few frames per
 *  animation, so slower playback looks more natural.
 */
export const SPRITE_SHEET_LAYOUT: Record<AnimationName, AnimationDef> = {
    idle:   { row: 0, frames: 4, frameRate: 3,  loop: true },
    walk:   { row: 1, frames: 6, frameRate: 5,  loop: true },
    attack: { row: 2, frames: 4, frameRate: 6,  loop: false },
    hit:    { row: 3, frames: 2, frameRate: 4,  loop: false },
    death:  { row: 4, frames: 4, frameRate: 3,  loop: false },
};

/** Frame dimensions for robot units (128x128 frames, 1024x640 sheet) */
export const ROBOT_FRAME = { width: 128, height: 128 } as const;

/** Frame dimensions for hero/villain units (256x256 frames, 2048x1280 sheet) */
export const HERO_FRAME = { width: 256, height: 256 } as const;

/** Number of columns in the sprite sheet grid */
export const SHEET_COLUMNS = 8;
