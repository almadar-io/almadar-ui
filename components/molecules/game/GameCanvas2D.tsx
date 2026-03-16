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

  // Default placeholder when no onDraw is provided (standalone mode)
  const defaultDraw = React.useCallback((ctx: CanvasRenderingContext2D, frame: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    // Grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Animated dot
    const cx = w / 2 + Math.cos(frame * 0.03) * 80;
    const cy = h / 2 + Math.sin(frame * 0.03) * 80;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#e94560';
    ctx.fill();
    // Label
    ctx.fillStyle = '#eee';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Canvas 2D', w / 2, 30);
    ctx.fillText(`Frame: ${frame}`, w / 2, h - 15);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = 1000 / fps;
    let running = true;

    const drawFn = onDrawRef.current ?? defaultDraw;

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
        (onDrawRef.current ?? defaultDraw)(ctx, frameRef.current);
        frameRef.current += 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [fps, defaultDraw]);

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
