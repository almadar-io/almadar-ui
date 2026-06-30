'use client';

/**
 * PhysicsCanvas
 *
 * A field-scoped learning molecule for physics. Renders bodies, constraints,
 * velocity arrows, and force arrows on top of the declarative `LearningCanvas`
 * atom.
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

export interface LearningPhysicsBody {
  id?: string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  label?: string;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export interface LearningPhysicsConstraint {
  from: string;
  to: string;
  color?: string;
}

export interface PhysicsCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
  bodies?: LearningPhysicsBody[];
  constraints?: LearningPhysicsConstraint[];
  showVelocity?: boolean;
  showForces?: boolean;
  velocityScale?: number;
  forceScale?: number;
  /** Extra declarative shapes in canvas pixel coordinates. */
  shapes?: LearningShape[];
  interactive?: boolean;
  animate?: boolean;
  onShapeClick?: (payload: { id?: string; type?: string; index: number }) => void;
  isLoading?: boolean;
  error?: UiError | null;
}

export const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  bodies = [],
  constraints = [],
  showVelocity = true,
  showForces = false,
  velocityScale = 20,
  forceScale = 20,
  shapes = [],
  interactive = false,
  animate = false,
  onShapeClick,
  isLoading,
  error,
}) => {
  const derivedShapes: LearningShape[] = useMemo(() => {
    const out: LearningShape[] = [];
    const bodyById = new Map<string, LearningPhysicsBody>();
    for (const b of bodies) {
      if (b.id) bodyById.set(b.id, b);
    }

    for (const c of constraints) {
      const a = bodyById.get(c.from);
      const b = bodyById.get(c.to);
      if (!a || !b) continue;
      out.push({
        type: 'line',
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        color: c.color ?? '#9ca3af',
        lineWidth: 2,
      });
    }

    for (const b of bodies) {
      out.push({
        type: 'circle',
        x: b.x,
        y: b.y,
        radius: b.radius ?? 12,
        color: b.color ?? '#2563eb',
        fill: b.color ?? '#2563eb',
        id: b.id,
      });
      if (b.label) {
        out.push({
          type: 'text',
          x: b.x + (b.radius ?? 12) + 6,
          y: b.y - (b.radius ?? 12) - 6,
          text: b.label,
          color: '#111827',
          fontSize: 12,
        });
      }
      if (showVelocity && b.vx != null && b.vy != null && (b.vx !== 0 || b.vy !== 0)) {
        out.push({
          type: 'arrow',
          x1: b.x,
          y1: b.y,
          x2: b.x + b.vx * velocityScale,
          y2: b.y + b.vy * velocityScale,
          color: '#16a34a',
          lineWidth: 2,
        });
      }
      if (showForces && b.fx != null && b.fy != null && (b.fx !== 0 || b.fy !== 0)) {
        out.push({
          type: 'arrow',
          x1: b.x,
          y1: b.y,
          x2: b.x + b.fx * forceScale,
          y2: b.y + b.fy * forceScale,
          color: '#dc2626',
          lineWidth: 2,
        });
      }
    }

    out.push(...shapes);
    return out;
  }, [bodies, constraints, showVelocity, showForces, velocityScale, forceScale, shapes]);

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
