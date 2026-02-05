/**
 * HexTileSprite Component
 *
 * Renders isometric terrain tiles in "Illuminated Manuscript Futurism" style.
 * Assets are loaded dynamically via TraitWarsAssetProvider - NOT bundled.
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { cn } from '@almadar/ui';
import { TerrainType, useAssetsOptional, DEFAULT_ASSET_MANIFEST, getTerrainSpriteUrl } from '../assets';

// Default tile size (Kenney Isometric Miniature Dungeon tiles are 256x512)
// The floor diamond is 256 wide x 128 tall at the bottom of the image
const DEFAULT_WIDTH = 256;
const DEFAULT_HEIGHT = 512;
const FLOOR_HEIGHT = 128; // The isometric floor diamond height

export interface HexTileSpriteProps {
    /** Type of terrain tile to display */
    type: TerrainType;
    /** Fallback sprite URL (if not using AssetProvider) */
    src?: string;
    /** Scale multiplier (default 0.3 for ~77px tiles) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Highlight state */
    highlight?: 'none' | 'valid' | 'attack' | 'selected' | 'hover';
    /** Click handler */
    onClick?: () => void;
    /** Mouse enter handler */
    onMouseEnter?: () => void;
    /** Mouse leave handler */
    onMouseLeave?: () => void;
}

export function HexTileSprite({
    type,
    src,
    scale = 0.3,
    className,
    highlight = 'none',
    onClick,
    onMouseEnter,
    onMouseLeave,
}: HexTileSpriteProps): JSX.Element {
    // Get asset manifest from context or use default
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const tileSrc = src || getTerrainSpriteUrl(assets, type);

    const width = DEFAULT_WIDTH * scale;
    const height = DEFAULT_HEIGHT * scale;
    const floorHeight = FLOOR_HEIGHT * scale;

    // Highlight filter styles (applied to the whole tile for brightness effects)
    const highlightFilters: Record<string, React.CSSProperties> = {
        none: {},
        valid: { filter: 'brightness(1.1)' },
        attack: { filter: 'brightness(1.05) hue-rotate(-10deg)' },
        selected: { filter: 'brightness(1.2)' },
        hover: { filter: 'brightness(1.1)' },
    };

    if (!tileSrc) {
        // Placeholder when no sprite available
        return (
            <div
                className={cn('flex items-center justify-center bg-gray-600 text-gray-400 text-xs', className)}
                style={{ width, height }}
            >
                {type}
            </div>
        );
    }

    return (
        <Box
            display="inline-block"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'relative transition-all duration-150',
                onClick && 'cursor-pointer',
                className
            )}
            style={{
                width,
                height,
                ...highlightFilters[highlight],
            }}
        >
            <img
                src={tileSrc}
                alt={type}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
                draggable={false}
            />
            {/* Highlight overlay - isometric diamond on the floor area */}
            {highlight !== 'none' && (
                <Box
                    className={cn(
                        'absolute pointer-events-none',
                        highlight === 'valid' && 'bg-green-500/30 border-2 border-green-400',
                        highlight === 'attack' && 'bg-red-500/30 border-2 border-red-400',
                        highlight === 'selected' && 'bg-yellow-500/30 border-2 border-yellow-400',
                        highlight === 'hover' && 'bg-white/20 border border-white/50'
                    )}
                    style={{
                        bottom: 0,
                        left: 0,
                        width: width,
                        height: floorHeight,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    }}
                />
            )}
        </Box>
    );
}

export default HexTileSprite;

// Re-export types
export type HexTileType = TerrainType;
