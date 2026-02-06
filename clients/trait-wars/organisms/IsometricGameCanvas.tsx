/**
 * IsometricGameCanvas Component
 *
 * Canvas-based isometric game board for Trait Wars.
 * Replaces DOM-based HexGameBoard with pixel-perfect canvas rendering.
 */

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, cn } from '@almadar/ui';

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
}

export interface IsometricUnit {
    id: string;
    position: { x: number; y: number };
    sprite?: string;
    name?: string;
    team?: 'player' | 'enemy' | 'neutral';
    health?: number;
    maxHealth?: number;
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
    /** Additional CSS classes */
    className?: string;
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
        x: Math.floor(tileX),
        y: Math.floor(tileY)
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
    className
}: IsometricGameCanvasProps): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate grid bounds
    const maxX = Math.max(...tiles.map(t => t.x), 0);
    const maxY = Math.max(...tiles.map(t => t.y), 0);

    // Base offset to center the grid
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    // Canvas dimensions
    const scaledTileWidth = TILE_WIDTH * scale;
    const scaledTileHeight = TILE_HEIGHT * scale;
    const scaledFloorHeight = FLOOR_HEIGHT * scale;

    const gridWidth = (maxX + maxY + 2) * (scaledTileWidth / 2) + scaledTileWidth;
    const gridHeight = (maxX + maxY + 1) * (scaledFloorHeight / 2) + scaledTileHeight;

    // Collect all sprite URLs for preloading
    const spriteUrls = React.useMemo(() => {
        const urls: string[] = [];

        // Terrain sprites
        tiles.forEach(tile => {
            const url = tile.terrainSprite || getTerrainSprite?.(tile.terrain);
            if (url) urls.push(url);
        });

        // Unit sprites
        units.forEach(unit => {
            if (unit.sprite) urls.push(unit.sprite);
        });

        // Feature sprites
        features.forEach(feature => {
            const url = feature.sprite || getFeatureSprite?.(feature.type);
            if (url) urls.push(url);
        });

        return urls;
    }, [tiles, units, features, getTerrainSprite, getFeatureSprite]);

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

    // Render the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution (handle retina displays)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = gridWidth * dpr;
        canvas.height = gridHeight * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, gridWidth, gridHeight);

        // Render tiles (painter's algorithm order)
        for (const tile of sortedTiles) {
            const pos = isoToScreen(tile.x, tile.y, scale, baseOffsetX);
            const key = `${tile.x},${tile.y}`;

            // Get sprite image or use fallback color
            const spriteUrl = tile.terrainSprite || getTerrainSprite?.(tile.terrain);
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

            // Draw valid move highlight
            if (validMoveSet.has(key)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();

                ctx.fillStyle = 'rgba(0, 255, 100, 0.3)';
                ctx.fill();

                ctx.strokeStyle = 'rgba(0, 255, 100, 0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw attack target highlight
            if (attackTargetSet.has(key)) {
                const centerX = pos.x + scaledTileWidth / 2;
                const centerY = pos.y + scaledFloorHeight / 2 + (scaledTileHeight - scaledFloorHeight);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY - scaledFloorHeight / 2);
                ctx.lineTo(centerX + scaledTileWidth / 2, centerY);
                ctx.lineTo(centerX, centerY + scaledFloorHeight / 2);
                ctx.lineTo(centerX - scaledTileWidth / 2, centerY);
                ctx.closePath();

                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
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
            const spriteUrl = feature.sprite || getFeatureSprite?.(feature.type);
            const img = spriteUrl ? getImage(spriteUrl) : null;

            const featureSize = 48 * scale * 2.5;
            const centerX = pos.x + scaledTileWidth / 2;
            const floorCenterY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight / 2;

            if (img) {
                ctx.drawImage(
                    img,
                    centerX - featureSize / 2,
                    floorCenterY - featureSize / 2 - 8 * scale,
                    featureSize,
                    featureSize
                );
            } else {
                // Fallback circle
                const color = FEATURE_COLORS[feature.type] || FEATURE_COLORS.default;
                ctx.beginPath();
                ctx.arc(centerX, floorCenterY - 8 * scale, 16 * scale, 0, Math.PI * 2);
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
            const isSelected = unit.id === selectedUnitId;
            const unitSize = 64 * scale * 2.5;
            const centerX = pos.x + scaledTileWidth / 2;
            const floorCenterY = pos.y + (scaledTileHeight - scaledFloorHeight) + scaledFloorHeight / 2;

            // Draw selection ring
            if (isSelected) {
                ctx.beginPath();
                ctx.ellipse(
                    centerX,
                    floorCenterY + 10 * scale,
                    24 * scale,
                    12 * scale,
                    0, 0, Math.PI * 2
                );
                ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw unit sprite or fallback
            const img = unit.sprite ? getImage(unit.sprite) : null;
            if (img) {
                ctx.drawImage(
                    img,
                    centerX - unitSize / 2,
                    floorCenterY - unitSize + 8 * scale,
                    unitSize,
                    unitSize
                );
            } else {
                // Fallback circle
                const color = unit.team === 'player' ? '#3b82f6' :
                    unit.team === 'enemy' ? '#ef4444' : '#6b7280';
                ctx.beginPath();
                ctx.arc(centerX, floorCenterY - 16 * scale, 20 * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw unit name label
            if (unit.name) {
                const labelBg = unit.team === 'player' ? 'rgba(59, 130, 246, 0.9)' :
                    unit.team === 'enemy' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(107, 114, 128, 0.9)';

                ctx.font = `bold ${10 * scale * 2.5}px system-ui`;
                ctx.textAlign = 'center';

                const textWidth = ctx.measureText(unit.name).width;
                const labelY = floorCenterY + 20 * scale;

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

            // Draw health bar
            if (unit.health !== undefined && unit.maxHealth !== undefined) {
                const barWidth = 40 * scale;
                const barHeight = 6 * scale;
                const barY = floorCenterY - unitSize + 4 * scale;
                const healthRatio = unit.health / unit.maxHealth;

                // Background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);

                // Health fill
                ctx.fillStyle = healthRatio > 0.5 ? '#22c55e' :
                    healthRatio > 0.25 ? '#eab308' : '#ef4444';
                ctx.fillRect(centerX - barWidth / 2, barY, barWidth * healthRatio, barHeight);

                // Border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(centerX - barWidth / 2, barY, barWidth, barHeight);
            }
        }
    }, [
        tiles, units, features, selectedUnitId, validMoves, attackTargets, hoveredTile,
        scale, debug, getTerrainSprite, getFeatureSprite, getImage, sortedTiles,
        gridWidth, gridHeight, baseOffsetX, scaledTileWidth, scaledTileHeight, scaledFloorHeight,
        validMoveSet, attackTargetSet
    ]);

    // Handle mouse events
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onTileHover) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const dpr = window.devicePixelRatio || 1;

        const screenX = (e.clientX - rect.left) * scaleX / dpr;
        const screenY = (e.clientY - rect.top) * scaleY / dpr;

        // Adjust for floor position (tiles are positioned from top-left of full tile)
        const adjustedY = screenY - (scaledTileHeight - scaledFloorHeight);

        const isoPos = screenToIso(screenX, adjustedY, scale, baseOffsetX);

        // Check if tile exists
        const tileExists = tiles.some(t => t.x === isoPos.x && t.y === isoPos.y);
        if (tileExists) {
            onTileHover(isoPos.x, isoPos.y);
        }
    }, [tiles, scale, baseOffsetX, scaledTileHeight, scaledFloorHeight, onTileHover]);

    const handleMouseLeave = useCallback(() => {
        onTileLeave?.();
    }, [onTileLeave]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const dpr = window.devicePixelRatio || 1;

        const screenX = (e.clientX - rect.left) * scaleX / dpr;
        const screenY = (e.clientY - rect.top) * scaleY / dpr;

        // Adjust for floor position
        const adjustedY = screenY - (scaledTileHeight - scaledFloorHeight);

        const isoPos = screenToIso(screenX, adjustedY, scale, baseOffsetX);

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
    }, [tiles, units, scale, baseOffsetX, scaledTileHeight, scaledFloorHeight, onTileClick, onUnitClick]);

    return (
        <Box
            ref={containerRef}
            className={cn('relative overflow-auto', className)}
        >
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="cursor-pointer"
                style={{
                    width: gridWidth,
                    height: gridHeight,
                    imageRendering: 'pixelated'
                }}
            />
        </Box>
    );
}

IsometricGameCanvas.displayName = 'IsometricGameCanvas';

export default IsometricGameCanvas;
