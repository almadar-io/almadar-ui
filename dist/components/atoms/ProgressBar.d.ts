/**
 * ProgressBar Atom Component
 *
 * A progress bar component with linear, circular, and stepped variants.
 */
import React from "react";
export type ProgressBarType = "linear" | "circular" | "stepped";
export type ProgressBarVariant = "default" | "primary" | "success" | "warning" | "danger";
export type ProgressBarColor = ProgressBarVariant;
export interface ProgressBarProps {
    /**
     * Progress value (0-100)
     */
    value: number;
    /**
     * Maximum value (for calculating percentage)
     * @default 100
     */
    max?: number;
    /**
     * Type of the progress bar (linear, circular, stepped)
     * @default 'linear'
     */
    progressType?: ProgressBarType;
    /**
     * Variant/color of the progress bar
     * @default 'primary'
     */
    variant?: ProgressBarVariant;
    /**
     * Color variant (alias for variant)
     * @default 'primary'
     */
    color?: ProgressBarColor;
    /**
     * Show percentage text
     * @default false
     */
    showPercentage?: boolean;
    /**
     * Alias for showPercentage (pattern compatibility)
     */
    showLabel?: boolean;
    /**
     * Label text
     */
    label?: string;
    /**
     * Size (for circular variant)
     * @default 'md'
     */
    size?: "sm" | "md" | "lg";
    /**
     * Number of steps (for stepped variant)
     * @default 5
     */
    steps?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const ProgressBar: React.FC<ProgressBarProps>;
