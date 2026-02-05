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
import { Box } from '@almadar/ui';
import { HexGameTile, HexUnit } from './HexGameTile';
import { HexTileType } from '../atoms/HexTileSprite';
import { cn } from '@almadar/ui';

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
}: HexGameBoardProps): JSX.Element {
    const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);

    // Hex dimensions
    const HEX_WIDTH = 120 * scale;
    const HEX_HEIGHT = 140 * scale;
    const HORIZONTAL_OFFSET = HEX_WIDTH * 0.75;
    const VERTICAL_OFFSET = HEX_HEIGHT * 0.75;

    // Find grid bounds
    const maxX = Math.max(...tiles.map(t => t.x), 0);
    const maxY = Math.max(...tiles.map(t => t.y), 0);

    // Calculate container size
    const gridWidth = (maxX + 1) * HORIZONTAL_OFFSET + HEX_WIDTH * 0.25;
    const gridHeight = (maxY + 1) * VERTICAL_OFFSET + HEX_HEIGHT * 0.5;

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
                {tiles.map((tile) => {
                    const unit = getUnitAt(tile.x, tile.y);
                    const isSelectedTile = selectedUnitId && unit?.id === selectedUnitId;
                    const isHovered = hoveredPos?.x === tile.x && hoveredPos?.y === tile.y;

                    // Offset grid layout for hex positioning
                    const xPos = tile.x * HORIZONTAL_OFFSET;
                    const yPos = tile.y * VERTICAL_OFFSET + (tile.x % 2 === 1 ? VERTICAL_OFFSET / 2 : 0);

                    return (
                        <Box
                            key={`${tile.x}-${tile.y}`}
                            className="absolute"
                            style={{ left: xPos, top: yPos }}
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
                                onClick={() => handleTileClick(tile.x, tile.y)}
                                onMouseEnter={() => handleMouseEnter(tile.x, tile.y)}
                                onMouseLeave={handleMouseLeave}
                                scale={scale}
                                showCoordinates={showCoordinates}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default HexGameBoard;
