'use client';
/**
 * Sprite Component
 *
 * Renders a single frame from a spritesheet with transform support.
 */

import React, { useMemo } from 'react';
import type { EventKey, Asset } from "@almadar/core";
import type { AnimationName } from '../shared/spriteAnimationTypes';
import { useEventBus } from '../../../hooks/useEventBus';
import { Box } from '../../core/atoms/Box';
import { frameRect } from '../shared/spriteAnimation';

export interface SpriteProps {
  /** Spritesheet asset */
  spritesheet: Asset;
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
  /** Animation state name — drives lolo-ui config knob for animation selection */
  animState?: AnimationName;
  /** Frames per second — drives lolo-ui config knob for animation speed */
  frameRate?: number;
  /** Optional className */
  className?: string;
  /** Optional onClick handler */
  onClick?: () => void;
  /** Declarative event name emitted on click via useEventBus */
  action?: EventKey;
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
const DEFAULT_SPRITESHEET: Asset = {
  url: 'https://almadar-kflow-assets.web.app/shared/isometric-blocks/Spritesheet/allTiles_sheet.png',
  role: 'tile',
  category: 'tile',
};

export function Sprite({
  spritesheet = DEFAULT_SPRITESHEET,
  frameWidth = 64,
  frameHeight = 64,
  frame = 0,
  x = 0,
  y = 0,
  scale = 1,
  flipX = false,
  flipY = false,
  rotation = 0,
  opacity = 1,
  zIndex = 0,
  columns = 16,
  animState: _animState,
  frameRate: _frameRate,
  className,
  onClick,
  action,
}: SpriteProps): React.JSX.Element {
  const eventBus = useEventBus();
  // Calculate source position in spritesheet
  const sourcePosition = useMemo(() => {
    const { sx, sy } = frameRect(frame, Math.floor(frame / columns), columns, frameWidth, frameHeight);
    return { x: sx, y: sy };
  }, [frame, columns, frameWidth, frameHeight]);

  // Build transform string
  const transform = useMemo(() => {
    const transforms: string[] = [
      `translate(${x}px, ${y}px)`,
    ];

    if (scale !== 1) {
      transforms.push(`scale(${scale})`);
    }

    if (flipX || flipY) {
      transforms.push(`scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`);
    }

    if (rotation !== 0) {
      transforms.push(`rotate(${rotation}deg)`);
    }

    return transforms.join(' ');
  }, [x, y, scale, flipX, flipY, rotation]);

  // Background position for spritesheet clipping
  const backgroundPosition = `-${sourcePosition.x}px -${sourcePosition.y}px`;

  const handleClick = () => {
    if (action) eventBus.emit(`UI:${action}`, {});
    onClick?.();
  };

  return (
    <Box
      position="absolute"
      className={className}
      onClick={(action || onClick) ? handleClick : undefined}
      style={{
        width: frameWidth,
        height: frameHeight,
        backgroundImage: `url(${spritesheet.url})`,
        backgroundPosition,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        transform,
        transformOrigin: 'center center',
        opacity,
        zIndex,
        pointerEvents: (action || onClick) ? 'auto' : 'none',
      }}
    />
  );
}

/**
 * Canvas-based sprite renderer for better performance in game loops
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  props: Omit<SpriteProps, 'spritesheet' | 'className' | 'onClick'>
): void {
  const {
    frameWidth,
    frameHeight,
    frame,
    x,
    y,
    scale = 1,
    flipX = false,
    flipY = false,
    rotation = 0,
    opacity = 1,
    columns = 16,
  } = props;

  // Calculate source position
  const { sx: sourceX, sy: sourceY } = frameRect(frame, Math.floor(frame / columns), columns, frameWidth, frameHeight);

  // Save context state
  ctx.save();

  // Apply transforms
  ctx.globalAlpha = opacity;
  ctx.translate(x + frameWidth / 2, y + frameHeight / 2);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  ctx.scale(scale * (flipX ? -1 : 1), scale * (flipY ? -1 : 1));

  // Draw sprite
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    frameWidth,
    frameHeight,
    -frameWidth / 2,
    -frameHeight / 2,
    frameWidth,
    frameHeight
  );

  // Restore context state
  ctx.restore();
}

export default Sprite;
