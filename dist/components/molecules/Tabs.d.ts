/**
 * Tabs Molecule Component
 *
 * A tabbed interface component with keyboard navigation and badge support.
 * Uses theme-aware CSS variables for styling.
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';
export interface TabItem {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab content - optional for event-driven tabs */
    content?: React.ReactNode;
    /** Tab icon */
    icon?: LucideIcon;
    /** Tab badge */
    badge?: string | number;
    /** Disable tab */
    disabled?: boolean;
    /** Event to emit when tab is clicked (for trait state machine integration) */
    event?: string;
    /** Whether this tab is currently active (for controlled tabs) */
    active?: boolean;
}
export interface TabsProps {
    /** Tab items */
    items?: TabItem[];
    /** Tab items (alias for items - used by generated code) */
    tabs?: TabItem[];
    /** Default active tab ID */
    defaultActiveTab?: string;
    /** Controlled active tab ID */
    activeTab?: string;
    /** Callback when tab changes */
    onTabChange?: (tabId: string) => void;
    /** Tab variant */
    variant?: 'default' | 'pills' | 'underline';
    /** Tab orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Additional CSS classes */
    className?: string;
}
export declare const Tabs: React.FC<TabsProps>;
