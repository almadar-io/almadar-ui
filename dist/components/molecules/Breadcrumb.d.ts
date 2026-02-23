/**
 * Breadcrumb Molecule Component
 *
 * A breadcrumb navigation component with separators and icons.
 * Uses Button, Icon, and Typography atoms.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export interface BreadcrumbItem {
    /**
     * Item label
     */
    label: string;
    /**
     * Item href (if provided, renders as link)
     */
    href?: string;
    /**
     * Item path (alias for href, for schema compatibility)
     */
    path?: string;
    /**
     * Item icon
     */
    icon?: LucideIcon;
    /**
     * Click handler (if href not provided)
     */
    onClick?: () => void;
    /**
     * Is current page
     */
    isCurrent?: boolean;
    /** Event name to emit when clicked (for trait state machine integration) */
    event?: string;
}
export interface BreadcrumbProps {
    /**
     * Breadcrumb items
     */
    items: BreadcrumbItem[];
    /**
     * Separator icon
     */
    separator?: LucideIcon;
    /**
     * Maximum items to show (truncates with ellipsis)
     */
    maxItems?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}
export declare const Breadcrumb: React.FC<BreadcrumbProps>;
