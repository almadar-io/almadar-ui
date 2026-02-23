/**
 * SimpleGrid Component
 *
 * A simplified grid that automatically adjusts columns based on available space.
 * Perfect for card layouts and item collections.
 */
import React from 'react';
export type SimpleGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export interface SimpleGridProps {
    /** Minimum width of each child (e.g., 200, "200px", "15rem") */
    minChildWidth?: number | string;
    /** Maximum number of columns */
    maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Exact number of columns (disables auto-fit) */
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Gap between items */
    gap?: SimpleGridGap;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React.ReactNode;
}
/**
 * SimpleGrid - Auto-responsive grid layout
 */
export declare const SimpleGrid: React.FC<SimpleGridProps>;
export default SimpleGrid;
