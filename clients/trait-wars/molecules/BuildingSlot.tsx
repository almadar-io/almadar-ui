/**
 * BuildingSlot Molecule
 *
 * Displays a building sprite with level indicator for castle view.
 * Uses Badge from @almadar/ui for level display.
 */

import React from 'react';
import { Box, Badge, Typography, cn } from '@almadar/ui';
import { BuildingType, useAssetsOptional, getBuildingSpriteUrl } from '../assets';

export interface BuildingSlotProps {
    /** Building type */
    buildingType: BuildingType;
    /** Building name for display */
    name: string;
    /** Current level (0 = not built) */
    level: number;
    /** Maximum level */
    maxLevel: number;
    /** Whether this building is selected */
    isSelected?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Custom CSS classes */
    className?: string;
    /** Fallback icon (emoji) if no sprite available */
    fallbackIcon?: string;
}

/**
 * BuildingSlot - Displays a clickable building with sprite and level indicator.
 */
export function BuildingSlot({
    buildingType,
    name,
    level,
    maxLevel,
    isSelected = false,
    onClick,
    className,
    fallbackIcon = '🏛️',
}: BuildingSlotProps): JSX.Element {
    const manifest = useAssetsOptional();
    const spriteUrl = manifest ? getBuildingSpriteUrl(manifest, buildingType) : undefined;
    const isBuilt = level > 0;

    return (
        <Box
            className={cn(
                'relative rounded-lg cursor-pointer transition-all duration-200',
                'flex flex-col items-center justify-center p-2',
                'hover:scale-105 hover:z-10',
                isBuilt
                    ? 'bg-gradient-to-b from-amber-600/80 to-amber-800/80 border-2 border-amber-400'
                    : 'bg-slate-700/50 border-2 border-dashed border-slate-500',
                isSelected && 'ring-4 ring-cyan-400 scale-105 z-10',
                className
            )}
            onClick={onClick}
        >
            {/* Building Sprite or Fallback */}
            {spriteUrl ? (
                <img
                    src={spriteUrl}
                    alt={name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                />
            ) : (
                <Typography variant="h4" className="text-2xl">
                    {fallbackIcon}
                </Typography>
            )}

            {/* Building Name (on hover or always for unbuilt) */}
            {!isBuilt && (
                <Typography variant="caption" className="text-gray-400 text-center mt-1">
                    {name}
                </Typography>
            )}

            {/* Level Badge */}
            {isBuilt && (
                <Badge
                    variant="default"
                    className="absolute -bottom-2 bg-green-600 text-white text-xs"
                >
                    Lv.{level}/{maxLevel}
                </Badge>
            )}
        </Box>
    );
}

BuildingSlot.displayName = 'BuildingSlot';

export default BuildingSlot;
