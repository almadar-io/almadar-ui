/**
 * Sprite Sheet Constants
 *
 * Standard layout for 8-column × 5-row character sprite sheets.
 * All characters share identical sheet geometry.
 *
 * @packageDocumentation
 */
import type { AnimationDef, AnimationName } from '../types/spriteAnimation';
/** Number of columns in a sprite sheet (frames per row) */
export declare const SHEET_COLUMNS = 8;
/**
 * Standard sprite sheet row layout.
 * Row 0 = idle, Row 1 = walk, Row 2 = attack, Row 3 = hit, Row 4 = death.
 */
export declare const SPRITE_SHEET_LAYOUT: Record<AnimationName, AnimationDef>;
