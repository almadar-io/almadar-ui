export interface SoundEntry {
    /** Single path or array of paths — array picks randomly on each play */
    path: string | string[];
    /** Volume 0–1 (multiplied by masterVolume; default 1) */
    volume?: number;
    /** Whether this sound loops (background music) */
    loop?: boolean;
    /** Number of concurrent Audio instances in the pool (default 1) */
    poolSize?: number;
    /** Start automatically on first user interaction */
    autostart?: boolean;
    /** Use crossfade transitions when played via playMusic() */
    crossfade?: boolean;
    /** Crossfade duration in ms (default 1500) */
    crossfadeDurationMs?: number;
}
export type AudioManifest = Record<string, SoundEntry>;
export interface GameAudioControls {
    /** Play a sound effect (instant, pooled) */
    play: (key: string) => void;
    /** Stop all instances of a sound effect */
    stop: (key: string) => void;
    /** Stop all sounds including music */
    stopAll: () => void;
    /** Crossfade to a new music track */
    playMusic: (key: string) => void;
    /** Fade out and stop the current music */
    stopMusic: (fadeDurationMs?: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
    masterVolume: number;
    setMasterVolume: (volume: number) => void;
}
export interface UseGameAudioOptions {
    /** Sound definitions keyed by logical name */
    manifest: AudioManifest;
    /** Prefix prepended to all `path` values (default '') */
    baseUrl?: string;
    /** Start muted (default false) */
    initialMuted?: boolean;
    /** Master volume 0–1 (default 1) */
    initialVolume?: number;
}
export declare function useGameAudio({ manifest, baseUrl, initialMuted, initialVolume, }: UseGameAudioOptions): GameAudioControls;
export declare namespace useGameAudio {
    var displayName: string;
}
