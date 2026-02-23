import React from "react";
import { LucideIcon } from "lucide-react";
import { EntityDisplayProps } from "./types";
export interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
}
export interface RowAction<T> {
    label: string;
    icon?: LucideIcon;
    onClick: (row: T) => void;
    variant?: "default" | "danger";
    show?: (row: T) => boolean;
    event?: string;
}
export interface DataTableProps<T extends {
    id: string | number;
}> extends EntityDisplayProps<T> {
    /** Fields to display - accepts string[] or Column[] for unified interface. Alias for columns */
    fields?: readonly Column<T>[] | readonly string[];
    /** Columns can be Column objects or simple string field names */
    columns?: readonly Column<T>[] | readonly string[];
    /** Item actions from generated code - maps to rowActions */
    itemActions?: readonly {
        label: string;
        event?: string;
        navigatesTo?: string;
        action?: string;
        placement?: "row" | "bulk" | string;
        icon?: LucideIcon;
        variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | string;
        onClick?: (row: T) => void;
    }[];
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: {
        label: string;
        event?: string;
    };
    selectable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    rowActions?: readonly RowAction<T>[];
    bulkActions?: ReadonlyArray<{
        label: string;
        icon?: LucideIcon;
        onClick: (selectedRows: T[]) => void;
        variant?: "default" | "danger";
    }>;
    headerActions?: React.ReactNode;
    /** Show total count in pagination */
    showTotal?: boolean;
}
export declare function DataTable<T extends {
    id: string | number;
}>({ fields, columns, data, entity, itemActions, isLoading, error, emptyIcon, emptyTitle, emptyDescription, emptyAction, selectable, selectedIds, sortBy, sortDirection, searchable, searchValue, searchPlaceholder, page, pageSize, totalCount, rowActions: externalRowActions, bulkActions, headerActions, showTotal, className, }: DataTableProps<T>): import("react/jsx-runtime").JSX.Element;
export declare namespace DataTable {
    var displayName: string;
}
