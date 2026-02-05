/**
 * HexGrid Organism
 *
 * Full battlefield grid with hexagonal tiles and unit placement.
 * Uses Box, HexCell, and optional unit rendering.
 */

import React from 'react';
import { cn, Box } from '@almadar/ui';
import { HexCell, TerrainType } from '../atoms/HexCell';
import { UnitType, useAssets, getUnitSpriteUrl } from '../assets';

export interface HexTileEntity {
    x: number;
    y: number;
    terrain: TerrainType;
    occupant?: string;
    effects?: string[];
}

export interface GridUnit {
    id: string;
    position: { x: number; y: number };
    owner: 'player' | 'enemy';
    unitType?: UnitType;
    sprite?: React.ReactNode;
}

export interface HexGridProps {
    /** Array of hex tiles */
    tiles: HexTileEntity[];
    /** Array of units on the grid */
    units?: GridUnit[];
    /** Currently selected unit */
    selectedUnit?: GridUnit | null;
    /** Valid move destinations for selected unit */
    validMoves?: { x: number; y: number }[];
    /** Valid attack targets for selected unit */
    attackTargets?: { x: number; y: number }[];
    /** Handler for tile clicks */
    onTileClick?: (x: number, y: number) => void;
    /** Handler for unit clicks */
    onUnitClick?: (unitId: string) => void;
    /** Grid dimensions */
    gridWidth?: number;
    gridHeight?: number;
    /** Hex size */
    hexSize?: 'sm' | 'md' | 'lg';
    /** Show coordinates on tiles */
    showCoordinates?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const hexSizeMap = {
    sm: { width: 60, height: 70, horizontalOffset: 45, verticalOffset: 52 },
    md: { width: 80, height: 93, horizontalOffset: 60, verticalOffset: 70 },
    lg: { width: 120, height: 140, horizontalOffset: 90, verticalOffset: 105 },
};

export function HexGrid({
    tiles,
    units = [],
    selectedUnit = null,
    validMoves = [],
    attackTargets = [],
    onTileClick,
    onUnitClick,
    hexSize = 'md',
    showCoordinates = false,
    className,
}: HexGridProps): JSX.Element {
    const dimensions = hexSizeMap[hexSize];

    // Find grid bounds
    const maxX = Math.max(...tiles.map(t => t.x), 0);
    const maxY = Math.max(...tiles.map(t => t.y), 0);

    // Calculate container size
    const gridWidthPx = (maxX + 1) * dimensions.horizontalOffset + dimensions.width / 2;
    const gridHeightPx = (maxY + 1) * dimensions.verticalOffset + dimensions.height / 2;

    // Check if a position is a valid move
    const isValidMove = (x: number, y: number) =>
        validMoves.some((m) => m.x === x && m.y === y);

    // Check if a position is an attack target
    const isAttackTarget = (x: number, y: number) =>
        attackTargets.some((t) => t.x === x && t.y === y);

    // Find unit at position
    const getUnitAt = (x: number, y: number) =>
        units.find((u) => u.position.x === x && u.position.y === y);

    return (
        <Box
            position="relative"
            className={cn('overflow-auto bg-[var(--color-muted)]', className)}
            style={{ width: gridWidthPx, height: gridHeightPx }}
        >
            {tiles.map((tile) => {
                const unit = getUnitAt(tile.x, tile.y);
                const isSelectedTile =
                    selectedUnit?.position.x === tile.x &&
                    selectedUnit?.position.y === tile.y;

                // Calculate hex position (offset grid layout)
                const xPos = tile.x * dimensions.horizontalOffset;
                const yPos = tile.y * dimensions.verticalOffset + (tile.x % 2 === 1 ? dimensions.verticalOffset / 2 : 0);

                return (
                    <Box
                        key={`${tile.x}-${tile.y}`}
                        position="absolute"
                        style={{ left: xPos, top: yPos }}
                    >
                        <HexCell
                            x={tile.x}
                            y={tile.y}
                            terrain={tile.terrain}
                            isSelected={isSelectedTile}
                            isValidMove={isValidMove(tile.x, tile.y)}
                            isAttackTarget={isAttackTarget(tile.x, tile.y)}
                            size={hexSize}
                            showCoordinates={showCoordinates}
                            onClick={() => {
                                if (unit && onUnitClick) {
                                    onUnitClick(unit.id);
                                } else if (onTileClick) {
                                    onTileClick(tile.x, tile.y);
                                }
                            }}
                        >
                            {/* Unit sprite */}
                            {unit && (
                                <Box
                                    display="flex"
                                    className="items-center justify-center"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        onUnitClick?.(unit.id);
                                    }}
                                >
                                    {unit.sprite || (
                                        unit.unitType ? (
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                                                    unit.owner === 'player' ? 'bg-[#3b82f6] text-white' : 'bg-[#ef4444] text-white'
                                                )}
                                            >
                                                {unit.unitType.slice(0, 2).toUpperCase()}
                                            </div>
                                        ) : (
                                            <Box className={cn(
                                                'w-6 h-6 rounded-full',
                                                unit.owner === 'player' ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'
                                            )} />
                                        )
                                    )}
                                </Box>
                            )}
                        </HexCell>
                    </Box>
                );
            })}
        </Box>
    );
}

HexGrid.displayName = 'HexGrid';

export default HexGrid;
