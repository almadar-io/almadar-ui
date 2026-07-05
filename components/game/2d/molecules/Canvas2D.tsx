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
import type { Asset, AssetUrl, EventEmit, ScenePos } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { Box } from '../../../core/atoms/Box';
import { Button } from '../../../core/atoms/Button';
import { Stack } from '../../../core/atoms/Stack';
import { Icon } from '../../../core/atoms/Icon';
import { Typography } from '../../../core/atoms/Typography';
import { MiniMap } from '../atoms/MiniMap';
import { useImageCache } from '../../shared/useImageCache';
import { resolveAssetSource, blit } from '../../../../lib/atlasSlice';
import { useCamera } from '../../shared/hooks/useCamera';
import { useCanvasGestures } from '../../../../hooks/useCanvasGestures';
import { bindCanvasCapture } from '../../../../lib/verificationRegistry';
import { createWebPainter } from '../../../../lib/webPainter2d';
import { create2DProjector, type Projection2D } from '../../../../lib/drawable/projector';
import { paintDrawable, type DrawableNode } from '../../../../lib/drawable/paintDispatch';
import type { DrawContext } from '../../../../lib/drawable/contract';
import {
    screenToIso,
    TILE_WIDTH,
    FLOOR_HEIGHT,
    DIAMOND_TOP_Y,
    BACKGROUND_FALLBACK_COLOR,
    MINIMAP_TERRAIN_COLORS,
} from '../../shared/isometric';
import type { UiError } from '../../../core/atoms/types';

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
    /** Render scale (0.4 = 40% zoom). Ignored by `free`/`side` (world-pixel-direct). */
    scale?: number;
    /** Toggle minimap overlay. */
    showMinimap?: boolean;
    /** Follow-camera target in scene space (the neutral core `Camera.target`). When
     *  `camera:'follow'` the host lerps to keep this point centered. */
    followTarget?: ScenePos;
    /** Solid backdrop colour (drawn when no `backgroundImage`). */
    bgColor?: string;
}

/** A backdrop may be authored as a bare URL string or a full `Asset`; normalize a
 * string to a minimal decoration Asset so the paint path stays Asset-only. */
function normalizeBackdrop(bg: AssetUrl | Asset | undefined): Asset | undefined {
    return typeof bg === 'string'
        ? { url: bg, role: 'decoration', category: 'background' }
        : bg;
}

/** Collect every drawable's scene position (atoms directly; layers via `items`) —
 *  the source for grid centering and the minimap, derived from what is drawn. */
function collectScenePositions(nodes: DrawableNode[]): ScenePos[] {
    const out: ScenePos[] = [];
    for (const n of nodes) {
        switch (n.type) {
            case 'draw-sprite':
            case 'draw-shape':
            case 'draw-text':
                out.push(n.position);
                break;
            case 'draw-sprite-layer':
            case 'draw-shape-layer':
            case 'draw-text-layer':
                for (const it of n.items) out.push(it.position);
                break;
        }
    }
    return out;
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
    tileHoverEvent,
    tileLeaveEvent,
    keyMap,
    keyUpMap,
    camera = 'pan-zoom',
    scale = 0.4,
    showMinimap = true,
    followTarget,
    bgColor,
}: Canvas2DProps): React.JSX.Element {
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

    // -- Pre-computed scaled scalars (for the pointer→scene inverse) --
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;
    const scaledDiamondTopY = DIAMOND_TOP_Y * scale;

    // -- Scene extent, derived from the drawn descriptors (no tile data prop) --
    const scenePositions = useMemo(() => collectScenePositions(drawables ?? []), [drawables]);
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

    // In `free`/`side`/`flat` tiles are at literal pixels / square cells — no iso centering offset.
    const baseOffsetX = useMemo(() => {
        if (isFree || projection === 'flat' || projection === 'side') return 0;
        return (gridExtent.height - 1) * (scaledTileWidth / 2);
    }, [isFree, projection, gridExtent.height, scaledTileWidth]);

    // -- Projector (shared by draw + follow-camera) --
    const projector = useMemo(
        () => create2DProjector({ scale, baseOffsetX, layout }),
        [scale, baseOffsetX, layout],
    );

    // -- Pointer → scene inverse (iso/hex/flat/free/side) --
    const unproject = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
        // `free`/`side` are world-pixel-direct; the `=== 'free'` test (not the aliased
        // `isFree`) narrows `projection` to a `TileLayout` for `screenToIso` below.
        if (projection === 'free' || projection === 'side') return { x: Math.round(screenX), y: Math.round(screenY) };
        return screenToIso(screenX, screenY, scale, baseOffsetX, projection);
    }, [projection, scale, baseOffsetX]);

    // -- Background image preload --
    const bgUrls = useMemo(() => (backgroundImage ? [backgroundImage.url] : []), [backgroundImage]);
    const { getImage, pendingCount: _imagePendingCount } = useImageCache(bgUrls);

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

    // Re-render when a lazily-fetched atlas JSON lands (see atlasSlice.getAtlas).
    const [, setAtlasVersion] = useState(0);
    const bumpAtlas = useCallback(() => setAtlasVersion((v) => v + 1), []);

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

        if (!drawables || drawables.length === 0) return;

        // Camera transform, then walk the drawables through the portable painter.
        const cam = cameraRef.current;
        const painter = createWebPainter(ctx, bumpAtlas);
        painter.save();
        painter.translate(viewportSize.width / 2, viewportSize.height / 2);
        painter.scale(cam.zoom, cam.zoom);
        painter.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);
        const dctx: DrawContext = { projector, time: 0, invalidate: bumpAtlas };
        for (const node of drawables) paintDrawable(painter, node, dctx);
        painter.restore();
    }, [viewportSize, backgroundImage, bgColor, drawables, projector, cameraRef, bumpAtlas, getImage]);

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
        if (!canvasRef.current || !tileClickEvent) return;
        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = squareGrid ? world.y - scaledTileWidth / 2 : world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = unproject(adjustedX, adjustedY);
        eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
    }, [enableCamera, handlePointerUp, dragDistance, screenToWorld, viewportSize, scaledTileWidth, squareGrid, scaledDiamondTopY, scaledFloorHeight, unproject, tileClickEvent, eventBus]);

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
        enabled: enableCamera || !!tileHoverEvent || !!tileClickEvent,
        onPointerDown: handleCanvasPointerDown,
        onPointerMove: handleCanvasPointerMove,
        onPointerUp: handleCanvasPointerUp,
        onZoom: applyZoom,
        onPanDelta: applyPanDelta,
        onMultiTouchStart: cancelSinglePointer,
    });

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

    if (!drawables || drawables.length === 0) {
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
            {/* Test bridge: a hidden action button for Playwright to trigger a tile event. */}
            {process.env.NODE_ENV !== 'production' && tileClickEvent && (
                <Box data-game-actions="" className="sr-only" aria-hidden="true">
                    <Button
                        variant="ghost"
                        data-event={tileClickEvent}
                        data-x="0"
                        data-y="0"
                        onClick={() => eventBus.emit(`UI:${tileClickEvent}`, { x: 0, y: 0 })}
                    >
                        {tileClickEvent}
                    </Button>
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
        </Box>
    );
}

Canvas2D.displayName = 'Canvas2D';

export default Canvas2D;
