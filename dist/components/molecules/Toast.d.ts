/**
 * Toast Molecule Component
 *
 * A toast notification component with auto-dismiss and action buttons.
 * Uses theme-aware CSS variables for styling.
 */
import React from "react";
export type ToastVariant = "success" | "error" | "info" | "warning";
export interface ToastProps {
    /** Toast variant */
    variant?: ToastVariant;
    /** Toast message */
    message: string;
    /** Toast title (optional) */
    title?: string;
    /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
    duration?: number;
    /** Show dismiss button */
    dismissible?: boolean;
    /** Callback when toast is dismissed */
    onDismiss?: () => void;
    /** Action button label */
    actionLabel?: string;
    /** Action button click handler */
    onAction?: () => void;
    /** Badge count (optional) */
    badge?: string | number;
    /** Additional CSS classes */
    className?: string;
    /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when toast is dismissed */
    dismissEvent?: string;
    /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
    actionEvent?: string;
}
export declare const Toast: React.FC<ToastProps>;
