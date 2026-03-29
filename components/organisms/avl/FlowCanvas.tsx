'use client';

/**
 * FlowCanvas — V3 UI Projection Canvas
 *
 * The canvas IS the app. Nodes show rendered UI thumbnails from
 * render-ui effects. Edges show events connecting screens.
 *
 * Two navigation levels:
 *   Level 1 (Overview): One node per orbital showing INIT UI
 *   Level 2 (Expanded): One node per UI state within an orbital
 *
 * Double-click to expand an orbital. Click a node for code callback.
 * Escape to go back. AVL overlays on hover (future).
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import type { OrbitalSchema } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { OrbPreviewNode, ScreenSizeContext, PatternSelectionContext, type SelectedPattern } from '../../molecules/avl/OrbPreviewNode';
import { EventFlowEdge } from '../../molecules/avl/EventFlowEdge';
import { schemaToOverviewGraph, orbitalToExpandedGraph } from '../../molecules/avl/avl-preview-converter';
import type { ViewLevel, PreviewNodeData, ScreenSize } from '../../molecules/avl/avl-preview-types';
import { SCREEN_SIZE_PRESETS } from '../../molecules/avl/avl-preview-types';
import { TransitionPanel } from './TransitionPanel';

// ---------------------------------------------------------------------------
// Node & edge type registries
// ---------------------------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  preview: OrbPreviewNode,
} as NodeTypes;

const EDGE_TYPES: EdgeTypes = {
  eventFlow: EventFlowEdge,
} as EdgeTypes;

const DEFAULT_EDGE_OPTIONS = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FlowCanvasProps {
  schema: OrbitalSchema | string;
  mockData?: Record<string, unknown[]>;
  className?: string;
  width?: number | string;
  height?: number | string;
  onNodeClick?: (context: {
    level: ViewLevel | 'code';
    orbital: string;
    trait?: string;
    transition?: string;
  }) => void;
  onLevelChange?: (level: ViewLevel, orbital?: string) => void;
  initialOrbital?: string;
  /** @deprecated Use onNodeClick instead. Kept for AvlCosmicZoom compat. */
  onZoomChange?: (level: string, context: Record<string, string | undefined>) => void;
  /** @deprecated Not used in V3. */
  focusTarget?: { type: string; name: string };
  /** @deprecated Not used in V3. */
  color?: string;
  /** @deprecated Not used in V3. */
  animated?: boolean;
  /** @deprecated Not used in V3. */
  initialTrait?: string;
  /** @deprecated Not used in V3. */
  stateCoverage?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Inner component (needs ReactFlowProvider)
// ---------------------------------------------------------------------------

function FlowCanvasInner({
  schema: schemaProp,
  mockData,
  className,
  width = '100%',
  height = 500,
  onNodeClick,
  onLevelChange,
  initialOrbital,
}: FlowCanvasProps) {
  const parsedSchema = useMemo<OrbitalSchema>(() => {
    if (typeof schemaProp === 'string') return JSON.parse(schemaProp) as OrbitalSchema;
    return schemaProp;
  }, [schemaProp]);

  // Navigation state
  const [level, setLevel] = useState<ViewLevel>('overview');
  const [expandedOrbital, setExpandedOrbital] = useState<string | undefined>(
    initialOrbital,
  );
  const [screenSize, setScreenSize] = useState<ScreenSize>('tablet');
  const [selectedNode, setSelectedNode] = useState<PreviewNodeData | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<SelectedPattern | null>(null);

  const patternSelectionValue = useMemo(() => ({
    selected: selectedPattern,
    select: (p: SelectedPattern | null) => {
      setSelectedPattern(p);
      // When a pattern is selected, also set the node for the TransitionPanel
      if (p) setSelectedNode(p.nodeData);
    },
  }), [selectedPattern]);

  // Compute graph for current level
  const { overviewNodes, overviewEdges, expandedNodes, expandedEdges } = useMemo(() => {
    const overview = schemaToOverviewGraph(parsedSchema, mockData);
    const expanded = expandedOrbital
      ? orbitalToExpandedGraph(parsedSchema, expandedOrbital, mockData)
      : { nodes: [], edges: [] };
    return {
      overviewNodes: overview.nodes,
      overviewEdges: overview.edges,
      expandedNodes: expanded.nodes,
      expandedEdges: expanded.edges,
    };
  }, [parsedSchema, expandedOrbital]);

  const activeNodes = level === 'overview' ? overviewNodes : expandedNodes;
  const activeEdges = level === 'overview' ? overviewEdges : expandedEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(activeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeEdges);

  const reactFlow = useReactFlow();

  // Sync nodes/edges when level or schema changes
  useEffect(() => {
    setNodes(activeNodes);
    setEdges(activeEdges);
    // Fit view after nodes update
    requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 300, padding: 0.15 });
    });
  }, [activeNodes, activeEdges, setNodes, setEdges, reactFlow]);

  // Double-click at overview → expand orbital
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string; data: Record<string, unknown> }) => {
    if (level === 'overview') {
      const d = node.data as PreviewNodeData;
      setExpandedOrbital(d.orbitalName ?? node.id);
      setLevel('expanded');
      onLevelChange?.('expanded', d.orbitalName ?? node.id);
    }
  }, [level, onLevelChange]);

  // Click at expanded → show transition panel + fire callback
  const handleNodeClick = useCallback((_: React.MouseEvent, node: { id: string; data: Record<string, unknown> }) => {
    const nodeData = node.data as PreviewNodeData;
    if (level === 'expanded') {
      setSelectedNode(nodeData);
      onNodeClick?.({
        level: 'code',
        orbital: nodeData.orbitalName ?? expandedOrbital ?? '',
        trait: nodeData.traitName,
        transition: nodeData.transitionEvent,
      });
    } else {
      onNodeClick?.({
        level: 'overview',
        orbital: nodeData.orbitalName ?? node.id,
      });
    }
  }, [level, expandedOrbital, onNodeClick]);

  // Close transition panel
  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Escape key → close panel first, then go back
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedNode) {
        setSelectedNode(null);
      } else if (level === 'expanded') {
        setLevel('overview');
        setExpandedOrbital(undefined);
        onLevelChange?.('overview');
      }
    }
  }, [level, onLevelChange, selectedNode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Go back handler for breadcrumb
  const handleGoBack = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null);
    } else if (level === 'expanded') {
      setLevel('overview');
      setExpandedOrbital(undefined);
      setSelectedNode(null);
      onLevelChange?.('overview');
    }
  }, [level, onLevelChange, selectedNode]);

  const screenSizeKeys: ScreenSize[] = ['mobile', 'tablet', 'desktop'];

  return (
    <ScreenSizeContext.Provider value={screenSize}>
    <PatternSelectionContext.Provider value={patternSelectionValue}>
      <Box
        className={`flex ${className ?? ''}`}
        style={{ width, height }}
      >
      <Box className="relative flex-1 min-w-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={handleNodeClick}
          minZoom={0.1}
          maxZoom={2.0}
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

        {/* Top bar: breadcrumb + screen size toggles */}
        <Box
          className="absolute top-3 left-3 right-3 flex items-center justify-between"
          style={{ zIndex: 10 }}
        >
          {/* Breadcrumb */}
          <Box className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/80 border border-border/40 backdrop-blur-sm">
            {level === 'expanded' && (
              <button
                onClick={handleGoBack}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none p-0"
                aria-label="Go back to overview"
              >
                &larr;
              </button>
            )}
            <Typography variant="small" className="font-medium">
              {level === 'overview'
                ? 'Overview'
                : expandedOrbital ?? 'Expanded'}
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              {level === 'overview'
                ? `${nodes.length} modules`
                : `${nodes.length} screens`}
            </Typography>
          </Box>

          {/* Screen size toolbar */}
          <Box className="flex items-center gap-1 px-2 py-1 rounded-md bg-card/80 border border-border/40 backdrop-blur-sm">
            {screenSizeKeys.map((size) => {
              const p = SCREEN_SIZE_PRESETS[size];
              const active = screenSize === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    setScreenSize(size);
                    requestAnimationFrame(() => {
                      reactFlow.fitView({ duration: 300, padding: 0.15 });
                    });
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded cursor-pointer border-none transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  title={`${p.label} (${p.width}px)`}
                  aria-label={`Switch to ${p.label} view`}
                >
                  {p.label}
                </button>
              );
            })}
          </Box>
        </Box>

        {/* Status bar */}
        <Box
          className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-card/80 border border-border/40 backdrop-blur-sm"
          style={{ zIndex: 10 }}
        >
          <Typography variant="small" className="text-muted-foreground text-[11px]">
            {level === 'overview'
              ? 'Double-click a module to explore its screens'
              : 'Click a screen to view code \u00b7 Esc to go back'}
          </Typography>
        </Box>
      </Box>

      {/* Transition detail panel (slides in when a node is clicked at Level 2) */}
      {selectedNode && (
        <TransitionPanel node={selectedNode} onClose={handleClosePanel} />
      )}
      </Box>
    </PatternSelectionContext.Provider>
    </ScreenSizeContext.Provider>
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
