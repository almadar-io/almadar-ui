'use client';

/**
 * FlowCanvas — V3 UI Projection Canvas
 *
 * The canvas IS the app. Nodes show rendered UI thumbnails from
 * render-ui effects. Edges show events connecting screens.
 *
 * Local view (default): one orbital card, Tab / Shift+Tab to move between
 * orbitals. World view: every orbital card. Each card picks the state it
 * shows from a dropdown in its header.
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
  useNodesInitialized,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Connection,
} from '@xyflow/react';
import type { EditFocus, OrbitalSchema, ThemeDefinition, EntityData } from '@almadar/core';
import { Box } from '../../core/atoms/Box';
import { Typography } from '../../core/atoms/Typography';
import { Button } from '../../core/atoms/Button';
import { Icon } from '../../core/atoms/Icon';
import { Select } from '../../core/atoms/Select';
import { ButtonGroup } from '../../core/molecules/ButtonGroup';
import { IconButton } from '../../core/molecules/IconButton';
import { useCompactLayout } from '../../core/organisms/layout/DockLayout';
import { ElementEditAccessContext, type ElementEditAccessResolver } from '../lib/element-edit-access';
import { OrbPreviewNode, ScreenSizeContext, PatternSelectionContext, CanvasToolsContext, CanvasStatePickerContext, type CanvasStatePicker, type SelectedPattern } from '../molecules/OrbPreviewNode';
import { CANVAS_TOOLS, type CanvasTool } from '../lib/canvas-tools';
import { TraitCardNode, TraitCardSelectionContext, type TraitCardTransitionClick } from '../molecules/TraitCardNode';
import { EventFlowEdge } from '../molecules/EventFlowEdge';
import { canvasViewGraph, stateOptionsOf, initialStateOf, orbitalToTraitGraph, LIVE_STATE, type CanvasStateOptions } from '../lib/avl-preview-converter';
import type { ViewLevel, PreviewNodeData, EventEdgeData, ScreenSize } from '../types/avl-preview-types';
import { SCREEN_SIZE_PRESETS, detectScreenSize } from '../types/avl-preview-types';
import { OrbInspector } from './OrbInspector';
import { validateWire } from '../lib/wire-validation';
import { useEventBus } from '../../../hooks/useEventBus';
import { isEditableTarget } from '../../../lib/keyMapEvent';
import { useTranslate } from '../../../hooks/useTranslate';
import { createLogger } from '@almadar/logger';
import { perfStart, perfEnd, profilerOnRender } from '../../../lib/perf';

// ---------------------------------------------------------------------------
// Node & edge type registries
// ---------------------------------------------------------------------------

const flowCanvasLog = createLogger('almadar:ui:flow-canvas');

const NODE_TYPES: NodeTypes = {
  preview: OrbPreviewNode,
  traitCard: TraitCardNode,
} as NodeTypes;

// AVL canvas wire check: if OrbPreviewNode resolves to
// `undefined` at module init (broken upstream import, circular dependency,
// stale bundle), ReactFlow falls back to the default node renderer and the
// canvas shows empty white strips instead of orbital previews. Log the
// registry shape so the regression is visible in the browser console.
flowCanvasLog.debug('node-type-registry', () => ({
  registered: Object.keys(NODE_TYPES),
  preview: typeof OrbPreviewNode,
  previewIsValid: typeof OrbPreviewNode === 'function' || (typeof OrbPreviewNode === 'object' && OrbPreviewNode !== null),
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

type CanvasNode = Node<PreviewNodeData>;

function isPreviewCard(n: CanvasNode): n is Node<PreviewNodeData> {
  return n.type === 'preview';
}

function withCardWidth(n: CanvasNode, width: number): CanvasNode {
  return isPreviewCard(n) ? { ...n, data: { ...n.data, cardWidth: width } } : n;
}

/** `local`: only the focused orbital's card; `world`: every orbital's card. */
export type CanvasScope = 'local' | 'world';

export interface CanvasFocusChange {
  orbital: string;
  scope: CanvasScope;
  /** The focused card's chosen state (`LIVE_STATE` for the live orbital). */
  state: string;
}

/** Where a card sits on the canvas, and its frame width when the designer resized it. */
export interface CanvasNodePlacement {
  x: number;
  y: number;
  width?: number;
}

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
  /** Fired when the focused orbital, the scope, or the focused card's state changes. */
  onFocusChange?: (focus: CanvasFocusChange) => void;
  /** The orbital cards open on (local view) — or, with `initialLevel="trait-expanded"`, the orbital whose traits are shown. */
  initialOrbital?: string;
  /** `trait-expanded`: one card per trait of `initialOrbital` (cosmic). Default: orbital cards. */
  initialLevel?: ViewLevel;
  /** Focus this orbital (e.g. picked in a Layers panel); changing it moves the focus without remounting. */
  focusedOrbital?: string;
  /** Pre-select a node on mount (opens OrbInspector). */
  initialSelectedNode?: PreviewNodeData;
  /** Enable editing in the inspector. When true, fields become inputs. */
  editable?: boolean;
  /** Called when the user edits the schema via the inspector. */
  onSchemaChange?: (schema: OrbitalSchema) => void;
  /** Called when the user presses Delete/Backspace with patterns selected (all of a multi-select). */
  onPatternDelete?: (context: { patternIds: string[]; nodeData: PreviewNodeData; elements?: EditFocus[] }) => void;
  /** Editing tools the canvas turns on (a persona's shell manifest declares them); all by default. */
  tools?: readonly CanvasTool[];
  /** What each element lets the user change (knob, data-bound, fixed by a behavior); every prop is editable without it. */
  elementAccess?: ElementEditAccessResolver;
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
  /**
   * Persisted node positions keyed by node id. When the node set changes
   * (level/schema switch), any id present here overrides the computed layout
   * position, restoring a user's manual drag arrangement. Node ids are unique
   * per view level, so a single flat map covers overview + expanded. A saved
   * `width` restores a card frame the designer resized.
   */
  nodePositions?: Record<string, CanvasNodePlacement>;
  /**
   * Fired on node drag-stop and card resize with the full {id → placement}
   * map of the current node set, so the consumer can persist the arrangement.
   */
  onPositionsChange?: (positions: Record<string, CanvasNodePlacement>) => void;
  /**
   * Fired whenever the internal `selectedNode` changes — select, clear-on-
   * escape, clear-on-level-change, and pattern-selection sync all route
   * through this. Lets a consumer mirror selection into a persistent
   * properties panel rendered outside the canvas (see `externalInspector`).
   */
  onSelectedNodeChange?: (node: PreviewNodeData | null) => void;
  /**
   * Fired whenever the in-node pattern selection changes (a pattern click
   * inside `OrbPreviewNode`, cleared on background click / Escape / pattern
   * delete). `PatternSelectionContext` is internal to this component's own
   * render tree, so an externally-rendered `OrbInspector` (see
   * `externalInspector`) has no other way to learn which pattern the user
   * picked — pass this straight through to `OrbInspector`'s `selectedPattern`
   * prop to keep Design-tab prop editing working outside the canvas.
   */
  onSelectedPatternChange?: (pattern: SelectedPattern | null) => void;
  /**
   * When true, FlowCanvas does not render its inline `OrbInspector` — the
   * consumer is expected to render one externally, fed by
   * `onSelectedNodeChange` + `onSelectedPatternChange`. Selection
   * highlighting, keyboard delete, and every other behavior is unchanged.
   * Default `false` preserves the built-in inline panel.
   */
  externalInspector?: boolean;
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
  onFocusChange,
  initialOrbital,
  initialLevel,
  focusedOrbital: focusedOrbitalProp,
  initialSelectedNode,
  editable,
  onSchemaChange,
  onPatternDelete,
  tools = CANVAS_TOOLS,
  elementAccess,
  onEventWire,
  behaviorMeta,
  orbitalStatus,
  layoutHint,
  onNodeSelect,
  userType = 'builder',
  themeManifest,
  nodePositions,
  onPositionsChange,
  onSelectedNodeChange,
  onSelectedPatternChange,
  externalInspector = false,
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

  const traitLevel = initialLevel === 'trait-expanded';
  const compact = useCompactLayout();
  const [scope, setScope] = useState<CanvasScope>('local');
  const scopeRef = React.useRef(scope);
  scopeRef.current = scope;
  const [focusRequest, setFocusRequest] = useState<string | undefined>(focusedOrbitalProp ?? initialOrbital);
  const [stateByOrbital, setStateByOrbital] = useState<Record<string, string>>({});
  // A focus change in world view centres on the focused card instead of re-fitting every card.
  const fitFocusedRef = React.useRef(false);
  const pendingFitRef = React.useRef<{ centreOn: string | undefined } | null>(null);
  useEffect(() => {
    if (focusedOrbitalProp === undefined) return;
    fitFocusedRef.current = true;
    setFocusRequest(focusedOrbitalProp);
  }, [focusedOrbitalProp]);

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
  const [selectedNode, setSelectedNodeInternal] = useState<PreviewNodeData | null>(initialSelectedNode ?? null);
  // Single choke point for every selection change so `onSelectedNodeChange`
  // never misses a call site (select, clear-on-escape, pattern-selection sync).
  const setSelectedNode = useCallback((node: PreviewNodeData | null) => {
    setSelectedNodeInternal(node);
    onSelectedNodeChange?.(node);
  }, [onSelectedNodeChange]);
  const [selectedPattern, setSelectedPatternInternal] = useState<SelectedPattern | null>(null);
  // Single choke point for every pattern-selection change, mirroring
  // `setSelectedNode` above — keeps `onSelectedPatternChange` in sync with
  // every call site (select, clear-on-background-click, delete) instead of
  // only the ones that happen to go through `patternSelectionValue.select`.
  const setSelectedPattern = useCallback((p: SelectedPattern | null) => {
    setSelectedPatternInternal(p);
    onSelectedPatternChange?.(p);
  }, [onSelectedPatternChange]);

  const patternSelectionValue = useMemo(() => ({
    selected: selectedPattern,
    select: (p: SelectedPattern | null) => {
      setSelectedPattern(p);
      // When a pattern is selected, also set the node for OrbInspector
      if (p) setSelectedNode(p.nodeData);
    },
  }), [selectedPattern, setSelectedNode, setSelectedPattern]);

  // Designers see one state per distinct screen; everyone else one per transition.
  const stateView = userType === 'designer' ? 'screens' : 'transitions';

  const { canvas, traitExpandedNodes, traitExpandedEdges } = useMemo(() => {
    const t = perfStart('canvas-graph');
    const view = canvasViewGraph(parsedSchema, {
      scope,
      focusedOrbital: focusRequest,
      stateByOrbital,
      view: stateView,
      mockData,
      behaviorMeta,
      layoutHint,
      orbitalStatus,
      screenSize,
    });
    // COSMIC-1: one card per trait of `initialOrbital` with intra-orbital `emit→listen` edges.
    const traitExpanded = traitLevel && initialOrbital
      ? orbitalToTraitGraph(parsedSchema, initialOrbital, mockData)
      : { nodes: [], edges: [] };
    perfEnd('canvas-graph', t, {
      canvasNodes: view.nodes.length,
      traitExpandedNodes: traitExpanded.nodes.length,
      orbitalCount: parsedSchema.orbitals?.length ?? 0,
    });
    return {
      canvas: view,
      traitExpandedNodes: traitExpanded.nodes,
      traitExpandedEdges: traitExpanded.edges,
    };
  }, [parsedSchema, scope, focusRequest, stateByOrbital, stateView, traitLevel, initialOrbital, behaviorMeta, layoutHint, mockData, orbitalStatus, screenSize]);

  const focusedOrbital = canvas.focusedOrbital;
  const orbitalNames = useMemo(() => (parsedSchema.orbitals ?? []).map((o) => o.name), [parsedSchema]);

  const activeNodes: CanvasNode[] = traitLevel ? traitExpandedNodes : canvas.nodes;
  const activeEdges: Edge<EventEdgeData>[] = traitLevel ? traitExpandedEdges : canvas.edges;

  const [nodes, setNodes, onNodesChange] = useNodesState(activeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeEdges);

  const reactFlow = useReactFlow();

  // Persisted-position overlay. Held in a ref and read only when the node SET
  // changes, so a consumer updating its store mid-drag never clobbers the
  // live xyflow positions.
  const savedPositionsRef = React.useRef(nodePositions);
  savedPositionsRef.current = nodePositions;
  // Latest nodes via ref so onNodeDragStop reads post-drag positions without
  // rebuilding its closure every drag frame.
  const nodesRef = React.useRef(nodes);
  nodesRef.current = nodes;

  // Sync nodes/edges when the view or schema changes. setNodes/setEdges write
  // to separate zustand stores; between them xyflow can briefly see new
  // nodes paired with old edges (or vice versa). Clear edges FIRST so no
  // edge ever references a node id that's about to disappear, then set the
  // new nodes (overlaid with any saved positions), then the new edges.
  useEffect(() => {
    setEdges([]);
    const saved = savedPositionsRef.current;
    // A saved position places a card in the world view; the local view's one
    // card sits at the origin. A resized width applies in both.
    const merged = saved
      ? activeNodes.map((n) => {
          const placement = saved[n.id];
          if (!placement) return n;
          const placed = scope === 'world' ? { ...n, position: { x: placement.x, y: placement.y } } : n;
          return placement.width !== undefined ? withCardWidth(placed, placement.width) : placed;
        })
      : activeNodes;
    setNodes(merged);
    setEdges(activeEdges);
    // Fit once the new cards are measured — fitting before that leaves the
    // viewport where it was (the card off-centre).
    pendingFitRef.current = { centreOn: fitFocusedRef.current && scope === 'world' ? focusedOrbital : undefined };
    fitFocusedRef.current = false;
  }, [activeNodes, activeEdges, setNodes, setEdges, scope, focusedOrbital]);

  const nodesInitialized = useNodesInitialized();
  useEffect(() => {
    const pending = pendingFitRef.current;
    if (!nodesInitialized || !pending) return;
    pendingFitRef.current = null;
    void reactFlow.fitView({ duration: 300, padding: 0.25, ...(pending.centreOn ? { nodes: [{ id: pending.centreOn }] } : {}) });
  }, [nodesInitialized, nodes, reactFlow]);


  // Defense in depth: never render an edge whose source/target isn't in the
  // current node set.
  const visibleEdges = useMemo(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [nodes, edges]);

  const focusOrbital = useCallback((orbital: string) => {
    fitFocusedRef.current = true;
    setFocusRequest(orbital);
  }, []);

  const stepFocus = useCallback((step: 1 | -1) => {
    if (orbitalNames.length === 0) return;
    const at = focusedOrbital ? orbitalNames.indexOf(focusedOrbital) : -1;
    focusOrbital(orbitalNames[(at + step + orbitalNames.length) % orbitalNames.length]);
  }, [orbitalNames, focusedOrbital, focusOrbital]);

  const stateOptionsCache = useMemo(() => new Map<string, CanvasStateOptions>(), [parsedSchema, stateView, mockData]);
  const optionsOf = useCallback((orbital: string): CanvasStateOptions => {
    const cached = stateOptionsCache.get(orbital);
    if (cached) return cached;
    const options = stateOptionsOf(parsedSchema, orbital, stateView, mockData);
    stateOptionsCache.set(orbital, options);
    return options;
  }, [stateOptionsCache, parsedSchema, stateView, mockData]);
  // The picked state while it still exists, else the card's INIT state (as `canvasViewGraph` resolves it).
  const chosenStateOf = useCallback((orbital: string): string => {
    const asked = stateByOrbital[orbital];
    const options = optionsOf(orbital);
    const exists = asked === LIVE_STATE || [...options.own, ...options.groups.flatMap((g) => g.options)].some((o) => o.id === asked);
    return exists && asked !== undefined ? asked : initialStateOf(options);
  }, [stateByOrbital, optionsOf]);

  useEffect(() => {
    if (!focusedOrbital || traitLevel) return;
    onFocusChange?.({ orbital: focusedOrbital, scope, state: chosenStateOf(focusedOrbital) });
  }, [focusedOrbital, scope, chosenStateOf, traitLevel, onFocusChange]);

  const statePicker = useMemo<CanvasStatePicker>(() => ({
    optionsOf,
    chosen: chosenStateOf,
    choose: (orbital, stateId) => {
      setSelectedPattern(null);
      setSelectedNode(null);
      setStateByOrbital((prev) => ({ ...prev, [orbital]: stateId }));
    },
  }), [optionsOf, chosenStateOf, setSelectedPattern, setSelectedNode]);

  // A card showing a picked state selects it (the inspector follows); a card
  // showing the live orbital only reports the orbital. In world view a click
  // also focuses that orbital.
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // COSMIC-1: at `trait-expanded` the meaningful interaction is the
    // transition-arc click inside the trait card (TraitCardSelectionContext).
    if (traitLevel) return;
    const nodeData = node.data as PreviewNodeData;
    const orbitalName = nodeData.orbitalName ?? node.id;
    if (scope === 'world' && orbitalName !== focusedOrbital) setFocusRequest(orbitalName);
    if (nodeData.traitName) {
      setSelectedNode(nodeData);
      onNodeClick?.({
        level: 'code',
        orbital: orbitalName,
        trait: nodeData.traitName,
        transition: nodeData.transitionEvent,
      });
      return;
    }
    onNodeClick?.({ level: 'overview', orbital: orbitalName });
    onNodeSelect?.(orbitalName);
  }, [traitLevel, scope, focusedOrbital, onNodeClick, onNodeSelect, setSelectedNode]);

  // Close transition panel
  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Escape closes the panel; Delete/Backspace deletes the selected pattern.
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedNode) setSelectedNode(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Don't intercept when user is typing in an input
      if (isEditableTarget(e.target)) return;
      if (selectedPattern && selectedPattern.nodeData) {
        const patternIds = selectedPattern.selection ?? (selectedPattern.patternId ? [selectedPattern.patternId] : []);
        if (patternIds.length > 0) {
          onPatternDelete?.({ patternIds, nodeData: selectedPattern.nodeData, ...(selectedPattern.elements ? { elements: selectedPattern.elements } : {}) });
        }
        setSelectedPattern(null);
      }
    }
  }, [selectedNode, selectedPattern, onPatternDelete, setSelectedNode, setSelectedPattern]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Tab / Shift+Tab move between orbitals while the canvas has focus; Escape
  // with nothing selected hands focus back to the page.
  const handleCanvasKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (traitLevel || isEditableTarget(e.target)) return;
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey && orbitalNames.length > 1) {
      e.preventDefault();
      stepFocus(e.shiftKey ? -1 : 1);
    } else if (e.key === 'Escape' && !selectedNode && !selectedPattern) {
      e.currentTarget.blur();
    }
  }, [traitLevel, orbitalNames.length, stepFocus, selectedNode, selectedPattern]);

  const eventBus = useEventBus();

  // Event wire drag: onConnect fires when user drags handle to handle
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

  // Persist the arrangement: the current cards' placements merged over the
  // saved ones, so a local view (one card) never erases the others. A card in
  // the local view keeps its world position (its drawn origin isn't one).
  const worldPositionsRef = React.useRef(canvas.worldPositions);
  worldPositionsRef.current = canvas.worldPositions;
  const placementsOf = useCallback((list: readonly CanvasNode[]): Record<string, CanvasNodePlacement> => {
    const positions: Record<string, CanvasNodePlacement> = { ...savedPositionsRef.current };
    for (const n of list) {
      const width = isPreviewCard(n) ? n.data.cardWidth : undefined;
      const at = scopeRef.current === 'world' ? n.position : (savedPositionsRef.current?.[n.id] ?? worldPositionsRef.current[n.id] ?? n.position);
      positions[n.id] = { x: at.x, y: at.y, ...(typeof width === 'number' ? { width } : {}) };
    }
    return positions;
  }, []);

  const handleNodeDragStop = useCallback(() => {
    onPositionsChange?.(placementsOf(nodesRef.current));
  }, [onPositionsChange, placementsOf]);

  // A card's frame was resized (OrbPreviewNode's right-edge control).
  useEffect(() => eventBus.on('UI:CANVAS_CARD_RESIZED', (e) => {
    const nodeId = e.payload?.nodeId;
    const width = e.payload?.width;
    if (typeof nodeId !== 'string' || typeof width !== 'number') return;
    if (!nodesRef.current.some((n) => n.id === nodeId)) return;
    const next = nodesRef.current.map((n) => (n.id === nodeId ? withCardWidth(n, width) : n));
    setNodes(next);
    onPositionsChange?.(placementsOf(next));
  }), [eventBus, setNodes, onPositionsChange, placementsOf]);

  const screenSizeKeys: ScreenSize[] = ['mobile', 'tablet', 'laptop', 'wide'];
  const isScreenSize = (value: string): value is ScreenSize => screenSizeKeys.some((k) => k === value);
  const applyScreenSize = (size: ScreenSize) => {
    pickScreenSize(size);
    requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 300, padding: 0.25 });
    });
  };

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

  const showOrbitalNav = !traitLevel && orbitalNames.length > 0;

  return (
    <ScreenSizeContext.Provider value={screenSize}>
    <CanvasToolsContext.Provider value={tools}>
    <CanvasStatePickerContext.Provider value={traitLevel ? null : statePicker}>
    <ElementEditAccessContext.Provider value={elementAccess ?? null}>
    <PatternSelectionContext.Provider value={patternSelectionValue}>
    <TraitCardSelectionContext.Provider value={traitCardSelectionValue}>
      <Box
        className={`flex h-full ${className ?? ''}`}
        style={{ width, height }}
      >
      <Box
        className="relative flex-1 min-w-0 h-full outline-none flex flex-col"
        tabIndex={0}
        onKeyDown={handleCanvasKeyDown}
        data-testid="flow-canvas"
      >
        {/* Top bar: orbital focus + scope, screen size — above the canvas, never over its cards */}
        <Box
          className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border/40 bg-background"
          data-testid="flow-canvas-toolbar"
        >
          {showOrbitalNav ? (
            <>
              <Box data-testid="canvas-orbital-nav" className="flex flex-nowrap items-center gap-1 min-w-0">
              <IconButton
                icon="chevron-left"
                label={t('canvas.previousOrbital')}
                tooltipPosition="bottom"
                className="w-10 h-10 sm:w-7 sm:h-7"
                data-testid="canvas-orbital-prev"
                disabled={orbitalNames.length < 2}
                onClick={() => stepFocus(-1)}
              />
              <Select
                options={orbitalNames.map((name) => ({ value: name, label: name }))}
                value={focusedOrbital ?? ''}
                onValueChange={(value) => { if (typeof value === 'string') focusOrbital(value); }}
                aria-label={t('canvas.focusedOrbital')}
                data-testid="canvas-orbital-picker"
                className="h-10 sm:h-7 py-0 text-sm min-w-0 max-w-[12rem]"
              />
              <IconButton
                icon="chevron-right"
                label={t('canvas.nextOrbital')}
                tooltipPosition="bottom"
                className="w-10 h-10 sm:w-7 sm:h-7"
                data-testid="canvas-orbital-next"
                disabled={orbitalNames.length < 2}
                onClick={() => stepFocus(1)}
              />
              </Box>
              <ButtonGroup variant="segmented">
                {(['local', 'world'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={scope === s ? 'primary' : 'ghost'}
                    size="sm"
                    className="h-10 sm:h-button-sm"
                    aria-pressed={scope === s}
                    data-testid={`canvas-scope-${s}`}
                    title={t(s === 'local' ? 'canvas.scopeLocalHint' : 'canvas.scopeWorldHint')}
                    onClick={() => setScope(s)}
                  >
                    {t(s === 'local' ? 'canvas.scopeLocal' : 'canvas.scopeWorld')}
                  </Button>
                ))}
              </ButtonGroup>
            </>
          ) : (
            <Box className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/80 border border-border/40 backdrop-blur-sm">
              <Typography variant="small" className="font-medium">
                {traitLevel ? (initialOrbital ?? t('canvas.overview')) : t('canvas.overview')}
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                {t('canvas.modulesCount', { count: nodes.length })}
              </Typography>
            </Box>
          )}

          {/* Screen size: one dropdown on phones, the preset buttons above sm */}
          <Box className="sm:hidden ml-auto">
            <Select
              options={screenSizeKeys.map((size) => ({ value: size, label: `${SCREEN_SIZE_PRESETS[size].label} (${SCREEN_SIZE_PRESETS[size].width}px)` }))}
              value={screenSize}
              onValueChange={(value) => { if (typeof value === 'string' && isScreenSize(value)) applyScreenSize(value); }}
              aria-label={t('canvas.screenSize')}
              data-testid="canvas-screen-size-picker"
              className="h-10 py-0 text-sm bg-card/80"
            />
          </Box>
          <Box className="hidden sm:flex ml-auto" data-testid="canvas-screen-size-buttons">
            <ButtonGroup variant="segmented" className="bg-card/80 backdrop-blur-sm rounded-md">
              {screenSizeKeys.map((size) => {
                const p = SCREEN_SIZE_PRESETS[size];
                return (
                  <Button
                    key={size}
                    variant={screenSize === size ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => applyScreenSize(size)}
                    title={`${p.label} (${p.width}px)`}
                    aria-label={t('canvas.switchToView', { label: p.label })}
                    aria-pressed={screenSize === size}
                  >
                    {p.label}
                  </Button>
                );
              })}
            </ButtonGroup>
          </Box>
        </Box>
        <Box className="relative flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={visibleEdges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES_LOCAL}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          zoomOnDoubleClick={false}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
          minZoom={0.1}
          maxZoom={2.0}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={scope === 'world'}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          style={{ background: 'var(--color-background)' }}
        >
          {/* Compact (phones, tablets): pinch zooms, and the buttons would sit under the tool strip. */}
          {!compact && (
            <Controls
              showInteractive={false}
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          )}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--color-border)"
          />
        </ReactFlow>
        </Box>

      </Box>

      {/* OrbInspector (contextual, shows when something is selected).
          On mobile/tablet (<lg) it overlays the canvas from the right with a
          backdrop, so the canvas isn't crushed to 35px next to a fixed
          340px sibling. At lg+ it returns to the inline flex-sibling layout.
          Suppressed when `externalInspector` is set — the consumer renders
          its own panel outside the canvas, fed by `onSelectedNodeChange`. */}
      {!externalInspector && selectedNode && (
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
    </ElementEditAccessContext.Provider>
    </CanvasStatePickerContext.Provider>
    </CanvasToolsContext.Provider>
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
