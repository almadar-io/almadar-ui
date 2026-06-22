import type { AssetUrl } from '@almadar/core';

/**
 * Sprite Sheet Animation Types
 *
 * Type definitions for frame-based sprite sheet animation system.
 * Supports standard 8-column × 5-row character sheets.
 *
 * @packageDocumentation
 */

/** Animation names matching sprite sheet row layout */
export type AnimationName = 'idle' | 'walk' | 'attack' | 'hit' | 'death';

/** Sheet file directions (physical PNG files) */
export type SpriteDirection = 'se' | 'sw';

/** Unit facing direction on screen (4 isometric directions) */
export type FacingDirection = 'se' | 'sw' | 'ne' | 'nw';

/** Definition for a single animation row in the sprite sheet */
export interface AnimationDef {
    /** Row index in the sprite sheet (0-4) */
    row: number;
    /** Number of frames in this animation */
    frames: number;
    /** Frames per second */
    frameRate: number;
    /** Whether the animation loops */
    loop: boolean;
}

/** A resolved frame ready to draw on canvas */
export interface ResolvedFrame {
    /** URL of the sprite sheet image */
    sheetUrl: AssetUrl;
    /** Source X in the sheet (pixel offset) */
    sx: number;
    /** Source Y in the sheet (pixel offset) */
    sy: number;
    /** Source width (frame width) */
    sw: number;
    /** Source height (frame height) */
    sh: number;
    /** Whether to flip horizontally when drawing (for NE/NW directions) */
    flipX: boolean;
    /** When true, canvas should apply sine-bob breathing offset (frozen idle frame) */
    applyBreathing?: boolean;
}

/** Per-unit animation state tracked in the animation system */
export interface UnitAnimationState {
    /** Unit identifier */
    unitId: string;
    /** Current animation playing */
    animation: AnimationName;
    /** Current facing direction */
    direction: FacingDirection;
    /** Current frame index within the animation */
    frame: number;
    /** Elapsed time in current animation (ms) */
    elapsed: number;
    /** Animation to play after current one-shot completes (null = idle) */
    queuedAnimation: AnimationName | null;
    /** Whether the current one-shot animation has finished its last frame */
    finished: boolean;
}

/** Frame dimensions for a sprite sheet */
export interface SpriteFrameDims {
    /** Width of a single frame in pixels */
    width: number;
    /** Height of a single frame in pixels */
    height: number;
}

/** Sheet URLs for both directions */
export interface SpriteSheetUrls {
    /** Southeast-facing sheet URL */
    se: AssetUrl;
    /** Southwest-facing sheet URL */
    sw: AssetUrl;
}

/**
 * Parsed sprite-sheet atlas JSON (e.g. `guardian-sprite-sheet.json`).
 * Sits next to the `.png` sheets and drives the frame rect deterministically.
 */
export interface SpriteAtlas {
    /** Unit archetype key */
    unit?: string;
    /** Visual type key */
    type?: string;
    /** Width of a single frame in pixels */
    frameWidth: number;
    /** Height of a single frame in pixels */
    frameHeight: number;
    /** Number of columns (frames per row) */
    columns: number;
    /** Number of rows (animations) */
    rows: number;
    /** Directions present as physical PNG files */
    directions: SpriteDirection[];
    /** Relative PNG sheet paths per direction */
    sheets: Partial<Record<SpriteDirection, string>>;
    /** Animation row layout keyed by animation name */
    animations: Partial<Record<AnimationName, AnimationDef>>;
}
