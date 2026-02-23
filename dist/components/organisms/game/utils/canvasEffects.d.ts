/**
 * Canvas Effect Engine
 *
 * Pure functions for spawning, updating, and drawing canvas effects.
 * No React dependencies — called from the RAF loop via useCanvasEffects hook.
 *
 * Ported from trait-wars and generalized for any almadar-ui client.
 */
import type { CanvasParticle, CanvasSequence, CanvasOverlay, CanvasEffectState, ParticleEmitterConfig, SequenceConfig, OverlayConfig } from '../types/effects';
/**
 * Draw a sprite tinted with an RGB color onto the main canvas.
 * Uses offscreen canvas with `source-atop` compositing to recolor
 * white-on-transparent sprites.
 */
export declare function drawTintedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement | ImageBitmap, x: number, y: number, w: number, h: number, tint: {
    r: number;
    g: number;
    b: number;
}, alpha: number, blendMode?: GlobalCompositeOperation): void;
/**
 * Spawn a burst of particles from an emitter config.
 */
export declare function spawnParticles(config: ParticleEmitterConfig, animTime: number): CanvasParticle[];
/**
 * Spawn a frame sequence animation.
 */
export declare function spawnSequence(config: SequenceConfig, animTime: number): CanvasSequence;
/**
 * Spawn an overlay effect.
 */
export declare function spawnOverlay(config: OverlayConfig, animTime: number): CanvasOverlay;
/**
 * Advance effect state by one frame. Returns new state with expired effects removed.
 */
export declare function updateEffectState(state: CanvasEffectState, animTime: number, deltaMs: number): CanvasEffectState;
type GetImageFn = (url: string) => HTMLImageElement | undefined;
/**
 * Draw all active effects onto the canvas.
 */
export declare function drawEffectState(ctx: CanvasRenderingContext2D, state: CanvasEffectState, animTime: number, getImage: GetImageFn): void;
export declare function hasActiveEffects(state: CanvasEffectState): boolean;
/**
 * Collect all sprite URLs from an EffectAssetManifest for preloading.
 */
export declare function getAllEffectSpriteUrls(manifest: {
    baseUrl: string;
    particles?: Record<string, string[] | string | undefined>;
    animations?: Record<string, string[] | undefined>;
}): string[];
export {};
