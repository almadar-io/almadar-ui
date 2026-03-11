'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../atoms/Box';

export interface GameCanvas2DProps {
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** Called each frame with the 2D context and current frame count */
  onDraw?: (ctx: CanvasRenderingContext2D, frame: number) => void;
  /** Called each tick with delta time in seconds */
  onTick?: (dt: number) => void;
  /** Target frames per second */
  fps?: number;
  /** Additional CSS classes */
  className?: string;
}

export function GameCanvas2D({
  width = 800,
  height = 600,
  onDraw,
  onTick,
  fps = 60,
  className,
}: GameCanvas2DProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number>(0);
  const frameRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);

  // Store callbacks in refs to avoid re-creating the animation loop
  const onDrawRef = React.useRef(onDraw);
  onDrawRef.current = onDraw;

  const onTickRef = React.useRef(onTick);
  onTickRef.current = onTick;

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

        onTickRef.current?.(dt);
        onDrawRef.current?.(ctx, frameRef.current);
        frameRef.current += 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [fps]);

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
