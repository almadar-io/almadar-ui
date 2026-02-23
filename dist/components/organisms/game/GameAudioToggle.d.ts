/**
 * GameAudioToggle
 *
 * A small mute/unmute button for game HUDs.
 * Must be rendered inside a <GameAudioProvider> tree.
 *
 * Shows 🔊 when sound is on and 🔇 when muted.
 *
 * @packageDocumentation
 */
import React from 'react';
export interface GameAudioToggleProps {
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Loading state (passed through) */
    isLoading?: boolean;
    /** Error state (passed through) */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
export declare function GameAudioToggle({ size, className, }: GameAudioToggleProps): React.JSX.Element;
export declare namespace GameAudioToggle {
    var displayName: string;
}
export default GameAudioToggle;
