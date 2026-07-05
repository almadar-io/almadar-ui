/**
 * Drawable registry — the SINGLE SOURCE that records the "drawable" designation.
 *
 * Two things live here: `paintDrawable` (dispatch a descriptor to its painter)
 * and `DRAWABLE_MODES` (each drawable's capability = which canvas `mode` it may
 * compose under). `DRAWABLE_MODES` is the source-tagged record the pattern
 * pipeline reads: pattern-sync emits `drawable: <mode>` into `patterns-registry.json`
 * from it (P5), and the orbital-compiler validator enforces that every child under
 * a draw-host `canvas` carries a compatible `drawable` capability (P7) — a hard
 * `orb validate` error otherwise. No name-matching; the designation is data.
 */
import type { Painter2D } from '../../../lib/painter2d';
import type { DrawContext } from './types';
import { paintSprite, type SpriteDrawable } from './sprite';
import { paintShape, type ShapeDrawable } from './shape';
import { paintText, type TextDrawable } from './text';
import { paintSpriteLayer, type SpriteLayerDrawable } from './spriteLayer';
import { paintShapeLayer, type ShapeLayerDrawable } from './shapeLayer';

/** Every drawable descriptor. The host's `children` are a `DrawableNode[]`. */
export type DrawableNode =
    | SpriteDrawable
    | ShapeDrawable
    | TextDrawable
    | SpriteLayerDrawable
    | ShapeLayerDrawable;

/** The `type` discriminant of every registered drawable. */
export type DrawableType = DrawableNode['type'];

/** Which canvas mode(s) a drawable can compose under (i.e. which painters it ships). */
export type DrawableMode = '2d' | '3d' | 'both';

/**
 * The drawable capability record — one entry per neutral primitive. Every
 * primitive now ships both a `Painter2D` path and an R3F mesh path (P4), so all
 * are `'both'`. This is what a canvas child is validated against.
 */
export const DRAWABLE_MODES: Record<DrawableType, DrawableMode> = {
    sprite: 'both',
    shape: 'both',
    text: 'both',
    'sprite-layer': 'both',
    'shape-layer': 'both',
};

/** True when `type` is a registered drawable (i.e. a legal draw-host child). */
export function isDrawableType(type: string): type is DrawableType {
    return Object.prototype.hasOwnProperty.call(DRAWABLE_MODES, type);
}

/** True when a drawable of `type` may compose under a canvas of `mode`. */
export function drawableFitsMode(type: DrawableType, mode: '2d' | '3d'): boolean {
    const cap = DRAWABLE_MODES[type];
    return cap === 'both' || cap === mode;
}

/** Dispatch a drawable descriptor to its painter. Unknown types are skipped — never throws. */
export function paintDrawable(painter: Painter2D, node: DrawableNode, dctx: DrawContext): void {
    switch (node.type) {
        case 'sprite':
            paintSprite(painter, node, dctx);
            break;
        case 'shape':
            paintShape(painter, node, dctx);
            break;
        case 'text':
            paintText(painter, node, dctx);
            break;
        case 'sprite-layer':
            paintSpriteLayer(painter, node, dctx);
            break;
        case 'shape-layer':
            paintShapeLayer(painter, node, dctx);
            break;
    }
}
