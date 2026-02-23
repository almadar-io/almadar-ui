/**
 * Menu Molecule Component
 *
 * A dropdown menu component with items, icons, dividers, and sub-menus.
 * Uses theme-aware CSS variables for styling.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export interface MenuItem {
    /** Item ID (auto-generated from label if not provided) */
    id?: string;
    /** Item label */
    label: string;
    /** Item icon (LucideIcon or string name) */
    icon?: LucideIcon | string;
    /** Item badge */
    badge?: string | number;
    /** Disable item */
    disabled?: boolean;
    /** Item click handler */
    onClick?: () => void;
    /** Event name for pattern compatibility */
    event?: string;
    /** Variant for styling (pattern compatibility) */
    variant?: "default" | "danger";
    /** Sub-menu items */
    subMenu?: MenuItem[];
}
export type MenuPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
export interface MenuProps {
    /** Menu trigger element */
    trigger: React.ReactNode;
    /** Menu items */
    items: MenuItem[];
    /** Menu position */
    position?: MenuPosition;
    /** Additional CSS classes */
    className?: string;
}
export declare const Menu: React.FC<MenuProps>;
