/**
 * Sprite Animation Engine
 *
 * Pure functions for sprite sheet animation: direction inference,
 * frame computation, sheet resolution, and animation state management.
 * No React dependencies — usable in any context.
 *
 * @packageDocumentation
 */
import type { AnimationName, FacingDirection, SpriteDirection, ResolvedFrame, UnitAnimationState, SpriteFrameDims, SpriteSheetUrls } from '../types/spriteAnimation';
/**
 * Infer facing direction from a movement delta on the isometric grid.
 * dx/dy are tile coordinate deltas (not screen pixels).
 *
 * Isometric grid:
 *   NW ← (-x)    NE ← (-y)
 *   SW ← (+y)    SE ← (+x)
 */
export declare function inferDirection(dx: number, dy: number): FacingDirection;
/**
 * Map a 4-direction facing to the actual sheet file direction + flipX flag.
 * We only have SE and SW sheet images. NE/NW are rendered by flipping:
 *   SE → SE sheet, no flip
 *   SW → SW sheet, no flip
 *   NE → SW sheet, flipX (mirror of SW gives NE)
 *   NW → SE sheet, flipX (mirror of SE gives NW)
 */
export declare function resolveSheetDirection(facing: FacingDirection): {
    sheetDir: SpriteDirection;
    flipX: boolean;
};
/**
 * Compute the current frame index and whether the animation has finished.
 */
export declare function getCurrentFrame(animName: AnimationName, elapsed: number): {
    frame: number;
    finished: boolean;
};
/**
 * Resolve a complete frame descriptor for canvas drawing.
 * Returns null if no sprite sheet URLs are available for this unit.
 */
export declare function resolveFrame(sheetUrls: SpriteSheetUrls | null, frameDims: SpriteFrameDims, animState: UnitAnimationState): ResolvedFrame | null;
/**
 * Create initial animation state for a unit (idle, facing SE).
 */
export declare function createUnitAnimationState(unitId: string): UnitAnimationState;
/**
 * Transition to a new animation. Resets elapsed time.
 * Optionally updates direction. Death cannot be overridden.
 */
export declare function transitionAnimation(state: UnitAnimationState, newAnim: AnimationName, direction?: FacingDirection): UnitAnimationState;
/**
 * Advance animation state by deltaMs.
 * Handles one-shot → queued/idle transitions automatically.
 */
export declare function tickAnimationState(state: UnitAnimationState, deltaMs: number): UnitAnimationState;
