/**
 * Meter Organism Component
 *
 * A gauge/meter component for displaying a value within a range.
 * Supports linear, radial, and segmented display modes.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */
import React from "react";
export type MeterVariant = "linear" | "radial" | "segmented";
export interface MeterThreshold {
    value: number;
    color: string;
    label?: string;
}
export interface MeterAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
export interface MeterProps {
    /** Current value */
    value: number;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Display label */
    label?: string;
    /** Unit suffix (e.g., '%', 'MB', 'credits') */
    unit?: string;
    /** Display variant */
    variant?: MeterVariant;
    /** Color thresholds */
    thresholds?: readonly MeterThreshold[];
    /** Number of segments (for segmented variant) */
    segments?: number;
    /** Show value text */
    showValue?: boolean;
    /** Size (for radial variant) */
    size?: "sm" | "md" | "lg";
    /** Actions */
    actions?: readonly MeterAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
export declare const Meter: React.FC<MeterProps>;
