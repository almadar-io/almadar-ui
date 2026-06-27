'use client';
/**
 * IsometricCanvas
 *
 * Core isometric game renderer. Maps to the `game-canvas` pattern.
 * Adapted from projects/trait-wars/design-system/organisms/IsometricGameCanvas.tsx
 * with full closed-circuit pattern compliance (className, isLoading, error).
 *
 * Architecture:
 * - 2:1 diamond isometric projection
 * - Painter's algorithm (tile → feature → unit depth sort)
 * - Camera pan/zoom with lerp
 * - Off-screen culling
 * - Minimap on separate canvas
 * - Sprite sheet animation via resolveUnitFrame
 * - Event bus–friendly handlers (onTileClick, onUnitClick, etc.)
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (viewportSize, RAF, camera lerp, sprite cache) → local only
 * - Events → emitted via `useEventBus()` for trait integration
 *
 * This component is a **pure renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Asset, AssetUrl, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../../core/atoms/Box';
import { Stack } from '../../core/atoms/Stack';
import { Icon } from '../../core/atoms/Icon';
import { Typography } from '../../core/atoms/Typography';
// Molecule-level: no EntityDisplayProps, no entity prop
import type { IsometricTile, IsometricUnit, IsometricFeature, ActiveEffect } from '../shared/isometricTypes';
import { MiniMap } from './MiniMap';
import { HealthBar } from './HealthBar';
import type { ResolvedFrame } from '../shared/spriteAnimationTypes';
import { useImageCache } from '../shared/useImageCache';
import { useCamera } from './useCamera';
import { useCanvasGestures } from '../../../hooks/useCanvasGestures';
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
import type { TileLayout } from '../shared/isometric';
import type { UiError } from '../../core/atoms/types';

// =============================================================================
// Props
// =============================================================================

/** Event Contract:
 *  Emits: UI:TILE_CLICK
 *  Emits: UI:UNIT_CLICK
 *  Emits: UI:TILE_HOVER
 *  Emits: UI:TILE_LEAVE
 */
export interface TileCoord {
    x: number;
    y: number;
}

export interface IsometricCanvasProps {
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: UiError | null;

    // --- Grid data ---
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units on the board */
    units?: IsometricUnit[];
    /** Array of features (resources, portals, buildings, etc.) */
    features?: IsometricFeature[];
    /** Active visual effects to draw after units. Sprite URLs resolved via assetManifest.effects[fx.key]. */
    effects?: ActiveEffect[];

    // --- Interaction state ---
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions (shown as pulsing green highlights) */
    validMoves?: TileCoord[];
    /** Attack target positions (shown as pulsing red highlights) */
    attackTargets?: TileCoord[];
    /** Hovered tile position */
    hoveredTile?: TileCoord | null;

    // --- Event handlers (legacy callbacks — prefer declarative event string props below) ---

    onTileClick?: (x: number, y: number) => void;

    onUnitClick?: (unitId: string) => void;

    onTileHover?: (x: number, y: number) => void;

    onTileLeave?: () => void;

    // --- Declarative event props ---
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: EventEmit<{ x: number; y: number }>;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: EventEmit<{ unitId: string }>;
    /** Declarative event: emits UI:{tileHoverEvent} with { x, y } on tile hover */
    tileHoverEvent?: EventEmit<{ x: number; y: number }>;
    /** Declarative event: emits UI:{tileLeaveEvent} with {} on tile leave */
    tileLeaveEvent?: EventEmit<Record<string, never>>;

    // --- Rendering options ---
    /** Tile layout projection: 'isometric' (default 2:1 diamond), 'hex' (pointy-top offset rows), or 'flat' (orthographic top-down square grid) */
    tileLayout?: TileLayout;
    /** Render scale (0.4 = 40% zoom) */
    scale?: number;
    /** Show debug grid lines and coordinates */
    debug?: boolean;
    /** Background image URL tiled behind the isometric grid */
    backgroundImage?: AssetUrl;
    /** Toggle minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Extra scale multiplier for unit draw size. 1 = default. */
    unitScale?: number;
    /** Ratio of unit draw height to scaledFloorHeight. Default 1.5. */
    spriteHeightRatio?: number;
    /** Max unit draw width as a ratio of scaledTileWidth. Default 0.6. */
    spriteMaxWidthRatio?: number;
    /** Board width in tiles (overrides tile-derived size) */
    boardWidth?: number;
    /** Board height in tiles (overrides tile-derived size) */
    boardHeight?: number;
    /** Override for the diamond-top Y offset within the tile sprite (default: 374).
     *  This controls where the flat diamond face sits vertically inside the tile image. */
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
    effectSpriteUrls?: AssetUrl[];
    /** Callback to draw canvas effects after units (canvas-specific: cannot be declarative) */

    onDrawEffects?: (
        ctx: CanvasRenderingContext2D,
        animTime: number,
        getImage: (url: string) => HTMLImageElement | undefined,
    ) => void;
    /** Whether there are active effects — keeps RAF loop alive */
    hasActiveEffects?: boolean;

    // --- Remote asset loading ---
    /** Manifest mapping entity keys to resolved Asset objects.
     *  Used as a fallback when inline assets and callbacks don't resolve. */
    assetManifest?: {
        terrains?: Record<string, Asset>;
        units?: Record<string, Asset>;
        features?: Record<string, Asset>;
        effects?: Record<string, Asset>;
    };
}

// =============================================================================
// Component
// =============================================================================

export function IsometricCanvas({
    // Closed-circuit
    className,
    isLoading = false,
    error = null,
    // Grid data
    tiles: _tilesPropRaw = [],
    units: _unitsPropRaw = [],
    features: _featuresPropRaw = [],
    effects: _effectsPropRaw = [],
    // Interaction state
    selectedUnitId = null,
    validMoves = [],
    attackTargets = [],
    hoveredTile = null,
    // Event handlers
    onTileClick,
    onUnitClick,
    onTileHover,
    onTileLeave,
    // Declarative event props
    tileClickEvent,
    unitClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    // Rendering options
    tileLayout = 'isometric',
    scale = 0.4,
    debug = false,
    backgroundImage = "",
    showMinimap = true,
    enableCamera = true,
    unitScale = 1,
    spriteHeightRatio = 1.5,
    spriteMaxWidthRatio = 0.6,
    // Asset resolution
    getTerrainSprite,
    getFeatureSprite,
    getUnitSprite,
    resolveUnitFrame,
    effectSpriteUrls = [],
    onDrawEffects,
    hasActiveEffects: _hasActiveEffects = false,
    // Tuning
    diamondTopY: diamondTopYProp,
    // Remote asset loading
    assetManifest,
}: IsometricCanvasProps): React.JSX.Element {
    // Defensive: ensure array props are always iterable even if passed as undefined
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

    // Prefer an externally supplied resolver; else animate from the unit's own atlas.
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

    // -- Tiles default sort (stable for painter's algorithm) --
    const sortedTiles = useMemo(() => {
        const tiles = [...tilesProp];
        if (tileLayout === 'hex' || tileLayout === 'flat') {
            // Hex/flat: top-to-bottom row order, then left-to-right within each row.
            tiles.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
        } else {
            tiles.sort((a, b) => {
                const depthA = a.x + a.y;
                const depthB = b.x + b.y;
                return depthA !== depthB ? depthA - depthB : a.y - b.y;
            });
        }
        return tiles;
    }, [tilesProp, tileLayout]);

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

    const baseOffsetX = useMemo(() => {
        return (gridHeight - 1) * (scaledTileWidth / 2);
    }, [gridHeight, scaledTileWidth]);

    // -- Lookup sets for highlights --
    const validMoveSet = useMemo(() => {
        return new Set(validMoves.map(p => `${p.x},${p.y}`));
    }, [validMoves]);

    const attackTargetSet = useMemo(() => {
        return new Set(attackTargets.map(p => `${p.x},${p.y}`));
    }, [attackTargets]);

    // -- Collect all sprite URLs for preloading --
    const spriteUrls = useMemo(() => {
        const urls: string[] = [];

        // Tile sprites
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

        // Feature sprites
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

        // Unit sprites
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

        // Effect sprites from manifest
        if (assetManifest?.effects) {
            for (const asset of Object.values(assetManifest.effects)) {
                if (asset.url) urls.push(asset.url);
            }
        }

        // Effect sprites from explicit list
        if (effectSpriteUrls) urls.push(...effectSpriteUrls);

        // Animated sprite-sheet PNGs resolved from unit atlases
        if (atlasSheetUrls.length) urls.push(...atlasSheetUrls);

        // Background
        if (backgroundImage) urls.push(backgroundImage);

        // Deduplicate
        return [...new Set(urls.filter(Boolean))];
    }, [sortedTiles, features, units, getTerrainSprite, getFeatureSprite, getUnitSprite, effectSpriteUrls, atlasSheetUrls, backgroundImage, assetManifest]);

    const { getImage, pendingCount: _imagePendingCount } = useImageCache(spriteUrls);

    // -- Verification bridge: register canvas frame capture --
    // Asset status tracking is handled by useImageCache automatically.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        bindCanvasCapture(() => canvas.toDataURL('image/png'));
        return () => { bindCanvasCapture(() => null); };
    }, []);

    // -- Camera --
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

    // Minimap data derived for the MiniMap atom
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
    // Main draw function — pure function of props; no internal clock
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

        // Clear
        ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

        // Background
        if (backgroundImage) {
            const bgImg = getImage(backgroundImage);
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

        if (sortedTiles.length === 0) return;

        // Camera transform
        ctx.save();
        const cam = cameraRef.current;
        ctx.translate(viewportSize.width / 2, viewportSize.height / 2);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-viewportSize.width / 2 - cam.x, -viewportSize.height / 2 - cam.y);

        // Visible region for culling
        const visLeft = cam.x - viewportSize.width / cam.zoom;
        const visRight = cam.x + viewportSize.width * 2 / cam.zoom;
        const visTop = cam.y - viewportSize.height / cam.zoom;
        const visBottom = cam.y + viewportSize.height * 2 / cam.zoom;

        // =========== TILES ===========
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX, tileLayout);

            // Off-screen culling
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
                    // Hex/flat: pos.y is the top of the cell; anchor sprite top there so the
                    // row pitch controls spacing, not the ISO bounding-box height (scaledTileHeight).
                    const drawY = (tileLayout === 'hex' || tileLayout === 'flat')
                        ? pos.y
                        : pos.y + scaledTileHeight - drawH;
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                }
            } else {
                // Fallback: draw colored diamond
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

            // Hover highlight
            if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Valid move highlight
            const tileKey = `${tile.x},${tile.y}`;
            if (validMoveSet.has(tileKey)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Attack target highlight
            if (attackTargetSet.has(tileKey)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const topY = pos.y + scaledDiamondTopY;
                ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
                ctx.beginPath();
                ctx.moveTo(centerX, topY);
                ctx.lineTo(pos.x + scaledTileWidth, topY + scaledFloorHeight / 2);
                ctx.lineTo(centerX, topY + scaledFloorHeight);
                ctx.lineTo(pos.x, topY + scaledFloorHeight / 2);
                ctx.closePath();
                ctx.fill();
            }

            // Debug coordinates
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
            if (tileLayout === 'hex' || tileLayout === 'flat') return a.y !== b.y ? a.y - b.y : a.x - b.x;
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            return depthA !== depthB ? depthA - depthB : a.y - b.y;
        });

        for (const feature of sortedFeatures) {
            const pos = isoToScreen(feature.x, feature.y, scale, baseOffsetX, tileLayout);

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
            if (tileLayout === 'hex' || tileLayout === 'flat') return a.position.y !== b.position.y ? a.position.y - b.position.y : a.position.x - b.position.x;
            const depthA = a.position.x + a.position.y;
            const depthB = b.position.x + b.position.y;
            return depthA !== depthB ? depthA - depthB : a.position.y - b.position.y;
        });

        for (const unit of sortedUnits) {
            const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX, tileLayout);

            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const isSelected = unit.id === selectedUnitId;
            const centerX = pos.x + scaledTileWidth / 2;
            const groundY = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.50;

            // Breathing offset is static — LOLO state machine drives animation externally.
            const breatheOffset = 0;

            // Resolve sprite
            const unitSpriteUrl = resolveUnitSpriteUrl(unit);
            const img = unitSpriteUrl ? getImage(unitSpriteUrl) : null;
            const unitDrawH = scaledFloorHeight * spriteHeightRatio * unitScale;
            const maxUnitW = scaledTileWidth * spriteMaxWidthRatio * unitScale;
            // Crop `unit.sprite.url` as an 8×5 sheet ONLY with a real `spriteSheet`
            // atlas to crop from — `sprite.animations` metadata on a static
            // `sprite.url` would otherwise draw a 1/8×1/5 sliver (GR-1).
            const unitIsSheet = unit.spriteSheet?.url !== undefined;
            // Frame dimensions: fixed 8-col layout (SHEET_COLUMNS) for the crop math — same as before,
            // but detection is now metadata-driven, not pixel-dimension guessing.
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

            // Movement trail / ghost
            if (unit.previousPosition && (unit.previousPosition.x !== unit.position.x || unit.previousPosition.y !== unit.position.y)) {
                const ghostPos = isoToScreen(unit.previousPosition.x, unit.previousPosition.y, scale, baseOffsetX, tileLayout);
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

            // Selection ring
            if (isSelected) {
                ctx.beginPath();
                ctx.ellipse(centerX, groundY, drawW / 2 + 4 * scale, 12 * scale, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw unit: sprite sheet frame (single cropped frame), static sprite, or fallback.
            // A unit with a sprite SHEET must always crop one frame — never draw the whole sheet.
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
                // Static sprite or sprite-sheet without a resolved atlas.
                // When the image is a sprite-sheet, crop frame 0 (idle/front) instead of
                // drawing the whole multi-frame grid into a tiny cell — that was the "garbled blob".
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
                // Fallback circle
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

            // Name label and health bar are rendered as DOM overlays — see JSX below.
        }

        // Draw ActiveEffect[] sprites after units
        for (const fx of effects) {
            const spriteUrl = assetManifest?.effects?.[fx.key]?.url;
            if (!spriteUrl) continue;
            const img = getImage(spriteUrl);
            if (!img) continue;
            const pos = isoToScreen(fx.x, fx.y, scale, baseOffsetX, tileLayout);
            const cx = pos.x + scaledTileWidth / 2;
            const cy = pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5;
            const alpha = Math.min(1, fx.ttl / 4);
            const prev = ctx.globalAlpha;
            ctx.globalAlpha = alpha;
            ctx.drawImage(img, cx - img.naturalWidth / 2, cy - img.naturalHeight / 2);
            ctx.globalAlpha = prev;
        }

        // Legacy effects callback (for boards that pass onDrawEffects directly)
        onDrawEffects?.(ctx, 0, getImage);

        // Restore camera transform
        ctx.restore();
    }, [
        sortedTiles, units, features, selectedUnitId, effects,
        tileLayout, scale, debug, resolveTerrainSpriteUrl, resolveFeatureSpriteUrl, resolveUnitSpriteUrl, resolveFrameForUnit, getImage,
        gridWidth, gridHeight, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, scaledDiamondTopY,
        validMoveSet, attackTargetSet, hoveredTile, viewportSize, onDrawEffects,
        backgroundImage, cameraRef, unitScale, assetManifest,
    ]);

    // =========================================================================
    // Camera centering on selected unit
    // =========================================================================
    useEffect(() => {
        if (!selectedUnitId) return;
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit?.position) return;
        const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX, tileLayout);
        const centerX = pos.x + scaledTileWidth / 2;
        const centerY = pos.y + scaledDiamondTopY + scaledFloorHeight / 2;
        targetCameraRef.current = {
            x: centerX - viewportSize.width / 2,
            y: centerY - viewportSize.height / 2,
        };
    }, [selectedUnitId, units, tileLayout, scale, baseOffsetX, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, targetCameraRef]);

    // =========================================================================
    // Redraw on data change — pure, no internal clock
    // =========================================================================
    useEffect(() => {
        draw();
    }, [draw]);

    // Redraw when images finish loading (getImage is a stable ref, so we track pending separately)
    useEffect(() => {
        draw();
    }, [_imagePendingCount]);

    // Camera-lerp RAF: runs only while a programmatic camera target is active (unit selection centering).
    useEffect(() => {
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
    }, [selectedUnitId, lerpToTarget, draw]);

    // =========================================================================
    // Pointer / gesture handlers (mouse + touch + pen via Pointer Events)
    // =========================================================================
    // True while a single-pointer drag is in flight — suppresses bare-hover work.
    const singlePointerActiveRef = useRef(false);

    const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        singlePointerActiveRef.current = true;
        if (enableCamera) handlePointerDown(e);
    }, [enableCamera, handlePointerDown]);

    // Single-pointer move from the gesture hook → camera pan only.
    const handleCanvasPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (enableCamera) handlePointerMove(e, () => draw());
    }, [enableCamera, handlePointerMove, draw]);

    // Bare hover (no pointer down) — emits UI:TILE_HOVER. Runs on every raw move but
    // no-ops while a drag/pinch is active (the hook owns those).
    const handleCanvasHover = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (singlePointerActiveRef.current) return;
        if ((!onTileHover && !tileHoverEvent) || !canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX, tileLayout);

        const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
        if (tileExists) {
            if (tileHoverEvent) eventBus.emit(`UI:${tileHoverEvent}`, { x: isoPos.x, y: isoPos.y });
            onTileHover?.(isoPos.x, isoPos.y);
        }
    }, [onTileHover, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, tileLayout, scale, baseOffsetX, tilesProp, tileHoverEvent, eventBus]);

    const handleCanvasPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        singlePointerActiveRef.current = false;
        if (enableCamera) handlePointerUp();
        // A pan that moved past threshold is not a click.
        if (dragDistance() > 5) return;
        if (!canvasRef.current) return;

        const world = screenToWorld(e.clientX, e.clientY, canvasRef.current, viewportSize);
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - scaledDiamondTopY - scaledFloorHeight / 2;
        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX, tileLayout);

        // Check for unit click
        const clickedUnit = units.find(u => u.position?.x === isoPos.x && u.position?.y === isoPos.y);
        if (clickedUnit && (onUnitClick || unitClickEvent)) {
            if (unitClickEvent) eventBus.emit(`UI:${unitClickEvent}`, { unitId: clickedUnit.id });
            onUnitClick?.(clickedUnit.id);
        } else if (onTileClick || tileClickEvent) {
            const tileExists = tilesProp.some(t => t.x === isoPos.x && t.y === isoPos.y);
            if (tileExists) {
                if (tileClickEvent) eventBus.emit(`UI:${tileClickEvent}`, { x: isoPos.x, y: isoPos.y });
                onTileClick?.(isoPos.x, isoPos.y);
            }
        }
    }, [enableCamera, handlePointerUp, dragDistance, screenToWorld, viewportSize, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, tileLayout, scale, baseOffsetX, units, tilesProp, onUnitClick, onTileClick, unitClickEvent, tileClickEvent, eventBus]);

    const handleCanvasPointerLeave = useCallback(() => {
        handleMouseLeave();
        if (tileLeaveEvent) eventBus.emit(`UI:${tileLeaveEvent}`, {});
        onTileLeave?.();
    }, [handleMouseLeave, onTileLeave, tileLeaveEvent, eventBus]);

    // Wheel + two-finger pinch zoom-to-point; two-finger pan; multi-touch cancels a pan-drag.
    const applyZoom = useCallback((factor: number, centerX: number, centerY: number) => {
        if (enableCamera) zoomAtPoint(factor, centerX, centerY, viewportSize, () => draw());
    }, [enableCamera, zoomAtPoint, viewportSize, draw]);

    const applyPanDelta = useCallback((dx: number, dy: number) => {
        // Two-finger pan moves the camera the same direction as a drag (camera.x -= dx).
        if (enableCamera) panBy(dx, dy, () => draw());
    }, [enableCamera, panBy, draw]);

    const cancelSinglePointer = useCallback(() => {
        singlePointerActiveRef.current = false;
        if (enableCamera) handlePointerUp();
    }, [enableCamera, handlePointerUp]);

    const gestureHandlers = useCanvasGestures({
        canvasRef,
        enabled: enableCamera || !!onTileHover || !!tileHoverEvent || !!onTileClick || !!tileClickEvent || !!onUnitClick || !!unitClickEvent,
        onPointerDown: handleCanvasPointerDown,
        onPointerMove: handleCanvasPointerMove,
        onPointerUp: handleCanvasPointerUp,
        onZoom: applyZoom,
        onPanDelta: applyPanDelta,
        onMultiTouchStart: cancelSinglePointer,
    });

    // =========================================================================
    // DOM overlay data — health bars and name labels positioned over canvas
    // =========================================================================
    const unitOverlays = useMemo(() => {
        if (sortedTiles.length === 0) return [];
        return units
            .filter((u): u is typeof u & { position: { x: number; y: number } } => !!u.position)
            .map(u => {
                const pos = isoToScreen(u.position!.x, u.position!.y, scale, baseOffsetX, tileLayout);
                const cam = cameraRef.current;
                const screenX = (pos.x + scaledTileWidth / 2 - (cam.x + viewportSize.width / 2)) * cam.zoom + viewportSize.width / 2;
                const screenY = (pos.y + scaledDiamondTopY + scaledFloorHeight * 0.5 - (cam.y + viewportSize.height / 2)) * cam.zoom + viewportSize.height / 2;
                return { unit: u, screenX, screenY };
            });
    }, [units, sortedTiles.length, scale, baseOffsetX, tileLayout, scaledTileWidth, scaledDiamondTopY, scaledFloorHeight, viewportSize, cameraRef]);

    // =========================================================================
    // Render
    // =========================================================================

    // Inline error state — game molecules must not import core/molecules
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

    // Inline loading state
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

    // Empty state: no tiles provided — render a meaningful dark canvas placeholder
    if (sortedTiles.length === 0) {
        return (
            <Box
                className={cn('relative w-full overflow-hidden rounded-container', className)}
                style={{ height: viewportSize.height }}
                data-testid="game-canvas-empty"
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
                data-testid="game-canvas"
                onPointerDown={gestureHandlers.onPointerDown}
                onPointerMove={(e) => { gestureHandlers.onPointerMove(e); handleCanvasHover(e); }}
                onPointerUp={gestureHandlers.onPointerUp}
                onPointerCancel={gestureHandlers.onPointerCancel}
                onPointerLeave={handleCanvasPointerLeave}
                onWheel={gestureHandlers.onWheel}
                onContextMenu={(e) => e.preventDefault()}
                className="cursor-pointer touch-none"
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

IsometricCanvas.displayName = 'IsometricCanvas';

export default IsometricCanvas;
