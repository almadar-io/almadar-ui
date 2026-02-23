/**
 * CanvasEffect Component
 *
 * Renders animated visual effects using a `<canvas>` element with
 * sprite-based particles, frame-sequence animations, and overlays.
 * This is a render-ui pattern that can be placed in any slot —
 * it renders on top of whatever occupies that slot.
 *
 * Pattern: canvas-effect
 *
 * When an EffectAssetManifest is provided (via assetManifest prop),
 * the component uses the full particle engine with tinted sprites.
 * Without a manifest, it falls back to emoji-based rendering.
 *
 * **State categories (closed-circuit compliant):**
 * - Configuration (actionType, position, duration, manifest) → received via props
 * - Animation state (particles, shake, flash, RAF loop, phase timers) → local only
 * - Completion event → emitted via `useEventBus()` for trait integration
 *
 * This is an **ephemeral fire-and-forget** animation component.  All
 * internal state is rendering-only (particle physics, screen shake decay,
 * flash alpha, emoji phase timers).  No game logic lives here.
 *
 * @packageDocumentation
 */
import * as React from 'react';
import type { CombatActionType, EffectAssetManifest } from './types/effects';
export type { CombatActionType } from './types/effects';
export type { EffectAssetManifest } from './types/effects';
export interface CanvasEffectProps {
    /** The type of combat action to visualise */
    actionType: CombatActionType;
    /** Screen-space X position (center of the effect) */
    x: number;
    /** Screen-space Y position (center of the effect) */
    y: number;
    /** Duration in ms before auto-dismiss (default 2000 for canvas, 800 for emoji) */
    duration?: number;
    /** Optional intensity multiplier (1 = normal, 2 = double size/brightness) */
    intensity?: number;
    /** Callback when the effect animation completes */
    onComplete?: () => void;
    /** Declarative event: emits UI:{completeEvent} when the effect animation completes */
    completeEvent?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Sprite URL for the effect (emoji fallback mode).
     *  When set without assetManifest, renders this image instead of emoji. */
    effectSpriteUrl?: string;
    /** Base URL for remote assets. Prepended to relative effectSpriteUrl paths. */
    assetBaseUrl?: string;
    /** Full effect asset manifest for the sprite particle engine.
     *  When provided, enables the canvas-based particle system. */
    assetManifest?: EffectAssetManifest;
    /** Canvas width (default 400) */
    width?: number;
    /** Canvas height (default 300) */
    height?: number;
}
export declare function CanvasEffect(props: CanvasEffectProps): React.JSX.Element | null;
export declare namespace CanvasEffect {
    var displayName: string;
}
export default CanvasEffect;
