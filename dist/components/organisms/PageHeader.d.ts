import React from "react";
import { LucideIcon } from "lucide-react";
export interface PageBreadcrumb {
    label: string;
    href?: string;
}
/**
 * Schema-based action definition
 */
export interface SchemaAction {
    label: string;
    /** Navigate to URL when clicked */
    navigatesTo?: string;
    /** Custom click handler */
    onClick?: () => void;
    /** Event to dispatch via event bus (for trait state machine integration) */
    event?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    icon?: LucideIcon;
    loading?: boolean;
    disabled?: boolean;
}
export interface PageHeaderProps {
    /** Page title - accepts unknown to handle generated code accessing dynamic entity data */
    title?: string | number | unknown;
    /** Optional subtitle/description */
    subtitle?: string | number | unknown;
    /** Show back button */
    showBack?: boolean;
    /** Event to emit when back is clicked (default: BACK) */
    backEvent?: string;
    /** Breadcrumbs */
    breadcrumbs?: readonly PageBreadcrumb[];
    /** Status badge */
    status?: {
        label: string;
        variant?: "default" | "success" | "warning" | "danger" | "info";
    };
    /** Actions array - first action with variant='primary' (or first action) is the main action */
    actions?: readonly Readonly<SchemaAction>[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Tabs for sub-navigation */
    tabs?: ReadonlyArray<{
        label: string;
        value: string;
        count?: number;
    }>;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    /** Custom content in the header */
    children?: React.ReactNode;
    className?: string;
}
export declare const PageHeader: React.FC<PageHeaderProps>;
