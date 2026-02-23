/**
 * Timeline Organism Component
 *
 * A vertical timeline component for displaying chronological events.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export type TimelineItemStatus = "complete" | "active" | "pending" | "error";
export interface TimelineItem {
    /** Unique identifier */
    id: string;
    /** Item title */
    title: string;
    /** Item description */
    description?: string;
    /** Timestamp string */
    date?: string;
    /** Status indicator */
    status?: TimelineItemStatus;
    /** Icon override */
    icon?: LucideIcon;
    /** Additional metadata tags */
    tags?: readonly string[];
}
export interface TimelineAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface TimelineProps {
    /** Timeline title */
    title?: string;
    /** Timeline items */
    items?: readonly TimelineItem[];
    /** Schema-driven data */
    data?: readonly Record<string, unknown>[];
    /** Fields to display */
    fields?: readonly string[];
    /** Actions per item */
    itemActions?: readonly TimelineAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const Timeline: React.FC<TimelineProps>;
