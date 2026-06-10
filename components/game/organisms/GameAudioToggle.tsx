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
import { Button } from '../../core/atoms';
import { cn } from '../../../lib/cn';
import { useGameAudioContextOptional } from './GameAudioProvider';
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
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}

// =============================================================================
// Component
// =============================================================================

 
export function GameAudioToggle({
    size = 'sm',
    className,
}: GameAudioToggleProps): React.JSX.Element {
    const ctx = useGameAudioContextOptional();
    const [localMuted, setLocalMuted] = useState(false);
    const muted = ctx ? ctx.muted : localMuted;
    const setMuted = ctx ? ctx.setMuted : setLocalMuted;

    const handleToggle = useCallback(() => {
        setMuted(!muted);
    }, [muted, setMuted]);

    return (
        <Button
            variant="ghost"
            size={size}
            onClick={handleToggle}
            className={cn('text-lg leading-none px-2', className)}
            aria-pressed={muted}
        >
            {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
        </Button>
    );
}

GameAudioToggle.displayName = 'GameAudioToggle';

export default GameAudioToggle;
