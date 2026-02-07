/**
 * GameBar Atom
 *
 * Progress bar using themed bar image assets with ProgressBar fallback.
 * Bar images are ~804x131px ornate bars that get clipped proportionally.
 */

import React from 'react';
import { Box, ProgressBar, Typography, cn } from '@almadar/ui';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIBarUrl, GameUIBarType } from '../assets';

export interface GameBarProps {
    /** Current value */
    value: number;
    /** Maximum value */
    max: number;
    /** Bar type determines which asset and fallback color to use */
    type: GameUIBarType;
    /** Show value label (e.g. "45/100") */
    showLabel?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Additional CSS classes */
    className?: string;
}

const FALLBACK_VARIANTS: Record<GameUIBarType, 'success' | 'warning' | 'primary'> = {
    health: 'success',
    xp: 'warning',
    gold: 'warning',
    resonance: 'primary',
};

/**
 * GameBar displays a themed progress bar using ornate bar image assets.
 * Falls back to standard ProgressBar when assets aren't available.
 */
export function GameBar({
    value,
    max,
    type,
    showLabel = true,
    size = 'md',
    className,
}: GameBarProps): JSX.Element {
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const barUrl = getGameUIBarUrl(manifest, type);
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    const h = size === 'sm' ? 'h-5' : 'h-7';

    if (!barUrl) {
        return (
            <Box className={cn('relative', className)}>
                <ProgressBar
                    value={value}
                    max={max}
                    variant={FALLBACK_VARIANTS[type]}
                    showText={false}
                    className={h}
                />
                {showLabel && (
                    <Typography
                        variant="caption"
                        className="absolute inset-0 flex items-center justify-center text-foreground font-medium text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                    >
                        {value}/{max}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box className={cn('relative overflow-hidden rounded', h, className)}>
            {/* Dimmed full bar as background */}
            <Box
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `url(${barUrl})`,
                    backgroundSize: '100% 100%',
                }}
            />
            {/* Bright fill portion clipped to value percentage */}
            <Box
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${barUrl})`,
                    backgroundSize: `${(100 / percent) * 100}% 100%`,
                    backgroundPosition: 'left center',
                    clipPath: `inset(0 ${100 - percent}% 0 0)`,
                }}
            />
            {/* Label */}
            {showLabel && (
                <Typography
                    variant="caption"
                    className="absolute inset-0 flex items-center justify-center text-foreground font-medium text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] z-10"
                >
                    {value}/{max}
                </Typography>
            )}
        </Box>
    );
}

GameBar.displayName = 'GameBar';

export default GameBar;
