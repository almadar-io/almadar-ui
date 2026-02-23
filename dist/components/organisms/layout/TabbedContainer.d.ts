/**
 * TabbedContainer Component
 *
 * Tabbed content areas with shared header/context.
 * Wraps the Tabs molecule with layout-specific styling.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */
import React from "react";
export interface TabDefinition {
    /** Tab identifier */
    id: string;
    /** Tab label */
    label: string;
    /** Tab content (optional if using sectionId) */
    content?: React.ReactNode;
    /** Section ID to render (alternative to content) */
    sectionId?: string;
    /** Optional badge/count */
    badge?: string | number;
    /** Disable this tab */
    disabled?: boolean;
}
export interface TabbedContainerProps {
    /** Tab definitions */
    tabs: TabDefinition[];
    /** Default active tab ID */
    defaultTab?: string;
    /** Controlled active tab */
    activeTab?: string;
    /** Callback when tab changes */
    onTabChange?: (tabId: string) => void;
    /** Tab position */
    position?: "top" | "left";
    /** Additional CSS classes */
    className?: string;
}
/**
 * TabbedContainer - Tabbed content areas
 */
export declare const TabbedContainer: React.FC<TabbedContainerProps>;
export default TabbedContainer;
