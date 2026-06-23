/**
 * game3dAssetManifest — shared, asset-URL-free helpers for the 3D game-canvas
 * templates (battle / castle / world-map).
 *
 * Every GLB model URL lives in the lolo `assetManifest` config and arrives via
 * props; these helpers resolve a tile's / feature's `modelUrl` from that manifest
 * by terrain/feature key. NO asset URLs are declared here — the templates and this
 * module stay pure, exactly like the `GameCanvas3D` molecule.
 *
 * @packageDocumentation
 */

import type { AssetUrl, EntityRow } from '@almadar/core';
import type { IsometricTile, IsometricFeature } from '../organisms/types/isometric';
import { boardEntity, rows, num, str } from '../organisms/boardEntity';

/** GLB model URLs for a 3D board, keyed by terrain "kind" and (optionally) feature type. */
export interface Game3DAssetManifest {
    /** Base URL prepended to manifest-relative model paths (absolute paths pass through). */
    baseUrl?: AssetUrl;
    /** Floor model URLs by terrain kind ('wall' | 'dirt' | 'open'). */
    models?: Record<string, AssetUrl>;
    /** Feature/structure model URLs by feature type ('gold_mine', 'portal', …). */
    features?: Record<string, AssetUrl>;
}

/** Layout-only tile (no model URL): position + terrain kind. */
export interface Tile3DLayout {
    id?: string;
    x: number;
    y: number;
    z?: number;
    type: string;
    passable?: boolean;
    /** Terrain kind that maps into `assetManifest.models` (wall | dirt | open). */
    kind: string;
}

/** Resolve a manifest-relative model path against the manifest baseUrl into an absolute AssetUrl. */
function resolveManifestUrl(
    manifest: Game3DAssetManifest | undefined,
    relative: AssetUrl | undefined,
): AssetUrl | undefined {
    if (relative == null) return undefined;
    if (/^https?:\/\//.test(relative)) return relative;
    const base = manifest?.baseUrl;
    if (base == null) return relative;
    const cleanBase = base.replace(/\/$/, '');
    const cleanRel = relative.replace(/^\//, '');
    return `${cleanBase}/${cleanRel}` as AssetUrl;
}

/** The terrain kind a tile maps to in `assetManifest.models`. Impassable = wall, road/dirt = dirt, else open. */
function tileKind(type: string, passable: boolean | undefined): string {
    if (passable === false) return 'wall';
    if (type === 'dirt' || type === 'road') return 'dirt';
    return 'open';
}

/**
 * Resolve a layout tile array into render-ready `IsometricTile[]`, attaching each
 * tile's `modelUrl` from `assetManifest.models` by terrain kind. Pure: URLs come
 * only from the manifest.
 */
export function resolveTilesWithModels(
    layout: readonly Tile3DLayout[],
    manifest: Game3DAssetManifest | undefined,
): IsometricTile[] {
    return layout.map((t) => {
        const kind = t.kind || tileKind(t.type, t.passable);
        return {
            id: t.id,
            x: t.x,
            y: t.y,
            z: t.z,
            type: t.type,
            passable: t.passable,
            modelUrl: resolveManifestUrl(manifest, manifest?.models?.[kind]),
        };
    });
}

/**
 * Map prop `IsometricTile[]` (which already carry `type`/`passable` but no model)
 * into render-ready tiles with manifest-resolved model URLs.
 */
export function resolvePropTiles(
    tiles: readonly IsometricTile[],
    manifest: Game3DAssetManifest | undefined,
): IsometricTile[] {
    return tiles.map((t) => {
        const kind = tileKind(t.type ?? '', t.passable);
        return {
            ...t,
            modelUrl: t.modelUrl ?? resolveManifestUrl(manifest, manifest?.models?.[kind]),
        };
    });
}

/** Read entity-carried tile rows into render-ready `IsometricTile[]` with manifest-resolved models. */
export function resolveEntityTiles(
    entity: EntityRow | readonly EntityRow[] | undefined,
    manifest: Game3DAssetManifest | undefined,
): IsometricTile[] {
    const row = boardEntity(entity);
    if (!row) return [];
    return rows(row.tiles).map((r) => {
        const type = str(r.type) || str(r.terrain);
        const passable = r.passable !== false;
        const kind = tileKind(type, passable);
        const explicitModel = r.modelUrl == null ? undefined : (str(r.modelUrl) as AssetUrl);
        return {
            id: r.id == null ? undefined : str(r.id),
            x: num(r.x),
            y: num(r.y),
            z: r.z == null ? undefined : num(r.z),
            type,
            passable,
            modelUrl: explicitModel ?? resolveManifestUrl(manifest, manifest?.models?.[kind]),
        };
    });
}

/** Resolve feature model URLs from `assetManifest.features` by feature type. */
export function resolveFeaturesWithModels(
    features: readonly IsometricFeature[],
    manifest: Game3DAssetManifest | undefined,
): IsometricFeature[] {
    return features.map((f) => ({
        ...f,
        assetUrl: f.assetUrl ?? resolveManifestUrl(manifest, manifest?.features?.[f.type]),
    }));
}

/** Read entity-carried feature rows into render-ready `IsometricFeature[]` with manifest models. */
export function resolveEntityFeatures(
    entity: EntityRow | readonly EntityRow[] | undefined,
    manifest: Game3DAssetManifest | undefined,
): IsometricFeature[] {
    const row = boardEntity(entity);
    if (!row) return [];
    return rows(row.features).map((r) => {
        const type = str(r.type);
        const explicit = r.assetUrl == null ? undefined : (str(r.assetUrl) as AssetUrl);
        return {
            id: r.id == null ? undefined : str(r.id),
            x: num(r.x),
            y: num(r.y),
            z: r.z == null ? undefined : num(r.z),
            type,
            color: r.color == null ? undefined : str(r.color),
            assetUrl: explicit ?? resolveManifestUrl(manifest, manifest?.features?.[type]),
        };
    });
}
