'use client';
import * as React from 'react';
import type { AssetUrl } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { useEmitEvent } from '../../../hooks/useEventBus';

export interface GameCanvas2DProps {
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** Called each frame with the 2D context and current frame count */
  onDraw?: (ctx: CanvasRenderingContext2D, frame: number) => void;
  /** Called each tick with delta time in seconds */
  onTick?: (dt: number) => void;
  /** Event name emitted each tick with { dt, frame } — for closed-circuit .orb integration */
  tickEvent?: string;
  /** Event name emitted each draw frame with { frame } — for closed-circuit .orb integration */
  drawEvent?: string;
  /** Target frames per second */
  fps?: number;
  /** Background image URL */
  backgroundImage?: AssetUrl;
  /** Base URL prefix for asset URLs */
  assetBaseUrl?: AssetUrl;
  /** Additional CSS classes */
  className?: string;
}

export function GameCanvas2D({
  width = 800,
  height = 600,
  onDraw,
  onTick,
  tickEvent,
  drawEvent,
  fps = 60,
  backgroundImage = "",
  assetBaseUrl = "https://almadar-kflow-assets.web.app/shared/",
  className,
}: GameCanvas2DProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number>(0);
  const frameRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const imageCache = React.useRef<Map<string, HTMLImageElement>>(new Map());
  const emit = useEmitEvent();

  // Store callbacks and mutable props in refs to avoid re-creating the animation loop
  const onDrawRef = React.useRef(onDraw);
  onDrawRef.current = onDraw;

  const onTickRef = React.useRef(onTick);
  onTickRef.current = onTick;

  const tickEventRef = React.useRef(tickEvent);
  tickEventRef.current = tickEvent;

  const drawEventRef = React.useRef(drawEvent);
  drawEventRef.current = drawEvent;

  const emitRef = React.useRef(emit);
  emitRef.current = emit;

  const assetBaseUrlRef = React.useRef(assetBaseUrl);
  assetBaseUrlRef.current = assetBaseUrl;

  const backgroundImageRef = React.useRef(backgroundImage);
  backgroundImageRef.current = backgroundImage;

  const widthRef = React.useRef(width);
  widthRef.current = width;

  const heightRef = React.useRef(height);
  heightRef.current = height;

  const loadImage = React.useCallback((url: string): HTMLImageElement | null => {
    const fullUrl = url.startsWith('http') ? url : `${assetBaseUrlRef.current}${url}`;
    const cached = imageCache.current.get(fullUrl);
    if (cached?.complete && cached.naturalWidth > 0) return cached;
    if (!cached) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullUrl;
      imageCache.current.set(fullUrl, img);
    }
    return null;
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = 1000 / fps;
    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= interval) {
        const dt = elapsed / 1000;
        lastTimeRef.current = timestamp - (elapsed % interval);
        const frame = frameRef.current;

        onTickRef.current?.(dt);
        if (tickEventRef.current) {
          emitRef.current(tickEventRef.current, { dt, frame });
        }

        if (backgroundImageRef.current) {
          const bgImg = loadImage(backgroundImageRef.current);
          if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, widthRef.current, heightRef.current);
          } else {
            // Image not loaded yet (or failed): paint a solid fallback so the
            // canvas is never a blank flash. The continuous rAF loop redraws the
            // real image on a later frame once it finishes loading.
            ctx.fillStyle = '#0f1420';
            ctx.fillRect(0, 0, widthRef.current, heightRef.current);
          }
        }

        onDrawRef.current?.(ctx, frame);
        if (drawEventRef.current) {
          emitRef.current(drawEventRef.current, { frame });
        }

        frameRef.current += 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [fps, loadImage]);

  return (
    <Box className={cn('inline-block', className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
      />
    </Box>
  );
}

GameCanvas2D.displayName = 'GameCanvas2D';
