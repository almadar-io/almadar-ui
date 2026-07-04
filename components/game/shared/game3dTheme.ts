/**
 * game3dTheme
 *
 * Single source of truth for the 3D game renderer's DEFAULT palettes + sizing.
 * These were previously baked (and in several cases duplicated) inside
 * `GameCanvas3D.tsx`'s inline sub-renderers. The decomposed mesh components
 * (`TileMesh3D`, `UnitMesh3D`, `FeatureMesh3D`, `EventMarker3D`, `SideScene3D`)
 * read these as DEFAULTS so the renderer stays "dumb": every color/size can be
 * overridden per-item via the descriptor data (`tile.color`, `unit.tint`, …)
 * that `.lolo` computes. No React deps — pure constants, usable anywhere.
 *
 * Values are the exact literals that lived inline in GameCanvas3D before the
 * decomposition, so a board that supplies no overrides renders identically.
 *
 * @packageDocumentation
 */

// three.js hex colors (0xRRGGBB).

/** Tile fallback color by terrain kind (DefaultTile 555–560). */
export const TERRAIN_COLORS_3D: Record<string, number> = {
    base: 0x808080,
    water: 0x4488cc,
    grass: 0x44aa44,
    sand: 0xddcc88,
    rock: 0x888888,
    snow: 0xeeeeee,
};

/** Tile emissive tint by highlight state (DefaultTile 562–566). */
export const HIGHLIGHT_EMISSIVE_3D: Record<string, number> = {
    selected: 0x444444,
    attackTarget: 0x440000,
    validMove: 0x004400,
    hovered: 0x222222,
    none: 0x000000,
};

/** Unit fallback color by faction/team (DefaultUnit 624). */
export const FACTION_COLORS_3D: Record<string, number> = {
    player: 0x4488ff,
    enemy: 0xff4444,
    default: 0xffff44,
};

/** Selection ring color (DefaultUnit 644). */
export const SELECTION_RING_COLOR_3D = '#ffff00';

/** Health-bar palette + geometry (DefaultUnit 690–716). */
export const HEALTHBAR_3D = {
    bg: 0x333333,
    /** fill color thresholds: fraction > key → color */
    high: 0x44aa44, // fraction > 0.5
    mid: 0xaaaa44, // fraction > 0.25
    low: 0xff4444, // else
    width: 0.5,
};

/** Resolve the health-bar fill color for a health fraction (0..1). */
export function healthbarFill3D(fraction: number): number {
    if (fraction > 0.5) return HEALTHBAR_3D.high;
    if (fraction > 0.25) return HEALTHBAR_3D.mid;
    return HEALTHBAR_3D.low;
}

/** Procedural tree colors (DefaultFeature 753–760). */
export const TREE_COLORS_3D = {
    trunk: 0x8b4513,
    foliage: 0x228b22,
};

/** Procedural rock color (DefaultFeature 765). */
export const ROCK_COLOR_3D = 0x808080;

/** Floating event/feedback label color by event type (EventMarker 487–498). */
export const EVENT_COLORS_3D: Record<string, number> = {
    hit: 0xff5544,
    damage: 0xff5544,
    attack: 0xff8844,
    heal: 0x44dd66,
    pickup: 0xffcc33,
    score: 0xffcc33,
    death: 0xaa3333,
    win: 0x66ff88,
    lose: 0xff6666,
    default: 0xffffff,
};

/** Side-scroller platform palette (SideScene SIDE_PLATFORM_COLORS 356–362). */
export const SIDE_PLATFORM_COLORS_3D: Record<string, number> = {
    ground: 0x5b8c3e,
    platform: 0x8b5a2b,
    hazard: 0xcc4444,
    goal: 0x4488cc,
    default: 0x888888,
};

/** Side-scroller player fallback capsule color (SideScene 470). */
export const SIDE_PLAYER_COLOR_3D = '#4488ff';

/** Grid line colors for the drei `<Grid>` (GameCanvas3D 1245/1248). */
export const GRID_COLORS_3D = {
    cell: '#444444',
    section: '#666666',
};

/** Default scene background (GameCanvas3DProps.backgroundColor default, line 114). */
export const DEFAULT_BACKGROUND_3D = '#1a1a2e';
