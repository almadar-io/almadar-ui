'use client';

/**
 * FlowCanvas — Unified AVL + Flow canvas organism.
 *
 * One React Flow canvas with continuous semantic zoom. AVL primitives
 * render inside React Flow nodes. The ZoomBandContext drives node
 * rendering at different zoom levels.
 *
 * Replaces both AvlCosmicZoom (SVG viewer) and OrbitalFlow (Flow editor).
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type Viewport,
} from '@xyflow/react';
import type { OrbitalSchema } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { schemaToFlowGraph } from '../../molecules/avl/avl-flow-converter';
import { computeZoomBand, ZoomBandContext } from '../../molecules/avl/avl-zoom-band';
import { AvlOrbitalNode } from '../../molecules/avl/AvlOrbitalNode';
import { AvlTransitionEdge } from '../../molecules/avl/AvlTransitionEdge';
import { AvlEventWireEdge } from '../../molecules/avl/AvlEventWireEdge';
import { AvlBackwardEdge } from '../../molecules/avl/AvlBackwardEdge';
import { AvlPageEdge } from '../../molecules/avl/AvlPageEdge';
import { AvlBindingEdge } from '../../molecules/avl/AvlBindingEdge';
import { ZoomBreadcrumb } from './ZoomBreadcrumb';
import { ZoomLegend } from './ZoomLegend';
import type { ZoomBand } from '../../molecules/avl/avl-canvas-types';
import type { ZoomLevel } from './avl-zoom-state';

// ---------------------------------------------------------------------------
// Node & edge type registries
// ---------------------------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  orbital: AvlOrbitalNode,
} as NodeTypes;

const EDGE_TYPES: EdgeTypes = {
  transition: AvlTransitionEdge,
  eventWire: AvlEventWireEdge,
  backward: AvlBackwardEdge,
  page: AvlPageEdge,
  binding: AvlBindingEdge,
} as EdgeTypes;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FlowCanvasProps {
  schema: OrbitalSchema | string;
  className?: string;
  color?: string;
  animated?: boolean;
  width?: number | string;
  height?: number | string;
  onZoomChange?: (level: ZoomLevel, context: { orbital?: string; trait?: string }) => void;
  focusTarget?: { type: 'orbital' | 'trait'; name: string };
  initialOrbital?: string;
  initialTrait?: string;
  stateCoverage?: Record<string, 'covered' | 'uncovered' | 'partial'>;
}

// ---------------------------------------------------------------------------
// Band → ZoomLevel mapping for onZoomChange callback
// ---------------------------------------------------------------------------

function bandToZoomLevel(band: ZoomBand): ZoomLevel {
  switch (band) {
    case 'system': return 'application';
    case 'module': return 'orbital';
    case 'behavior': return 'trait';
    case 'detail': return 'transition';
  }
}

// ---------------------------------------------------------------------------
// Inner component (needs ReactFlowProvider)
// ---------------------------------------------------------------------------

function FlowCanvasInner({
  schema: schemaProp,
  className,
  color = 'var(--color-primary)',
  width = '100%',
  height = 500,
  onZoomChange,
  focusTarget,
  initialOrbital,
}: FlowCanvasProps) {
  const parsedSchema = useMemo<OrbitalSchema>(() => {
    if (typeof schemaProp === 'string') return JSON.parse(schemaProp) as OrbitalSchema;
    return schemaProp;
  }, [schemaProp]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => schemaToFlowGraph(parsedSchema),
    [parsedSchema],
  );

  const [nodes,, onNodesChange] = useNodesState(initialNodes);
  const [edges,, onEdgesChange] = useEdgesState(initialEdges);
  const [band, setBand] = useState<ZoomBand>('module');

  const reactFlow = useReactFlow();

  // Track zoom band from viewport changes
  const handleViewportChange = useCallback((viewport: Viewport) => {
    const newBand = computeZoomBand(viewport.zoom);
    setBand(prev => {
      if (prev !== newBand) {
        onZoomChange?.(bandToZoomLevel(newBand), {});
        return newBand;
      }
      return prev;
    });
  }, [onZoomChange]);

  // Focus target: animate to a specific orbital
  useEffect(() => {
    if (!focusTarget) return;
    const targetNode = nodes.find(n =>
      focusTarget.type === 'orbital' && n.id === focusTarget.name
    );
    if (targetNode) {
      reactFlow.fitView({ nodes: [targetNode], duration: 500, padding: 0.5 });
    }
  }, [focusTarget, nodes, reactFlow]);

  // Initial orbital: zoom to it on mount
  useEffect(() => {
    if (!initialOrbital) return;
    const targetNode = nodes.find(n => n.id === initialOrbital);
    if (targetNode) {
      requestAnimationFrame(() => {
        reactFlow.fitView({ nodes: [targetNode], duration: 0, padding: 0.3 });
      });
    }
  }, [initialOrbital]);

  return (
    <ZoomBandContext.Provider value={band}>
      <Box
        className={`relative ${className ?? ''}`}
        style={{ width, height, '--avl-color': color } as React.CSSProperties}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onViewportChange={handleViewportChange}
          minZoom={0.1}
          maxZoom={5.0}
          fitView
          nodesDraggable
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          style={{ background: 'var(--color-background)' }}
        >
          <Controls
            showInteractive={false}
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--color-border)"
          />
        </ReactFlow>

        {/* Overlays */}
        <ZoomBreadcrumb band={band} />
        <ZoomLegend band={band} />
      </Box>
    </ZoomBandContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public component with ReactFlowProvider wrapper
// ---------------------------------------------------------------------------

export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

FlowCanvas.displayName = 'FlowCanvas';
