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
import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { cn } from '../../../lib/cn';
import { perfEnd, perfStart } from '../../../lib/perf';
import { useEventBus } from '../../../hooks/useEventBus';
import type { UiError } from '../../core/atoms/types';
import { createWebPainter } from '../../../lib/webPainter2d';
import { paintDrawable, type DrawableNode } from '../../../lib/drawable/paintDispatch';
import type { Projector } from '../../../lib/drawable/contract';

/** Canvas 2D `ctx.font` cannot resolve CSS vars — read the theme contract's
 *  body slot off the element so in-canvas text follows the active theme. */
function themeBodyFont(el: HTMLCanvasElement): string {
  if (typeof getComputedStyle !== 'function') return 'system-ui, sans-serif';
  const v = getComputedStyle(el).getPropertyValue('--font-family-body').trim();
  return v || 'system-ui, sans-serif';
}

export type LearningShapeType =
  | 'line'
  | 'arrow'
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'polygon'
  | 'path'
  | 'text'
  | 'axis'
  | 'grid'
  | 'venn-region';

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
  /** Optional font family for this text shape; falls back to the canvas prop, then the theme body font. */
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  axis?: 'x' | 'y';
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  fill?: string;
  lineWidth?: number;
  opacity?: number;
  /** Ellipse arc start, in degrees (screen convention: 0 = +x, clockwise). Omit with `endAngle` for a full ellipse. */
  startAngle?: number;
  /** Ellipse arc end, in degrees (screen convention: 0 = +x, clockwise). Omit with `startAngle` for a full ellipse. */
  endAngle?: number;
  /** Stroke dash style for line/arrow/circle/rect/polygon/path/ellipse strokes; omit or 'solid' for a solid line. */
  dash?: 'solid' | 'dashed' | 'dotted';
  /** venn-region only: ids of sibling `circle` shapes; the filled region is the INTERSECTION of these circles. */
  inside?: string[];
  /** venn-region only: ids of sibling `circle` shapes SUBTRACTED from the `inside` intersection (true lens/exclusion shading). */
  outside?: string[];
}

/** A single top-right status chip (e.g. a live measurement or score). */
export interface LearningReadout {
  /** Chip label, shown before the value. */
  label: string;
  /** Chip value, shown after the label. */
  value: string | number;
  /** Chip fill/border color (default '#334155'). */
  color?: string;
}

/** One plotted line within a trace panel. */
export interface LearningTraceSeries {
  /** Time-series samples in world/data coordinates. */
  samples: LearningPoint[];
  /** Series line + dot color (defaults from TRACE_SERIES_COLORS by index). */
  color?: string;
  /** Series label drawn top-left inside the panel. */
  label?: string;
}

/**
 * A minimal in-canvas sparkline inset — no ticks/grid/legend. For real axes, compose
 * a MathCanvas instead.
 */
export interface LearningTracePanel {
  /** Panel left edge (default anchors bottom-right, stacked upward per panel index). */
  x?: number;
  /** Panel top edge. */
  y?: number;
  /** Panel width (default 32% of canvas width). */
  width?: number;
  /** Panel height (default 28% of canvas height). */
  height?: number;
  /** Series drawn in this panel, auto-scaled to their combined extent. */
  series: LearningTraceSeries[];
  /** Bottom-right inside label, e.g. the x-axis quantity. */
  xLabel?: string;
  /** Top-right inside label, e.g. the y-axis quantity. */
  yLabel?: string;
  /** Panel border color (default '#94a3b8'). */
  frameColor?: string;
  /** Panel fill color (default '#ffffff'). */
  backgroundColor?: string;
  /** Panel fill opacity (default 0.85). */
  backgroundOpacity?: number;
}

const DASH_PATTERNS = { dashed: [6, 4], dotted: [2, 3] } as const;

const TRACE_SERIES_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b'];

export interface LearningCanvasProps {
  /** Additional CSS classes. */
  className?: string;
  /** Canvas width in CSS pixels. */
  width?: number;
  /** Canvas height in CSS pixels. */
  height?: number;
  /** Background color (default transparent). */
  backgroundColor?: string;
  /** Canvas text font family. Falls back to the theme's --font-family-body. */
  fontFamily?: string;
  /** Declarative shapes to draw. */
  shapes?: LearningShape[];
  /**
   * Neutral game-canvas drawables (e.g. `draw-sprite`, `draw-fx-layer`) painted
   * in world coordinates via the supplied `projector`. This lets the learning
   * canvas reuse the game drawable vocabulary without reimplementing sprites/FX.
   */
  drawables?: DrawableNode[];
  /**
   * World-to-pixel projector for `drawables`. When absent, `drawables` are ignored.
   */
  projector?: Projector;
  /**
   * Top-right status chip row (live measurements, scores, counters).
   * @synonyms chips, stats, measurements
   */
  readouts?: LearningReadout[];
  /**
   * Inset sparkline panels stacked from the bottom-right corner.
   * @synonyms sparkline, time series, history plot
   */
  traces?: LearningTracePanel[];
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
    case 'ellipse':
      if (shape.x == null || shape.y == null || shape.width == null || shape.height == null) return null;
      return {
        x: shape.x - shape.width / 2 - 4,
        y: shape.y - shape.height / 2 - 4,
        w: shape.width + 8,
        h: shape.height + 8,
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
  allShapes: readonly LearningShape[],
  fontFamily?: string,
) {
  ctx.save();
  const opacity = shape.opacity ?? 1;
  ctx.globalAlpha = opacity;
  const stroke = resolveColor(shape.color, ctx, '#333333');
  const fill = shape.fill ? resolveColor(shape.fill, ctx, '#cccccc') : undefined;
  ctx.lineWidth = shape.lineWidth ?? 2;
  if (shape.dash && shape.dash !== 'solid') ctx.setLineDash([...DASH_PATTERNS[shape.dash]]);

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
    case 'ellipse': {
      if (shape.x == null || shape.y == null || shape.width == null || shape.height == null) break;
      const startAngle = ((shape.startAngle ?? 0) * Math.PI) / 180;
      const endAngle = ((shape.endAngle ?? 360) * Math.PI) / 180;
      ctx.beginPath();
      ctx.ellipse(shape.x, shape.y, shape.width / 2, shape.height / 2, 0, startAngle, endAngle);
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
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
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
      ctx.font = `${shape.fontSize ?? 14}px ${shape.fontFamily ?? fontFamily ?? themeBodyFont(ctx.canvas)}`;
      ctx.textAlign = shape.align ?? 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.text, shape.x, shape.y);
      break;
    }
    case 'venn-region': {
      // True boolean circle-region fill: intersection of the `inside` circles
      // minus the union of the `outside` circles, composited via an offscreen
      // canvas (successive clips intersect; destination-out punches exactly,
      // even where outside circles overlap each other — an evenodd path
      // cannot express that).
      const resolveCircles = (ids?: string[]) =>
        (ids ?? []).flatMap((id) => {
          const c = allShapes.find((s) => s.type === 'circle' && s.id === id);
          return c && c.x != null && c.y != null && c.radius != null
            ? [{ x: c.x, y: c.y, radius: c.radius }]
            : [];
        });
      const inside = resolveCircles(shape.inside);
      if (inside.length === 0) break;
      const outside = resolveCircles(shape.outside);
      const off = document.createElement('canvas');
      off.width = ctx.canvas.width;
      off.height = ctx.canvas.height;
      const octx = off.getContext('2d');
      if (!octx) break;
      octx.setTransform(ctx.getTransform());
      for (const c of inside) {
        const p = new Path2D();
        p.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        octx.clip(p);
      }
      octx.fillStyle = fill ?? stroke;
      octx.fillRect(0, 0, width, height);
      octx.globalCompositeOperation = 'destination-out';
      for (const c of outside) {
        const p = new Path2D();
        p.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        octx.fill(p);
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}

function readoutShapes(readouts: LearningReadout[], width: number, fontFamily?: string): LearningShape[] {
  const out: LearningShape[] = [];
  const chipH = 18;
  const gap = 6;
  let rightEdge = width - 6;
  let rowY = 6;
  for (const readout of readouts) {
    const text = `${readout.label}: ${String(readout.value)}`;
    const chipW = Math.min(170, Math.max(34, text.length * 6 + 12));
    let chipX = rightEdge - chipW;
    if (chipX < 4) {
      rowY += chipH + 4;
      rightEdge = width - 6;
      chipX = rightEdge - chipW;
    }
    const color = readout.color ?? '#334155';
    out.push({ type: 'rect', x: chipX, y: rowY, width: chipW, height: chipH, color, fill: color });
    out.push({
      type: 'text',
      x: chipX + chipW / 2,
      y: rowY + chipH / 2,
      text,
      color: '#ffffff',
      fontSize: 10,
      align: 'center',
      fontFamily,
    });
    rightEdge = chipX - gap;
  }
  return out;
}

function traceShapes(panel: LearningTracePanel, k: number, width: number, height: number, fontFamily?: string): LearningShape[] {
  const w = panel.width ?? Math.round(width * 0.32);
  const h = panel.height ?? Math.round(height * 0.28);
  const x = panel.x ?? width - w - 8;
  const y = panel.y ?? height - h - 8 - k * (h + 8);

  const allSamples = panel.series.flatMap((series) => series.samples);
  let xLo = Math.min(...allSamples.map((p) => p.x));
  let xHi = Math.max(...allSamples.map((p) => p.x));
  let yLo = Math.min(...allSamples.map((p) => p.y));
  let yHi = Math.max(...allSamples.map((p) => p.y));
  if (xLo === xHi) {
    xLo -= 1;
    xHi += 1;
  }
  if (yLo === yHi) {
    yLo -= 1;
    yHi += 1;
  }

  const backgroundColor = panel.backgroundColor ?? '#ffffff';
  const frameColor = panel.frameColor ?? '#94a3b8';
  const out: LearningShape[] = [];
  out.push({
    type: 'rect',
    x,
    y,
    width: w,
    height: h,
    color: backgroundColor,
    fill: backgroundColor,
    opacity: panel.backgroundOpacity ?? 0.85,
  });
  out.push({ type: 'rect', x, y, width: w, height: h, color: frameColor, lineWidth: 1 });

  panel.series.forEach((series, j) => {
    const color = series.color ?? TRACE_SERIES_COLORS[j % TRACE_SERIES_COLORS.length];
    const mapped = series.samples.map((p) => ({
      x: x + 4 + ((p.x - xLo) / (xHi - xLo)) * (w - 8),
      y: y + h - 4 - ((p.y - yLo) / (yHi - yLo)) * (h - 8),
    }));
    for (let i = 1; i < mapped.length; i++) {
      out.push({
        type: 'line',
        x1: mapped[i - 1].x,
        y1: mapped[i - 1].y,
        x2: mapped[i].x,
        y2: mapped[i].y,
        color,
        lineWidth: 1.5,
      });
    }
    if (mapped.length > 0) {
      const last = mapped[mapped.length - 1];
      out.push({ type: 'circle', x: last.x, y: last.y, radius: 2, color, fill: color });
    }
    if (series.label) {
      out.push({ type: 'text', x: x + 6, y: y + 10 + 11 * j, text: series.label, color, fontSize: 9, fontFamily });
    }
  });

  if (panel.yLabel) {
    out.push({ type: 'text', x: x + w - 6, y: y + 10, text: panel.yLabel, color: '#6b7280', fontSize: 9, align: 'right', fontFamily });
  }
  if (panel.xLabel) {
    out.push({ type: 'text', x: x + w - 6, y: y + h - 6, text: panel.xLabel, color: '#6b7280', fontSize: 9, align: 'right', fontFamily });
  }

  return out;
}

function drawableNeedsAnimation(nodes: DrawableNode[] | undefined): boolean {
  if (!nodes) return false;
  return nodes.some((node): boolean => {
    if (node.type === 'draw-sprite') return node.animation !== undefined;
    if (node.type === 'draw-fx-layer') return Array.isArray(node.items) && node.items.length > 0;
    if (node.type === 'draw-sprite-layer') return Array.isArray(node.items) && node.items.some((it) => it.animation !== undefined);
    if (node.type === 'draw-group') return Array.isArray(node.items) && drawableNeedsAnimation(node.items);
    return false;
  });
}

export const LearningCanvas: React.FC<LearningCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  backgroundColor,
  fontFamily,
  shapes = [],
  drawables,
  projector,
  readouts,
  traces,
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
  const [drawVersion, setDrawVersion] = useState(0);
  const invalidateRef = useRef(() => setDrawVersion((v) => v + 1));
  const needsAnim = useMemo(() => drawableNeedsAnimation(drawables), [drawables]);

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

  const derivedShapes = useMemo(() => {
    if (!traces?.length && !readouts?.length) return shapes;
    const traceOut = (traces ?? []).flatMap((panel, k) => traceShapes(panel, k, width, height, fontFamily));
    const readoutOut = readouts?.length ? readoutShapes(readouts, width, fontFamily) : [];
    return [...shapes, ...traceOut, ...readoutOut];
  }, [shapes, traces, readouts, width, height, fontFamily]);

  const draw = useCallback(() => {
    const _perfT = perfStart('learningcanvas:paint');
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
      ctx.fillStyle = resolveColor(backgroundColor, ctx, backgroundColor);
      ctx.fillRect(0, 0, width, height);
    }

    // Text always renders in a final top pass so labels are never buried under paths/fills.
    for (const shape of derivedShapes) {
      if (shape.type !== 'text') drawShape(ctx, shape, width, height, derivedShapes, fontFamily);
    }
    for (const shape of derivedShapes) {
      if (shape.type === 'text') drawShape(ctx, shape, width, height, derivedShapes, fontFamily);
    }

    // Game drawables paint on top of the math world using the supplied projector.
    if (drawables?.length && projector) {
      const painter = createWebPainter(ctx, invalidateRef.current);
      const timeMs = needsAnim && typeof performance !== 'undefined' ? performance.now() : 0;
      const dctx = { projector, time: timeMs, invalidate: invalidateRef.current, fontFamily: fontFamily || themeBodyFont(canvas) };
      for (const node of drawables) {
        paintDrawable(painter, node, dctx);
      }
    }

    perfEnd('learningcanvas:paint', _perfT);
  }, [width, height, backgroundColor, derivedShapes, drawables, projector, needsAnim]);

  useEffect(() => {
    draw();
  }, [draw, drawVersion]);

  useEffect(() => {
    const shouldAnimate = animate || needsAnim;
    if (!shouldAnimate) return;
    const loop = () => {
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, needsAnim, draw]);

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
