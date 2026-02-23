/**
 * Table Organism Component
 *
 * A dumb table component with header row, data rows, pagination, sorting, and search.
 * Emits events via useEventBus — never manages internal state for search, sort,
 * selection, or pagination. All state is owned by the trait state machine.
 *
 * Uses Pagination, SearchInput, ButtonGroup, Card, Menu molecules and Button, Icon, Checkbox, Typography, Badge, Divider atoms.
 */
import React from "react";
import { MenuItem } from "../molecules/Menu";
import type { EntityDisplayProps } from "./types";
export type SortDirection = "asc" | "desc";
export interface TableColumn<T = any> {
    /**
     * Column key
     */
    key: string;
    /**
     * Column header label
     */
    label: string;
    /**
     * Sortable column
     * @default false
     */
    sortable?: boolean;
    /**
     * Custom cell renderer
     */
    render?: (value: any, row: T, index: number) => React.ReactNode;
    /**
     * Column width
     */
    width?: string;
}
export interface TableProps<T = Record<string, unknown>> extends EntityDisplayProps<T> {
    /**
     * Table columns
     */
    columns: TableColumn<T>[];
    /**
     * Enable row selection
     * @default false
     */
    selectable?: boolean;
    /**
     * Enable sorting
     * @default false
     */
    sortable?: boolean;
    /**
     * Current sort column (display hint, mapped from sortBy)
     */
    sortColumn?: string;
    /**
     * Current sort direction (display hint)
     */
    sortDirection?: SortDirection;
    /**
     * Enable search/filter
     * @default false
     */
    searchable?: boolean;
    /**
     * Search placeholder
     */
    searchPlaceholder?: string;
    /**
     * Enable pagination
     * @default false
     */
    paginated?: boolean;
    /**
     * Current page (display hint)
     */
    currentPage?: number;
    /**
     * Total pages (display hint)
     */
    totalPages?: number;
    /**
     * Row actions menu items
     */
    rowActions?: (row: T) => MenuItem[];
    /**
     * Empty state message
     */
    emptyMessage?: string;
    /**
     * Loading state
     * @default false
     */
    loading?: boolean;
}
export declare const Table: {
    <T extends Record<string, any>>({ columns, entity, data, className, isLoading, error, sortBy, sortDirection: entitySortDirection, searchValue, page, pageSize, totalCount, selectedIds, selectable, sortable, sortColumn: sortColumnProp, sortDirection: sortDirectionProp, searchable, searchPlaceholder, paginated, currentPage: currentPageProp, totalPages: totalPagesProp, rowActions, emptyMessage, loading, }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
