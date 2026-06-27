'use client';
/**
 * Canvas2D
 *
 * The unified 2D game renderer (GR-6 consolidation). One canvas, a `projection`
 * axis, layered render passes, opt-in clock. Absorbs IsometricCanvas (iso/hex/flat),
 * GameCanvas2D (→ `projection:'free'`, pixel-direct draw) and PlatformerCanvas
 * (→ `projection:'side'` + `platforms[]`).
 *
 * Pure renderer: every game datum arrives via props; only view state (viewport,
 * camera, sprite cache) is local. The clock is LOLO-driven by default — `animate`
 * opts a board into an internal RAF, but the default is OFF.
 *
 * Projection modes:
 * - `isometric | hex | flat`: 2:1 diamond / pointy-top hex / orthographic square,
 *   all via `isoToScreen` — identical to IsometricCanvas.
 * - `free`: tile/unit/feature x,y are SCREEN PIXELS drawn directly (no diamond),
 *   reusing the same sprite-drawing passes.
 * - `side`: side-view pixel space with `platforms[]` (AABB) + follow-camera +
 *   keyboard input — an isolated branch ported from PlatformerCanvas.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Asset, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Stack } from '../../core/atoms/Stack';
import { Icon } from '../../core/atoms/Icon';
import { Typography } from '../../core/atoms/Typography';
import type { IsometricTile, IsometricUnit, IsometricFeature, ActiveEffect } from '../shared/isometricTypes';
import { MiniMap } from './MiniMap';
import { HealthBar } from './HealthBar';
import type { ResolvedFrame } from '../shared/spriteAnimationTypes';
import { useImageCache } from '../shared/useImageCache';
import { useCamera } from './useCamera';
import { useCanvasGestures } from '../../../hooks/useCanvasGestures';
import { useRenderInterpolation } from '../../../hooks/useRenderInterpolation';
import { useUnitSpriteAtlas } from './useUnitSpriteAtlas';
import { bindCanvasCapture } from '../../../lib/verificationRegistry';
import {
    isoToScreen,
    screenToIso,
    TILE_WIDTH,
    TILE_HEIGHT,
    FLOOR_HEIGHT,
    DIAMOND_TOP_Y,
    FEATURE_COLORS,
} from '../shared/isometric';
import { SHEET_COLUMNS } from '../shared/spriteSheetConstants';
import type { UiError } from '../../core/atoms/types';

// =============================================================================
// Props
// =============================================================================

export interface TileCoord {
    x: number;
    y: number;
}

/** Projection axis. iso/hex/flat use `isoToScreen`; `free` is pixel-direct; `side`
 *  is side-view pixel space with platforms (gravity lives in the LOLO model). */
export type Projection = 'isometric' | 'hex' | 'flat' | 'free' | 'side';

/** Camera behavior. `pan-zoom` = user drag+wheel; `follow` = track the player/
 *  selected unit; `fixed` = no camera motion. */
export type CameraMode = 'pan-zoom' | 'follow' | 'fixed';

/** A side-view platform (AABB rect). `side` projection only. */
export interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: 'ground' | 'platform' | 'hazard' | 'goal';
}

/** A side-view player. The model owns physics; Canvas2D only interpolates+draws. */
export interface SidePlayer {
    x: number;
    y: number;
    width?: number;
    height?: number;
    vx?: number;
    vy?: number;
    grounded?: boolean;
    facingRight?: boolean;
}

export interface Canvas2DProps {
    // --- Closed-circuit ---
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: UiError | null;

    // --- Projection ---
    /** Projection axis (default 'isometric'). Replaces the old `tileLayout`. */
    projection?: Projection;

    // --- Layer data (each an optional render pass) ---
    /** Tiles to render */
    tiles?: IsometricTile[];
    /** Units on the board */
    units?: IsometricUnit[];
    /** Features (resources, portals, buildings, etc.) */
    features?: IsometricFeature[];
    /** Active visual effects, drawn after units */
    effects?: ActiveEffect[];
    /** Side-view platforms (AABB). `projection:'side'` only. */
    platforms?: Platform[];
    /** Side-view player. `projection:'side'` only. */
    player?: SidePlayer;
    /** Background image (tiled behind iso/hex/flat/free; stretched in side). */
    backgroundImage?: Asset;

    // --- Interaction state (LOLO-owned, passed in) ---
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions (pulsing green highlights) */
    validMoves?: TileCoord[];
    /** Attack target positions (pulsing red highlights) */
    attackTargets?: TileCoord[];
    /** Hovered tile position */
    hoveredTile?: TileCoord | null;

    // --- Declarative events back to LOLO ---
    /** Emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: EventEmit<{ unitId: string }>;
    /** Emits UI:{tileHoverEvent} with { x, y } on tile hover */
    tileHoverEvent?: EventEmit<{ x: number; y: number }>;
    /** Emits UI:{tileLeaveEvent} with {} on tile leave */
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Emits UI:{keyEvent} with { key } on keydown — for side/free keyboard control */
    keyEvent?: EventEmit<{ key: string }>;

    // --- View config (pure render) ---
    /** Camera behavior (default 'pan-zoom'). */
    camera?: CameraMode;
    /** Render scale (0.4 = 40% zoom). */
    scale?: number;
    /** Extra scale multiplier for unit draw size. 1 = default. */
    unitScale?: number;
    /** Toggle minimap overlay. */
    showMinimap?: boolean;
    /** Opt-in internal RAF clock. DEFAULT OFF — the LOLO state machine drives the clock. */
    animate?: { fps: number };

    // --- Tuning (iso/hex/flat/free) ---
    /** Show debug grid lines and coordinates. */
    debug?: boolean;
    /** Ratio of unit draw height to scaledFloorHeight. Default 1.5. */
    spriteHeightRatio?: number;
    /** Max unit draw width as a ratio of scaledTileWidth. Default 0.6. */
    spriteMaxWidthRatio?: number;
    /** Override for the diamond-top Y offset within the tile sprite. */
    diamondTopY?: number;

    // --- Asset resolution (project-agnostic) ---
    /** Resolve terrain sprite URL from terrain key */
    getTerrainSprite?: (terrain: string) => string | undefined;
    /** Resolve feature sprite URL from feature type key */
    getFeatureSprite?: (featureType: string) => string | undefined;
    /** Resolve unit static sprite URL */
    getUnitSprite?: (unit: IsometricUnit) => string | undefined;
    /** Resolve animated sprite sheet frame for a unit */
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Additional sprite URLs to preload (e.g., effect sprites) */
    effectSpriteUrls?: string[];
    /** Draw canvas effects after units (canvas-specific: cannot be declarative) */
    onDrawEffects?: (
        ctx: CanvasRenderingContext2D,
        animTime: number,
        getImage: (url: string) => HTMLImageElement | undefined,
    ) => void;

    // --- Side-view sprite resolution (projection:'side') ---
    /** Player sprite URL for `side`. */
    playerSprite?: Asset;
    /** Platform-type → tile sprite URL map for `side`. */
    tileSprites?: Record<string, Asset>;
    /** Background color for `side` (when no backgroundImage). */
    bgColor?: string;
    /** World dimensions for `side` follow-camera clamp. */
    worldWidth?: number;
    worldHeight?: number;

    // --- Remote asset loading ---
    /** Manifest mapping entity keys to resolved Asset objects (fallback resolution). */
    assetManifest?: {
        terrains?: Record<string, Asset>;
        units?: Record<string, Asset>;
        features?: Record<string, Asset>;
        effects?: Record<string, Asset>;
    };
}

// =============================================================================
// Side-view platformer branch (ported from PlatformerCanvas)
// =============================================================================

const PLATFORM_COLORS: Record<string, string> = {
    ground: '#4a7c59',
    platform: '#7c6b4a',
    hazard: '#c0392b',
    goal: '#f1c40f',
};
const PLAYER_COLOR = '#3498db';
const PLAYER_EYE_COLOR = '#ffffff';
const SKY_GRADIENT_TOP = '#1a1a2e';
const SKY_GRADIENT_BOTTOM = '#16213e';
const GRID_COLOR = 'rgba(255, 255, 255, 0.03)';

const DEFAULT_PLATFORMS: Platform[] = [
    { x: 0, y: 368, width: 800, height: 32, type: 'ground' },
    { x: 150, y: 280, width: 160, height: 16, type: 'platform' },
    { x: 420, y: 220, width: 160, height: 16, type: 'platform' },
    { x: 620, y: 300, width: 140, height: 16, type: 'platform' },
];

interface SideViewProps {
    player?: SidePlayer;
    platforms: Platform[];
    worldWidth: number;
    worldHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    follow: boolean;
    bgColor: string;
    backgroundImage?: Asset;
    playerSprite?: Asset;
    tileSprites?: Record<string, Asset>;
    effects: ActiveEffect[];
    keyEvent?: EventEmit<{ key: string }>;
    className?: string;
}

/**
 * Side-view renderer — ported verbatim from PlatformerCanvas. Physics is NOT here
 * (it lives in the LOLO model); this only interpolates+draws the authoritative
 * `player`/`platforms` props and emits `keyEvent` on keydown.
 */
function SideView({
    player,
    platforms,
    worldWidth,
    worldHeight,
    canvasWidth,
    canvasHeight,
    follow,
    bgColor,
    backgroundImage,
    playerSprite,
    tileSprites,
    effects,
    keyEvent,
    className,
}: SideViewProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const eventBus = useEventBus();
    const keysRef = useRef<Set<string>>(new Set());
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const loadImage = useCallback((url: string): HTMLImageElement | null => {
        if (!url) return null;
        const cached = imageCache.current.get(url);
        if (cached?.complete && cached.naturalWidth > 0) {
            if (!loadedImages.has(url)) setLoadedImages((prev) => new Set(prev).add(url));
            return cached;
        }
        if (!cached) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => setLoadedImages((prev) => new Set(prev).add(url));
            imageCache.current.set(url, img);
        }
        return null;
    }, [loadedImages]);

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

    // Keyboard → keyEvent (declarative, code-named keys for the LOLO model to map).
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (keysRef.current.has(e.code)) return;
        keysRef.current.add(e.code);
        if (keyEvent) eventBus.emit(`UI:${keyEvent}`, { key: e.code });
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') e.preventDefault();
    }, [eventBus, keyEvent]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        keysRef.current.delete(e.code);
    }, []);

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
            const bgImage = bgImg ? loadImage(bgImg.url) : null;
            if (bgImage) {
                ctx.drawImage(bgImage, 0, 0, cw, ch);
            } else if (bg) {
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, cw, ch);
            } else {
                const grad = ctx.createLinearGradient(0, 0, 0, ch);
                grad.addColorStop(0, SKY_GRADIENT_TOP);
                grad.addColorStop(1, SKY_GRADIENT_BOTTOM);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, cw, ch);
            }

            // Grid lines.
            ctx.strokeStyle = GRID_COLOR;
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
                const tileImg = spriteAsset ? loadImage(spriteAsset.url) : null;

                if (tileImg) {
                    const tileW = tileImg.naturalWidth;
                    const tileH = tileImg.naturalHeight;
                    const scaleH = plat.height / tileH;
                    const scaledW = tileW * scaleH;
                    for (let tx = 0; tx < plat.width; tx += scaledW) {
                        const drawW = Math.min(scaledW, plat.width - tx);
                        const srcW = drawW / scaleH;
                        ctx.drawImage(tileImg, 0, 0, srcW, tileH, platX + tx, platY, drawW, plat.height);
                    }
                } else {
                    const color = PLATFORM_COLORS[platType] ?? PLATFORM_COLORS.ground;
                    ctx.fillStyle = color;
                    ctx.fillRect(platX, platY, plat.width, plat.height);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.fillRect(platX, platY, plat.width, 3);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(platX, platY + plat.height - 2, plat.width, 2);
                    if (platType === 'hazard') {
                        ctx.strokeStyle = '#e74c3c';
                        ctx.lineWidth = 2;
                        for (let sx = platX; sx < platX + plat.width; sx += 12) {
                            ctx.beginPath();
                            ctx.moveTo(sx, platY);
                            ctx.lineTo(sx + 6, platY + plat.height);
                            ctx.stroke();
                        }
                    }
                    if (platType === 'goal') {
                        ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
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
            const playerImg = pSprite ? loadImage(pSprite.url) : null;

            if (playerImg) {
                ctx.save();
                if (!facingRight) {
                    ctx.translate(ppx + pw, ppy);
                    ctx.scale(-1, 1);
                    ctx.drawImage(playerImg, 0, 0, pw, ph);
                } else {
                    ctx.drawImage(playerImg, ppx, ppy, pw, ph);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = PLAYER_COLOR;
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
                ctx.fillStyle = PLAYER_EYE_COLOR;
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
                ctx.fillStyle = '#ffe066';
                ctx.beginPath();
                ctx.arc(fxScreenX, fxScreenY, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = prev;
            }
        };

        return interp.startLoop(drawFrame);
    }, [interp.startLoop, loadImage]);

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

// =============================================================================
// Component
// =============================================================================

export function Canvas2D({
    // Closed-circuit
    className,
    isLoading = false,
    error = null,
    // Projection
    projection = 'isometric',
    // Layer data
    tiles: _tilesPropRaw = [],
    units: _unitsPropRaw = [],
    features: _featuresPropRaw = [],
    effects: _effectsPropRaw = [],
    platforms,
    player,
    backgroundImage,
    // Interaction state
    selectedUnitId = null,
    validMoves = [],
    attackTargets = [],
    hoveredTile = null,
    // Declarative event props
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    keyEvent,
    // View config
    camera = 'pan-zoom',
    scale = 0.4,
    unitScale = 1,
    showMinimap = true,
    animate,
    // Tuning
    debug = false,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    diamondTopY: diamondTopYProp,
    // Asset resolution
    getTerrainSprite,
    getFeatureSprite,
    getUnitSprite,
    resolveUnitFrame,
    effectSpriteUrls = [],
    onDrawEffects,
    // Side-view asset resolution
    playerSprite,
    tileSprites,
    bgColor = '#5c94fc',
    worldWidth = 800,
    worldHeight = 400,
    // Remote asset loading
    assetManifest,
}: Canvas2DProps): React.JSX.Element {
    const isSide = projection === 'side';
    const isFree = projection === 'free';
    // iso/hex/flat painter ordering treats free like flat (row-major, no depth sort).
    const flatLike = projection === 'hex' || projection === 'flat' || isFree;

    // Defensive: array props always iterable.
    const tilesProp = Array.isArray(_tilesPropRaw) ? _tilesPropRaw : [];
    const unitsProp = Array.isArray(_unitsPropRaw) ? _unitsPropRaw : [];
    const featuresProp = Array.isArray(_featuresPropRaw) ? _featuresPropRaw : [];
    const effects = Array.isArray(_effectsPropRaw) ? _effectsPropRaw : [];

    const eventBus = useEventBus();
    const { t } = useTranslate();

    // -- Refs --
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lerpRafRef = useRef(0);
    const animRafRef = useRef(0);

    // -- Viewport size --
    const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const w = Math.round(entry.contentRect.width) || 800;
                const h = Math.round(entry.contentRect.height) || 600;
                setViewportSize((prev) => {
                    if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
                    return { width: w, height: h };
                });
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // -- Normalize units: accept flat x/y or position.x/y --
    const units = useMemo(() =>
        unitsProp.map(u => u.position ? u : { ...u, position: { x: u.x ?? 0, y: u.y ?? 0 } }),
    [unitsProp]);

    // -- Self-contained sprite-sheet animation (atlas-driven, single-frame crop) --
    const { sheetUrls: atlasSheetUrls, resolveUnitFrame: resolveUnitFrameInternal } = useUnitSpriteAtlas(units);

    const resolveFrameForUnit = useCallback((unitId: string): ResolvedFrame | null => {
        return resolveUnitFrame?.(unitId) ?? resolveUnitFrameInternal(unitId);
    }, [resolveUnitFrame, resolveUnitFrameInternal]);

    // -- Normalize features: accept featureType or type --
    const features = useMemo(() =>
        featuresProp.map(f => {
            if (f.type) return f;
            const raw = f as IsometricFeature & { featureType?: string };
            return raw.featureType ? { ...f, type: raw.featureType } : f;
        }),
    [featuresProp]);

    // -- Projection helper: dispatch to isoToScreen, or pixel-direct for `free`. --
    // `free` draws x,y as screen pixels (no diamond, no centering offset).
    const project = useCallback((x: number, y: number, baseOffsetX: number): { x: number; y: number } => {
        if (isFree) return { x, y };
        // iso/hex/flat all flow through isoToScreen (which keys on the same literals).
        return isoToScreen(x, y, scale, baseOffsetX, projection === 'side' ? 'flat' : projection);
    }, [isFree, projection, scale]);

    const unproject = useCallback((screenX: number, screenY: number, baseOffsetX: number): { x: number; y: number } => {
        if (isFree) return { x: Math.round(screenX), y: Math.round(screenY) };
        return screenToIso(screenX, screenY, scale, baseOffsetX, projection === 'side' ? 'flat' : projection);
    }, [isFree, projection, scale]);

    // -- Tiles default sort (stable for painter's algorithm) --
    const sortedTiles = useMemo(() => {
        const arr = [...tilesProp];
        if (flatLike) {
            arr.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
        } else {
            arr.sort((a, b) => {
                const depthA = a.x + a.y;
                const depthB = b.x + b.y;
                return depthA !== depthB ? depthA - depthB : a.y - b.y;
            });
        }
        return arr;
    }, [tilesProp, flatLike]);

    // -- Grid dimensions --
    const gridWidth = useMemo(() => {
        if (sortedTiles.length === 0) return 0;
        return Math.max(...sortedTiles.map(t => t.x)) + 1;
    }, [sortedTiles]);

    const gridHeight = useMemo(() => {
        if (sortedTiles.length === 0) return 0;
        return Math.max(...sortedTiles.map(t => t.y)) + 1;
    }, [sortedTiles]);

    // -- Pre-computed scaled values --
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledTileHeight = TILE_HEIGHT * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;
    const effectiveDiamondTopY = diamondTopYProp ?? DIAMOND_TOP_Y;
    const scaledDiamondTopY = effectiveDiamondTopY * scale;

    // In `free` mode tiles are at literal pixels — no centering offset.
    const baseOffsetX = useMemo(() => {
        if (isFree) return 0;
        return (gridHeight - 1) * (scaledTileWidth / 2);
    }, [isFree, gridHeight, scaledTileWidth]);

    // -- Lookup sets for highlights --
    const validMoveSet = useMemo(() => new Set(validMoves.map(p => `${p.x},${p.y}`)), [validMoves]);
    const attackTargetSet = useMemo(() => new Set(attackTargets.map(p => `${p.x},${p.y}`)), [attackTargets]);

    // -- Collect all sprite URLs for preloading --
    const spriteUrls = useMemo(() => {
        const urls: string[] = [];
        for (const tile of sortedTiles) {
            if (tile.terrainSprite) urls.push(tile.terrainSprite.url);
            else if (getTerrainSprite) {
                const url = getTerrainSprite(tile.terrain ?? '');
                if (url) urls.push(url);
            } else {
                const url = assetManifest?.terrains?.[tile.terrain ?? '']?.url;
                if (url) urls.push(url);
            }
        }
        for (const feature of features) {
            if (feature.sprite) urls.push(feature.sprite.url);
            else if (getFeatureSprite) {
                const url = getFeatureSprite(feature.type);
                if (url) urls.push(url);
            } else {
                const url = assetManifest?.features?.[feature.type]?.url;
                if (url) urls.push(url);
            }
        }
        for (const unit of units) {
            if (unit.sprite) urls.push(unit.sprite.url);
            else if (getUnitSprite) {
                const url = getUnitSprite(unit);
                if (url) urls.push(url);
            } else if (unit.unitType) {
                const url = assetManifest?.units?.[unit.unitType]?.url;
                if (url) urls.push(url);
            }
        }
        if (assetManifest?.effects) {
            for (const asset of Object.values(assetManifest.effects)) {
                if (asset.url) urls.push(asset.url);
            }
        }
        if (effectSpriteUrls) urls.push(...effectSpriteUrls);
        if (atlasSheetUrls.length) urls.push(...atlasSheetUrls);
        if (backgroundImage) urls.push(backgroundImage.url);
        return [...new Set(urls.filter(Boolean))];
    }, [sortedTiles, features, units, getTerrainSprite, getFeatureSprite, getUnitSprite, effectSpriteUrls, atlasSheetUrls, backgroundImage, assetManifest]);

    const { getImage, pendingCount: _imagePendingCount } = useImageCache(spriteUrls);

    // -- Verification bridge --
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        bindCanvasCapture(() => canvas.toDataURL('image/png'));
        return () => { bindCanvasCapture(() => null); };
    }, []);

    // -- Camera --
    const enableCamera = camera === 'pan-zoom';
    const {
        cameraRef,
        targetCameraRef,
        dragDistance,
        handleMouseLeave,
        handlePointerDown,
        handlePointerUp,
        handlePointerMove,
        panBy,
        zoomAtPoint,
        screenToWorld,
        lerpToTarget,
    } = useCamera();

    // -- Sprite resolvers --
    const resolveTerrainSpriteUrl = useCallback((tile: IsometricTile): string | undefined => {
        return tile.terrainSprite?.url || getTerrainSprite?.(tile.terrain ?? '') || assetManifest?.terrains?.[tile.terrain ?? '']?.url;
    }, [getTerrainSprite, assetManifest]);

    const resolveFeatureSpriteUrl = useCallback((featureType: string): string | undefined => {
        return getFeatureSprite?.(featureType) || assetManifest?.features?.[featureType]?.url;
    }, [getFeatureSprite, assetManifest]);

    const resolveUnitSpriteUrl = useCallback((unit: IsometricUnit): string | undefined => {
        return unit.sprite?.url || getUnitSprite?.(unit) || (unit.unitType ? assetManifest?.units?.[unit.unitType]?.url : undefined);
    }, [getUnitSprite, assetManifest]);

    // -- Minimap data --
    const miniMapTiles = useMemo(() => {
        if (!showMinimap) return [];
        return sortedTiles.map(t => ({
            x: t.x,
            y: t.y,
            color: t.terrain === 'water' ? '#3b82f6' : t.terrain === 'mountain' ? '#78716c' : '#4ade80',
        }));
    }, [showMinimap, sortedTiles]);

    const miniMapUnits = useMemo(() => {
        if (!showMinimap) return [];
        return units.filter(u => u.position).map(u => ({
            x: u.position!.x,
            y: u.position!.y,
            color: u.team === 'player' ? '#60a5fa' : u.team === 'enemy' ? '#f87171' : '#9ca3af',
            isPlayer: u.team === 'player',
        }));
    }, [showMinimap, units]);

    const miniMapWidth = gridWidth || 10;
    const miniMapHeight = gridHeight || 10;

    // =========================================================================
    // Main draw — pure function of props; no internal clock
    // =========================================================================
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewportSize.width * dpr;
        canvas.height = viewportSize.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

        // Background.
        if (backgroundImage) {
            const bgImg = getImage(backgroundImage.url);
            if (bgImg) {
                const cam = cameraRef.current;
                const patW = bgImg.naturalWidth;
                const patH = bgImg.naturalHeight;
                const startX = -(cam.x % patW + patW) % patW;
                const startY = -(cam.y % patH + patH) % patH;
                for (let y = startY - patH; y < viewportSize.height; y += patH) {
                    for (let x = startX - patW; x < viewportSize.width; x += patW) {
                        ctx.drawImage(bgImg, x, y);
                    }
                }
            }
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);
        }

        if (sortedTiles.length === 0 && units.length === 0 && features.length === 0) return;

        // Camera transform.
        ctx.save();
        const cam = cameraRef.current;
        ctx.translate(viewportSize.width / 2, viewportSize.height / 2);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);

        // Visible region for culling.
        const visLeft = cam.x - viewportSize.width / cam.zoom;
        const visRight = cam.x + viewportSize.width * 2 / cam.zoom;
        const visTop = cam.y - viewportSize.height / cam.zoom;
        const visBottom = cam.y + viewportSize.height * 2 / cam.zoom;

        // =========== TILES ===========
        for (const tile of sortedTiles) {
            const pos = project(tile.x, tile.y, baseOffsetX);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const spriteUrl = resolveTerrainSpriteUrl(tile);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            if (img) {
                if (img.naturalWidth === 0) {
                    ctx.drawImage(img, pos.x, pos.y, scaledTileWidth, scaledTileHeight);
                } else {
                    const drawW = scaledTileWidth;
                    const drawH = scaledTileWidth * (img.naturalHeight / img.naturalWidth);
                    const drawX = pos.x;
                    // Flat-like (hex/flat/free): anchor sprite top at pos.y so the row
                    // pitch controls spacing, not the ISO bounding-box height.
                    const drawY = flatLike ? pos.y : pos.y + scaledTileHeight - drawH;
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                }
            } else {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = tile.terrain === 'water' ? '#3b82f6' :
                    tile.terrain === 'mountain' ? '#78716c' :
                        tile.terrain === 'stone' ? '#9ca3af' : '#4ade80';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            const drawHighlight = (color: string) => {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            };

            if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
                drawHighlight('rgba(255, 255, 255, 0.15)');
            }
            const tileKey = `${tile.x},${tile.y}`;
            if (validMoveSet.has(tileKey)) drawHighlight('rgba(74, 222, 128, 0.25)');
            if (attackTargetSet.has(tileKey)) drawHighlight('rgba(239, 68, 68, 0.35)');

            if (debug) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.font = `${12 * scale * 2}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY + 4);
            }
        }

        // =========== FEATURES ===========
        const sortedFeatures = [...features].sort((a, b) => {
            if (flatLike) return a.y !== b.y ? a.y - b.y : a.x - b.x;
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            return depthA !== depthB ? depthA - depthB : a.y - b.y;
        });

        for (const feature of sortedFeatures) {
            const pos = project(feature.x, feature.y, baseOffsetX);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const spriteUrl = feature.sprite?.url || resolveFeatureSpriteUrl(feature.type);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            const centerX = pos.x + scaledTileWidth / 2;
            const featureGroundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;
            const isCastle = feature.type === 'castle';
            const featureDrawH = isCastle ? scaledFloorHeight * 3.5 : scaledFloorHeight * 1.6;
            const maxFeatureW = isCastle ? scaledTileWidth * 1.8 : scaledTileWidth * 0.7;

            if (img) {
                const ar = img.naturalWidth / img.naturalHeight;
                let drawH = featureDrawH;
                let drawW = featureDrawH * ar;
                if (drawW > maxFeatureW) {
                    drawW = maxFeatureW;
                    drawH = maxFeatureW / ar;
                }
                const drawX = centerX - drawW / 2;
                const drawY = featureGroundY - drawH;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                const color = FEATURE_COLORS[feature.type] || FEATURE_COLORS.default;
                ctx.beginPath();
                ctx.arc(centerX, featureGroundY - 8 * scale, 16 * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // =========== UNITS ===========
        const unitsWithPosition = units.filter((u): u is typeof u & { position: { x: number; y: number } } => !!u.position);
        const sortedUnits = [...unitsWithPosition].sort((a, b) => {
            if (flatLike) return a.position.y !== b.position.y ? a.position.y - b.position.y : a.position.x - b.position.x;
            const depthA = a.position.x + a.position.y;
            const depthB = b.position.x + b.position.y;
            return depthA !== depthB ? depthA - depthB : a.position.y - b.position.y;
        });

        for (const unit of sortedUnits) {
            const pos = project(unit.position.x, unit.position.y, baseOffsetX);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const isSelected = unit.id === selectedUnitId;
            const centerX = pos.x + scaledTileWidth / 2;
            const groundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;

            // Breathing offset is static — LOLO state machine drives animation externally.
            const breatheOffset = 0;

            const unitSpriteUrl = resolveUnitSpriteUrl(unit);
            const img = unitSpriteUrl ? getImage(unitSpriteUrl) : null;
            const unitDrawH = scaledFloorHeight * spriteHeightRatio * unitScale;
            const maxUnitW = scaledTileWidth * spriteMaxWidthRatio * unitScale;
            // Crop `unit.sprite.url` as a sheet ONLY with a real `spriteSheet` atlas (GR-1).
            const unitIsSheet = unit.spriteSheet?.url !== undefined;
            const SHEET_ROWS = 5;
            const sheetFrameW = img ? img.naturalWidth / SHEET_COLUMNS : 0;
            const sheetFrameH = img ? img.naturalHeight / SHEET_ROWS : 0;
            const frameW = unitIsSheet ? sheetFrameW : (img?.naturalWidth ?? 1);
            const frameH = unitIsSheet ? sheetFrameH : (img?.naturalHeight ?? 1);
            const ar = frameW / (frameH || 1);
            let drawH = unitDrawH;
            let drawW = unitDrawH * ar;
            if (drawW > maxUnitW) {
                drawW = maxUnitW;
                drawH = maxUnitW / ar;
            }

            // Movement trail / ghost.
            if (unit.previousPosition && (unit.previousPosition.x !== unit.position.x || unit.previousPosition.y !== unit.position.y)) {
                const ghostPos = project(unit.previousPosition.x, unit.previousPosition.y, baseOffsetX);
                const ghostCenterX = ghostPos.x + scaledTileWidth / 2;
                const ghostGroundY = ghostPos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;

                ctx.save();
                ctx.globalAlpha = 0.25;
                if (img) {
                    if (unitIsSheet) {
                        ctx.drawImage(img, 0, 0, sheetFrameW, sheetFrameH, ghostCenterX - drawW / 2, ghostGroundY - drawH, drawW, drawH);
                    } else {
                        ctx.drawImage(img, ghostCenterX - drawW / 2, ghostGroundY - drawH, drawW, drawH);
                    }
                } else {
                    const color = unit.team === 'player' ? '#3b82f6' :
                        unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                    ctx.beginPath();
                    ctx.arc(ghostCenterX, ghostGroundY - 16 * scale, 20 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                ctx.restore();
            }

            if (isSelected) {
                ctx.beginPath();
                ctx.ellipse(centerX, groundY, drawW / 2 + 4 * scale, 12 * scale, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            const frame = resolveFrameForUnit(unit.id);
            const frameImg = frame ? getImage(frame.sheetUrl) : null;

            if (frame && frameImg) {
                const frameAr = frame.sw / frame.sh;
                let fDrawH = unitDrawH;
                let fDrawW = unitDrawH * frameAr;
                if (fDrawW > maxUnitW) {
                    fDrawW = maxUnitW;
                    fDrawH = maxUnitW / frameAr;
                }
                const spriteY = groundY - fDrawH - (frame.applyBreathing ? breatheOffset : 0);

                ctx.save();
                if (unit.team) {
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                }
                if (frame.flipX) {
                    ctx.translate(centerX, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, -fDrawW / 2, spriteY, fDrawW, fDrawH);
                } else {
                    ctx.drawImage(frameImg, frame.sx, frame.sy, frame.sw, frame.sh, centerX - fDrawW / 2, spriteY, fDrawW, fDrawH);
                }
                ctx.restore();
            } else if (img) {
                const spriteY = groundY - drawH - breatheOffset;
                const drawUnit = (x: number) => {
                    if (unitIsSheet) {
                        ctx.drawImage(img, 0, 0, sheetFrameW, sheetFrameH, x, spriteY, drawW, drawH);
                    } else {
                        ctx.drawImage(img, x, spriteY, drawW, drawH);
                    }
                };
                if (unit.team) {
                    ctx.save();
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                    drawUnit(centerX - drawW / 2);
                    ctx.restore();
                } else {
                    drawUnit(centerX - drawW / 2);
                }
            } else {
                const color = unit.team === 'player' ? '#3b82f6' :
                    unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                ctx.beginPath();
                ctx.arc(centerX, groundY - 20 * scale - breatheOffset, 20 * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw ActiveEffect[] sprites after units.
        for (const fx of effects) {
            const spriteUrl = assetManifest?.effects?.[fx.key]?.url;
            if (!spriteUrl) continue;
            const img = getImage(spriteUrl);
            if (!img) continue;
            const pos = project(fx.x, fx.y, baseOffsetX);
            const cx = pos.x + scaledTileWidth / 2;
            const cy = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5;
            const alpha = Math.min(1, fx.ttl / 4);
            const prev = ctx.globalAlpha;
            ctx.globalAlpha = alpha;
            ctx.drawImage(img, cx - img.naturalWidth / 2, cy - img.naturalHeight / 2);
            ctx.globalAlpha = prev;
        }

        onDrawEffects?.(ctx, 0, getImage);

        ctx.restore();
    }, [
        sortedTiles, units, features, selectedUnitId, effects,
        project, flatLike, scale, debug, resolveTerrainSpriteUrl, resolveFeatureSpriteUrl, resolveUnitSpriteUrl, resolveFrameForUnit, getImage,
        baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, scaledDiamondTopY,
        validMoveSet, attackTargetSet, hoveredTile, viewportSize, onDrawEffects,
        backgroundImage, cameraRef, unitScale, assetManifest, spriteHeightRatio, spriteMaxWidthRatio,
    ]);

    // =========================================================================
    // Follow camera: center on selected unit (camera:'follow' or unit selection)
    // =========================================================================
    useEffect(() => {
        if (camera === 'fixed') return;
        if (!selectedUnitId) return;
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit?.position) return;
        const pos = project(unit.position.x, unit.position.y, baseOffsetX);
        const centerX = pos.x + scaledTileWidth / 2;
        const centerY = pos.y + scaledDiamondTopY + scaledFloorHeight / 2;
        targetCameraRef.current = {
            x: centerX - viewportSize.width / 2,
            y: centerY - viewportSize.height / 2,
        };
    }, [camera, selectedUnitId, units, project, baseOffsetX, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, targetCameraRef]);

    // =========================================================================
    // Redraw on data change — pure, no internal clock
    // =========================================================================
    useEffect(() => {
        if (isSide) return;
        draw();
    }, [draw, isSide]);

    useEffect(() => {
        if (isSide) return;
        draw();
    }, [_imagePendingCount, isSide]);

    // Camera-lerp RAF: runs only while a programmatic camera target is active.
    useEffect(() => {
        if (isSide) return;
        if (selectedUnitId == null) return;
        let running = true;
        const tick = () => {
            if (!running) return;
            const stillLerping = lerpToTarget();
            draw();
            if (stillLerping) lerpRafRef.current = requestAnimationFrame(tick);
        };
        lerpRafRef.current = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(lerpRafRef.current);
        };
    }, [isSide, selectedUnitId, lerpToTarget, draw]);

    // Opt-in animation clock: a steady RAF redraw at `animate.fps`. DEFAULT OFF —
    // the LOLO model owns the clock; this is only for boards that explicitly want
    // continuous internal frames (e.g. effect fades resolved by the renderer).
    useEffect(() => {
        if (isSide) return;
        if (!animate) return;
        let running = true;
        const interval = 1000 / Math.max(1, animate.fps);
        let last = 0;
        const tick = (ts: number) => {
            if (!running) return;
            if (ts - last >= interval) {
                last = ts;
                draw();
            }
            animRafRef.current = requestAnimationFrame(tick);
        };
        animRafRef.current = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(animRafRef.current);
        };
    }, [isSide, animate, draw]);

    // =========================================================================
    // Pointer / gesture handlers (iso/hex/flat/free)
    // =========================================================================
    const singlePointerActiveRef = useRef(false);

    const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        singlePointerActiveRef.current = true;
        if (enableCamera) handlePointerDown(e);
    }, [enableCamera, handlePointerDown]);

    const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (enableCamera) handlePointerMove(e, () => draw());
    }, [enableCamera, handlePointerMove, draw]);

    const handleCanvasHover = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (singlePointerActiveRef.current) return;
        if (!tileHoverEvent || !canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = unproject(adjustedX, adjustedY, baseOffsetX);

        const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
        if (tileExists) eventBus.emit(`UI:${tileHoverEvent}`, { x: isoPos.x, y: isoPos.y });
    }, [screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, unproject, baseOffsetX, tilesProp, tileHoverEvent, eventBus]);

    const handleCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        singlePointerActiveRef.current = false;
        if (enableCamera) handlePointerUp();
        if (dragDistance() > 5) return;
        if (!canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = unproject(adjustedX, adjustedY, baseOffsetX);

        const clickedUnit = units.find(u => u.position?.x === isoPos.x && u.position?.y === isoPos.y);
        if (clickedUnit && unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId: clickedUnit.id });
        } else if (tileClickEvent) {
            const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
            if (tileExists) eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
        }
    }, [enableCamera, handlePointerUp, dragDistance, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, unproject, baseOffsetX, units, tilesProp, unitClickEvent, tileClickEvent, eventBus]);

    const handleCanvasPointerLeave = useCallback(() => {
        handleMouseLeave();
        if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
    }, [handleMouseLeave, tileLeaveEvent, eventBus]);

    const applyZoom = useCallback((factor: number, centerX: number, centerY: number) => {
        if (enableCamera) zoomAtPoint(factor, centerX, centerY, viewportSize, () => draw());
    }, [enableCamera, zoomAtPoint, viewportSize, draw]);

    const applyPanDelta = useCallback((dx: number, dy: number) => {
        if (enableCamera) panBy(dx, dy, () => draw());
    }, [enableCamera, panBy, draw]);

    const cancelSinglePointer = useCallback(() => {
        singlePointerActiveRef.current = false;
        if (enableCamera) handlePointerUp();
    }, [enableCamera, handlePointerUp]);

    const gestureHandlers = useCanvasGestures({
        canvasRef,
        enabled: enableCamera || !!tileHoverEvent || !!tileClickEvent || !!unitClickEvent,
        onPointerDown: handleCanvasPointerDown,
        onPointerMove: handleCanvasPointerMove,
        onPointerUp: handleCanvasPointerUp,
        onZoom: applyZoom,
        onPanDelta: applyPanDelta,
        onMultiTouchStart: cancelSinglePointer,
    });

    // Keyboard for `free` projection (top-down shooters etc.).
    useEffect(() => {
        if (isSide || !isFree || !keyEvent) return;
        const onKey = (e: KeyboardEvent) => eventBus.emit(`UI:${keyEvent}`, { key: e.code });
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isSide, isFree, keyEvent, eventBus]);

    // =========================================================================
    // DOM overlay data — health bars + name labels positioned over canvas
    // =========================================================================
    const unitOverlays = useMemo(() => {
        if (units.length === 0) return [];
        return units
            .filter((u): u is typeof u & { position: { x: number; y: number } } => !!u.position)
            .map(u => {
                const pos = project(u.position!.x, u.position!.y, baseOffsetX);
                const cam = cameraRef.current;
                const screenX = (pos.x + scaledTileWidth / 2 - (cam.x + viewportSize.width / 2)) * cam.zoom + viewportSize.width / 2;
                const screenY = (pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5 - (cam.y + viewportSize.height / 2)) * cam.zoom + viewportSize.height / 2;
                return { unit: u, screenX, screenY };
            });
    }, [units, project, baseOffsetX, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, cameraRef]);

    // =========================================================================
    // Render
    // =========================================================================

    if (error) {
        return (
            <Box className={cn('flex items-center justify-center w-full h-full bg-[var(--color-card)] rounded-container', className)}>
                <Stack direction="vertical" gap="md" align="center">
                    <Icon name="alert-circle" size="xl" />
                    <Typography variant="body" className="text-error">{error.message}</Typography>
                </Stack>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box className={cn('flex items-center justify-center w-full h-full bg-[var(--color-card)] rounded-container', className)}>
                <Stack direction="vertical" gap="md" align="center">
                    <Icon name="loader" size="xl" className="animate-spin" />
                    <Typography variant="body" className="text-muted-foreground">
                        {t('canvas.loadingMessage') || 'Loading…'}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    // Side-view projection: isolated platformer branch.
    if (isSide) {
        return (
            <Box ref={containerRef} className={cn('relative overflow-hidden w-full h-full', className)}>
                <SideView
                    player={player}
                    platforms={platforms && platforms.length ? platforms : DEFAULT_PLATFORMS}
                    worldWidth={worldWidth}
                    worldHeight={worldHeight}
                    canvasWidth={viewportSize.width}
                    canvasHeight={viewportSize.height}
                    follow={camera === 'follow'}
                    bgColor={bgColor}
                    backgroundImage={backgroundImage}
                    playerSprite={playerSprite}
                    tileSprites={tileSprites}
                    effects={effects}
                    keyEvent={keyEvent}
                    className={className}
                />
            </Box>
        );
    }

    // Empty state for grid projections.
    if (sortedTiles.length === 0 && units.length === 0 && features.length === 0) {
        return (
            <Box
                className={cn('relative w-full overflow-hidden rounded-container', className)}
                style={{ height: viewportSize.height }}
                data-testid="canvas-2d-empty"
            >
                <Box className="flex items-center justify-center h-full bg-[var(--color-card)] rounded-container">
                    <Stack direction="vertical" gap="md" align="center">
                        <Icon name="map" size="xl" />
                        <Typography variant="body" className="text-muted-foreground">
                            {t('canvas.emptyMessage') || 'No map data loaded'}
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            className={cn('relative overflow-hidden w-full h-full', className)}
        >
            <canvas
                ref={canvasRef}
                data-testid="canvas-2d"
                onPointerDown={gestureHandlers.onPointerDown}
                onPointerMove={(e) => { gestureHandlers.onPointerMove(e); handleCanvasHover(e); }}
                onPointerUp={gestureHandlers.onPointerUp}
                onPointerCancel={gestureHandlers.onPointerCancel}
                onPointerLeave={handleCanvasPointerLeave}
                onWheel={gestureHandlers.onWheel}
                onContextMenu={(e) => e.preventDefault()}
                className="cursor-pointer touch-none"
                tabIndex={isFree ? 0 : undefined}
                style={{
                    width: viewportSize.width,
                    height: viewportSize.height,
                }}
            />
            {/* Test bridge: hidden action buttons for Playwright to discover and trigger game events */}
            {process.env.NODE_ENV !== 'production' && (
                <div data-game-actions="" className="sr-only" aria-hidden="true">
                    {tileClickEvent && (
                        <button
                            data-event={tileClickEvent}
                            data-x="0"
                            data-y="0"
                            onClick={() => eventBus.emit(`UI:${tileClickEvent}`, { x: 0, y: 0 })}
                        >
                            {tileClickEvent}
                        </button>
                    )}
                    {unitClickEvent && units && units.length > 0 && (
                        <button
                            data-event={unitClickEvent}
                            data-unit-id={units[0].id}
                            onClick={() => eventBus.emit(`UI:${unitClickEvent}`, { unitId: units[0].id })}
                        >
                            {unitClickEvent}
                        </button>
                    )}
                </div>
            )}
            {/* DOM overlays: health bars and name labels per unit */}
            {unitOverlays.map(({ unit, screenX, screenY }) => (
                <div
                    key={unit.id}
                    className="absolute pointer-events-none"
                    style={{ left: Math.round(screenX), top: Math.round(screenY), transform: 'translate(-50%, 0)', zIndex: 5 }}
                >
                    {unit.name && (
                        <div
                            className="text-white text-xs font-bold px-1.5 py-0.5 rounded mb-0.5 whitespace-nowrap"
                            style={{ background: unit.team === 'player' ? 'rgba(59,130,246,0.9)' : unit.team === 'enemy' ? 'rgba(239,68,68,0.9)' : 'rgba(107,114,128,0.9)' }}
                        >
                            {unit.name}
                        </div>
                    )}
                    {unit.health !== undefined && unit.maxHealth !== undefined && unit.maxHealth > 0 && (
                        <HealthBar current={unit.health} max={unit.maxHealth} format="bar" size="sm" />
                    )}
                </div>
            ))}
            {showMinimap && (
                <div className="absolute bottom-2 right-2 pointer-events-none" style={{ zIndex: 10 }}>
                    <MiniMap
                        tiles={miniMapTiles}
                        units={miniMapUnits}
                        width={150}
                        height={100}
                        mapWidth={miniMapWidth}
                        mapHeight={miniMapHeight}
                    />
                </div>
            )}
        </Box>
    );
}

Canvas2D.displayName = 'Canvas2D';

export default Canvas2D;
