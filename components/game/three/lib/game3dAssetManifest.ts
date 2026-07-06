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

import type { Asset, EntityRole, EntityRow } from '@almadar/core';
import { makeAsset } from '../../../../lib/makeAsset';
import type { IsometricTile, IsometricFeature } from '../../../../lib/isometricTypes';
import { boardEntity, rows, num, str } from '../../../../lib/boardEntity';

/** GLB model assets for a 3D board, keyed by terrain "kind" and (optionally) feature type. */
export interface Game3DAssetManifest {
    /** Floor model assets by terrain kind ('wall' | 'dirt' | 'open'). */
    models?: Record<string, Asset>;
    /** Feature/structure model assets by feature type ('gold_mine', 'portal', …). */
    features?: Record<string, Asset>;
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
            modelUrl: manifest?.models?.[kind],
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
            modelUrl: t.modelUrl ?? manifest?.models?.[kind],
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
        const explicitModelUrl = r.modelUrl == null ? undefined : str(r.modelUrl);
        const explicitModel: Asset | undefined = explicitModelUrl
            ? makeAsset(explicitModelUrl, 'decoration' as EntityRole, { dimension: '3d' })
            : undefined;
        return {
            id: r.id == null ? undefined : str(r.id),
            x: num(r.x),
            y: num(r.y),
            z: r.z == null ? undefined : num(r.z),
            type,
            passable,
            modelUrl: explicitModel ?? manifest?.models?.[kind],
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
        assetUrl: f.assetUrl ?? manifest?.features?.[f.type],
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
        const explicitUrl = r.assetUrl == null ? undefined : str(r.assetUrl);
        const explicit: Asset | undefined = explicitUrl
            ? makeAsset(explicitUrl, 'decoration' as EntityRole, { dimension: '3d' })
            : undefined;
        return {
            id: r.id == null ? undefined : str(r.id),
            x: num(r.x),
            y: num(r.y),
            z: r.z == null ? undefined : num(r.z),
            type,
            color: r.color == null ? undefined : str(r.color),
            assetUrl: explicit ?? manifest?.features?.[type],
        };
    });
}
