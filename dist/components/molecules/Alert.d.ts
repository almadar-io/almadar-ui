/**
 * Alert Molecule Component
 *
 * A component for displaying alert messages with different variants and actions.
 * Uses theme-aware CSS variables for styling.
 */
import React from "react";
export type AlertVariant = "info" | "success" | "warning" | "error";
export interface AlertProps {
    /** Alert content (children or message) */
    children?: React.ReactNode;
    /** Alert message (alias for children) */
    message?: string;
    variant?: AlertVariant;
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    onClose?: () => void;
    actions?: React.ReactNode;
    className?: string;
    /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when alert is dismissed */
    dismissEvent?: string;
}
export declare const Alert: React.FC<AlertProps>;
