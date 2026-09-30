/**
 * DashboardGrid Component
 *
 * Multi-column grid for widgets and stats cards.
 * Supports cell spanning for flexible dashboard layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { cn } from "../../../../lib/cn";
import { Box } from "../../atoms/Box";
import type { DisplayStateProps } from "../types";

export interface DashboardGridCell {
  /** Optional unique cell ID */
  id?: string;
  /** Content to render in the cell */
  content?: React.ReactNode;
  /** Number of columns this cell spans (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows this cell spans (1-2) */
  rowSpan?: 1 | 2;
}

export interface DashboardGridProps extends DisplayStateProps {
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap between cells */
  gap?: "sm" | "md" | "lg";
  /** Cell definitions */
  cells: DashboardGridCell[];
}

const gapStyles = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

// Viewport ladder (2 cols at sm, 3 at md, 4 at lg) plus `@max-*` overrides so
// the grid also narrows inside a narrower `@container` ancestor.
const columnStyles = {
  2: "grid-cols-1 sm:grid-cols-2 @max-sm:!grid-cols-1",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 @max-md:!grid-cols-2 @max-sm:!grid-cols-1",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 @max-lg:!grid-cols-3 @max-md:!grid-cols-2 @max-sm:!grid-cols-1",
};

// Spans follow the same ladder, so a wide cell never exceeds the live column count.
const colSpanStyles = {
  1: "col-span-1",
  2: "col-span-1 sm:col-span-2 @max-sm:!col-span-1",
  3: "col-span-1 sm:col-span-2 md:col-span-3 @max-md:!col-span-2 @max-sm:!col-span-1",
  4: "col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 @max-lg:!col-span-3 @max-md:!col-span-2 @max-sm:!col-span-1",
};

const rowSpanStyles = {
  1: "row-span-1",
  2: "row-span-2",
};

/**
 * DashboardGrid - Multi-column widget grid
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  columns = 3,
  gap = "md",
  cells,
  className,
}) => {
  return (
    <Box
      className={cn(
        "grid w-full",
        columnStyles[columns],
        gapStyles[gap],
        className,
      )}
    >
      {cells.map((cell, idx) => (
        <Box
          key={cell.id != null ? String(cell.id) : idx}
          className={cn(
            "min-w-0 rounded-container border border-border bg-card p-4",
            colSpanStyles[Math.min(cell.colSpan ?? 1, columns) as 1 | 2 | 3 | 4],
            rowSpanStyles[cell.rowSpan ?? 1],
          )}
        >
          {cell.content as React.ReactNode}
        </Box>
      ))}
    </Box>
  );
};

DashboardGrid.displayName = "DashboardGrid";

export default DashboardGrid;
