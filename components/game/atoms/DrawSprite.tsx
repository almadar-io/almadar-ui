'use client';
/**
 * `draw-sprite` — the neutral image/atlas-frame drawable atom (dimension-agnostic).
 *
 * ONE descriptor (`DrawSpriteProps`, grounded in core `ScenePos` + `Asset`) with
 * TWO backends: `paintSprite` (2D, via the portable `Painter2D` seam) and
 * `Sprite3D` (an R3F mesh). The canvas host picks the backend by `mode`; that is
 * what makes canvas-2d and canvas-3d the same `children` interface. Genre uses
 * (tile, unit body, feature, effect, movement ghost, background cover) are all
 * this atom with different `anchor`/`size`/`frame`/`flip`/`shadow` — composed in
 * `.lolo`, not here. The React component renders `null` (a drawable is painted by
 * the host, not the DOM); it exists so the pattern pipeline registers a
 * `draw-sprite` pattern and standalone pages stay inspectable.
 */
import React from 'react';
import { Billboard } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { Asset, ScenePos } from '@almadar/core';
import type { BlitSrc, PainterShadow } from '../../../lib/painter2d';
import { getAtlas, isAtlasAsset, subRectFor } from '../../../lib/atlasSlice';
import type { DrawableAnchor, DrawableBase, PaintFn } from '../../../lib/drawable/contract';
import type { Projector3D } from '../../../lib/drawable/projector3d';
import { ModelLoader } from '../3d/molecules/ModelLoader';

export interface DrawSpriteProps extends DrawableBase {
    type: 'draw-sprite';
    /** Logical scene position; the projector maps it to pixels / world. */
    position: ScenePos;
    /** The image / atlas reference to blit. */
    asset: Asset;
    /** How the sprite aligns to its projected position. Default `'top-left'`. */
    anchor?: DrawableAnchor;
    /** Draw width in px (2D) / world units (3D); omitted → resolved source width. */
    width?: number;
    /** Draw height in px (2D) / world units (3D); omitted → resolved source height. */
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

/** Paint a {@link DrawSpriteProps}. Renders nothing (returns) when a resource is not ready — never throws. */
export const paintSprite: PaintFn<DrawSpriteProps> = (painter, node, dctx) => {
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

/**
 * 2D-sprite-as-billboard 3D path. Crops UVs to `node.frame` when present.
 * Atlas-name resolution (`asset.atlas`/`asset.sprite` → sub-rect) is deferred
 * to P6 for the 3D path — a tracked follow-up, not a silent drop; until then
 * an atlas-only asset without an explicit `frame` renders the whole sheet.
 */
function SpriteBillboard({ node, world }: { node: DrawSpriteProps; world: [number, number, number] }): React.JSX.Element {
    const texture = useLoader(THREE.TextureLoader, node.asset.url);
    const img = texture.image as { width?: number; height?: number } | undefined;
    const imgW = img?.width || 1;
    const imgH = img?.height || 1;

    if (node.frame) {
        texture.repeat.set(node.frame.w / imgW, node.frame.h / imgH);
        texture.offset.set(node.frame.x / imgW, 1 - (node.frame.y + node.frame.h) / imgH);
        texture.magFilter = texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
    }

    const aspect = node.frame ? node.frame.w / node.frame.h : imgW / imgH;
    const height = node.height ?? 1;
    const width = node.width ?? height * aspect;

    return (
        <Billboard position={[world[0], world[1] + height / 2, world[2]]}>
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                    opacity={node.opacity ?? 1}
                />
            </mesh>
        </Billboard>
    );
}

/** R3F mesh backend: a GLB via `ModelLoader` when `asset.dimension === '3d'`; else a billboard. */
export function Sprite3D({ node, projector }: { node: DrawSpriteProps; projector: Projector3D }): React.JSX.Element | null {
    if (node.asset.dimension === '3d' && node.asset.url) {
        return (
            <group position={projector.toWorld(node.position)}>
                <ModelLoader
                    url={node.asset.url}
                    scale={node.width ?? projector.cellSize}
                    rotation={[0, node.rotation ?? 0, 0]}
                    fallbackGeometry="box"
                    castShadow
                    receiveShadow
                />
            </group>
        );
    }
    if (!node.asset.url) return null;
    return <SpriteBillboard node={node} world={projector.toWorld(node.position)} />;
}

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing. */
export function DrawSprite(_props: DrawSpriteProps): React.JSX.Element | null {
    return null;
}

export default DrawSprite;
