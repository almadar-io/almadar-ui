/**
 * Divider Atom Component
 *
 * A divider component for separating content sections.
 */
import React from "react";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";
export interface DividerProps {
    /**
     * Orientation of the divider
     * @default 'horizontal'
     */
    orientation?: DividerOrientation;
    /**
     * Text label to display in the divider
     */
    label?: string;
    /**
     * Line style variant
     * @default 'solid'
     */
    variant?: DividerVariant;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const Divider: React.FC<DividerProps>;
