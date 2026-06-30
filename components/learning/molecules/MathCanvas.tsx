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
import { useMemo } from 'react';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape, LearningPoint } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';

export interface MathCurve {
  label?: string;
  color?: string;
  /** Sampled {x,y} points in math coordinates. */
  samples: LearningPoint[];
}

export interface MathPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  radius?: number;
}

export interface MathVector {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color?: string;
  label?: string;
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
  curves?: MathCurve[];
  points?: MathPoint[];
  vectors?: MathVector[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
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
  curves = [],
  points = [],
  vectors = [],
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];

    const margin = 24;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;

    const mapX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * plotW;
    const mapY = (y: number) => height - (margin + ((y - yMin) / (yMax - yMin)) * plotH);

    if (showGrid) {
      for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
        const px = mapX(x);
        out.push({ type: 'line', x1: px, y1: margin, x2: px, y2: height - margin, color: '#e5e7eb', lineWidth: 1 });
      }
      for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
        const py = mapY(y);
        out.push({ type: 'line', x1: margin, y1: py, x2: width - margin, y2: py, color: '#e5e7eb', lineWidth: 1 });
      }
    }

    if (showAxes) {
      const xAxisY = Math.max(margin, Math.min(height - margin, mapY(0)));
      const yAxisX = Math.max(margin, Math.min(width - margin, mapX(0)));
      out.push({ type: 'line', x1: margin, y1: xAxisY, x2: width - margin, y2: xAxisY, color: '#374151', lineWidth: 2 });
      out.push({ type: 'line', x1: yAxisX, y1: margin, x2: yAxisX, y2: height - margin, color: '#374151', lineWidth: 2 });
    }

    for (const curve of curves) {
      if (!curve.samples || curve.samples.length < 2) continue;
      for (let i = 1; i < curve.samples.length; i++) {
        const a = curve.samples[i - 1];
        const b = curve.samples[i];
        if (a.x < xMin || a.x > xMax || b.x < xMin || b.x > xMax) continue;
        out.push({
          type: 'line',
          x1: mapX(a.x),
          y1: mapY(a.y),
          x2: mapX(b.x),
          y2: mapY(b.y),
          color: curve.color ?? '#2563eb',
          lineWidth: 2,
        });
      }
    }

    for (const p of points) {
      if (p.x < xMin || p.x > xMax || p.y < yMin || p.y > yMax) continue;
      out.push({
        type: 'circle',
        x: mapX(p.x),
        y: mapY(p.y),
        radius: p.radius ?? 4,
        color: p.color ?? '#dc2626',
        fill: p.color ?? '#dc2626',
      });
      if (p.label) {
        out.push({ type: 'text', x: mapX(p.x) + 8, y: mapY(p.y) - 8, text: p.label, color: '#111827', fontSize: 12 });
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
        out.push({ type: 'text', x: x2 + 6, y: y2 - 6, text: v.label, color: '#111827', fontSize: 12 });
      }
    }

    out.push(...shapes);
    return out;
  }, [width, height, xMin, xMax, yMin, yMax, showAxes, showGrid, gridStep, curves, points, vectors, shapes]);

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <LearningCanvas
          width={width}
          height={height}
          shapes={derivedShapes}
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
