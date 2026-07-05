'use client';
/**
 * GameAudioToggle
 *
 * A small mute/unmute button for game HUDs. Self-contained: inside a
 * <GameAudioProvider> it drives the shared audio state; standalone it falls back
 * to a local muted state so it renders without a provider (the provider is an
 * implementation detail, not a precondition).
 *
 * Shows 🔊 when sound is on and 🔇 when muted.
 *
 * @packageDocumentation
 */

import React, { useCallback, useState } from 'react';
import type { Asset } from '@almadar/core';
import { Button } from '../../core/atoms/index';
import { cn } from '../../../lib/cn';
import { useGameAudioContextOptional } from '../providers/GameAudioProvider';
import { GameIcon } from './GameIcon';
import type { UiError } from '../../core/atoms/types';

// =============================================================================
// Props
// =============================================================================

export interface GameAudioToggleProps {
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Loading state (passed through) */
    isLoading?: boolean;
    /** Error state (passed through) */
    error?: UiError | null;
    /** Asset rendered when sound is ON. Falls back to 🔊 emoji. */
    onAsset?: Asset;
    /** Asset rendered when sound is OFF (muted). Falls back to 🔇 emoji. */
    offAsset?: Asset;
    /** Entity name for schema-driven auto-fetch */
}

// =============================================================================
// Component
// =============================================================================


export function GameAudioToggle({
    size = 'sm',
    className,
    onAsset,
    offAsset,
}: GameAudioToggleProps): React.JSX.Element {
    const ctx = useGameAudioContextOptional();
    const [localMuted, setLocalMuted] = useState(false);
    const muted = ctx ? ctx.muted : localMuted;
    const setMuted = ctx ? ctx.setMuted : setLocalMuted;

    const handleToggle = useCallback(() => {
        setMuted(!muted);
    }, [muted, setMuted]);

    const activeAsset = muted ? offAsset : onAsset;

    return (
        <Button
            variant="ghost"
            size={size}
            onClick={handleToggle}
            className={cn('text-lg leading-none px-2', className)}
            aria-pressed={muted}
        >
            {activeAsset ? (
                <GameIcon assetUrl={activeAsset} icon="image" size={20} alt={muted ? 'Muted' : 'Sound on'} className="w-5 h-5 object-contain" />
            ) : (
                muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'
            )}
        </Button>
    );
}

GameAudioToggle.displayName = 'GameAudioToggle';

export default GameAudioToggle;
