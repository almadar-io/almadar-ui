/**
 * ConfirmDialog Component
 *
 * Confirmation dialog for destructive or important actions.
 * Composes Modal molecule with Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
import { type ModalSize } from "../molecules/Modal";
export type ConfirmDialogVariant = "danger" | "warning" | "info" | "default";
export interface ConfirmDialogProps {
    /** Whether the dialog is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when dialog is closed (injected by slot wrapper) */
    onClose?: () => void;
    /** Callback when action is confirmed (injected by slot wrapper) */
    onConfirm?: () => void;
    /** Dialog title */
    title: string;
    /** Dialog message/description */
    message?: string | React.ReactNode;
    /** Alias for message (schema compatibility) */
    description?: string | React.ReactNode;
    /** Confirm button text */
    confirmText?: string;
    /** Alias for confirmText (schema compatibility) */
    confirmLabel?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Alias for cancelText (schema compatibility) */
    cancelLabel?: string;
    /** Dialog variant */
    variant?: ConfirmDialogVariant;
    /** Dialog size */
    size?: ModalSize;
    /** Loading state for confirm button */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Additional CSS classes */
    className?: string;
}
/**
 * ConfirmDialog - Confirmation dialog for important actions
 */
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
export default ConfirmDialog;
