'use client';
/**
 * Canvas2D — the thin 2D draw-host (Drawable Canvas, P6 closing).
 *
 * A pure walker: the board authors a `drawables` list (the neutral `draw-*`
 * children) and this host paints them through the portable `Painter2D` seam,
 * projecting each `ScenePos` for the chosen `projection` (iso/hex/flat/free/side).
 * It owns NO game data — tiles, units, features, effects, highlights, health bars
 * and labels are all `draw-*` children composed in `.lolo`, not props here. The
 * only local state is view state: viewport size, camera, sprite/atlas cache.
 *
 * Projections: iso/hex/flat/free go through the shared `create2DProjector`; `side`
 * reuses the `free` (identity, world-pixel) projector — side boards author their
 * platforms/player as `draw-*` children like every other board.
 *
 * Camera: `pan-zoom` (drag+wheel), `fixed` (still), or `follow` (lerps to the
 * neutral core `Camera.target`, forwarded as `followTarget`). The unit-position
 * interpolation of the old data-prop host is gone — the LOLO state machine owns
 * entity motion; this host only tweens the camera.
 *
 * Interaction: a pointer emits the projector-unprojected scene coordinate as
 * `tileClickEvent`/`tileHoverEvent` `{ x, y }` (the FSM validates the cell) and
 * `tileLeaveEvent` `{}`. `unitClickEvent` needs a per-entity id the neutral
 * drawable descriptors don't carry (they hold only a `ScenePos`); its hit-test is
 * a deferred, tracked fork (see docs/Almadar_Std_Game_V2_PLAN.md) — the prop is
 * accepted but not yet emitted from a coordinate.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createLogger } from '@almadar/logger';
import type { Asset, AssetUrl, EventEmit, ScenePos } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Button } from '../../core/atoms/Button';
import { Stack } from '../../core/atoms/Stack';
import { Icon } from '../../core/atoms/Icon';
import { Typography } from '../../core/atoms/Typography';
import { MiniMap } from '../atoms/MiniMap';
import { useImageCache } from '../../../hooks/useImageCache';
import { resolveAssetSource, blit, getAtlas, isAtlasAsset } from '../../../lib/atlasSlice';
import { useCamera } from '../../../hooks/useCamera';
import { useCanvasGestures } from '../../../hooks/useCanvasGestures';
import { bindCanvasCapture, bindLastDrawables } from '../../../lib/verificationRegistry';
import { createWebPainter } from '../../../lib/webPainter2d';
import { create2DProjector, type Projection2D } from '../../../lib/drawable/projector';
import { paintDrawable, type DrawableNode } from '../../../lib/drawable/paintDispatch';
import { DrawableRegistryContext, type DrawableRegistrar } from '../../../lib/drawable/registry';
import type { DrawSpriteLayerProps } from './DrawSpriteLayer';
import type { DrawShapeLayerProps } from './DrawShapeLayer';
import type { DrawTextLayerProps } from './DrawTextLayer';
import { collectDrawnItems, buildHitIndex, hitTestSprites } from '../../../lib/drawable/hitTest';
import type { DrawContext } from '../../../lib/drawable/contract';
import {
    screenToIso,
    TILE_WIDTH,
    DIAMOND_TOP_Y,
    BACKGROUND_FALLBACK_COLOR,
    MINIMAP_TERRAIN_COLORS,
} from '../../../lib/isometric';
import type { UiError } from '../../core/atoms/types';

const canvas2DLog = createLogger('almadar:ui:game-canvas');

// =============================================================================
// Props
// =============================================================================

export interface TileCoord {
    x: number;
    y: number;
}

/** Projection axis. iso/hex/flat use `isoToScreen`; `free`/`side` are world-pixel-direct. */
export type Projection = 'isometric' | 'hex' | 'flat' | 'free' | 'side';

/** Camera behavior. `pan-zoom` = user drag+wheel; `follow` = track `followTarget`;
 *  `fixed` = no camera motion. */
export type CameraMode = 'pan-zoom' | 'follow' | 'fixed';

/** A side-view platform (AABB rect). Retained as a shared type for the 3D side
 *  scene; side boards now author platforms as `draw-*` children, not this shape. */
export interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: 'ground' | 'platform' | 'hazard' | 'goal';
}

/** A side-view player. Retained as a shared type for the 3D side scene; side
 *  boards now author the player as a `draw-sprite` child, not this shape. */
export interface SidePlayer {
    x: number;
    y: number;
    width?: number;
    height?: number;
    vx?: number;
    vy?: number;
    grounded?: boolean;
    facingRight?: boolean;
    animation?: string;
    frame?: number;
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
    /** Projection axis (default 'isometric'). */
    projection?: Projection;

    // --- Scene ---
    /** Neutral drawable descriptors (the `draw-*` children). The host walks these. */
    drawables?: DrawableNode[];
    /** Background image (tiled behind iso/hex/flat/free; cover-scaled for atlas slices).
     * A bare URL string is accepted as shorthand for a standalone backdrop. */
    backgroundImage?: AssetUrl | Asset;

    // --- Declarative events back to LOLO ---
    /** Emits UI:{tileClickEvent} with the unprojected scene { x, y } on click. */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /**
     * Unit-click event. The neutral drawable host cannot resolve a click to a
     * per-entity id (descriptors carry only a `ScenePos`, no id), so this prop is
     * accepted but not yet emitted — the id-hit-test is a tracked fork
     * (docs/Almadar_Std_Game_V2_PLAN.md).
     */
    unitClickEvent?: EventEmit<{ unitId: string }>;
    /** Emits UI:{tileHoverEvent} with the unprojected scene { x, y } on hover. */
    tileHoverEvent?: EventEmit<{ x: number; y: number }>;
    /** Emits UI:{tileLeaveEvent} with {} on pointer leave. */
    tileLeaveEvent?: EventEmit<Record<string, never>>;
    /** Maps a keydown `e.code` → the board's SEMANTIC event (device-agnostic input). */
    keyMap?: Record<string, string>;
    /** Maps a keyup `e.code` → the board's SEMANTIC event. */
    keyUpMap?: Record<string, string>;

    // --- View config (pure render) ---
    /** Camera behavior (default 'pan-zoom'). */
    camera?: CameraMode;
    /** Render scale, legacy-squared semantics: on-screen cell ≈ `256 × scale²` px
     *  (the authored contract every board tuned its value for). Converted internally
     *  to the single camera zoom against the board's native tile width, so the cell
     *  pitch follows the asset while the on-screen size stays as authored.
     *  Ignored when `fit` is on; passed through raw for `free`/`side`
     *  (world-pixel-direct). */
    scale?: number;
    /** Native tile/cell width in source px for this board's asset (e.g. 16 for
     *  Kenney tiny-dungeon, ~128 for iso blocks). The grid cell pitch follows the
     *  asset, so tile textures map 1:1 (crisp, no stretch). Defaults to the
     *  detected atlas tile width, else 256. */
    tileWidth?: number;
    /** Auto-fit the board's grid extent to the viewport (default false — boards
     *  render at their authored `scale` and overflow → pan). Opt in for
     *  whole-board-overview boards. User wheel/pinch zoom always wins after the
     *  initial fit. */
    fit?: boolean;
    /** Toggle minimap overlay. */
    showMinimap?: boolean;
    /** Follow-camera target in scene space (the neutral core `Camera.target`). When
     *  `camera:'follow'` the host lerps to keep this point centered. */
    followTarget?: ScenePos;
    /** Initial camera position in scene space (the neutral core `Camera.pos`). The
     *  host projects this to screen space and centers the viewport on it for the
     *  first render; ignored once the user pans or a follow target takes over. */
    cameraPos?: ScenePos;
    /** Solid backdrop colour (drawn when no `backgroundImage`). */
    bgColor?: string;
    /** Declarative JSX drawable children (`<DrawShape .../>` composed in paint order).
     *  When `drawables` is empty, each child registers its descriptor via the
     *  drawable registry context and the host paints them. */
    children?: React.ReactNode;
}

/** A backdrop may be authored as a bare URL string or a full `Asset`; normalize a
 * string to a minimal decoration Asset so the paint path stays Asset-only. */
function normalizeBackdrop(bg: AssetUrl | Asset | undefined): Asset | undefined {
    return typeof bg === 'string'
        ? { url: bg, role: 'decoration', category: 'background' }
        : bg;
}

// =============================================================================
// Component
// =============================================================================

export function Canvas2D({
    className,
    isLoading = false,
    error = null,
    projection = 'isometric',
    drawables,
    backgroundImage: backgroundImageRaw,
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    keyMap,
    keyUpMap,
    camera = 'pan-zoom',
    scale = 0.4,
    tileWidth,
    fit = false,
    showMinimap = true,
    followTarget,
    cameraPos,
    bgColor,
    children,
}: Canvas2DProps): React.JSX.Element {
    const instanceId = useMemo(() => Math.random().toString(36).slice(2, 8), []);

    // -- Drawable registration (JSX children path) --
    // When `drawables` prop is empty, collect descriptors registered by child
    // `draw-*` atoms via context. Cleared at the top of each render so children
    // re-register fresh; read in `draw` (useEffect, after children committed).
    const childDrawablesRef = useRef<DrawableNode[]>([]);
    childDrawablesRef.current = [];
    const registerChildDrawable: DrawableRegistrar = useCallback((node) => {
        childDrawablesRef.current.push(node);
    }, []);
    const hasJsxChildren = React.Children.count(children) > 0;
    const effectiveDrawables: DrawableNode[] | undefined =
        drawables && drawables.length > 0 ? drawables : childDrawablesRef.current;
    type DrawableLayer = DrawSpriteLayerProps | DrawShapeLayerProps | DrawTextLayerProps;
    interface DrawableLayerSummary {
        type: string;
        itemsLen?: number;
        firstItem?: DrawableNode;
    }
    function isDrawableLayer(node: DrawableNode): node is DrawableLayer {
        return (
            node.type === 'draw-sprite-layer' ||
            node.type === 'draw-shape-layer' ||
            node.type === 'draw-text-layer'
        );
    }
    const layerSummaries = drawables?.map((d): DrawableLayerSummary => {
        if (!isDrawableLayer(d)) return { type: d.type };
        return { type: d.type, itemsLen: d.items.length, firstItem: d.items[0] };
    });
    canvas2DLog.debug('Canvas2D render', { instanceId, projection, scale, cameraMode: camera, cameraPos: cameraPos ? JSON.stringify(cameraPos) : undefined, drawablesCount: drawables?.length, layerSummaries: layerSummaries ? JSON.stringify(layerSummaries) : undefined });
    const backgroundImage = normalizeBackdrop(backgroundImageRaw);
    const isFree = projection === 'free';
    // 'flat'/'free'/'side' are square-pitch, world-pixel-direct; iso/hex keep diamond metrics.
    const squareGrid = projection === 'flat' || isFree || projection === 'side';
    /** The projector layout — `side` reuses `free` (identity, world pixels). */
    const layout: Projection2D = projection === 'side' ? 'free' : projection;

    const eventBus = useEventBus();
    const { t } = useTranslate();

    // -- Refs --
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lerpRafRef = useRef(0);

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

    // -- Tile-space cell metrics (the projector works in the board's native tile
    //    width; the camera zoom is the only on-screen scaler). These feed the
    //    pointer→scene inverse + the iso centering offset. --
    // Atlas-ready trigger (re-detect / re-draw when a lazily-fetched atlas lands).
    const [atlasVersion, setAtlasVersion] = useState(0);
    const bumpAtlas = useCallback(() => setAtlasVersion((v) => v + 1), []);
    // Auto-detect the board's native tile width from its first tilesheet atlas —
    // assets declare `tileWidth` in their JSON, so the grid adheres to the art
    // with zero per-board config. Overridable via the `tileWidth` prop.
    const detectedTileWidth = useMemo(() => {
        for (const n of drawables ?? []) {
            const refs: Asset[] = [];
            if (n.type === 'draw-sprite') refs.push(n.asset);
            else if (n.type === 'draw-sprite-layer') for (const it of n.items) refs.push(it.asset);
            for (const a of refs) {
                if (a && isAtlasAsset(a) && a.atlas) {
                    const atlas = getAtlas(a.atlas, bumpAtlas);
                    if (atlas) {
                        // Tilesheet: declared `tileWidth`. Subtexture atlas (iso/hex
                        // block art): use the first frame's width as the cell width.
                        if ('tileWidth' in atlas) return atlas.tileWidth;
                        if ('subTextures' in atlas) {
                            const first = Object.values(atlas.subTextures)[0];
                            if (first && typeof first.width === 'number') return first.width;
                        }
                    }
                }
            }
        }
        return undefined;
    }, [drawables, atlasVersion]);
    const nativeTileW = tileWidth ?? detectedTileWidth ?? TILE_WIDTH;
    const scaledTileWidth = nativeTileW;
    const scaledFloorHeight = nativeTileW / 2;
    const scaledDiamondTopY = nativeTileW * (DIAMOND_TOP_Y / TILE_WIDTH);

    // -- Scene extent, derived from the drawn descriptors (no tile data prop) --
    const drawnItems = useMemo(() => collectDrawnItems(drawables ?? []), [drawables]);
    const scenePositions = useMemo(() => drawnItems.map((i) => i.pos), [drawnItems]);
    // Click hit-test: a descriptor that carries an `id` (a unit sprite) maps its
    // cell → id. Later descriptors win, so a unit drawn over its tile takes the cell.
    const hitIndex = useMemo(() => buildHitIndex(drawnItems), [drawnItems]);
    const gridExtent = useMemo(() => {
        if (scenePositions.length === 0) return { width: 0, height: 0 };
        let maxX = 0;
        let maxY = 0;
        for (const p of scenePositions) {
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
        return { width: maxX + 1, height: maxY + 1 };
    }, [scenePositions]);

    // Default camera focus: the grid's center cell when the board authors no
    // `cameraPos` — grid layouts only; `free`/`side` keep world-origin framing.
    const defaultGridFocus = useMemo((): ScenePos | undefined => {
        if (isFree || projection === 'side') return undefined;
        if (gridExtent.width < 2 || gridExtent.height < 2) return undefined;
        return { x: (gridExtent.width - 1) / 2, y: (gridExtent.height - 1) / 2 } as ScenePos;
    }, [isFree, projection, gridExtent]);

    // In `free`/`side`/`flat` tiles are at literal pixels / square cells — no iso centering offset.
    const baseOffsetX = useMemo(() => {
        if (isFree || projection === 'flat' || projection === 'side') return 0;
        return (gridExtent.height - 1) * (scaledTileWidth / 2);
    }, [isFree, projection, gridExtent.height, scaledTileWidth]);

    // -- Effective on-screen zoom (the single scaler; the projector works in
    //    tile-space so a tile texture maps 1:1 to its cell at `zoom`x). --
    // `free`/`side` are world-pixel-direct: zoom = raw `scale`. Grid layouts keep
    // the legacy-squared contract (on-screen cell ≈ 256×scale² px) by converting
    // the authored scale against the native tile width. `fit` (opt-in) instead
    // fits the grid extent to 85% of the viewport.
    const effectiveZoom = useMemo(() => {
        if (isFree || projection === 'side') return scale;
        if (!fit) {
            const z = (TILE_WIDTH * scale * scale) / nativeTileW;
            return Number.isFinite(z) && z > 0 ? z : scale;
        }
        if (!viewportSize.width || gridExtent.width < 2 || gridExtent.height < 2) return scale;
        // Board pixel extent in tile-space: iso spans (w+h) half-widths both axes;
        // hex staggers columns; flat is a square pitch.
        let boardW: number;
        let boardH: number;
        if (projection === 'flat') {
            boardW = gridExtent.width * nativeTileW;
            boardH = gridExtent.height * nativeTileW;
        } else if (projection === 'hex') {
            boardW = (gridExtent.width + 0.5) * nativeTileW;
            boardH = gridExtent.height * (nativeTileW / 2) * 0.75 + nativeTileW / 2;
        } else {
            boardW = (gridExtent.width + gridExtent.height) * (nativeTileW / 2);
            boardH = (gridExtent.width + gridExtent.height) * (nativeTileW / 4);
        }
        const z = Math.min((viewportSize.width * 0.85) / boardW, (viewportSize.height * 0.85) / boardH);
        return Number.isFinite(z) && z > 0 ? z : scale;
    }, [isFree, projection, fit, viewportSize, gridExtent, nativeTileW, scale]);

    // -- Projector (shared by draw + follow-camera) --
    const projector = useMemo(
        () => create2DProjector({ tileWidth: nativeTileW, baseOffsetX, layout }),
        [nativeTileW, baseOffsetX, layout],
    );

    // -- Pointer → scene inverse (iso/hex/flat/free/side) --
    const unproject = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
        // `free`/`side` are world-pixel-direct; the `=== 'free'` test (not the aliased
        // `isFree`) narrows `projection` to a `TileLayout` for `screenToIso` below.
        if (projection === 'free' || projection === 'side') return { x: Math.round(screenX), y: Math.round(screenY) };
        return screenToIso(screenX, screenY, nativeTileW, baseOffsetX, projection);
    }, [projection, nativeTileW, baseOffsetX]);

    // -- Background image preload --
    const bgUrls = useMemo(() => (backgroundImage ? [backgroundImage.url] : []), [backgroundImage]);
    const { getImage, pendingCount: _imagePendingCount } = useImageCache(bgUrls);

    // -- Verification bridge --
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        bindCanvasCapture(() => canvas.toDataURL('image/png'));
        bindLastDrawables(() => drawables ?? null);
        return () => {
            bindCanvasCapture(() => null);
            bindLastDrawables(() => null);
        };
    }, [drawables]);

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
    } = useCamera({ zoom: effectiveZoom });

    // Re-render when a lazily-fetched atlas JSON lands (see atlasSlice.getAtlas).

    // -- Minimap data (dots at each drawn descriptor's scene position) --
    const miniMapTiles = useMemo(() => {
        if (!showMinimap) return [];
        const color = MINIMAP_TERRAIN_COLORS.default;
        return scenePositions.map((p) => ({ x: p.x, y: p.y, color }));
    }, [showMinimap, scenePositions]);
    const miniMapWidth = gridExtent.width || 10;
    const miniMapHeight = gridExtent.height || 10;

    // =========================================================================
    // Draw — pure function of `drawables` + camera; no internal clock
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
            const bgSrc = bgImg ? resolveAssetSource(bgImg, backgroundImage, bumpAtlas) : null;
            if (bgSrc?.rect) {
                const k = Math.max(viewportSize.width / bgSrc.rect.sw, viewportSize.height / bgSrc.rect.sh);
                const dw = bgSrc.rect.sw * k;
                const dh = bgSrc.rect.sh * k;
                blit(ctx, bgSrc, (viewportSize.width - dw) / 2, (viewportSize.height - dh) / 2, dw, dh);
            } else if (bgImg) {
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
            ctx.fillStyle = bgColor ?? BACKGROUND_FALLBACK_COLOR;
            ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);
        }

        if (!drawables || drawables.length === 0) {
            // Fall through to child-registered drawables (JSX composition path).
            const childDrawables = childDrawablesRef.current;
            if (childDrawables.length === 0) return;
            const painter0 = createWebPainter(ctx, bumpAtlas);
            painter0.save();
            painter0.translate(viewportSize.width / 2, viewportSize.height / 2);
            painter0.scale(cameraRef.current.zoom, cameraRef.current.zoom);
            painter0.translate(-viewportSize.width / 2, -viewportSize.height / 2);
            const dctx0: DrawContext = { projector, time: 0, invalidate: bumpAtlas };
            for (const node of childDrawables) paintDrawable(painter0, node, dctx0);
            painter0.restore();
            return;
        }

        // Camera transform, then walk the drawables through the portable painter.
        const cam = cameraRef.current;
        // Frame the authored scene position — or, when none is authored, the
        // grid's own center. The default matters: converted zooms can exceed 1
        // (small native tiles), and with a zero camera the world origin lands at
        // (1−zoom)×vp/2 — outside the viewport for zoom>1 (blank board).
        if (camera !== 'follow' && dragDistance() === 0) {
            const focus = cameraPos ?? defaultGridFocus;
            if (focus) {
                const p = projector.anchorPoint(focus, 'center');
                cam.x = p.x - viewportSize.width / 2;
                cam.y = p.y - viewportSize.height / 2;
            }
        }
        const containerRect = containerRef.current?.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        canvas2DLog.debug('Canvas2D draw', { instanceId, viewportSize, baseOffsetX, cam: { x: cam.x, y: cam.y, zoom: cam.zoom }, cameraPos: cameraPos ? JSON.stringify(cameraPos) : undefined, containerRect: containerRect ? { width: containerRect.width, height: containerRect.height } : null, canvasRect: canvasRect ? { width: canvasRect.width, height: canvasRect.height } : null });
        const painter = createWebPainter(ctx, bumpAtlas);
        painter.save();
        painter.translate(viewportSize.width / 2, viewportSize.height / 2);
        painter.scale(cam.zoom, cam.zoom);
        painter.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);
        const dctx: DrawContext = { projector, time: 0, invalidate: bumpAtlas };
        for (const node of drawables) paintDrawable(painter, node, dctx);
        painter.restore();
    }, [viewportSize, backgroundImage, bgColor, drawables, projector, cameraRef, bumpAtlas, getImage, cameraPos, defaultGridFocus, camera, dragDistance]);

    // =========================================================================
    // Follow camera: lerp to keep `followTarget` centered (camera:'follow').
    // =========================================================================
    useEffect(() => {
        if (camera !== 'follow' || !followTarget) return;
        const p = projector.anchorPoint(followTarget, 'center');
        targetCameraRef.current = {
            x: p.x - viewportSize.width / 2,
            y: p.y - viewportSize.height / 2,
        };
    }, [camera, followTarget, projector, viewportSize, targetCameraRef]);

    // Redraw on scene / camera change — pure, no internal clock.
    useEffect(() => { draw(); }, [draw]);
    useEffect(() => { draw(); }, [_imagePendingCount, draw]);
    // Keep the camera on the computed zoom across its changes (initial mount,
    // a lazily-fetched atlas changing the detected tile width, a resize re-fit)
    // until the user takes over with wheel/pinch — after that, manual zoom is
    // never clobbered.
    const userZoomedRef = useRef(false);
    useEffect(() => {
        if (userZoomedRef.current) return;
        if (cameraRef.current.zoom === effectiveZoom) return;
        cameraRef.current.zoom = effectiveZoom;
        draw();
    }, [effectiveZoom, cameraRef, draw]);
    // Re-render when a lazily-fetched atlas JSON lands.
    useEffect(() => { draw(); }, [atlasVersion, draw]);

    // Camera-lerp RAF: runs only while a follow target is active.
    useEffect(() => {
        if (camera !== 'follow' || !followTarget) return;
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
    }, [camera, followTarget, lerpToTarget, draw]);

    // =========================================================================
    // Pointer / gesture handlers
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
        const adjustedY = squareGrid ? world.y - scaledTileWidth / 2 : world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = unproject(adjustedX, adjustedY);
        eventBus.emit(`UI:${tileHoverEvent}`, { x: isoPos.x, y: isoPos.y });
    }, [screenToWorld, viewportSize, scaledTileWidth, squareGrid, scaledDiamondTopY, scaledFloorHeight, unproject, tileHoverEvent, eventBus]);

    const handleCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        singlePointerActiveRef.current = false;
        if (enableCamera) handlePointerUp();
        if (dragDistance() > 5) return;
        if (!canvasRef.current || (!tileClickEvent && !unitClickEvent)) return;
        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        // A click on a unit's visible body/head hangs over the cells behind its
        // floor cell — resolve against painted sprite rects first, then the cell.
        const spriteHit = unitClickEvent ? hitTestSprites(drawnItems, projector, world) : undefined;
        if (spriteHit !== undefined && unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId: spriteHit });
            return;
        }
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = squareGrid ? world.y - scaledTileWidth / 2 : world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = unproject(adjustedX, adjustedY);
        // A cell with a tagged descriptor (a unit) → unitClick {unitId}; else tileClick {x,y}.
        const hitId = hitIndex.get(`${isoPos.x},${isoPos.y}`);
        if (hitId !== undefined && unitClickEvent) {
            eventBus.emit(`UI:${unitClickEvent}`, { unitId: hitId });
        } else if (tileClickEvent) {
            eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
        }
    }, [enableCamera, handlePointerUp, dragDistance, screenToWorld, viewportSize, scaledTileWidth, squareGrid, scaledDiamondTopY, scaledFloorHeight, unproject, hitIndex, drawnItems, projector, tileClickEvent, unitClickEvent, eventBus]);

    const handleCanvasPointerLeave = useCallback(() => {
        handleMouseLeave();
        if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
    }, [handleMouseLeave, tileLeaveEvent, eventBus]);

    const applyZoom = useCallback((factor: number, centerX: number, centerY: number) => {
        if (!enableCamera) return;
        userZoomedRef.current = true;
        zoomAtPoint(factor, centerX, centerY, viewportSize, () => draw());
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

    // Native non-passive wheel listener so preventDefault() in the gesture
    // handler fires (React onWheel is passive → page would scroll while zooming).
    const canvasWheelHandler = gestureHandlers.onWheel;
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        el.addEventListener('wheel', canvasWheelHandler, { passive: false });
        return () => el.removeEventListener('wheel', canvasWheelHandler);
    }, [canvasWheelHandler]);

    // Keyboard → semantic events via keyMap/keyUpMap (device-agnostic input layer).
    useEffect(() => {
        if (!keyMap && !keyUpMap) return;
        const onDown = (e: KeyboardEvent) => {
            const ev = keyMap?.[e.code];
            if (ev) { eventBus.emit(`UI:${ev}`, {}); e.preventDefault(); }
        };
        const onUp = (e: KeyboardEvent) => {
            const ev = keyUpMap?.[e.code];
            if (ev) eventBus.emit(`UI:${ev}`, {});
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [keyMap, keyUpMap, eventBus]);

    // Keyboard delivery above is window-scoped (not focus-gated), so this
    // isn't load-bearing for input — it's a visible affordance: a
    // keyboard-driven board's canvas should read as the focused, interactive
    // surface as soon as it mounts, not just after the player clicks it.
    useEffect(() => {
        if (!keyMap && !keyUpMap) return;
        canvasRef.current?.focus();
    }, [keyMap, keyUpMap]);

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

    if ((!drawables || drawables.length === 0) && !hasJsxChildren) {
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
        <DrawableRegistryContext.Provider value={registerChildDrawable}>
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
                onContextMenu={(e) => e.preventDefault()}
                className="cursor-pointer touch-none"
                tabIndex={isFree || keyMap || keyUpMap ? 0 : undefined}
                style={{
                    width: viewportSize.width,
                    height: viewportSize.height,
                }}
            />
            {/* Test bridge: hidden action buttons for Playwright to trigger tile/unit events. */}
            {process.env.NODE_ENV !== 'production' && (tileClickEvent || unitClickEvent) && (
                <Box data-game-actions="" className="sr-only" aria-hidden="true">
                    {tileClickEvent && (
                        <Button
                            variant="ghost"
                            data-event={tileClickEvent}
                            data-x="0"
                            data-y="0"
                            onClick={() => eventBus.emit(`UI:${tileClickEvent}`, { x: 0, y: 0 })}
                        >
                            {tileClickEvent}
                        </Button>
                    )}
                    {unitClickEvent && hitIndex.size > 0 && (
                        <Button
                            variant="ghost"
                            data-event={unitClickEvent}
                            data-unit-id={[...hitIndex.values()][0]}
                            onClick={() => eventBus.emit(`UI:${unitClickEvent}`, { unitId: [...hitIndex.values()][0] })}
                        >
                            {unitClickEvent}
                        </Button>
                    )}
                </Box>
            )}
            {showMinimap && (
                <Box position="absolute" className="bottom-2 right-2 pointer-events-none" style={{ zIndex: 10 }}>
                    <MiniMap
                        tiles={miniMapTiles}
                        units={[]}
                        width={150}
                        height={100}
                        mapWidth={miniMapWidth}
                        mapHeight={miniMapHeight}
                    />
                </Box>
            )}
            {/* Hidden mount for JSX drawable children — they render null but
                register their descriptors via DrawableRegistryContext. */}
            {hasJsxChildren && <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>{children}</div>}
            <div data-debug="" style={{ position: 'absolute', top: 0, left: 0, background: 'yellow', color: 'black', zIndex: 9999, fontSize: 24, padding: 8 }}>C={React.Children.count(children)} J={String(hasJsxChildren)} D={drawables?.length ?? -1}</div>
        </Box>
        </DrawableRegistryContext.Provider>
    );
}

Canvas2D.displayName = 'Canvas2D';

export default Canvas2D;
