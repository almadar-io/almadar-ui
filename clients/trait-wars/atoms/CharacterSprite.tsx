/**
 * CharacterSprite Component
 *
 * Renders isometric character sprites in "Illuminated Manuscript Futurism" style.
 * Assets are loaded dynamically via TraitWarsAssetProvider - NOT bundled.
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { cn } from '@almadar/ui';
import { UnitType, useAssetsOptional, DEFAULT_ASSET_MANIFEST, getUnitSpriteUrl } from '../assets';

// Default display configuration
const DEFAULT_SCALE = 0.15; // Scale down for game grid (200px * 0.15 = 30px)

export interface CharacterSpriteProps {
    /** Type of character to display */
    type: UnitType;
    /** Fallback sprite URL (if not using AssetProvider) */
    src?: string;
    /** Size multiplier (default 0.15 for 30px height) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to apply team color tint */
    team?: 'player' | 'enemy' | 'neutral';
    /** Current state for visual indication */
    state?: 'idle' | 'attacking' | 'defending' | 'casting' | 'wounded';
    /** Whether unit is selected */
    selected?: boolean;
}

/**
 * CharacterSprite renders an isometric character sprite.
 * Uses TraitWarsAssetProvider for asset URLs, or accepts direct src prop.
 */
export function CharacterSprite({
    type,
    src,
    scale = DEFAULT_SCALE,
    className,
    team = 'neutral',
    state = 'idle',
    selected = false,
}: CharacterSpriteProps): JSX.Element {
    // Get asset manifest from context or use default
    const assets = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const spriteSrc = src || getUnitSpriteUrl(assets, type);

    // Team color filters
    const teamFilters = {
        player: 'hue-rotate(180deg) saturate(1.1)',
        enemy: 'hue-rotate(-30deg) saturate(1.2)',
        neutral: 'none',
    };

    // State-based effects
    const stateStyles: Record<string, React.CSSProperties> = {
        idle: {},
        attacking: { filter: 'brightness(1.3)', transform: `scale(${scale * 1.1})` },
        defending: { filter: 'brightness(0.8) saturate(0.8)' },
        casting: { filter: 'brightness(1.2) contrast(1.1)' },
        wounded: { filter: 'grayscale(50%) brightness(0.7)' },
    };

    if (!spriteSrc) {
        // Placeholder when no sprite available
        return (
            <div
                className={cn('flex items-center justify-center bg-gray-700 text-gray-400 text-xs', className)}
                style={{ width: 200 * scale, height: 400 * scale }}
            >
                {type}
            </div>
        );
    }

    return (
        <Box
            display="inline-block"
            className={cn(
                'relative transition-all duration-200',
                selected && 'ring-2 ring-yellow-400 ring-offset-2',
                className
            )}
            style={{
                width: 200 * scale,
                height: 400 * scale,
            }}
        >
            <img
                src={spriteSrc}
                alt={`${type} character`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: team !== 'neutral' ? teamFilters[team] : stateStyles[state]?.filter,
                    ...stateStyles[state],
                }}
            />
        </Box>
    );
}

export default CharacterSprite;

// Re-export types
export type { UnitType as CharacterType };
