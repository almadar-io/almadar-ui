/**
 * Sprite Sheet Animation Types
 *
 * Type definitions for frame-based sprite sheet animation system.
 * All 31 characters share identical sheet layout (8 cols x 5 rows).
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
    sheetUrl: string;
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
