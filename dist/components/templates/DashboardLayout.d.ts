import React from "react";
import { LucideIcon } from "lucide-react";
export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
    children?: NavItem[];
}
export interface DashboardLayoutProps {
    /** App name shown in sidebar */
    appName?: string;
    /** Logo component or URL */
    logo?: React.ReactNode;
    /** Navigation items */
    navItems?: NavItem[];
    /** Current user info (optional - auto-populated from auth context if not provided) */
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    /** Header actions (notifications, etc.) */
    headerActions?: React.ReactNode;
    /** Show search in header */
    showSearch?: boolean;
    /** Custom sidebar footer */
    sidebarFooter?: React.ReactNode;
    /** Callback when user clicks sign out (optional - uses auth context signOut if not provided) */
    onSignOut?: () => void;
}
export declare const DashboardLayout: React.FC<DashboardLayoutProps>;
