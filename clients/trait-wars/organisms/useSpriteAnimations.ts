/**
 * useSpriteAnimations Hook
 *
 * Manages per-unit sprite sheet animation state for the canvas draw loop.
 * Follows the useCanvasEffects pattern: mutable state in refs, pure functions
 * in utils, no re-renders per frame.
 *
 * Usage:
 *   const { syncUnits, setUnitAnimation, resolveUnitFrame } = useSpriteAnimations(manifest);
 *   // In animation loop: syncUnits(units, deltaMs)
 *   // Pass resolveUnitFrame to IsometricGameCanvas
 *   // On combat: setUnitAnimation(unitId, 'attack')
 */

import { useCallback, useRef } from 'react';
import type { TraitWarsAssetManifest } from '../assets';
import { getCharacterSheetUrls, getCharacterFrameDims } from '../assets';
import type { IsometricUnit } from './IsometricGameCanvas';
import type { AnimationName, FacingDirection, ResolvedFrame, UnitAnimationState } from '../types/spriteAnimation';
import {
    createUnitAnimationState,
    inferDirection,
    transitionAnimation,
    tickAnimationState,
    resolveFrame,
} from '../utils/spriteAnimation';

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
     * Pass this to IsometricGameCanvas.resolveUnitFrame.
     */
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
}

export function useSpriteAnimations(
    manifest: TraitWarsAssetManifest,
): UseSpriteAnimationsResult {
    const animStatesRef = useRef<Map<string, UnitAnimationState>>(new Map());
    const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const characterInfoRef = useRef<Map<string, string>>(new Map()); // unitId → characterId

    const syncUnits = useCallback((units: IsometricUnit[], deltaMs: number) => {
        const states = animStatesRef.current;
        const prevPos = prevPositionsRef.current;
        const charInfo = characterInfoRef.current;
        const currentIds = new Set<string>();

        for (const unit of units) {
            currentIds.add(unit.id);

            // Determine character ID for sprite sheet lookup
            const characterId = unit.heroId || unit.unitType;
            if (characterId) {
                charInfo.set(unit.id, characterId);
            }

            // Get or create animation state
            let state = states.get(unit.id);
            if (!state) {
                state = createUnitAnimationState(unit.id);
                states.set(unit.id, state);
            }

            // Skip animation if no sprite sheet for this character
            if (!characterId || !manifest.characterSheets?.[characterId]) {
                continue;
            }

            // Detect movement and infer direction
            const prev = prevPos.get(unit.id);
            if (prev) {
                const dx = unit.position.x - prev.x;
                const dy = unit.position.y - prev.y;

                if (dx !== 0 || dy !== 0) {
                    const dir = inferDirection(dx, dy);
                    // Don't interrupt combat animations
                    if (state.animation !== 'attack' && state.animation !== 'hit' && state.animation !== 'death') {
                        state = transitionAnimation(state, 'walk', dir);
                    }
                } else if (state.animation === 'walk') {
                    // Unit stopped moving — return to idle
                    state = transitionAnimation(state, 'idle');
                }
            }
            prevPos.set(unit.id, { ...unit.position });

            // Tick animation forward
            state = tickAnimationState(state, deltaMs);
            states.set(unit.id, state);
        }

        // Clean up removed units
        for (const id of states.keys()) {
            if (!currentIds.has(id)) {
                states.delete(id);
                prevPos.delete(id);
                charInfo.delete(id);
            }
        }
    }, [manifest]);

    const setUnitAnimation = useCallback((
        unitId: string,
        animation: AnimationName,
        direction?: FacingDirection,
    ) => {
        const states = animStatesRef.current;
        let state = states.get(unitId);
        if (!state) {
            state = createUnitAnimationState(unitId);
        }
        state = transitionAnimation(state, animation, direction);
        states.set(unitId, state);
    }, []);

    const resolveUnitFrame = useCallback((unitId: string): ResolvedFrame | null => {
        const state = animStatesRef.current.get(unitId);
        if (!state) return null;

        const characterId = characterInfoRef.current.get(unitId);
        if (!characterId) return null;

        const sheetUrls = getCharacterSheetUrls(manifest, characterId);
        const frameDims = getCharacterFrameDims(manifest, characterId);
        if (!sheetUrls || !frameDims) return null;

        return resolveFrame(sheetUrls, frameDims, state);
    }, [manifest]);

    return { syncUnits, setUnitAnimation, resolveUnitFrame };
}
