import type { IsometricUnit } from '../types/isometric';
import type { AnimationName, FacingDirection, ResolvedFrame, SpriteFrameDims, SpriteSheetUrls } from '../types/spriteAnimation';
export interface UseSpriteAnimationsResult {
    /**
     * Sync unit list and advance all animation timers.
     * Call once per animation frame. Auto-detects movement
     * and infers direction from position deltas.
     */
    syncUnits: (units: IsometricUnit[], deltaMs: number) => void;
    /**
     * Explicitly set a unit's animation (for combat: attack, hit, death).
     * Optionally override direction.
     */
    setUnitAnimation: (unitId: string, animation: AnimationName, direction?: FacingDirection) => void;
    /**
     * Resolve the current frame for a unit. Returns null if no sprite sheet
     * is available for this unit (falls back to static sprite in canvas).
     * Pass this to IsometricCanvas.resolveUnitFrame.
     */
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
}
export interface UseSpriteAnimationsOptions {
    /** Playback speed multiplier. 1.0 = baseline, 2.0 = double speed. Default: 1. */
    speed?: number;
}
/**
 * Resolve sprite sheet URLs for a unit. Return null if no sheet available.
 * This is the project-agnostic callback version — projects pass manifest-specific logic.
 */
export type SheetUrlResolver = (unit: IsometricUnit) => SpriteSheetUrls | null;
/**
 * Resolve frame dimensions for a unit's sprite sheet.
 * Projects pass manifest-specific logic.
 */
export type FrameDimsResolver = (unit: IsometricUnit) => SpriteFrameDims | null;
/**
 * Hook for managing per-unit sprite sheet animations.
 *
 * @param getSheetUrls - Callback to resolve sprite sheet URLs for a unit
 * @param getFrameDims - Callback to resolve frame dimensions for a unit
 * @param options - Playback speed options
 */
export declare function useSpriteAnimations(getSheetUrls: SheetUrlResolver, getFrameDims: FrameDimsResolver, options?: UseSpriteAnimationsOptions): UseSpriteAnimationsResult;
