/**
 * Grid Component
 *
 * A CSS Grid wrapper with responsive column support.
 * Useful for creating multi-column layouts.
 */
import React from 'react';
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type GridJustify = 'start' | 'center' | 'end' | 'stretch';
export interface ResponsiveGridCols {
    /** Base/mobile columns */
    base?: GridCols;
    /** Small screens (640px+) */
    sm?: GridCols;
    /** Medium screens (768px+) */
    md?: GridCols;
    /** Large screens (1024px+) */
    lg?: GridCols;
    /** Extra large screens (1280px+) */
    xl?: GridCols;
}
export interface GridProps {
    /** Number of columns (can be responsive object) */
    cols?: GridCols | ResponsiveGridCols;
    /** Number of rows */
    rows?: number;
    /** Gap between items */
    gap?: GridGap;
    /** Row gap (overrides gap for rows) */
    rowGap?: GridGap;
    /** Column gap (overrides gap for columns) */
    colGap?: GridGap;
    /** Align items on block axis */
    alignItems?: GridAlign;
    /** Justify items on inline axis */
    justifyItems?: GridJustify;
    /** Auto-flow direction */
    flow?: 'row' | 'col' | 'row-dense' | 'col-dense';
    /** Custom class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Children elements */
    children: React.ReactNode;
    /** HTML element to render as */
    as?: React.ElementType;
}
/**
 * Grid - CSS Grid layout wrapper
 */
export declare const Grid: React.FC<GridProps>;
export default Grid;
