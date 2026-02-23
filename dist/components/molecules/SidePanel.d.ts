/**
 * SidePanel Molecule Component
 *
 * A side panel that slides in from the right (or left) with header and content.
 * Uses Button, Typography atoms.
 */
import React from "react";
export interface SidePanelProps {
    /**
     * Panel title
     */
    title: string;
    /**
     * Panel content
     */
    children: React.ReactNode;
    /**
     * Is panel open
     */
    isOpen: boolean;
    /**
     * On close handler
     */
    onClose: () => void;
    /**
     * Panel width
     * @default 'w-96'
     */
    width?: string;
    /**
     * Panel position
     * @default 'right'
     */
    position?: "left" | "right";
    /**
     * Show overlay on mobile
     * @default true
     */
    showOverlay?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when panel should close */
    closeEvent?: string;
}
export declare const SidePanel: React.FC<SidePanelProps>;
