/**
 * DashboardGrid Component
 *
 * Multi-column grid for widgets and stats cards.
 * Supports cell spanning for flexible dashboard layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { cn } from "../../../lib/cn";
import { Box } from "../../atoms/Box";
import { useTranslate } from "../../../hooks/useTranslate";
import type { EntityDisplayProps } from "../types";

export interface DashboardGridCell {
  /** Optional unique cell ID */
  id?: string;
  /** Content to render in the cell */
  content?: React.ReactNode;
  /** Number of columns this cell spans (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows this cell spans (1-2) */
  rowSpan?: 1 | 2;
  /** Allow additional schema-driven properties */
  [key: string]: unknown;
}

export interface DashboardGridProps extends EntityDisplayProps {
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

const columnStyles = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const colSpanStyles = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
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
  const { t: _t } = useTranslate();

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
            "border-2 border-border bg-card",
            colSpanStyles[cell.colSpan ?? 1],
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
