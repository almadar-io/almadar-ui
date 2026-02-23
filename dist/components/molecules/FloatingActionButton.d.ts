/**
 * FloatingActionButton Molecule Component
 *
 * A floating action button that can expand into multiple actions vertically.
 * Uses Button atom.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export interface FloatingAction {
    /**
     * Action ID
     */
    id: string;
    /**
     * Action label
     */
    label: string;
    /**
     * Action icon
     */
    icon: LucideIcon;
    /**
     * Action click handler
     */
    onClick?: () => void;
    /** Event name to emit when clicked (for trait state machine integration) */
    event?: string;
    /**
     * Action variant
     */
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
}
export interface FloatingActionButtonProps {
    /**
     * Single action (if only one action, button will directly trigger onClick)
     */
    action?: {
        icon: LucideIcon;
        onClick: () => void;
        label?: string;
        variant?: "primary" | "secondary" | "success" | "danger" | "warning";
    };
    /**
     * Multiple actions (if provided, button will expand to show all actions)
     */
    actions?: FloatingAction[];
    /**
     * Icon name (simplified API for pattern compatibility)
     */
    icon?: string;
    /**
     * Click handler (simplified API for pattern compatibility)
     */
    onClick?: () => void;
    /**
     * Variant (simplified API for pattern compatibility)
     */
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
    /**
     * Button position
     * @default 'bottom-right'
     */
    position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center" | string;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const FloatingActionButton: React.FC<FloatingActionButtonProps>;
