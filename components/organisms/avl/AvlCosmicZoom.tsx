'use client';

/**
 * AvlCosmicZoom — Interactive Zoomable Orbital Visualization
 *
 * V3: Delegates to FlowCanvas, which renders AVL primitives inside
 * React Flow nodes with continuous semantic zoom. The Props interface
 * is preserved for backward compatibility with callers.
 */

import React from 'react';
import type { OrbitalSchema } from '@almadar/core';
import { FlowCanvas } from './FlowCanvas';
import type { ZoomLevel } from './avl-zoom-state';

// ---------------------------------------------------------------------------
// Props (preserved from V2)
// ---------------------------------------------------------------------------

export interface AvlCosmicZoomProps {
  /** The orbital schema (parsed object or JSON string) */
  schema: OrbitalSchema | string;
  /** CSS class for the outer container */
  className?: string;
  /** Primary color for the visualization */
  color?: string;
  /** Enable animations (default: true) */
  animated?: boolean;
  /** Pre-select an orbital on mount */
  initialOrbital?: string;
  /** Pre-select a trait on mount */
  initialTrait?: string;
  /** Callback when zoom level changes */
  onZoomChange?: (level: ZoomLevel, context: { orbital?: string; trait?: string }) => void;
  /** Container width */
  width?: number | string;
  /** Container height */
  height?: number | string;
  /** Coverage data for verification overlay */
  stateCoverage?: Record<string, 'covered' | 'uncovered' | 'partial'>;
  /** Dynamic focus target. Changes animate the zoom to the specified orbital/trait. */
  focusTarget?: { type: 'orbital' | 'trait'; name: string };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AvlCosmicZoom: React.FC<AvlCosmicZoomProps> = (props) => {
  return (
    <FlowCanvas
      schema={props.schema}
      className={props.className}
      color={props.color}
      animated={props.animated}
      width={props.width}
      height={props.height ?? 400}
      onZoomChange={props.onZoomChange}
      focusTarget={props.focusTarget}
      initialOrbital={props.initialOrbital}
      initialTrait={props.initialTrait}
      stateCoverage={props.stateCoverage}
    />
  );
};

AvlCosmicZoom.displayName = 'AvlCosmicZoom';
