/**
 * Header Organism Component
 *
 * A header component for mobile/responsive layouts with menu toggle, brand, and user avatar.
 * Styled to match the main Layout component's mobile header.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
export interface HeaderProps {
    /**
     * Logo/Brand content
     */
    logo?: React.ReactNode;
    /**
     * Logo image source
     */
    logoSrc?: string;
    /**
     * Brand/App name
     */
    brandName?: string;
    /**
     * Navigation items (for desktop header variant)
     */
    navigationItems?: Array<{
        label: string;
        href?: string;
        onClick?: () => void;
        icon?: LucideIcon;
        badge?: string | number;
        active?: boolean;
    }>;
    /**
     * Show menu toggle button
     * @default true
     */
    showMenuToggle?: boolean;
    /**
     * Is menu open (for toggle icon)
     */
    isMenuOpen?: boolean;
    /**
     * Menu toggle callback
     */
    onMenuToggle?: () => void;
    /**
     * Show search input
     * @default false
     */
    showSearch?: boolean;
    /**
     * Search placeholder
     */
    searchPlaceholder?: string;
    /**
     * Search callback
     */
    onSearch?: (value: string) => void;
    /**
     * User avatar configuration
     */
    userAvatar?: {
        src?: string;
        alt?: string;
        initials?: string;
    };
    /**
     * User name (display name or email)
     */
    userName?: string;
    /**
     * Callback when user avatar is clicked
     */
    onUserClick?: () => void;
    /**
     * Action buttons (right side)
     */
    actions?: React.ReactNode;
    /**
     * Sticky header
     * @default true
     */
    sticky?: boolean;
    /**
     * Variant - mobile shows menu toggle, desktop shows full nav
     * @default 'mobile'
     */
    variant?: "mobile" | "desktop";
    /**
     * Callback when logo/brand is clicked
     */
    onLogoClick?: () => void;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Loading state indicator (closed circuit)
     */
    isLoading?: boolean;
    /**
     * Error state (closed circuit)
     */
    error?: Error | null;
    /**
     * Entity name for schema-driven auto-fetch (closed circuit)
     */
    entity?: string;
}
export declare const Header: React.FC<HeaderProps>;
