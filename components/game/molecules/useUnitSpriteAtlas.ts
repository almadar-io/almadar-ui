'use client';
/**
 * useUnitSpriteAtlas
 *
 * Self-contained sprite-sheet animation for board/canvas units.
 *
 * Given each unit's `spriteSheet` atlas-JSON URL, this hook loads the atlas
 * (the `.json` that sits next to the `.png` sheets), tracks per-unit animation
 * state on a RAF tick, and returns a `resolveUnitFrame(unitId)` that yields a
 * single cropped frame rect — never the whole sheet. The frame rect math
 * mirrors `atoms/Sprite.tsx` (`sx = (frame % columns) * frameWidth`,
 * `sy = row * frameHeight`).
 *
 * Animation state is driven from the unit's data: a position change since the
 * last sync plays `walk`; otherwise the unit holds `idle` (frozen frame 0 with
 * a breathing bob). The fallback is always frame 0 of `idle`.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AssetUrl } from '@almadar/core';
import type { IsometricUnit } from '../organisms/types/isometric';
import type {
    AnimationName,
    FacingDirection,
    ResolvedFrame,
    SpriteAtlas,
} from '../organisms/types/spriteAnimation';
import {
    frameRect,
    getCurrentFrameFromDef,
    inferDirection,
    resolveSheetDirection,
} from '../organisms/utils/spriteAnimation';

/** Minimum time (ms) to hold the walk animation after a position change. */
const WALK_HOLD_MS = 600;

/**
 * Resolve the sprite-sheet atlas-JSON URL for a unit.
 *
 * An explicit `unit.spriteSheet` wins. Otherwise, when the unit's static
 * `sprite` points at a directional sheet PNG, derive its sibling atlas JSON by
 * the deterministic naming convention used in `shared/sprite-sheets/`:
 * the shared atlas drops the `-se` / `-sw` direction suffix and any `-vN`
 * variant suffix, then swaps `.png` → `.json`
 * (`amir-sprite-sheet-se.png` → `amir-sprite-sheet.json`).
 *
 * Returns null when no atlas can be resolved (the unit keeps its static draw).
 */
export function unitAtlasUrl(unit: Pick<IsometricUnit, 'spriteSheet' | 'sprite'>): AssetUrl | null {
    if (unit.spriteSheet) return unit.spriteSheet;
    const sprite = unit.sprite;
    if (!sprite) return null;
    const match = /^(.*-sprite-sheet)(?:-(?:se|sw))?(?:-v\d+)?\.png$/.exec(sprite);
    if (!match) return null;
    return `${match[1]}.json`;
}

/** Per-unit mutable animation state tracked across RAF ticks. */
interface UnitAnimState {
    animation: AnimationName;
    direction: FacingDirection;
    elapsed: number;
    walkHold: number;
    prev: { x: number; y: number } | null;
}

/** Resolve the absolute atlas `.png` sheet URL from the atlas JSON URL + relative sheet path. */
function resolveSheetUrl(atlasUrl: string, relativeSheetPath: string): string {
    try {
        return new URL(relativeSheetPath, atlasUrl).toString();
    } catch {
        const base = atlasUrl.slice(0, atlasUrl.lastIndexOf('/') + 1);
        return `${base}${relativeSheetPath.replace(/^\.\//, '')}`;
    }
}

export interface UseUnitSpriteAtlasResult {
    /** Atlas-JSON URLs successfully loaded — feed these to no one; sheet PNGs are returned below. */
    sheetUrls: string[];
    /** Resolve the current single-frame rect for a unit, or null if its atlas isn't loaded. */
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
    /** Whether any atlas is still loading (drives isLoading / keeps RAF alive). */
    pendingCount: number;
}

/**
 * Load per-unit sprite atlases and drive single-frame animation.
 *
 * @param units - Units to animate. Only units with a `spriteSheet` URL participate.
 */
export function useUnitSpriteAtlas(units: IsometricUnit[]): UseUnitSpriteAtlasResult {
    const atlasCacheRef = useRef<Map<string, SpriteAtlas>>(new Map());
    const loadingRef = useRef<Set<string>>(new Set());
    const [pendingCount, setPendingCount] = useState(0);
    const [, forceTick] = useState(0);

    const animStatesRef = useRef<Map<string, UnitAnimState>>(new Map());
    const lastTickRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    // Distinct atlas-JSON URLs requested by the current units (explicit or derived).
    const atlasUrls = useMemo(() => {
        const set = new Set<string>();
        for (const unit of units) {
            const url = unitAtlasUrl(unit);
            if (url) set.add(url);
        }
        return [...set];
    }, [units]);

    // Load atlas JSON files.
    useEffect(() => {
        const cache = atlasCacheRef.current;
        const loading = loadingRef.current;
        const toLoad = atlasUrls.filter((url) => !cache.has(url) && !loading.has(url));
        if (toLoad.length === 0) return;

        let cancelled = false;
        setPendingCount((prev) => prev + toLoad.length);
        for (const url of toLoad) {
            loading.add(url);
            fetch(url)
                .then((res) => (res.ok ? (res.json() as Promise<SpriteAtlas>) : Promise.reject(new Error(String(res.status)))))
                .then((atlas) => {
                    if (cancelled) return;
                    cache.set(url, atlas);
                })
                .catch(() => {
                    /* leave unloaded → unit keeps its static fallback */
                })
                .finally(() => {
                    if (cancelled) return;
                    loading.delete(url);
                    setPendingCount((prev) => Math.max(0, prev - 1));
                    forceTick((n) => n + 1);
                });
        }
        return () => {
            cancelled = true;
        };
    }, [atlasUrls]);

    // Per-unit sheet PNG URLs to preload via the canvas image cache.
    const sheetUrls = useMemo(() => {
        const urls = new Set<string>();
        for (const unit of units) {
            const atlasUrl = unitAtlasUrl(unit);
            if (!atlasUrl) continue;
            const atlas = atlasCacheRef.current.get(atlasUrl);
            if (!atlas) continue;
            for (const rel of Object.values(atlas.sheets)) {
                if (rel) urls.add(resolveSheetUrl(atlasUrl, rel));
            }
        }
        return [...urls];
    }, [units, pendingCount]);

    // Advance animation timers from unit data on a RAF tick.
    useEffect(() => {
        const hasAtlasUnits = units.some((u) => unitAtlasUrl(u) !== null);
        if (!hasAtlasUnits) return;

        let running = true;
        const tick = (ts: number) => {
            if (!running) return;
            const last = lastTickRef.current || ts;
            const delta = ts - last;
            lastTickRef.current = ts;

            const states = animStatesRef.current;
            const currentIds = new Set<string>();
            for (const unit of units) {
                if (unitAtlasUrl(unit) === null) continue;
                currentIds.add(unit.id);
                let state = states.get(unit.id);
                if (!state) {
                    state = { animation: 'idle', direction: 'se', elapsed: 0, walkHold: 0, prev: null };
                    states.set(unit.id, state);
                }
                const posX = unit.position?.x ?? unit.x ?? 0;
                const posY = unit.position?.y ?? unit.y ?? 0;
                if (state.prev) {
                    const dx = posX - state.prev.x;
                    const dy = posY - state.prev.y;
                    if (dx !== 0 || dy !== 0) {
                        state.animation = 'walk';
                        state.direction = inferDirection(dx, dy);
                        state.walkHold = WALK_HOLD_MS;
                    } else if (state.animation === 'walk') {
                        state.walkHold -= delta;
                        if (state.walkHold <= 0) state.animation = 'idle';
                    }
                }
                state.prev = { x: posX, y: posY };
                state.elapsed += delta;
            }
            for (const id of states.keys()) {
                if (!currentIds.has(id)) states.delete(id);
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(rafRef.current);
            lastTickRef.current = 0;
        };
    }, [units]);

    const resolveUnitFrame = useCallback((unitId: string): ResolvedFrame | null => {
        const unit = units.find((u) => u.id === unitId);
        if (!unit) return null;
        const atlasUrl = unitAtlasUrl(unit);
        if (!atlasUrl) return null;
        const atlas = atlasCacheRef.current.get(atlasUrl);
        if (!atlas) return null;

        const state = animStatesRef.current.get(unitId);
        const animation: AnimationName = state?.animation ?? 'idle';
        const direction: FacingDirection = state?.direction ?? 'se';
        const elapsed = state?.elapsed ?? 0;

        const def = atlas.animations[animation] ?? atlas.animations.idle;
        if (!def) return null;

        const { sheetDir, flipX } = resolveSheetDirection(direction);
        const rel = atlas.sheets[sheetDir] ?? atlas.sheets.se ?? atlas.sheets.sw;
        if (!rel) return null;
        const sheetUrl = resolveSheetUrl(atlasUrl, rel);

        // Idle freezes on frame 0 and bobs; other animations advance over time.
        const isIdle = animation === 'idle';
        const frame = isIdle ? 0 : getCurrentFrameFromDef(def, elapsed).frame;

        const rect = frameRect(frame, def.row, atlas.columns, atlas.frameWidth, atlas.frameHeight);

        return {
            sheetUrl,
            sx: rect.sx,
            sy: rect.sy,
            sw: rect.sw,
            sh: rect.sh,
            flipX,
            applyBreathing: isIdle,
        };
    }, [units]);

    return { sheetUrls, resolveUnitFrame, pendingCount };
}
