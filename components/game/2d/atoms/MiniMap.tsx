'use client';
import * as React from 'react';
import { cn } from '../../../../lib/cn';
import type { Rect } from '../../../core/atoms/types';

export interface MiniMapTile {
  x: number;
  y: number;
  color: string;
}

export interface MiniMapUnit {
  x: number;
  y: number;
  color: string;
  isPlayer?: boolean;
}

export interface MiniMapProps {
  /** Tile data: each tile renders as a 1px dot at (x,y) with the given color */
  tiles?: MiniMapTile[];
  /** Unit positions: each unit renders as a 2px dot */
  units?: MiniMapUnit[];
  /** Canvas display width in pixels */
  width?: number;
  /** Canvas display height in pixels */
  height?: number;
  /** Logical map width (for coordinate scaling) */
  mapWidth?: number;
  /** Logical map height (for coordinate scaling) */
  mapHeight?: number;
  /** Viewport rectangle outline */
  viewportRect?: Rect;
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_TILES: MiniMapTile[] = [
  { x: 10, y: 10, color: '#4ade80' },
  { x: 20, y: 15, color: '#4ade80' },
  { x: 30, y: 25, color: '#22c55e' },
  { x: 50, y: 40, color: '#4ade80' },
  { x: 60, y: 55, color: '#16a34a' },
  { x: 40, y: 60, color: '#4ade80' },
  { x: 70, y: 30, color: '#22c55e' },
  { x: 80, y: 70, color: '#4ade80' },
];
const DEFAULT_UNITS: MiniMapUnit[] = [
  { x: 30, y: 30, color: '#60a5fa', isPlayer: true },
];
const DEFAULT_VIEWPORT = { x: 20, y: 20, w: 40, h: 40 };

export function MiniMap({
  tiles = DEFAULT_TILES,
  units = DEFAULT_UNITS,
  width = 150,
  height = 150,
  mapWidth = 100,
  mapHeight = 100,
  viewportRect = DEFAULT_VIEWPORT,
  className,
}: MiniMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const frameRef = React.useRef<number>(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = width / mapWidth;
    const scaleY = height / mapHeight;
    let blinkOn = true;
    let animFrame: number;

    function draw() {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);

      // Tiles (1px dots)
      for (const tile of tiles) {
        ctx.fillStyle = tile.color;
        ctx.fillRect(
          Math.floor(tile.x * scaleX),
          Math.floor(tile.y * scaleY),
          Math.max(1, Math.ceil(scaleX)),
          Math.max(1, Math.ceil(scaleY))
        );
      }

      // Units (2px dots)
      for (const unit of units) {
        if (unit.isPlayer && !blinkOn) continue;
        ctx.fillStyle = unit.isPlayer ? '#ffffff' : unit.color;
        const ux = Math.floor(unit.x * scaleX) - 1;
        const uy = Math.floor(unit.y * scaleY) - 1;
        ctx.fillRect(ux, uy, 3, 3);
      }

      // Viewport rectangle
      if (viewportRect) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          Math.floor(viewportRect.x * scaleX),
          Math.floor(viewportRect.y * scaleY),
          Math.floor(viewportRect.w * scaleX),
          Math.floor(viewportRect.h * scaleY)
        );
      }
    }

    function tick() {
      frameRef.current++;
      // Blink every 30 frames (~500ms at 60fps)
      if (frameRef.current % 30 === 0) {
        blinkOn = !blinkOn;
      }
      draw();
      animFrame = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [tiles, units, width, height, mapWidth, mapHeight, viewportRect]);

  return (
    <div
      className={cn(
        'relative inline-block border border-border/20 rounded-container',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        style={{ width, height }}
      />
    </div>
  );
}

MiniMap.displayName = 'MiniMap';
