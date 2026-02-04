/**
 * HexCell Atom
 *
 * Renders a single hexagon tile for the Trait Wars battlefield.
 * Uses Box for layout and terrain sprites from Kenny asset pack.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../../components/atoms/Box';
import { Typography } from '../../../components/atoms/Typography';
import { TERRAIN_SPRITES } from '../assets';

export type TerrainType = 'plains' | 'forest' | 'mountain' | 'water' | 'fortress';

export interface HexCellProps {
    /** Hex grid X coordinate */
    x: number;
    /** Hex grid Y coordinate */
    y: number;
    /** Terrain type affecting visual style */
    terrain: TerrainType;
    /** Whether this cell is currently selected */
    isSelected?: boolean;
    /** Whether this cell is highlighted (e.g., hover) */
    isHighlighted?: boolean;
    /** Whether this is a valid move destination */
    isValidMove?: boolean;
    /** Whether this cell is a valid attack target */
    isAttackTarget?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Size of the hex in pixels */
    size?: 'sm' | 'md' | 'lg';
    /** Show coordinate labels */
    showCoordinates?: boolean;
    /** Use sprite background (false = solid colors for fallback) */
    useSprites?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Children to render inside the hex (e.g., unit) */
    children?: React.ReactNode;
}

// Fallback solid colors when sprites not available
const terrainColors: Record<TerrainType, string> = {
    plains: 'bg-[#86efac] border-[#22c55e]',
    forest: 'bg-[#166534] border-[#14532d]',
    mountain: 'bg-[#78716c] border-[#57534e]',
    water: 'bg-[#38bdf8] border-[#0284c7]',
    fortress: 'bg-[#92400e] border-[#78350f]',
};

const sizeStyles = {
    sm: { width: 60, height: 70 },
    md: { width: 80, height: 93 },
    lg: { width: 120, height: 140 },
};

export function HexCell({
    x,
    y,
    terrain,
    isSelected = false,
    isHighlighted = false,
    isValidMove = false,
    isAttackTarget = false,
    onClick,
    size = 'md',
    showCoordinates = false,
    useSprites = true,
    className,
    children,
}: HexCellProps): JSX.Element {
    const dimensions = sizeStyles[size];
    const spriteUrl = TERRAIN_SPRITES[terrain];

    return (
        <Box
            position="relative"
            display="flex"
            className={cn(
                'items-center justify-center cursor-pointer transition-all duration-200',
                // Selection states
                isSelected && 'ring-4 ring-[#fbbf24] ring-offset-2',
                isHighlighted && 'brightness-110 scale-105',
                isValidMove && 'ring-2 ring-[#22c55e] ring-opacity-70',
                isAttackTarget && 'ring-2 ring-[#ef4444] ring-opacity-70',
                // Hover effect
                'hover:brightness-110 hover:scale-105',
                // Fallback colors if not using sprites
                !useSprites && terrainColors[terrain],
                className
            )}
            style={{
                width: dimensions.width,
                height: dimensions.height,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                ...(useSprites && {
                    backgroundImage: `url(${spriteUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }),
            }}
            onClick={onClick}
        >
            {/* Children (unit sprite, etc.) */}
            {children}

            {/* Coordinate label */}
            {showCoordinates && (
                <Box
                    position="absolute"
                    className="bottom-1 left-1/2 -translate-x-1/2 bg-black/50 px-1 rounded"
                >
                    <Typography variant="caption" className="text-[10px] text-white">
                        {x},{y}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

HexCell.displayName = 'HexCell';

export default HexCell;

