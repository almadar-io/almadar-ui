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
import { createLogger } from '@almadar/logger';
import type { Camera } from '@almadar/core';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';
import type { DrawableNode } from '../../../lib/drawable/paintDispatch';
import type { CanvasLighting, CanvasPost } from '../../../lib/drawable/three/Canvas3DHost';
import {
  LearningScene3D,
  arrowBetween,
  billboardLabel,
  cylinderBetween,
  get3DClickPayload,
  labelColorForBackground,
  meshSphere,
} from './learningScene3D';

const physicsLog = createLogger('almadar:ui:physics-canvas');

export interface LearningPhysicsBody {
  id?: string;
  x: number;
  y: number;
  /** 3D mode only: height in scene cells (2D ignores it). */
  z?: number;
  radius?: number;
  color?: string;
  label?: string;
  vx?: number;
  vy?: number;
  /** 3D mode only: velocity height component (2D ignores it). */
  vz?: number;
  fx?: number;
  fy?: number;
  /** 3D mode only: force height component (2D ignores it). */
  fz?: number;
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
  /** Painter: 2D raster (default) or 3D mesh scene via the lazy three.js host. */
  mode?: '2d' | '3d';
  /** 3D only: neutral camera pose ({ mode, zoom, fov, azimuth, target }). */
  camera?: Camera;
  /** 3D only: scene light rig as data. */
  lighting?: CanvasLighting;
  /** 3D only: post-processing stack (bloom/vignette). */
  post?: CanvasPost;
  bodies?: LearningPhysicsBody[];
  constraints?: LearningPhysicsConstraint[];
  showVelocity?: boolean;
  showForces?: boolean;
  velocityScale?: number;
  forceScale?: number;
  /** Extra declarative shapes in canvas pixel coordinates (2D mode only — ignored in 3D). */
  shapes?: LearningShape[];
  /** 3D only: show the ground grid (default off). */
  showGrid?: boolean;
  /** 3D only: enable shadows. Omitted → the host default. */
  shadows?: boolean;
  /** 2D: pointer interaction (click/hover). 3D: orbit camera controls. */
  interactive?: boolean;
  /** 2D only: continuous redraw loop. 3D motion is entity-state driven. */
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
  mode = '2d',
  camera,
  lighting,
  post,
  bodies = [],
  constraints = [],
  showVelocity = true,
  showForces = false,
  velocityScale = 20,
  forceScale = 20,
  shapes = [],
  showGrid,
  shadows,
  interactive,
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

  const drawables3D: DrawableNode[] = useMemo(() => {
    if (mode !== '3d') return [];
    if (shapes.length > 0) {
      physicsLog.debug('shapes ignored in 3D mode (pixel-authored 2D vocabulary)', { count: shapes.length });
    }
    const out: DrawableNode[] = [];
    const labelColor = labelColorForBackground(backgroundColor);
    const bodyById = new Map<string, LearningPhysicsBody>();
    for (const b of bodies) {
      if (b.id) bodyById.set(b.id, b);
    }

    for (const c of constraints) {
      const a = bodyById.get(c.from);
      const b = bodyById.get(c.to);
      if (!a || !b) continue;
      const rodRadius = Math.max(0.05, Math.min(a.radius ?? 0.5, b.radius ?? 0.5) * 0.15);
      const rod = cylinderBetween([a.x, a.y, a.z ?? 0], [b.x, b.y, b.z ?? 0], rodRadius, c.color ?? '#9ca3af');
      if (rod) out.push(rod);
    }

    for (const b of bodies) {
      const radius = b.radius ?? 0.5;
      const bz = b.z ?? 0;
      out.push(meshSphere(b.id, b.x, b.y, bz, radius, b.color ?? '#2563eb'));
      if (b.label) {
        out.push(billboardLabel(b.label, b.x, b.y, bz + radius, { color: labelColor }));
      }
      const vx = b.vx ?? 0;
      const vy = b.vy ?? 0;
      const vz = b.vz ?? 0;
      const arrowRadius = Math.max(0.05, radius * 0.15);
      if (showVelocity && (vx !== 0 || vy !== 0 || vz !== 0)) {
        const arrow = arrowBetween(
          [b.x, b.y, bz],
          [b.x + vx * velocityScale, b.y + vy * velocityScale, bz + vz * velocityScale],
          '#16a34a',
          arrowRadius,
        );
        if (arrow) out.push(arrow);
      }
      const fx = b.fx ?? 0;
      const fy = b.fy ?? 0;
      const fz = b.fz ?? 0;
      if (showForces && (fx !== 0 || fy !== 0 || fz !== 0)) {
        const arrow = arrowBetween(
          [b.x, b.y, bz],
          [b.x + fx * forceScale, b.y + fy * forceScale, bz + fz * forceScale],
          '#dc2626',
          arrowRadius,
        );
        if (arrow) out.push(arrow);
      }
    }
    return out;
  }, [mode, bodies, constraints, showVelocity, showForces, velocityScale, forceScale, shapes, backgroundColor]);

  const bodyIndexById = useMemo(() => {
    const m = new Map<string, number>();
    bodies.forEach((b, i) => {
      if (b.id) m.set(b.id, i);
    });
    return m;
  }, [bodies]);

  if (mode === '3d') {
    return (
      <LearningScene3D
        className={className}
        width={width}
        height={height}
        title={title}
        backgroundColor={backgroundColor}
        drawables={drawables3D}
        camera={camera}
        lighting={lighting}
        post={post}
        showGrid={showGrid}
        shadows={shadows}
        interactive={interactive}
        isLoading={isLoading}
        error={error}
        onItemClick={get3DClickPayload(onShapeClick, bodyIndexById)}
      />
    );
  }

  return (
    <Card className={className}>
      <VStack gap="sm">
        {title ? <Typography variant="h4">{title}</Typography> : null}
        <LearningCanvas
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          shapes={derivedShapes}
          interactive={interactive ?? false}
          animate={animate}
          onShapeClick={onShapeClick}
          isLoading={isLoading}
          error={error}
        />
      </VStack>
    </Card>
  );
};
