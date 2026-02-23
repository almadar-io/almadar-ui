/**
 * Sprite Component
 *
 * Renders a single frame from a spritesheet with transform support.
 */
import React from 'react';
export interface SpriteProps {
    /** Spritesheet image URL */
    spritesheet: string;
    /** Width of each frame in pixels */
    frameWidth: number;
    /** Height of each frame in pixels */
    frameHeight: number;
    /** Frame index to display (0-based, left-to-right, top-to-bottom) */
    frame: number;
    /** X position in pixels */
    x: number;
    /** Y position in pixels */
    y: number;
    /** Scale factor (default: 1) */
    scale?: number;
    /** Flip horizontally */
    flipX?: boolean;
    /** Flip vertically */
    flipY?: boolean;
    /** Rotation in degrees */
    rotation?: number;
    /** Opacity (0-1) */
    opacity?: number;
    /** Z-index for layering */
    zIndex?: number;
    /** Number of columns in spritesheet (for frame calculation) */
    columns?: number;
    /** Optional className */
    className?: string;
    /** Optional onClick handler */
    onClick?: () => void;
    /** Declarative event name emitted on click via useEventBus */
    action?: string;
}
/**
 * Sprite component for rendering spritesheet frames
 *
 * @example
 * ```tsx
 * <Sprite
 *   spritesheet="/sprites/player.png"
 *   frameWidth={32}
 *   frameHeight={32}
 *   frame={currentFrame}
 *   x={player.x}
 *   y={player.y}
 *   flipX={player.facingLeft}
 *   scale={2}
 * />
 * ```
 */
export declare function Sprite({ spritesheet, frameWidth, frameHeight, frame, x, y, scale, flipX, flipY, rotation, opacity, zIndex, columns, className, onClick, action, }: SpriteProps): React.JSX.Element;
/**
 * Canvas-based sprite renderer for better performance in game loops
 */
export declare function drawSprite(ctx: CanvasRenderingContext2D, image: HTMLImageElement, props: Omit<SpriteProps, 'spritesheet' | 'className' | 'onClick'>): void;
export default Sprite;
