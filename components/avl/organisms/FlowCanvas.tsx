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

import React, { useMemo, useState, useCallback, useEffect, Profiler } from 'react';
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
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Connection,
} from '@xyflow/react';
import type { OrbitalSchema, ThemeDefinition, EntityData } from '@almadar/core';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';
import { OrbPreviewNode, ScreenSizeContext, PatternSelectionContext, type SelectedPattern } from '../molecules/OrbPreviewNode';
import { TraitCardNode, TraitCardSelectionContext, type TraitCardTransitionClick } from '../molecules/TraitCardNode';
import { EventFlowEdge } from '../molecules/EventFlowEdge';
import { schemaToOverviewGraph, orbitalToExpandedGraph, orbitalAliasToExpandedGraph, orbitalToTraitGraph } from '../molecules/avl-preview-converter';
import type { ViewLevel, PreviewNodeData, EventEdgeData, ScreenSize } from '../molecules/avl-preview-types';
import { SCREEN_SIZE_PRESETS, detectScreenSize } from '../molecules/avl-preview-types';
import { OrbInspector } from './OrbInspector';
import { validateWire } from '../molecules/wire-validation';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { BehaviorComposeNode } from '../molecules/BehaviorComposeNode';
import { behaviorsToComposeGraph } from '../molecules/avl-behavior-compose-converter';
import type { ComposeViewLevel, BehaviorCanvasEntry, BehaviorWireEdgeData, BehaviorComposeNodeData } from '../molecules/avl-behavior-compose-types';
import { createLogger } from '@almadar/logger';
import { perfStart, perfEnd, profilerOnRender } from '../../../runtime/perf';

// ---------------------------------------------------------------------------
// Node & edge type registries
// ---------------------------------------------------------------------------

const flowCanvasLog = createLogger('almadar:ui:flow-canvas');

const NODE_TYPES: NodeTypes = {
  preview: OrbPreviewNode,
  behaviorCompose: BehaviorComposeNode,
  traitCard: TraitCardNode,
} as NodeTypes;

// AVL canvas wire check: if OrbPreviewNode / BehaviorComposeNode resolve to
// `undefined` at module init (broken upstream import, circular dependency,
// stale bundle), ReactFlow falls back to the default node renderer and the
// canvas shows empty white strips instead of orbital previews. Log the
// registry shape so the regression is visible in the browser console.
flowCanvasLog.debug('node-type-registry', () => ({
  registered: Object.keys(NODE_TYPES),
  preview: typeof OrbPreviewNode,
  previewIsValid: typeof OrbPreviewNode === 'function' || (typeof OrbPreviewNode === 'object' && OrbPreviewNode !== null),
  behaviorCompose: typeof BehaviorComposeNode,
}));

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
  mockData?: EntityData;
  className?: string;
  width?: number | string;
  height?: number | string;
  onNodeClick?: (context: {
    // 'transition' is fired when a TraitCardNode transition row is
    // clicked at `trait-expanded` level. It's not a FlowCanvas view
    // level — consumers (cosmic) use it as a signal to drill into
    // their own transition-detail view.
    level: ViewLevel | 'code' | 'transition';
    orbital: string;
    trait?: string;
    transition?: string;
  }) => void;
  onLevelChange?: (level: ViewLevel, orbital?: string) => void;
  /**
   * GAP-52: fired when the user double-clicks an orbital. Consumers (e.g. the
   * builder workspace) use this as the trigger to enter cosmic mode
   * (`AvlOrbitalsCosmicZoom`) for the focused orbital.
   *
   * The level at which this fires is controlled by `cosmicEntryLevel` (default
   * `'expanded'`). At `'expanded'` the existing overview→expanded drill is
   * preserved — the callback fires only on the second double-click. At
   * `'overview'` the callback fires on the FIRST double-click and the existing
   * drill is suppressed for that interaction. `'both'` fires at either level.
   *
   * The callback runs unconditionally — persona / permission gating is the
   * consumer's responsibility.
   */
  onOrbitalDoubleClick?: (orbital: string) => void;
  /**
   * GAP-53: which level the `onOrbitalDoubleClick` callback fires at.
   * - `'expanded'` (default, non-breaking) — fires only at L2 expanded; the
   *   first overview double-click still drills overview→expanded.
   * - `'overview'` — fires at L1 overview on the FIRST double-click. The
   *   overview→expanded drill is suppressed when the callback is provided.
   * - `'both'` — fires at either level.
   */
  cosmicEntryLevel?: 'expanded' | 'overview' | 'both';
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
  /**
   * Per-orbital generation status. Keyed by orbital name. Drives the spinner
   * + accent border treatment on the overview node and (future) the hover
   * trace surface. Defaults to `'idle'` for missing entries. Consumers
   * derive this from agent subagent_start/complete SSE events.
   */
  orbitalStatus?: Record<string, PreviewNodeData['status']>;
  /**
   * Hover handler for overview-level orbital nodes. Fires with the orbital
   * name on enter and `null` on leave. Reserved for the upcoming trace
   * tooltip: consumers will use it to anchor a popover that shows the
   * subagent's live trace + reasoning for the hovered orbital.
   */
  onOrbitalHover?: (orbitalName: string | null) => void;
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
  /**
   * Studio persona viewing the canvas. Drives `OrbInspector` tab/section
   * visibility — designers and builders hide the raw `code` tab and the
   * architect-only Entity / raw-guard / raw-effects sections; architects see
   * everything. Default `'builder'` preserves pre-Phase-2 behavior.
   */
  userType?: 'builder' | 'designer' | 'architect';
  /**
   * Project theme tokens (Design System tab only). Forwarded to `OrbInspector`
   * so the Styles tab can render an editable token list when the selection
   * originates from the synthesized `__design_system__` schema.
   */
  themeManifest?: ThemeDefinition;
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
  onOrbitalDoubleClick,
  cosmicEntryLevel = 'expanded',
  initialOrbital,
  initialLevel,
  initialSelectedNode,
  editable,
  onSchemaChange,
  onPatternDelete,
  onEventWire,
  behaviorMeta,
  orbitalStatus,
  onOrbitalHover,
  layoutHint,
  onNodeSelect,
  composeLevel,
  behaviorEntries,
  behaviorWires,
  userType = 'builder',
  themeManifest,
}: FlowCanvasProps) {
  const { t } = useTranslate();
  // Render-time NODE_TYPES / EDGE_TYPES — not module-level. When vite's
  // dep-optimizer splits @almadar/ui/avl across multiple pre-bundle
  // chunks (apps/builder triggers this), FlowCanvas and OrbPreviewNode
  // can land in different chunks. A module-level
  // `const NODE_TYPES = { preview: OrbPreviewNode }` then runs while the
  // cross-chunk `OrbPreviewNode` binding is still `undefined`, ReactFlow
  // falls back to the default node type, and the canvas renders empty
  // white strips (apps/builder regression, observed 2026-05-11 via
  // `[almadar:ui:flow-canvas] node-type-registry preview: 'undefined'`).
  // useMemo at render time captures the fully-resolved import.
  const NODE_TYPES = useMemo<NodeTypes>(() => ({
    preview: OrbPreviewNode,
    behaviorCompose: BehaviorComposeNode,
    traitCard: TraitCardNode,
  } as NodeTypes), []);
  const EDGE_TYPES_LOCAL = useMemo<EdgeTypes>(() => ({
    eventFlow: EventFlowEdge,
  } as EdgeTypes), []);

  flowCanvasLog.debug('node-type-registry:render', () => ({
    registered: Object.keys(NODE_TYPES),
    preview: typeof OrbPreviewNode,
    previewIsValid: typeof OrbPreviewNode === 'function' || (typeof OrbPreviewNode === 'object' && OrbPreviewNode !== null),
  }));

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
  // STUDIO-1: alias currently drilled into at L3 (`behavior-expanded`).
  // Cleared when leaving L3. Always paired with a non-undefined
  // `expandedOrbital` since L3 lives inside one orbital's L2.
  const [expandedBehaviorAlias, setExpandedBehaviorAlias] = useState<string | undefined>(undefined);
  // Screen size driving OrbPreviewNode width. Default is auto-detected from
  // the user's viewport on mount (SSR-safe fallback to 'laptop'), and tracks
  // window resize until the user manually picks a preset — after which their
  // choice is sticky for the session. Matches the responsiveness-audit tiers.
  const screenSizeUserOverrideRef = React.useRef(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>(() =>
    typeof window === 'undefined' ? 'laptop' : detectScreenSize(window.innerWidth),
  );
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => {
      if (screenSizeUserOverrideRef.current) return;
      setScreenSize(detectScreenSize(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const pickScreenSize = useCallback((size: ScreenSize) => {
    screenSizeUserOverrideRef.current = true;
    setScreenSize(size);
  }, []);
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
  const { composeNodes, composeEdges, overviewNodes, overviewEdges, expandedNodes, expandedEdges, behaviorExpandedNodes, behaviorExpandedEdges, traitExpandedNodes, traitExpandedEdges } = useMemo(() => {
    const t = perfStart('compose-graph');
    // Behavior-level compose graph
    const compose = (composeLevel === 'behavior' && behaviorEntries?.length)
      ? behaviorsToComposeGraph(behaviorEntries, behaviorWires ?? [], layoutHint)
      : { nodes: [], edges: [] };

    const overview = schemaToOverviewGraph(parsedSchema, mockData, behaviorMeta, layoutHint, orbitalStatus, screenSize);
    const expanded = expandedOrbital
      ? orbitalToExpandedGraph(parsedSchema, expandedOrbital, mockData, screenSize)
      : { nodes: [], edges: [] };
    // STUDIO-1: L3 (`behavior-expanded`) — only one alias bucket's
    // transitions. Computed lazily; empty unless both `expandedOrbital`
    // and `expandedBehaviorAlias` are set.
    const behaviorExpanded = (expandedOrbital && expandedBehaviorAlias)
      ? orbitalAliasToExpandedGraph(parsedSchema, expandedOrbital, expandedBehaviorAlias, mockData, screenSize)
      : { nodes: [], edges: [] };
    // COSMIC-1: trait-expanded — one card per trait of `expandedOrbital`
    // with intra-orbital `emit→listen` edges. Used by the cosmic tab L3.
    const traitExpanded = expandedOrbital
      ? orbitalToTraitGraph(parsedSchema, expandedOrbital, mockData)
      : { nodes: [], edges: [] };
    perfEnd('compose-graph', t, {
      composeNodes: compose.nodes.length,
      overviewNodes: overview.nodes.length,
      expandedNodes: expanded.nodes.length,
      behaviorExpandedNodes: behaviorExpanded.nodes.length,
      traitExpandedNodes: traitExpanded.nodes.length,
      orbitalCount: parsedSchema.orbitals?.length ?? 0,
    });
    return {
      composeNodes: compose.nodes,
      composeEdges: compose.edges,
      overviewNodes: overview.nodes,
      overviewEdges: overview.edges,
      expandedNodes: expanded.nodes,
      expandedEdges: expanded.edges,
      behaviorExpandedNodes: behaviorExpanded.nodes,
      behaviorExpandedEdges: behaviorExpanded.edges,
      traitExpandedNodes: traitExpanded.nodes,
      traitExpandedEdges: traitExpanded.edges,
    };
  }, [parsedSchema, expandedOrbital, expandedBehaviorAlias, behaviorMeta, layoutHint, composeLevel, behaviorEntries, behaviorWires, mockData, orbitalStatus, screenSize]);

  type AnyNode = Node<PreviewNodeData> | Node<BehaviorComposeNodeData>;
  type AnyEdge = Edge<EventEdgeData> | Edge<BehaviorWireEdgeData>;

  const activeNodes: AnyNode[] = (atBehaviorLevel && composeNodes.length > 0)
    ? composeNodes
    : level === 'overview' ? overviewNodes
    : level === 'behavior-expanded' ? behaviorExpandedNodes
    : level === 'trait-expanded' ? traitExpandedNodes
    : expandedNodes;
  const activeEdges: AnyEdge[] = (atBehaviorLevel && composeEdges.length > 0)
    ? composeEdges
    : level === 'overview' ? overviewEdges
    : level === 'behavior-expanded' ? behaviorExpandedEdges
    : level === 'trait-expanded' ? traitExpandedEdges
    : expandedEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(activeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeEdges);

  const reactFlow = useReactFlow();

  // Sync nodes/edges when level or schema changes. setNodes/setEdges write
  // to separate zustand stores; between them xyflow can briefly see new
  // nodes paired with old edges (or vice versa) when switching levels.
  // Clear edges FIRST so no edge ever references a node id that's about to
  // disappear, then set the new nodes, then the new edges.
  useEffect(() => {
    setEdges([]);
    setNodes(activeNodes);
    setEdges(activeEdges);
    requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 300, padding: 0.25 });
    });
  }, [activeNodes, activeEdges, setNodes, setEdges, reactFlow]);

  // Defense in depth: never render an edge whose source/target isn't in the
  // current node set. Stops orphaned overview edges from leaking into the
  // expanded view (their orbital-name source/target ids don't exist among
  // the screen-name expanded nodes) and flying off-screen.
  const visibleEdges = useMemo(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [nodes, edges]);

  // Double-click at overview → expand orbital
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
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
    // GAP-53: at overview, fire cosmic callback first if cosmicEntryLevel
    // permits — and SUPPRESS the overview→expanded drill so users get one-click
    // entry from L1. When cosmicEntryLevel is the default 'expanded', this
    // branch is skipped and the existing drill runs.
    if (level === 'overview') {
      const d = node.data as PreviewNodeData;
      const orbitalName = d.orbitalName ?? node.id;
      if (
        onOrbitalDoubleClick &&
        (cosmicEntryLevel === 'overview' || cosmicEntryLevel === 'both')
      ) {
        onOrbitalDoubleClick(orbitalName);
        return;
      }
      // Drill from orbital overview → expanded transitions (existing behavior)
      setExpandedOrbital(orbitalName);
      setLevel('expanded');
      onLevelChange?.('expanded', orbitalName);
      return;
    }
    // STUDIO-1: Drill from L2 expanded → L3 behavior-expanded when the
    // double-clicked node is a grouped imported-behavior card (carries
    // `behaviorAlias`). Runs BEFORE the cosmic drill so a click on a
    // grouped card opens the alias's transitions instead of cosmic mode.
    if (level === 'expanded') {
      const d = node.data as PreviewNodeData;
      if (d.behaviorAlias && d.orbitalName) {
        setExpandedBehaviorAlias(d.behaviorAlias);
        setLevel('behavior-expanded');
        onLevelChange?.('behavior-expanded', d.orbitalName);
        return;
      }
    }
    // GAP-52: Drill from expanded → cosmic. FlowCanvas itself stays at
    // 'expanded' (no internal level change); the consumer decides what to
    // render in cosmic mode (typically AvlOrbitalsCosmicZoom).
    if (level === 'expanded') {
      const d = node.data as PreviewNodeData;
      const orbitalName = d.orbitalName ?? node.id;
      if (
        orbitalName &&
        onOrbitalDoubleClick &&
        (cosmicEntryLevel === 'expanded' || cosmicEntryLevel === 'both')
      ) {
        onOrbitalDoubleClick(orbitalName);
      }
    }
  }, [level, onLevelChange, onOrbitalDoubleClick, cosmicEntryLevel, atBehaviorLevel, composeLevel]);

  // Click at expanded → show transition panel + fire callback.
  // Click at overview → select/highlight the orbital only. Drill to L2 is
  // the double-click gesture (see handleNodeDoubleClick). Pre-fix, a
  // single click at L1 drilled straight into expanded mode; users couldn't
  // select an orbital on the canvas without losing the overview, and any
  // stray click toggled the level. Mirror standard desktop semantics:
  // single-click selects, double-click opens.
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as PreviewNodeData;
    if (level === 'expanded') {
      setSelectedNode(nodeData);
      onNodeClick?.({
        level: 'code',
        orbital: nodeData.orbitalName ?? expandedOrbital ?? '',
        trait: nodeData.traitName,
        transition: nodeData.transitionEvent,
      });
      return;
    }
    // COSMIC-1: at `trait-expanded`, the meaningful interaction is the
    // transition-arc click inside the trait card's embedded
    // `AvlTraitScene` (routed through `TraitCardSelectionContext`).
    // ReactFlow's whole-node click bubbles up alongside the SVG click —
    // if we fell through to the overview→expanded drill below, that
    // would switch FlowCanvas to `'expanded'` and clobber the cosmic
    // trait circuit with the L2 transition-cards view. Stay put.
    if (level === 'trait-expanded') {
      return;
    }
    const orbitalName = nodeData.orbitalName ?? node.id;
    onNodeClick?.({ level: 'overview', orbital: orbitalName });
    onNodeSelect?.(orbitalName);
  }, [level, expandedOrbital, onNodeClick, onNodeSelect]);

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
      } else if (level === 'behavior-expanded') {
        // STUDIO-1: L3 → L2 (keep the orbital expansion, drop the alias)
        setLevel('expanded');
        setExpandedBehaviorAlias(undefined);
        onLevelChange?.('expanded', expandedOrbital);
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
  }, [level, onLevelChange, selectedNode, selectedPattern, onPatternDelete, atBehaviorLevel, composeLevel, expandedOrbital]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Go back handler for breadcrumb
  const handleGoBack = useCallback(() => {
    if (selectedNode) {
      setSelectedNode(null);
    } else if (level === 'behavior-expanded') {
      // STUDIO-1: L3 → L2
      setLevel('expanded');
      setExpandedBehaviorAlias(undefined);
      setSelectedNode(null);
      onLevelChange?.('expanded', expandedOrbital);
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
  }, [level, onLevelChange, selectedNode, composeLevel, atBehaviorLevel, expandedOrbital]);

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

  const screenSizeKeys: ScreenSize[] = ['mobile', 'tablet', 'laptop', 'wide'];

  // COSMIC-1: TraitCardNode (used at `trait-expanded`) bubbles row clicks
  // through this context. Translate them into the existing `onNodeClick`
  // surface with `level: 'transition'` so consumers (cosmic) can drill
  // into the transition detail scene without learning a new callback.
  const traitCardSelectionValue = useMemo(() => ({
    selectTransition: (sel: TraitCardTransitionClick) => {
      onNodeClick?.({
        level: 'transition',
        orbital: sel.orbitalName,
        trait: sel.traitName,
        transition: sel.transitionEvent,
      });
    },
  }), [onNodeClick]);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
    <PatternSelectionContext.Provider value={patternSelectionValue}>
    <TraitCardSelectionContext.Provider value={traitCardSelectionValue}>
      <Box
        className={`flex h-full ${className ?? ''}`}
        style={{ width, height }}
      >
      <Box className="relative flex-1 min-w-0 h-full">
        <ReactFlow
          nodes={nodes}
          edges={visibleEdges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES_LOCAL}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          minZoom={0.1}
          maxZoom={2.0}
          fitView
          fitViewOptions={{ padding: 0.25 }}
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
                aria-label={t('canvas.goBackToOverview')}
              >
                &larr;
              </button>
            )}
            <Typography variant="small" className="font-medium">
              {level === 'overview'
                ? t('canvas.overview')
                : expandedOrbital ?? t('canvas.expanded')}
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              {level === 'overview'
                ? t('canvas.modulesCount', { count: nodes.length })
                : t('canvas.screensCount', { count: nodes.length })}
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
                    pickScreenSize(size);
                    requestAnimationFrame(() => {
                      reactFlow.fitView({ duration: 300, padding: 0.25 });
                    });
                  }}
                  className={`px-2 py-1 text-xs font-medium rounded cursor-pointer border-none transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  title={`${p.label} (${p.width}px)`}
                  aria-label={t('canvas.switchToView', { label: p.label })}
                >
                  {p.label}
                </button>
              );
            })}
          </Box>
        </Box>

      </Box>

      {/* OrbInspector (contextual, shows when something is selected).
          On mobile/tablet (<lg) it overlays the canvas from the right with a
          backdrop, so the canvas isn't crushed to 35px next to a fixed
          340px sibling. At lg+ it returns to the inline flex-sibling layout. */}
      {selectedNode && (
        <>
          <Box
            className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
            onClick={handleClosePanel}
          />
          <Box className="fixed inset-y-0 right-0 z-50 max-w-full lg:static lg:z-auto lg:max-w-none lg:flex-shrink-0">
            <OrbInspector
              node={selectedNode}
              schema={parsedSchema}
              editable={editable}
              userType={userType}
              themeManifest={themeManifest}
              onSchemaChange={onSchemaChange}
              onClose={handleClosePanel}
            />
          </Box>
        </>
      )}
      </Box>
    </TraitCardSelectionContext.Provider>
    </PatternSelectionContext.Provider>
    </ScreenSizeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public component with ReactFlowProvider wrapper
// ---------------------------------------------------------------------------

export const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <Profiler id="flow-canvas" onRender={profilerOnRender}>
      <ReactFlowProvider>
        <FlowCanvasInner {...props} />
      </ReactFlowProvider>
    </Profiler>
  );
};

FlowCanvas.displayName = 'FlowCanvas';
