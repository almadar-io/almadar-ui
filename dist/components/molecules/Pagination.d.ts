/**
 * Pagination Molecule Component
 *
 * A pagination component with page numbers, previous/next buttons, and ellipsis.
 * Uses Button, Icon, Typography, and Input atoms.
 */
import React from "react";
export interface PaginationProps {
    /**
     * Current page (1-indexed)
     */
    currentPage: number;
    /**
     * Total number of pages
     */
    totalPages: number;
    /**
     * Callback when page changes (optional - can be a no-op if not interactive)
     */
    onPageChange?: (page: number) => void;
    /**
     * Show page size selector
     * @default false
     */
    showPageSize?: boolean;
    /**
     * Page size options
     */
    pageSizeOptions?: number[];
    /**
     * Current page size
     */
    pageSize?: number;
    /**
     * Callback when page size changes
     */
    onPageSizeChange?: (size: number) => void;
    /**
     * Show jump to page input
     * @default false
     */
    showJumpToPage?: boolean;
    /**
     * Show total count
     * @default false
     */
    showTotal?: boolean;
    /**
     * Total items count
     */
    totalItems?: number;
    /**
     * Maximum number of page buttons to show
     * @default 7
     */
    maxVisiblePages?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative page change event — emits UI:{pageChangeEvent} with { page } */
    pageChangeEvent?: string;
    /** Declarative page size change event — emits UI:{pageSizeChangeEvent} with { pageSize } */
    pageSizeChangeEvent?: string;
}
export declare const Pagination: React.FC<PaginationProps>;
