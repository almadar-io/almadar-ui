'use client';

/**
 * MathCanvas
 *
 * A field-scoped learning molecule for mathematics. Renders a coordinate plane
 * with axes, grid, curves (sampled points), scatter points, and vectors on top
 * of the declarative `LearningCanvas` atom.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape, LearningPoint, LearningReadout, LearningTracePanel } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';

export interface MathCurve {
  label?: string;
  color?: string;
  /** Sampled {x,y} points in math coordinates. */
  samples: LearningPoint[];
  /** Stroke dash style for this curve's segments; omit for a solid line. */
  dash?: 'dashed' | 'dotted';
}

export interface MathPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  radius?: number;
  /** 'open' draws a hollow ring (white fill, colored stroke); 'closed'/absent = filled dot. */
  style?: 'closed' | 'open';
}

export interface MathVector {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color?: string;
  label?: string;
}

/** A filled area between a curve and a baseline, or between two curves. */
export interface MathRegion {
  /** Upper (or only) boundary samples. */
  samples: LearningPoint[];
  /** Optional lower boundary samples; when absent the region closes at `baseline`. */
  samples2?: LearningPoint[];
  /** Baseline y-value the region closes against when `samples2` is absent (default 0). */
  baseline?: number;
  /** Fill/stroke color (default '#2563eb'). */
  color?: string;
  /** Fill opacity (default 0.2). */
  opacity?: number;
  /** Region label, centered inside the filled area. */
  label?: string;
}

/**
 * A single bar (riemann strip / histogram column) between two y-values at an x-span.
 * @synonyms riemann, histogram, bars
 */
export interface MathBar {
  /** Left edge, in world x. */
  x: number;
  /** Bar width, in world x units. */
  width: number;
  /** Bottom y-value (default 0). */
  y0?: number;
  /** Top y-value. */
  y1: number;
  /** Fill/stroke color (default '#93c5fd'). */
  color?: string;
  /** Fill opacity (default 0.5). */
  opacity?: number;
}

/** A reference line spanning the plot, at a fixed x (vline) or y (hline). */
export interface MathGuide {
  /** 'vline' spans the plot vertically at world x = `at`; 'hline' spans horizontally at world y = `at`. */
  kind: 'vline' | 'hline';
  /** World coordinate the guide sits at. */
  at: number;
  /** Line color (default '#9ca3af'). */
  color?: string;
  /** Stroke dash style (default 'dashed'). */
  dash?: 'dashed' | 'dotted';
  /** Guide label, drawn near the plot edge. */
  label?: string;
}

/** An arc marking the angle swept between two directions at a vertex. */
export interface MathAngle {
  /** Vertex x, in world coordinates. */
  x: number;
  /** Vertex y, in world coordinates. */
  y: number;
  /** Sweep start, in degrees, math convention (CCW from +x). */
  from: number;
  /** Sweep end, in degrees, math convention (CCW from +x). */
  to: number;
  /** Arc radius, in world-x units (default 0.8). */
  radius?: number;
  /** Arc + label color (default '#0ea5e9'). */
  color?: string;
  /** Angle label. */
  label?: string;
}

/**
 * A jump arc between two points on the x-axis (number-line hop / interval jump).
 * @synonyms number line jump, hop arrow
 */
export interface MathHop {
  /** Start x, in world coordinates. */
  from: number;
  /** End x, in world coordinates. */
  to: number;
  /** Arc + arrowhead color (default '#7c3aed'). */
  color?: string;
  /** Hop label, centered above the arc. */
  label?: string;
}

function formatTick(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export interface MathCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  showAxes?: boolean;
  showGrid?: boolean;
  gridStep?: number;
  /** Canvas fill color; `var(--token, fallback)` strings resolve against the active theme. Default transparent. */
  backgroundColor?: string;
  /** Grid line color; resolves theme tokens (default `var(--color-border, #9ca3af)`). */
  gridColor?: string;
  /** Axis line color; resolves theme tokens (default `var(--color-muted-foreground, #374151)`). */
  axisColor?: string;
  /** Draw numeric labels on grid lines (default false). */
  showTickLabels?: boolean;
  /** Draw each curve's `label` at its last in-range sample (default false). */
  showCurveLabels?: boolean;
  curves?: MathCurve[];
  points?: MathPoint[];
  vectors?: MathVector[];
  /** Filled areas under curves or between curve pairs. */
  regions?: MathRegion[];
  /** Riemann/histogram bar strips. */
  bars?: MathBar[];
  /** Fixed reference lines (vline/hline). */
  guides?: MathGuide[];
  /** Angle-sweep arcs at a vertex. */
  angles?: MathAngle[];
  /** Number-line jump arcs. */
  hops?: MathHop[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  /** Top-right status chips, forwarded verbatim to LearningCanvas. */
  readouts?: LearningReadout[];
  /** Inset sparkline panels, forwarded verbatim to LearningCanvas. */
  traces?: LearningTracePanel[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  /** Maps a keydown `e.code` → the board's SEMANTIC event (device-agnostic input), emitted as `UI:{event}` — same contract as the game canvas keyMap. */
  keyMap?: Record<string, string>;
  /** Maps a keyup `e.code` → the board's SEMANTIC event. */
  keyUpMap?: Record<string, string>;
  isLoading?: boolean;
  error?: UiError | null;
}

export const MathCanvas: React.FC<MathCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  showAxes = true,
  showGrid = true,
  gridStep = 1,
  backgroundColor,
  gridColor = 'var(--color-border, #9ca3af)',
  axisColor = 'var(--color-muted-foreground, #374151)',
  showTickLabels = false,
  showCurveLabels = false,
  curves = [],
  points = [],
  vectors = [],
  regions = [],
  bars = [],
  guides = [],
  angles = [],
  hops = [],
  shapes = [],
  readouts,
  traces,
  interactive = false,
  animate = false,
  onShapeClick,
  keyMap,
  keyUpMap,
  isLoading,
  error,
}) => {
  const eventBus = useEventBus();

  // Keyboard → semantic events via keyMap/keyUpMap (device-agnostic input layer,
  // mirroring the game canvas): window-scoped so no focus gate is needed.
  useEffect(() => {
    if (!keyMap && !keyUpMap) return;
    const onDown = (e: KeyboardEvent) => {
      const ev = keyMap?.[e.code];
      if (ev) { eventBus.emit(`UI:${ev}`, {}); e.preventDefault(); }
    };
    const onUp = (e: KeyboardEvent) => {
      const ev = keyUpMap?.[e.code];
      if (ev) eventBus.emit(`UI:${ev}`, {});
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [keyMap, keyUpMap, eventBus]);

  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];

    const margin = 24;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;

    const mapX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * plotW;
    const mapY = (y: number) => height - (margin + ((y - yMin) / (yMax - yMin)) * plotH);
    const xAxisY = Math.max(margin, Math.min(height - margin, mapY(0)));
    const yAxisX = Math.max(margin, Math.min(width - margin, mapX(0)));

    if (showGrid) {
      // Low opacity keeps the lattice faint on BOTH themes; the color itself is a
      // theme token by default so dark and light themes each get their own gray.
      for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
        const px = mapX(x);
        out.push({ type: 'line', x1: px, y1: margin, x2: px, y2: height - margin, color: gridColor, opacity: 0.35, lineWidth: 1 });
      }
      for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
        const py = mapY(y);
        out.push({ type: 'line', x1: margin, y1: py, x2: width - margin, y2: py, color: gridColor, opacity: 0.35, lineWidth: 1 });
      }
    }

    if (showTickLabels) {
      const labelEveryX = Math.max(1, Math.ceil(((xMax - xMin) / gridStep) / Math.floor(plotW / 40)));
      let kx = 0;
      for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep, kx++) {
        if (kx % labelEveryX === 0 && x !== 0) {
          out.push({ type: 'text', x: mapX(x), y: xAxisY + 12, text: formatTick(x), color: '#6b7280', fontSize: 10, align: 'center' });
        }
      }
      const labelEveryY = Math.max(1, Math.ceil(((yMax - yMin) / gridStep) / Math.floor(plotH / 28)));
      let ky = 0;
      for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep, ky++) {
        if (ky % labelEveryY === 0 && y !== 0) {
          out.push({ type: 'text', x: yAxisX - 6, y: mapY(y), text: formatTick(y), color: '#6b7280', fontSize: 10, align: 'right' });
        }
      }
      if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
        out.push({ type: 'text', x: yAxisX - 6, y: xAxisY + 12, text: '0', color: '#6b7280', fontSize: 10, align: 'right' });
      }
    }

    for (const region of regions) {
      if (!region.samples || region.samples.length === 0) continue;
      const baseline = region.baseline ?? 0;
      const clampedPoint = (p: LearningPoint) => ({
        x: mapX(Math.min(xMax, Math.max(xMin, p.x))),
        y: mapY(Math.min(yMax, Math.max(yMin, p.y))),
      });
      const upper = region.samples.map(clampedPoint);
      const first = region.samples[0];
      const last = region.samples[region.samples.length - 1];
      const closing =
        region.samples2 && region.samples2.length > 0
          ? [...region.samples2].reverse().map(clampedPoint)
          : [clampedPoint({ x: last.x, y: baseline }), clampedPoint({ x: first.x, y: baseline })];
      const color = region.color ?? '#2563eb';
      out.push({
        type: 'polygon',
        points: [...upper, ...closing],
        fill: color,
        color,
        opacity: region.opacity ?? 0.2,
        lineWidth: 1,
      });
      if (region.label) {
        const mid = Math.floor(region.samples.length / 2);
        out.push({
          type: 'text',
          x: mapX((first.x + last.x) / 2),
          y: (mapY(region.samples[mid].y) + mapY(baseline)) / 2,
          text: region.label,
          color,
          fontSize: 11,
        });
      }
    }

    for (const bar of bars) {
      if (bar.x + bar.width < xMin || bar.x > xMax) continue;
      const y0 = bar.y0 ?? 0;
      const color = bar.color ?? '#93c5fd';
      out.push({
        type: 'rect',
        x: mapX(bar.x),
        y: mapY(Math.max(y0, bar.y1)),
        width: mapX(bar.x + bar.width) - mapX(bar.x),
        height: Math.abs(mapY(bar.y1) - mapY(y0)),
        color,
        fill: color,
        opacity: bar.opacity ?? 0.5,
        lineWidth: 1,
      });
    }

    if (showAxes) {
      out.push({ type: 'line', x1: margin, y1: xAxisY, x2: width - margin, y2: xAxisY, color: axisColor, lineWidth: 2 });
      out.push({ type: 'line', x1: yAxisX, y1: margin, x2: yAxisX, y2: height - margin, color: axisColor, lineWidth: 2 });
    }

    for (const guide of guides) {
      const color = guide.color ?? '#9ca3af';
      const dash = guide.dash ?? 'dashed';
      if (guide.kind === 'vline') {
        if (guide.at < xMin || guide.at > xMax) continue;
        const px = mapX(guide.at);
        out.push({ type: 'line', x1: px, y1: margin, x2: px, y2: height - margin, color, dash });
        if (guide.label) {
          out.push({ type: 'text', x: px + 4, y: margin + 10, text: guide.label, color, fontSize: 11 });
        }
      } else {
        if (guide.at < yMin || guide.at > yMax) continue;
        const py = mapY(guide.at);
        out.push({ type: 'line', x1: margin, y1: py, x2: width - margin, y2: py, color, dash });
        if (guide.label) {
          out.push({ type: 'text', x: width - margin - 4, y: py - 8, text: guide.label, color, fontSize: 11, align: 'right' });
        }
      }
    }

    for (const curve of curves) {
      if (!curve.samples || curve.samples.length < 2) continue;
      // One clipped Path2D per curve: segments are clipped to the x-window (y is
      // interpolated at the crossing) instead of dropped, so curves no longer snap
      // off at the viewport edge under a moving window; a single stroked path with
      // round joins also removes the seams dense per-segment lines used to show.
      let d = '';
      let penDown = false;
      let lastInRange: LearningPoint | undefined;
      for (let i = 1; i < curve.samples.length; i++) {
        const a = curve.samples[i - 1];
        const b = curve.samples[i];
        if ((a.x < xMin && b.x < xMin) || (a.x > xMax && b.x > xMax)) {
          penDown = false;
          continue;
        }
        const clip = (p: LearningPoint, q: LearningPoint, xLim: number): LearningPoint => {
          const t = q.x === p.x ? 0 : (xLim - p.x) / (q.x - p.x);
          return { x: xLim, y: p.y + t * (q.y - p.y) };
        };
        const ca = a.x < xMin ? clip(a, b, xMin) : a.x > xMax ? clip(a, b, xMax) : a;
        const cb = b.x < xMin ? clip(a, b, xMin) : b.x > xMax ? clip(a, b, xMax) : b;
        const pax = mapX(ca.x);
        const pay = mapY(ca.y);
        d += `${penDown ? 'L' : 'M'} ${pax} ${pay} L ${mapX(cb.x)} ${mapY(cb.y)} `;
        penDown = true;
        if (b.x >= xMin && b.x <= xMax) lastInRange = b;
      }
      if (!d) continue;
      out.push({
        type: 'path',
        path: d,
        color: curve.color ?? '#2563eb',
        lineWidth: 2,
        dash: curve.dash,
      });
      if (showCurveLabels && curve.label && lastInRange) {
        out.push({
          type: 'text',
          x: mapX(lastInRange.x) + 6,
          y: mapY(lastInRange.y) - 6,
          text: curve.label,
          color: curve.color ?? '#2563eb',
          fontSize: 11,
        });
      }
    }

    for (const hop of hops) {
      const x1 = mapX(hop.from);
      const x2 = mapX(hop.to);
      const peak = Math.min(36, plotH * 0.3);
      const color = hop.color ?? '#7c3aed';
      out.push({
        type: 'ellipse',
        x: (x1 + x2) / 2,
        y: xAxisY,
        width: Math.abs(x2 - x1),
        height: 2 * peak,
        startAngle: 180,
        endAngle: 360,
        color,
      });
      const s = Math.sign(hop.to - hop.from);
      out.push({
        type: 'polygon',
        points: [
          { x: x2, y: xAxisY },
          { x: x2 - 4 * s, y: xAxisY - 7 },
          { x: x2 + 2 * s, y: xAxisY - 7 },
        ],
        fill: color,
        color,
      });
      if (hop.label) {
        out.push({
          type: 'text',
          x: (x1 + x2) / 2,
          y: xAxisY - peak - 8,
          text: hop.label,
          color,
          fontSize: 10,
          align: 'center',
        });
      }
    }

    for (const angle of angles) {
      const radius = angle.radius ?? 0.8;
      const color = angle.color ?? '#0ea5e9';
      out.push({
        type: 'ellipse',
        x: mapX(angle.x),
        y: mapY(angle.y),
        width: (2 * radius * plotW) / (xMax - xMin),
        height: (2 * radius * plotH) / (yMax - yMin),
        startAngle: -angle.to,
        endAngle: -angle.from,
        color,
      });
      if (angle.label) {
        const mid = (angle.from + angle.to) / 2;
        const rad = (mid * Math.PI) / 180;
        out.push({
          type: 'text',
          x: mapX(angle.x + 1.35 * radius * Math.cos(rad)),
          y: mapY(angle.y + 1.35 * radius * Math.sin(rad)),
          text: angle.label,
          color,
          fontSize: 11,
          align: 'center',
        });
      }
    }

    for (const p of points) {
      if (p.x < xMin || p.x > xMax || p.y < yMin || p.y > yMax) continue;
      const isOpen = p.style === 'open';
      out.push({
        type: 'circle',
        x: mapX(p.x),
        y: mapY(p.y),
        radius: p.radius ?? 4,
        color: p.color ?? '#dc2626',
        fill: isOpen ? '#ffffff' : (p.color ?? '#dc2626'),
      });
      if (p.label) {
        out.push({ type: 'text', x: mapX(p.x) + 8, y: mapY(p.y) - 8, text: p.label, color: p.color ?? '#111827', fontSize: 12 });
      }
    }

    for (const v of vectors) {
      if (v.x < xMin || v.x > xMax || v.y < yMin || v.y > yMax) continue;
      const x1 = mapX(v.x);
      const y1 = mapY(v.y);
      const x2 = mapX(v.x + v.vx);
      const y2 = mapY(v.y + v.vy);
      out.push({ type: 'arrow', x1, y1, x2, y2, color: v.color ?? '#7c3aed', lineWidth: 2 });
      if (v.label) {
        out.push({ type: 'text', x: x2 + 6, y: y2 - 6, text: v.label, color: v.color ?? '#7c3aed', fontSize: 12 });
      }
    }

    out.push(...shapes);
    return out;
  }, [
    width,
    height,
    xMin,
    xMax,
    yMin,
    yMax,
    showAxes,
    showGrid,
    gridStep,
    gridColor,
    axisColor,
    showTickLabels,
    showCurveLabels,
    curves,
    points,
    vectors,
    regions,
    bars,
    guides,
    angles,
    hops,
    shapes,
  ]);

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <LearningCanvas
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          shapes={derivedShapes}
          readouts={readouts}
          traces={traces}
          interactive={interactive}
          animate={animate}
          onShapeClick={onShapeClick}
          isLoading={isLoading}
          error={error}
        />
      </VStack>
    </Card>
  );
};
