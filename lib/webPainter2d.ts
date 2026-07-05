'use client';
/**
 * Web implementation of {@link Painter2D} — wraps a `CanvasRenderingContext2D`.
 *
 * This is the ONLY web-coupled part of the drawable pipeline; a native platform
 * provides its own `Painter2D` and every drawable atom is unchanged. The host
 * owns the `<canvas>` sizing; this painter owns the 2D context transform + draws.
 */
import { getOrLoadImage } from './imageCache';
import type {
    Painter2D,
    PainterPoint,
    PainterShadow,
    TextStyle,
    TextureHandle,
    BlitDest,
    BlitSrc,
} from './painter2d';

// Stable handle per decoded image so `resolveTexture` returns the same object
// across frames and `blit` can recover the source without leaking DOM types
// through the shared `TextureHandle` interface.
const handleByImage = new WeakMap<HTMLImageElement, TextureHandle>();
const imageByHandle = new WeakMap<TextureHandle, HTMLImageElement>();

/**
 * Create a {@link Painter2D} backed by a web 2D context. `onAssetLoad` (optional)
 * fires when a texture requested via `resolveTexture` finishes loading, so a
 * draw-host can schedule a re-draw.
 */
export function createWebPainter(ctx: CanvasRenderingContext2D, onAssetLoad?: () => void): Painter2D {
    let vw = 0;
    let vh = 0;

    const tracePoly = (points: readonly PainterPoint[], closed: boolean): void => {
        if (points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        if (closed) ctx.closePath();
    };

    return {
        setViewport(width, height, dpr) {
            vw = width;
            vh = height;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        },
        clear() {
            ctx.clearRect(0, 0, vw, vh);
        },

        save() {
            ctx.save();
        },
        restore() {
            ctx.restore();
        },
        translate(x, y) {
            ctx.translate(x, y);
        },
        scale(sx, sy) {
            ctx.scale(sx, sy);
        },
        rotate(radians) {
            ctx.rotate(radians);
        },
        setAlpha(alpha) {
            ctx.globalAlpha = alpha;
        },
        setShadow(shadow: PainterShadow | null) {
            ctx.shadowColor = shadow ? shadow.color : 'transparent';
            ctx.shadowBlur = shadow ? shadow.blur : 0;
        },

        resolveTexture(url: string): TextureHandle | null {
            const img = getOrLoadImage(url, onAssetLoad);
            if (!img) return null;
            let handle = handleByImage.get(img);
            if (!handle) {
                handle = { width: img.naturalWidth, height: img.naturalHeight };
                handleByImage.set(img, handle);
                imageByHandle.set(handle, img);
            }
            return handle;
        },
        blit(tex: TextureHandle, dest: BlitDest, src?: BlitSrc) {
            const img = imageByHandle.get(tex);
            if (!img) return;
            const dw = dest.w ?? (src ? src.w : tex.width);
            const dh = dest.h ?? (src ? src.h : tex.height);
            if (src) {
                ctx.drawImage(img, src.x, src.y, src.w, src.h, dest.x, dest.y, dw, dh);
            } else {
                ctx.drawImage(img, dest.x, dest.y, dw, dh);
            }
        },

        fillRect(x, y, w, h, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        },
        strokeRect(x, y, w, h, color, lineWidth = 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, w, h);
        },
        fillPoly(points, color) {
            if (points.length === 0) return;
            tracePoly(points, true);
            ctx.fillStyle = color;
            ctx.fill();
        },
        strokePoly(points, color, lineWidth = 1, closed = false) {
            if (points.length === 0) return;
            tracePoly(points, closed);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        },
        fillEllipse(cx, cy, rx, ry, color) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        },
        strokeEllipse(cx, cy, rx, ry, color, lineWidth = 1) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        },

        text(str: string, x: number, y: number, style: TextStyle) {
            if (style.font) ctx.font = style.font;
            ctx.fillStyle = style.color;
            ctx.textAlign = style.align ?? 'left';
            ctx.textBaseline = style.baseline ?? 'alphabetic';
            ctx.fillText(str, x, y);
        },
    };
}
