'use client';
/**
 * SideCanvas2D
 *
 * Side-view platformer renderer — extracted from Canvas2D's private `SideView` branch.
 * Physics is NOT here (it lives in the LOLO model); this only interpolates+draws the
 * authoritative `player`/`platforms` props and translates keyboard input into the
 * board's semantic events via keyMap/keyUpMap.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Asset, AssetUrl } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import type { ActiveEffect } from '../../shared/isometricTypes';
import { useImageCache } from '../../shared/useImageCache';
import { resolveAssetSource, blit } from '../../../../lib/atlasSlice';
import { useRenderInterpolation } from '../../../../hooks/useRenderInterpolation';
import { bindCanvasCapture } from '../../../../lib/verificationRegistry';
import {
    SIDE_PLATFORM_COLORS,
    SIDE_PLAYER_COLOR,
    SIDE_PLAYER_EYE_COLOR,
    SIDE_SKY_GRADIENT_TOP,
    SIDE_SKY_GRADIENT_BOTTOM,
    SIDE_GRID_COLOR,
    SIDE_FX_COLOR,
    SIDE_PLATFORM_BEVEL_COLOR,
    SIDE_PLATFORM_SHADOW_COLOR,
    SIDE_HAZARD_STRIPE_COLOR,
    SIDE_GOAL_GLOW_COLOR,
} from '../../shared/isometric';
import type { Platform, SidePlayer } from './Canvas2D';

/** SideCanvas2D runs a continuous rAF loop, so a lazily-fetched atlas is picked up on the next
 *  frame — no re-render trigger needed. */
const NOOP = (): void => { /* continuous loop re-reads the atlas cache next frame */ };

/** A backdrop may be authored as a bare URL string (the natural shorthand) or a full `Asset`.
 *  Mirrors Canvas2D's own normalizer — kept local to avoid a runtime import cycle between the
 *  two sibling molecules (the `Platform`/`SidePlayer` type import above is type-only, so it
 *  erases at compile time and doesn't create one either). */
function normalizeBackdrop(bg: AssetUrl | Asset | undefined): Asset | undefined {
    return typeof bg === 'string'
        ? { url: bg, role: 'decoration', category: 'background' }
        : bg;
}

export interface SideCanvas2DProps {
    player?: SidePlayer;
    platforms: Platform[];
    worldWidth: number;
    worldHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    follow: boolean;
    bgColor: string;
    backgroundImage?: AssetUrl | Asset;
    playerSprite?: Asset;
    tileSprites?: Record<string, Asset>;
    effects: ActiveEffect[];
    keyMap?: Record<string, string>;
    keyUpMap?: Record<string, string>;
    className?: string;
}

export function SideCanvas2D({
    player,
    platforms,
    worldWidth,
    worldHeight,
    canvasWidth,
    canvasHeight,
    follow,
    bgColor,
    backgroundImage: backgroundImageRaw,
    playerSprite,
    tileSprites,
    effects,
    keyMap,
    keyUpMap,
    className,
}: SideCanvas2DProps): React.JSX.Element {
    const backgroundImage = normalizeBackdrop(backgroundImageRaw);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const eventBus = useEventBus();
    const keysRef = useRef<Set<string>>(new Set());

    // Preload background + player + every declared tile-type sprite via the canonical image
    // cache (was a private ref+state loadImage triplicated across this file, Canvas2D, and MiniMap).
    const spriteUrls = useMemo(() => {
        const urls: string[] = [];
        if (backgroundImage?.url) urls.push(backgroundImage.url);
        if (playerSprite?.url) urls.push(playerSprite.url);
        if (tileSprites) {
            for (const asset of Object.values(tileSprites)) {
                if (asset?.url) urls.push(asset.url);
            }
        }
        return urls;
    }, [backgroundImage, playerSprite, tileSprites]);
    const { getImage } = useImageCache(spriteUrls);

    // Verification bridge: register canvas frame capture.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        bindCanvasCapture(() => canvas.toDataURL('image/png'));
        return () => { bindCanvasCapture(() => null); };
    }, []);

    const resolvedPlayer: SidePlayer = player ?? {
        x: 80, y: 336, width: 32, height: 48, vx: 0, vy: 0, grounded: true, facingRight: true,
    };

    // Live ref to the authoritative player for the rAF draw closure.
    const playerRef = useRef<SidePlayer>(resolvedPlayer);
    playerRef.current = resolvedPlayer;

    const interp = useRenderInterpolation<{ id: string; x: number; y: number }>();
    useEffect(() => {
        interp.onSnapshot([{ id: 'player', x: resolvedPlayer.x, y: resolvedPlayer.y }]);
    }, [resolvedPlayer.x, resolvedPlayer.y]);

    const propsRef = useRef({
        platforms, worldWidth, worldHeight, canvasWidth, canvasHeight,
        follow, bgColor, playerSprite, tileSprites, backgroundImage, effects,
    });
    propsRef.current = {
        platforms, worldWidth, worldHeight, canvasWidth, canvasHeight,
        follow, bgColor, playerSprite, tileSprites, backgroundImage, effects,
    };

    // Keyboard → the board's SEMANTIC events via the declarative keyMap/keyUpMap.
    // The component only translates a device keycode into the board's own intent event
    // (LEFT/RIGHT/JUMP/STOP); it never decides game logic. The FSM stays device-agnostic
    // and keyboard + d-pad converge on the same events.
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (keysRef.current.has(e.code)) return;
        keysRef.current.add(e.code);
        const ev = keyMap?.[e.code];
        if (ev) { eventBus.emit(`UI:${ev}`, {}); e.preventDefault(); }
    }, [eventBus, keyMap]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        keysRef.current.delete(e.code);
        const ev = keyUpMap?.[e.code];
        if (ev) eventBus.emit(`UI:${ev}`, {});
    }, [keyUpMap, eventBus]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Canvas dpr scaling — runs only when dimensions change.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        ctx.scale(dpr, dpr);
    }, [canvasWidth, canvasHeight]);

    // rAF draw loop — interpolated player position, authoritative everything else.
    useEffect(() => {
        const drawFrame = (positions: Map<string, { x: number; y: number }>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const {
                platforms: plats, worldWidth: ww, worldHeight: wh,
                canvasWidth: cw, canvasHeight: ch, follow: fc,
                bgColor: bg, playerSprite: pSprite, tileSprites: tSprites,
                backgroundImage: bgImg, effects: fxList,
            } = propsRef.current;

            const auth = playerRef.current;
            const interped = positions.get('player');
            const px = interped?.x ?? auth.x;
            const py = interped?.y ?? auth.y;

            // Follow-camera clamp.
            let camX = 0;
            let camY = 0;
            if (fc) {
                camX = Math.max(0, Math.min(px - cw / 2, ww - cw));
                camY = Math.max(0, Math.min(py - ch / 2 - 50, wh - ch));
            }

            // Background.
            const bgImage = bgImg ? getImage(bgImg.url) : undefined;
            const bgSrc = bgImage ? resolveAssetSource(bgImage, bgImg, NOOP) : null;
            if (bgSrc) {
                blit(ctx, bgSrc, 0, 0, cw, ch);
            } else if (bgImage) {
                ctx.drawImage(bgImage, 0, 0, cw, ch);
            } else if (bg) {
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, cw, ch);
            } else {
                const grad = ctx.createLinearGradient(0, 0, 0, ch);
                grad.addColorStop(0, SIDE_SKY_GRADIENT_TOP);
                grad.addColorStop(1, SIDE_SKY_GRADIENT_BOTTOM);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, cw, ch);
            }

            // Grid lines.
            ctx.strokeStyle = SIDE_GRID_COLOR;
            ctx.lineWidth = 1;
            const gridSize = 32;
            for (let gx = -camX % gridSize; gx < cw; gx += gridSize) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, ch);
                ctx.stroke();
            }
            for (let gy = -camY % gridSize; gy < ch; gy += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(cw, gy);
                ctx.stroke();
            }

            // Platforms.
            for (const plat of plats) {
                const platX = plat.x - camX;
                const platY = plat.y - camY;
                const platType = plat.type ?? 'ground';
                const spriteAsset = tSprites?.[platType];
                const tileImg = spriteAsset ? getImage(spriteAsset.url) : undefined;
                const tileSrc = tileImg ? resolveAssetSource(tileImg, spriteAsset, NOOP) : null;

                if (tileSrc) {
                    // Repeat the (whole image OR atlas sub-rect) horizontally across the platform.
                    const originX = tileSrc.rect ? tileSrc.rect.sx : 0;
                    const originY = tileSrc.rect ? tileSrc.rect.sy : 0;
                    const tileW = tileSrc.rect ? tileSrc.rect.sw : tileImg!.naturalWidth;
                    const tileH = tileSrc.rect ? tileSrc.rect.sh : tileImg!.naturalHeight;
                    const scaleH = plat.height / tileH;
                    const scaledW = tileW * scaleH;
                    for (let tx = 0; tx < plat.width; tx += scaledW) {
                        const drawW = Math.min(scaledW, plat.width - tx);
                        const srcW = drawW / scaleH;
                        ctx.drawImage(tileImg!, originX, originY, srcW, tileH, platX + tx, platY, drawW, plat.height);
                    }
                } else {
                    const color = SIDE_PLATFORM_COLORS[platType] ?? SIDE_PLATFORM_COLORS.ground;
                    ctx.fillStyle = color;
                    ctx.fillRect(platX, platY, plat.width, plat.height);
                    ctx.fillStyle = SIDE_PLATFORM_BEVEL_COLOR;
                    ctx.fillRect(platX, platY, plat.width, 3);
                    ctx.fillStyle = SIDE_PLATFORM_SHADOW_COLOR;
                    ctx.fillRect(platX, platY + plat.height - 2, plat.width, 2);
                    if (platType === 'hazard') {
                        ctx.strokeStyle = SIDE_HAZARD_STRIPE_COLOR;
                        ctx.lineWidth = 2;
                        for (let sx = platX; sx < platX + plat.width; sx += 12) {
                            ctx.beginPath();
                            ctx.moveTo(sx, platY);
                            ctx.lineTo(sx + 6, platY + plat.height);
                            ctx.stroke();
                        }
                    }
                    if (platType === 'goal') {
                        ctx.fillStyle = SIDE_GOAL_GLOW_COLOR;
                        ctx.beginPath();
                        ctx.arc(platX + plat.width / 2, platY - 10, 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Player (interpolated x/y; other fields authoritative).
            const pw = auth.width ?? 24;
            const ph = auth.height ?? 32;
            const ppx = px - camX;
            const ppy = py - camY;
            const facingRight = auth.facingRight ?? true;
            const playerImg = pSprite ? getImage(pSprite.url) : undefined;
            const playerSrc = playerImg ? resolveAssetSource(playerImg, pSprite, NOOP) : null;

            if (playerSrc) {
                ctx.save();
                if (!facingRight) {
                    ctx.translate(ppx + pw, ppy);
                    ctx.scale(-1, 1);
                    blit(ctx, playerSrc, 0, 0, pw, ph);
                } else {
                    blit(ctx, playerSrc, ppx, ppy, pw, ph);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = SIDE_PLAYER_COLOR;
                const radius = Math.min(pw, ph) * 0.25;
                ctx.beginPath();
                ctx.moveTo(ppx + radius, ppy);
                ctx.lineTo(ppx + pw - radius, ppy);
                ctx.quadraticCurveTo(ppx + pw, ppy, ppx + pw, ppy + radius);
                ctx.lineTo(ppx + pw, ppy + ph - radius);
                ctx.quadraticCurveTo(ppx + pw, ppy + ph, ppx + pw - radius, ppy + ph);
                ctx.lineTo(ppx + radius, ppy + ph);
                ctx.quadraticCurveTo(ppx, ppy + ph, ppx, ppy + ph - radius);
                ctx.lineTo(ppx, ppy + radius);
                ctx.quadraticCurveTo(ppx, ppy, ppx + radius, ppy);
                ctx.fill();

                const eyeY = ppy + ph * 0.3;
                const eyeSize = 3;
                const eyeOffsetX = facingRight ? pw * 0.55 : pw * 0.2;
                ctx.fillStyle = SIDE_PLAYER_EYE_COLOR;
                ctx.beginPath();
                ctx.arc(ppx + eyeOffsetX, eyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ppx + eyeOffsetX + 7, eyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // ActiveEffect[] — world-space, faded by ttl.
            for (const fx of fxList) {
                const fxScreenX = fx.x - camX;
                const fxScreenY = fx.y - camY;
                const alpha = Math.min(1, fx.ttl / 4);
                const prev = ctx.globalAlpha;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = SIDE_FX_COLOR;
                ctx.beginPath();
                ctx.arc(fxScreenX, fxScreenY, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = prev;
            }
        };

        return interp.startLoop(drawFrame);
    }, [interp.startLoop, getImage]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: canvasWidth, height: canvasHeight }}
            className={cn('block rounded-container border border-border/10', className)}
            data-testid="canvas-2d-side"
            tabIndex={0}
        />
    );
}

SideCanvas2D.displayName = 'SideCanvas2D';

export default SideCanvas2D;
