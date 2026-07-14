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

/**
 * All-pairs similarity (cosine 0–1) used ONLY for layout, never drawn — `edges`
 * remain the only rendered links. It is the SECONDARY macro-layout: pairs that are
 * NOT directly connected get a weak spring (higher cosine ⇒ closer) so clusters
 * arrange relative to each other, while drawn `edges` stay the primary tight
 * structure. When omitted, edges alone drive the layout.
 */
export interface GraphSimilarity {
    source: string;
    target: string;
    /** Cosine similarity in [0,1]; higher ⇒ closer. */
    weight: number;
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
    /** Graph edges (the only rendered links) */
    edges?: readonly GraphEdge[];
    /**
     * All-pairs similarity (cosine 0–1) used ONLY for layout, never drawn. It is the
     * secondary macro-layout: non-connected pairs get a weak spring (higher cosine ⇒
     * closer) so clusters arrange relative to each other; drawn `edges` stay the
     * primary tight structure. When omitted, edges alone drive the layout.
     */
    similarity?: readonly GraphSimilarity[];
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

/** Offscreen 2D context reused to measure label widths (matches the rendered label font). */
let labelMeasureCtx: CanvasRenderingContext2D | null = null;
function measureLabelWidth(text: string, fontFamily = "system-ui"): number {
    if (typeof document === "undefined") return text.length * 6;
    if (!labelMeasureCtx) labelMeasureCtx = document.createElement("canvas").getContext("2d");
    if (!labelMeasureCtx) return text.length * 6;
    labelMeasureCtx.font = `12px ${fontFamily}`;
    return labelMeasureCtx.measureText(text).width + 4;
}

function getGroupColor(group: string | undefined, groups: string[]): string {
    if (!group) return GROUP_COLORS[0];
    const idx = groups.indexOf(group);
    return GROUP_COLORS[idx % GROUP_COLORS.length];
}

/** Deterministic 32-bit string hash — the seed for the layout PRNG. */
function hashSeed(str: string): number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return (h ^= h >>> 16) >>> 0;
}

/** mulberry32: tiny deterministic PRNG so a graph lays out identically on every load. */
function mulberry32(a: number): () => number {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Order-independent key for a node pair — used to tell drawn edges from similarity-only pairs. */
function edgeKeyOf(a: string, b: string): string {
    return a < b ? `${a}\0${b}` : `${b}\0${a}`;
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
    similarity: propSimilarity = [],
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
    const laidOutRef = useRef(false);
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
        // Theme font the labels render in — used to size the collision boxes so they match the text on screen.
        const labelFont = resolveColor("var(--font-family)", canvas) || "system-ui";

        // Preserve settled positions across data changes so the graph doesn't re-explode
        // and re-settle every time nodes/edges change (e.g. expanding a merge badge).
        const prevPos = new Map<string, { x: number; y: number }>();
        for (const pn of nodesRef.current) if (pn.x != null && pn.y != null) prevPos.set(pn.id, { x: pn.x!, y: pn.y! });

        const simNodes: SimNode[] = propNodes.map((n, idx) => {
            const prev = prevPos.get(n.id);
            let x = prev?.x ?? n.x ?? 0;
            let y = prev?.y ?? n.y ?? 0;

            if (!prev && (!n.x || !n.y)) {
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
                    // Force layout: deterministic seeded initial positions (stable per node id,
                    // so the same graph settles into the same layout on every load).
                    const rand = mulberry32(hashSeed(n.id));
                    x = w * 0.2 + rand() * w * 0.6;
                    y = h * 0.2 + rand() * h * 0.6;
                }
            }

            return { ...n, x, y, vx: 0, vy: 0, fx: 0, fy: 0 };
        });

        nodesRef.current = simNodes;

        // Relayout only on the very first layout, or when the node set changes substantially
        // (e.g. an L1→L2 drill is a different graph). React-Query refetches, window resize, and
        // badge-expand all preserve every settled position so the graph never "shifts around".
        const prevIds = new Set<string>([...prevPos.keys()]);
        const newIdList = simNodes.map((n) => n.id);
        const kept = newIdList.filter((id) => prevIds.has(id)).length;
        const overlap = prevIds.size === 0 ? 0 : kept / Math.max(prevIds.size, newIdList.length);
        const fullRelayout = !laidOutRef.current || overlap < 0.5;

        // Simple force simulation for force layout
        if (layout === "force") {
            const maxIterations = 300;
            const COOL = 0.12; // spring temperature floor — late iterations let collision win the settle
            const COLLIDE_PASSES = 6; // label-aware relaxation passes per tick
            const LABEL_GAP = 12; // label sits below the circle (matches render)
            const LABEL_H = 16; // one line of 12px text

            const tick = (iter: number) => {
                const nodes = nodesRef.current;
                const centerX = w / 2;
                const centerY = h / 2;
                // Cooling schedule: strong springs early to find structure, weak late so the
                // collision constraint can settle the graph without the springs re-breaking it.
                const temp = Math.max(COOL, 1 - iter / maxIterations);

                // Reset forces
                for (const node of nodes) {
                    node.fx = 0;
                    node.fy = 0;
                }

                // Repulsion between all nodes (cooled)
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[j].x! - nodes[i].x!;
                        const dy = nodes[j].y! - nodes[i].y!;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = (repulsion / (dist * dist)) * temp;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        nodes[i].fx -= fx;
                        nodes[i].fy -= fy;
                        nodes[j].fx += fx;
                        nodes[j].fy += fy;
                    }
                }

                const nodeById = new Map(nodes.map((n) => [n.id, n] as const));
                const spring = (a: SimNode, b: SimNode, rest: number, k: number) => {
                    const dx = b.x! - a.x!;
                    const dy = b.y! - a.y!;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist - rest) * k * temp;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    a.fx += fx;
                    a.fy += fy;
                    b.fx -= fx;
                    b.fy -= fy;
                };

                // Drawn edges are the PRIMARY structure: a strong, tight spring so connected nodes
                // clearly cluster. Weight nudges the rest length (higher ⇒ tighter).
                const drawnPairs = new Set<string>();
                for (const edge of propEdges) {
                    const source = nodeById.get(edge.source);
                    const target = nodeById.get(edge.target);
                    if (!source || !target) continue;
                    drawnPairs.add(edgeKeyOf(edge.source, edge.target));
                    const w = Math.min(1, Math.max(0, edge.weight ?? 1));
                    spring(source, target, linkDistance * (0.35 + (1 - w) * 0.3), 0.14);
                }

                // All-pairs similarity is the SECONDARY macro-layout: only pairs that are NOT directly
                // connected get a weak spring so clusters arrange relative to each other without
                // fighting the tight edge springs.
                for (const pair of propSimilarity) {
                    if (drawnPairs.has(edgeKeyOf(pair.source, pair.target))) continue;
                    const source = nodeById.get(pair.source);
                    const target = nodeById.get(pair.target);
                    if (!source || !target) continue;
                    const w = Math.min(1, Math.max(0, pair.weight));
                    spring(source, target, linkDistance * (1.35 - 0.55 * w), 0.015);
                }

                // Cluster centroid gravity — only when there are ≥2 clusters, so same-cluster nodes
                // form visible islands. A single-cluster graph would otherwise be crushed into one
                // knot; there we fall back to a gentle global centering.
                const centroids = new Map<string, { x: number; y: number; n: number }>();
                for (const node of nodes) {
                    const g = node.group ?? "__none__";
                    let c = centroids.get(g);
                    if (!c) { c = { x: 0, y: 0, n: 0 }; centroids.set(g, c); }
                    c.x += node.x!; c.y += node.y!; c.n += 1;
                }
                const multiCluster = centroids.size > 1;
                for (const node of nodes) {
                    if (multiCluster) {
                        const c = centroids.get(node.group ?? "__none__");
                        if (c && c.n > 1) {
                            node.fx += (c.x / c.n - node.x!) * 0.04 * temp;
                            node.fy += (c.y / c.n - node.y!) * 0.04 * temp;
                        } else {
                            node.fx += (centerX - node.x!) * 0.01 * temp;
                            node.fy += (centerY - node.y!) * 0.01 * temp;
                        }
                    } else {
                        node.fx += (centerX - node.x!) * 0.008 * temp;
                        node.fy += (centerY - node.y!) * 0.008 * temp;
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

                // Label-aware collision. Each node is TWO boxes — the circle and the label hanging
                // below it — checked separately so connected nodes can sit close while only genuinely
                // overlapping circles/text push apart. Multi-pass relaxation with velocity zeroing
                // makes it a hard constraint the springs can't re-break.
                const pad = nodeSpacing / 2;
                type Rect = readonly [number, number, number, number];
                const rectsOf = (n: SimNode): { circle: Rect; label: Rect } => {
                    const r = n.size || 8;
                    const lw = showLabels ? (n.labelW ?? (n.labelW = n.label ? measureLabelWidth(n.label, labelFont) : 0)) : 0;
                    return {
                        circle: [n.x! - r - pad, n.y! - r - pad, n.x! + r + pad, n.y! + r + pad],
                        label: [n.x! - lw / 2 - pad, n.y! + r + LABEL_GAP - 8, n.x! + lw / 2 + pad, n.y! + r + LABEL_GAP + LABEL_H],
                    };
                };
                const sep = (r1: Rect, r2: Rect): { axis: "x" | "y"; depth: number; sign: number } | null => {
                    const ox = Math.min(r1[2], r2[2]) - Math.max(r1[0], r2[0]);
                    const oy = Math.min(r1[3], r2[3]) - Math.max(r1[1], r2[1]);
                    if (ox <= 0 || oy <= 0) return null;
                    return ox <= oy
                        ? { axis: "x", depth: ox, sign: r1[0] + r1[2] < r2[0] + r2[2] ? 1 : -1 }
                        : { axis: "y", depth: oy, sign: r1[1] + r1[3] < r2[1] + r2[3] ? 1 : -1 };
                };
                for (let pass = 0; pass < COLLIDE_PASSES; pass++) {
                    for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                            const a = nodes[i];
                            const b = nodes[j];
                            const ra = rectsOf(a);
                            const rb = rectsOf(b);
                            let best: { axis: "x" | "y"; depth: number; sign: number } | null = null;
                            for (const [r1, r2] of [[ra.circle, rb.circle], [ra.circle, rb.label], [ra.label, rb.circle], [ra.label, rb.label]] as const) {
                                const s = sep(r1, r2);
                                if (s && (!best || s.depth < best.depth)) best = s;
                            }
                            if (best) {
                                const push = best.depth / 2;
                                if (best.axis === "x") {
                                    a.x = Math.max(30, Math.min(w - 30, a.x! - push * best.sign));
                                    b.x = Math.max(30, Math.min(w - 30, b.x! + push * best.sign));
                                    a.vx = 0;
                                    b.vx = 0;
                                } else {
                                    a.y = Math.max(30, Math.min(h - 30, a.y! - push * best.sign));
                                    b.y = Math.max(30, Math.min(h - 30, b.y! + push * best.sign));
                                    a.vy = 0;
                                    b.vy = 0;
                                }
                            }
                        }
                    }
                }
            };

            if (fullRelayout) {
                // Run the simulation synchronously to a settled state (no per-frame animation).
                for (let i = 0; i < maxIterations; i++) tick(i);
                laidOutRef.current = true;
            } else {
                // Patch only: keep every settled node where it is and place newly-appeared nodes
                // in a spiral around their cluster centroid (or canvas center if none).
                const centroids = new Map<string, { x: number; y: number; n: number }>();
                for (const node of simNodes) {
                    if (!prevPos.has(node.id)) continue;
                    const g = node.group ?? "__none__";
                    let c = centroids.get(g);
                    if (!c) { c = { x: 0, y: 0, n: 0 }; centroids.set(g, c); }
                    c.x += node.x!; c.y += node.y!; c.n += 1;
                }
                const ringCount = new Map<string, number>();
                for (const node of simNodes) {
                    if (prevPos.has(node.id)) continue;
                    const g = node.group ?? "__none__";
                    const c = centroids.get(g);
                    const cx = c && c.n > 0 ? c.x / c.n : w / 2;
                    const cy = c && c.n > 0 ? c.y / c.n : h / 2;
                    const k = ringCount.get(g) ?? 0;
                    ringCount.set(g, k + 1);
                    const angle = k * 2.399963; // golden-angle sunflower spiral
                    const r = 22 + k * 8;
                    node.x = Math.max(30, Math.min(w - 30, cx + r * Math.cos(angle)));
                    node.y = Math.max(30, Math.min(h - 30, cy + r * Math.sin(angle)));
                }
            }
            forceUpdate((n) => n + 1);
        } else {
            forceUpdate((n) => n + 1);
        }

        return () => {
            cancelAnimationFrame(animRef.current);
        };
    }, [propNodes, propEdges, propSimilarity, layout, repulsion, linkDistance, nodeSpacing, showLabels]);

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
