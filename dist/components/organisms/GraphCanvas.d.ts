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
import React from "react";
export interface GraphNode {
    id: string;
    label?: string;
    group?: string;
    color?: string;
    size?: number;
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
    /** Node click event */
    nodeClickEvent?: string;
    /** Layout algorithm */
    layout?: "force" | "circular" | "grid";
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const GraphCanvas: React.FC<GraphCanvasProps>;
