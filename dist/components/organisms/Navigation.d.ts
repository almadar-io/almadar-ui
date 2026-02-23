/**
 * Navigation Organism Component
 *
 * A navigation component with items, active indicators, icons, and badges.
 * Uses Menu, ButtonGroup molecules and Button, Icon, Badge, Typography, Divider atoms.
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';
export interface NavigationItem {
    /**
     * Item ID
     */
    id: string;
    /**
     * Item label
     */
    label: string;
    /**
     * Item icon
     */
    icon?: LucideIcon;
    /**
     * Item badge
     */
    badge?: string | number;
    /**
     * Item href
     */
    href?: string;
    /**
     * Item click handler
     */
    onClick?: () => void;
    /**
     * Is active
     */
    isActive?: boolean;
    /**
     * Disable item
     */
    disabled?: boolean;
    /**
     * Sub-menu items
     */
    subMenu?: NavigationItem[];
}
export interface NavigationProps {
    /**
     * Navigation items
     */
    items: NavigationItem[];
    /**
     * Navigation orientation
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
export declare const Navigation: React.FC<NavigationProps>;
