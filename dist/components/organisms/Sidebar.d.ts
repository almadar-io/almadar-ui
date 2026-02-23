/**
 * Sidebar Organism Component
 *
 * A sidebar component with logo, navigation items, user section, and collapse/expand.
 * Styled to match the main Layout component with theme-aware CSS variables.
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';
export interface SidebarItem {
    /** Item ID */
    id: string;
    /** Item label */
    label: string;
    /** Item icon */
    icon?: LucideIcon;
    /** Item badge */
    badge?: string | number;
    /** Item href */
    href?: string;
    /** Item click handler */
    onClick?: () => void;
    /** Is active */
    active?: boolean;
    /** @deprecated Use `active` instead */
    isActive?: boolean;
    /** Sub-items (for nested navigation) */
    subItems?: SidebarItem[];
}
export interface SidebarProps {
    /** Logo/Brand content - can be a ReactNode or logo config */
    logo?: React.ReactNode;
    /** Logo image source */
    logoSrc?: string;
    /** Brand/App name */
    brandName?: string;
    /** Navigation items */
    items: SidebarItem[];
    /** User section content */
    userSection?: React.ReactNode;
    /** Footer content (e.g., theme toggle) */
    footerContent?: React.ReactNode;
    /** Collapsed state (controlled) */
    collapsed?: boolean;
    /** Default collapsed state */
    defaultCollapsed?: boolean;
    /** Callback when collapse state changes */
    onCollapseChange?: (collapsed: boolean) => void;
    /** Hide the collapse/expand button */
    hideCollapseButton?: boolean;
    /** Show a close button (for mobile) */
    showCloseButton?: boolean;
    /** Callback when close button is clicked */
    onClose?: () => void;
    /** Callback when logo/brand is clicked */
    onLogoClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
export declare const Sidebar: React.FC<SidebarProps>;
