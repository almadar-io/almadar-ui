/**
 * Chart Organism Component
 *
 * A data visualization component supporting bar, line, pie, and area chart types.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export type ChartType = "bar" | "line" | "pie" | "area" | "donut";
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}
export interface ChartSeries {
    name: string;
    data: readonly ChartDataPoint[];
    color?: string;
}
export interface ChartAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface ChartProps {
    /** Chart title */
    title?: string;
    /** Chart subtitle / description */
    subtitle?: string;
    /** Chart type */
    chartType?: ChartType;
    /** Data series */
    series?: readonly ChartSeries[];
    /** Simple data (single series shorthand) */
    data?: readonly ChartDataPoint[];
    /** Chart height in px */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** Show values on chart */
    showValues?: boolean;
    /** Actions for chart interactions */
    actions?: readonly ChartAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const Chart: React.FC<ChartProps>;
