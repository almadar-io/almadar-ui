/**
 * Modal Molecule Component
 *
 * A modal dialog component with overlay, header, content, and footer.
 * Uses theme-aware CSS variables for styling.
 */
import React from "react";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export interface ModalProps {
    /** Whether the modal is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when modal should close (injected by slot wrapper) */
    onClose?: () => void;
    title?: string;
    /** Modal content (can be empty if using slot content) */
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: ModalSize;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when modal should close */
    closeEvent?: string;
}
export declare const Modal: React.FC<ModalProps>;
