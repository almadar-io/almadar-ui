'use client';
/**
 * `sprite` — the neutral image/atlas-frame drawable atom.
 *
 * Paints one `Asset` at a scene position: a whole image, or a sub-rect of a
 * packed sheet (atlas resolved internally via `atlasSlice`). Genre uses (tile,
 * unit body, feature, effect, movement ghost, background cover) are all just
 * this atom with different `anchor`/`size`/`frame`/`flip`/`shadow` — composed in
 * `.lolo`, not here. The React component renders `null` (a drawable is painted by
 * the host, not the DOM); it exists so the pattern pipeline can register a
 * `sprite` pattern and standalone pages stay inspectable.
 */
import type React from 'react';
import type { Asset, ScenePos } from '@almadar/core';
import type { BlitSrc, PainterShadow } from '../../../lib/painter2d';
import { getAtlas, isAtlasAsset, subRectFor } from '../../../lib/atlasSlice';
import type { DrawableAnchor, DrawableBase, PaintFn } from './types';

export interface SpriteDrawable extends DrawableBase {
    type: 'sprite';
    /** Logical scene position; the projector maps it to pixels. */
    position: ScenePos;
    /** The image / atlas reference to blit. */
    asset: Asset;
    /** How the sprite aligns to its projected position. Default `'top-left'`. */
    anchor?: DrawableAnchor;
    /** Draw width in px; omitted → the resolved source width (atlas frame or natural). */
    width?: number;
    /** Draw height in px; omitted → the resolved source height. */
    height?: number;
    /** Explicit atlas sub-rect override (px); omitted → resolved from `asset.atlas`/`asset.sprite`. */
    frame?: BlitSrc;
    /** Mirror horizontally (facing). */
    flipX?: boolean;
    /** Rotation in radians about the sprite's center. */
    rotation?: number;
    /** 0..1 opacity. */
    opacity?: number;
    /** Drop shadow (e.g. a team-colored glow). */
    shadow?: PainterShadow;
}

/** Paint a {@link SpriteDrawable}. Renders nothing (returns) when a resource is not ready — never throws. */
export const paintSprite: PaintFn<SpriteDrawable> = (painter, node, dctx) => {
    const tex = painter.resolveTexture(node.asset.url);
    if (!tex) return; // image not loaded yet

    let src = node.frame;
    if (!src && isAtlasAsset(node.asset)) {
        const atlas = getAtlas(node.asset.atlas as string, dctx.invalidate);
        if (!atlas) return; // atlas JSON in-flight
        const r = subRectFor(atlas, node.asset.sprite as string);
        if (!r) return; // sprite name/index does not resolve
        src = { x: r.sx, y: r.sy, w: r.sw, h: r.sh };
    }

    const w = node.width ?? (src ? src.w : tex.width);
    const h = node.height ?? (src ? src.h : tex.height);

    const anchor: DrawableAnchor = node.anchor ?? 'top-left';
    const p = dctx.projector.anchorPoint(node.position, anchor);
    const dx = anchor === 'top-left' ? p.x : p.x - w / 2;
    const dy = anchor === 'ground' ? p.y - h : anchor === 'center' ? p.y - h / 2 : p.y;

    painter.save();
    if (node.opacity !== undefined && node.opacity !== 1) painter.setAlpha(node.opacity);
    if (node.shadow) painter.setShadow(node.shadow);
    if (node.rotation) {
        const cx = dx + w / 2;
        const cy = dy + h / 2;
        painter.translate(cx, cy);
        painter.rotate(node.rotation);
        painter.translate(-cx, -cy);
    }
    if (node.flipX) {
        const cx = dx + w / 2;
        painter.translate(cx, 0);
        painter.scale(-1, 1);
        painter.translate(-cx, 0);
    }
    painter.blit(tex, { x: dx, y: dy, w, h }, src);
    painter.restore();
};

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function Sprite2D(_props: SpriteDrawable): React.JSX.Element | null {
    return null;
}

export default Sprite2D;
