/**
 * HexGameBoard Organism
 *
 * A complete hex grid game board using high-fidelity assets.
 * Features:
 * - Isometric hex grid layout
 * - HexTileSprite for terrain
 * - PixelCharacterSprite for units
 * - Move/attack highlighting
 * - Hover and selection states
 */

import React, { useState, useCallback } from 'react';
import { Box, cn } from '@almadar/ui';
import { HexGameTile, HexUnit } from './HexGameTile';
import { HexTileType } from '../atoms/HexTileSprite';

export interface HexBoardTile {
    x: number;
    y: number;
    terrain: HexTileType;
}

export interface HexGameBoardProps {
    /** Array of tiles defining the map */
    tiles: HexBoardTile[];
    /** Array of units on the board */
    units: HexUnit[];
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions for selected unit */
    validMoves?: Array<{ x: number; y: number }>;
    /** Valid attack positions for selected unit */
    attackTargets?: Array<{ x: number; y: number }>;
    /** Tile click handler */
    onTileClick?: (x: number, y: number) => void;
    /** Unit click/select handler */
    onUnitClick?: (unitId: string) => void;
    /** Tile hover handler */
    onTileHover?: (x: number, y: number) => void;
    /** Tile leave handler */
    onTileLeave?: () => void;
    /** Hex tile scale (default 0.5) */
    scale?: number;
    /** Show coordinate labels */
    showCoordinates?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Render custom overlays with access to tile positioning */
    renderOverlay?: (helpers: {
        getTilePosition: (x: number, y: number) => { x: number; y: number };
        tileWidth: number;
        floorHeight: number;
    }) => React.ReactNode;
}

export function HexGameBoard({
    tiles,
    units,
    selectedUnitId = null,
    validMoves = [],
    attackTargets = [],
    onTileClick,
    onUnitClick,
    onTileHover,
    onTileLeave,
    scale = 0.5,
    showCoordinates = false,
    className,
    renderOverlay,
}: HexGameBoardProps): JSX.Element {
    const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);

    // Isometric tile dimensions (256x512 base size from Kenney Isometric Miniature Dungeon)
    // The floor diamond is 256 wide x 128 tall (standard 2:1 isometric ratio)
    const TILE_WIDTH = 256 * scale;
    const TILE_HEIGHT = 512 * scale;
    const FLOOR_HEIGHT = 128 * scale; // The isometric floor diamond height
    // Isometric grid positioning - floor diamonds connect seamlessly
    const HORIZONTAL_OFFSET = TILE_WIDTH / 2;  // 128 * scale
    const VERTICAL_OFFSET = FLOOR_HEIGHT / 2;   // 64 * scale

    // Find grid bounds
    const maxX = Math.max(...tiles.map(t => t.x), 0);
    const maxY = Math.max(...tiles.map(t => t.y), 0);

    // Calculate container size for isometric diamond grid
    const gridWidth = (maxX + maxY + 2) * HORIZONTAL_OFFSET + TILE_WIDTH;
    const gridHeight = (maxX + maxY + 1) * VERTICAL_OFFSET + TILE_HEIGHT;

    // Helper functions
    const isValidMove = useCallback(
        (x: number, y: number) => validMoves.some(m => m.x === x && m.y === y),
        [validMoves]
    );

    const isAttackTarget = useCallback(
        (x: number, y: number) => attackTargets.some(t => t.x === x && t.y === y),
        [attackTargets]
    );

    const getUnitAt = useCallback(
        (x: number, y: number) => units.find(u => {
            // Check if unit has a position property or x/y directly
            if ('position' in u) {
                return (u as any).position.x === x && (u as any).position.y === y;
            }
            return false;
        }),
        [units]
    );

    const handleTileClick = useCallback(
        (x: number, y: number) => {
            const unit = getUnitAt(x, y);
            if (unit && onUnitClick) {
                onUnitClick(unit.id);
            } else if (onTileClick) {
                onTileClick(x, y);
            }
        },
        [getUnitAt, onUnitClick, onTileClick]
    );

    const handleMouseEnter = useCallback(
        (x: number, y: number) => {
            setHoveredPos({ x, y });
            onTileHover?.(x, y);
        },
        [onTileHover]
    );

    const handleMouseLeave = useCallback(() => {
        setHoveredPos(null);
        onTileLeave?.();
    }, [onTileLeave]);

    // Helper to calculate tile position
    const getTilePosition = (tileX: number, tileY: number) => {
        const baseOffsetX = (maxY + 1) * HORIZONTAL_OFFSET;
        return {
            x: (tileX - tileY) * HORIZONTAL_OFFSET + baseOffsetX,
            y: (tileX + tileY) * VERTICAL_OFFSET,
        };
    };

    return (
        <Box
            className={cn(
                'relative overflow-auto bg-gray-900/50 rounded-lg p-4',
                className
            )}
            style={{
                minWidth: gridWidth + 32,
                minHeight: gridHeight + 32,
            }}
        >
            <Box
                className="relative"
                style={{ width: gridWidth, height: gridHeight }}
            >
                {/* Layer 1: Visual tiles (no pointer events) */}
                {tiles.map((tile) => {
                    const unit = getUnitAt(tile.x, tile.y);
                    const isSelectedTile = selectedUnitId && unit?.id === selectedUnitId;
                    const isHovered = hoveredPos?.x === tile.x && hoveredPos?.y === tile.y;
                    const pos = getTilePosition(tile.x, tile.y);

                    return (
                        <Box
                            key={`visual-${tile.x}-${tile.y}`}
                            className="absolute pointer-events-none"
                            style={{ left: pos.x, top: pos.y }}
                        >
                            <HexGameTile
                                x={tile.x}
                                y={tile.y}
                                terrain={tile.terrain}
                                unit={unit}
                                isSelected={!!isSelectedTile}
                                isValidMove={isValidMove(tile.x, tile.y)}
                                isAttackTarget={isAttackTarget(tile.x, tile.y)}
                                isHovered={isHovered}
                                scale={scale}
                                showCoordinates={showCoordinates}
                                renderMode="visual"
                            />
                        </Box>
                    );
                })}

                {/* Layer 2: Hit areas (on top of all visuals for proper interaction) */}
                {tiles.map((tile) => {
                    const pos = getTilePosition(tile.x, tile.y);

                    return (
                        <Box
                            key={`hit-${tile.x}-${tile.y}`}
                            className="absolute"
                            style={{ left: pos.x, top: pos.y }}
                        >
                            <HexGameTile
                                x={tile.x}
                                y={tile.y}
                                terrain={tile.terrain}
                                onClick={() => handleTileClick(tile.x, tile.y)}
                                onMouseEnter={() => handleMouseEnter(tile.x, tile.y)}
                                onMouseLeave={handleMouseLeave}
                                scale={scale}
                                renderMode="hitArea"
                            />
                        </Box>
                    );
                })}

                {/* Layer 3: Custom overlays (rendered last, on top of everything) */}
                {renderOverlay?.({
                    getTilePosition,
                    tileWidth: TILE_WIDTH,
                    floorHeight: FLOOR_HEIGHT,
                })}
            </Box>
        </Box>
    );
}

export default HexGameBoard;
