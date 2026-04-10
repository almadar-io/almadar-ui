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
  type Connection,
} from '@xyflow/react';
import type { OrbitalSchema } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { OrbPreviewNode, ScreenSizeContext, PatternSelectionContext, type SelectedPattern } from '../../molecules/avl/OrbPreviewNode';
import { EventFlowEdge } from '../../molecules/avl/EventFlowEdge';
import { schemaToOverviewGraph, orbitalToExpandedGraph } from '../../molecules/avl/avl-preview-converter';
import type { ViewLevel, PreviewNodeData, ScreenSize } from '../../molecules/avl/avl-preview-types';
import { SCREEN_SIZE_PRESETS } from '../../molecules/avl/avl-preview-types';
import { OrbInspector } from './OrbInspector';
import { validateWire } from '../../molecules/avl/wire-validation';
import { useEventBus } from '../../../hooks/useEventBus';
import { BehaviorComposeNode } from '../../molecules/avl/BehaviorComposeNode';
import { behaviorsToComposeGraph } from '../../molecules/avl/avl-behavior-compose-converter';
import type { ComposeViewLevel, BehaviorCanvasEntry, BehaviorWireEdgeData, BehaviorComposeNodeData } from '../../molecules/avl/avl-behavior-compose-types';

// ---------------------------------------------------------------------------
// Node & edge type registries
// ---------------------------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  preview: OrbPreviewNode,
  behaviorCompose: BehaviorComposeNode,
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
  /** Start at Level 2 (expanded) when initialOrbital is set. Default: 'overview'. */
  initialLevel?: ViewLevel;
  /** Pre-select a node on mount (opens OrbInspector). */
  initialSelectedNode?: PreviewNodeData;
  /** Enable editing in the inspector. When true, fields become inputs. */
  editable?: boolean;
  /** Called when the user edits the schema via the inspector. */
  onSchemaChange?: (schema: OrbitalSchema) => void;
  /** Called when the user presses Delete/Backspace with a pattern selected. */
  onPatternDelete?: (context: { patternId: string; nodeData: PreviewNodeData }) => void;
  /** Called when the user drags from a source handle to a target handle (event wiring). */
  onEventWire?: (wire: { eventName: string; sourceOrbital: string; targetOrbital: string; sourceTraitName?: string; targetTraitName?: string }) => void;
  /** Behavior layer metadata for node styling (layer color bands). */
  behaviorMeta?: Record<string, { layer: string }>;
  /** Layout hint: 'pipeline' renders nodes left-to-right, 'grid' (default) uses sqrt-based grid. */
  layoutHint?: 'pipeline' | 'grid';
  /** Called when the user clicks a node in overview level (for composition hints). */
  onNodeSelect?: (orbitalName: string) => void;
  /** When 'behavior', shows behavior-level glyph nodes instead of orbital previews. */
  composeLevel?: ComposeViewLevel;
  /** Behavior entries for compose mode (only when composeLevel='behavior'). */
  behaviorEntries?: BehaviorCanvasEntry[];
  /** Event wires between behaviors (only when composeLevel='behavior'). */
  behaviorWires?: BehaviorWireEdgeData[];
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
  initialLevel,
  initialSelectedNode,
  editable,
  onSchemaChange,
  onPatternDelete,
  onEventWire,
  behaviorMeta,
  layoutHint,
  onNodeSelect,
  composeLevel,
  behaviorEntries,
  behaviorWires,
}: FlowCanvasProps) {
  const parsedSchema = useMemo<OrbitalSchema>(() => {
    if (typeof schemaProp === 'string') return JSON.parse(schemaProp) as OrbitalSchema;
    return schemaProp;
  }, [schemaProp]);

  // Navigation state
  const [level, setLevel] = useState<ViewLevel>(
    initialLevel ?? (initialOrbital ? 'expanded' : 'overview'),
  );
  const [expandedOrbital, setExpandedOrbital] = useState<string | undefined>(
    initialOrbital,
  );
  const [screenSize, setScreenSize] = useState<ScreenSize>('tablet');
  const [selectedNode, setSelectedNode] = useState<PreviewNodeData | null>(initialSelectedNode ?? null);
  const [selectedPattern, setSelectedPattern] = useState<SelectedPattern | null>(null);

  const patternSelectionValue = useMemo(() => ({
    selected: selectedPattern,
    select: (p: SelectedPattern | null) => {
      setSelectedPattern(p);
      // When a pattern is selected, also set the node for OrbInspector
      if (p) setSelectedNode(p.nodeData);
    },
  }), [selectedPattern]);

  // Track whether we're at the behavior compose level (for drill-down/escape)
  const [atBehaviorLevel, setAtBehaviorLevel] = useState(composeLevel === 'behavior');

  // Compute graph for current level
  const { composeNodes, composeEdges, overviewNodes, overviewEdges, expandedNodes, expandedEdges } = useMemo(() => {
    // Behavior-level compose graph
    const compose = (composeLevel === 'behavior' && behaviorEntries?.length)
      ? behaviorsToComposeGraph(behaviorEntries, behaviorWires ?? [], layoutHint)
      : { nodes: [], edges: [] };

    const overview = schemaToOverviewGraph(parsedSchema, mockData, behaviorMeta, layoutHint);
    const expanded = expandedOrbital
      ? orbitalToExpandedGraph(parsedSchema, expandedOrbital, mockData)
      : { nodes: [], edges: [] };
    return {
      composeNodes: compose.nodes,
      composeEdges: compose.edges,
      overviewNodes: overview.nodes,
      overviewEdges: overview.edges,
      expandedNodes: expanded.nodes,
      expandedEdges: expanded.edges,
    };
  }, [parsedSchema, expandedOrbital, behaviorMeta, layoutHint, composeLevel, behaviorEntries, behaviorWires]);

  // Both compose and orbital nodes flow through the same React Flow instance.
  // Cast to Node<Record<string, unknown>> for the union.
  type AnyNode = import('@xyflow/react').Node<Record<string, unknown>>;
  type AnyEdge = import('@xyflow/react').Edge<Record<string, unknown>>;

  const activeNodes: AnyNode[] = (atBehaviorLevel && composeNodes.length > 0)
    ? composeNodes
    : level === 'overview' ? overviewNodes : expandedNodes;
  const activeEdges: AnyEdge[] = (atBehaviorLevel && composeEdges.length > 0)
    ? composeEdges
    : level === 'overview' ? overviewEdges : expandedEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(activeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeEdges);

  const reactFlow = useReactFlow();

  // Sync nodes/edges when level or schema changes
  useEffect(() => {
    setNodes(activeNodes);
    setEdges(activeEdges);
    // fitView is handled by the fitView prop on <ReactFlow> for initial render,
    // and by onNodesChange for subsequent updates. No manual timeout needed.
    requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 300, padding: 0.15 });
    });
  }, [activeNodes, activeEdges, setNodes, setEdges, reactFlow]);

  // Double-click at overview → expand orbital
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string; data: Record<string, unknown> }) => {
    // Drill from behavior level → orbital overview
    if (atBehaviorLevel && composeLevel === 'behavior') {
      const d = node.data as BehaviorComposeNodeData;
      // Filter schema to only this behavior's orbitals and switch to overview level
      if (d.orbitalNames?.length) {
        setExpandedOrbital(d.orbitalNames[0]);
      }
      setAtBehaviorLevel(false);
      setLevel('overview');
      onLevelChange?.('overview', d.behaviorName);
      return;
    }
    // Drill from orbital overview → expanded transitions
    if (level === 'overview') {
      const d = node.data as PreviewNodeData;
      setExpandedOrbital(d.orbitalName ?? node.id);
      setLevel('expanded');
      onLevelChange?.('expanded', d.orbitalName ?? node.id);
    }
  }, [level, onLevelChange, atBehaviorLevel, composeLevel]);

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
      onNodeSelect?.(nodeData.orbitalName ?? node.id);
    }
  }, [level, expandedOrbital, onNodeClick]);

  // Close transition panel
  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Escape key → close panel first, then go back
  // Delete/Backspace → delete selected pattern
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedNode) {
        setSelectedNode(null);
      } else if (level === 'expanded') {
        setLevel('overview');
        setExpandedOrbital(undefined);
        onLevelChange?.('overview');
      } else if (level === 'overview' && composeLevel === 'behavior' && !atBehaviorLevel) {
        // Go back to behavior compose level
        setAtBehaviorLevel(true);
        setExpandedOrbital(undefined);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Don't intercept when user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (selectedPattern && selectedPattern.nodeData) {
        onPatternDelete?.({ patternId: selectedPattern.patternId ?? '', nodeData: selectedPattern.nodeData });
        setSelectedPattern(null);
      }
    }
  }, [level, onLevelChange, selectedNode, selectedPattern, onPatternDelete]);

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
    } else if (level === 'overview' && composeLevel === 'behavior' && !atBehaviorLevel) {
      setAtBehaviorLevel(true);
      setExpandedOrbital(undefined);
      setSelectedNode(null);
    }
  }, [level, onLevelChange, selectedNode, composeLevel, atBehaviorLevel]);

  // Event wire drag: onConnect fires when user drags handle to handle
  const eventBus = useEventBus();

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.sourceHandle?.startsWith('event-') || !onEventWire) return;
    const eventName = connection.sourceHandle.replace('event-', '');
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    if (!sourceNode || !targetNode) return;

    const srcData = sourceNode.data as PreviewNodeData;
    const tgtData = targetNode.data as PreviewNodeData;

    // Wire validation: check payload compatibility
    const sourceEventSource = srcData.eventSources?.find(es => es.event === eventName);
    const sourcePayload = sourceEventSource?.payloadFields;
    // Look for a matching event on the target side for payload expectations
    const targetEventSource = tgtData.eventSources?.find(es => es.event === eventName);
    const targetPayload = targetEventSource?.payloadFields;
    const validation = validateWire(sourcePayload, targetPayload);
    if (validation.warnings.length > 0) {
      eventBus.emit('UI:WIRE_VALIDATION_WARNING', {
        eventName,
        sourceOrbital: srcData.orbitalName,
        targetOrbital: tgtData.orbitalName,
        warnings: validation.warnings,
      });
    }

    onEventWire({
      eventName,
      sourceOrbital: srcData.orbitalName ?? '',
      targetOrbital: tgtData.orbitalName ?? '',
      sourceTraitName: srcData.traitName,
      targetTraitName: tgtData.traitName,
    });
  }, [nodes, onEventWire, eventBus]);

  const screenSizeKeys: ScreenSize[] = ['mobile', 'tablet', 'desktop'];

  return (
    <ScreenSizeContext.Provider value={screenSize}>
    <PatternSelectionContext.Provider value={patternSelectionValue}>
      <Box
        className={`flex h-full ${className ?? ''}`}
        style={{ width, height }}
      >
      <Box className="relative flex-1 min-w-0 h-full">
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
          onConnect={handleConnect}
          minZoom={0.1}
          maxZoom={2.0}
          fitView
          fitViewOptions={{ padding: 0.15 }}
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

      {/* OrbInspector (contextual, shows when something is selected) */}
      {selectedNode && (
        <OrbInspector
          node={selectedNode}
          schema={parsedSchema}
          editable={editable}
          onSchemaChange={onSchemaChange}
          onClose={handleClosePanel}
        />
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
