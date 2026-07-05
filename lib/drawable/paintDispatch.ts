/**
 * Drawable paint dispatch (2D) + the `DrawableNode` union.
 *
 * `paintDrawable` routes ONE descriptor to its 2D painter; the host walks its
 * `children` through it. The "drawable" designation itself is NOT recorded here —
 * it is DERIVED from the core `ScenePos` type each descriptor's `position` uses
 * and stamped into `patterns-registry.json` by pattern-sync (mirroring how `Asset`
 * is tagged), then read by the orbital-rust validator. So this module is pure
 * paint routing; the capability is the registry's, not a hand-list.
 */
import type { Painter2D } from '../painter2d';
import type { DrawContext } from './contract';
import { paintSprite, type DrawSpriteProps } from '../../components/game/atoms/DrawSprite';
import { paintShape, type DrawShapeProps } from '../../components/game/atoms/DrawShape';
import { paintText, type DrawTextProps } from '../../components/game/atoms/DrawText';
import { paintSpriteLayer, type DrawSpriteLayerProps } from '../../components/game/molecules/DrawSpriteLayer';
import { paintShapeLayer, type DrawShapeLayerProps } from '../../components/game/molecules/DrawShapeLayer';
import { paintTextLayer, type DrawTextLayerProps } from '../../components/game/molecules/DrawTextLayer';

/** Every drawable descriptor. The host's `children` are a `DrawableNode[]`. */
export type DrawableNode =
    | DrawSpriteProps
    | DrawShapeProps
    | DrawTextProps
    | DrawSpriteLayerProps
    | DrawShapeLayerProps
    | DrawTextLayerProps;

/** Dispatch a drawable descriptor to its 2D painter. Unknown types are skipped — never throws. */
export function paintDrawable(painter: Painter2D, node: DrawableNode, dctx: DrawContext): void {
    switch (node.type) {
        case 'draw-sprite':
            paintSprite(painter, node, dctx);
            break;
        case 'draw-shape':
            paintShape(painter, node, dctx);
            break;
        case 'draw-text':
            paintText(painter, node, dctx);
            break;
        case 'draw-sprite-layer':
            paintSpriteLayer(painter, node, dctx);
            break;
        case 'draw-shape-layer':
            paintShapeLayer(painter, node, dctx);
            break;
        case 'draw-text-layer':
            paintTextLayer(painter, node, dctx);
            break;
    }
}
