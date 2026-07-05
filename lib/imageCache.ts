'use client';
/**
 * Lazy, on-demand image cache for canvas painting.
 *
 * The descriptor-driven draw-host discovers texture URLs while walking the scene
 * each frame, so it needs a cache keyed by arbitrary URL that lazy-loads on the
 * first miss and returns the decoded image once ready — unlike the eager
 * preload-array `useImageCache` hook. Preserves the `updateAssetStatus`
 * verification hook so `orb verify` / runtime-verify still observe asset loads.
 */
import type { AssetLoadStatus } from '@almadar/core';
import { updateAssetStatus } from './verificationRegistry';

interface Entry {
    img: HTMLImageElement;
    status: AssetLoadStatus;
    /** Fired once when a pending load resolves, so a draw-host can re-draw. */
    onReady?: () => void;
}

const cache = new Map<string, Entry>();

/**
 * Return the decoded image for `url`, or `null` if it is not ready yet (a load
 * is kicked off on the first miss). Safe to call every frame — cached after the
 * first request. SSR-safe: returns `null` without a DOM. `onReady` (optional)
 * fires once when a pending load resolves so a caller can trigger a re-draw.
 */
export function getOrLoadImage(url: string, onReady?: () => void): HTMLImageElement | null {
    if (!url || typeof window === 'undefined') return null;
    const existing = cache.get(url);
    if (existing) {
        if (existing.status === 'loaded') return existing.img;
        if (existing.status === 'pending' && onReady) existing.onReady = onReady;
        return null;
    }

    const img = new Image();
    const entry: Entry = { img, status: 'pending', onReady };
    cache.set(url, entry);
    updateAssetStatus(url, 'pending');
    img.onload = () => {
        entry.status = 'loaded';
        updateAssetStatus(url, 'loaded');
        entry.onReady?.();
    };
    img.onerror = () => {
        entry.status = 'failed';
        updateAssetStatus(url, 'failed');
    };
    img.src = url;
    return null;
}

/** Test/reset hook — clears the module cache. */
export function clearImageCache(): void {
    cache.clear();
}
