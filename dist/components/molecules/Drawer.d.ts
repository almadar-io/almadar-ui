/**
 * Drawer Molecule Component
 *
 * A slide-in drawer component for displaying secondary content.
 * Used by the UI Slot system for render_ui effects targeting the drawer slot.
 *
 * Features:
 * - Left/right positioning
 * - Configurable width
 * - Overlay backdrop
 * - Click-outside to dismiss
 * - Slide animation
 * - Escape key to close
 *
 * @packageDocumentation
 */
import React from "react";
export type DrawerPosition = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
export interface DrawerProps {
    /** Whether the drawer is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when drawer should close (injected by slot wrapper) */
    onClose?: () => void;
    /** Drawer title */
    title?: string;
    /** Drawer content (can be empty if using slot content) */
    children?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Position (left or right) */
    position?: DrawerPosition;
    /** Width (CSS value or preset size) */
    width?: string | DrawerSize;
    /** Show close button */
    showCloseButton?: boolean;
    /** Close on overlay click */
    closeOnOverlayClick?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Additional class name */
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when drawer should close */
    closeEvent?: string;
}
export declare const Drawer: React.FC<DrawerProps>;
