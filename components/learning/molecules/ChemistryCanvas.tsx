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
  type Learning3DPoint,
} from './learningScene3D';

const chemistryLog = createLogger('almadar:ui:chemistry-canvas');

export interface ChemistryAtom {
  id?: string;
  x: number;
  y: number;
  /** 3D mode only: height in scene cells (2D ignores it). */
  z?: number;
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
  /** Painter: 2D raster (default) or 3D mesh scene via the lazy three.js host. */
  mode?: '2d' | '3d';
  /** 3D only: neutral camera pose ({ mode, zoom, fov, azimuth, target }). */
  camera?: Camera;
  /** 3D only: scene light rig as data. */
  lighting?: CanvasLighting;
  /** 3D only: post-processing stack (bloom/vignette). */
  post?: CanvasPost;
  atoms?: ChemistryAtom[];
  bonds?: ChemistryBond[];
  arrows?: ChemistryArrow[];
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

/** Unit vector perpendicular to the a→b bond axis (scene space) for double/triple bond offsets. */
function bondPerpendicular(a: Learning3DPoint, b: Learning3DPoint): Learning3DPoint {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  // cross(d, height-axis); degenerate for a purely vertical bond → any horizontal axis.
  const px = dy;
  const py = -dx;
  const len = Math.sqrt(px * px + py * py);
  if (len < 1e-6) return [1, 0, 0];
  return [px / len, py / len, 0];
}

export const ChemistryCanvas: React.FC<ChemistryCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  mode = '2d',
  camera,
  lighting,
  post,
  atoms = [],
  bonds = [],
  arrows = [],
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

  const drawables3D: DrawableNode[] = useMemo(() => {
    if (mode !== '3d') return [];
    if (shapes.length > 0) {
      chemistryLog.debug('shapes ignored in 3D mode (pixel-authored 2D vocabulary)', { count: shapes.length });
    }
    const out: DrawableNode[] = [];
    const labelColor = labelColorForBackground(backgroundColor);
    const atomById = new Map<string, ChemistryAtom>();
    for (const a of atoms) {
      if (a.id) atomById.set(a.id, a);
    }

    for (const b of bonds) {
      const a = atomById.get(b.from);
      const c = atomById.get(b.to);
      if (!a || !c) continue;
      const color = b.color ?? '#6b7280';
      const from: Learning3DPoint = [a.x, a.y, a.z ?? 0];
      const to: Learning3DPoint = [c.x, c.y, c.z ?? 0];
      const perp = bondPerpendicular(from, to);
      const bondRadius = Math.max(0.06, Math.min(a.radius ?? 0.45, c.radius ?? 0.45) * 0.22);
      const step = bondRadius * 2.2;
      const offsets = b.type === 'double' ? [-step, step] : b.type === 'triple' ? [-step, 0, step] : [0];
      for (const off of offsets) {
        const bond = cylinderBetween(
          [from[0] + perp[0] * off, from[1] + perp[1] * off, from[2] + perp[2] * off],
          [to[0] + perp[0] * off, to[1] + perp[1] * off, to[2] + perp[2] * off],
          bondRadius,
          color,
        );
        if (bond) out.push(bond);
      }
    }

    for (const a of arrows) {
      const angle = (a.angle ?? 0) * (Math.PI / 180);
      const len = a.length ?? 60;
      const x2 = a.x + Math.cos(angle) * len;
      const y2 = a.y + Math.sin(angle) * len;
      const arrow = arrowBetween([a.x, a.y, 0], [x2, y2, 0], a.color ?? '#dc2626');
      if (arrow) out.push(arrow);
      if (a.label) {
        out.push(billboardLabel(a.label, (a.x + x2) / 2, (a.y + y2) / 2, 0, { color: labelColor }));
      }
    }

    for (const a of atoms) {
      const radius = a.radius ?? 0.45;
      const az = a.z ?? 0;
      out.push(meshSphere(a.id, a.x, a.y, az, radius, a.color ?? '#2563eb'));
      if (a.element) {
        out.push(billboardLabel(a.element, a.x, a.y, az + radius, { color: labelColor }));
      }
    }
    return out;
  }, [mode, atoms, bonds, arrows, shapes, backgroundColor]);

  const atomIndexById = useMemo(() => {
    const m = new Map<string, number>();
    atoms.forEach((a, i) => {
      if (a.id) m.set(a.id, i);
    });
    return m;
  }, [atoms]);

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
        onItemClick={get3DClickPayload(onShapeClick, atomIndexById)}
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
