import React from "react";
import { LucideIcon } from "lucide-react";
/**
 * Schema metric definition
 * Supports both computed metrics (with field) and static metrics (with value)
 */
export interface MetricDefinition {
    /** Field name for computed metrics (optional if value is provided) */
    field?: string;
    /** Display label */
    label: string;
    /** Static value for display (alternative to field-based computation) */
    value?: string | number;
    /** Icon name for display */
    icon?: string;
    /** Value format (e.g., 'currency', 'percent', 'number') */
    format?: "currency" | "percent" | "number" | string;
}
export interface StatCardProps {
    /** Main label */
    label?: string;
    /** Title (alias for label) */
    title?: string;
    /** Primary value - accepts array/unknown from generated code (will use first element or length) */
    value?: string | number | (string | number | undefined)[] | unknown;
    /** Previous value for comparison */
    previousValue?: number;
    /** Current value as number for trend calculation */
    currentValue?: number;
    /** Manual trend percentage (overrides calculation) */
    trend?: number;
    /** Trend direction (overrides calculation) */
    trendDirection?: "up" | "down" | "neutral";
    /** Whether up is good (green) or bad (red) */
    invertTrend?: boolean;
    /** Icon to display */
    icon?: LucideIcon;
    /** Icon background color */
    iconBg?: string;
    /** Icon color */
    iconColor?: string;
    /** Subtitle or description */
    subtitle?: string;
    /** Action button */
    action?: {
        label: string;
        /** Event to dispatch via event bus (for trait state machine integration) */
        event?: string;
        /** Navigation URL - supports template interpolation */
        navigatesTo?: string;
        /** Legacy onClick callback */
        onClick?: () => void;
    };
    className?: string;
    /** Entity name for schema-driven stats */
    entity?: string;
    /** Metrics to display (schema format) - accepts readonly for compatibility with generated const arrays */
    metrics?: readonly MetricDefinition[];
    /** Data to calculate stats from - accepts readonly for compatibility with generated const arrays */
    data?: readonly Record<string, unknown>[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
}
export declare const StatCard: React.FC<StatCardProps>;
