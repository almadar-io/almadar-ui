/**
 * DashboardGrid Component
 *
 * Multi-column grid for widgets and stats cards.
 * Supports cell spanning for flexible dashboard layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
export interface DashboardGridCell {
    /** Unique cell ID */
    id: string;
    /** Content to render in the cell */
    content: React.ReactNode;
    /** Number of columns this cell spans (1-4) */
    colSpan?: 1 | 2 | 3 | 4;
    /** Number of rows this cell spans (1-2) */
    rowSpan?: 1 | 2;
}
export interface DashboardGridProps {
    /** Number of columns */
    columns?: 2 | 3 | 4;
    /** Gap between cells */
    gap?: "sm" | "md" | "lg";
    /** Cell definitions */
    cells: DashboardGridCell[];
    /** Additional CSS classes */
    className?: string;
}
/**
 * DashboardGrid - Multi-column widget grid
 */
export declare const DashboardGrid: React.FC<DashboardGridProps>;
export default DashboardGrid;
