/**
 * Tooltip Molecule Component
 *
 * A tooltip component with position variants and delay options.
 * Uses theme-aware CSS variables for styling.
 */
import React from 'react';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export interface TooltipProps {
    /** Tooltip content */
    content: React.ReactNode;
    /** Tooltip trigger element (ReactElement or ReactNode that will be wrapped in span) */
    children: React.ReactNode;
    /** Tooltip position */
    position?: TooltipPosition;
    /** Show delay in milliseconds */
    delay?: number;
    /** Hide delay in milliseconds */
    hideDelay?: number;
    /** Show arrow */
    showArrow?: boolean;
    /** Additional CSS classes */
    className?: string;
}
export declare const Tooltip: React.FC<TooltipProps>;
