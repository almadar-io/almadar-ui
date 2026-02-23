/**
 * List Organism Component
 *
 * A beautifully designed, scannable list view.
 *
 * Design inspiration: Linear, Notion, Apple Reminders
 * - Soft, harmonious color palette
 * - Refined typography with proper hierarchy
 * - Subtle shadows and depth
 * - Delightful hover micro-interactions
 * - Elegant status indicators
 *
 * Closed Circuit Compliance (Dumb Organism):
 * - Receives ALL data via props (no internal fetch)
 * - Emits events via useEventBus (UI:SELECT, UI:DESELECT, UI:VIEW)
 * - Never listens to events — only emits
 * - No internal search/filter state — trait provides filtered data
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { type MenuItem } from "../molecules/Menu";
import type { EntityDisplayProps } from "./types";
export interface ListItem {
    id: string;
    title?: string;
    description?: string;
    icon?: LucideIcon;
    avatar?: {
        src?: string;
        alt?: string;
        initials?: string;
    };
    badge?: string | number;
    metadata?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    completed?: boolean;
    [key: string]: unknown;
    _fields?: Record<string, unknown>;
}
export interface SchemaItemAction {
    label: string;
    /** Event to dispatch on click */
    event?: string;
    navigatesTo?: string;
    /** Action placement - accepts all common placement values */
    placement?: "row" | "bulk" | "card" | "footer" | string;
    action?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
    /** Click handler from generated code */
    onClick?: (row: unknown) => void;
}
/**
 * Field definition - can be a simple string or object with key/header
 */
export type FieldDef = string | {
    key: string;
    header?: string;
};
export interface ListProps extends EntityDisplayProps {
    /** Entity type name for display */
    entityType?: string;
    selectable?: boolean;
    /** Item actions - schema-driven or function-based */
    itemActions?: ((item: ListItem) => MenuItem[]) | readonly SchemaItemAction[];
    showDividers?: boolean;
    variant?: "default" | "card";
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number) => React.ReactNode;
    children?: React.ReactNode;
    /** Fields to display - accepts string[] or {key, header}[] for unified interface */
    fields?: readonly FieldDef[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
}
export declare const List: React.FC<ListProps>;
