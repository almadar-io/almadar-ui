'use client';
/**
 * `draw-shape` — the neutral vector-fill/stroke drawable atom (dimension-agnostic).
 *
 * ONE descriptor (`DrawShapeProps`, grounded in core `ScenePos`) with TWO
 * backends: `paintShape` (2D, here) and an R3F ground-plane mesh (`Shape3D` in
 * `lib/drawable/mesh3d`, kept OUT of this file so the 2D path never pulls R3F).
 * Paints a cell footprint, an axis-aligned rect, an ellipse, a poly, or an SVG
 * path at a scene position, fill and/or stroke. Genre uses (tile fallback, iso/hex
 * diamond fallback, cell highlight, feature disc, unit selection ring, unit
 * fallback circle, ground/ghost discs, solid backgrounds, side-view platform
 * rects, hand-authored vector art) are all this atom with different
 * `shape`/`anchor`/geometry — composed in `.lolo`, not here. The React component renders `null`; it exists so the pattern pipeline
 * registers a `draw-shape` pattern and standalone pages stay inspectable.
 */
import type React from 'react';
import type { ScenePos } from '@almadar/core';
import type { PaintStyle, PainterGradient, PainterGradientStop, PainterPoint } from '../../../lib/painter2d';
import type { DrawableAnchor, DrawableBase, PaintFn } from '../../../lib/drawable/contract';
import { isValidScenePos } from '../../../lib/drawable/contract';
import { DrawableRegistryContext } from '../../../lib/drawable/registry';
import { useContext } from 'react';

export type ShapeKind = 'cell' | 'rect' | 'ellipse' | 'poly' | 'path';

/** One gradient color stop; `offset` is 0..1 along the gradient axis. */
export type DrawShapeGradientStop = PainterGradientStop;

/**
 * A gradient fill in world units relative to the cell's projected top-left —
 * same coordinate convention as `points` and `d`. Overrides `fill` when present.
 */
export interface DrawShapeGradient {
    kind: 'linear' | 'radial';
    /** Linear start point in world units. */
    from?: PainterPoint;
    /** Linear end point in world units. */
    to?: PainterPoint;
    /** Radial center in world units. */
    center?: PainterPoint;
    /** Radial radius in world units. */
    radius?: number;
    /** Ordered color stops. */
    stops: DrawShapeGradientStop[];
}

/** A soft glow / drop-shadow behind the shape; `blur` is in world units. */
export interface DrawShapeShadow {
    color: string;
    blur: number;
}

/**
 * One keyframe of a {@link DrawShapeAnimation}: `at` is the 0..1 position in
 * the cycle; every other field overrides the shape's base prop at that moment.
 */
export interface DrawShapeKeyframe {
    at: number;
    offsetX?: number;
    offsetY?: number;
    rotate?: number;
    opacity?: number;
    radiusX?: number;
    radiusY?: number;
    width?: number;
    height?: number;
    strokeWidth?: number;
    fill?: string;
    stroke?: string;
    shadow?: DrawShapeShadow;
}

/**
 * Declarative keyframe animation for a drawable. The host runs a paint clock
 * while any drawable declares one; numeric tracks lerp between keyframes,
 * string tracks hold the previous keyframe's value, `shadow` lerps `blur` and
 * holds `color`. A track starts from the shape's base prop until its first
 * keyframe defines it.
 */
export interface DrawShapeAnimation {
    /** One cycle length in ms. */
    durationMs: number;
    /** Loop the cycle (default true); false plays once and holds the final keyframes. */
    loop?: boolean;
    /** Keyframes ordered by `at` (0..1). */
    keyframes: DrawShapeKeyframe[];
}

export interface DrawShapeProps extends DrawableBase {
    type: 'draw-shape';
    shape: ShapeKind;
    /** Logical scene position; the projector maps it to pixels / world. */
    position: ScenePos;
    /** How the shape aligns to its projected position. Default varies by `shape`. */
    anchor?: DrawableAnchor;
    /** Rect width in world units (fractions of `projector.tileWidth`). */
    width?: number;
    /** Rect height in world units (fractions of `projector.tileWidth`). */
    height?: number;
    /** Ellipse horizontal radius in world units (fractions of `projector.tileWidth`). */
    radiusX?: number;
    /** Ellipse vertical radius in world units; omitted → `radiusX` (a circle). */
    radiusY?: number;
    /** Fine nudge in world units — applies to every shape kind except `cell` (rect/ellipse from their anchor point; poly/path from the projected top-left). */
    offsetX?: number;
    offsetY?: number;
    /** Poly vertices as world-unit offsets relative to the cell's projected top-left. */
    points?: PainterPoint[];
    /** SVG path data in world units relative to the cell's projected top-left — same coordinate convention as `points`. */
    d?: string;
    fill?: string;
    /** Gradient fill in world units; overrides `fill` when present. */
    gradient?: DrawShapeGradient;
    stroke?: string;
    strokeWidth?: number;
    /** Rotation in radians (painter units, same as `draw-group`), about `pivot`. */
    rotate?: number;
    /** Rotation pivot in world units relative to the cell's projected top-left; default `{x:0.5, y:0.5}` (cell center). */
    pivot?: PainterPoint;
    /** Soft glow / drop-shadow behind the shape; `blur` in world units. */
    shadow?: DrawShapeShadow;
    /** Keyframe animation over this shape's props; the host runs a paint clock while present. */
    animation?: DrawShapeAnimation;
    /** 0..1 opacity. */
    opacity?: number;
}

/** The keyframe fields that lerp; everything else steps (holds the previous keyframe). */
const NUMERIC_TRACKS = [
    'offsetX',
    'offsetY',
    'rotate',
    'opacity',
    'radiusX',
    'radiusY',
    'width',
    'height',
    'strokeWidth',
] as const;

/** True when this animation has something to play. */
export function isAnimatedShape(node: DrawShapeProps): boolean {
    return Boolean(node.animation && node.animation.durationMs > 0 && node.animation.keyframes.length > 0);
}

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/**
 * Resolve the animated view of `node` at wall-clock `timeMs`. Pure: returns a
 * merged copy (or `node` itself when it has no playable animation). Each track
 * interpolates between the keyframes that define it; before its first defining
 * keyframe the base prop holds.
 */
export function applyShapeAnimation(node: DrawShapeProps, timeMs: number): DrawShapeProps {
    const anim = node.animation;
    if (!anim || !(anim.durationMs > 0) || anim.keyframes.length === 0) return node;
    const frames = [...anim.keyframes].sort((a, b) => a.at - b.at);
    const cycle = timeMs / anim.durationMs;
    const t = anim.loop === false ? Math.min(cycle, 1) : cycle - Math.floor(cycle);

    const out: DrawShapeProps = { ...node };
    const trackValue = <K extends keyof DrawShapeKeyframe>(key: K): DrawShapeKeyframe[K] | undefined => {
        const defined = frames.filter((f) => f[key] !== undefined);
        if (defined.length === 0) return undefined;
        let prev: DrawShapeKeyframe | undefined;
        let next: DrawShapeKeyframe | undefined;
        for (const f of defined) {
            if (f.at <= t) prev = f;
            else if (!next) next = f;
        }
        if (!prev) return defined[0][key];
        if (!next) return prev[key];
        const span = next.at - prev.at;
        const k = span > 0 ? (t - prev.at) / span : 1;
        const a = prev[key];
        const b = next[key];
        if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, k) as DrawShapeKeyframe[K];
        return a;
    };

    for (const key of NUMERIC_TRACKS) {
        const v = trackValue(key);
        if (v !== undefined) out[key] = v as number;
    }
    const fill = trackValue('fill');
    if (fill !== undefined) out.fill = fill;
    const stroke = trackValue('stroke');
    if (stroke !== undefined) out.stroke = stroke;
    const shadowFrames = frames.filter((f) => f.shadow !== undefined);
    if (shadowFrames.length > 0) {
        const sh = trackValue('shadow');
        if (sh !== undefined) {
            let prevSh: DrawShapeKeyframe | undefined;
            let nextSh: DrawShapeKeyframe | undefined;
            for (const f of shadowFrames) {
                if (f.at <= t) prevSh = f;
                else if (!nextSh) nextSh = f;
            }
            if (prevSh?.shadow && nextSh?.shadow) {
                const span = nextSh.at - prevSh.at;
                const k = span > 0 ? (t - prevSh.at) / span : 1;
                out.shadow = { color: prevSh.shadow.color, blur: lerp(prevSh.shadow.blur, nextSh.shadow.blur, k) };
            } else {
                out.shadow = sh;
            }
        }
    }
    return out;
}

/** Map a world-unit gradient to painter pixel space (`origin` + world × `scale`); undefined when its required geometry is missing. */
function gradientStyle(g: DrawShapeGradient, ox: number, oy: number, scale: number): PainterGradient | undefined {
    if (g.kind === 'linear') {
        if (!g.from || !g.to) return undefined;
        return {
            kind: 'linear',
            x1: ox + g.from.x * scale,
            y1: oy + g.from.y * scale,
            x2: ox + g.to.x * scale,
            y2: oy + g.to.y * scale,
            stops: g.stops,
        };
    }
    if (!g.center || g.radius === undefined) return undefined;
    return {
        kind: 'radial',
        cx: ox + g.center.x * scale,
        cy: oy + g.center.y * scale,
        r: g.radius * scale,
        stops: g.stops,
    };
}

/** Paint a {@link DrawShapeProps}. Skips a draw when its required geometry is missing — never throws. */
export const paintShape: PaintFn<DrawShapeProps> = (painter, rawNode, dctx) => {
    const node = dctx.time > 0 ? applyShapeAnimation(rawNode, dctx.time) : rawNode;
    if (!isValidScenePos(node.position)) return;
    painter.save();
    if (node.opacity !== undefined && node.opacity !== 1) painter.setAlpha(node.opacity);

    const origin = dctx.projector.project(node.position);
    const tileWidth = dctx.projector.tileWidth;
    if (node.rotate) {
        const pivot = node.pivot ?? { x: 0.5, y: 0.5 };
        const px = origin.x + pivot.x * tileWidth;
        const py = origin.y + pivot.y * tileWidth;
        painter.translate(px, py);
        painter.rotate(node.rotate);
        painter.translate(-px, -py);
    }
    if (node.shadow) painter.setShadow({ color: node.shadow.color, blur: node.shadow.blur * tileWidth });
    // SVG sentinel: 'none' means no paint — an invalid canvas style assignment
    // would silently keep the previous fill/stroke and paint with a stale color.
    const fill = node.fill === 'none' ? undefined : node.fill;
    const stroke = node.stroke === 'none' ? undefined : node.stroke;
    // Gradient coords live in painter user space: px for the untransformed cases,
    // raw world units for `path` (whose ctx is translated+scaled below).
    const pxFill: PaintStyle | undefined = node.gradient
        ? gradientStyle(node.gradient, origin.x, origin.y, tileWidth) ?? fill
        : fill;

    switch (node.shape) {
        case 'cell': {
            const pts = dctx.projector.cellPath(node.position);
            if (pxFill) painter.fillPoly(pts, pxFill);
            if (stroke) painter.strokePoly(pts, stroke, node.strokeWidth ?? 1, true);
            break;
        }
        case 'rect': {
            const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'top-left');
            const tw = dctx.projector.tileWidth;
            const x = p.x + (node.offsetX ?? 0) * tw;
            const y = p.y + (node.offsetY ?? 0) * tw;
            const w = (node.width ?? 0) * tw;
            const h = (node.height ?? 0) * tw;
            if (pxFill) painter.fillRect(x, y, w, h, pxFill);
            if (stroke) painter.strokeRect(x, y, w, h, stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'ellipse': {
            const p = dctx.projector.anchorPoint(node.position, node.anchor ?? 'ground');
            const tw = dctx.projector.tileWidth;
            const cx = p.x + (node.offsetX ?? 0) * tw;
            const cy = p.y + (node.offsetY ?? 0) * tw;
            const rx = (node.radiusX ?? 0) * tw;
            const ry = (node.radiusY ?? rx) * tw;
            if (pxFill) painter.fillEllipse(cx, cy, rx, ry, pxFill);
            if (stroke) painter.strokeEllipse(cx, cy, rx, ry, stroke, node.strokeWidth ?? 1);
            break;
        }
        case 'poly': {
            const pts = (node.points ?? []).map((pt) => ({
                x: origin.x + ((node.offsetX ?? 0) + pt.x) * tileWidth,
                y: origin.y + ((node.offsetY ?? 0) + pt.y) * tileWidth,
            }));
            if (pxFill) painter.fillPoly(pts, pxFill);
            if (stroke) painter.strokePoly(pts, stroke, node.strokeWidth ?? 1, true);
            break;
        }
        case 'path': {
            if (!node.d) break;
            painter.translate(origin.x + (node.offsetX ?? 0) * tileWidth, origin.y + (node.offsetY ?? 0) * tileWidth);
            painter.scale(tileWidth, tileWidth);
            const localFill: PaintStyle | undefined = node.gradient
                ? gradientStyle(node.gradient, 0, 0, 1) ?? fill
                : fill;
            if (localFill) painter.fillPath(node.d, localFill);
            // Undo the transform scale so strokeWidth stays in px like strokePoly.
            if (stroke) painter.strokePath(node.d, stroke, (node.strokeWidth ?? 1) / tileWidth);
            break;
        }
    }

    painter.restore();
};

/** Registry/standalone stub — the host paints this atom; the DOM renders nothing.
 *  When composed as a React child of a draw-host (Canvas2D), registers its
 *  descriptor via context so the host paints it. */
export function DrawShape(props: DrawShapeProps): React.JSX.Element | null {
    const register = useContext(DrawableRegistryContext);
    if (register) {
        const { opacity, ...rest } = props;
        const node: DrawShapeProps = {
            ...rest,
            type: 'draw-shape',
            ...(opacity !== undefined && opacity > 0 ? { opacity } : {}),
        };
        register(node);
    }
    return null;
}

export default DrawShape;
