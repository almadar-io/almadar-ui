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
import { createLogger } from '@almadar/logger';
import type { Camera } from '@almadar/core';
import { Card, Typography } from '../../core/atoms/index';
import { VStack } from '../../core/atoms/Stack';
import { LearningCanvas } from '../atoms/LearningCanvas';
import type { LearningShape } from '../atoms/LearningCanvas';
import type { UiError } from '../../core/atoms/types';
import type { DrawableNode } from '../../../lib/drawable/paintDispatch';
import type { CanvasLighting, CanvasPost } from '../../../lib/drawable/three/Canvas3DHost';
import type { MeshShapeKind } from '../../game/atoms/DrawMesh';
import {
  LearningScene3D,
  billboardLabel,
  cylinderBetween,
  get3DClickPayload,
  labelColorForBackground,
  meshSphere,
} from './learningScene3D';

const biologyLog = createLogger('almadar:ui:biology-canvas');

export interface BiologyNode {
  id?: string;
  x: number;
  y: number;
  /** 3D mode only: height in scene cells (2D ignores it). */
  z?: number;
  radius?: number;
  color?: string;
  label?: string;
  kind?: 'cell' | 'organelle' | 'molecule' | 'organism';
  /** 3D mode only: mesh primitive (default 'sphere'; organelles read well as 'capsule'). */
  shape?: MeshShapeKind;
  /** 3D mode only: 0..1 mesh opacity (translucent shells, e.g. a cell membrane). */
  opacity?: number;
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
  /** Painter: 2D raster (default) or 3D mesh scene via the lazy three.js host. */
  mode?: '2d' | '3d';
  /** 3D only: neutral camera pose ({ mode, zoom, fov, azimuth, target }). */
  camera?: Camera;
  /** 3D only: scene light rig as data. */
  lighting?: CanvasLighting;
  /** 3D only: post-processing stack (bloom/vignette). */
  post?: CanvasPost;
  nodes?: BiologyNode[];
  edges?: BiologyEdge[];
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

export const BiologyCanvas: React.FC<BiologyCanvasProps> = ({
  className,
  width = 600,
  height = 400,
  title,
  backgroundColor,
  mode = '2d',
  camera,
  lighting,
  post,
  nodes = [],
  edges = [],
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

  const drawables3D: DrawableNode[] = useMemo(() => {
    if (mode !== '3d') return [];
    if (shapes.length > 0) {
      biologyLog.debug('shapes ignored in 3D mode (pixel-authored 2D vocabulary)', { count: shapes.length });
    }
    const out: DrawableNode[] = [];
    const labelColor = labelColorForBackground(backgroundColor);
    const nodeById = new Map<string, BiologyNode>();
    for (const n of nodes) {
      if (n.id) nodeById.set(n.id, n);
    }

    for (const e of edges) {
      const a = nodeById.get(e.from);
      const b = nodeById.get(e.to);
      if (!a || !b) continue;
      const edgeRadius = Math.max(0.04, Math.min(a.radius ?? 0.5, b.radius ?? 0.5) * 0.12);
      const edge = cylinderBetween([a.x, a.y, a.z ?? 0], [b.x, b.y, b.z ?? 0], edgeRadius, e.color ?? '#9ca3af');
      if (edge) out.push(edge);
      if (e.label) {
        out.push(
          billboardLabel(
            e.label,
            (a.x + b.x) / 2,
            (a.y + b.y) / 2,
            ((a.z ?? 0) + (b.z ?? 0)) / 2,
            { color: labelColor },
          ),
        );
      }
    }

    for (const n of nodes) {
      const radius = n.radius ?? 0.5;
      const nz = n.z ?? 0;
      out.push(meshSphere(n.id, n.x, n.y, nz, radius, n.color ?? '#16a34a', { shape: n.shape, ...(n.opacity !== undefined ? { opacity: n.opacity } : {}) }));
      if (n.label) {
        out.push(billboardLabel(n.label, n.x, n.y, nz + radius, { color: labelColor }));
      }
    }
    return out;
  }, [mode, nodes, edges, shapes, backgroundColor]);

  const nodeIndexById = useMemo(() => {
    const m = new Map<string, number>();
    nodes.forEach((n, i) => {
      if (n.id) m.set(n.id, i);
    });
    return m;
  }, [nodes]);

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
        onItemClick={get3DClickPayload(onShapeClick, nodeIndexById)}
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
