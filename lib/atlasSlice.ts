'use client';
/**
 * atlasSlice — the ONLY place a packed sheet is cut at runtime.
 *
 * An `Asset` may carry `{ url: <sheet.png>, atlas: <atlas.json>, sprite: <name|index> }`. This
 * module fetches + caches the atlas JSON (a `TextureAtlas` of named sub-rects or a uniform
 * `Tilesheet`) and resolves the source rectangle for a `sprite`, so the canvas can `drawImage`
 * exactly that sub-region of the sheet. Coexists with the whole-PNG path (an Asset with no
 * `atlas`/`sprite` draws the whole image) and the `useUnitSpriteAtlas` animation path.
 *
 * See `docs/Almadar_Std_Assets.md` §2, §7.
 *
 * @packageDocumentation
 */

import type { TextureAtlas, Tilesheet } from '@almadar/core';

/** The minimal draw-relevant projection of an `Asset` — a sheet URL plus an optional atlas
 *  sub-texture reference. A full `@almadar/core` `Asset` is structurally assignable. */
export interface SpriteRef {
    url?: string;
    atlas?: string;
    sprite?: string;
}

type ParsedAtlas = TextureAtlas | Tilesheet;

/** url → parsed atlas (undefined while in-flight; null on failure — both mean "not ready"). */
const atlasCache = new Map<string, ParsedAtlas | null | undefined>();

function isTilesheet(a: ParsedAtlas): a is Tilesheet {
    return typeof (a as Tilesheet).tileWidth === 'number';
}

/**
 * Get a parsed atlas by URL, fetching+caching on first request. Returns undefined until loaded;
 * `onReady` fires once when the fetch resolves so the caller can trigger a re-render.
 */
export function getAtlas(url: string, onReady: () => void): ParsedAtlas | undefined {
    if (atlasCache.has(url)) return atlasCache.get(url) ?? undefined;
    atlasCache.set(url, undefined); // mark in-flight so we fetch once
    fetch(url)
        .then((r) => r.json())
        .then((json: ParsedAtlas) => { atlasCache.set(url, json); onReady(); })
        .catch(() => { atlasCache.set(url, null); });
    return undefined;
}

export interface SubRect { sx: number; sy: number; sw: number; sh: number }

/**
 * Resolve the source rect for `sprite` in `atlas`.
 * - `TextureAtlas`: `sprite` is a SubTexture name (e.g. `"blockBrown.png"`).
 * - `Tilesheet`: `sprite` is `"col,row"` or a flat index into the row-major grid.
 * Returns null if the name/index doesn't resolve.
 */
export function subRectFor(atlas: ParsedAtlas, sprite: string): SubRect | null {
    if (isTilesheet(atlas)) {
        let col: number;
        let row: number;
        if (sprite.includes(',')) {
            const [c, r] = sprite.split(',').map((n) => Number(n.trim()));
            col = c; row = r;
        } else {
            const i = Number(sprite);
            if (!Number.isFinite(i)) return null;
            col = i % atlas.columns;
            row = Math.floor(i / atlas.columns);
        }
        if (!Number.isFinite(col) || !Number.isFinite(row) || col < 0 || row < 0 || col >= atlas.columns || row >= atlas.rows) return null;
        const margin = atlas.margin ?? 0;
        const spacing = atlas.spacing ?? 0;
        return {
            sx: margin + col * (atlas.tileWidth + spacing),
            sy: margin + row * (atlas.tileHeight + spacing),
            sw: atlas.tileWidth,
            sh: atlas.tileHeight,
        };
    }
    const st = atlas.subTextures[sprite];
    if (!st) return null;
    return { sx: st.x, sy: st.y, sw: st.width, sh: st.height };
}

/** True when the asset points into a sheet (needs slicing) rather than being a whole PNG. */
export function isAtlasAsset(asset: SpriteRef | undefined | null): boolean {
    return !!asset && typeof asset.atlas === 'string' && typeof asset.sprite === 'string';
}

export interface AssetSource {
    img: HTMLImageElement;
    /** Sub-rect to blit; null = draw the whole image. */
    rect: SubRect | null;
    /** Source aspect ratio (width/height) — sub-rect for a slice, natural otherwise. */
    aspect: number;
}

/**
 * Resolve what to draw for `asset` given its loaded sheet `img`. Returns null when the asset is
 * an atlas ref whose JSON isn't loaded yet (or whose sprite name doesn't resolve) — `onReady`
 * will trigger a re-render once the fetch lands. Callers use `.aspect` to size, then `blit`.
 */
export function resolveAssetSource(
    img: HTMLImageElement,
    asset: SpriteRef | undefined | null,
    onReady: () => void,
): AssetSource | null {
    if (isAtlasAsset(asset)) {
        const atlas = getAtlas(asset!.atlas as string, onReady);
        if (!atlas) return null;
        const rect = subRectFor(atlas, asset!.sprite as string);
        if (!rect) return null;
        return { img, rect, aspect: rect.sw / rect.sh };
    }
    const natW = img.naturalWidth || 1;
    const natH = img.naturalHeight || 1;
    return { img, rect: null, aspect: natW / natH };
}

/** Draw a resolved source at `(dx,dy,dw,dh)` — sliced sub-rect or whole image. */
export function blit(ctx: CanvasRenderingContext2D, src: AssetSource, dx: number, dy: number, dw: number, dh: number): void {
    if (src.rect) ctx.drawImage(src.img, src.rect.sx, src.rect.sy, src.rect.sw, src.rect.sh, dx, dy, dw, dh);
    else ctx.drawImage(src.img, dx, dy, dw, dh);
}
