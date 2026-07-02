'use client';

/**
 * AlgorithmCanvas
 *
 * A field-scoped learning molecule for computer-science algorithm visualizations.
 * Projects semantic `bars` (sorting/histograms), `cells` (grids/arrays/DP tables),
 * and `pointers` (index cursors) into pixel-space shapes on the declarative
 * `LearningCanvas` atom, so a `.lolo` behavior never computes pixel coordinates —
 * it just sets `bars`/`cells`/`pointers` and lets this molecule lay them out.
 * Graph/tree algorithms reuse `BiologyCanvas` (nodes + edges); this canvas owns
 * only the bar/cell/pointer vocabulary.
 *
 * @packageDocumentation
 */

import * as React from 'react';
import { useMemo } from 'react';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';

export interface AlgorithmBar {
  value: number;
  color?: string;
  label?: string;
}

export interface AlgorithmCell {
  row: number;
  col: number;
  value?: number;
  color?: string;
  label?: string;
}

export interface AlgorithmPointer {
  index: number;
  label?: string;
  color?: string;
}

export interface AlgorithmCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  /** Sorting/histogram bars; laid out left-to-right, height proportional to value. */
  bars?: AlgorithmBar[];
  /** Grid/array/DP cells; laid out on a row/col lattice sized to the extent. */
  cells?: AlgorithmCell[];
  /** Index cursors (i/j/lo/hi/mid); drawn as markers beneath the referenced bar/cell column. */
  pointers?: AlgorithmPointer[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  isLoading?: boolean;
  error?: UiError | null;
}

const DEFAULT_BAR_COLOR = '#3b82f6';
const DEFAULT_CELL_COLOR = '#e5e7eb';
const DEFAULT_POINTER_COLOR = '#dc2626';
const POINTER_BAND = 34;
const TOP_PAD = 12;

export const AlgorithmCanvas: React.FC<AlgorithmCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  bars = [],
  cells = [],
  pointers = [],
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];

    // --- bars: even columns across the width, height ∝ value / max, pointers in a bottom band ---
    if (bars.length > 0) {
      const slot = width / bars.length;
      const barW = slot * 0.8;
      const gap = slot * 0.1;
      const baseline = height - POINTER_BAND;
      const usableH = baseline - TOP_PAD;
      const maxV = Math.max(1, ...bars.map((b) => (Number.isFinite(b.value) ? b.value : 0)));

      bars.forEach((bar, i) => {
        const v = Number.isFinite(bar.value) ? bar.value : 0;
        const bh = Math.max(0, (v / maxV) * usableH);
        const x = i * slot + gap;
        const color = bar.color ?? DEFAULT_BAR_COLOR;
        out.push({
          type: 'rect',
          id: `bar-${i}`,
          x,
          y: baseline - bh,
          width: barW,
          height: bh,
          color,
          fill: color,
        });
        const label = bar.label ?? (bars.length <= 24 ? String(v) : undefined);
        if (label) {
          out.push({
            type: 'text',
            x: x + barW / 2,
            y: baseline - bh - 8,
            text: label,
            color: '#374151',
            fontSize: 11,
            align: 'center',
          });
        }
      });

      pointers.forEach((p) => {
        if (p.index < 0 || p.index >= bars.length) return;
        const cx = p.index * slot + slot / 2;
        const color = p.color ?? DEFAULT_POINTER_COLOR;
        out.push({
          type: 'arrow',
          x1: cx,
          y1: height - 6,
          x2: cx,
          y2: baseline + 4,
          color,
          lineWidth: 2,
        });
        if (p.label) {
          out.push({
            type: 'text',
            x: cx,
            y: height - 22,
            text: p.label,
            color,
            fontSize: 11,
            align: 'center',
          });
        }
      });
    }

    // --- cells: a row/col lattice sized to the observed extent ---
    if (cells.length > 0) {
      const maxCol = Math.max(0, ...cells.map((c) => c.col)) + 1;
      const maxRow = Math.max(0, ...cells.map((c) => c.row)) + 1;
      const cw = width / maxCol;
      const ch = height / maxRow;
      cells.forEach((c, i) => {
        const x = c.col * cw;
        const y = c.row * ch;
        const color = c.color ?? DEFAULT_CELL_COLOR;
        out.push({
          type: 'rect',
          id: `cell-${i}`,
          x: x + 1,
          y: y + 1,
          width: cw - 2,
          height: ch - 2,
          color: '#9ca3af',
          fill: color,
        });
        const label = c.label ?? (c.value != null ? String(c.value) : undefined);
        if (label && cw >= 18 && ch >= 14) {
          out.push({
            type: 'text',
            x: x + cw / 2,
            y: y + ch / 2,
            text: label,
            color: '#111827',
            fontSize: 12,
            align: 'center',
          });
        }
      });
    }

    out.push(...shapes);
    return out;
  }, [bars, cells, pointers, shapes, width, height]);

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <LearningCanvas
          width={width}
          height={height}
          backgroundColor={backgroundColor}
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
