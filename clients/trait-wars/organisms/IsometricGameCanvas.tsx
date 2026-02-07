/**
 * IsometricGameCanvas Component
 *
 * Canvas-based isometric game board for Trait Wars.
 * Replaces DOM-based HexGameBoard with pixel-perfect canvas rendering.
 *
 * Features:
 * - Idle breathing animation (10.5.16)
 * - Movement trail / ghost (10.5.17)
 * - Pan & zoom camera (10.5.18)
 * - Camera centering on selected unit (10.5.19)
 * - Mini-map (10.5.20)
 * - Smart redraw (10.5.21)
 * - Off-screen tile culling (10.5.22)
 */

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, cn } from '@almadar/ui';
import type { TraitWarsAssetManifest } from '../assets';
import {
    getTerrainSpriteUrl,
    getHeroSpriteUrl,
    getRobotUnitSpriteUrl,
    getWorldMapFeatureUrl,
} from '../assets';
import type { RobotUnitType, HeroType, WorldMapFeatureType, TerrainType } from '../assets';
import type { ResolvedFrame } from '../types/spriteAnimation';

// =============================================================================
// Constants - Isometric Tile Dimensions (Kenney Isometric Miniature Dungeon)
// =============================================================================

/** Full tile image width in pixels */
export const TILE_WIDTH = 256;

/** Full tile image height in pixels (includes vertical objects) */
export const TILE_HEIGHT = 512;

/** Isometric floor diamond height */
export const FLOOR_HEIGHT = 128;

/** Horizontal offset between tiles */
export const HORIZONTAL_OFFSET = TILE_WIDTH / 2; // 128

/** Vertical offset between tiles */
export const VERTICAL_OFFSET = FLOOR_HEIGHT / 2; // 64

// =============================================================================
// Types
// =============================================================================

export interface IsometricTile {
    x: number;
    y: number;
    terrain: string;
    /** Optional terrain sprite URL override */
    terrainSprite?: string;
    /** false for obstacles/walls */
    passable?: boolean;
    /** default 1, higher for rough terrain */
    movementCost?: number;
    /** Tile classification for rendering and pathfinding */
    tileType?: 'floor' | 'obstacle' | 'wall' | 'passage' | 'elevation';
}

export interface IsometricUnit {
    id: string;
    position: { x: number; y: number };
    /** Previous position for movement trail / ghost effect (10.5.17) */
    previousPosition?: { x: number; y: number };
    /** Direct sprite URL override */
    sprite?: string;
    /** Robot unit type for manifest lookup (e.g., 'worker', 'guardian') */
    unitType?: string;
    /** Hero ID for manifest lookup (e.g., 'valence', 'zahra') */
    heroId?: string;
    name?: string;
    team?: 'player' | 'enemy' | 'neutral';
    health?: number;
    maxHealth?: number;
    /** Trait data for hover tooltips */
    traits?: {
        name: string;
        currentState: string;
        states: string[];
    }[];
}

export interface IsometricFeature {
    x: number;
    y: number;
    type: string;
    sprite?: string;
}

export interface IsometricGameCanvasProps {
    /** Array of tiles to render */
    tiles: IsometricTile[];
    /** Array of units on the board */
    units?: IsometricUnit[];
    /** Array of features (resources, portals, etc.) */
    features?: IsometricFeature[];
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions */
    validMoves?: Array<{ x: number; y: number }>;
    /** Attack target positions */
    attackTargets?: Array<{ x: number; y: number }>;
    /** Hovered tile position */
    hoveredTile?: { x: number; y: number } | null;
    /** Tile click handler */
    onTileClick?: (x: number, y: number) => void;
    /** Unit click handler */
    onUnitClick?: (unitId: string) => void;
    /** Tile hover handler */
    onTileHover?: (x: number, y: number) => void;
    /** Tile leave handler */
    onTileLeave?: () => void;
    /** Render scale (0.4 = 40% zoom) */
    scale?: number;
    /** Show debug grid lines */
    debug?: boolean;
    /** Asset loading function for terrain tiles */
    getTerrainSprite?: (terrain: string) => string | undefined;
    /** Asset loading function for features */
    getFeatureSprite?: (featureType: string) => string | undefined;
    /** Asset manifest for automatic sprite resolution (used when getTerrainSprite/getFeatureSprite not provided) */
    assetManifest?: TraitWarsAssetManifest;
    /** Background image URL tiled behind the isometric grid (moves with camera) */
    backgroundImage?: string;
    /** Additional CSS classes */
    className?: string;
    /** Callback to draw canvas effects after units (called inside draw, before ctx.restore) */
    onDrawEffects?: (ctx: CanvasRenderingContext2D, animTime: number, getImage: (url: string) => HTMLImageElement | undefined) => void;
    /** Whether there are active effects — keeps RAF animation loop alive */
    hasActiveEffects?: boolean;
    /** Additional sprite URLs to preload (e.g., effect sprites) */
    effectSpriteUrls?: string[];
    /**
     * Optional callback to resolve animated sprite sheet frames for units.
     * When provided, units with sprite sheets use frame-based animation
     * instead of static sprites. Returns null for units without sheets.
     */
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
}

// =============================================================================
// Isometric Coordinate Math
// =============================================================================

/**
 * Convert isometric tile coordinates to screen position.
 * Returns the top-left corner of where the tile image should be drawn.
 */
export function isoToScreen(
    tileX: number,
    tileY: number,
    scale: number,
    baseOffsetX: number
): { x: number; y: number } {
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;
    const horizontalOffset = scaledTileWidth / 2;
    const verticalOffset = scaledFloorHeight / 2;

    return {
        x: (tileX - tileY) * horizontalOffset + baseOffsetX,
        y: (tileX + tileY) * verticalOffset
    };
}

/**
 * Convert screen coordinates to isometric tile coordinates.
 */
export function screenToIso(
    screenX: number,
    screenY: number,
    scale: number,
    baseOffsetX: number
): { x: number; y: number } {
    // Remove base offset first
    const adjustedX = screenX - baseOffsetX;

    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;
    const horizontalOffset = scaledTileWidth / 2;
    const verticalOffset = scaledFloorHeight / 2;

    // Inverse of isoToScreen:
    // screenX = (tileX - tileY) * horizontalOffset + baseOffsetX
    // screenY = (tileX + tileY) * verticalOffset
    // Solve for tileX and tileY:
    const tileXPlusTileY = screenY / verticalOffset;
    const tileXMinusTileY = adjustedX / horizontalOffset;

    const tileX = (tileXPlusTileY + tileXMinusTileY) / 2;
    const tileY = (tileXPlusTileY - tileXMinusTileY) / 2;

    return {
        x: Math.round(tileX),
        y: Math.round(tileY)
    };
}

// =============================================================================
// Image Cache Hook
// =============================================================================

interface ImageCache {
    [url: string]: HTMLImageElement | null;
}

function useImageCache(urls: string[]): { loaded: boolean; getImage: (url: string) => HTMLImageElement | null } {
    const cacheRef = useRef<ImageCache>({});
    const [loadedCount, setLoadedCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        const uniqueUrls = [...new Set(urls.filter(Boolean))];

        uniqueUrls.forEach(url => {
            if (cacheRef.current[url]) return;

            const img = new Image();
            cacheRef.current[url] = null; // Mark as loading

            img.onload = () => {
                if (mounted) {
                    cacheRef.current[url] = img;
                    setLoadedCount(count => count + 1);
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}`);
            };
            img.src = url;
        });

        return () => {
            mounted = false;
        };
    }, [urls.join(',')]);

    const getImage = useCallback((url: string) => cacheRef.current[url] ?? null, []);
    const loaded = loadedCount >= urls.filter(Boolean).length || urls.length === 0;

    return { loaded, getImage };
}

// =============================================================================
// Fallback Color Mapping
// =============================================================================

const TERRAIN_COLORS: Record<string, string> = {
    grass: '#4a7c3f',
    dirt: '#8b7355',
    stone: '#6b6b6b',
    sand: '#d4b896',
    water: '#3d7eaa',
    forest: '#2d5a2e',
    mountain: '#5a5a5a',
    fortress: '#4a3728',
    default: '#6b6b6b'
};

const FEATURE_COLORS: Record<string, string> = {
    gold_mine: '#ffd700',
    crystal: '#00ffff',
    portal: '#9932cc',
    treasure: '#ff8c00',
    battle: '#ff0000',
    default: '#ffffff'
};

// =============================================================================
// Main Component
// =============================================================================

export function IsometricGameCanvas({
    tiles,
    units = [],
    features = [],
    selectedUnitId = null,
    validMoves = [],
    attackTargets = [],
    hoveredTile = null,
    onTileClick,
    onUnitClick,
    onTileHover,
    onTileLeave,
    scale = 0.4,
    debug = false,
    getTerrainSprite,
    getFeatureSprite,
    assetManifest,
    backgroundImage,
    className,
    onDrawEffects,
    hasActiveEffects = false,
    effectSpriteUrls = [],
    resolveUnitFrame,
}: IsometricGameCanvasProps): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const minimapRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animTimeRef = useRef(0);
    const rafIdRef = useRef<number>(0);

    // =========================================================================
    // Camera state refs (10.5.18) - refs to avoid re-renders on every pan frame
    // =========================================================================
    const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
    const isDraggingRef = useRef(false);
    const dragDistanceRef = useRef(0);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const targetCameraRef = useRef<{ x: number; y: number } | null>(null);

    // Viewport size state for ResizeObserver (10.5.18)
    const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

    // Calculate grid bounds
    const maxX = Math.max(...tiles.map(t => t.x), 0);
    const maxY = Math.max(...tiles.map(t => t.y), 0);

    // Base offset to center the grid
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    // Canvas dimensions (world space)
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledTileHeight = TILE_HEIGHT * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;

    const gridWidth = (maxX + maxY + 2) * (scaledTileWidth / 2) + scaledTileWidth;
    const gridHeight = (maxX + maxY + 1) * (scaledFloorHeight / 2) + scaledTileHeight;

    // =========================================================================
    // ResizeObserver for viewport sizing (10.5.18)
    // =========================================================================
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setViewportSize({ width, height });
                }
            }
        });

        observer.observe(container);
        // Initialize with current size
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            setViewportSize({ width: rect.width, height: rect.height });
        }

        return () => observer.disconnect();
    }, []);

    // Manifest-based sprite resolvers (used when explicit callbacks are not provided)
    const resolveTerrainSprite = React.useCallback((terrain: string): string | undefined => {
        if (getTerrainSprite) return getTerrainSprite(terrain);
        if (assetManifest) return getTerrainSpriteUrl(assetManifest, terrain as TerrainType);
        return undefined;
    }, [getTerrainSprite, assetManifest]);

    const resolveFeatureSprite = React.useCallback((featureType: string): string | undefined => {
        if (getFeatureSprite) return getFeatureSprite(featureType);
        if (assetManifest) return getWorldMapFeatureUrl(assetManifest, featureType as WorldMapFeatureType);
        return undefined;
    }, [getFeatureSprite, assetManifest]);

    const resolveUnitSprite = React.useCallback((unit: IsometricUnit): string | undefined => {
        if (unit.sprite) return unit.sprite;
        if (assetManifest) {
            if (unit.heroId) return getHeroSpriteUrl(assetManifest, unit.heroId as string);
            if (unit.unitType) return getRobotUnitSpriteUrl(assetManifest, unit.unitType as RobotUnitType);
        }
        return undefined;
    }, [assetManifest]);

    // Collect all sprite URLs for preloading
    const spriteUrls = React.useMemo(() => {
        const urls: string[] = [];

        // Terrain sprites
        tiles.forEach(tile => {
            const url = tile.terrainSprite || resolveTerrainSprite(tile.terrain);
            if (url) urls.push(url);
        });

        // Unit sprites (static fallbacks)
        units.forEach(unit => {
            const url = resolveUnitSprite(unit);
            if (url) urls.push(url);
        });

        // Animated sprite sheet images (if resolveUnitFrame is provided)
        if (resolveUnitFrame && assetManifest?.characterSheets) {
            const sheets = assetManifest.characterSheets;
            const base = assetManifest.baseUrl;
            // Preload sheets for characters present in units list
            const seenChars = new Set<string>();
            units.forEach(unit => {
                const charId = unit.heroId || unit.unitType;
                if (charId && sheets[charId] && !seenChars.has(charId)) {
                    seenChars.add(charId);
                    urls.push(`${base}/${sheets[charId].se}`);
                    urls.push(`${base}/${sheets[charId].sw}`);
                }
            });
        }

        // Feature sprites
        features.forEach(feature => {
            const url = feature.sprite || resolveFeatureSprite(feature.type);
            if (url) urls.push(url);
        });

        if (backgroundImage) urls.push(backgroundImage);

        // Effect sprites (preloaded for instant first-use)
        if (effectSpriteUrls.length > 0) {
            urls.push(...effectSpriteUrls);
        }

        return urls;
    }, [tiles, units, features, backgroundImage, resolveTerrainSprite, resolveFeatureSprite, resolveUnitSprite, resolveUnitFrame, assetManifest, effectSpriteUrls]);

    const { getImage } = useImageCache(spriteUrls);

    // Create lookup sets for valid moves and attack targets
    const validMoveSet = new Set(validMoves.map(m => `${m.x},${m.y}`));
    const attackTargetSet = new Set(attackTargets.map(t => `${t.x},${t.y}`));

    // Painter's algorithm: sort tiles by render order (back to front)
    const sortedTiles = React.useMemo(() => {
        return [...tiles].sort((a, b) => {
            // Sort by sum of coordinates (back to front)
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            if (depthA !== depthB) return depthA - depthB;
            // Secondary sort by y for consistent ordering
            return a.y - b.y;
        });
    }, [tiles]);

    // =========================================================================
    // Mini-map drawing function (10.5.20)
    // =========================================================================
    const drawMinimap = useCallback(() => {
        const minimap = minimapRef.current;
        if (!minimap) return;

        const mCtx = minimap.getContext('2d');
        if (!mCtx) return;

        const mW = 150;
        const mH = 100;
        const dpr = window.devicePixelRatio || 1;
        minimap.width = mW * dpr;
        minimap.height = mH * dpr;
        mCtx.scale(dpr, dpr);

        // Clear
        mCtx.clearRect(0, 0, mW, mH);
        mCtx.fillStyle = 'rgba(15, 15, 25, 0.85)';
        mCtx.fillRect(0, 0, mW, mH);

        // Scale factor: map the full grid into the minimap
        const scaleToMiniX = mW / gridWidth;
        const scaleToMiniY = mH / gridHeight;
        const miniScale = Math.min(scaleToMiniX, scaleToMiniY) * 0.9;
        const miniOffX = (mW - gridWidth * miniScale) / 2;
        const miniOffY = (mH - gridHeight * miniScale) / 2;

        // Draw tiles as small colored diamonds
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
            const mx = pos.x * miniScale + miniOffX;
            const my = pos.y * miniScale + miniOffY;
            const tw = scaledTileWidth * miniScale;
            const fh = scaledFloorHeight * miniScale;
            const th = scaledTileHeight * miniScale;

            const cx = mx + tw / 2;
            const cy = my + (th - fh) + fh / 2;

            const color = TERRAIN_COLORS[tile.terrain] || TERRAIN_COLORS.default;
            mCtx.fillStyle = color;
            mCtx.beginPath();
            mCtx.moveTo(cx, cy - fh / 2);
            mCtx.lineTo(cx + tw / 2, cy);
            mCtx.lineTo(cx, cy + fh / 2);
            mCtx.lineTo(cx - tw / 2, cy);
            mCtx.closePath();
            mCtx.fill();
        }

        // Draw unit dots
        for (const unit of units) {
            const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
            const mx = pos.x * miniScale + miniOffX + (scaledTileWidth * miniScale) / 2;
            const my = pos.y * miniScale + miniOffY + ((scaledTileHeight - scaledFloorHeight) * miniScale) + (scaledFloorHeight * miniScale) / 2;

            mCtx.beginPath();
            mCtx.arc(mx, my, 2.5, 0, Math.PI * 2);
            mCtx.fillStyle = unit.team === 'player' ? '#3b82f6' :
                unit.team === 'enemy' ? '#ef4444' : '#9ca3af';
            mCtx.fill();
        }

        // Draw viewport rectangle
        const cam = cameraRef.current;
        const vpX = cam.x * miniScale + miniOffX;
        const vpY = cam.y * miniScale + miniOffY;
        const vpW = (viewportSize.width / cam.zoom) * miniScale;
        const vpH = (viewportSize.height / cam.zoom) * miniScale;

        mCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(vpX, vpY, vpW, vpH);
    }, [sortedTiles, units, scale, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, gridWidth, gridHeight, viewportSize]);

    // =========================================================================
    // Draw function extracted for RAF loop
    // =========================================================================
    const draw = useCallback((animTime: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution to viewport (10.5.18)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewportSize.width * dpr;
        canvas.height = viewportSize.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

        // Apply camera transform (10.5.18)
        const cam = cameraRef.current;
        ctx.save();
        ctx.translate(viewportSize.width / 2, viewportSize.height / 2);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-viewportSize.width / 2, -viewportSize.height / 2);
        ctx.translate(-cam.x, -cam.y);

        // Compute visible region in world space for culling (10.5.22)
        const cullMargin = scaledTileWidth * 4;
        const visLeft = cam.x - cullMargin;
        const visRight = cam.x + viewportSize.width / cam.zoom + cullMargin;
        const visTop = cam.y - cullMargin;
        const visBottom = cam.y + viewportSize.height / cam.zoom + cullMargin;

        // Background image tiled across visible area (moves with camera)
        if (backgroundImage) {
            const bgImg = getImage(backgroundImage);
            if (bgImg) {
                const bgSize = 512 * scale;
                const startX = Math.floor(visLeft / bgSize) * bgSize;
                const startY = Math.floor(visTop / bgSize) * bgSize;
                ctx.save();
                ctx.globalAlpha = 0.4;
                for (let bx = startX; bx < visRight; bx += bgSize) {
                    for (let by = startY; by < visBottom; by += bgSize) {
                        ctx.drawImage(bgImg, bx, by, bgSize, bgSize);
                    }
                }
                ctx.restore();
            }
        }

        // Render tiles (painter's algorithm order)
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
            const key = `${tile.x},${tile.y}`;

            // Off-screen tile culling (10.5.22)
            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            // Get sprite image or use fallback color
            const spriteUrl = tile.terrainSprite || resolveTerrainSprite(tile.terrain);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            if (img) {
                // Draw tile sprite
                ctx.drawImage(img, pos.x, pos.y, scaledTileWidth, scaledTileHeight);
            } else {
                // Draw fallback isometric diamond
                const color = TERRAIN_COLORS[tile.terrain] || TERRAIN_COLORS.default;
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();

                ctx.fillStyle = color;
                ctx.fill();

                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Draw valid move highlight (pulsing)
            if (validMoveSet.has(key)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);
                const pulseAlpha = 0.15 + 0.15 * Math.sin(animTime * 0.003);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();

                ctx.fillStyle = `rgba(0, 255, 100, ${pulseAlpha})`;
                ctx.fill();

                ctx.strokeStyle = `rgba(0, 255, 100, ${0.5 + 0.3 * Math.sin(animTime * 0.003)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw attack target highlight (pulsing)
            if (attackTargetSet.has(key)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);
                const pulseAlpha = 0.15 + 0.15 * Math.sin(animTime * 0.003);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();

                ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + 0.3 * Math.sin(animTime * 0.003)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw hover highlight
            if (hoveredTile && hoveredTile.x === tile.x && hoveredTile.y === tile.y) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);

                ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
                ctx.lineWidth = 3;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();
                ctx.stroke();
            }

            // Debug: draw coordinates
            if (debug) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.font = `${12 * scale * 2}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY + 4);
            }
        }

        // Render features (sorted by position)
        const sortedFeatures = [...features].sort((a, b) => {
            const depthA = a.x + a.y;
            const depthB = b.x + b.y;
            return depthA !== depthB ? depthA - depthB : a.y - b.y;
        });

        for (const feature of sortedFeatures) {
            const pos = isoToScreen(feature.x, feature.y, scale, baseOffsetX);

            // Off-screen feature culling (10.5.22)
            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const spriteUrl = feature.sprite || resolveFeatureSprite(feature.type);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            const centerX = pos.x + scaledTileWidth / 2;
            // Ground surface: diamond center is where objects visually "sit" on the tile
            const featureGroundY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight * 0.50;
            // Castles are large landmark structures — render bigger than regular features
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
                // No contact shadow for features (only units/heroes get shadows)
                // Anchor base of sprite to tile ground surface
                const drawX = centerX - drawW / 2;
                const drawY = featureGroundY - drawH;
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            } else {
                // Fallback circle
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

        // Render units (sorted by position)
        const sortedUnits = [...units].sort((a, b) => {
            const depthA = a.position.x + a.position.y;
            const depthB = b.position.x + b.position.y;
            return depthA !== depthB ? depthA - depthB : a.position.y - b.position.y;
        });

        for (const unit of sortedUnits) {
            const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);

            // Off-screen unit culling (10.5.22)
            if (pos.x + scaledTileWidth < visLeft || pos.x > visRight ||
                pos.y + scaledTileHeight < visTop || pos.y > visBottom) {
                continue;
            }

            const isSelected = unit.id === selectedUnitId;
            const centerX = pos.x + scaledTileWidth / 2;
            // Ground surface Y: diamond center is where objects visually "sit" on the tile
            const groundY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight * 0.50;

            // Idle breathing animation (10.5.16) — only bobs downward so units never lift above ground
            // Unique phase offset per tile position so units don't bob in sync
            const breatheOffset = 0.8 * scale * (1 + Math.sin(animTime * 0.002 + (unit.position.x * 3.7 + unit.position.y * 5.3)));

            // Resolve sprite and compute dimensions using FIXED draw height
            // so all units appear the same height on the tile regardless of aspect ratio
            const unitSpriteUrl = resolveUnitSprite(unit);
            const img = unitSpriteUrl ? getImage(unitSpriteUrl) : null;
            const unitDrawH = scaledFloorHeight * 1.5; // Units stand ~1.5x floor diamond height
            const maxUnitW = scaledTileWidth * 0.6; // Don't exceed 60% of tile width
            const ar = img ? img.naturalWidth / img.naturalHeight : 0.5;
            let drawH = unitDrawH;
            let drawW = unitDrawH * ar;
            // Cap width so wide sprites don't overflow the tile
            if (drawW > maxUnitW) {
                drawW = maxUnitW;
                drawH = maxUnitW / ar;
            }

            // Movement trail / ghost (10.5.17)
            if (unit.previousPosition && (unit.previousPosition.x !== unit.position.x || unit.previousPosition.y !== unit.position.y)) {
                const ghostPos = isoToScreen(unit.previousPosition.x, unit.previousPosition.y, scale, baseOffsetX);
                const ghostCenterX = ghostPos.x + scaledTileWidth / 2;
                const ghostGroundY = ghostPos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight * 0.50;

                ctx.save();
                ctx.globalAlpha = 0.25;
                if (img) {
                    ctx.drawImage(
                        img,
                        ghostCenterX - drawW / 2,
                        ghostGroundY - drawH,
                        drawW,
                        drawH
                    );
                } else {
                    // Ghost fallback circle
                    const color = unit.team === 'player' ? '#3b82f6' :
                        unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                    ctx.beginPath();
                    ctx.arc(ghostCenterX, ghostGroundY - 16 * scale, 20 * scale, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                ctx.restore();
            }

            // Draw selection ring (pulsing, sized to sprite footprint)
            // Apply breatheOffset so selection ring bobs with the unit
            if (isSelected) {
                const ringAlpha = 0.6 + 0.3 * Math.sin(animTime * 0.004);
                ctx.beginPath();
                ctx.ellipse(
                    centerX,
                    groundY - breatheOffset,
                    drawW / 2 + 4 * scale,
                    12 * scale,
                    0, 0, Math.PI * 2
                );
                ctx.strokeStyle = `rgba(0, 200, 255, ${ringAlpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Shadow under unit on tile surface
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(centerX, groundY - breatheOffset, drawW * 0.4, 8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw unit sprite or fallback (with team color glow)
            // Apply breatheOffset to all sprite positions
            // Try animated sprite sheet frame first
            const frame = resolveUnitFrame?.(unit.id) ?? null;
            const frameImg = frame ? getImage(frame.sheetUrl) : null;

            if (frame && frameImg) {
                // Sprite sheet frame — use frame dimensions for aspect ratio
                const frameAr = frame.sw / frame.sh;
                let fDrawH = unitDrawH;
                let fDrawW = unitDrawH * frameAr;
                if (fDrawW > maxUnitW) {
                    fDrawW = maxUnitW;
                    fDrawH = maxUnitW / frameAr;
                }
                // Apply breatheOffset for frozen idle frames, skip for active animations
                const spriteY = groundY - fDrawH - (frame.applyBreathing ? breatheOffset : 0);

                ctx.save();
                if (unit.team) {
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                }
                if (frame.flipX) {
                    // Flip horizontally around the center of the sprite
                    ctx.translate(centerX, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        frameImg,
                        frame.sx, frame.sy, frame.sw, frame.sh,
                        -fDrawW / 2, spriteY, fDrawW, fDrawH,
                    );
                } else {
                    ctx.drawImage(
                        frameImg,
                        frame.sx, frame.sy, frame.sw, frame.sh,
                        centerX - fDrawW / 2, spriteY, fDrawW, fDrawH,
                    );
                }
                ctx.restore();
            } else if (img) {
                const spriteY = groundY - drawH - breatheOffset;
                if (unit.team) {
                    ctx.save();
                    ctx.shadowColor = unit.team === 'player' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 50, 50, 0.6)';
                    ctx.shadowBlur = 12 * scale;
                    ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
                    ctx.restore();
                } else {
                    ctx.drawImage(img, centerX - drawW / 2, spriteY, drawW, drawH);
                }
            } else {
                // Fallback circle (apply breatheOffset)
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

            // Draw unit name label (apply breatheOffset)
            if (unit.name) {
                const labelBg = unit.team === 'player' ? 'rgba(59, 130, 246, 0.9)' :
                    unit.team === 'enemy' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(107, 114, 128, 0.9)';

                ctx.font = `bold ${10 * scale * 2.5}px system-ui`;
                ctx.textAlign = 'center';

                const textWidth = ctx.measureText(unit.name).width;
                const labelY = groundY + 14 * scale - breatheOffset;

                ctx.fillStyle = labelBg;
                ctx.beginPath();
                ctx.roundRect(
                    centerX - textWidth / 2 - 6 * scale,
                    labelY - 8 * scale,
                    textWidth + 12 * scale,
                    16 * scale,
                    4 * scale
                );
                ctx.fill();

                ctx.fillStyle = 'white';
                ctx.fillText(unit.name, centerX, labelY + 4 * scale);
            }

            // Draw health bar (apply breatheOffset)
            if (unit.health !== undefined && unit.maxHealth !== undefined) {
                const barWidth = 40 * scale;
                const barHeight = 6 * scale;
                const barX = centerX - barWidth / 2;
                const barY = groundY - drawH - 2 * scale - breatheOffset;
                const healthRatio = unit.health / unit.maxHealth;
                const barRadius = barHeight / 2;

                // Dark rounded background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.fill();

                // Gradient health fill
                if (healthRatio > 0) {
                    const fillWidth = barWidth * healthRatio;
                    const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                    if (healthRatio > 0.6) {
                        gradient.addColorStop(0, '#4ade80');
                        gradient.addColorStop(1, '#22c55e');
                    } else if (healthRatio > 0.3) {
                        gradient.addColorStop(0, '#fde047');
                        gradient.addColorStop(1, '#eab308');
                    } else {
                        gradient.addColorStop(0, '#f87171');
                        gradient.addColorStop(1, '#ef4444');
                    }
                    ctx.fillStyle = gradient;
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
                    ctx.clip();
                    ctx.fillRect(barX, barY, fillWidth, barHeight);
                    ctx.restore();
                }

                // 1px white border at 0.3 alpha
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
                ctx.stroke();
            }
        }

        // Draw canvas effects (particles, sequences, overlays)
        onDrawEffects?.(ctx, animTime, getImage);

        // Restore camera transform (10.5.18)
        ctx.restore();

        // Draw minimap (10.5.20)
        drawMinimap();
    }, [
        sortedTiles, units, features, selectedUnitId,
        scale, debug, resolveTerrainSprite, resolveFeatureSprite, resolveUnitSprite, resolveUnitFrame, getImage,
        gridWidth, gridHeight, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight,
        validMoveSet, attackTargetSet, hoveredTile, viewportSize, drawMinimap, onDrawEffects
    ]);

    // =========================================================================
    // Camera centering on selected unit (10.5.19)
    // =========================================================================
    useEffect(() => {
        if (!selectedUnitId) return;
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit) return;
        const pos = isoToScreen(unit.position.x, unit.position.y, scale, baseOffsetX);
        const centerX = pos.x + scaledTileWidth / 2;
        const centerY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight / 2;
        targetCameraRef.current = {
            x: centerX - viewportSize.width / 2,
            y: centerY - viewportSize.height / 2,
        };
    }, [selectedUnitId, units, scale, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight, viewportSize]);

    // =========================================================================
    // Animation loop (10.5.21 - smart redraw)
    // Always animate when units are present (idle breathing) or camera is lerping
    // =========================================================================
    useEffect(() => {
        const hasAnimations = units.length > 0 || validMoves.length > 0 || attackTargets.length > 0 || selectedUnitId != null || targetCameraRef.current != null || hasActiveEffects;

        // Always draw at least once
        draw(animTimeRef.current);

        if (!hasAnimations) return;

        let running = true;
        const animate = (timestamp: number) => {
            if (!running) return;
            animTimeRef.current = timestamp;

            // Camera lerp toward target (10.5.19)
            if (targetCameraRef.current) {
                const cam = cameraRef.current;
                const t = 0.08;
                cam.x += (targetCameraRef.current.x - cam.x) * t;
                cam.y += (targetCameraRef.current.y - cam.y) * t;
                if (Math.abs(cam.x - targetCameraRef.current.x) < 0.5 && Math.abs(cam.y - targetCameraRef.current.y) < 0.5) {
                    cam.x = targetCameraRef.current.x;
                    cam.y = targetCameraRef.current.y;
                    targetCameraRef.current = null;
                }
            }

            draw(timestamp);
            rafIdRef.current = requestAnimationFrame(animate);
        };
        rafIdRef.current = requestAnimationFrame(animate);

        return () => {
            running = false;
            cancelAnimationFrame(rafIdRef.current);
        };
    }, [draw, units.length, validMoves.length, attackTargets.length, selectedUnitId, hasActiveEffects]);

    // =========================================================================
    // Helper: convert screen event coords to world coords (accounts for camera)
    // =========================================================================
    const screenToWorld = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;

        // Invert camera transform (10.5.18)
        const cam = cameraRef.current;
        const worldX = (screenX - viewportSize.width / 2) / cam.zoom + viewportSize.width / 2 + cam.x;
        const worldY = (screenY - viewportSize.height / 2) / cam.zoom + viewportSize.height / 2 + cam.y;

        return { x: worldX, y: worldY };
    }, [viewportSize]);

    // =========================================================================
    // Mouse handlers for camera panning (10.5.18)
    // =========================================================================
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Any mouse button starts panning (left, middle, or right — like HoMM3)
        isDraggingRef.current = true;
        dragDistanceRef.current = 0;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        if (e.button === 1 || e.button === 2) {
            e.preventDefault();
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    // Combined mouse move: camera panning + tile hover (10.5.18)
    const handleMouseMoveWithCamera = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        // Camera panning (10.5.18)
        if (isDraggingRef.current) {
            const dx = e.clientX - lastMouseRef.current.x;
            const dy = e.clientY - lastMouseRef.current.y;
            dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
            cameraRef.current.x -= dx;
            cameraRef.current.y -= dy;
            lastMouseRef.current = { x: e.clientX, y: e.clientY };
            // Cancel any camera auto-centering while user drags
            targetCameraRef.current = null;
            draw(animTimeRef.current);
            if (dragDistanceRef.current > 5) return; // Don't fire hover events while dragging significantly
        }

        // Tile hover logic (existing)
        if (!onTileHover) return;

        const world = screenToWorld(e.clientX, e.clientY);

        // Adjust for floor diamond center: subtract half-tile offset so diamond centers map to integer coords
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - (scaledTileHeight - scaledFloorHeight) - scaledFloorHeight / 2;

        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);

        // Check if tile exists
        const tileExists = tiles.some(t => t.x === isoPos.x && t.y === isoPos.y);
        if (tileExists) {
            onTileHover(isoPos.x, isoPos.y);
        }
    }, [tiles, scale, baseOffsetX, scaledTileHeight, scaledFloorHeight, onTileHover, draw, screenToWorld]);

    const handleMouseLeaveWithCamera = useCallback(() => {
        isDraggingRef.current = false;
        onTileLeave?.();
    }, [onTileLeave]);

    // Wheel handler for zoom (10.5.18)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        cameraRef.current.zoom = Math.max(0.5, Math.min(3, cameraRef.current.zoom * zoomDelta));
        draw(animTimeRef.current);
    }, [draw]);

    // Click handler (updated for camera transform) (10.5.18)
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        // Don't fire click if we were just panning (dragged more than 5px)
        if (dragDistanceRef.current > 5) return;

        const world = screenToWorld(e.clientX, e.clientY);

        // Adjust for floor diamond center: subtract half-tile offset so diamond centers map to integer coords
        const adjustedX = world.x - scaledTileWidth / 2;
        const adjustedY = world.y - (scaledTileHeight - scaledFloorHeight) - scaledFloorHeight / 2;

        const isoPos = screenToIso(adjustedX, adjustedY, scale, baseOffsetX);

        // Check if we clicked a unit
        const clickedUnit = units.find(
            u => u.position.x === isoPos.x && u.position.y === isoPos.y
        );

        if (clickedUnit && onUnitClick) {
            onUnitClick(clickedUnit.id);
        } else if (onTileClick) {
            // Check if tile exists
            const tileExists = tiles.some(t => t.x === isoPos.x && t.y === isoPos.y);
            if (tileExists) {
                onTileClick(isoPos.x, isoPos.y);
            }
        }
    }, [tiles, units, scale, baseOffsetX, scaledTileHeight, scaledFloorHeight, onTileClick, onUnitClick, screenToWorld]);

    return (
        <Box
            ref={containerRef}
            className={cn('relative overflow-hidden', className)}
        >
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMoveWithCamera}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeaveWithCamera}
                onWheel={handleWheel}
                onContextMenu={(e) => e.preventDefault()}
                className="cursor-pointer"
                style={{
                    width: viewportSize.width,
                    height: viewportSize.height,
                }}
            />
            {/* Mini-map overlay (10.5.20) */}
            <canvas
                ref={minimapRef}
                className="absolute bottom-2 right-2 border border-gray-600 rounded bg-gray-900/80 pointer-events-none"
                style={{ width: 150, height: 100, zIndex: 10 }}
            />
        </Box>
    );
}

IsometricGameCanvas.displayName = 'IsometricGameCanvas';

export default IsometricGameCanvas;
