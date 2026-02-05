/**
 * HexTileSprite Component
 *
 * Renders isometric terrain tiles in "Illuminated Manuscript Futurism" style.
 * Assets are loaded dynamically via TraitWarsAssetProvider - NOT bundled.
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { cn } from '@almadar/ui';
import { TerrainType, useAssets, getTerrainSpriteUrl } from '../assets';

// Default tile size
const DEFAULT_WIDTH = 256;
const DEFAULT_HEIGHT = 256;

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
    // Try to get URL from asset provider, fall back to src prop
    let tileSrc = src;
    try {
        const manifest = useAssets();
        tileSrc = getTerrainSpriteUrl(manifest, type) || src;
    } catch {
        // Not in AssetProvider context, use src prop
    }

    const width = DEFAULT_WIDTH * scale;
    const height = DEFAULT_HEIGHT * scale;

    // Highlight overlay styles
    const highlightStyles: Record<string, React.CSSProperties> = {
        none: {},
        valid: {
            filter: 'brightness(1.1)',
            boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.6)',
        },
        attack: {
            filter: 'brightness(1.05) hue-rotate(-10deg)',
            boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.6)',
        },
        selected: {
            filter: 'brightness(1.2)',
            boxShadow: 'inset 0 0 25px rgba(234, 179, 8, 0.7)',
        },
        hover: {
            filter: 'brightness(1.1)',
        },
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
                'relative transition-all duration-150 cursor-pointer',
                className
            )}
            style={{
                width,
                height,
                ...highlightStyles[highlight],
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
            {/* Highlight overlay */}
            {highlight !== 'none' && (
                <Box
                    className={cn(
                        'absolute inset-0 pointer-events-none',
                        highlight === 'valid' && 'bg-green-500/20 border-2 border-green-400',
                        highlight === 'attack' && 'bg-red-500/20 border-2 border-red-400',
                        highlight === 'selected' && 'bg-yellow-500/20 border-2 border-yellow-400',
                        highlight === 'hover' && 'bg-white/10 border border-white/30'
                    )}
                />
            )}
        </Box>
    );
}

export default HexTileSprite;

// Re-export types
export type HexTileType = TerrainType;
