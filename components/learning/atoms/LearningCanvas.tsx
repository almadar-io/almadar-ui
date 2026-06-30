'use client';

/**
 * LearningCanvas
 *
 * A pure, declarative HTML5 canvas atom for math and science visualizations.
 * Accepts a list of primitive shapes (line, arrow, circle, rect, polygon, path,
 * text, axis, grid) and renders them. Optional interactivity emits click/hover
 * events, and optional animation drives a continuous render loop.
 *
 * This is the foundational atom for the `learning/` behavior family.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import type { UiError } from '../../core/atoms/types';

export type LearningShapeType =
  | 'line'
  | 'arrow'
  | 'circle'
  | 'rect'
  | 'polygon'
  | 'path'
  | 'text'
  | 'axis'
  | 'grid';

export interface LearningPoint {
  x: number;
  y: number;
}

export interface LearningShape {
  type: LearningShapeType;
  /** Optional stable id for interaction payloads. */
  id?: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  width?: number;
  height?: number;
  points?: LearningPoint[];
  path?: string;
  text?: string;
  label?: string;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  fill?: string;
  lineWidth?: number;
  opacity?: number;
}

export interface LearningCanvasProps {
  /** Additional CSS classes. */
  className?: string;
  /** Canvas width in CSS pixels. */
  width?: number;
  /** Canvas height in CSS pixels. */
  height?: number;
  /** Background color (default transparent). */
  backgroundColor?: string;
  /** Declarative shapes to draw. */
  shapes?: LearningShape[];
  /** Enable pointer interaction (click/hover). */
  interactive?: boolean;
  /** Enable continuous redraw loop. */
  animate?: boolean;
  /** Clicked shape payload: { id?, type?, index }. */
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  /** Hovered shape payload: { id?, type?, index }. */
  onShapeHover?: (payload: { id?: string; type?: string; index: number }) => void;
  /** Loading state. */
  isLoading?: boolean;
  /** Error state. */
  error?: UiError | null;
}

function resolveColor(
  color: string | undefined,
  ctx: CanvasRenderingContext2D,
  fallback: string,
): string {
  if (!color) return fallback;
  if (color.startsWith('var(')) {
    // Canvas cannot resolve CSS variables directly; try to read from the canvas style.
    const style = (ctx.canvas as HTMLCanvasElement).style;
    const m = /^var\((--[^,)]+)(?:,\s*([^)]+))?\)$/.exec(color);
    if (m) {
      const computed = getComputedStyle(ctx.canvas).getPropertyValue(m[1]).trim();
      return computed || m[2]?.trim() || fallback;
    }
  }
  return color;
}

function shapeBounds(shape: LearningShape): { x: number; y: number; w: number; h: number } | null {
  switch (shape.type) {
    case 'line':
    case 'arrow':
      if (shape.x1 == null || shape.y1 == null || shape.x2 == null || shape.y2 == null) return null;
      return {
        x: Math.min(shape.x1, shape.x2) - 6,
        y: Math.min(shape.y1, shape.y2) - 6,
        w: Math.abs(shape.x2 - shape.x1) + 12,
        h: Math.abs(shape.y2 - shape.y1) + 12,
      };
    case 'circle':
      if (shape.x == null || shape.y == null || shape.radius == null) return null;
      return {
        x: shape.x - shape.radius - 4,
        y: shape.y - shape.radius - 4,
        w: shape.radius * 2 + 8,
        h: shape.radius * 2 + 8,
      };
    case 'rect':
      if (shape.x == null || shape.y == null || shape.width == null || shape.height == null) return null;
      return { x: shape.x - 4, y: shape.y - 4, w: shape.width + 8, h: shape.height + 8 };
    case 'polygon':
      if (!shape.points || shape.points.length === 0) return null;
      {
        const xs = shape.points.map((p) => p.x);
        const ys = shape.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        return {
          x: minX - 4,
          y: minY - 4,
          w: Math.max(...xs) - minX + 8,
          h: Math.max(...ys) - minY + 8,
        };
      }
    case 'text':
      if (shape.x == null || shape.y == null) return null;
      return { x: shape.x - 4, y: shape.y - (shape.fontSize ?? 14) - 4, w: 120, h: (shape.fontSize ?? 14) + 8 };
    default:
      return null;
  }
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: LearningShape,
  width: number,
  height: number,
) {
  ctx.save();
  const opacity = shape.opacity ?? 1;
  ctx.globalAlpha = opacity;
  const stroke = resolveColor(shape.color, ctx, '#333333');
  const fill = shape.fill ? resolveColor(shape.fill, ctx, '#cccccc') : undefined;
  ctx.lineWidth = shape.lineWidth ?? 2;

  switch (shape.type) {
    case 'grid': {
      const step = shape.step ?? 40;
      ctx.strokeStyle = stroke;
      ctx.globalAlpha = opacity * 0.25;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      break;
    }
    case 'axis': {
      const axis = shape.axis ?? 'x';
      ctx.strokeStyle = stroke;
      ctx.lineWidth = shape.lineWidth ?? 2;
      ctx.beginPath();
      if (axis === 'x') {
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
      } else {
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
      }
      ctx.stroke();
      break;
    }
    case 'line': {
      if (shape.x1 == null || shape.y1 == null || shape.x2 == null || shape.y2 == null) break;
      ctx.strokeStyle = stroke;
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      if (shape.x1 == null || shape.y1 == null || shape.x2 == null || shape.y2 == null) break;
      ctx.strokeStyle = stroke;
      ctx.fillStyle = stroke;
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      drawArrowHead(ctx, shape.x1, shape.y1, shape.x2, shape.y2, 10);
      break;
    }
    case 'circle': {
      if (shape.x == null || shape.y == null || shape.radius == null) break;
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.strokeStyle = stroke;
      ctx.stroke();
      break;
    }
    case 'rect': {
      if (shape.x == null || shape.y == null || shape.width == null || shape.height == null) break;
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      ctx.strokeStyle = stroke;
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;
    }
    case 'polygon': {
      if (!shape.points || shape.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.strokeStyle = stroke;
      ctx.stroke();
      break;
    }
    case 'path': {
      if (!shape.path) break;
      const p = new Path2D(shape.path);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill(p);
      }
      ctx.strokeStyle = stroke;
      ctx.stroke(p);
      break;
    }
    case 'text': {
      if (shape.x == null || shape.y == null || !shape.text) break;
      ctx.fillStyle = stroke;
      ctx.font = `${shape.fontSize ?? 14}px system-ui, sans-serif`;
      ctx.textAlign = shape.align ?? 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.text, shape.x, shape.y);
      break;
    }
  }

  ctx.restore();
}

export const LearningCanvas: React.FC<LearningCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  backgroundColor,
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  onShapeHover,
  isLoading,
  error,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventBus = useEventBus();
  const animRef = useRef<number>(0);
  const hoverIndexRef = useRef<number>(-1);

  const findShapeAt = useCallback((clientX: number, clientY: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Search in reverse so top-most shape wins.
    for (let i = shapes.length - 1; i >= 0; i--) {
      const b = shapeBounds(shapes[i]);
      if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        return i;
      }
    }
    return -1;
  }, [shapes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    for (const shape of shapes) {
      drawShape(ctx, shape, width, height);
    }
  }, [width, height, backgroundColor, shapes]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!animate) return;
    const loop = () => {
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, draw]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const idx = findShapeAt(e.clientX, e.clientY);
      if (idx !== hoverIndexRef.current) {
        hoverIndexRef.current = idx;
        if (idx >= 0) {
          const shape = shapes[idx];
          const payload = { id: shape.id, type: shape.type, index: idx };
          if (onShapeHover) onShapeHover(payload);
          else if (eventBus) eventBus.emit(`UI:SHAPE_HOVER`, payload);
        }
      }
    },
    [interactive, onShapeHover, eventBus, findShapeAt, shapes],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const idx = findShapeAt(e.clientX, e.clientY);
      if (idx >= 0) {
        const shape = shapes[idx];
        const payload = { id: shape.id, type: shape.type, index: idx };
        if (onShapeClick) onShapeClick(payload);
        else if (eventBus) eventBus.emit(`UI:SHAPE_CLICK`, payload);
      }
    },
    [interactive, onShapeClick, eventBus, findShapeAt, shapes],
  );

  if (isLoading || error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded border border-border bg-surface',
          className,
        )}
        style={{ width, height }}
      >
        {error ? (
          <span className="text-sm text-destructive">{error.message}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Loading canvas…</span>
        )}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('block touch-none rounded border border-border', className)}
      style={{ width, height }}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
    />
  );
};
