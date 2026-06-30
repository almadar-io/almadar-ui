'use client';

/**
 * BiologyCanvas
 *
 * A field-scoped learning molecule for biology. Renders cells, organelles,
 * membranes, and connections on top of the declarative `LearningCanvas` atom.
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

export interface BiologyNode {
  id?: string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  label?: string;
  kind?: 'cell' | 'organelle' | 'molecule' | 'organism';
}

export interface BiologyEdge {
  from: string;
  to: string;
  color?: string;
  label?: string;
}

export interface BiologyCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  nodes?: BiologyNode[];
  edges?: BiologyEdge[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  isLoading?: boolean;
  error?: UiError | null;
}

export const BiologyCanvas: React.FC<BiologyCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  nodes = [],
  edges = [],
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];
    const nodeById = new Map<string, BiologyNode>();
    for (const n of nodes) {
      if (n.id) nodeById.set(n.id, n);
    }

    for (const e of edges) {
      const a = nodeById.get(e.from);
      const b = nodeById.get(e.to);
      if (!a || !b) continue;
      out.push({
        type: 'line',
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        color: e.color ?? '#9ca3af',
        lineWidth: 2,
      });
      if (e.label) {
        out.push({
          type: 'text',
          x: (a.x + b.x) / 2 + 4,
          y: (a.y + b.y) / 2 - 4,
          text: e.label,
          color: '#374151',
          fontSize: 11,
        });
      }
    }

    for (const n of nodes) {
      out.push({
        type: 'circle',
        x: n.x,
        y: n.y,
        radius: n.radius ?? 16,
        color: n.color ?? '#16a34a',
        fill: `${n.color ?? '#16a34a'}33`,
        id: n.id,
      });
      if (n.label) {
        out.push({
          type: 'text',
          x: n.x,
          y: n.y + (n.radius ?? 16) + 14,
          text: n.label,
          color: '#111827',
          fontSize: 12,
          align: 'center',
        });
      }
    }

    out.push(...shapes);
    return out;
  }, [nodes, edges, shapes]);

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
