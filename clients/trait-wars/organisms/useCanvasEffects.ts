/**
 * useCanvasEffects Hook
 *
 * Manages canvas effect state (particles, sequences, overlays) and provides:
 * - `effectSpriteUrls` for preloading via useImageCache
 * - `spawnCombatEffect(type, tileX, tileY)` to trigger effects at tile positions
 * - `drawEffects(ctx, animTime, getImage)` callback for the canvas draw loop
 * - `hasActiveEffects` to keep RAF alive while effects are rendering
 * - `screenShake` offset to apply to camera
 * - `screenFlash` color/alpha for DOM overlay
 */

import { useRef, useMemo, useCallback, useState } from 'react';
import type { TraitWarsAssetManifest } from '../assets';
import { getAllEffectSpriteUrls } from '../assets';
import {
    isoToScreen,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
} from './IsometricGameCanvas';
import type { CanvasEffectState, CombatActionType } from '../types/effects';
import { EMPTY_EFFECT_STATE } from '../types/effects';
import {
    spawnParticles,
    spawnSequence,
    spawnOverlay,
    updateEffectState,
    drawEffectState,
    hasActiveEffects as checkActive,
} from '../utils/canvasEffects';
import { createCombatPresets } from '../utils/combatPresets';

export interface UseCanvasEffectsOptions {
    manifest: TraitWarsAssetManifest;
    scale: number;
    baseOffsetX: number;
}

export interface UseCanvasEffectsResult {
    /** All effect sprite URLs for preloading via useImageCache */
    effectSpriteUrls: string[];
    /** Spawn a combat effect at the given tile position */
    spawnCombatEffect: (type: CombatActionType, tileX: number, tileY: number) => void;
    /** Draw all active effects — call inside draw() after units, before ctx.restore() */
    drawEffects: (ctx: CanvasRenderingContext2D, animTime: number, getImage: (url: string) => HTMLImageElement | undefined) => void;
    /** Whether there are active effects (keeps RAF alive) */
    hasActiveEffects: boolean;
    /** Screen shake offset to apply to container transform */
    screenShake: { x: number; y: number };
    /** Screen flash overlay (null = no flash) */
    screenFlash: { color: string; alpha: number } | null;
}

export function useCanvasEffects({
    manifest,
    scale,
    baseOffsetX,
}: UseCanvasEffectsOptions): UseCanvasEffectsResult {
    // Effect state stored in ref to avoid re-renders per frame
    const stateRef = useRef<CanvasEffectState>({ ...EMPTY_EFFECT_STATE });
    const lastTimeRef = useRef<number>(0);
    const shakeRef = useRef<{ x: number; y: number; intensity: number }>({ x: 0, y: 0, intensity: 0 });

    // Track active state in React state (updated when effects spawn/expire)
    const [active, setActive] = useState(false);
    const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
    const [screenFlash, setScreenFlash] = useState<{ color: string; alpha: number } | null>(null);

    // Precompute all effect sprite URLs for preloading
    const effectSpriteUrls = useMemo(
        () => getAllEffectSpriteUrls(manifest),
        [manifest],
    );

    // Build preset factories (memoized per manifest)
    const presets = useMemo(
        () => createCombatPresets(manifest),
        [manifest],
    );

    // Spawn a combat effect at a tile position
    const spawnCombatEffect = useCallback((type: CombatActionType, tileX: number, tileY: number) => {
        const now = performance.now();

        // Convert tile coords to screen coords (center of tile floor diamond)
        const pos = isoToScreen(tileX, tileY, scale, baseOffsetX);
        const scaledTileWidth = TILE_WIDTH * scale;
        const scaledTileHeight = TILE_HEIGHT * scale;
        const scaledFloorHeight = FLOOR_HEIGHT * scale;
        // Center of the floor diamond
        const screenX = pos.x + scaledTileWidth / 2;
        const screenY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight / 2;

        const preset = presets[type](screenX, screenY);
        const state = stateRef.current;

        // Spawn particles
        for (const emitter of preset.particles) {
            state.particles.push(...spawnParticles(emitter, now));
        }

        // Spawn sequences
        for (const seqConfig of preset.sequences) {
            state.sequences.push(spawnSequence(seqConfig, now));
        }

        // Spawn overlays
        for (const ovConfig of preset.overlays) {
            state.overlays.push(spawnOverlay(ovConfig, now));
        }

        // Screen shake
        if (preset.screenShake > 0) {
            shakeRef.current.intensity = preset.screenShake;
        }

        // Screen flash
        if (preset.screenFlash) {
            const { r, g, b, duration } = preset.screenFlash;
            setScreenFlash({ color: `rgb(${r}, ${g}, ${b})`, alpha: 0.3 });
            setTimeout(() => setScreenFlash(null), duration);
        }

        setActive(true);
    }, [presets, scale, baseOffsetX]);

    // Draw callback — called from canvas draw() after units
    const drawEffects = useCallback((
        ctx: CanvasRenderingContext2D,
        animTime: number,
        getImage: (url: string) => HTMLImageElement | undefined,
    ) => {
        // Calculate delta
        const delta = lastTimeRef.current > 0 ? animTime - lastTimeRef.current : 16;
        lastTimeRef.current = animTime;

        // Update physics
        stateRef.current = updateEffectState(stateRef.current, animTime, delta);

        // Update screen shake
        if (shakeRef.current.intensity > 0.2) {
            const i = shakeRef.current.intensity;
            shakeRef.current.x = (Math.random() - 0.5) * i * 2;
            shakeRef.current.y = (Math.random() - 0.5) * i * 2;
            shakeRef.current.intensity *= 0.85; // exponential decay
            setScreenShake({ x: shakeRef.current.x, y: shakeRef.current.y });
        } else if (shakeRef.current.intensity > 0) {
            shakeRef.current = { x: 0, y: 0, intensity: 0 };
            setScreenShake({ x: 0, y: 0 });
        }

        // Draw effects
        drawEffectState(ctx, stateRef.current, animTime, getImage);

        // Update active state
        const isActive = checkActive(stateRef.current);
        if (!isActive && active) {
            setActive(false);
        }
    }, [active]);

    return {
        effectSpriteUrls,
        spawnCombatEffect,
        drawEffects,
        hasActiveEffects: active,
        screenShake,
        screenFlash,
    };
}
