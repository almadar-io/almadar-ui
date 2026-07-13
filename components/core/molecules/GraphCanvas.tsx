'use client';
/**
 * GraphCanvas Organism Component
 *
 * A force-directed graph visualization component for node-link data.
 * Uses canvas (necessary for performant graph rendering) with atom wrappers.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import type { EventEmit, EventPayload } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { Card, Typography, Badge, Button, Box } from "../atoms/index";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";
import { useCanvasGestures } from "../../../hooks/useCanvasGestures";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { UiError } from '../atoms/types';

export type GraphNode = EventPayload & {
    id: string;
    label?: string;
    group?: string;
    color?: string;
    size?: number;
    /** Merge-cluster count (drawn as a top-right badge; click expands). */
    badge?: number;
    /** Position (optional, computed if missing) */
    x?: number;
    y?: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    label?: string;
    weight?: number;
    color?: string;
}

export interface GraphAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface GraphCanvasProps {
    /** Graph title */
    title?: string;
    /** Graph nodes */
    nodes?: readonly GraphNode[];
    /** Graph edges */
    edges?: readonly GraphEdge[];
    /** Canvas height */
    height?: number;
    /** Show node labels */
    showLabels?: boolean;
    /** Enable zoom/pan */
    interactive?: boolean;
    /** Enable node dragging */
    draggable?: boolean;
    /** Actions */
    actions?: readonly GraphAction[];
    /** On node click */
    onNodeClick?: (node: GraphNode) => void;
    /** On node double-click (e.g. to drill in) */
    onNodeDoubleClick?: (node: GraphNode) => void;
    /** On node badge click (e.g. to expand a merged cluster). */
    onBadgeClick?: (node: GraphNode) => void;
    /** Node click event */
    nodeClickEvent?: EventEmit<{ id: string }>;
    /** Currently selected node id (rendered emphasized) */
    selectedNodeId?: string;
    /** Force-sim repulsion strength between nodes (larger ⇒ more spread out) */
    repulsion?: number;
    /** Force-sim target edge length (larger ⇒ more spread out) */
    linkDistance?: number;
    /** Minimum empty gap (px) enforced between node edges so nodes never overlap. */
    nodeSpacing?: number;
    /** Base opacity for links when nothing is hovered (kept faint so dense graphs stay readable; incident links brighten on hover). */
    linkOpacity?: number;
    /** Layout algorithm */
    layout?: "force" | "circular" | "grid";
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: UiError | null;
    /** Additional CSS classes */
    className?: string;
}

/** Group colors using CSS variables */
const GROUP_COLORS = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-error)",
    "var(--color-info)",
    "var(--color-accent)",
];

interface SimNode extends GraphNode {
    vx: number;
    vy: number;
    fx: number;
    fy: number;
    /** Cached rendered width of the label (measured once) so collision can keep text from overlapping. */
    labelW?: number;
}

/** Offscreen 2D context reused to measure label widths (matches the label font below). */
let labelMeasureCtx: CanvasRenderingContext2D | null = null;
function measureLabelWidth(text: string): number {
    if (typeof document === "undefined") return text.length * 6;
    if (!labelMeasureCtx) labelMeasureCtx = document.createElement("canvas").getContext("2d");
    if (!labelMeasureCtx) return text.length * 6;
    labelMeasureCtx.font = "12px system-ui";
    return labelMeasureCtx.measureText(text).width;
}

function getGroupColor(group: string | undefined, groups: string[]): string {
    if (!group) return GROUP_COLORS[0];
    const idx = groups.indexOf(group);
    return GROUP_COLORS[idx % GROUP_COLORS.length];
}

/**
 * Canvas 2D `fillStyle`/`strokeStyle` cannot resolve CSS custom properties (`var(--x)`),
 * so resolve them against the element's computed style; pass through literal colors.
 */
function resolveColor(color: string, el: Element): string {
    const m = /^var\((--[^,)]+)(?:,\s*([^)]+))?\)$/.exec(color.trim());
    if (!m) return color;
    const resolved = getComputedStyle(el).getPropertyValue(m[1]).trim();
    return resolved || (m[2]?.trim() ?? '#888888');
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
    title,
    nodes: propNodes = [],
    edges: propEdges = [],
    height = 400,
    showLabels = true,
    interactive = true,
    draggable = true,
    actions,
    onNodeClick,
    onNodeDoubleClick,
    onBadgeClick,
    nodeClickEvent,
    selectedNodeId,
    repulsion = 800,
    linkDistance = 100,
    nodeSpacing = 28,
    linkOpacity = 0.18,
    layout = "force",
    isLoading = false,
    error,
    className,
}) => {
    const eventBus = useEventBus();
    const { t } = useTranslate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    // Mirror zoom/offset into refs so gesture handlers read current values without stale closures.
    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;
    const offsetRef = useRef(offset);
    offsetRef.current = offset;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const nodesRef = useRef<SimNode[]>([]);
    const [, forceUpdate] = useState(0);
    // Logical drawing width in CSS px (the canvas backing store is this × devicePixelRatio for crisp text).
    const [logicalW, setLogicalW] = useState(800);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof ResizeObserver === "undefined") return;
        const measure = () => {
            const width = Math.round(canvas.clientWidth);
            if (width > 0) setLogicalW(width);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    /** Pointer-interaction state (mutable refs to avoid re-render churn during drag/pan) */
    const interactionRef = useRef<{
        mode: "none" | "panning" | "dragging";
        dragNodeId: string | null;
        startMouse: { x: number; y: number };
        startOffset: { x: number; y: number };
        downPos: { x: number; y: number };
    }>({
        mode: "none",
        dragNodeId: null,
        startMouse: { x: 0, y: 0 },
        startOffset: { x: 0, y: 0 },
        downPos: { x: 0, y: 0 },
    });

    /** Convert a mouse event to screen-space (relative to canvas) and graph-space coords. */
    const toCoords = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const rect = canvas.getBoundingClientRect();
            // Canvas is drawn in CSS-px logical space (the ctx is pre-scaled by devicePixelRatio),
            // so client px relative to the rect already match the drawing coords — no extra scaling.
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            return {
                screenX,
                screenY,
                graphX: (screenX - offset.x) / zoom,
                graphY: (screenY - offset.y) / zoom,
            };
        },
        [offset, zoom],
    );

    /** Hit-test the topmost node at the given graph coords. */
    const nodeAt = useCallback((graphX: number, graphY: number): SimNode | undefined => {
        return nodesRef.current.find((n) => {
            const dist = Math.sqrt((n.x! - graphX) ** 2 + (n.y! - graphY) ** 2);
            return dist < (n.size || 8) + 4;
        });
    }, []);

    const handleAction = useCallback(
        (action: GraphAction) => {
            if (action.event) {
                eventBus.emit(`UI:${action.event}`, {});
            }
        },
        [eventBus],
    );

    const handleNodeClick = useCallback(
        (node: GraphNode) => {
            if (nodeClickEvent) {
                eventBus.emit(`UI:${nodeClickEvent}`, { id: node.id, row: node });
            }
            onNodeClick?.(node);
        },
        [nodeClickEvent, eventBus, onNodeClick],
    );

    const groups = useMemo(
        () => [...new Set(propNodes.map((n) => n.group).filter(Boolean))] as string[],
        [propNodes],
    );

    // Initialize node positions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || propNodes.length === 0) return;

        const w = logicalW;
        const h = height;

        const simNodes: SimNode[] = propNodes.map((n, idx) => {
            let x = n.x ?? 0;
            let y = n.y ?? 0;

            if (!n.x || !n.y) {
                if (layout === "circular") {
                    const angle = (idx / propNodes.length) * 2 * Math.PI;
                    const radius = Math.min(w, h) * 0.35;
                    x = w / 2 + radius * Math.cos(angle);
                    y = h / 2 + radius * Math.sin(angle);
                } else if (layout === "grid") {
                    const cols = Math.ceil(Math.sqrt(propNodes.length));
                    const gapX = w / (cols + 1);
                    const gapY = h / (Math.ceil(propNodes.length / cols) + 1);
                    x = gapX * ((idx % cols) + 1);
                    y = gapY * (Math.floor(idx / cols) + 1);
                } else {
                    // Force layout: random initial positions
                    x = w * 0.2 + Math.random() * w * 0.6;
                    y = h * 0.2 + Math.random() * h * 0.6;
                }
            }

            return { ...n, x, y, vx: 0, vy: 0, fx: 0, fy: 0 };
        });

        nodesRef.current = simNodes;

        // Simple force simulation for force layout
        if (layout === "force") {
            let iterations = 0;
            const maxIterations = 300;

            const tick = () => {
                const nodes = nodesRef.current;
                const centerX = w / 2;
                const centerY = h / 2;

                // Reset forces
                for (const node of nodes) {
                    node.fx = 0;
                    node.fy = 0;
                }

                // Repulsion between all nodes
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[j].x! - nodes[i].x!;
                        const dy = nodes[j].y! - nodes[i].y!;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = repulsion / (dist * dist);
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        nodes[i].fx -= fx;
                        nodes[i].fy -= fy;
                        nodes[j].fx += fx;
                        nodes[j].fy += fy;
                    }
                }

                // Attraction along edges — weight scales BOTH target distance and pull
                // strength, so high-similarity links draw nodes into a tight knot while weak
                // links stay loose. Unweighted/structural edges default to w=1 (tight).
                for (const edge of propEdges) {
                    const source = nodes.find((n) => n.id === edge.source);
                    const target = nodes.find((n) => n.id === edge.target);
                    if (!source || !target) continue;

                    const dx = target.x! - source.x!;
                    const dy = target.y! - source.y!;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const w = Math.min(1, Math.max(0, edge.weight ?? 1));
                    const linkTarget = linkDistance * (0.5 + (1 - w) * 1.5); // w=1→0.5×, w=0→2×
                    const force = (dist - linkTarget) * (0.04 + 0.1 * w);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    source.fx += fx;
                    source.fy += fy;
                    target.fx -= fx;
                    target.fy -= fy;
                }

                // Cluster centroid gravity — pull each node toward its group's centroid so
                // same-cluster nodes form visible islands; singletons drift to canvas center.
                const centroids = new Map<string, { x: number; y: number; n: number }>();
                for (const node of nodes) {
                    const g = node.group ?? "__none__";
                    let c = centroids.get(g);
                    if (!c) { c = { x: 0, y: 0, n: 0 }; centroids.set(g, c); }
                    c.x += node.x!; c.y += node.y!; c.n += 1;
                }
                for (const node of nodes) {
                    const c = centroids.get(node.group ?? "__none__");
                    if (c && c.n > 1) {
                        node.fx += (c.x / c.n - node.x!) * 0.04;
                        node.fy += (c.y / c.n - node.y!) * 0.04;
                    } else {
                        node.fx += (centerX - node.x!) * 0.01;
                        node.fy += (centerY - node.y!) * 0.01;
                    }
                }

                // Apply forces
                const damping = 0.9;
                for (const node of nodes) {
                    node.vx = (node.vx + node.fx) * damping;
                    node.vy = (node.vy + node.fy) * damping;
                    node.x! += node.vx;
                    node.y! += node.vy;

                    // Boundary
                    node.x = Math.max(30, Math.min(w - 30, node.x!));
                    node.y = Math.max(30, Math.min(h - 30, node.y!));
                }

                // Collision separation — hard constraint via axis-aligned boxes that cover the
                // node circle AND its label (drawn centered below), so neither circles nor text
                // overlap. Push apart along the axis of least penetration each iteration.
                const LABEL_GAP = 12; // label baseline offset below the circle (matches render)
                const LABEL_H = 16; // one line of 12px text
                const pad = nodeSpacing / 2;
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const a = nodes[i];
                        const b = nodes[j];
                        const ar = a.size || 8;
                        const br = b.size || 8;
                        if (showLabels) {
                            if (a.labelW === undefined) a.labelW = a.label ? measureLabelWidth(a.label) : 0;
                            if (b.labelW === undefined) b.labelW = b.label ? measureLabelWidth(b.label) : 0;
                        }
                        const labelBelow = showLabels ? LABEL_GAP + LABEL_H : 0;
                        const aHalfW = Math.max(ar, (a.labelW ?? 0) / 2) + pad;
                        const bHalfW = Math.max(br, (b.labelW ?? 0) / 2) + pad;
                        const aTop = a.y! - ar - pad, aBot = a.y! + ar + labelBelow + pad;
                        const bTop = b.y! - br - pad, bBot = b.y! + br + labelBelow + pad;
                        const overlapX =
                            Math.min(a.x! + aHalfW, b.x! + bHalfW) - Math.max(a.x! - aHalfW, b.x! - bHalfW);
                        const overlapY = Math.min(aBot, bBot) - Math.max(aTop, bTop);
                        if (overlapX > 0 && overlapY > 0) {
                            if (overlapX <= overlapY) {
                                const push = (overlapX / 2) * (b.x! >= a.x! ? 1 : -1);
                                a.x = Math.max(30, Math.min(w - 30, a.x! - push));
                                b.x = Math.max(30, Math.min(w - 30, b.x! + push));
                            } else {
                                const push = (overlapY / 2) * ((bTop + bBot) >= (aTop + aBot) ? 1 : -1);
                                a.y = Math.max(30, Math.min(h - 30, a.y! - push));
                                b.y = Math.max(30, Math.min(h - 30, b.y! + push));
                            }
                        }
                    }
                }

                iterations++;
                forceUpdate((n) => n + 1);
                if (iterations < maxIterations) {
                    animRef.current = requestAnimationFrame(tick);
                }
            };

            animRef.current = requestAnimationFrame(tick);
        } else {
            forceUpdate((n) => n + 1);
        }

        return () => {
            cancelAnimationFrame(animRef.current);
        };
    }, [propNodes, propEdges, layout, repulsion, linkDistance, nodeSpacing, showLabels, logicalW, height]);

    // Render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = logicalW;
        const h = height;
        const nodes = nodesRef.current;
        const accentColor = resolveColor("var(--color-accent)", canvas);
        const fontFamily = resolveColor("var(--font-family)", canvas) || "system-ui";
        const fgColor = resolveColor("var(--color-foreground)", canvas);
        const mutedColor = resolveColor("var(--color-muted-foreground)", canvas) || fgColor;
        const bgColor = resolveColor("var(--color-background)", canvas) || "#ffffff";
        const accentFg = resolveColor("var(--color-accent-foreground)", canvas) || "#ffffff";
        const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;

        // Pre-scale by devicePixelRatio so the backing store renders crisp on HiDPI displays.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // When hovering a node, the connected nodes/edges stay lit and the rest dim.
        const neighbors = new Set<string>();
        if (hoveredNode) {
            neighbors.add(hoveredNode);
            for (const edge of propEdges) {
                if (edge.source === hoveredNode) neighbors.add(String(edge.target));
                else if (edge.target === hoveredNode) neighbors.add(String(edge.source));
            }
        }

        // Draw edges
        for (const edge of propEdges) {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) continue;

            const incident = !!hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            // Links stay faint by default so a dense graph reads as a backdrop; the edges
            // incident to a hovered node light up while the rest drop further back.
            // Weight (unweighted edges default to w=1, i.e. unchanged) scales opacity and
            // width linearly so stronger semantic edges read more prominently than weaker ones.
            const w = edge.weight ?? 1;
            ctx.globalAlpha = hoveredNode ? (incident ? 1 : 0.05) : linkOpacity * w;
            ctx.beginPath();
            ctx.moveTo(source.x!, source.y!);
            ctx.lineTo(target.x!, target.y!);
            ctx.strokeStyle = incident ? accentColor : (edge.color || "#888888");
            ctx.lineWidth = incident ? 2 : Math.max(0.75, w);
            ctx.stroke();

            // Edge label
            if (edge.label && showLabels) {
                const mx = (source.x! + target.x!) / 2;
                const my = (source.y! + target.y!) / 2;
                ctx.fillStyle = mutedColor;
                ctx.font = `9px ${fontFamily}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(edge.label, mx, my - 4);
            }
        }
        ctx.globalAlpha = 1;

        // Draw nodes
        for (const node of nodes) {
            const size = node.size || 8;
            const color = resolveColor(node.color || getGroupColor(node.group, groups), canvas);
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNodeId !== undefined && node.id === selectedNodeId;

            ctx.globalAlpha = hoveredNode && !neighbors.has(node.id) ? 0.2 : 1;
            const radius = isSelected ? size + 4 : isHovered ? size + 2 : size;

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            if (isSelected) {
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = isHovered ? "#ffffff" : "#00000020";
                ctx.lineWidth = isHovered ? 2 : 1;
            }
            ctx.stroke();

            // Label — theme font/color with a background halo so it reads over nodes/edges.
            if (showLabels && node.label) {
                ctx.font = `${isSelected || isHovered ? "600" : "500"} 12px ${fontFamily}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const ly = node.y! + radius + 14;
                ctx.lineWidth = 3;
                ctx.lineJoin = "round";
                ctx.strokeStyle = bgColor;
                ctx.strokeText(node.label, node.x!, ly);
                ctx.fillStyle = (isSelected || isHovered) ? fgColor : mutedColor;
                ctx.fillText(node.label, node.x!, ly);
            }

            // Merge-count badge (top-right) — click expands the cluster.
            if (node.badge && node.badge > 1) {
                const bx = node.x! + radius * 0.7;
                const by = node.y! - radius * 0.7;
                const br = Math.max(7, Math.min(11, radius * 0.45));
                ctx.beginPath();
                ctx.arc(bx, by, br, 0, Math.PI * 2);
                ctx.fillStyle = accentColor;
                ctx.fill();
                ctx.strokeStyle = bgColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = accentFg;
                ctx.font = `600 9px ${fontFamily}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String(node.badge), bx, by + 0.5);
            }
        }

        ctx.restore();
    });

    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.2, 3)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.2, 0.3)), []);
    const handleReset = useCallback(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    // Zoom by `factor` keeping the canvas point (cx,cy) fixed. Shared by wheel + pinch
    // (via useCanvasGestures). Refs avoid stale zoom/offset inside the gesture callbacks.
    const applyZoom = useCallback((factor: number, cx: number, cy: number) => {
        if (!interactive) return;
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(0.3, Math.min(3, oldZoom * factor));
        if (newZoom === oldZoom) return;
        const o = offsetRef.current;
        setOffset({
            x: cx - (cx - o.x) * (newZoom / oldZoom),
            y: cy - (cy - o.y) * (newZoom / oldZoom),
        });
        setZoom(newZoom);
    }, [interactive]);

    const applyPanDelta = useCallback((dx: number, dy: number) => {
        if (!interactive) return;
        setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    }, [interactive]);

    // A second finger started a pinch — abandon any single-pointer pan/drag in progress.
    const cancelSinglePointer = useCallback(() => {
        interactionRef.current.mode = "none";
        interactionRef.current.dragNodeId = null;
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const coords = toCoords(e);
            if (!coords) return;
            const node = nodeAt(coords.graphX, coords.graphY);
            const state = interactionRef.current;
            state.downPos = { x: e.clientX, y: e.clientY };
            state.startMouse = { x: e.clientX, y: e.clientY };
            state.startOffset = { ...offset };

            if (draggable && node) {
                state.mode = "dragging";
                state.dragNodeId = node.id;
            } else if (interactive) {
                state.mode = "panning";
                state.dragNodeId = null;
            } else {
                state.mode = "none";
                state.dragNodeId = null;
            }
        },
        [toCoords, nodeAt, draggable, interactive, offset],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const state = interactionRef.current;

            if (state.mode === "panning") {
                const dx = e.clientX - state.startMouse.x;
                const dy = e.clientY - state.startMouse.y;
                setOffset({ x: state.startOffset.x + dx, y: state.startOffset.y + dy });
                return;
            }

            if (state.mode === "dragging" && state.dragNodeId) {
                const coords = toCoords(e);
                if (!coords) return;
                const node = nodesRef.current.find((n) => n.id === state.dragNodeId);
                if (node) {
                    node.x = coords.graphX;
                    node.y = coords.graphY;
                    node.vx = 0;
                    node.vy = 0;
                    forceUpdate((n) => n + 1);
                }
                return;
            }

            // Hover hit-test when idle
            const coords = toCoords(e);
            if (!coords) return;
            const node = nodeAt(coords.graphX, coords.graphY);
            setHoveredNode(node?.id ?? null);
        },
        [toCoords, nodeAt],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const state = interactionRef.current;
            const moved =
                Math.abs(e.clientX - state.downPos.x) + Math.abs(e.clientY - state.downPos.y);
            state.mode = "none";
            state.dragNodeId = null;

            // Treat as a click only if the pointer barely moved (not a drag/pan).
            if (moved < 4) {
                const coords = toCoords(e);
                if (!coords) return;
                const node = nodeAt(coords.graphX, coords.graphY);
                if (node) {
                    // Badge (top-right) takes priority when present.
                    if (node.badge && node.badge > 1 && onBadgeClick) {
                        const r = (node.size || 8) + (selectedNodeId === node.id ? 4 : 0);
                        const bx = node.x! + r * 0.7;
                        const by = node.y! - r * 0.7;
                        const br = Math.max(7, Math.min(11, r * 0.45)) + 3;
                        if (Math.hypot(coords.graphX - bx, coords.graphY - by) <= br) {
                            onBadgeClick(node);
                            return;
                        }
                    }
                    handleNodeClick(node);
                }
            }
        },
        [toCoords, nodeAt, handleNodeClick, onBadgeClick, selectedNodeId],
    );

    const handlePointerLeave = useCallback(() => {
        setHoveredNode(null);
    }, []);

    const gestureHandlers = useCanvasGestures({
        canvasRef,
        enabled: interactive || draggable,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onZoom: applyZoom,
        onPanDelta: applyPanDelta,
        onMultiTouchStart: cancelSinglePointer,
    });

    const handleDoubleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const coords = toCoords(e);
            if (!coords) return;
            const node = nodeAt(coords.graphX, coords.graphY);
            if (node) onNodeDoubleClick?.(node);
        },
        [toCoords, nodeAt, onNodeDoubleClick],
    );

    if (isLoading) {
        return <LoadingState message={t('common.loading')} className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title={t('display.graphError')}
                message={error.message}
                className={className}
            />
        );
    }

    if (propNodes.length === 0) {
        return (
            <EmptyState
                title={t('display.noGraphData')}
                description="No nodes to display."
                className={className}
            />
        );
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <VStack gap="none">
                {/* Header */}
                {(title || (actions && actions.length > 0) || interactive) && (
                    <HStack
                        gap="sm"
                        align="center"
                        justify="between"
                        className="px-4 py-2 border-b border-border"
                    >
                        {title && (
                            <Typography variant="h6" weight="semibold">
                                {title}
                            </Typography>
                        )}
                        <HStack gap="xs" align="center">
                            {interactive && (
                                <>
                                    <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
                                    <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
                                    <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset} />
                                </>
                            )}
                            {actions?.map((action, idx) => (
                                <Badge
                                    key={idx}
                                    variant="default"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleAction(action)}
                                >
                                    {action.label}
                                </Badge>
                            ))}
                        </HStack>
                    </HStack>
                )}

                {/* Canvas — necessary for performant graph rendering */}
                <Box className="w-full bg-background">
                    <canvas
                        ref={canvasRef}
                        width={Math.round(logicalW * ((typeof window !== "undefined" && window.devicePixelRatio) || 1))}
                        height={Math.round(height * ((typeof window !== "undefined" && window.devicePixelRatio) || 1))}
                        className="w-full cursor-grab active:cursor-grabbing touch-none"
                        style={{ height }}
                        onPointerDown={gestureHandlers.onPointerDown}
                        onPointerMove={gestureHandlers.onPointerMove}
                        onPointerUp={gestureHandlers.onPointerUp}
                        onPointerCancel={gestureHandlers.onPointerCancel}
                        onPointerLeave={handlePointerLeave}
                        onWheel={gestureHandlers.onWheel}
                        onDoubleClick={handleDoubleClick}
                    />
                </Box>

                {/* Legend */}
                {groups.length > 1 && (
                    <HStack gap="md" className="px-4 py-2 border-t border-border" wrap>
                        {groups.map((group, idx) => (
                            <HStack key={group} gap="xs" align="center">
                                <Box
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                                />
                                <Typography variant="caption" color="secondary">
                                    {group}
                                </Typography>
                            </HStack>
                        ))}
                    </HStack>
                )}
            </VStack>
        </Card>
    );
};

GraphCanvas.displayName = "GraphCanvas";
