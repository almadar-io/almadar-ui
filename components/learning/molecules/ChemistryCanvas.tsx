'use client';

/**
 * ChemistryCanvas
 *
 * A field-scoped learning molecule for chemistry. Renders atoms, bonds, and
 * reaction arrows on top of the declarative `LearningCanvas` atom.
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

export interface ChemistryAtom {
  id?: string;
  x: number;
  y: number;
  element?: string;
  radius?: number;
  color?: string;
}

export interface ChemistryBond {
  from: string;
  to: string;
  type?: 'single' | 'double' | 'triple';
  color?: string;
}

export interface ChemistryArrow {
  x: number;
  y: number;
  angle?: number;
  length?: number;
  color?: string;
  label?: string;
}

export interface ChemistryCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  atoms?: ChemistryAtom[];
  bonds?: ChemistryBond[];
  arrows?: ChemistryArrow[];
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  isLoading?: boolean;
  error?: UiError | null;
}

export const ChemistryCanvas: React.FC<ChemistryCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  atoms = [],
  bonds = [],
  arrows = [],
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];
    const atomById = new Map<string, ChemistryAtom>();
    for (const a of atoms) {
      if (a.id) atomById.set(a.id, a);
    }

    for (const b of bonds) {
      const a = atomById.get(b.from);
      const c = atomById.get(b.to);
      if (!a || !c) continue;
      const color = b.color ?? '#6b7280';
      const strokeWidth = b.type === 'double' ? 4 : b.type === 'triple' ? 6 : 2;
      out.push({
        type: 'line',
        x1: a.x,
        y1: a.y,
        x2: c.x,
        y2: c.y,
        color,
        lineWidth: strokeWidth,
      });
    }

    for (const a of arrows) {
      const angle = (a.angle ?? 0) * (Math.PI / 180);
      const len = a.length ?? 60;
      const x2 = a.x + Math.cos(angle) * len;
      const y2 = a.y + Math.sin(angle) * len;
      out.push({
        type: 'arrow',
        x1: a.x,
        y1: a.y,
        x2,
        y2,
        color: a.color ?? '#dc2626',
        lineWidth: 2,
      });
      if (a.label) {
        out.push({
          type: 'text',
          x: (a.x + x2) / 2,
          y: (a.y + y2) / 2 - 10,
          text: a.label,
          color: '#111827',
          fontSize: 12,
          align: 'center',
        });
      }
    }

    for (const a of atoms) {
      out.push({
        type: 'circle',
        x: a.x,
        y: a.y,
        radius: a.radius ?? 14,
        color: a.color ?? '#2563eb',
        fill: a.color ?? '#2563eb',
        id: a.id,
      });
      if (a.element) {
        out.push({
          type: 'text',
          x: a.x,
          y: a.y,
          text: a.element,
          color: '#ffffff',
          fontSize: 12,
          align: 'center',
        });
      }
    }

    out.push(...shapes);
    return out;
  }, [atoms, bonds, arrows, shapes]);

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
