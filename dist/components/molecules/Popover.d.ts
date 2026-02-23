/**
 * Popover Molecule Component
 *
 * A popover component with position variants and click/hover triggers.
 * Uses Button, Typography, and Icon atoms.
 */
import React from "react";
export type PopoverPosition = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "click" | "hover";
export interface PopoverProps {
    /**
     * Popover content
     */
    content: React.ReactNode;
    /**
     * Popover trigger element (ReactElement or ReactNode that will be wrapped in span)
     */
    children: React.ReactNode;
    /**
     * Popover position
     * @default 'bottom'
     */
    position?: PopoverPosition;
    /**
     * Trigger type
     * @default 'click'
     */
    trigger?: PopoverTrigger;
    /**
     * Show arrow
     * @default true
     */
    showArrow?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const Popover: React.FC<PopoverProps>;
