/**
 * GameAudioProvider
 *
 * Context provider that wires the audio system to the Almadar event bus.
 * Wrap your game organism with this provider, then emit:
 *
 *   emit('UI:PLAY_SOUND', { key: 'footstep' })
 *
 * from anywhere inside the tree and the corresponding sound will play.
 *
 * The provider also exposes `muted`/`setMuted` and `masterVolume`/
 * `setMasterVolume` via the `GameAudioContext` for toggle buttons.
 *
 * Closed-circuit props (`className`, `isLoading`, `error`, `entity`) are
 * accepted but intentionally unused — the provider renders only its children.
 *
 * @packageDocumentation
 */
import React from 'react';
import { type AudioManifest, type GameAudioControls } from './hooks/useGameAudio';
export type GameAudioContextValue = Pick<GameAudioControls, 'muted' | 'setMuted' | 'masterVolume' | 'setMasterVolume' | 'play' | 'playMusic' | 'stopMusic'>;
export declare const GameAudioContext: React.Context<GameAudioContextValue | null>;
/**
 * Access the game audio context.
 * Must be called from within a `<GameAudioProvider>` tree.
 */
export declare function useGameAudioContext(): GameAudioContextValue;
export interface GameAudioProviderProps {
    /** Sound manifest — keys mapped to SoundEntry definitions */
    manifest: AudioManifest;
    /** Base URL prepended to all sound paths (default '') */
    baseUrl?: string;
    /** Children to render */
    children: React.ReactNode;
    /** Initial muted state */
    initialMuted?: boolean;
    /** Closed-circuit props (unused, accepted for runtime compatibility) */
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
export declare function GameAudioProvider({ manifest, baseUrl, children, initialMuted, }: GameAudioProviderProps): React.JSX.Element;
export declare namespace GameAudioProvider {
    var displayName: string;
}
export default GameAudioProvider;
